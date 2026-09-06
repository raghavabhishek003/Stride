const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);

router.route('/').get(getCart).post(addToCart);

router
  .route('/:productId')
  .put(validateObjectId('productId'), updateCartItem)
  .delete(validateObjectId('productId'), removeFromCart);

module.exports = router;
