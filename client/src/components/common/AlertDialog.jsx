// src/components/common/AlertDialog.jsx
import React from 'react';
import Button from './Button'; // Đảm bảo đường dẫn đến Button là chính xác
import './AlertDialog.css';

const AlertDialog = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "Đã hiểu", // Text nút mặc định, có thể tùy chỉnh
  type = "info", // Các loại: 'info', 'success', 'warning', 'error' để tùy chỉnh style
  children // Cho phép truyền nội dung phức tạp hơn nếu cần
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="alert-dialog-overlay" onClick={onClose}> {/* Click bên ngoài để đóng */}
      <div 
        className={`alert-dialog-content alert-dialog-${type}`} 
        onClick={(e) => e.stopPropagation()} // Ngăn việc click vào content bị lan ra overlay và đóng modal
      >
        {title && <h3 className="alert-dialog-title">{title}</h3>}
        
        {message && <p className="alert-dialog-message">{message}</p>}
        {children && <div className="alert-dialog-children-content">{children}</div>}

        <div className="alert-dialog-actions">
          <Button 
            onClick={onClose} 
            variant={type === 'error' ? 'danger' : (type === 'warning' ? 'warning' : 'primary')} // Tùy chỉnh màu nút dựa trên type
            size="medium"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;