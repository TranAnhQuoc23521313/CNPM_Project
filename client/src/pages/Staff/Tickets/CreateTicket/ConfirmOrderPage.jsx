// src/pages/Staff/Tickets/CreateTicket/ConfirmOrderPage.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../../components/common/Button';
import './CreateTicketWorkflow.css';
import './ConfirmOrderPage.css';

const STAFF_BASE_PATH = "/staff";

const ConfirmOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    movieId,
    movieTitle,
    showtimeId,
    showtimeDetails,
    selectedSeats = [],
    totalSeatPrice = 0, // Nhận giá trị, mặc định là 0
    concessions = [],
    totalConcessionsPrice = 0,
    customerInfo,
  } = location.state || {};

  const finalTotalAmount = totalSeatPrice + totalConcessionsPrice;

  useEffect(() => {
    if (!movieId || !showtimeId || selectedSeats.length === 0 || !movieTitle || !showtimeDetails || totalSeatPrice === undefined) {
      console.warn("ConfirmOrderPage: Thiếu thông tin cần thiết (bao gồm totalSeatPrice), điều hướng về chọn phim.");
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`, { replace: true });
    }
  }, [movieId, showtimeId, selectedSeats, movieTitle, showtimeDetails, totalSeatPrice, navigate]);

  const handleConfirmAndPay = () => {
    const orderPayload = {
      movieId,
      movieTitle,
      showtimeId,
      showtimeDetails,
      selectedSeats, // selectedSeats giờ đây là mảng các object ghế có giá
      totalSeatPrice,
      concessions,
      totalConcessionsPrice,
      customerInfo,
      finalTotalAmount,
      paymentMethod: 'CASH', // Ví dụ
    };

    console.log('Order confirmed, payload to API:', orderPayload);
    alert(`Đã tạo vé thành công! Tổng tiền: ${finalTotalAmount.toLocaleString('vi-VN')} đ`);
    navigate(`${STAFF_BASE_PATH}/tickets`, { replace: true });
  };

  if (!movieTitle || !showtimeDetails || selectedSeats.length === 0 || totalSeatPrice === undefined) {
    return <div className="create-ticket-step confirm-order-step"><p>Đang tải thông tin đơn hàng...</p></div>;
  }

  return (
    <div className="create-ticket-step confirm-order-step">
      <div className="confirm-order-card">
        <div className="card-header">
          <h2 className="page-main-title">Xác Nhận Đơn Hàng & Thanh Toán</h2>
        </div>
        <div className="card-body">
          <section className="order-summary-section">
            <h3>Chi Tiết Vé</h3>
            <p><strong>Phim:</strong> {movieTitle}</p>
            <p>
              <strong>Suất chiếu:</strong>
              {showtimeDetails.date} - {showtimeDetails.time}
              (Phòng: {showtimeDetails.room || 'N/A'})
            </p>
            <p><strong>Ghế đã chọn ({selectedSeats.length}):</strong> {selectedSeats.map(s => s.label || `${s.row}${s.number}`).join(', ')}</p>
            <p><strong>Tổng tiền vé:</strong> {totalSeatPrice.toLocaleString('vi-VN')} đ</p>
          </section>

          {concessions.length > 0 && (
            <section className="order-summary-section">
              <h3>Sản phẩm đã chọn</h3>
              <ul>
                {concessions.map(item => (
                  <li key={item.id}>
                    {item.name} (x{item.quantity}) - {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                  </li>
                ))}
              </ul>
              <p><strong>Tổng tiền sản phẩm:</strong> {totalConcessionsPrice.toLocaleString('vi-VN')} đ</p>
            </section>
          )}

          {customerInfo && (customerInfo.name || customerInfo.phone || customerInfo.email) && (
            <section className="order-summary-section">
              <h3>Thông Tin Khách Hàng</h3>
              {customerInfo.name && <p><strong>Tên:</strong> {customerInfo.name}</p>}
              {customerInfo.phone && <p><strong>SĐT:</strong> {customerInfo.phone}</p>}
              {customerInfo.email && <p><strong>Email:</strong> {customerInfo.email}</p>}
              {customerInfo.type === 'member' && customerInfo.memberDetails && (
                <p><strong>Thành viên:</strong> Có (Mã: {customerInfo.memberDetails.id})</p>
              )}
            </section>
          )}

          <div className="final-total-section">
            <h3><strong>TỔNG CỘNG: {finalTotalAmount.toLocaleString('vi-VN')} đ</strong></h3>
          </div>

          <div className="payment-methods-section">
            <h4>Chọn phương thức thanh toán:</h4>
            <div className="payment-placeholder">
              <Button variant="secondary" size="medium" className="payment-option-btn">Tiền mặt</Button>
              <Button variant="light" size="medium" className="payment-option-btn" disabled>Thẻ (Sắp có)</Button>
              <Button variant="light" size="medium" className="payment-option-btn" disabled>Ví điện tử (Sắp có)</Button>
            </div>
          </div>
        </div>

        <div className="card-footer workflow-actions">
          <Button onClick={() => navigate(-1)} variant="light" size="medium">Quay lại</Button>
          <Button variant="primary" size="large" onClick={handleConfirmAndPay} className="confirm-pay-btn">
            Hoàn Tất & Thanh Toán
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrderPage;