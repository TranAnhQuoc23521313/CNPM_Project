// server/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { uploadPoster } = require('../middleware/uploadMiddleware'); // Không cần cho GET all

router.get('/', movieController.getAllMovies); // Endpoint để lấy tất cả phim
router.post('/',uploadPoster.single('HINHANH_FILE'), movieController.createMovie); // Endpoint để lấy tất cả phim
router.put('/:id', uploadPoster.single('HINHANH_FILE'), movieController.updateMovie); // Endpoint để lấy tất cả phim
router.delete('/:id', movieController.deleteMovie); // Endpoint để lấy tất cả phim

// router.post('/', uploadPoster.single('HINHANH_FILE'), movieController.createMovie);
// router.get('/:id', movieController.getMovieById);
// router.put('/:id', uploadPoster.single('HINHANH_FILE'), movieController.updateMovie);
// router.delete('/:id', movieController.deleteMovie);

module.exports = router;