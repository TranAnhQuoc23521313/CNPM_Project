// src/pages/Staff/ManageBookings/BookingDetailModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/common/Button';
import './BookingDetailModal.css';

// --- COMPONENT HIỂN THỊ SƠ ĐỒ GHẾ (GẦN VỚI BAN ĐẦU) ---
const SeatMapDisplay = ({ seatsSelectedByCustomer, allSeatsLayout }) => {
  // Kiểm tra cơ bản dữ liệu đầu vào
  if (!allSeatsLayout || !allSeatsLayout.rows || allSeatsLayout.rows.length === 0 || !allSeatsLayout.seatsPerRow) {
    return <p className="no-seatmap-info">Không có thông tin sơ đồ ghế.</p>;
  }

  // Tạo một Set để kiểm tra ghế đã chọn của khách hàng này nhanh hơn
  const customerSelectedSeatsSet = new Set(
    (seatsSelectedByCustomer || []).map(seat => `${seat.row}${seat.number}`)
  );

  return (
    <div className="seat-map-display-container"> {/* Class này có thể giữ lại hoặc đổi nếu CSS gốc của bạn khác */}
      <h4>Sơ đồ ghế</h4> {/* Tiêu đề này có trong CSS bạn gửi lần trước */}
      <div className="screen-indicator">MÀN HÌNH</div> {/* Quay lại class gốc */}
      {/* Lặp qua các hàng trong layout */}
      {allSeatsLayout.rows.map(rowLabel => (
        <div key={rowLabel} className="seat-row-display"> {/* Quay lại class gốc */}
          <span className="row-label-display">{rowLabel}</span> {/* Nhãn hàng ghế (A, B, C...) */}
          {/* Tạo các ô ghế cho mỗi hàng */}
          {[...Array(allSeatsLayout.seatsPerRow)].map((_, seatIndex) => {
            const seatNumber = seatIndex + 1;
            const seatId = `${rowLabel}${seatNumber}`;
            const isCustomerSeat = customerSelectedSeatsSet.has(seatId);

            // Xác định class cho ghế dựa trên trạng thái
            let seatClass = 'seat-box-display'; // Class cơ bản
            if (isCustomerSeat) {
              seatClass += ' customer-selected-seat'; // Ghế của khách hàng này
            } else {
              // Giả sử các ghế khác không thuộc đơn hàng này là "ghế khác" (màu xám)
              // Trong một hệ thống đầy đủ, bạn sẽ có thêm trạng thái 'sold' cho ghế người khác đã mua
              // hoặc 'unavailable' cho ghế hỏng, lối đi...
              seatClass += ' other-seat-gray';
            }
            // Bạn có thể thêm logic cho ghế VIP ở đây nếu allSeatsLayout có thông tin đó
            // if (allSeatsLayout.vipSeats?.some(s => s.row === rowLabel && s.number === seatNumber)) {
            //   seatClass += ' vip-seat-display'; // Cần class CSS cho vip-seat-display
            // }

            return (
              <span key={seatId} className={seatClass} title={`Ghế ${seatId}`}>
                {seatNumber} {/* Chỉ hiển thị số ghế */}
              </span>
            );
          })}
        </div>
      ))}
      {/* Chú thích ghế */}
      <div className="seat-legend"> {/* Quay lại class gốc */}
        <div className="legend-item">
          <span className="seat-box-display customer-selected-seat"></span> Ghế khách chọn
        </div>
        <div className="legend-item">
          <span className="seat-box-display other-seat-gray"></span> Ghế khác
        </div>
        {/* Thêm chú thích cho VIP nếu có */}
        {/* <div className="legend-item"><span className="seat-box-display vip-seat-display"></span> Ghế VIP</div> */}
      </div>
    </div>
  );
};

SeatMapDisplay.propTypes = {
  seatsSelectedByCustomer: PropTypes.arrayOf(
    PropTypes.shape({
      row: PropTypes.string.isRequired,
      number: PropTypes.number.isRequired,
    })
  ),
  allSeatsLayout: PropTypes.shape({
    rows: PropTypes.arrayOf(PropTypes.string).isRequired,
    seatsPerRow: PropTypes.number.isRequired,
    // vipSeats: PropTypes.array, // Thêm nếu bạn có dữ liệu ghế VIP
  }),
};
// --- KẾT THÚC COMPONENT SEATMAPDISPLAY ---


