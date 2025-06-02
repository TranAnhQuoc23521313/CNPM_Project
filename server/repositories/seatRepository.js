// server/repositories/seatRepository.js
const pool = require('../config/db');

class SeatRepository {
    async getSeatLayoutForShowtime(maSuatChieu) {
        // Bước 1: Lấy thông tin cơ bản của suất chiếu (MAPHONG, GIASUATCHIEU gốc)
        const [showtimeInfoRows] = await pool.query(
            'SELECT MAPHONG, GIASUATCHIEU FROM SUATCHIEU WHERE MASUATCHIEU = ?',
            [maSuatChieu]
        );
        if (showtimeInfoRows.length === 0) {
            const error = new Error(`Suất chiếu ${maSuatChieu} không tồn tại.`);
            error.statusCode = 404;
            throw error;
        }
        const { MAPHONG, GIASUATCHIEU: basePricePerSeat } = showtimeInfoRows[0];

        // Bước 2: Lấy tất cả ghế của phòng chiếu đó, cùng với GIAGHE (phụ thu) và TRANGTHAIGHE
        const seatsSql = `
            SELECT
                gn.MAGHE, gn.MAPHONG, gn.DAYGHE, gn.VITRIGHE, gn.LOAIGHE,
                gn.GIAGHE,      -- Đây là phụ thu của ghế
                gn.TRANGTHAIGHE -- Ví dụ: 'Hoạt động', 'Hỏng'
            FROM GHENGOI gn
            WHERE gn.MAPHONG = ?
            ORDER BY gn.DAYGHE, gn.VITRIGHE;
        `;
        const [allSeatsInRoom] = await pool.query(seatsSql, [MAPHONG]);

        // Bước 3: Lấy danh sách các ghế đã được đặt cho suất chiếu này từ bảng VE
        const [bookedSeats] = await pool.query(
            'SELECT MAGHE FROM VE WHERE MASUATCHIEU = ? AND TRANGTHAIVE != ?',
            [maSuatChieu, 'Đã hủy'] // Chỉ coi ghế là đã đặt nếu vé không bị hủy
        );
        const bookedSeatIds = new Set(bookedSeats.map(bs => bs.MAGHE));

        // Bước 4: Kết hợp thông tin
        const seatsWithStatus = allSeatsInRoom.map(seat => {
            const isBooked = bookedSeatIds.has(seat.MAGHE);
            const surcharge = seat.GIAGHE || 0; // Phụ thu của ghế (GIAGHE từ bảng GHENGOI)
            const totalPrice = basePricePerSeat + surcharge; // Giá cuối cùng của ghế này

            let currentStatus = 'available';
            if (isBooked) {
                currentStatus = 'booked';
            } else if (seat.TRANGTHAIGHE && seat.TRANGTHAIGHE.toLowerCase() !== 'hoạt động') {
                // Nếu TRANGTHAIGHE không phải 'Hoạt động' (ví dụ: 'Hỏng') thì là 'unavailable'
                currentStatus = 'unavailable';
            }

            return {
                id: seat.MAGHE,
                roomId: seat.MAPHONG,
                row: seat.DAYGHE,
                number: seat.VITRIGHE,
                type: seat.LOAIGHE,
                status: currentStatus,
                basePricePerSeat: basePricePerSeat, // Giá gốc của suất chiếu
                surcharge: surcharge,               // Phụ thu của loại ghế
                totalPrice: totalPrice              // Giá cuối cùng
            };
        });
        return { data: seatsWithStatus, roomId: MAPHONG, showtimeBasePrice: basePricePerSeat };
    }
}
module.exports = new SeatRepository();