const Order = require("../models/Order");

// Get all orders for user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name price images")
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get single order details
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("items.product", "name price images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching order details",
      error: error.message,
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancellation of pending orders
    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }

    order.status = "cancelled";
    await order.save();

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error cancelling order",
      error: error.message,
    });
  }
};

// Admin-only: Update order status (for future use)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, estimatedDelivery } = req.body;
    const validStatuses = [
      "confirmed",
      "shipped",
      "out-for-delivery",
      "delivered",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    await order.save();
    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    console.log('=== CREATE ORDER DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User object:', req.user);
    console.log('User ID:', req.user?.id);
    console.log('Headers:', req.headers);
    
    // Check if user exists
    if (!req.user || !req.user.id) {
      console.log('Authentication failed: No user found');
      return res.status(401).json({ 
        message: "Authentication required. Please log in again." 
      });
    }
    
    const { items, shippingAddress, paymentInfo, totalAmount } = req.body;
    
    // Validate required data
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Validation failed: items are required');
      return res.status(400).json({ message: "Order items are required" });
    }
    
    if (!shippingAddress) {
      console.log('Validation failed: shippingAddress is required');
      return res.status(400).json({ message: "Shipping address is required" });
    }
    
    if (!paymentInfo) {
      console.log('Validation failed: paymentInfo is required');
      return res.status(400).json({ message: "Payment info is required" });
    }
    
    if (!totalAmount || typeof totalAmount !== 'number') {
      console.log('Validation failed: totalAmount is required and must be a number');
      return res.status(400).json({ message: "Total amount is required and must be a number" });
    }
    
    console.log('Data validation passed, creating order...');
    
    // Create order
    const orderData = {
      user: req.user.id,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        name: shippingAddress.name,
        address: shippingAddress.address,
        email: shippingAddress.email
      },
      paymentInfo: {
        method: paymentInfo.method || 'paypal',
        transactionId: paymentInfo.transactionId || paymentInfo.details?.transactionId || paymentInfo.details?.id || 'N/A',
        status: paymentInfo.status || paymentInfo.details?.status || 'completed',
        amount: totalAmount,
        currency: paymentInfo.currency || paymentInfo.details?.currency || 'USD',
        details: paymentInfo.details || {}
      },
      totalAmount: totalAmount,
      status: "pending",
      orderDate: new Date(),
    };
    
    console.log('Order data to save:', JSON.stringify(orderData, null, 2));
    
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    console.log('Order created successfully:', savedOrder._id);
    res.status(201).json({ 
      message: "Order created successfully", 
      order: savedOrder,
      orderId: savedOrder._id 
    });
    
  } catch (error) {
    console.error('=== CREATE ORDER ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Determine error type
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid data format", 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Error creating order", 
      error: error.message 
    });
  }
};
