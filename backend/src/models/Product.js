const mongoose = require('mongoose');

const productSchema= new mongoose.Schema({
    title:{type: String, required: true},
    price: { type: Number, required: true },
    colors: [String],
    description: String,
    images: [String],
    category: String,
    stock: Number,
    rating: Number,
    brand: String,
}, { timestamps: true })


productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product' , productSchema);