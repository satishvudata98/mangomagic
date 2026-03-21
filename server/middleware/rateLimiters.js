const rateLimit = require("express-rate-limit");
const ipKeyGenerator = rateLimit.ipKeyGenerator || ((ipAddress) => ipAddress);

function createLimiter({ windowMs, max, message, prefix }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS",
    keyGenerator: (req) =>
      req.user?.id
        ? `${prefix}:user:${req.user.id}`
        : `${prefix}:ip:${ipKeyGenerator(req.ip)}`,
    handler: (req, res) => {
      res.status(429).json({ error: message });
    }
  });
}

const profileReadLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 60,
  prefix: "profile-read",
  message: "Too many profile requests. Please try again in a few minutes."
});

const profileWriteLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 12,
  prefix: "profile-write",
  message: "Too many delivery profile updates. Please wait a bit and try again."
});

const cartReadLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 180,
  prefix: "cart-read",
  message: "Too many cart sync requests. Please try again shortly."
});

const cartWriteLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 180,
  prefix: "cart-write",
  message: "Too many cart updates. Please slow down and try again in a moment."
});

const paymentCreateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  prefix: "payment-create",
  message: "Too many checkout attempts. Please wait a bit before creating another payment order."
});

const paymentVerifyLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  prefix: "payment-verify",
  message: "Too many payment verification attempts. Please try again shortly."
});

const pincodeCheckLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 120,
  prefix: "pincode-check",
  message: "Too many delivery checks. Please slow down and try again in a few minutes."
});

module.exports = {
  cartReadLimiter,
  cartWriteLimiter,
  paymentCreateLimiter,
  paymentVerifyLimiter,
  pincodeCheckLimiter,
  profileReadLimiter,
  profileWriteLimiter
};
