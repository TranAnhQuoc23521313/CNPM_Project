// server/routes/screenRoutes.js
const express = require('express');
const router = express.Router();
// Đảm bảo bạn đã tạo và import screenController
const screenController = require('../controllers/screenController'); // Hoặc cách bạn import

// GET /api/screens - Lấy tất cả phòng chiếu
router.get('/', screenController.getAllScreens); // ĐẢM BẢO DÒNG NÀY CÓ VÀ ĐÚNG

// GET /api/screens/:id - Lấy phòng chiếu theo ID
router.get('/:id', screenController.getScreenById);

module.exports = router;