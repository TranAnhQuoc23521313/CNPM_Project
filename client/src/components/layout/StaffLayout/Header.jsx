import React from 'react';
import PropTypes from 'prop-types';
import './Header.css'; // We'll need this CSS file for styling

const Header = ({ title, subtitle, actions }) => {
  return (
    <header className="content-header">
      <div className="header-text">
        {title && <h2 className="header-title">{title}</h2>}
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      <div className="header-actions">
        {actions} {/* Render any buttons or other action elements passed in */}
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
};

Header.defaultProps = {
  subtitle: '',
  actions: null,
};

export default Header;