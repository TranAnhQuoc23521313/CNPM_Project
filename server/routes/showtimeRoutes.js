// server/routes/showtimeRoutes.js
const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');

// POST /api/showtimes - Tạo suất chiếu mới
router.post('/', showtimeController.createShowtime);

// GET /api/showtimes?movieId=... - Lấy suất chiếu theo phim
router.get('/', showtimeController.getShowtimesByMovie);

// GET /api/showtimes/:id - Lấy chi tiết một suất chiếu
router.get('/:id', showtimeController.getShowtimeById);

// DELETE /api/showtimes/:id - Xóa một suất chiếu
router.delete('/:id', showtimeController.deleteShowtime);

// (Sau này sẽ thêm PUT /api/showtimes/:id cho update)
router.put('/:id', showtimeController.updateShowtime);

module.exports = router;