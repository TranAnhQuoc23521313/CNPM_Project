import React from 'react';
import PropTypes from 'prop-types';
import AdminSidebar from './Sidebar'; // Import Sidebar dành cho Admin
import AdminHeader from './Header';   // Import Header dành cho Admin
import './Layout.css';             // CSS cho layout tổng thể của Admin

const AdminLayout = ({ children, headerTitle, headerSubtitle, headerActions, onLogout }) => {
  return (
    <div className="admin-layout-container"> {/* Class CSS cho layout tổng thể của Admin */}
      <AdminSidebar /> {/* Sidebar của Admin */}
      <div className="admin-main-content-area"> {/* Khu vực nội dung chính */}
        <AdminHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          actions={headerActions}
          onLogout={onLogout} // Truyền hàm logout xuống Header
        />
        <main className="admin-page-content"> {/* Nơi render nội dung trang con (Outlet) */}
          {children}
        </main>
      </div>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired, // Nội dung trang con, thường là <Outlet />
  headerTitle: PropTypes.string.isRequired, // Tiêu đề chính cho Header
  headerSubtitle: PropTypes.string, // Tiêu đề phụ (tùy chọn)
  headerActions: PropTypes.node, // Các nút hành động trên Header (tùy chọn)
  onLogout: PropTypes.func, // Hàm xử lý đăng xuất
};

AdminLayout.defaultProps = {
  headerSubtitle: '',
  headerActions: null,
  onLogout: () => {}, // Hàm rỗng để tránh lỗi nếu prop không được truyền
};

export default AdminLayout;