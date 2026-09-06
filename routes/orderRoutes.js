const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminOnly');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/admin/all', adminOnly, getAllOrders);
router.get('/:id', validateObjectId('id'), getOrderById);
router.put('/:id/status', adminOnly, validateObjectId('id'), updateOrderStatus);

module.exports = router;
