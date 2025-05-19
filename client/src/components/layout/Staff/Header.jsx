// src/components/layout/StaffLayout/Header.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button'; // Đảm bảo đường dẫn này đúng
import './Header.css';

// Đổi tên component thành StaffHeader cho rõ ràng và nhất quán
const StaffHeader = ({ title, subtitle, actions, onLogout }) => { // <<--- NHẬN PROP onLogout
  return (
    <header className="content-header staff-header-custom"> {/* Thêm class riêng nếu cần style khác AdminHeader */}
      <div className="header-text">
        {/* Staff có thể không cần subtitle, nên title có thể dùng h1 cho to hơn */}
        {title && <h1 className="header-title">{title}</h1>}
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      <div className="header-actions">
        {actions} {/* Render các actions khác nếu có */}
        {/* NÚT ĐĂNG XUẤT CHO STAFF */}
        {onLogout && (
          <Button
            onClick={onLogout}
            variant="danger" // Hoặc "secondary", "light"
            size="medium"
            className="staff-logout-btn" // Class riêng nếu cần
          >
            Đăng xuất
          </Button>
        )}
      </div>
    </header>
  );
};

StaffHeader.propTypes = {
  title: PropTypes.string.isRequired, // Giữ isRequired nếu title luôn cần thiết
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  onLogout: PropTypes.func, // <<--- THÊM PROP TYPE CHO onLogout
};

StaffHeader.defaultProps = {
  title: 'Cổng Nhân Viên', // Giá trị mặc định phù hợp cho Staff
  subtitle: '',
  actions: null,
  onLogout: null, // <<--- GIÁ TRỊ MẶC ĐỊNH CHO onLogout
};

export default StaffHeader; // Export với tên StaffHeader