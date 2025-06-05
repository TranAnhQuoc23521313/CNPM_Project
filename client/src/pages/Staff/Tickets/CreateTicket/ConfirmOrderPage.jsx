// src/pages/Staff/Tickets/CreateTicket/ConfirmOrderPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../../components/common/Button';
import './CreateTicketWorkflow.css';
import './ConfirmOrderPage.css';
import { createOrderApi } from '../../../../services/orderApiService'; // API Service mới

import SuccessMessageModal from '../../../../components/common/SuccessMessageModal'; // THÊM IMPORT
import ErrorMessageModal from '../../../../components/common/ErrorMessageModal';   // THÊM IMPORT

const STAFF_BASE_PATH = "/staff";

const ConfirmOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingNavigation, setPendingNavigation] = useState(null);


  const {
    movieId, // Không dùng trực tiếp trong payload nhưng để kiểm tra
    movieTitle,
    showtimeId,
    selectedShowtime, // Đổi tên từ showtimeDetails -> selectedShowtime cho nhất quán từ trang chọn suất chiếu
    selectedSeats = [],
    totalSeatPrice = 0,
    concessions = [],
    totalConcessionsPrice = 0,
    customerInfo, // Có thể null, hoặc object { MaKH, type, name, phone, email }
    roomId, // Mã phòng từ bước chọn ghế
  } = location.state || {};

  const finalTotalAmount = totalSeatPrice + totalConcessionsPrice;

  useEffect(() => {
    // selectedShowtime chứa thông tin chi tiết của suất chiếu (date, time, screen/room, price gốc)
    if (!movieId || !showtimeId || selectedSeats.length === 0 || !movieTitle || !selectedShowtime || totalSeatPrice === undefined) {
      console.warn("ConfirmOrderPage: Thiếu thông tin cần thiết, điều hướng về chọn phim.", location.state);
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`, { replace: true });
    }
  }, [movieId, showtimeId, selectedSeats, movieTitle, selectedShowtime, totalSeatPrice, navigate, location.state]);

  const handleConfirmAndPay = async () => {
    setIsProcessing(true);
    // Chuẩn bị payload gửi lên API
    // Backend sẽ cần MaKH (nếu có), MaNV (lấy từ user đang đăng nhập), MaSuatChieu, thông tin ghế, thông tin sản phẩm
    const orderPayload = {
      MaKH: customerInfo?.MaKH || null, // Gửi MaKH nếu có
      // MaNV sẽ được backend xử lý dựa trên token/session của nhân viên đang đăng nhập
      HinhThucThanhToan: 'Tiền mặt', // Tạm thời, sau này có thể cho chọn
      TongTienHoaDon: finalTotalAmount,
      GhiChu: customerInfo?.name ? `Khách hàng: ${customerInfo.name}` : 'Khách vãng lai',
      showtimeId: showtimeId,

      // Chi tiết vé
      ve: selectedSeats.map(seat => ({
        //MaSuatChieu: showtimeId,
        MaGhe: seat.id, // seat.id từ API ghế là MAGHE
        MaPhong: roomId, // roomId từ API ghế
        GiaVeCoBan_LucChon: seat.basePricePerSeat, // Giá gốc của suất chiếu cho ghế này
        PhuThuGhe_LucChon: seat.surcharge,         // Phụ thu của ghế này
        GiaBan: seat.totalPrice,                  // Giá cuối cùng của vé này
      })),

      // Chi tiết sản phẩm khác
      sanPhamKhac: concessions.map(item => ({
        MaSP: item.id, // item.id là MASP
        SoLuong: item.quantity,
        GiaBan_LucChon: item.price, // item.price là GIASP gốc của sản phẩm
        ThanhTien: item.price * item.quantity,
      })),
    };

    console.log('Order confirmed, payload to API (WITH SHOWTIMEID):', JSON.stringify(orderPayload, null, 2));
    try {
      const result = await createOrderApi(orderPayload); // API tạo hóa đơn
      //alert(`Đã tạo hóa đơn ${result.MaHoaDon} thành công! Tổng tiền: ${finalTotalAmount.toLocaleString('vi-VN')} đ`);
      // Điều hướng về trang quản lý vé hoặc trang thành công
      setSuccessMessage('Thêm hóa đơn thành công !');
      setPendingNavigation({ // THÊM ĐOẠN NÀY
        path: `${STAFF_BASE_PATH}/tickets`,
        options: { replace: true }
      });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      setErrorMessage(`Lỗi khi tạo đơn hàng: ${error.message || 'Vui lòng thử lại.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccessModal = () => {
  setSuccessMessage('');
  if (pendingNavigation) {
    navigate(pendingNavigation.path, pendingNavigation.options);
    setPendingNavigation(null); 
  }
};

  const handleCloseErrorModal = () => {
    setErrorMessage('');
  };

  // Kiểm tra lại điều kiện hiển thị loading
  if (!movieTitle || !selectedShowtime || selectedSeats.length === 0 || totalSeatPrice === undefined) {
    return <div className="create-ticket-step confirm-order-step"><p>Đang tải thông tin đơn hàng...</p></div>;
  }

  return (
    <div className="create-ticket-step confirm-order-step">
      <div className="confirm-order-card">
        <div className="card-header"><h2 className="page-main-title">Xác Nhận Đơn Hàng & Thanh Toán</h2></div>
        <div className="card-body">
          <section className="order-summary-section">
            <h3>Chi Tiết Vé</h3>
            <p><strong>Phim:</strong> {movieTitle}</p>
            <p>
              <strong>Suất chiếu:</strong>
              {selectedShowtime.date} - {selectedShowtime.time}
              (Phòng: {roomId || selectedShowtime.screen || 'N/A'})
            </p>
            <p><strong>Ghế đã chọn ({selectedSeats.length}):</strong> {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}</p>
            <p><strong>Tổng tiền vé:</strong> {totalSeatPrice.toLocaleString('vi-VN')} đ</p>
          </section>

          {concessions.length > 0 && (
            <section className="order-summary-section">
              <h3>Sản phẩm đã chọn</h3>
              <ul>{concessions.map(item => (<li key={item.id}>{item.name} (x{item.quantity}) - {(item.price * item.quantity).toLocaleString('vi-VN')} đ</li>))}</ul>
              <p><strong>Tổng tiền sản phẩm:</strong> {totalConcessionsPrice.toLocaleString('vi-VN')} đ</p>
            </section>
          )}

          {customerInfo && (customerInfo.name || customerInfo.phone) && (
            <section className="order-summary-section">
              <h3>Thông Tin Khách Hàng</h3>
              {customerInfo.MaKH && <p><strong>Mã KH:</strong> {customerInfo.MaKH}</p>}
              {customerInfo.name && <p><strong>Tên:</strong> {customerInfo.name}</p>}
              {customerInfo.phone && <p><strong>SĐT:</strong> {customerInfo.phone}</p>}
              {customerInfo.email && <p><strong>Email:</strong> {customerInfo.email}</p>}
              {customerInfo.type === 'member' && <p><strong>Loại:</strong> Thành viên</p>}
            </section>
          )}

          <div className="final-total-section"><h3><strong>TỔNG CỘNG: {finalTotalAmount.toLocaleString('vi-VN')} đ</strong></h3></div>
          <div className="payment-methods-section">
            <h4>Chọn phương thức thanh toán:</h4>
            <div className="payment-placeholder">
              <Button variant="secondary" size="medium" className="payment-option-btn">Tiền mặt</Button>
              {/* Các PT khác có thể thêm sau */}
            </div>
          </div>
        </div>
        <div className="card-footer workflow-actions">
          <Button onClick={() => navigate(-1)} variant="light" size="medium" disabled={isProcessing}>Quay lại</Button>
          <Button variant="primary" size="large" onClick={handleConfirmAndPay} className="confirm-pay-btn" disabled={isProcessing}>
            {isProcessing ? "Đang xử lý..." : "Hoàn Tất & Thanh Toán"}
          </Button>
        </div>
      </div>
      <SuccessMessageModal
        isOpen={!!successMessage}
        onClose={handleCloseSuccessModal}
        successMessage={successMessage}
      />
      <ErrorMessageModal
        isOpen={!!errorMessage}
        onClose={handleCloseErrorModal}
        errorMessage={errorMessage}
      />
    </div>
  );
};
export default ConfirmOrderPage;