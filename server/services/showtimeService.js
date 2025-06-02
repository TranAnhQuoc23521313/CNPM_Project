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

    async getShowtimeById(maSuatChieu) { // Thêm hàm này nếu cần lấy chi tiết từ service
        try {
            return await showtimeRepository.findById(maSuatChieu);
        } catch (error) {
            console.error(`Error in ShowtimeService.getShowtimeById for ${maSuatChieu}:`, error);
            throw error;
        }
    }

    async deleteShowtime(maSuatChieu) {
        try {

            const showtimeExists = await showtimeRepository.findById(maSuatChieu);
            if (!showtimeExists) {
                const error = new Error(`Suất chiếu với mã '${maSuatChieu}' không tồn tại.`);
                error.statusCode = 404;
                throw error;
            }

            // Kiểm tra xem có vé nào đã bán cho suất chiếu này không
            const hasTickets = await showtimeRepository.hasSoldTickets(maSuatChieu);
            if (hasTickets) {
                const error = new Error(`Không thể xóa suất chiếu '${maSuatChieu}' vì đã có vé được bán. Vui lòng hủy các vé liên quan trước.`);
                error.statusCode = 400; // Bad Request hoặc 409 Conflict
                throw error;
            }

            // Nếu không có vé, tiến hành xóa suất chiếu
            const result = await showtimeRepository.deleteById(maSuatChieu);

            if (result.affectedRows === 0) {
                // Điều này không nên xảy ra nếu findById đã tìm thấy
                throw new Error(`Không thể xóa suất chiếu '${maSuatChieu}' hoặc suất chiếu không tìm thấy trong quá trình xóa.`);
            }

            console.log(`ShowtimeService: Showtime ${maSuatChieu} deleted successfully.`);
            return { success: true, message: `Suất chiếu ${maSuatChieu} đã được xóa thành công.` };

        } catch (error) {
            console.error(`Error in ShowtimeService.deleteShowtime for ${maSuatChieu}:`, error);
            throw error; // Ném lại lỗi để controller xử lý
        } finally {
        }
    }

    async updateShowtime(maSuatChieu, dataToUpdate) {
        // dataToUpdate từ controller: { MAPHIM?, MAPHONG?, date?, time?, GIASUATCHIEU?, TRANGTHAI? }
        try {

            const existingShowtime = await showtimeRepository.findById(maSuatChieu);
            if (!existingShowtime) {
                const error = new Error(`Suất chiếu với mã '${maSuatChieu}' không tồn tại để cập nhật.`);
                error.statusCode = 404;
                throw error;
            }

            // Chuẩn bị dữ liệu cho repository
            const repoUpdateData = {};
            let thoiGianBatDauMoiChoSQL = existingShowtime.THOIGIAN; // Giữ lại thời gian cũ nếu không thay đổi

            if (dataToUpdate.MAPHIM !== undefined) repoUpdateData.MAPHIM = dataToUpdate.MAPHIM;
            if (dataToUpdate.MAPHONG !== undefined) repoUpdateData.MAPHONG = dataToUpdate.MAPHONG;
            if (dataToUpdate.GIASUATCHIEU !== undefined) repoUpdateData.GIASUATCHIEU = parseInt(dataToUpdate.GIASUATCHIEU, 10);
            if (dataToUpdate.TRANGTHAI !== undefined) repoUpdateData.TRANGTHAI = dataToUpdate.TRANGTHAI;

            // Xử lý thời gian nếu được cung cấp (date và time riêng từ client)
            if (dataToUpdate.date && dataToUpdate.time) {
                thoiGianBatDauMoiChoSQL = `${dataToUpdate.date} ${dataToUpdate.time}:00`;
                repoUpdateData.THOIGIAN = thoiGianBatDauMoiChoSQL;
            } else if (dataToUpdate.date && !dataToUpdate.time) { // Chỉ có date
                // Cần giờ hiện tại của existingShowtime để ghép
                const existingTime = new Date(existingShowtime.THOIGIAN).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                thoiGianBatDauMoiChoSQL = `${dataToUpdate.date} ${existingTime}`;
                repoUpdateData.THOIGIAN = thoiGianBatDauMoiChoSQL;
            } else if (!dataToUpdate.date && dataToUpdate.time) { // Chỉ có time
                const existingDate = new Date(existingShowtime.THOIGIAN).toISOString().slice(0,10);
                thoiGianBatDauMoiChoSQL = `${existingDate} ${dataToUpdate.time}:00`;
                repoUpdateData.THOIGIAN = thoiGianBatDauMoiChoSQL;
            }
            // Nếu không có date và time mới, thoiGianBatDauMoiChoSQL sẽ giữ giá trị cũ

            // Kiểm tra xung đột lịch chiếu nếu thời gian hoặc phòng thay đổi
            const phimDeCheck = dataToUpdate.MAPHIM || existingShowtime.MAPHIM;
            const phongDeCheck = dataToUpdate.MAPHONG || existingShowtime.MAPHONG;

            // Chỉ kiểm tra overlap nếu thời gian hoặc phòng thay đổi
            if (repoUpdateData.THOIGIAN || repoUpdateData.MAPHONG) {
                const movieForDuration = await movieRepository.findById(phimDeCheck);
                if (!movieForDuration || typeof movieForDuration.THOILUONG !== 'number') {
                    throw new Error(`Phim '${phimDeCheck}' không tìm thấy hoặc không có thời lượng hợp lệ.`);
                }

                const tempDateObjectForCalc = new Date(thoiGianBatDauMoiChoSQL);
                const dateObjectKetThuc = new Date(tempDateObjectForCalc.getTime() + movieForDuration.THOILUONG * 60000);
                const y = dateObjectKetThuc.getFullYear();
                const m = String(dateObjectKetThuc.getMonth() + 1).padStart(2, '0');
                const d = String(dateObjectKetThuc.getDate()).padStart(2, '0');
                const hr = String(dateObjectKetThuc.getHours()).padStart(2, '0');
                const min = String(dateObjectKetThuc.getMinutes()).padStart(2, '0');
                const sec = String(dateObjectKetThuc.getSeconds()).padStart(2, '0');
                const thoiGianKetThucMoiChoSQL = `${y}-${m}-${d} ${hr}:${min}:${sec}`;

                const isOverlapping = await showtimeRepository.checkOverlap(
                    phongDeCheck,
                    thoiGianBatDauMoiChoSQL,
                    thoiGianKetThucMoiChoSQL,
                    15, // Thời gian nghỉ giữa suất
                    maSuatChieu // Loại trừ chính suất chiếu này ra khỏi kiểm tra overlap
                );
                if (isOverlapping) {
                    const error = new Error('Xung đột lịch chiếu: Đã có suất chiếu khác trong khung giờ và phòng này.');
                    error.statusCode = 409;
                    throw error;
                }
            }

            // Nếu có vé đã bán, một số trường có thể không được phép sửa (ví dụ: MAPHIM, MAPHONG, THOIGIAN)
            // Hoặc cần cảnh báo admin. Tạm thời cho phép sửa.
            // const hasTickets = await showtimeRepository.hasSoldTickets(maSuatChieu, connection);
            // if (hasTickets && (repoUpdateData.MAPHIM || repoUpdateData.MAPHONG || repoUpdateData.THOIGIAN)) {
            //     throw new Error("Không thể thay đổi phim, phòng hoặc thời gian của suất chiếu đã có vé bán.");
            // }

            if (Object.keys(repoUpdateData).length === 0) {
                return { success: true, message: "Không có thông tin nào được thay đổi.", data: existingShowtime };
            }

            const result = await showtimeRepository.updateById(maSuatChieu, repoUpdateData);

            const updatedShowtime = await showtimeRepository.findById(maSuatChieu); // Lấy lại thông tin đã cập nhật
            return { success: true, message: `Suất chiếu ${maSuatChieu} đã được cập nhật.`, data: updatedShowtime };

        } catch (error) {
            console.error(`Error in ShowtimeService.updateShowtime for ${maSuatChieu}:`, error);
            throw error;
        } finally {
        }
    }
}
module.exports = new ShowtimeService();