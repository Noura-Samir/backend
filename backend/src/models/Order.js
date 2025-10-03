const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  paymentInfo: {
    method: {
      type: String,
      required: true,
      enum: ['paypal', 'credit_card', 'mada', 'apple_pay']
    },
    transactionId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded', 'COMPLETED', 'PENDING', 'FAILED']
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "shipped",
      "out-for-delivery",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  trackingNumber: {
    type: String,
    default: null,
  },
  estimatedDelivery: {
    type: Date,
    default: null,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
