const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const cartController = require("../controllers/cart.Controller");

// Cart routes (temporarily without auth for testing)
router.post("/", auth.verifyToken, cartController.addToCart);
router.get("/", auth.verifyToken, cartController.getCart);
router.put("/:productId", auth.verifyToken, cartController.updateCartItem);
router.delete("/:productId", auth.verifyToken, cartController.removeFromCart);
router.delete("/", auth.verifyToken, cartController.clearCart);

module.exports = router;
