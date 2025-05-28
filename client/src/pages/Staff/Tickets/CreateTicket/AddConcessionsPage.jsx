// src/pages/Staff/Tickets/CreateTicket/AddConcessionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../../components/common/Button';
import './CreateTicketWorkflow.css';
import './AddConcessionsPage.css';

const mockConcessions = [
  { id: 'C001', name: 'Bắp Rang Bơ Caramel Lớn', price: 65000, imageUrl: 'https://via.placeholder.com/80x80/FFD700/000000?Text=Bắp+L', category: 'Bắp Rang' },
  { id: 'C002', name: 'Nước Ngọt Coca-Cola (Lon)', price: 25000, imageUrl: 'https://via.placeholder.com/80x80/FF0000/FFFFFF?Text=Coca', category: 'Nước uống' },
  { id: 'C003', name: 'Combo Phim Hay (1 Bắp Lớn + 2 Nước)', price: 105000, imageUrl: 'https://via.placeholder.com/80x80/007BFF/FFFFFF?Text=Combo', category: 'Combo' },
  { id: 'C004', name: 'Bắp Rang Bơ Phô Mai Vừa', price: 55000, imageUrl: 'https://via.placeholder.com/80x80/FFA500/000000?Text=Bắp+V', category: 'Bắp Rang' },
  { id: 'C005', name: 'Nước Suối Aquafina', price: 20000, imageUrl: 'https://via.placeholder.com/80x80/ADD8E6/000000?Text=Nước', category: 'Nước uống' },
  { id: 'C006', name: 'Snack Oishi Vị Tôm Cay', price: 15000, imageUrl: 'https://via.placeholder.com/80x80/FF4500/FFFFFF?Text=Snack', category: 'Snack' },
];
const STAFF_BASE_PATH = "/staff";

const AddConcessionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousBookingState = location.state || {};

  const [selectedConcessions, setSelectedConcessions] = useState(
    previousBookingState.concessions ? previousBookingState.concessions.reduce((acc, item) => {
        if (item && item.id) { // Kiểm tra item và item.id tồn tại
            acc[item.id] = item.quantity;
        }
        return acc;
    }, {}) : {}
  );

  const handleQuantityChange = (itemId, change) => {
    setSelectedConcessions(prev => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      if (newQuantity === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const calculateTotalConcessionsPrice = () => {
    let total = 0;
    for (const itemId in selectedConcessions) {
      const item = mockConcessions.find(c => c.id === itemId);
      if (item) {
        total += item.price * selectedConcessions[itemId];
      }
    }
    return total;
  };

  const totalConcessionsPrice = calculateTotalConcessionsPrice();

  const handleNext = () => {
    const concessionsData = Object.entries(selectedConcessions)
      .map(([itemId, quantity]) => {
        const itemDetails = mockConcessions.find(c => c.id === itemId);
        return { ...itemDetails, quantity };
      })
      .filter(item => item.quantity > 0);

    navigate(`${STAFF_BASE_PATH}/tickets/new/customer-info`, {
      state: {
        ...previousBookingState, // Giữ lại movieId, showtimeId, selectedSeats, totalSeatPrice, movieTitle, showtimeDetails
        concessions: concessionsData,
        totalConcessionsPrice, // Đã tính ở trên
      }
    });
  };

  const handleSkip = () => {
    navigate(`${STAFF_BASE_PATH}/tickets/new/customer-info`, {
      state: {
        ...previousBookingState,
        concessions: [],
        totalConcessionsPrice: 0,
      }
    });
  };

  useEffect(() => {
    // Kiểm tra các thông tin cốt lõi từ bước trước
    if (
        !previousBookingState.movieId ||
        !previousBookingState.showtimeId ||
        !previousBookingState.selectedSeats ||
        previousBookingState.selectedSeats.length === 0 ||
        previousBookingState.totalSeatPrice === undefined // Kiểm tra cả totalSeatPrice
       ) {
      console.warn("AddConcessionsPage: Thiếu thông tin từ bước chọn ghế, điều hướng về chọn phim.");
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`, { replace: true });
    }
  }, [previousBookingState, navigate]);

  const groupedConcessions = mockConcessions.reduce((acc, item) => {
    const category = item.category || 'Khác';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

    return (
    <div className="create-ticket-step add-concessions-page-list-view">
      <h2 className="page-step-title-main">Bước 4: Chọn Sản Phẩm/Combo (Tùy chọn)</h2> {/* Đổi thành Bước 4 */}
      <div className="concessions-list-rows-wrapper">
        <div className="concessions-list-rows">
          {Object.entries(groupedConcessions).map(([category, items]) => (
            <div key={category} className="concession-category-group">
              <h3 className="concession-category-title">{category}</h3>
              {items.map(item => (
                <div key={item.id} className="concession-row-item">
                  <img src={item.imageUrl} alt={item.name} className="concession-row-image" />
                  <div className="concession-row-details">
                    <h4 className="concession-row-name">{item.name}</h4>
                    <p className="concession-row-price">{item.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="concession-row-quantity-selector">
                    <Button size="small" variant="secondary" className="quantity-btn" onClick={() => handleQuantityChange(item.id, -1)} disabled={(selectedConcessions[item.id] || 0) === 0} aria-label={`Giảm số lượng ${item.name}`}>-</Button>
                    <span className="concession-quantity-value">{selectedConcessions[item.id] || 0}</span>
                    <Button size="small" variant="secondary" className="quantity-btn quantity-btn-plus" onClick={() => handleQuantityChange(item.id, 1)} aria-label={`Tăng số lượng ${item.name}`}>+</Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="workflow-actions-footer">
        <Button onClick={() => navigate(-1)} variant="light" size="medium" className="footer-back-button">Quay lại</Button>
        <div className="footer-main-actions">
          <div className="total-concessions-price">Tổng sản phẩm: <strong>{totalConcessionsPrice.toLocaleString('vi-VN')}đ</strong></div>
          <Button onClick={totalConcessionsPrice > 0 ? handleNext : handleSkip} variant="primary" size="medium" className="footer-continue-button">
            {totalConcessionsPrice > 0 ? 'Tiếp tục' : 'Bỏ qua & Tiếp tục'}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default AddConcessionsPage;