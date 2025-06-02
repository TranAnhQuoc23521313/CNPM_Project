// src/pages/Staff/Tickets/CreateTicket/SelectMoviePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/common/Button'; // Điều chỉnh đường dẫn
import './CreateTicketWorkflow.css'; // CSS chung cho workflow này
import { getAllMoviesApi } from '../../../../services/movieApiService';

/* const mockMovies = [{ id: 1, title: 'Godzilla x Kong: Đế Chế Mới', posterUrl: 'https://image.tmdb.org/t/p/w185/v4uV53L4P6h4HnZDx7ELhN1HkX1.jpg', duration: 115, genre: 'Hành động, Viễn tưởng' },
                    { id: 2, title: 'Kung Fu Panda 4', posterUrl: 'https://image.tmdb.org/t/p/w185/kDp1vUBnMfTfS5iS7M05Y703s3s.jpg', duration: 94, genre: 'Hoạt hình, Phiêu lưu' },
                    { id: 3, title: 'Dune: Part Two', posterUrl: 'https://image.tmdb.org/t/p/w185/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', duration: 166, genre: 'Khoa học viễn tưởng, Phiêu lưu' },
]; */
const STAFF_BASE_PATH = "/staff";

const mapApiToClient = (apiMovie) => ({
  id: apiMovie.MAPHIM, // Sử dụng MAPHIM làm 'id' ở client
  title: apiMovie.TENPHIM,
  year: apiMovie.NAMPH,
  type: apiMovie.THELOAI,
  country: apiMovie.QUOCGIA,
  duration: apiMovie.THOILUONG,
  director: apiMovie.DAODIEN,
  language: apiMovie.NGONNGU,
  description: apiMovie.MOTA,
  posterUrl: apiMovie.HINHANH ? `${process.env.REACT_APP_API_URL}${apiMovie.HINHANH}` : null,
  posterPlaceholder: `Poster ${apiMovie.TENPHIM?.split(' ')[0] || 'Movie'}`,
  // Giữ lại các trường gốc từ API
  MAPHIM: apiMovie.MAPHIM,
  TENPHIM: apiMovie.TENPHIM,
  THELOAI: apiMovie.THELOAI,
  NAMPH: apiMovie.NAMPH,
  DAODIEN: apiMovie.DAODIEN,
  QUOCGIA: apiMovie.QUOCGIA,
  NGONNGU: apiMovie.NGONNGU,
  MOTA: apiMovie.MOTA,
  THOILUONG: apiMovie.THOILUONG,
  HINHANH: apiMovie.HINHANH,
});

const SelectMoviePage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]); // Sau này lấy từ API
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const fetchMoviesFromApi = async () => {
    console.log('MoviesPage: Attempting to fetch movies...');

    //setError(null);
    try {
      const response = await getAllMoviesApi();
      console.log('MoviesPage: Movies fetched successfully:', response);
      const mappedMovies = response.map(mapApiToClient); // Chuyển đổi dữ liệu từ API
      setMovies(mappedMovies);
      console.log('MoviesPage: Movies fetched and set to state', mappedMovies);

    } catch (err) {
      console.error("MoviesPage: Error fetching movies", err);
      const displayError = err.message || "An error occurred while fetching movies.";
      //setErrorToDisplay(displayError);
      //setError(err.message || "An error occurred while fetching movies.");
    } finally {

    }
  };

  useEffect(() => {
    fetchMoviesFromApi();
  }, []);

  const handleMovieSelect = (movieId) => {
    setSelectedMovieId(movieId);
  };

  /* const handleNext = () => {
    if (selectedMovieId) {
      // navigate(`${STAFF_BASE_PATH}/tickets/new/select-showtime`, { state: { movieId: selectedMovieId } });
      navigate('/staff/tickets/new/select-showtime', {
        state: { movieId: chosenMovie.id, movieTitle: chosenMovie.title }
      });
    } else {
      alert('Vui lòng chọn một phim.');
    }
  }; */

  const handleNext = () => {
    if (selectedMovieId) {
      // Tìm đối tượng phim đã chọn từ danh sách `movies`
      const chosenMovie = movies.find(movie => movie.id === selectedMovieId);

      if (chosenMovie) {
        navigate(`${STAFF_BASE_PATH}/tickets/new/select-showtime`, {
          state: { movieId: chosenMovie.id, movieTitle: chosenMovie.title }
        });
      } else {
        // Trường hợp này không nên xảy ra nếu selectedMovieId hợp lệ
        alert('Phim đã chọn không tìm thấy. Vui lòng thử lại.');
        console.error('Error: Chosen movie not found for ID:', selectedMovieId);
      }
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