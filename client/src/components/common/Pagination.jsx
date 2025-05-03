import React from 'react';
import PropTypes from 'prop-types';
import './Common.css'; // Shared CSS file
import Button from './Button'; // Use our custom Button

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or less
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  // Basic pagination: show first, current, last, and ellipsis if needed
  // A more complex implementation could show a range of page numbers
  const getPageNumbers = () => {
    const pages = [];
    // For simplicity, let's just show all page numbers for now
    // A real-world component might limit this (e.g., show first, last, current +/- 2)
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="pagination-container" aria-label="Page navigation">
      <Button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        variant="light"
        size="small"
      >
        « Previous
      </Button>

      {pageNumbers.map((page) => (
        <Button
          key={page}
          onClick={() => handlePageClick(page)}
          // Use 'primary' for current page, 'light' for others
          variant={currentPage === page ? 'primary' : 'light'}
          size="small"
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </Button>
      ))}

      <Button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        variant="light"
        size="small"
      >
        Next »
      </Button>
       <span className="pagination-info">
         Page {currentPage} of {totalPages}
       </span>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired, // The currently active page
  totalPages: PropTypes.number.isRequired,  // Total number of pages available
  onPageChange: PropTypes.func.isRequired,  // Function to call when page changes (passes new page number)
};

export default Pagination;