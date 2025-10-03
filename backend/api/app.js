const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express(); // <- مهم قبل أي middleware

dotenv.config();

// Connect to MongoDB
const connectDB = require('../src/config/db.config');
connectDB();

// Models
require('../src/models/User');
require('../src/models/Product');
require('../src/models/Cart');
require('../src/models/Order');

// CORS
app.use(cors({
  origin: [
    "http://localhost:4200",
    "https://frontend-noura-samirs-projects.vercel.app"
  ],
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
////////////////////
app.options("*", cors({
  origin: [
    "http://localhost:4200",
    "https://frontend-noura-samirs-projects.vercel.app"
  ],
  credentials: true
}));
//////////

app.use(cors());

/////////////////////////
// Body parser
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Request body:", req.body);
  }
  next();
});

// Routes
const authRoutes = require('../src/routes/auth');
const productRoutes = require('../src/routes/products');
const cartRoutes = require('../src/routes/cart');
const checkoutRoutes = require('../src/routes/checkout');
const orderRoutes = require('../src/routes/orders');
const userProfileRoutes = require('../src/routes/userProfile');
const wishlistRoutes = require('../src/routes/wishList');

app.use('/api/users', authRoutes);
app.use('/api/users', userProfileRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', require('../src/routes/admin'));

// Test route
app.get('/', (req, res) => res.send("API is running"));

// Error handling
app.use((err, req, res, next) => {
  console.error("Error details:", err);
  console.error("Error stack:", err.stack);
  res.status(500).json({
    message: "Something broke!",
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;
