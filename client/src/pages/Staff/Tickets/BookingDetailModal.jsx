// src/pages/Staff/ManageBookings/BookingDetailModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/common/Button';
import './BookingDetailModal.css';
import { getSeatLayoutForShowtimeApi } from '../../../services/seatApiService';

// --- COMPONENT HIỂN THỊ SƠ ĐỒ GHẾ ĐỘNG ---
const DynamicSeatMapDisplay = ({ seatLayoutFromApi, customerSelectedSeatIds, isLoadingLayout, layoutError }) => {
  if (isLoadingLayout) {
    return <p className="seatmap-loading-info">Đang tải sơ đồ ghế...</p>;
  }
  if (layoutError) {
    return <p className="seatmap-error-info">{layoutError}</p>;
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
    <div className="seat-map-display-container dynamic-seat-map">
      <h4>Sơ đồ ghế</h4>
      <div className="screen-indicator">MÀN HÌNH</div>
      {organizedLayout.rows.map(({ rowId, seats: seatsInRow }) => (
        <div key={rowId} className="seat-row-display">
          <span className="row-label-display" key={`${rowId}-label-start`}>{rowId}</span>
          <div className="seats-in-row-actual" key={`${rowId}-seats-container`}>
            {seatsInRow.map((seat, index) => {
              if (!seat) {
                return <div key={`empty-${rowId}-${index}`} className="seat-placeholder-display"></div>;
              }
              let seatClass = `seat-box-display ${seat.type?.toLowerCase().replace(/\s+/g, '-') || 'thuong'}`;
              
              if (customerSelectedSeatIds.has(seat.id)) {
                seatClass += ' customer-selected-seat';
              } /* else if (seat.status === 'booked') {
                seatClass += ' other-booked-seat';
              } */ else if (seat.status === 'unavailable') {
                seatClass += ' unavailable-seat';
              } else {
                seatClass += ' available-seat';
              }
              return (
                <span 
                  key={seat.id} 
                  className={seatClass} 
                  title={`Ghế ${seat.row}${seat.number} (${seat.type || 'Thường'}) - Trạng thái: ${seat.status === 'booked' ? (customerSelectedSeatIds.has(seat.id) ? 'Khách chọn' : 'Đã bán') : (seat.status === 'unavailable' ? 'Không khả dụng' : 'Còn trống')}`}
                >
                  {seat.number}
                </span>
              );
            })}
          </div>
          <span className="row-label-display" key={`${rowId}-label-end`}>{rowId}</span>
        </div>
      ))}
      <div className="seat-legend">
        <div className="legend-item"><span className="seat-box-display customer-selected-seat"></span> Ghế khách chọn (HĐ này)</div>
        <div className="legend-item"><span className="seat-box-display other-booked-seat"></span> Đã bán (HĐ khác)</div>
        <div className="legend-item"><span className="seat-box-display available-seat"></span> Còn trống</div>
        <div className="legend-item"><span className="seat-box-display unavailable-seat"></span> Không khả dụng</div>
      </div>
    </div>
  );
};

DynamicSeatMapDisplay.propTypes = {
  seatLayoutFromApi: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      row: PropTypes.string.isRequired,
      number: PropTypes.number.isRequired,
      type: PropTypes.string,
      status: PropTypes.string,
    })),
    roomId: PropTypes.string,
  }),
  customerSelectedSeatIds: PropTypes.instanceOf(Set).isRequired,
  isLoadingLayout: PropTypes.bool,
  layoutError: PropTypes.string,
};
// --- KẾT THÚC COMPONENT DynamicSeatMapDisplay ---


