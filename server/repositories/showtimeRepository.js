// server/repositories/showtimeRepository.js
const pool = require('../config/db');

class ShowtimeRepository {
    async create(showtimeData) {
        const { MASUATCHIEU, MAPHIM, MAPHONG, THOIGIAN, TRANGTHAI, GIASUATCHIEU } = showtimeData;
        console.log('ShowtimeRepository: Creating showtime with data:', showtimeData.THOIGIAN);
        const sql = `INSERT INTO SUATCHIEU (MASUATCHIEU, MAPHIM, MAPHONG, THOIGIAN, TRANGTHAI, GIASUATCHIEU)
                     VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [MASUATCHIEU, MAPHIM, MAPHONG, THOIGIAN, TRANGTHAI || 'Sắp chiếu', GIASUATCHIEU];

        console.log('ShowtimeRepository: Attempting to insert showtime:', sql, values);
        try {
            const [result] = await pool.query(sql, values);
            if (result.affectedRows === 1) {
                return { ...showtimeData }; // Trả về dữ liệu đã thêm
            }
            throw new Error('Failed to create showtime: No rows affected.');
        } catch (error) {
            console.error('Error in ShowtimeRepository.create:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error(`Showtime ID '${MASUATCHIEU}' already exists.`);
            }
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                if (error.sqlMessage.includes('FK_SUATCHIEU_MAPHIM')) {
                    throw new Error(`Invalid MAPHIM '${MAPHIM}'. Movie does not exist.`);
                }
                if (error.sqlMessage.includes('FK_SUATCHIEU_MAPHONG')) {
                    throw new Error(`Invalid MAPHONG '${MAPHONG}'. Screening room does not exist.`);
                }
            }
            throw new Error('Database query failed to create showtime.');
        }
    }

    async checkOverlap(maPhong, thoiGianBatDau_moi, thoiGianKetThuc_moi, thoiGianNghiGiuaSuat = 15, excludeMaSuatChieu = null) {
        // thoiGianBatDau_moi, thoiGianKetThuc_moi là chuỗi 'YYYY-MM-DD HH:MM:SS'
        
        // SỬ DỤNG KHỐI SQL ĐƠN GIẢN VÀ CHÍNH XÁC NÀY
        let sql = `
        SELECT COUNT(*) as count
        FROM SUATCHIEU sc
        JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
        WHERE sc.MAPHONG = ?
          AND sc.THOIGIAN < ?  -- S_cu < E_moi
          AND DATE_ADD(DATE_ADD(sc.THOIGIAN, INTERVAL p.THOILUONG MINUTE), INTERVAL ? MINUTE) > ? -- (E_cu + nghỉ) > S_moi`;
        // Các tham số theo thứ tự: maPhong, thoiGianKetThuc_moi, thoiGianBatDau_moi
        const params = [maPhong, thoiGianKetThuc_moi, thoiGianNghiGiuaSuat, thoiGianBatDau_moi];

        if (excludeMaSuatChieu) {
            sql += ' AND sc.MASUATCHIEU != ?';
            params.push(excludeMaSuatChieu);
        }

        console.log('ShowtimeRepository: Checking overlap with SQL:', sql);
        console.log('ShowtimeRepository: Params for overlap check:', params); // LOG QUAN TRỌNG

        try {
            const [rows] = await pool.query(sql, params);
            console.log('ShowtimeRepository: Overlap check count:', rows[0].count);
            return rows[0].count > 0; // True nếu có ít nhất 1 suất chiếu bị trùng
        } catch (error) {
            console.error('Error in ShowtimeRepository.checkOverlap:', error);
            // Ném lỗi cụ thể hơn nếu có thể, hoặc lỗi chung
            throw new Error('Database query failed while checking showtime overlap. SQL error: ' + error.message);
        }
    }

    // Bạn cũng cần hàm checkMovieShowtimeOverlap nếu muốn kiểm tra trùng cho CÙNG một phim
    async checkMovieShowtimeOverlap(maPhim, maPhong, thoiGianBatDau_moi, thoiGianKetThuc_moi, thoiGianNghiGiuaSuat = 15, excludeMaSuatChieu = null) {
        let sql = `
            SELECT COUNT(*) as count
            FROM SUATCHIEU sc
            JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
            WHERE sc.MAPHIM = ?       -- Cho cùng một phim
              AND sc.MAPHONG = ?
              AND sc.THOIGIAN < ?     -- S_cu < E_moi
              AND DATE_ADD(DATE_ADD(sc.THOIGIAN, INTERVAL p.THOILUONG MINUTE), INTERVAL ? MINUTE) > ? -- (E_cu + nghỉ) > S_moi
        `;
        const params = [maPhim, maPhong, thoiGianKetThuc_moi, thoiGianNghiGiuaSuat, thoiGianBatDau_moi];

        if (excludeMaSuatChieu) {
            sql += ' AND sc.MASUATCHIEU != ?';
            params.push(excludeMaSuatChieu);
        }
        console.log('ShowtimeRepository: Checking MOVIE specific overlap with SQL:', sql, params);
        try {
            const [rows] = await pool.query(sql, params);
            return rows[0].count > 0;
        } catch (error) {
            console.error('Error in ShowtimeRepository.checkMovieShowtimeOverlap:', error);
            throw new Error('Database query failed while checking movie-specific showtime overlap. SQL error: ' + error.message);
        }
    }

    async findByMovieId(movieId) {
        const sql = `
            SELECT
                sc.MASUATCHIEU, sc.THOIGIAN, sc.TRANGTHAI, sc.GIASUATCHIEU,
                p.MAPHIM AS PHIM_MAPHIM, p.TENPHIM AS PHIM_TENPHIM,
                pc.MAPHONG AS PHONG_MAPHONG, pc.TENPHONG AS PHONG_TENPHONG, pc.LOAIPHONG AS PHONG_LOAIPHONG
            FROM SUATCHIEU sc
            JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
            JOIN PHONGCHIEU pc ON sc.MAPHONG = pc.MAPHONG
            WHERE sc.MAPHIM = ?
            ORDER BY sc.THOIGIAN ASC;
        `;
        try {
            const [rows] = await pool.query(sql, [movieId]);
            return rows;
        } catch (error) {
            console.error(`Error in ShowtimeRepository.findByMovieId for ${movieId}:`, error);
            throw new Error('Database query failed to fetch showtimes for the movie.');
        }
    }
}
module.exports = new ShowtimeRepository();