const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: [true, 'Username is required'], 
      unique: true, 
      minlength: [4, 'Username must be at least 4 characters'],
      validate: {
        validator: function(v) {
          return !/^[0-9]/.test(v);
        },
        message: 'Username must not start with a number.'
      }
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    addresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    paymentMethods: [
      {
        cardType: { type: String, required: true }, // "Visa", "MasterCard", etc.
        last4Digits: { type: String, required: true },
        expiryDate: { type: String, required: true }, // "MM/YY"
        isDefault: { type: Boolean, default: false },
      },
    ],
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
