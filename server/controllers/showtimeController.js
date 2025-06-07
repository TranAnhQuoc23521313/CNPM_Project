// server/controllers/showtimeController.js
const showtimeService = require('../services/showtimeService'); // Khởi tạo instance

class ShowtimeController {
    async createShowtime(req, res, next) {
        try {
            console.log('ShowtimeController: Received createShowtime request body:', req.body);
            // Dữ liệu client gửi lên: MAPHIM, MAPHONG, THOIGIAN (ví dụ: "2024-05-16T10:00"), GIASUATCHIEU
            // THOIGIAN cần được client gửi đúng định dạng mà new Date() có thể parse
            // hoặc server cần chuẩn hóa nó.
            // Ví dụ: client gửi date và time riêng, server ghép lại.
            // Hiện tại AddShowtimeModal gửi date và time riêng.

            // Ghép date và time từ client
            const { MAPHIM, MAPHONG, date, time, GIASUATCHIEU, TRANGTHAI } = req.body;
            if (!date || !time) {
                const error = new Error('Ngày tháng và thời gian là bắt buộc');
                error.statusCode = 400;
                throw error;
            }
            const thoiGianDateTime = `${date} ${time}:00`; // Format YYYY-MM-DD HH:MM:SS
            console.log('ShowtimeController: Constructed datetime string for service:', thoiGianDateTime);
            const showtimeData = {
                MAPHIM,
                MAPHONG,
                THOIGIAN: thoiGianDateTime,
                GIASUATCHIEU: parseInt(GIASUATCHIEU, 10),
                TRANGTHAI
            };

            const newShowtime = await showtimeService.createShowtime(showtimeData);
            res.status(201).json(newShowtime);
        } catch (error) {
            console.error('ShowtimeController: Error in createShowtime:', error);
            next(error); // Chuyển lỗi đến middleware xử lý lỗi chung
        }
    }

    async getShowtimesByMovie(req, res, next) {
        try {
            const movieId = req.query.movieId; // Hoặc req.params.movieId nếu route là /movies/:movieId/showtimes
            if (!movieId) {
                return res.status(400).json({ message: 'movieId query parameter is required.' });
            }
            console.log(`ShowtimeController: Fetching showtimes for movieId: ${movieId}`);
            // Gọi service, service sẽ gọi repository để query JOIN với PHONGCHIEU
            const showtimes = await showtimeService.getShowtimesByMovieId(movieId);
            res.status(200).json(showtimes);
        } catch (error) {
            next(error);
        }
    }
    // TODO: Implement getAllShowtimes, getShowtimeById, updateShowtime, deleteShowtime
    async getShowtimeById(req, res, next) { // Thêm hàm này
        try {
            const maSuatChieu = req.params.id;
            const showtime = await showtimeService.getShowtimeById(maSuatChieu);
            if (!showtime) {
                return res.status(404).json({ message: "Suất chiếu không tìm thấy." });
            }
            res.status(200).json(showtime);
        } catch (error) {
            console.error(`ShowtimeController.getShowtimeById for ${req.params.id} error:`, error);
            next(error);
        }
    }

    async deleteShowtime(req, res, next) {
        try {
            const maSuatChieu = req.params.id;
            if (!maSuatChieu) {
                return res.status(400).json({ message: "Mã suất chiếu là bắt buộc." });
            }
            const result = await showtimeService.deleteShowtime(maSuatChieu);
            // Service đã trả về { success: true, message: "..." } hoặc ném lỗi
            res.status(200).json(result);
        } catch (error) {
            console.error(`ShowtimeController.deleteShowtime for ${req.params.id} error:`, error);
            // Service đã có thể set statusCode cho lỗi, middleware lỗi chung sẽ xử lý
            next(error);
        }
    }

    async updateShowtime(req, res, next) {
        try {
            const maSuatChieu = req.params.id;
            const dataToUpdate = req.body; // { MAPHIM?, MAPHONG?, date?, time?, GIASUATCHIEU?, TRANGTHAI? }

            if (Object.keys(dataToUpdate).length === 0) {
                return res.status(400).json({ message: "Không có dữ liệu để cập nhật." });
            }

            const result = await showtimeService.updateShowtime(maSuatChieu, dataToUpdate);
            res.status(200).json(result); // Trả về { success, message, data (suất chiếu đã cập nhật) }
        } catch (error) {
            console.error(`ShowtimeController.updateShowtime for ${req.params.id} error:`, error);
            next(error);
        }
    }
}
module.exports = new ShowtimeController();