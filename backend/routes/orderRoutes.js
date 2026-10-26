const express = require('express');

const {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);

router.get('/my-orders', protect, getMyOrders);

router.get('/', protect, admin, getAllOrders);

router.get('/:id', protect, getOrderById);

router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;