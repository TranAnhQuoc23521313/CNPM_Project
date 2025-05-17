// server/services/showtimeService.js
const showtimeRepository = require('../repositories/showtimeRepository'); // Khởi tạo instance
const movieRepository = require('../repositories/movieRepository'); // Để lấy thời lượng phim
const { generateNextShowtimeId } = require('../utils/showtimeIdGenerator');

class ShowtimeService {
    async createShowtime(showtimeData) {
        // showtimeData.THOIGIAN từ controller đã là chuỗi "YYYY-MM-DD HH:MM:SS"
        // ví dụ: "2025-05-16 17:00:00" (giờ người dùng nhập)
        console.log('ShowtimeService: Attempting to create showtime with data from controller:', showtimeData);

        // 1. Validate đầu vào cơ bản
        if (!showtimeData.MAPHIM || !showtimeData.MAPHONG || !showtimeData.THOIGIAN || showtimeData.GIASUATCHIEU === undefined || showtimeData.GIASUATCHIEU === null) {
            const error = new Error('Missing required fields for showtime creation (MAPHIM, MAPHONG, THOIGIAN, GIASUATCHIEU).');
            error.statusCode = 400;
            throw error;
        }

        // 2. Lấy thông tin phim để biết thời lượng
        const movie = await movieRepository.findById(showtimeData.MAPHIM);
        if (!movie || typeof movie.THOILUONG !== 'number') {
            const error = new Error(`Movie with MAPHIM '${showtimeData.MAPHIM}' not found or has no valid duration.`);
            error.statusCode = 400; // Hoặc 404 nếu phim không tồn tại
            throw error;
        }

        // 3. Sử dụng trực tiếp chuỗi THOIGIAN từ controller cho thời gian bắt đầu SQL
        const thoiGianBatDauChoSQL = showtimeData.THOIGIAN;

        // Tạo đối tượng Date TẠM THỜI từ chuỗi này CHỈ để tính toán thời gian kết thúc
        // JavaScript new Date(string) sẽ parse string "YYYY-MM-DD HH:MM:SS" theo múi giờ của server.
        const tempDateObjectForCalc = new Date(thoiGianBatDauChoSQL);
        if (isNaN(tempDateObjectForCalc.getTime())) {
            const error = new Error(`Invalid THOIGIAN format for Date parsing: '${thoiGianBatDauChoSQL}'. Controller should provide 'YYYY-MM-DD HH:MM:SS'.`);
            error.statusCode = 400;
            throw error;
        }
        // Tính toán thời gian kết thúc bằng cách cộng thời lượng phim (tính bằng mili giây)
        const dateObjectKetThuc = new Date(tempDateObjectForCalc.getTime() + movie.THOILUONG * 60000);

        // Format lại thời gian kết thúc thành chuỗi "YYYY-MM-DD HH:MM:SS"
        // để giữ nguyên "hệ quy chiếu" giờ địa phương như lúc bắt đầu
        const y = dateObjectKetThuc.getFullYear();
        const m = String(dateObjectKetThuc.getMonth() + 1).padStart(2, '0');
        const d = String(dateObjectKetThuc.getDate()).padStart(2, '0');
        const hr = String(dateObjectKetThuc.getHours()).padStart(2, '0');
        const min = String(dateObjectKetThuc.getMinutes()).padStart(2, '0');
        const sec = String(dateObjectKetThuc.getSeconds()).padStart(2, '0'); // Giữ giây nếu cần
        const thoiGianKetThucChoSQL = `${y}-${m}-${d} ${hr}:${min}:${sec}`;

        console.log(`ShowtimeService - For Overlap Check & DB - Start: ${thoiGianBatDauChoSQL}, Calculated End: ${thoiGianKetThucChoSQL}`);

        // 4. Kiểm tra xung đột lịch chiếu SỬ DỤNG CÁC CHUỖI ĐÃ ĐỊNH DẠNG
        const isOverlapping = await showtimeRepository.checkOverlap(
            showtimeData.MAPHONG,
            thoiGianBatDauChoSQL,    // Truyền CHUỖI "YYYY-MM-DD HH:MM:SS"
            thoiGianKetThucChoSQL    // Truyền CHUỖI "YYYY-MM-DD HH:MM:SS"
        );

        if (isOverlapping) {
            const error = new Error('Showtime conflict: Another showtime exists in this room during the selected time slot.');
            error.statusCode = 409; // Conflict
            throw error;
        }

        // 5. Sinh MASUATCHIEU
        const maSuatChieu = await generateNextShowtimeId();
        const finalShowtimeData = {
            ...showtimeData, // Chứa MAPHIM, MAPHONG, GIASUATCHIEU từ input
            MASUATCHIEU: maSuatChieu,
            TRANGTHAI: showtimeData.TRANGTHAI || 'Sắp chiếu',
            THOIGIAN: thoiGianBatDauChoSQL, // LƯU CHUỖI "YYYY-MM-DD HH:MM:SS" này vào DB
            GIASUATCHIEU: parseInt(showtimeData.GIASUATCHIEU, 10) // Đảm bảo GIASUATCHIEU là số
        };

        console.log('ShowtimeService: Final data for repository create:', finalShowtimeData);
        return await showtimeRepository.create(finalShowtimeData);
    }

    async getShowtimesByMovieId(movieId) {
        console.log(`ShowtimeService: Getting showtimes for movieId: ${movieId}`);
        // Repository sẽ thực hiện JOIN để lấy tên phòng, etc.
        return await showtimeRepository.findByMovieId(movieId);
    }
    // TODO: Implement getAllShowtimes, getShowtimeById, updateShowtime, deleteShowtime
}
module.exports = new ShowtimeService();