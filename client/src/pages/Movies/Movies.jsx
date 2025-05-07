import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import './Movies.css'; // << --- IMPORT FILE CSS Ở ĐÂY

const MoviesPage = () => {
  const pageTitle = 'Movies';

  const movies = [
    { id: 1, title: 'The Shawshank Redemption', year: 1994, type: 'Drama', country: 'USA', genre: 'Drama', duration: 142, posterUrl: null },
    { id: 2, title: 'The Godfather', year: 1972, type: 'Crime', country: 'USA', genre: 'Crime', duration: 175, posterUrl: null },
    { id: 3, title: 'The Dark Knight', year: 2008, type: 'Action', country: 'USA', genre: 'Action', duration: 152, posterUrl: null },
    { id: 4, title: 'Pulp Fiction', year: 1994, type: 'Crime', country: 'USA', genre: 'Crime', duration: 154, posterUrl: null },
    { id: 5, title: 'Forrest Gump', year: 1994, type: 'Drama', country: 'USA', genre: 'Drama', duration: 142, posterUrl: null },
  ];

  const [flippedStates, setFlippedStates] = useState({});

  const handleCardFlip = (movieId) => {
    setFlippedStates(prevStates => ({
      ...prevStates,
      [movieId]: !prevStates[movieId]
    }));
  };

  const handleAddMovieClick = () => {
    alert('Navigate to Add New Movie form (not implemented yet)');
  };

  const handleEditMovie = (movieId) => {
    alert(`Navigate to Edit Movie form for movie ID: ${movieId} (not implemented yet)`);
  };

  const handleDeleteMovie = (movieId) => {
    alert(`Delete movie with ID: ${movieId} (not implemented yet)`);
  };

  // Hằng số flipCardStyles đã được xóa bỏ

  return (
    <>
      {/* Thẻ <style> đã được xóa bỏ */}
      <div className="movies-page-container" style={{ padding: '2rem' }}>
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
          <input
            type="text"
            placeholder="Search movies..."
            style={{
              marginRight: '1rem',
              padding: '0.5rem 1rem',
              border: '1px solid #ced4da',
              borderRadius: '20px',
              flex: '1',
              maxWidth: '500px',
              backgroundColor: '#f8f9fa',
            }}
          />
          <Button variant="primary" size="medium" onClick={handleAddMovieClick}>
            + Add New Movie
          </Button>
        </div>

        <div className="movies-list-cards">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className={`flip-card ${flippedStates[movie.id] ? 'flipped' : ''}`}
              onClick={(e) => {
                if (e.target.closest('button')) return;
                handleCardFlip(movie.id);
              }}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <div className="poster-area">
                    Poster Film
                  </div>
                  <div className="film-name-front">{movie.title}</div>
                </div>

                <div className="flip-card-back">
                  <div className="film-info-content">
                    <h4>Film's Info</h4>
                    <p><strong>Name:</strong> {movie.title}</p>
                    <p><strong>Kind of Film:</strong> {movie.type}</p>
                    <p><strong>Nation:</strong> {movie.country}</p>
                    <p><strong>Times:</strong> {movie.duration} min</p>
                  </div>
                  <div className="film-actions">
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteMovie(movie.id)}
                      title="Delete Film"
                    >
                      🗑️
                    </button>
                    <button
                      className="edit-button"
                      onClick={() => handleEditMovie(movie.id)}
                      title="Edit Info"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {movies.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem', color: '#6c757d' }}>
            <p>No movies to display. Try adding a new one!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MoviesPage;