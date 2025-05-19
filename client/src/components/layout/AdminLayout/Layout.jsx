import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css'; // We'll need this CSS file for styling
// It's good practice to define prop types
import PropTypes from 'prop-types';

/**
 * Main Layout component for the application.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The main content of the page.
 * @param {string} props.headerTitle - Title to display in the Header.
 * @param {string} [props.headerSubtitle] - Optional subtitle for the Header.
 * @param {React.ReactNode} [props.headerActions] - Optional action elements (like buttons) for the Header.
 */
const Layout = ({ children, headerTitle, headerSubtitle, headerActions }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content-area">
        <Header
          title={headerTitle}
          subtitle={headerSubtitle}
          actions={headerActions}
        />
        <main className="page-content">
          {children} {/* Where the specific page content will be rendered */}
        </main>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  headerTitle: PropTypes.string.isRequired,
  headerSubtitle: PropTypes.string,
  headerActions: PropTypes.node,
};

Layout.defaultProps = {
  headerSubtitle: '',
  headerActions: null,
};


export default Layout;