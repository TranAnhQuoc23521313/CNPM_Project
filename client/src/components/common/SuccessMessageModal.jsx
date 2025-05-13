// client/src/components/common/SuccessMessageModal.jsx
import React, { useEffect } from 'react'; // THÊM useEffect VÀO IMPORT
import Button from './Button';
import './SuccessMessageModal.css';

const SuccessMessageModal = ({ isOpen, onClose, successMessage }) => {
  // DI CHUYỂN useEffect LÊN ĐÂY (CẤP CAO NHẤT CỦA COMPONENT)
  useEffect(() => {
    let timer;
    // Điều kiện isOpen được kiểm tra BÊN TRONG callback của useEffect
    if (isOpen && successMessage) { // Cũng nên kiểm tra successMessage để tránh chạy timer vô ích
      console.log('SuccessMessageModal: Setting timer to close.'); // DEBUG
      timer = setTimeout(() => {
        console.log('SuccessMessageModal: Timer fired, calling onClose.'); // DEBUG
        onClose();
      }, 10000); // Đóng sau 3 giây
    }
    // Cleanup function: sẽ được gọi khi component unmount hoặc trước khi effect chạy lại
    return () => {
      if (timer) {
        console.log('SuccessMessageModal: Clearing timer.'); // DEBUG
        clearTimeout(timer);
      }
    };
  }, [isOpen, successMessage, onClose]); // Dependencies: chạy lại khi isOpen, successMessage, hoặc onClose thay đổi

  // Điều kiện early return vẫn giữ nguyên
  if (!isOpen || !successMessage) {
    return null;
  }

  // Phần JSX giữ nguyên
  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-header">
          <h3 className="success-modal-title">Success!</h3>
        </div>
        <div className="success-modal-body">
          <p>{successMessage}</p>
        </div>
        <div className="success-modal-footer">
          <Button variant="success" onClick={onClose} className="success-modal-ok-button">
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessageModal;