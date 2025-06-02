// server/controllers/seatController.js
const SeatService = require('../services/seatService');

class SeatController {
    async getSeatLayoutForShowtime(req, res, next) {
        try {
            const maSuatChieu = req.params.showtimeId;
            if (!maSuatChieu) {
                return res.status(400).json({ message: "Mã suất chiếu là bắt buộc." });
            }
            const seatLayout = await SeatService.getSeatLayoutForShowtime(maSuatChieu);
            res.status(200).json(seatLayout); // Trả về { data: seatsWithStatus, roomId }
        } catch (error) {
            console.error(`SeatController.getSeatLayoutForShowtime for ${req.params.showtimeId} error:`, error);
            next(error);
        }
    }
}
module.exports = new SeatController();