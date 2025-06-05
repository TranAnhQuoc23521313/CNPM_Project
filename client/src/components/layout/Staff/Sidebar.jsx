// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // We'll need this CSS file for styling

// Import các icon từ react-icons (ví dụ sử dụng Font Awesome icons)
import { FaTicketAlt, FaTools } from 'react-icons/fa'; // Icon cho vé và thiết bị

const Sidebar = () => {
  // Kích thước mặc định cho các icon
  const iconSize = 20;

  // Define navigation items for Staff
  const navItems = [
    { path: '/staff/tickets', icon: <FaTicketAlt size={iconSize} />, label: 'Quản lý vé phim' },
    { path: '/staff/facilities', icon: <FaTools size={iconSize} />, label: 'Quản lý thiết bị' },
    // Add more relevant items here if needed
  ];

  const bottomNavItems = []; // Giữ nguyên, không có mục ở footer cho staff theo yêu cầu

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {/* Replace with your actual Logo */}
        <div className="sidebar-logo">CinemaSys</div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {item.icon} {/* Hiển thị component icon trực tiếp */}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
         {/* Phần này sẽ không render gì nếu bottomNavItems rỗng */}
         {bottomNavItems.length > 0 && (
            <nav className='sidebar-nav-footer'>
                <ul>
                {bottomNavItems.map((item) => (
                    <li key={item.path}>
                    <NavLink
                        to={item.path}
                        className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                    </li>
                ))}
                </ul>
            </nav>
         )}
        {/* User profile section - tương tự như ví dụ */}
        <div className="user-profile-section">
           {/* Thay thế bằng avatar và thông tin người dùng thực tế */}
           <div className="user-avatar-placeholder"></div>
           <div className="user-info">
             <span className="user-name">Staff User</span> {/* Cập nhật tên người dùng */}
             <span className="user-email">staff@cinemasys.com</span> {/* Cập nhật email */}
           </div>
           {/* Thêm icon/button dropdown nếu cần */}
           <span className="user-menu-icon">⋮</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;