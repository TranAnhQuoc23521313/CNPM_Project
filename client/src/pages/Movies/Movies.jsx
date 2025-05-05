import React from 'react';
// We might not need Link yet if the "Add" button doesn't navigate anywhere for now
// import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx'; // Path to common Button
// Optional: Add specific styles for the Movies page layout if needed
// import './Movies.css';

const MoviesPage = () => {
  // Static title for now
  const pageTitle = 'Movies';
  
  // Sample movie list
  const movies = [
    { id: 1, title: 'The Shawshank Redemption', year: 1994, type: 'Drama', country: 'USA', genre: 'Drama', duration: 142 },
    { id: 2, title: 'The Godfather', year: 1972, type: 'Crime', country: 'USA', genre: 'Crime', duration: 175 },
    { id: 3, title: 'The Dark Knight', year: 2008, type: 'Action', country: 'USA', genre: 'Action', duration: 152 },
    { id: 4, title: 'Pulp Fiction', year: 1994, type: 'Crime', country: 'USA', genre: 'Crime', duration: 154 },
    { id: 5, title: 'Forrest Gump', year: 1994, type: 'Drama', country: 'USA', genre: 'Drama', duration: 142 },
  ];

  const handleAddMovieClick = () => {
    // Placeholder action for now - will later navigate to /movies/new
    alert('Navigate to Add New Movie form (not implemented yet)');
  };

  /* const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    console.log('Search Query:', e.target.value); // Debugging purpose
  }; */

  
  const handleEditMovie = (movieId) => {
    // Placeholder action for now - will later navigate to /movies/:id/edit
    alert(`Navigate to Edit Movie form for movie ID: ${movieId} (not implemented yet)`);
  }; 

  const handleDeleteMovie = (movieId) => {
    // Placeholder action for now - will later delete the movie and refresh the list
    alert(`Delete movie with ID: ${movieId} (not implemented yet)`);
  }
 
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

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search movies..."
          //value={searchQuery}
          //onChange={handleSearchChange}
          style={{
            marginRight: '1rem',
            padding: '0.5rem',
            border: '1px solid #ccc', // Bỏ viền
            borderRadius: '20px', // Làm viền tròn
            flex: '1',
            maxWidth: '500px',
            backgroundColor: '#f9f9f9', // Tùy chọn: Thêm màu nền nhẹ
          }}
        />

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

{/* Phần này đang test giao diện khi hiện danh sách các bộ phim */}
      {/* Movie List */}
      <div className="movies-list">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9f9f9', textAlign: 'center' }}>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#555' }}>Tên phim</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#555' }}>Loại phim</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#555' }}>Quốc gia</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#555' }}>Thể loại</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#555' }}>Thời lượng (phút)</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#555' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr
                key={movie.id}
                style={{
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'table-row',
                }}
              >
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{movie.title}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{movie.type}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{movie.country}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{movie.genre}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{movie.duration}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <button
                    onClick={() => handleEditMovie(movie.id)}
                    style={{
                      marginRight: '0.5rem',
                      padding: '0.3rem 0.5rem',
                      border: 'none',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteMovie(movie.id)} // Placeholder action for delete
                    style={{
                      padding: '0.3rem 0.5rem',
                      border: 'none',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MoviesPage;