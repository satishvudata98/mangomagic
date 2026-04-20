const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const { createProxyMiddleware } = require("http-proxy-middleware");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");

const app = express();
const port = Number(process.env.PORT || 10000);
const nextAppUrl = process.env.NEXT_INTERNAL_URL || "http://127.0.0.1:3000";
const deploymentProfile = process.env.DEPLOYMENT_PROFILE || "default";
const allowInsecurePublicOrigin =
  process.env.ALLOW_INSECURE_PUBLIC_ORIGIN === "1" || deploymentProfile === "ec2-ip-test";

app.set("trust proxy", 1);

function normalizeConfiguredOrigins(value) {
  return String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function validateProductionConfig() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const configuredOrigins = normalizeConfiguredOrigins(process.env.FRONTEND_URL);

  if (configuredOrigins.length === 0) {
    throw new Error("Missing required environment variable: FRONTEND_URL");
  }

  for (const origin of configuredOrigins) {
    const url = new URL(origin);
    const isLocalAddress = ["localhost", "127.0.0.1"].includes(url.hostname);

    if (url.protocol !== "https:" && !isLocalAddress && !allowInsecurePublicOrigin) {
      throw new Error("FRONTEND_URL must use https in production.");
    }
  }
}

async function isNextAppReachable() {
  try {
    const response = await fetch(nextAppUrl, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(2000)
    });

    return response.status < 500;
  } catch (error) {
    return false;
  }
}

validateProductionConfig();

const configuredOrigins = new Set(normalizeConfiguredOrigins(process.env.FRONTEND_URL));

function getRequestOrigin(req) {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  return `${protocol}://${req.get("host")}`;
}

app.use(
  "/api/payment/webhook",
  express.raw({
    type: "application/json"
  })
);

app.use(
  cors((req, callback) => {
    const requestOrigin = getRequestOrigin(req);

    return callback(null, {
      origin(origin, originCallback) {
        if (!origin) {
          return originCallback(null, true);
        }

        if (process.env.NODE_ENV !== "production") {
          return originCallback(null, true);
        }

        if (configuredOrigins.has(origin)) {
          return originCallback(null, true);
        }

        if (origin === requestOrigin) {
          return originCallback(null, true);
        }

        return originCallback(new Error("CORS not allowed for this origin."));
      },
      credentials: true
    });
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (req, res) => {
  if (req.query.full === "1") {
    const webHealthy = await isNextAppReachable();

    if (!webHealthy) {
      return res.status(503).json({ status: "degraded", api: "ok", web: "unreachable" });
    }

    return res.json({ status: "ok", api: "ok", web: "ok" });
  }

  return res.json({ status: "ok", api: "ok" });
});

app.use("/api", authRoutes);
app.use("/api", cartRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found." });
});

app.use(
  "/",
  createProxyMiddleware({
    target: nextAppUrl,
    changeOrigin: false,
    ws: true,
    logLevel: process.env.NODE_ENV === "production" ? "warn" : "info"
  })
);

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  const message = error?.message || "Internal server error.";
  const statusCode = error?.statusCode || 500;
  return res.status(statusCode).json({ error: message });
});

app.listen(port, () => {
  console.log(`MangoMagic server listening on port ${port}`);
  console.log(`Proxying frontend traffic to ${nextAppUrl}`);

  if (allowInsecurePublicOrigin) {
    console.warn("Allowing insecure public origin for testing deployment profile.");
  }
});
