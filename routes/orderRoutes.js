const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrderById, payOrder,
  getSellerOrders, getAllOrders, updateOrderStatus, cancelOrder
} = require('../controllers/orderController');
const { protect, seller, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/seller', protect, seller, getSellerOrders);
router.get('/admin/all', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, payOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
