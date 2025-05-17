// server/repositories/screenRepository.js
const pool = require('../config/db');

class ScreenRepository {
    /**
     * Lấy tất cả các phòng chiếu.
     * @returns {Promise<Array>} Mảng các đối tượng phòng chiếu.
     */
    async findAll() {
        const sql = 'SELECT MAPHONG, TENPHONG, SOGHE, TRANGTHAIPHONG, LOAIPHONG FROM PHONGCHIEU ORDER BY TENPHONG ASC';
        try {
            console.log('ScreenRepository: Fetching all screens with SQL:', sql);
            const [rows] = await pool.query(sql);
            return rows;
        } catch (error) {
            console.error('Error in ScreenRepository.findAll:', error);
            throw new Error('Database query failed to fetch screening rooms.');
        }
    }

    /**
     * Tìm phòng chiếu bằng MAPHONG.
     * @param {string} maPhong ID của phòng chiếu.
     * @returns {Promise<Object|null>} Đối tượng phòng chiếu hoặc null nếu không tìm thấy.
     */
    async findById(maPhong) {
        const sql = 'SELECT MAPHONG, TENPHONG, SOGHE, TRANGTHAIPHONG, LOAIPHONG FROM PHONGCHIEU WHERE MAPHONG = ?';
        try {
            console.log('ScreenRepository: Fetching screen by ID with SQL:', sql, [maPhong]);
            const [rows] = await pool.query(sql, [maPhong]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error in ScreenRepository.findById for MAPHONG ${maPhong}:`, error);
            throw new Error('Database query failed to fetch screening room by ID.');
        }
    }

    // Bạn có thể thêm các hàm khác sau này nếu cần CRUD cho PHONGCHIEU
    // async create(screenData) { ... }
    // async update(maPhong, screenData) { ... }
    // async delete(maPhong) { ... }
}

module.exports = new ScreenRepository();