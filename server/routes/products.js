const express = require("express");
const { getPincode, listActivePincodes, listAvailableProducts } = require("../db/store");
const { pincodeCheckLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.get("/products", async (req, res, next) => {
  try {
    const products = await listAvailableProducts();
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
});

router.get("/pincodes", async (req, res, next) => {
  try {
    const pincodes = await listActivePincodes();
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    return res.json({ pincodes });
  } catch (error) {
    return next(error);
  }
});

router.get("/pincodes/check/:pin", pincodeCheckLimiter, async (req, res, next) => {
  try {
    const pin = String(req.params.pin || "").trim();

    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({ error: "Pincode must be a 6-digit number." });
    }

    const data = await getPincode(pin);

    return res.json({
      serviceable: Boolean(data?.is_active),
      area_name: data?.area_name || null,
      city: data?.city || null
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
