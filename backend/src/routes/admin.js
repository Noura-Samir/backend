const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Products Endpoints
router.get('/products', verifyToken, verifyAdmin, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.post('/products', verifyToken, verifyAdmin, async (req, res) => {
  console.log('POST /admin/products', req.body);
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});

router.put('/products/:id', verifyToken, verifyAdmin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

router.delete('/products/:id', verifyToken, verifyAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

// Orders Endpoints
router.get('/orders', verifyToken, verifyAdmin, async (req, res) => {
  const orders = await Order.find().populate('user', 'username email');
  res.json(orders);
});

router.put('/orders/:id/confirm', verifyToken, verifyAdmin, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: 'confirmed' }, { new: true });
  res.json(order);
});

router.put('/orders/:id/cancel', verifyToken, verifyAdmin, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
  res.json(order);
});

module.exports = router; 