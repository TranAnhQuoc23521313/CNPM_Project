import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import {
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  Avatar,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { logout } from '../../pages/userSlice';
const IconPlaceholder = ({ name }) => <span className="icon-placeholder">{/* {name} */}</span>;

const Sidebar = () => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const dispatch = useDispatch();
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target)
    ) {
      return;
    }
    setOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab' || event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  };

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const navItems = [
    { path: '/movies', icon: 'movie', label: 'Quản lý phim' },
    { path: '/showtimes', icon: 'showtimes', label: 'Quản lý suất chiếu' },
    { path: '/items', icon: 'items', label: 'Quản lý sản phẩm' },
    { path: '/staffs', icon: 'staffs', label: 'Quản lý nhân viên' },
    { path: '/customers', icon: 'customers', label: 'Quản lý khách hàng' },
    { path: '/payments', icon: 'payments', label: 'Quản lý lịch sử giao dịch' },
    { path: '/statistics', icon: 'statistics', label: 'Thống kê' },
    { path: '/facilities', icon: 'facilities', label: 'Quản lý thiết bị' },
  ];

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
                <IconPlaceholder name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <nav className="sidebar-nav-footer">
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
        </div>

        <div className="user-profile-section">
        <Avatar 
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? 'composition-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          sx={{ cursor: 'pointer', width: 40, height: 40, marginRight: '10px' }}
        />

        <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-email">admin@cinemasys.com</span>
          </div>

          {/* Popper dropdown */}
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocusItem={open}
                      id="composition-menu"
                      aria-labelledby="composition-button"
                      onKeyDown={handleListKeyDown}
                    >
                      <MenuItem onClick={handleClose}>Profile</MenuItem>
                      <MenuItem onClick={handleClose}>My account</MenuItem>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
          </div>
    </aside>
  );
};

export default Sidebar;
