const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");

const app = express();
const port = Number(process.env.PORT || 10000);

app.set("trust proxy", 1);

app.use(
  "/api/payment/webhook",
  express.raw({
    type: "application/json"
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      if (origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed for this origin."));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", authRoutes);
app.use("/api", cartRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found." });
});

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
});
