const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Import models to ensure they are registered

require('./models/User');
require('./models/Product');
require('./models/Cart');
require('./models/Order');


const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders');
const userProfileRoutes = require('./routes/userProfile');
const connectDB = require('./config/db.config');
const wishlistRoutes = require('./routes/wishList');




dotenv.config();

const app = express();




// Connect to MongoDB
connectDB();
/*******************backend cors frontend************* */
// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Handle preflight requests
app.options("*", cors());
/******************************************** */
// Middleware to parse JSON
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Request body:", req.body);
  }
  next();
});

// Routes
app.use('/api/users', authRoutes);
app.use('/api/users', userProfileRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error details:", err);
  console.error("Error stack:", err.stack);
  res.status(500).json({
    message: "Something broke!",
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// MongoDB Connection
// const PORT = process.env.PORT || 3000;
// mongoose.connect('mongodb://127.0.0.1:27017/ecommerce', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// Add error handling for the server
// const server = app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);

// }).on('error', (err) => {
//   if (err.code === 'EADDRINUSE') {
//     console.error(`Port ${PORT} is already in use. Please try a different port or close the application using this port.`);
//     process.exit(1);
//   } else {
//     console.error('Error starting server:', err);
//     process.exit(1);
//   }
// });

const PORT = process.env.PORT || 3000;

const server = app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Please try a different port or close the application using this port.`
      );
      process.exit(1);
    } else {
      console.error("Error starting server:", err);
      process.exit(1);
    }
  });
