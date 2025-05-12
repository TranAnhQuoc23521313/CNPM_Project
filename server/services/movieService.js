// server/services/movieService.js
const movieRepository = require('../repositories/movieRepository');
const path = require('path');
const fs = require('fs'); // Nếu bạn cần xóa file, hãy import fs

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

    async getMovieById(maPhim) { // Tên tham số có thể khác, nhưng hàm phải có tên này
        console.log(`MovieService: Attempting to get movie by ID: ${maPhim}`);
        try {
            const movie = await movieRepository.findById(maPhim);
            // Service có thể quyết định trả về null nếu không tìm thấy,
            // hoặc để controller xử lý null từ repository
            if (!movie) {
                console.warn(`MovieService: Movie with ID ${maPhim} not found.`);
                return null; // Hoặc throw lỗi 404 ở đây nếu muốn
            }
            return movie;
        } catch (error) {
            console.error(`Error in MovieService.getMovieById for ${maPhim}:`, error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }

    async createMovie(movieData) {
        try {
            return await movieRepository.create(movieData);
        } catch (error) {
            // Log lỗi ở đây nếu cần, hoặc chỉ ném lại để controller xử lý
            console.error('Error in MovieService.createMovie:', error);
            throw error; // Ném lại lỗi
        }
    }

    async updateMovie(movieId, movieData) {
        try {
            return await movieRepository.update(movieId, movieData);
        } catch (error) {
            // Log lỗi ở đây nếu cần, hoặc chỉ ném lại để controller xử lý
            console.error('Error in MovieService.updateMovie:', error);
            throw error; // Ném lại lỗi
        }
    }

    async deleteMovie(maPhim) {
        console.log(`MovieService: Attempting to delete movie ${maPhim}`);
        try {
            const movieToDelete = await movieRepository.findById(maPhim);

            if (!movieToDelete) {
                const error = new Error('Movie not found for deletion.');
                error.statusCode = 404;
                throw error;
            }

            const affectedRows = await movieRepository.delete(maPhim);

            if (affectedRows > 0) {
                if (movieToDelete.HINHANH && typeof movieToDelete.HINHANH === 'string' && movieToDelete.HINHANH.trim() !== '') {
                    // Dòng 70 của bạn có thể là dòng này hoặc gần đây, nơi bạn dùng path.join
                    const imagePathOnServer = path.join(__dirname,'../public', movieToDelete.HINHANH);
                    console.log(`MovieService: Attempting to delete image file at: ${imagePathOnServer}`);
                    try {
                        if (fs.existsSync(imagePathOnServer)) {
                            fs.unlinkSync(imagePathOnServer);
                            console.log(`MovieService: Image file deleted: ${imagePathOnServer}`);
                        } else {
                            console.warn(`MovieService: Image file not found: ${imagePathOnServer}`);
                        }
                    } catch (fileErr) {
                        console.error(`MovieService: Failed to delete image file: ${imagePathOnServer}`, fileErr);
                    }
                }
                return { message: `Movie ${maPhim} and associated image (if any) deleted successfully.` };
            } else {
                // ...
            }
        } catch (error) {
            // ...
            throw error;
        }
    }
    // ... các hàm khác ...
}
module.exports = new MovieService();