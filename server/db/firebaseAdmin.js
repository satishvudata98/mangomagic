const admin = require("firebase-admin");

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getPrivateKey() {
  return requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: requireEnv("FIREBASE_PROJECT_ID"),
      clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: getPrivateKey()
    })
  });
}

const auth = admin.auth();

module.exports = {
  admin,
  auth
};
