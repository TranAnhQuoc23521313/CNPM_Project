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

    async findById(movieId) {
        try {
            const [rows] = await pool.query('SELECT * FROM PHIM WHERE MAPHIM = ?', [movieId]);
            if (rows.length === 0) {
                return null; // Không tìm thấy phim
            }
            return rows[0];
        } catch (error) {
            console.error('Error in MovieRepository.findById:', error);
            throw new Error('Database query failed to fetch movie by ID.');
        }
    }

    async create(movieData) {
        // Destructure đúng tên biến từ movieData, bao gồm cả HINHANH
        const {
            MAPHIM, TENPHIM, THELOAI, NAMPH, DAODIEN,
            QUOCGIA, NGONNGU, MOTA, THOILUONG, HINHANH // Thêm HINHANH
        } = movieData;

        // Câu lệnh SQL với đúng tên cột từ schema và đủ số lượng placeholders
        const sql = `INSERT INTO PHIM (MAPHIM, TENPHIM, THELOAI, NAMPH, DAODIEN, QUOCGIA, NGONNGU, MOTA, THOILUONG, HINHANH)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`; // 10 dấu ?

        // Mảng giá trị tương ứng, xử lý giá trị null/undefined
        const values = [
            MAPHIM,
            TENPHIM || null,
            THELOAI || null,
            NAMPH ? parseInt(NAMPH, 10) : null, // NAMPH là YEAR, có thể null
            DAODIEN || null,
            QUOCGIA || null,
            NGONNGU || null, // Sửa từ NGONGNU
            MOTA || null,
            THOILUONG === undefined || THOILUONG === null || THOILUONG === '' ? null : parseInt(THOILUONG, 10),
            HINHANH || null // Thêm giá trị HINHANH
        ];

        console.log('MovieRepository: Attempting to insert movie with SQL:', sql);
        console.log('MovieRepository: Values for insert:', values);

        try {
            const [result] = await pool.query(sql, values);
            console.log('MovieRepository: Insert result:', result);
            if (result.affectedRows === 1) {
                // Trả về dữ liệu phim vừa được thêm
                return { ...movieData }; // movieData đã có MAPHIM từ controller
            } else {
                // Dòng này hiếm khi xảy ra nếu query không lỗi, nhưng để phòng ngừa
                throw new Error('Failed to create movie in database: No rows affected.');
            }
        } catch (error) {
            console.error('Error in MovieRepository.create:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                // Lỗi này nên được bắt ở controller sau khi gọi service,
                // vì controller biết MAPHIM nào gây lỗi
                throw new Error(`Movie ID (MAPHIM) '${MAPHIM}' already exists.`);
            }
            // Ném lại lỗi chung nếu không phải lỗi trùng khóa cụ thể
            throw new Error('Database query failed to create movie. Details: ' + error.message);
        }
    }

    async update(maPhim, movieData) {
        const fieldsToUpdate = [];
        const values = [];
        const updatableFields = ['TENPHIM', 'THELOAI', 'NAMPH', 'DAODIEN', 'QUOCGIA', 'NGONNGU', 'MOTA', 'THOILUONG', 'HINHANH'];

        updatableFields.forEach(field => {
            // VẤN ĐỀ TIỀM ẨN 1: movieData.hasOwnProperty(field)
            // Nếu movieData không có key đó (ví dụ client không gửi lên), nó sẽ không được thêm vào update.
            // Nếu client gửi lên key đó với giá trị là undefined hoặc chuỗi rỗng, nó sẽ được xử lý tiếp.
            if (movieData.hasOwnProperty(field)) {
                fieldsToUpdate.push(`${field} = ?`);

                // VẤN ĐỀ TIỀM ẨN 2: Xử lý giá trị
                let valueToSet = movieData[field];

                if (field === 'THOILUONG') {
                    if (valueToSet === undefined || valueToSet === null || valueToSet === '') {
                        valueToSet = null;
                    } else {
                        valueToSet = parseInt(valueToSet, 10);
                        if (isNaN(valueToSet)) valueToSet = null; // Nếu parse lỗi, set null
                    }
                } else if (field === 'NAMPH') { // Tương tự cho NAMPH
                    if (valueToSet === undefined || valueToSet === null || valueToSet === '') {
                        valueToSet = null;
                    } else {
                        valueToSet = parseInt(valueToSet, 10);
                        if (isNaN(valueToSet)) valueToSet = null;
                    }
                } else if (valueToSet === '') { // Đối với các trường VARCHAR, nếu client gửi chuỗi rỗng
                    // Bạn muốn lưu chuỗi rỗng hay NULL?
                    // Nếu cột cho phép NULL và bạn muốn lưu NULL cho chuỗi rỗng:
                    valueToSet = null;
                    // Nếu bạn muốn lưu chuỗi rỗng '' thì không cần dòng trên.
                } else if (valueToSet === undefined) {
                    // Nếu một trường được gửi lên là undefined (ít khi xảy ra với FormData text fields)
                    // Bạn có thể muốn bỏ qua nó hoặc set là NULL
                    // Hiện tại, nếu hasOwnProperty là true và valueToSet là undefined, nó sẽ được thêm vào values là undefined.
                    // MySQL sẽ coi undefined như NULL khi bind.
                }
                values.push(valueToSet);
            }
            // Nếu không có movieData.hasOwnProperty(field), trường đó sẽ không được cập nhật.
            // Điều này có nghĩa là nếu client không gửi một trường nào đó, giá trị cũ của nó trong DB sẽ được giữ nguyên.
            // Đây có thể là hành vi mong muốn.
        });

        if (fieldsToUpdate.length === 0) {
            console.log('MovieRepository: No fields to update for movie', maPhim);
            return 0; // Không có gì để cập nhật
        }

        values.push(maPhim); // Thêm MAPHIM vào cuối cho điều kiện WHERE
        const sql = `UPDATE PHIM SET ${fieldsToUpdate.join(', ')} WHERE MAPHIM = ?`;

        console.log('MovieRepository: Attempting to update movie with SQL:', sql);
        console.log('MovieRepository: Values for update:', values); // RẤT QUAN TRỌNG: XEM GIÁ TRỊ Ở ĐÂY

        try {
            const [result] = await pool.query(sql, values);
            console.log('MovieRepository: Update result:', result);
            return result.affectedRows;
        } catch (error) {
            console.error(`Error in MovieRepository.update for ${maPhim}:`, error);
            throw new Error(`Database query failed: Could not update movie ${maPhim}.`);
        }
    }

    async delete(maPhim) {
        const sql = 'DELETE FROM PHIM WHERE MAPHIM = ?';
        console.log('MovieRepository: Attempting to delete movie with SQL:', sql, [maPhim]);
        try {
            const [result] = await pool.query(sql, [maPhim]);
            console.log('MovieRepository: Delete result:', result);
            return result.affectedRows; // Số hàng bị ảnh hưởng
        } catch (error) {
            console.error(`Error in MovieRepository.delete for ${maPhim}:`, error);
            throw new Error(`Database query failed: Could not delete movie ${maPhim}.`);
        }
    }
    // ... các hàm khác (findById, create, update, delete) ...
}
module.exports = new MovieRepository();