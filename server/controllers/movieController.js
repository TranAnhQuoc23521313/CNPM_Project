// server/controllers/movieController.js
const movieService = require('../services/movieService');
// ...

class MovieController {
    async getAllMovies(req, res, next) {
        try {
            const movies = await movieService.getAllMovies();
            console.log('movieController: getAllMovies response:', movies);
            res.status(200).json(movies); // Trả về mảng phim với status 200
        } catch (error) {
            // Lỗi sẽ được chuyển đến middleware xử lý lỗi chung
            next(error);
        }
    }
    // ... các phương thức khác ...
}
module.exports = new MovieController();