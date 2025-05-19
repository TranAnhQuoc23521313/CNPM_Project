// src/components/common/ConfirmationDialog.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.jsx'; // Sử dụng component Button của bạn
import './Common.css'; // Đảm bảo file này chứa style cho modal

const ConfirmationDialog = ({
  isOpen,
  onClose, // Hàm khi nhấn nút hủy hoặc click ra ngoài
  onConfirm, // Hàm khi nhấn nút xác nhận
  title,
  message,
  confirmButtonText = 'Xác nhận',
  cancelButtonText = 'Hủy',
  confirmButtonVariant = 'danger', // Mặc định cho các hành động nguy hiểm
  cancelButtonVariant = 'secondary',
  isLoading = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Các class giống với modal xóa sản phẩm của bạn
    <div className="modal-overlay confirmation-overlay" onClick={onClose}>
      <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3> {/* Tiêu đề modal */}
        {typeof message === 'string' ? <p>{message}</p> : message} {/* Nội dung modal, có thể là string hoặc JSX */}
        <div className="confirmation-actions"> {/* Class cho khu vực nút */}
          <Button
            variant={cancelButtonVariant}
            onClick={onClose}
            disabled={isLoading}
            // className="cancel-btn" // Bỏ className này nếu Button component đã xử lý style qua variant
          >
            {cancelButtonText}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            disabled={isLoading}
            // className="confirm-delete-btn" // Bỏ className này, dùng variant="danger"
          >
            {isLoading ? 'Đang xử lý...' : confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  confirmButtonVariant: PropTypes.string,
  cancelButtonVariant: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default ConfirmationDialog;