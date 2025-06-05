// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Đảm bảo bạn đã tạo file CSS này để định dạng sidebar

// Import các icon từ react-icons (ví dụ sử dụng Font Awesome icons)
import {
  FaFilm,
  FaCalendarAlt,
  FaBoxOpen,
  FaUserTie,
  FaUsers,
  FaHistory,
  FaChartLine,
  FaTools,
/*   FaCog,
  FaSignOutAlt */
} from 'react-icons/fa';

const Sidebar = () => {
  // Kích thước mặc định cho các icon
  const iconSize = 20;

  const navItems = [
    { path: '/admin/movies', icon: <FaFilm size={iconSize} />, label: 'Quản lý phim' },
    { path: '/admin/showtimes', icon: <FaCalendarAlt size={iconSize} />, label: 'Quản lý suất chiếu' },
    { path: '/admin/items', icon: <FaBoxOpen size={iconSize} />, label: 'Quản lý sản phẩm' },
    { path: '/admin/staffs', icon: <FaUserTie size={iconSize} />, label: 'Quản lý nhân viên' },
    { path: '/admin/customers', icon: <FaUsers size={iconSize} />, label: 'Quản lý khách hàng' },
    { path: '/admin/payments', icon: <FaHistory size={iconSize} />, label: 'Quản lý lịch sử giao dịch' },
    { path: '/admin/statistics', icon: <FaChartLine size={iconSize} />, label: 'Thống kê' },
    { path: '/admin/facilities', icon: <FaTools size={iconSize} />, label: 'Quản lý thiết bị' },
  ];

  // Thêm các mục cho menu dưới cùng (ví dụ)
  const bottomNavItems = [];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
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
        <div className="user-profile-section">
           <div className="user-avatar-placeholder"></div> {/* Có thể thay bằng icon user hoặc ảnh */}
           <div className="user-info">
             <span className="user-name">Admin User</span>
             {/* <span className="user-email">admin@cinemasys.com</span> */}
           </div>
           {/* <span className="user-menu-icon">⋮</span> */}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;