import React from 'react';
import PropTypes from 'prop-types';
import './Common.css'; // We'll create this CSS file next

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // e.g., 'primary', 'secondary', 'danger'
  size = 'medium', // e.g., 'small', 'medium', 'large'
  disabled = false,
  className = '',
  ...props // Spread any other props like aria-label, etc.
}) => {
  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const combinedClasses = `${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Define prop types for better component documentation and error checking
Button.propTypes = {
  children: PropTypes.node.isRequired, // Button text or elements
  onClick: PropTypes.func,             // Click handler function
  type: PropTypes.oneOf(['button', 'submit', 'reset']), // HTML button type
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'light', 'dark']), // Style variant
  size: PropTypes.oneOf(['small', 'medium', 'large']), // Button size
  disabled: PropTypes.bool,            // Whether the button is disabled
  className: PropTypes.string,         // Allow custom CSS classes
};

export default Button;