const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminOnly');
const validateObjectId = require('../middleware/validateObjectId');

router
  .route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

router
  .route('/:id')
  .get(validateObjectId('id'), getProductById)
  .put(protect, adminOnly, validateObjectId('id'), updateProduct)
  .delete(protect, adminOnly, validateObjectId('id'), deleteProduct);

module.exports = router;
