// src/routes/equipmentRoutes.js
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { verifyToken } = require('../middleware/authMiddleware'); // Giả sử bạn có middleware

// GET /api/equipments - Lấy tất cả thiết bị
// Cần bảo vệ route này, ví dụ: chỉ admin hoặc nhân viên được xem
router.get(
    '/', 
    verifyToken, // Mọi người dùng đã đăng nhập có thể xem
    equipmentController.getAllEquipment
);

// POST /api/equipments - Tạo thiết bị mới
// Cần bảo vệ route này, ví dụ: chỉ admin được tạo
router.post(
    '/', 
    verifyToken, 
    /* isAdmin, */ // Chỉ Admin được tạo thiết bị
    equipmentController.createEquipment
); 

// GET /api/equipments/:id - Lấy thiết bị theo ID
// Cần bảo vệ route này
router.get(
    '/:id', 
    verifyToken,
    equipmentController.getEquipmentById
);

// Nếu bạn cần các route khác cho thiết bị (ví dụ: cập nhật thông tin thiết bị, xóa thiết bị), 
// bạn sẽ thêm chúng ở đây. Ví dụ:
// router.put('/:id', verifyToken, isAdmin, equipmentController.updateEquipment);
// router.delete('/:id', verifyToken, isAdmin, equipmentController.deleteEquipment);

module.exports = router;