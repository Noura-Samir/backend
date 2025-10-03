const product = require('../models/Product');

exports.getAllProducts =async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const searchQuery= req.query.search || '';
        const brand = req.query.brand;
        const category = req.query.category;
        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice);

        const filter = {};

        if(searchQuery){
            filter.$or = [{ name: {$regex: searchQuery , $options: 'i'}},
            {description: {$regex:  searchQuery , $options: 'i'}}];
        }
        
        if (category) {
        filter.category = category;
        }

        if (brand) {
        filter.brand = brand;
}



        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
        filter.price = {};
        if (!isNaN(minPrice)) filter.price.$gte = minPrice;
        if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }


        // const projection= searchQuery?
        // {score:{$meta:'textScore'}} :{};

        // const sortOption = searchQuery?
        // {score : {$meta:'textScore'}} : {createdAt:-1};
        const projection = {}; 
        const sortOption = { createdAt: -1 };

        const total = await product.countDocuments(filter);

        const products = await product.find(filter , projection)
            .sort( sortOption) 
            .skip(skip)
            .limit(limit);

        res.json({
            total,
            page,
            pages: Math.ceil(total / limit),
            products
        });
    } catch (err) {
        next(err);
    }
};

exports.getProductById = async (req , res , next)=>{
    try{
        const Product = await product.findById(req.params.id);
        if (!Product) return res.status(404).json({ message: 'Product not found' });
        res.json(Product);
    }catch(err){
        next(err);
    }
};

exports.createProduct =async(req , res , next)=>{
    try{
        const newProduct = new product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch(err){
        next(err);
    }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } 
    );

    if (!updatedProduct)
      return res.status(404).json({ message: 'Product not found' });

    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await product.findByIdAndDelete(req.params.id);

    if (!deletedProduct)
      return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteProducts= async(req, res, next)=>{
  try{
    const deletedProducts= await product.deleteMany({});

    res.json({ message: 'Products deleted successfully' , deletedCount: deletedProducts.deletedCount });
  }catch (err) {
    next(err);
  }
}

exports.addMultipleProducts = async (req, res, next) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Request body must be a non-empty array of products' });
    }

    const inserted = await product.insertMany(products);

    res.status(201).json({ message: 'Products added successfully', products: inserted });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await product.distinct('category');
    res.json(categories);
  } catch (err) {
    next(err);
  }
};
