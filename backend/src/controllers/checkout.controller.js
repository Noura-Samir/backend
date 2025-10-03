const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Create new order from cart
const createOrder = async (req, res) => {
  try {
    console.log("Backend: Creating order with request body:", req.body);
    console.log("Backend: User ID:", req.user.id);

    const { name, address, email } = req.body;

    // Validate required fields
    if (!name || !address || !email) {
      console.error("Backend: Missing required fields:", {
        name,
        address,
        email,
      });
      return res.status(400).json({
        success: false,
        orderId: "",
        message: "Missing required fields: name, address, email",
        error: "Missing required fields",
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    console.log(
      "Backend: Found cart:",
      cart ? `Cart with ${cart.items.length} items` : "No cart found"
    );

    if (!cart || cart.items.length === 0) {
      console.error("Backend: Cart is empty or not found");
      return res.status(400).json({
        success: false,
        orderId: "",
        message: "Cart is empty",
        error: "Cart is empty",
      });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    console.log("Backend: Calculated total amount:", totalAmount);

    // Create order items from cart items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Create new order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress: {
        name,
        address,
        email,
      },
    });

    console.log("Backend: Saving order to database...");
    await order.save();
    console.log("Backend: Order saved successfully with ID:", order._id);

    // Clear the cart after successful order
    cart.items = [];
    await cart.save();
    console.log("Backend: Cart cleared successfully");

    const response = {
      success: true,
      orderId: order._id.toString(),
      message: "Order placed successfully",
    };

    console.log("Backend: Sending success response:", response);
    res.status(201).json(response);
  } catch (error) {
    console.error("Backend: Checkout error:", error);
    res.status(500).json({
      success: false,
      orderId: "",
      message: "Error processing order",
      error: "Error processing order",
    });
  }
};

// Get all orders for logged-in user
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Get specific order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to the logged-in user
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
};
