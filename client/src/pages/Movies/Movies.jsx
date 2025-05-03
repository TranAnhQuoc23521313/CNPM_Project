import React from 'react';
// We might not need Link yet if the "Add" button doesn't navigate anywhere for now
// import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx'; // Path to common Button
// Optional: Add specific styles for the Movies page layout if needed
// import './Movies.css';

const MoviesPage = () => {
  // Static title for now
  const pageTitle = 'Movies';

  const handleAddMovieClick = () => {
    // Placeholder action for now - will later navigate to /movies/new
    alert('Navigate to Add New Movie form (not implemented yet)');
  };

  return (
    <div className="movies-page-container">
      {/* Header section specific to the Movies page */}
      <div
        className="movies-page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #dee2e6',
        }}
      >
        <h1>{pageTitle}</h1>

        {/* "Add New Movie" button - using onClick for now */}
        <Button variant="primary" size="medium" onClick={handleAddMovieClick}>
          + Add New Movie
        </Button>
        {/* If using Link, it would look like this, but requires routing setup:
           <Link to="/movies/new">
             <Button variant="primary" size="medium">
               + Add New Movie
             </Button>
           </Link>
        */}
      </div>

      {/* --- Placeholder for Future Content --- */}
      <div className="movies-content-placeholder" style={{ padding: '2rem', textAlign: 'center', border: '1px dashed #ccc', backgroundColor: '#f9f9f9', color: '#666' }}>
        <p>Movie List / Movie Form / Movie Details will be displayed here.</p>
        <p>(Content depends on the specific route: /movies, /movies/new, /movies/:id, etc.)</p>
      </div>
       {/* --- End Placeholder --- */}

    </div>
  );
};

export default MoviesPage;