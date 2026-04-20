const crypto = require("crypto");
const express = require("express");
const Razorpay = require("razorpay");
const verifyToken = require("../middleware/verifyToken");
const { normalizeIndianMobileNumber } = require("../lib/validation");
const { paymentCreateLimiter, paymentVerifyLimiter } = require("../middleware/rateLimiters");
const {
  createOrder,
  getOrderByRazorpayOrderId,
  getPincode,
  getProductsByIds,
  updateOrderByRazorpayOrderId
} = require("../db/store");

const router = express.Router();
const MIN_WEIGHT_KG = 1;
const MAX_WEIGHT_KG = 25;

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const razorpayKeyId = requireEnv("RAZORPAY_KEY_ID");
const razorpayKeySecret = requireEnv("RAZORPAY_KEY_SECRET");

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

function getPricePerKg(product) {
  return Math.round(Number(product.price_5kg || 0) / 5);
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "At least one cart item is required.";
  }

  for (const item of items) {
    if (!item || typeof item !== "object") {
      return "Each item must be an object.";
    }

    if (typeof item.product_id !== "string" || !item.product_id.trim()) {
      return "Each item requires a product_id.";
    }

    if (
      !Number.isInteger(Number(item.weight_kg)) ||
      Number(item.weight_kg) < MIN_WEIGHT_KG ||
      Number(item.weight_kg) > MAX_WEIGHT_KG
    ) {
      return `Each item must use between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.`;
    }
  }

  return null;
}

async function getProductMap(productIds) {
  return getProductsByIds(productIds);
}

async function calculateOrder(items) {
  const productIds = [...new Set(items.map((item) => item.product_id))];
  const productMap = await getProductMap(productIds);
  const lineItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = productMap.get(item.product_id);

    if (!product || !product.available) {
      throw new Error("One or more selected mangoes are unavailable.");
    }

    const weight = Number(item.weight_kg);
    const unitPrice = getPricePerKg(product);
    const subtotal = unitPrice * weight;

    totalAmount += subtotal;
    lineItems.push({
      product_id: product.id,
      product_name: product.name,
      weight_kg: weight,
      unit_price: unitPrice,
      subtotal
    });
  }

  return { lineItems, totalAmount };
}

router.post("/payment/create-order", verifyToken, paymentCreateLimiter, async (req, res, next) => {
  try {
    const validationError = validateItems(req.body?.items);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { totalAmount } = await calculateOrder(req.body.items);
    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        user_id: req.user.id
      }
    });

    return res.json({
      razorpay_order_id: order.id,
      amount: order.amount,
      key_id: razorpayKeyId
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/payment/verify", verifyToken, paymentVerifyLimiter, async (req, res, next) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      delivery_address: deliveryAddress,
      delivery_phone: deliveryPhoneRaw,
      pincode,
      items
    } = req.body || {};

    const validationError = validateItems(items);
    const normalizedDeliveryPhone = normalizeIndianMobileNumber(deliveryPhoneRaw);

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim() ||
      !normalizedDeliveryPhone ||
      !/^\d{6}$/.test(String(pincode || ""))
    ) {
      return res.status(400).json({ error: validationError || "Invalid payment verification payload." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: "Invalid Razorpay signature." });
    }

    const pincodeData = await getPincode(pincode);

    if (!pincodeData?.is_active) {
      return res.status(400).json({ error: "Delivery pincode is not serviceable." });
    }

    const existingOrder = await getOrderByRazorpayOrderId(razorpayOrderId);

    if (existingOrder) {
      return res.json({ order_id: existingOrder.id });
    }

    const { lineItems, totalAmount } = await calculateOrder(items);
    const order = await createOrder({
      id: crypto.randomUUID(),
      user_id: req.user.id,
      user_phone: req.user.phone || normalizedDeliveryPhone,
      user_email: req.user.email || "",
      user_name: req.user.name || "",
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      status: "paid",
      total_amount: totalAmount,
      delivery_address: deliveryAddress.trim(),
      delivery_phone: normalizedDeliveryPhone,
      pincode,
      order_items: lineItems
    });

    return res.json({ order_id: order.id });
  } catch (error) {
    return next(error);
  }
});

router.post("/payment/webhook", async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!secret) {
      return res.status(503).json({ error: "Razorpay webhook secret is not configured." });
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    if (!signature || expectedSignature !== signature) {
      return res.status(400).json({ error: "Invalid webhook signature." });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));
    const paymentEntity = payload?.payload?.payment?.entity;

    if (payload?.event === "payment.captured" && paymentEntity?.order_id) {
      const order = await getOrderByRazorpayOrderId(paymentEntity.order_id);

      if (order) {
        await updateOrderByRazorpayOrderId(paymentEntity.order_id, {
          status: "paid",
          razorpay_payment_id: paymentEntity.id
        });
      }
    }

    return res.json({ received: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
