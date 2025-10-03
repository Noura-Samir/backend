const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

router.post('/register', authController.register);
router.post('/login', authController.login);

// ترقية مستخدم إلى أدمن عبر كود سري
router.post('/upgrade-to-admin', verifyToken, async (req, res) => {
  const { pin } = req.body;
  const ADMIN_PIN = process.env.ADMIN_PIN || '123456'; // غيّر الكود كما تريد في env
  if (pin !== ADMIN_PIN) {
    return res.status(403).json({ message: 'Invalid admin PIN' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isAdmin = true;
    await user.save();
    res.json({ message: 'User upgraded to admin successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

/*****************************/
