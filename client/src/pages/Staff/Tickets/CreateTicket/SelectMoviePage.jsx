// src/pages/Staff/Tickets/CreateTicket/SelectMoviePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/common/Button'; // Điều chỉnh đường dẫn
import './CreateTicketWorkflow.css'; // CSS chung cho workflow này

const mockMovies = [{ id: 1, title: 'Godzilla x Kong: Đế Chế Mới', posterUrl: 'https://image.tmdb.org/t/p/w185/v4uV53L4P6h4HnZDx7ELhN1HkX1.jpg', duration: 115, genre: 'Hành động, Viễn tưởng' },
                    { id: 2, title: 'Kung Fu Panda 4', posterUrl: 'https://image.tmdb.org/t/p/w185/kDp1vUBnMfTfS5iS7M05Y703s3s.jpg', duration: 94, genre: 'Hoạt hình, Phiêu lưu' },
                    { id: 3, title: 'Dune: Part Two', posterUrl: 'https://image.tmdb.org/t/p/w185/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', duration: 166, genre: 'Khoa học viễn tưởng, Phiêu lưu' },
];
const STAFF_BASE_PATH = "/staff";

const SelectMoviePage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState(mockMovies); // Sau này lấy từ API
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const handleMovieSelect = (movieId) => {
    setSelectedMovieId(movieId);
  };

  const handleNext = () => {
    if (selectedMovieId) {
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-showtime`, { state: { movieId: selectedMovieId } });
    } else {
      alert('Vui lòng chọn một phim.');
    }
  };

  return (
    <div className="create-ticket-step">
      <h2>Bước 1: Chọn Phim</h2>
      <div className="movie-list-workflow">
        {movies.map(movie => (
          <div
            key={movie.id}
            className={`movie-card-workflow ${selectedMovieId === movie.id ? 'selected' : ''}`}
            onClick={() => handleMovieSelect(movie.id)}
          >
            <img src={movie.posterUrl || 'https://via.placeholder.com/100x150?text=No+Image'} alt={movie.title} />
            <p>{movie.title}</p>
          </div>
        ))}
      </div>
      <div className="workflow-actions">
        <Button onClick={handleNext} disabled={!selectedMovieId} variant="primary">Tiếp tục: Chọn Suất Chiếu</Button>
      </div>
    </div>
  );
};
export default SelectMoviePage;