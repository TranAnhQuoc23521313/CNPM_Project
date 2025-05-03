import React from 'react';
import PropTypes from 'prop-types';
import './Common.css'; // Shared CSS file
import Button from './Button'; // Use our custom Button

const Modal = ({ isOpen, onClose, title, children, footerContent }) => {
  if (!isOpen) {
    return null; // Don't render anything if the modal isn't open
  }

  // Prevent closing modal when clicking inside the content area
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // The Modal Backdrop (overlay)
    <div className="modal-backdrop" onClick={onClose}>
      {/* The Modal Content */}
      <div className="modal-content" onClick={handleContentClick}>
        {/* Modal Header */}
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <Button onClick={onClose} variant="light" size="small" className="modal-close-btn" aria-label="Close modal">
            × {/* HTML entity for 'X' symbol */}
          </Button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Modal Footer (optional) */}
        {footerContent && (
          <div className="modal-footer">
            {footerContent}
             {/* Example:
                <Button onClick={onClose} variant="secondary">Cancel</Button>
                <Button onClick={handleConfirm} variant="primary">Confirm</Button>
             */}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,       // Controls modal visibility
  onClose: PropTypes.func.isRequired,      // Function to call when closing
  title: PropTypes.string,                 // Optional modal title
  children: PropTypes.node.isRequired,     // Content to display inside the modal
  footerContent: PropTypes.node,           // Optional content for the footer (e.g., buttons)
};

export default Modal;