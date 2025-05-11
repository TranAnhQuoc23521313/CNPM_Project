// server/services/movieService.js
const movieRepository = require('../repositories/movieRepository');

class MovieService {
    async getAllMovies() {
        try {
            return await movieRepository.findAll();
        } catch (error) {
            // Log lỗi ở đây nếu cần, hoặc chỉ ném lại để controller xử lý
            console.error('Error in MovieService.getAllMovies:', error);
            throw error; // Ném lại lỗi
        }
    }
    // ... các hàm khác ...
}
module.exports = new MovieService();