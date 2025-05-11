// server/repositories/movieRepository.js
const pool = require('../config/db');

class MovieRepository {
    async findAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM PHIM'); // Có thể thêm ORDER BY
            console.log('MovieRepository.findAll: rows:', rows);
            return rows;
        } catch (error) {
            console.error('Error in MovieRepository.findAll:', error);
            throw new Error('Database query failed to fetch movies.'); // Ném lỗi để service/controller bắt
        }
    }
    // ... các hàm khác (findById, create, update, delete) ...
}
module.exports = new MovieRepository();