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

    async findById(maSuatChieu, connection = pool) {
        const sql = `
            SELECT
                sc.MASUATCHIEU, sc.THOIGIAN, sc.TRANGTHAI, sc.GIASUATCHIEU,
                sc.MAPHIM, p.TENPHIM,
                sc.MAPHONG, pc.TENPHONG, pc.LOAIPHONG
            FROM SUATCHIEU sc
            JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
            JOIN PHONGCHIEU pc ON sc.MAPHONG = pc.MAPHONG
            WHERE sc.MASUATCHIEU = ?;
        `;
        try {
            const [rows] = await connection.query(sql, [maSuatChieu]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error in ShowtimeRepository.findById for ${maSuatChieu}:`, error);
            throw new Error('Database query failed to fetch showtime by ID.');
        }
    }

    async hasSoldTickets(maSuatChieu, connection = pool) {
        // Kiểm tra xem có vé nào (không bị hủy) đã bán cho suất chiếu này không
        const sql = "SELECT COUNT(*) as count FROM VE WHERE MASUATCHIEU = ? AND TRANGTHAIVE != 'Đã hủy'";
        try {
            const [rows] = await connection.query(sql, [maSuatChieu]);
            return rows[0].count > 0;
        } catch (error) {
            console.error(`Error checking for sold tickets for MASUATCHIEU ${maSuatChieu}:`, error);
            throw error;
        }
    }

    async deleteById(maSuatChieu, connection = pool) {
        const sql = "DELETE FROM SUATCHIEU WHERE MASUATCHIEU = ?";
        try {
            const [result] = await connection.query(sql, [maSuatChieu]);
            return result; // result.affectedRows sẽ cho biết có xóa được không
        } catch (error) {
            console.error(`Error deleting showtime ${maSuatChieu}:`, error);
            // Xử lý lỗi khóa ngoại nếu SUATCHIEU này đang được tham chiếu bởi VE
            // (Mặc dù chúng ta sẽ kiểm tra trước, nhưng đây là phòng vệ)
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message.includes('foreign key constraint fails')) {
                throw new Error(`Không thể xóa suất chiếu ${maSuatChieu} vì vẫn còn vé hoặc dữ liệu liên quan. Vui lòng hủy các vé liên quan trước.`);
            }
            throw error;
        }
    }

    async updateById(maSuatChieu, showtimeDataToUpdate, connection = pool) {
        // showtimeDataToUpdate có thể chứa: MAPHIM, MAPHONG, THOIGIAN, GIASUATCHIEU, TRANGTHAI
        const { MAPHIM, MAPHONG, THOIGIAN, GIASUATCHIEU, TRANGTHAI } = showtimeDataToUpdate;

        // Xây dựng câu lệnh SET động dựa trên các trường được cung cấp
        const fieldsToUpdate = [];
        const values = [];

        if (MAPHIM !== undefined) { fieldsToUpdate.push("MAPHIM = ?"); values.push(MAPHIM); }
        if (MAPHONG !== undefined) { fieldsToUpdate.push("MAPHONG = ?"); values.push(MAPHONG); }
        if (THOIGIAN !== undefined) { fieldsToUpdate.push("THOIGIAN = ?"); values.push(THOIGIAN); }
        if (GIASUATCHIEU !== undefined) { fieldsToUpdate.push("GIASUATCHIEU = ?"); values.push(GIASUATCHIEU); }
        if (TRANGTHAI !== undefined) { fieldsToUpdate.push("TRANGTHAI = ?"); values.push(TRANGTHAI); }

        if (fieldsToUpdate.length === 0) {
            // Không có gì để cập nhật
            return { affectedRows: 0, changedRows: 0 };
        }

        const sql = `UPDATE SUATCHIEU SET ${fieldsToUpdate.join(", ")} WHERE MASUATCHIEU = ?`;
        values.push(maSuatChieu);

        try {
            const [result] = await connection.query(sql, values);
            return result; // result.affectedRows, result.changedRows
        } catch (error) {
            console.error(`Error updating showtime ${maSuatChieu}:`, error);
            // Xử lý lỗi khóa ngoại nếu MAPHIM hoặc MAPHONG mới không hợp lệ
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                 throw new Error(`Cập nhật thất bại: Mã phim hoặc mã phòng chiếu không hợp lệ.`);
            }
            throw error;
        }
    }
}
module.exports = new ShowtimeRepository();