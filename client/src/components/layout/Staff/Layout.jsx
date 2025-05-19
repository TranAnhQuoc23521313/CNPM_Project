// src/components/layout/StaffLayout/StaffLayout.jsx
import React from 'react';
import PropTypes from 'prop-types';
import StaffHeader from './Header';
import StaffSidebar from './Sidebar'; // <<--- PHẢI IMPORT
import './Layout.css';

const StaffLayout = ({ children, headerTitle, onLogout }) => {
  return (
    <div className="staff-layout-container">
      <StaffSidebar /> {/* <<--- PHẢI RENDER Ở ĐÂY */}
      <div className="staff-main-content-area">
        <StaffHeader
          title={headerTitle}
          onLogout={onLogout}
        />
        <main className="staff-page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

// ... propTypes và defaultProps ...
export default StaffLayout;