const BookingDetailModal = ({ isOpen, onClose, bookingDetails }) => {
  if (!isOpen || !bookingDetails) {
    return null;
  }

  // Dữ liệu layout phòng chiếu (NÊN lấy từ API hoặc cấu hình dựa trên phòng chiếu của bookingDetails.screen)
  const mockFullSeatLayout = {
    rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], // Ví dụ 8 hàng
    seatsPerRow: 10,                               // Ví dụ 10 ghế mỗi hàng (GIỐNG HÌNH 2)
    // vipSeats: [{row: 'G', number: 5}, {row: 'G', number: 6}],
  };

  // Tách ngày và giờ
  let showtimeDate = 'N/A';
  let showtimeTime = 'N/A';
  if (bookingDetails.showtime && typeof bookingDetails.showtime === 'string') {
    const parts = bookingDetails.showtime.trim().split(' ');
    if (parts.length >= 2) {
      showtimeDate = parts[0];
      showtimeTime = parts.slice(1).join(' ');
    } else if (parts.length === 1 && parts[0] !== "") {
      showtimeDate = parts[0];
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="booking-detail-header">
          <h2 className="modal-main-title">Chi tiết vé</h2>
          <Button onClick={onClose} variant="light" size="small" className="modal-close-icon-btn">×</Button>
        </div>

        <div className="booking-detail-body">
          <div className="booking-info-panel">
            <h4 className="info-section-title">Thông tin đặt vé</h4>
            <p className="info-item"><strong>Mã vé:</strong> <span>{bookingDetails.id || 'N/A'}</span></p>
            <p className="info-item"><strong>Khách hàng:</strong> <span>{bookingDetails.customerName || 'Khách vãng lai'}</span></p>
            <p className="info-item"><strong>SĐT:</strong> <span>{bookingDetails.customerPhone || 'N/A'}</span></p>
            <p className="info-item"><strong>Phim:</strong> <span>{bookingDetails.movieTitle || 'N/A'}</span></p>
            <p className="info-item"><strong>Phòng chiếu:</strong> <span>{bookingDetails.screen || 'N/A'}</span></p>
            <p className="info-item"><strong>Ngày chiếu:</strong> <span>{showtimeDate}</span></p>
            <p className="info-item"><strong>Giờ chiếu:</strong> <span>{showtimeTime}</span></p>
            <p className="info-item"><strong>Ghế:</strong> <span>{bookingDetails.seats?.map(s => `${s.row}${s.number}`).join(', ') || 'N/A'}</span></p>

            {bookingDetails.services && bookingDetails.services.length > 0 && (
              <>
                <h4 className="info-section-title section-spacing-top">Dịch vụ kèm theo</h4>
                {bookingDetails.services.map((service, index) => (
                  <p key={index} className="info-item">
                    <strong>{service.name}:</strong> <span>{service.quantity} x {service.price?.toLocaleString('vi-VN')} đ</span>
                  </p>
                ))}
              </>
            )}
            <p className="info-item section-spacing-top"><strong>Khuyến mãi:</strong> <span>{bookingDetails.promotion || 'Không có'}</span></p>
            <hr className="info-divider"/>
            <p className="info-item total-amount-display">
                <strong>Tổng cộng:</strong>
                <span>{bookingDetails.totalAmount?.toLocaleString('vi-VN')} đ</span>
            </p>
            <p className="info-item"><strong>Thanh toán:</strong> <span>{bookingDetails.paymentStatus || 'N/A'}</span></p>
          </div>

          <div className="seat-map-panel">
            <SeatMapDisplay
                seatsSelectedByCustomer={bookingDetails.seats || []}
                allSeatsLayout={mockFullSeatLayout}
            />
          </div>
        </div>

        <div className="booking-detail-footer">
          <Button variant="secondary" onClick={onClose} size="medium">Đóng</Button>
        </div>
      </div>
    </div>
  );
};

BookingDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingDetails: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    customerName: PropTypes.string,
    customerPhone: PropTypes.string,
    movieTitle: PropTypes.string,
    screen: PropTypes.string,
    showtime: PropTypes.string,
    seats: PropTypes.arrayOf(PropTypes.shape({
        row: PropTypes.string,
        number: PropTypes.number,
    })),
    services: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        quantity: PropTypes.number,
        price: PropTypes.number,
    })),
    promotion: PropTypes.string,
    totalAmount: PropTypes.number,
    paymentStatus: PropTypes.string,
  }),
};

export default BookingDetailModal;