const { auth } = require("../db/firebaseAdmin");

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token." });
  }

  try {
    const token = header.slice(7);
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || "",
      phone: decodedToken.phone_number || "",
      avatar_url: decodedToken.picture || "",
      provider: decodedToken.firebase?.sign_in_provider || "firebase"
    };
    req.firebaseToken = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = verifyToken;
