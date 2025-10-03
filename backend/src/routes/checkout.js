const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { createOrder, getUserOrders } = require('../controllers/checkout.controller');

// Create new order from cart
router.post('/', verifyToken, createOrder);

// Get all orders for logged-in user
router.get('/', verifyToken, getUserOrders);

module.exports = router; 
