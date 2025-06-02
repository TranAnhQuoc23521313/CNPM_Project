// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { verifyToken /*, authorizeRoles */ } = require('../middleware/authMiddleware');
// const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Tạo hóa đơn mới
// POST /api/orders
//router.post('/', /* verifyToken, authorizeRoles(['staff','admin']), */ OrderController.createOrder);
router.post('/', verifyToken, OrderController.createOrder);

// Lấy tất cả hóa đơn (có thể có tìm kiếm)
// GET /api/orders?searchTerm=...
router.get('/', /* verifyToken, authorizeRoles(['staff','admin']), */ OrderController.getAllOrders);

// Lấy chi tiết một hóa đơn
// GET /api/orders/:id
router.get('/:id', /* verifyToken, authorizeRoles(['staff','admin']), */ OrderController.getOrderById);

// Hủy một hóa đơn
// PUT /api/orders/:id/cancel (Hoặc DELETE /api/orders/:id nếu muốn coi là xóa)
router.put('/:id/cancel', verifyToken, /* authorizeRoles(['staff','admin']), */ OrderController.cancelOrder);


module.exports = router;