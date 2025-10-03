// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// // Login user
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid email or password' });

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

//     // Create token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Register new user
// exports.register = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user exists
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Email already registered' });

//     // Hash password and save user
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ email, password: hashedPassword });

//     await user.save();
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    // Trim spaces from all fields
    const username = req.body.username?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();
    
    // Validate that all required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "Username, email, and password are required" 
      });
    }
    
    // Validate minimum length for username and password
    if (username.length < 4) {
      return res.status(400).json({ 
        message: "Username must be at least 4 characters long" 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({ 
        message: "Username already exists. Please choose a different username." 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ 
        message: "Email already registered. Please use a different email or login." 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res.status(201).json({ 
      message: "User registered successfully", 
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      if (err.keyPattern?.username) {
        return res.status(400).json({ 
          message: "Username already exists. Please choose a different username." 
        });
      }
      if (err.keyPattern?.email) {
        return res.status(400).json({ 
          message: "Email already registered. Please use a different email or login." 
        });
      }
    }
    
    res.status(500).json({ 
      message: "Server error during registration. Please try again." 
    });
  }
};

/*//////////////////////////// Login User ////////////////////////////*/

exports.login = async (req, res) => {
  try {
    // Trim spaces from email and password
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();
    
    // Validate that email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Wrong password" });

    // Use a default secret if JWT_SECRET is not set
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

    const token = jwt.sign({ id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin }, jwtSecret, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error during login" });
  }
};
