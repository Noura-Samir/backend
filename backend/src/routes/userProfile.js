const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  getUserProfile,
  addAddress,
  updateAddress,
  removeAddress,
  addPaymentMethod,
  removePaymentMethod,
  getAllAddresses,
  getAddressById,
  getAllPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
} = require("../controllers/userProfile.controller");

// Get complete user profile
router.get("/me", verifyToken, getUserProfile);

// Address management
router.get("/me/addresses", verifyToken, getAllAddresses);
router.get("/me/addresses/:id", verifyToken, getAddressById);
router.post("/me/addresses", verifyToken, addAddress);
router.put("/me/addresses/:id", verifyToken, updateAddress);
router.delete("/me/addresses/:id", verifyToken, removeAddress);

// Payment method management
router.get("/me/payment-methods", verifyToken, getAllPaymentMethods);
router.get("/me/payment-methods/:id", verifyToken, getPaymentMethodById);
router.post("/me/payment-methods", verifyToken, addPaymentMethod);
router.put("/me/payment-methods/:id", verifyToken, updatePaymentMethod);
router.delete("/me/payment-methods/:id", verifyToken, removePaymentMethod);

module.exports = router;
