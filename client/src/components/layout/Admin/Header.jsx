// src/components/layout/AdminLayout/Header.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button'; 
import './Header.css'; // File CSS cho Header của Admin

const AdminHeader = ({ title, subtitle, actions, onLogout }) => { // NHẬN onLogout
  return (
    <header className="content-header"> {/* Hoặc class bạn đã định nghĩa */}
      <div className="header-text">
        {title && <h1 className="header-title">{title}</h1>}
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      <div className="header-actions">
        {actions}
        {/* NÚT ĐĂNG XUẤT */}
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

AdminHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  onLogout: PropTypes.func, // ĐỊNH NGHĨA PROP TYPE
};

AdminHeader.defaultProps = {
  title: 'Admin Page', // Hoặc giá trị mặc định phù hợp
  subtitle: '',
  actions: null,
  onLogout: null,
};

export default AdminHeader;