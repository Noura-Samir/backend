const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [99, 'Quantity cannot exceed 99'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.total = this.subtotal;
  next();
});

cartSchema.methods.addItem = function(productData, quantity) {
  const index = this.items.findIndex(item => item.product.toString() === productData._id.toString());
  if (index >= 0) {
    this.items[index].quantity += quantity;
    this.items[index].price = productData.price;
  } else {
    this.items.push({
      product: productData._id,
      quantity,
      price: productData.price,
    });
  }
  return this.save();
};

cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  if (quantity < 1 || quantity > 99) {
    throw new Error('Quantity must be between 1 and 99');
  }

  const index = this.items.findIndex(item => item.product.toString() === productId.toString());
  if (index >= 0) {
    this.items[index].quantity = quantity;
    return this.save();
  }
  throw new Error('Item not found in cart');
};

cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

cartSchema.methods.clear = function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
