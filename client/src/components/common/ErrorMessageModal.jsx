// client/src/components/common/ErrorMessageModal.jsx
import React from 'react';
import Button from './Button'; // Giả sử bạn có component Button chung
import './ErrorMessageModal.css'; // File CSS riêng cho modal này

const ErrorMessageModal = ({ isOpen, onClose, errorMessage }) => {
  if (!isOpen || !errorMessage) {
    return null; // Không hiển thị gì nếu không mở hoặc không có thông báo lỗi
  }

  return (
    <div className="error-modal-overlay" onClick={onClose}> {/* Cho phép đóng khi click ngoài */}
      <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="error-modal-header">
          <h3 className="error-modal-title">Có lỗi xảy ra</h3>
          {/* Bạn có thể thêm nút X ở đây nếu muốn */}
          {/* <button onClick={onClose} className="close-button" aria-label="Close">×</button> */}
        </div>
        <div className="error-modal-body">
          <p>{errorMessage}</p>
        </div>
        <div className="error-modal-footer">
          <Button variant="primary" onClick={onClose} className="error-modal-ok-button">
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessageModal;