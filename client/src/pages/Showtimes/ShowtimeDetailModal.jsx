import React, { useState, useEffect } from 'react';
import './ShowtimeDetailModal.css'; // CSS riêng cho modal này

// --- Dữ liệu giả lập ghế (giữ nguyên hoặc thay bằng fetch API) ---
const generateSeatLayoutForDisplay = (rows = 8, cols = 16) => {
  const layout = [];
  const rowChars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  for (let i = 0; i < rows; i++) {
    for (let j = 1; j <= cols; j++) {
      layout.push({
        id: `${rowChars[i]}${j}`, row: rowChars[i], number: j,
        status: Math.random() < 0.25 ? 'booked' : 'available',
      });
    }
  } return layout;
};
// --- Kết thúc dữ liệu giả lập ghế ---

const ShowtimeDetailModal = ({ movie, showtimeIdFromParent, onClose }) => {
  // Tìm suất chiếu ban đầu dựa trên ID được truyền vào
  const findInitialShowtime = () => {
    if (!movie || !movie.showtimes) return null; // Thêm kiểm tra movie và showtimes
    if (showtimeIdFromParent) {
      return movie.showtimes.find(st => st.id === showtimeIdFromParent) || movie.showtimes[0];
    }
    return movie.showtimes.length > 0 ? movie.showtimes[0] : null;
  };

  const [activeShowtime, setActiveShowtime] = useState(null); // Khởi tạo là null
  const [seats, setSeats] = useState([]);

  // Effect để set activeShowtime ban đầu và khi props thay đổi
  useEffect(() => {
    setActiveShowtime(findInitialShowtime());
  }, [movie, showtimeIdFromParent]);

  // Effect để tạo layout ghế khi activeShowtime thay đổi
  useEffect(() => {
    if (activeShowtime) {
      const newSeatLayout = generateSeatLayoutForDisplay();
      setSeats(newSeatLayout);
    } else {
      setSeats([]); // Reset ghế nếu không có activeShowtime
    }
  }, [activeShowtime]);

  // Nếu chưa có activeShowtime (có thể đang load hoặc lỗi), hiển thị loading/thông báo
  if (!activeShowtime) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content showtime-detail-modal">
          <div className="modal-header">
            <h1>Loading Showtime Details...</h1>
            <button className="modal-close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-body-columns">
            <p>Loading details or showtime not found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Hàm xử lý khi click vào một slot thời gian khác (cùng ngày, cùng phòng)
  const handleTimeSlotClick = (showtimeSlot) => {
    setActiveShowtime(showtimeSlot); // Chỉ cần cập nhật activeShowtime
  };

  const totalSeats = seats.length;
  const bookedSeatsCount = seats.filter(s => s.status === 'booked').length;
  const availableSeatsCount = totalSeats - bookedSeatsCount;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content showtime-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h1>Chi tiết suất chiếu</h1>
           <button className="modal-close-button" onClick={onClose}>×</button> {/* Thêm nút đóng ở header */}
        </div>

        <div className="modal-body-columns">
          {/* Cột trái: Chi tiết */}
          <div className="showtime-info-column">
            <div className="info-group">
              <label>Tên phim</label>
              <p>{movie?.title || 'N/A'}</p> {/* Thêm kiểm tra movie tồn tại */}
            </div>
            <div className="info-group">
              <label>Ngày chiếu</label>
              <p>{activeShowtime.date}</p>
            </div>
            <div className="info-group">
              <label>Phòng chiếu</label>
              <p>{activeShowtime.screen}</p>
            </div>
            <div className="info-group">
              <label>Giá vé</label>
              <p>{activeShowtime.price?.toLocaleString() || 'N/A'} <a href="#" onClick={(e) => e.preventDefault()}>Thay đổi</a></p>
            </div>
            <div className="info-group">
              <label>Các suất chiếu</label>
              <div className="time-slots-container">
                {movie?.showtimes // Thêm kiểm tra movie tồn tại
                  ?.filter(st => st.date === activeShowtime.date && st.screen === activeShowtime.screen)
                  ?.map(slot => (
                  <button
                    key={slot.id}
                    className={`time-slot-btn ${activeShowtime.id === slot.id ? 'active' : ''}`}
                    onClick={() => handleTimeSlotClick(slot)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-actions-left">
              <button className="delete-btn" onClick={() => alert(`Xóa suất chiếu ID: ${activeShowtime.id}`)}>Xoá</button>
              <button className="exit-btn" onClick={onClose}>Thoát</button>
            </div>
          </div>

          {/* Cột phải: Ghế */}
          <div className="seat-map-column">
            <h2>Danh sách ghế</h2>
            <div className="seat-stats">
              <span>Tổng số ghế: {totalSeats}</span>
              <span>Đã đặt: {bookedSeatsCount}</span>
              <span>Còn trống: {availableSeatsCount}</span>
            </div>
            <div className="seat-grid-container">
              {seats.map(seat => (
                <div
                  key={seat.id}
                  className={`seat-item seat-${seat.status}`}
                  // Không cần onClick ở đây vì chỉ xem
                >
                  {seat.id}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeDetailModal; // QUAN TRỌNG: Export default