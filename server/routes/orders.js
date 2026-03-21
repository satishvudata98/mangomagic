const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { getOrderById, listOrdersForUser } = require("../db/store");

const router = express.Router();

router.use(verifyToken);

router.get("/orders", async (req, res, next) => {
  try {
    const orders = await listOrdersForUser(req.user.id);
    return res.json({ orders });
  } catch (error) {
    return next(error);
  }
});

router.get("/orders/:id", async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id);

    if (!order || order.user_id !== req.user.id) {
      return res.status(404).json({ error: "Order not found." });
    }

    return res.json({ order });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
