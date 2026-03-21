const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { getOrCreateProfile, getPincode, saveProfile } = require("../db/store");
const { normalizeIndianMobileNumber } = require("../lib/validation");
const { profileReadLimiter, profileWriteLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.get("/profile", verifyToken, profileReadLimiter, async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user);
    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
});

router.post("/profile", verifyToken, profileWriteLimiter, async (req, res, next) => {
  try {
    const fullName = typeof req.body?.full_name === "string" ? req.body.full_name.trim() : undefined;
    const deliveryAddress =
      typeof req.body?.delivery_address === "string" ? req.body.delivery_address.trim() : undefined;
    const pincode = typeof req.body?.pincode === "string" ? req.body.pincode.trim() : undefined;
    const deliveryPhoneRaw =
      typeof req.body?.delivery_phone === "string" ? req.body.delivery_phone.trim() : undefined;
    const normalizedDeliveryPhone =
      deliveryPhoneRaw === undefined ? undefined : normalizeIndianMobileNumber(deliveryPhoneRaw);

    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: "Pincode must be a 6-digit string." });
    }

    if (deliveryPhoneRaw !== undefined && deliveryPhoneRaw && !normalizedDeliveryPhone) {
      return res.status(400).json({
        error: "Delivery mobile number must be a valid 10-digit Indian number or include the +91 country code."
      });
    }

    if (pincode) {
      const pincodeData = await getPincode(pincode);

      if (!pincodeData?.is_active) {
        return res.status(400).json({ error: "This pincode is not serviceable yet." });
      }
    }

    const profile = await saveProfile(req.user, {
      full_name: fullName,
      delivery_address: deliveryAddress,
      delivery_phone: normalizedDeliveryPhone,
      pincode
    });

    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
