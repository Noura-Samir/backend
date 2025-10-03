const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/products.controller');


router.get('/categories', ProductController.getCategories);
router.get('/', ProductController.getAllProducts);
router.post('/', ProductController.createProduct );
router.post('/bulk', ProductController.addMultipleProducts);
router.get('/:id', ProductController.getProductById);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.delete('/', ProductController.deleteProducts);

module.exports = router;

/******************** */


