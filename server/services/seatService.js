// server/services/seatService.js
const SeatRepository = require('../repositories/seatRepository');

class SeatService {
    async getSeatLayoutForShowtime(maSuatChieu) {
        try {
            // Repository đã trả về đúng định dạng client cần
            return await SeatRepository.getSeatLayoutForShowtime(maSuatChieu);
        } catch (error) {
            console.error(`Error in SeatService.getSeatLayoutForShowtime for ${maSuatChieu}:`, error);
            throw error;
        }
    }
}
module.exports = new SeatService();