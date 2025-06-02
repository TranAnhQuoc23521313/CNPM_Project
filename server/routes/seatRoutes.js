// server/routes/seatRoutes.js
const express = require('express');
const router = express.Router();
const SeatController = require('../controllers/seatController');
// const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Lấy sơ đồ ghế và trạng thái cho một suất chiếu cụ thể
// GET /api/seats/layout/:showtimeId
router.get('/layout/:showtimeId', /* verifyToken, authorizeRoles(['staff','admin']), */ SeatController.getSeatLayoutForShowtime);

module.exports = router;