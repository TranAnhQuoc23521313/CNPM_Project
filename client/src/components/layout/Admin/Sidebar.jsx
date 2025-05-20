import React from 'react';
// Assuming you're using react-router-dom for navigation
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // We'll need this CSS file for styling

// Placeholder for icons - replace with actual icon components (e.g., from react-icons)
const IconPlaceholder = ({ name }) => <span className="icon-placeholder">{/* {name} */}</span>;

const Sidebar = () => {
  // Define navigation items for Cinema Management
  const navItems = [
    { path: '/admin/movies', icon: 'movie', label: 'Quản lý phim' },
    { path: '/admin/showtimes', icon: 'Showtimes', label: 'Quản lý suất chiếu' },
    { path: '/admin/items', icon: 'Items', label: 'Quản lý sản phẩm' },
    { path: '/admin/staffs', icon: 'Staffs', label: 'Quản lý nhân viên' },
    { path: '/admin/customers', icon: 'Customers', label: 'Quản lý khách hàng' },
    { path: '/admin/payments', icon: 'Payments', label: 'Quản lý lịch sử giao dịch' },
    { path: '/admin/statistics', icon: 'Statistics', label: 'Thống kê' },
    { path: '/admin/facilities', icon: 'Facilities', label: 'Quản lý thiết bị' },
    // Add more relevant items here
  ];

  const bottomNavItems = []

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
                <IconPlaceholder name={item.icon} />
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
                     <IconPlaceholder name={item.icon} />
                     <span>{item.label}</span>
                   </NavLink>
                 </li>
               ))}
             </ul>
         </nav>
        {/* User profile section - similar to the example */}
        <div className="user-profile-section">
           {/* Replace with actual user avatar and info */}
           <div className="user-avatar-placeholder"></div>
           <div className="user-info">
             <span className="user-name">Admin User</span>
             <span className="user-email">admin@cinemasys.com</span>
           </div>
           {/* Add dropdown icon/button if needed */}
           <span className="user-menu-icon">⋮</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;