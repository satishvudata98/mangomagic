const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { listSavedCartForUser, saveSavedCart } = require("../db/store");
const { cartReadLimiter, cartWriteLimiter } = require("../middleware/rateLimiters");

const router = express.Router();
const MIN_WEIGHT_KG = 1;
const MAX_WEIGHT_KG = 25;

function validateCartItems(items) {
  if (!Array.isArray(items)) {
    return "Cart items must be an array.";
  }

  for (const item of items) {
    if (!item || typeof item !== "object") {
      return "Each cart item must be an object.";
    }

    if (typeof item.product_id !== "string" || !item.product_id.trim()) {
      return "Each cart item requires a product_id.";
    }

    const weightKg = Number(item.weight_kg);

    if (!Number.isInteger(weightKg) || weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
      return `Each cart item must use between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.`;
    }
  }

  return null;
}

router.get("/cart", verifyToken, cartReadLimiter, async (req, res, next) => {
  try {
    const items = await listSavedCartForUser(req.user.id);
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
});

router.put("/cart", verifyToken, cartWriteLimiter, async (req, res, next) => {
  try {
    const validationError = validateCartItems(req.body?.items);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    await saveSavedCart(req.user, req.body.items);
    const items = await listSavedCartForUser(req.user.id);
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
