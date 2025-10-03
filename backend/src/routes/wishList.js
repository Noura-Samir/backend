const express = require('express');
const router = express.Router();
const Wishlist = require('../models/wishList');

// Middleware to log all wishlist requests
router.use((req, res, next) => {
  console.log('Wishlist route accessed:', req.method, req.url);
  next();
});

router.post('/', async (req, res , next) => {
  const { userId, productId } = req.body;
  try {
    const exists = await Wishlist.findOne({ userId, productId });
    if (exists) return res.status(400).json({ message: 'Already in wishlist' });

    const item = new Wishlist({ userId, productId });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    next(err);
}
});

router.get('/:userId', async (req, res , next) => {
  try {
    console.log('Fetching wishlist for user:', req.params.userId);
    console.log('User ID type:', typeof req.params.userId);
    console.log('User ID value:', req.params.userId);
    
    if (!req.params.userId || req.params.userId === 'wishlist') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const items = await Wishlist.find({ userId: req.params.userId })
      .populate('productId')
      .sort({ createdAt: -1 })
      .exec();
    
    console.log('Wishlist items:', items);
    res.json(items);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    next(err);
  }
});

router.delete('/', async (req, res , next) => {
  const { userId, productId } = req.body;
  try {
    console.log('Removing from wishlist:', { userId, productId });
    const result = await Wishlist.findOneAndDelete({ userId, productId });
    console.log('Delete result:', result);
    res.json({ message: 'Removed', deletedItem: result });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    next(err);
  }
});

module.exports = router;