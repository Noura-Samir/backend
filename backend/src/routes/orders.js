const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const {
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  updateOrderStatus,
  createOrder,
} = require("../controllers/order.controller");

// User order history
router.get("/", verifyToken, getUserOrders);
router.get("/:id", verifyToken, getOrderDetails);
router.post("/:id/cancel", verifyToken, cancelOrder);

// Admin-only order status update (for future use)
router.put("/:id/status", verifyToken, verifyAdmin, updateOrderStatus);

// Create new order
router.post("/", verifyToken, createOrder);

module.exports = router;
