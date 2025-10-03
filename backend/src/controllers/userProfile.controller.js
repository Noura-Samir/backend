// userProfile.controller.js
// Get complete user profile
const User = require("../models/User");

// Get all addresses
exports.getAllAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("addresses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.addresses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching addresses", error: error.message });
  }
};

// Get one address by ID
exports.getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id).select("addresses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json(address);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching address", error: error.message });
  }
};

// Get all payment methods
exports.getAllPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("paymentMethods");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.paymentMethods);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment methods",
      error: error.message,
    });
  }
};

// Get one payment method by ID
exports.getPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id).select("paymentMethods");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const paymentMethod = user.paymentMethods.id(id);
    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    res.json(paymentMethod);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching payment method", error: error.message });
  }
};

// Update payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const paymentMethod = user.paymentMethods.id(id);
    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    // If updating isDefault, ensure only one default
    if (updateData.isDefault) {
      user.paymentMethods.forEach((pm) => {
        pm.isDefault = false;
      });
    }
    Object.assign(paymentMethod, updateData);
    await user.save();
    res.json({
      message: "Payment method updated successfully",
      paymentMethods: user.paymentMethods,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating payment method", error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    // Make sure to use req.user.id (not _id) since JWT payload uses 'id'
    const user = await User.findById(req.user.id).select("-password -__v"); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const { street, city, state, postalCode, country, isDefault } = req.body;

    // Validate required fields
    if (!street || !city || !state || !postalCode || !country) {
      return res
        .status(400)
        .json({ message: "All address fields are required" });
    }

    const newAddress = { street, city, state, postalCode, country, isDefault };
    const user = await User.findById(req.user.id);

    // Reset default if new address is default
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding address",
      error: error.message,
    });
  }
};

// Update existing address
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const addressIndex = user.addresses.findIndex(
      (addr) => addr.id.toString() === id
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Handle default address change
    if (updateData.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...updateData,
    };

    await user.save();
    res.json({
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating address",
      error: error.message,
    });
  }
};

// Remove address
exports.removeAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const addressExists = user.addresses.id(id);
    if (!addressExists) {
      return res.status(404).json({ message: "Address not found" });
    }
    user.addresses = user.addresses.filter((addr) => addr.id.toString() !== id);
    await user.save();
    res.json({
      message: "Address removed successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing address",
      error: error.message,
    });
  }
};

// Add payment method
exports.addPaymentMethod = async (req, res) => {
  try {
    const { cardType, last4Digits, expiryDate, isDefault } = req.body;

    // Basic validation
    if (!cardType || !last4Digits || !expiryDate) {
      return res
        .status(400)
        .json({ message: "All payment fields are required" });
    }
    if (last4Digits.length !== 4 || !/^\d+$/.test(last4Digits)) {
      return res.status(400).json({ message: "Invalid card number format" });
    }

    const newPaymentMethod = { cardType, last4Digits, expiryDate, isDefault };
    const user = await User.findById(req.user.id);

    // Reset default if new method is default
    if (isDefault) {
      user.paymentMethods.forEach((pm) => {
        pm.isDefault = false;
      });
    }

    user.paymentMethods.push(newPaymentMethod);
    await user.save();

    res.status(201).json({
      message: "Payment method added successfully",
      paymentMethods: user.paymentMethods,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding payment method",
      error: error.message,
    });
  }
};

// Remove payment method
exports.removePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const paymentMethodExists = user.paymentMethods.id(id);
    if (!paymentMethodExists) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    user.paymentMethods = user.paymentMethods.filter(
      (pm) => pm.id.toString() !== id
    );
    await user.save();
    res.json({
      message: "Payment method removed successfully",
      paymentMethods: user.paymentMethods,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing payment method",
      error: error.message,
    });
  }
};
