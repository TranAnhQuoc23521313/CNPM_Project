import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // <<< THÊM DÒNG NÀY
import PropTypes from 'prop-types';
import './ShowtimeDetailModal.css'; // Đảm bảo import file CSS đã cập nhật
import { getSeatLayoutForShowtimeApi } from '../../../services/seatApiService';
import { deleteShowtimeApi } from '../../../services/showtimeApiService';

// --- COMPONENT DynamicSeatMapDisplayForAdmin (Không thay đổi) ---
const DynamicSeatMapDisplayForAdmin = ({ seatLayoutFromApi, isLoading, error }) => {
  if (isLoading) {
    return <p className="seatmap-loading-info">Đang tải sơ đồ ghế...</p>;
  }
  if (error) {
    return <p className="seatmap-error-info">{error}</p>;
  }
  if (!seatLayoutFromApi || !seatLayoutFromApi.data || seatLayoutFromApi.data.length === 0) {
    return <p className="no-seatmap-info">Không có thông tin sơ đồ ghế cho suất chiếu này.</p>;
  }

  const organizedLayout = { rows: [], maxCols: 0 };
  const tempLayout = {};
  seatLayoutFromApi.data.forEach(seat => {
    if (!tempLayout[seat.row]) {
      tempLayout[seat.row] = [];
    }
    tempLayout[seat.row][seat.number - 1] = seat;
    if (seat.number > organizedLayout.maxCols) {
      organizedLayout.maxCols = seat.number;
    }
  });

  const sortedRowKeys = Object.keys(tempLayout).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  organizedLayout.rows = sortedRowKeys.map(rowKey => {
    const rowSeats = [];
    for (let i = 0; i < organizedLayout.maxCols; i++) {
      rowSeats.push(tempLayout[rowKey][i] || null);
    }
    return { rowId: rowKey, seats: rowSeats };
  });

  return (
    <div className="dynamic-seat-map-admin">
      <div className="screen-indicator">MÀN HÌNH</div>
      {organizedLayout.rows.map(({ rowId, seats: seatsInRow }) => (
        <div key={rowId} className="seat-row-display">
          <span className="row-label-display">{rowId}</span>
          <div className="seats-in-row-actual">
            {seatsInRow.map((seat, index) => {
              if (!seat) {
                return <div key={`empty-${rowId}-${index}`} className="seat-placeholder-display"></div>;
              }
              let seatClass = `seat-item seat-${seat.status} ${seat.type?.toLowerCase() || 'thuong'}`;
              return (
                <div
                  key={seat.id}
                  className={seatClass}
                  title={`Ghế ${seat.row}${seat.number} (${seat.type}) - ${seat.status}`}
                >
                  {seat.number}
                </div>
              );
            })}
          </div>
          <span className="row-label-display">{rowId}</span>
        </div>
      ))}
      <div className="seat-legend">
        <div className="legend-item"><span className="seat-item available"></span> Còn trống</div>
        <div className="legend-item"><span className="seat-item booked"></span> Đã đặt</div>
        <div className="legend-item"><span className="seat-item unavailable"></span> Không khả dụng</div>
      </div>
    </div>
  );
};
// --- Kết thúc DynamicSeatMapDisplayForAdmin ---


// --- COMPONENT Hộp thoại xác nhận xóa (Sử dụng Portal) ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, message, isDeleting }) => {
    // Nếu không mở, không render gì cả
    if (!isOpen) return null;

    // Sử dụng Portal để render modal ở cấp cao nhất của DOM
    return ReactDOM.createPortal(
        <div className="confirm-delete-modal-overlay" onClick={onClose}>
            {/* Phần nội dung của modal */}
            <div className="confirm-delete-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Xác Nhận Xoá</h3>
                <p>{message}</p>
                <div className="confirm-delete-modal-actions">
                    <button onClick={onClose} disabled={isDeleting} className="btn-cancel">
                        Hủy
                    </button>
                    <button onClick={onConfirm} disabled={isDeleting} className="btn-confirm-delete">
                        {isDeleting ? 'Đang xóa...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>,
        document.body // Đích đến của Portal là thẻ body
    );
};

ConfirmDeleteModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    isDeleting: PropTypes.bool
};
// --- Kết thúc component xác nhận xóa ---


const ShowtimeDetailModal = ({ movie, showtime, onClose, onShowtimeDeleted, onOpenEditModal }) => {
  const [activeShowtime, setActiveShowtime] = useState(showtime);
  const [seatLayoutData, setSeatLayoutData] = useState(null);
  const [isLoadingSeatLayout, setIsLoadingSeatLayout] = useState(false);
  const [seatLayoutError, setSeatLayoutError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setActiveShowtime(showtime);
  }, [showtime]);

  const handleInitiateDelete = () => {
    if (!activeShowtime || !activeShowtime.id) return;
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!activeShowtime || !activeShowtime.id) return;
    
    setIsDeleting(true);
    try {
      await deleteShowtimeApi(activeShowtime.id);
      if (onShowtimeDeleted) {
        onShowtimeDeleted(activeShowtime.id, movie?.id || activeShowtime.movieId);
      }
      onClose();
    } catch (err) {
      console.error("ShowtimeDetailModal: Lỗi xóa suất chiếu:", err);
      setSeatLayoutError(err.message || "Không thể xóa suất chiếu. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  useEffect(() => {
    const fetchLayout = async () => {
      if (activeShowtime && activeShowtime.id) {
        setIsLoadingSeatLayout(true);
        setSeatLayoutError(null);
        setSeatLayoutData(null);
        try {
          const layoutData = await getSeatLayoutForShowtimeApi(activeShowtime.id);
          setSeatLayoutData(layoutData);
        } catch (err) {
          console.error("ShowtimeDetailModal: Lỗi tải sơ đồ ghế:", err);
          setSeatLayoutError(err.message || "Không thể tải sơ đồ ghế.");
        } finally {
          setIsLoadingSeatLayout(false);
        }
      } else {
        setSeatLayoutData(null);
      }
    };
    if(activeShowtime?.id) fetchLayout();
  }, [activeShowtime]);


  const handleTimeSlotClick = (showtimeSlot) => {
    const fullShowtimeSlot = movie?.showtimes?.find(st => st.id === showtimeSlot.id) || showtimeSlot;
    if (fullShowtimeSlot && fullShowtimeSlot.id !== activeShowtime.id) {
        setActiveShowtime(fullShowtimeSlot);
    }
  };

  if (!activeShowtime) {
    return (
      <div className="showtime-detail-modal-overlay" onClick={onClose}>
        <div className="showtime-detail-modal-content">
          <div className="showtime-detail-modal-header"><h1>Chi tiết suất chiếu</h1><button className="showtime-detail-modal-close-button" onClick={onClose}>×</button></div>
          <div style={{padding: "20px", textAlign: "center"}}>Không có thông tin suất chiếu để hiển thị.</div>
        </div>
      </div>
    );
  }

  const displayMovieTitle = movie?.title || activeShowtime?.movieTitle || 'N/A';
  const displayDate = activeShowtime.date || 'N/A';
  const displayTime = activeShowtime.time || 'N/A';

  let totalSeats = 0;
  let bookedSeatsCount = 0;
  if (seatLayoutData && seatLayoutData.data) {
    totalSeats = seatLayoutData.data.length;
    bookedSeatsCount = seatLayoutData.data.filter(s => s.status === 'booked').length;
  }
  const availableSeatsCount = totalSeats - bookedSeatsCount;


  return (
    <>
      <div className="showtime-detail-modal-overlay" onClick={onClose}>
        <div className="showtime-detail-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="showtime-detail-modal-header">
            <h1>Chi tiết suất chiếu</h1>
            <button className="showtime-detail-modal-close-button" onClick={onClose}>×</button>
          </div>

          <div className="showtime-detail-modal-body">
            <div className="showtime-detail-info-pane">
              <div className="info-section-scrollable">
                  <div className="info-block">
                      <span className="info-label">Tên phim</span>
                      <span className="info-value">{displayMovieTitle}</span>
                  </div>
                  <div className="info-block">
                      <span className="info-label">Ngày chiếu</span>
                      <span className="info-value">{displayDate}</span>
                  </div>
                  <div className="info-block">
                      <span className="info-label">Phòng chiếu</span>
                      <span className="info-value">{activeShowtime.screenName || activeShowtime.screen}</span>
                  </div>
                  <div className="info-block">
                      <span className="info-label">Giờ chiếu hiện tại</span>
                      <span className="info-value highlight"><strong>{displayTime}</strong></span>
                  </div>
                  <div className="info-block">
                      <span className="info-label">Giá vé cơ bản</span>
                      <span className="info-value">{activeShowtime.price?.toLocaleString() || 'N/A'} đ</span>
                  </div>
                  <div className="info-block">
                      <span className="info-label">Trạng thái suất</span>
                      <span className="info-value">{activeShowtime.status}</span>
                  </div>

                  {movie?.showtimes && movie.showtimes.filter(st => st.date === activeShowtime.date && (st.screenName || st.screen) === (activeShowtime.screenName || activeShowtime.screen)).length > 1 && (
                  <div className="info-block">
                      <span className="info-label">Các giờ chiếu khác cùng ngày, cùng phòng</span>
                      <div className="time-slots-container">
                      {movie.showtimes
                          .filter(st => st.date === activeShowtime.date && (st.screenName || st.screen) === (activeShowtime.screenName || activeShowtime.screen))
                          .sort((a, b) => {
                              const timeA = new Date(`1970/01/01 ${a.time.replace(/ (AM|PM)/, '')}`);
                              const timeB = new Date(`1970/01/01 ${b.time.replace(/ (AM|PM)/, '')}`);
                              return timeA - timeB;
                          })
                          .map(slot => (
                          <button
                              key={slot.id}
                              className={`time-slot-btn ${activeShowtime.id === slot.id ? 'active' : ''}`}
                              onClick={() => handleTimeSlotClick(slot)}
                              disabled={activeShowtime.id === slot.id || isLoadingSeatLayout}
                          >
                              {slot.time}
                          </button>
                          ))}
                      </div>
                  </div>
                  )}
              </div>

              <div className="showtime-detail-actions">
                <button
                  className="btn-edit-detail"
                  onClick={() => onOpenEditModal(activeShowtime)}
                  disabled={isDeleting || isLoadingSeatLayout}
                >
                  Sửa Thông Tin
                </button>
                <button
                  className="btn-delete-detail"
                  onClick={handleInitiateDelete}
                  disabled={isDeleting || isLoadingSeatLayout}
                >
                  {isDeleting ? "Đang xử lý..." : "Xoá Suất Chiếu"}
                </button>
                <button className="btn-close-detail" onClick={onClose} disabled={isDeleting}>Thoát</button>
              </div>
            </div>

            <div className="showtime-detail-seatmap-pane">
              <h2 className="seatmap-title">Sơ đồ ghế phòng: {activeShowtime.screenName || activeShowtime.screen}</h2>
              <div className="seatmap-stats">
                <span>Tổng: {totalSeats}</span>
                <span>Đã đặt: {bookedSeatsCount}</span>
                <span>Còn trống: {availableSeatsCount}</span>
                {seatLayoutData?.roomId && <span>(Mã phòng: {seatLayoutData.roomId})</span>}
              </div>
              <DynamicSeatMapDisplayForAdmin
                seatLayoutFromApi={seatLayoutData}
                isLoading={isLoadingSeatLayout}
                error={seatLayoutError}
              />
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmDeleteModal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        message={`Bạn có chắc chắn muốn xóa suất chiếu lúc ${displayTime} ngày ${displayDate} của phim "${displayMovieTitle}"? Hành động này không thể hoàn tác.`}
      />
    </>
  );
};

ShowtimeDetailModal.propTypes = {
  movie: PropTypes.object,
  showtime: PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string,
    time: PropTypes.string,
    screen: PropTypes.string,
    screenName: PropTypes.string,
    price: PropTypes.number,
    status: PropTypes.string,
    movieId: PropTypes.string,
    movieTitle: PropTypes.string,
    rawDateTime: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onShowtimeDeleted: PropTypes.func,
  onOpenEditModal: PropTypes.func.isRequired,
};

export default ShowtimeDetailModal;