const BookingDetailModal = ({ isOpen, onClose, bookingDetails, isLoading: isLoadingBookingDetails }) => {
  const [seatLayout, setSeatLayout] = useState(null);
  const [isLoadingLayout, setIsLoadingLayout] = useState(false);
  const [layoutError, setLayoutError] = useState(null);

  useEffect(() => {
    const fetchLayout = async () => {
      if (isOpen && bookingDetails?.maSuatChieu) {
        setIsLoadingLayout(true);
        setLayoutError(null);
        setSeatLayout(null);
        try {
          const layoutData = await getSeatLayoutForShowtimeApi(bookingDetails.maSuatChieu);
          setSeatLayout(layoutData);
        } catch (err) {
          console.error("BookingDetailModal: Error fetching seat layout:", err);
          const errorMessage = err.response?.data?.message || err.message || "Không thể tải sơ đồ ghế. Vui lòng thử lại.";
          setLayoutError(errorMessage);
        } finally {
          setIsLoadingLayout(false);
        }
      } else if (!isOpen) {
        setSeatLayout(null);
        setLayoutError(null);
        setIsLoadingLayout(false);
      }
    };
    fetchLayout();
  }, [isOpen, bookingDetails]);

  if (!isOpen) return null;

  if (isLoadingBookingDetails || !bookingDetails) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content booking-detail-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="booking-detail-header">
            <h2 className="modal-main-title">Chi tiết vé</h2>
            <Button onClick={onClose} variant="light" size="small" className="modal-close-icon-btn">×</Button>
          </div>
          <div className="booking-detail-body" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '200px', fontSize: '1.1rem' }}>
            <p>Đang tải chi tiết hóa đơn...</p>
          </div>
        </div>
      </div>
    );
  }

  const customerSelectedSeatIds = new Set(
    bookingDetails.seatsChosen?.map(s => s.id) || []
  );

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return value.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="booking-detail-header">
          <h2 className="modal-main-title">Chi tiết vé #{bookingDetails.id}</h2>
          <Button onClick={onClose} variant="light" size="small" className="modal-close-icon-btn">×</Button>
        </div>

        <div className="booking-detail-body">
          <div className="booking-info-panel">
            <h4 className="info-section-title">Thông tin đặt vé</h4>
            <p className="info-item"><strong>Khách hàng:</strong> <span>{bookingDetails.customerName || 'N/A'}</span></p>
            <p className="info-item"><strong>SĐT:</strong> <span>{bookingDetails.customerPhone || 'N/A'}</span></p>
            <p className="info-item long-value"><strong>Phim:</strong> <span>{bookingDetails.movieTitle}</span></p>
            <p className="info-item"><strong>Phòng chiếu:</strong> <span>{bookingDetails.roomName}</span></p>
            <p className="info-item"><strong>Ngày chiếu:</strong> <span>{bookingDetails.showtimeDate}</span></p>
            <p className="info-item"><strong>Giờ chiếu:</strong> <span>{bookingDetails.showtimeTime}</span></p>
            <p className="info-item long-value"><strong>Ghế đã chọn:</strong> <span>{bookingDetails.seatsChosen?.map(s => `${s.row}${s.number}`).join(', ') || 'Chưa chọn ghế'}</span></p>

            {bookingDetails.seatsChosen && bookingDetails.seatsChosen.length > 0 && (
              <>
                <h5 className="info-subsection-title">Chi tiết vé đã đặt:</h5>
                {/* --- SỬ DỤNG CẤU TRÚC MỚI CHO CHI TIẾT VÉ --- */}
                <div className="seat-details-container">
                  {bookingDetails.seatsChosen.map((seat) => (
                    <div key={seat.id || seat.ticketId} className="seat-detail-entry">
                      <div className="seat-detail-info">
                        <span className="seat-name">Ghế {seat.row}{seat.number} ({seat.type || 'Thường'})</span>
                        {seat.ticketId && <span className="ticket-id-display">Mã vé: {seat.ticketId}</span>}
                      </div>
                      <div className="seat-detail-pricing-grid">
                        <span>Giá gốc:</span> <span>{formatCurrency(seat.basePrice)}</span>
                        <span>Phụ thu:</span> <span>{formatCurrency(seat.surcharge)}</span>
                        <span className="label-bold">Thành tiền:</span> <span className="value-bold">{formatCurrency(seat.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="info-item">
                  <strong>Tổng tiền vé:</strong>
                  <span>
                    {formatCurrency(bookingDetails.seatsChosen.reduce((acc, seat) => acc + (seat.price || 0), 0))}
                  </span>
                </p>
              </>
            )}

            {bookingDetails.concessions && bookingDetails.concessions.length > 0 && (
              <>
                <h4 className="info-section-title section-spacing-top">Sản phẩm đính kèm</h4>
                {bookingDetails.concessions.map((item, index) => (
                  <p key={item.id || `concession-${index}`} className="info-item long-value"> {/* long-value nếu tên sản phẩm có thể dài */}
                    <strong>{item.name}:</strong> 
                    <span>{item.quantity} x {formatCurrency(item.price)} = {formatCurrency(item.total)}</span>
                  </p>
                ))}
                 <p className="info-item">
                  <strong>Tổng tiền sản phẩm:</strong>
                  <span>
                    {formatCurrency(bookingDetails.concessions.reduce((acc, item) => acc + (item.total || 0), 0))}
                  </span>
                </p>
              </>
            )}
            <hr className="info-divider" />
            <p className="info-item total-amount-display">
              <strong>Tổng cộng hóa đơn:</strong>
              <span>{formatCurrency(bookingDetails.totalAmount)}</span>
            </p>
            <p className="info-item"><strong>Trạng thái:</strong> <span>{bookingDetails.paymentStatus} ({bookingDetails.paymentMethod || 'N/A'})</span></p>
            <p className="info-item"><strong>Ngày tạo:</strong> <span>{bookingDetails.creationDate}</span></p>
            <p className="info-item"><strong>Nhân viên:</strong> <span>{bookingDetails.staffName || 'N/A'}</span></p>
          </div>

          <div className="seat-map-panel">
            <DynamicSeatMapDisplay
              seatLayoutFromApi={seatLayout}
              customerSelectedSeatIds={customerSelectedSeatIds}
              isLoadingLayout={isLoadingLayout}
              layoutError={layoutError}
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
    id: PropTypes.string,
    movieTitle: PropTypes.string,
    roomName: PropTypes.string,
    showtimeDate: PropTypes.string,
    showtimeTime: PropTypes.string,
    customerName: PropTypes.string,
    customerPhone: PropTypes.string,
    seatsChosen: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      ticketId: PropTypes.string,
      row: PropTypes.string.isRequired,
      number: PropTypes.number.isRequired,
      type: PropTypes.string,
      price: PropTypes.number,
      basePrice: PropTypes.number,
      surcharge: PropTypes.number,
    })),
    totalAmount: PropTypes.number,
    paymentStatus: PropTypes.string,
    paymentMethod: PropTypes.string,
    creationDate: PropTypes.string,
    staffName: PropTypes.string,
    concessions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        quantity: PropTypes.number,
        price: PropTypes.number,
        total: PropTypes.number,
    })),
    roomId: PropTypes.string,
    maSuatChieu: PropTypes.string.isRequired,
  }),
  isLoading: PropTypes.bool,
};

export default BookingDetailModal;