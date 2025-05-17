// server/routes/showtimeRoutes.js
const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController'); // Khởi tạo instance

// POST /api/showtimes - Tạo suất chiếu mới
router.post('/', showtimeController.createShowtime);
router.get('/', showtimeController.getShowtimesByMovie);

// GET /api/showtimes - Lấy danh sách suất chiếu (cần implement)
// router.get('/', showtimeController.getAllShowtimes);

// GET /api/showtimes/:id - Lấy chi tiết suất chiếu (cần implement)
// router.get('/:id', showtimeController.getShowtimeById);

// PUT /api/showtimes/:id - Cập nhật suất chiếu (cần implement)
// router.put('/:id', showtimeController.updateShowtime);

// DELETE /api/showtimes/:id - Xóa suất chiếu (cần implement)
// router.delete('/:id', showtimeController.deleteShowtime);

module.exports = router;