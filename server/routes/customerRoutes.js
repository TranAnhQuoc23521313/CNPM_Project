// server/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
// const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware'); // Bỏ comment nếu có auth

// Tìm khách hàng bằng SĐT
// GET /api/customers/phone/0123456789
router.get('/phone/:phone', /* verifyToken, authorizeRoles(['staff','admin']), */ CustomerController.findCustomerByPhone);

// Lấy danh sách tất cả khách hàng (có thể có tìm kiếm)
// GET /api/customers?searchTerm=...
router.get('/', /* verifyToken, authorizeRoles(['staff','admin']), */ CustomerController.getAllCustomers); // <<<<===== THÊM DÒNG NÀY

// Đăng ký khách hàng mới
// POST /api/customers
router.post('/',  /* verifyToken, authorizeRoles(['staff','admin']), */ CustomerController.registerCustomer);

// Lấy chi tiết một khách hàng bằng ID
// GET /api/customers/KH001
router.get('/:id', /* verifyToken, authorizeRoles(['staff','admin']), */ CustomerController.getCustomerById);

// Cập nhật thông tin khách hàng bằng ID
// PUT /api/customers/KH001
router.put('/:id', /* verifyToken, authorizeRoles(['staff','admin']), */ CustomerController.updateCustomer);

// Xóa khách hàng bằng ID
// DELETE /api/customers/KH001
router.delete('/:id', /* verifyToken, authorizeRoles(['staff','admin']), */ CustomerController.deleteCustomer);

module.exports = router;