import React, { useState } from 'react';
import Button from '../../components/common/Button.jsx'; // Đảm bảo đường dẫn này đúng
import './Showtimes.css'; // CSS chung của trang
import ShowtimeListModal from './ShowtimeListModal.jsx'; // Modal danh sách
import ShowtimeDetailModal from './ShowtimeDetailModal.jsx'; // Modal chi tiết + ghế
import AddShowtimeModal from './AddShowtimeModal.jsx'; // Modal thêm suất chiếu

// --- DỮ LIỆU GIẢ LẬP ---
const initialMoviesData = [
  { id: 1, title: 'The Shawshank Redemption', year: 1994, posterUrl: null },
  { id: 2, title: 'The Godfather', year: 1972, posterUrl: null },
  { id: 3, title: 'The Dark Knight', year: 2008, posterUrl: null },
  { id: 4, title: 'Pulp Fiction', year: 1994, posterUrl: null },
  { id: 5, title: 'Forrest Gump', year: 1994, posterUrl: null },
];

const screensData = [ // Sử dụng tên screensData
  { id: 'screen1', name: 'Screen 1' },
  { id: 'screen2', name: 'Screen 2' },
  { id: 'screen3', name: 'Screen 3 (VIP)' },
  { id: 'screen4', name: 'IMAX Hall' },
  { id: 'screen5', name: 'Kids Zone Screen' },
];

const generateMockShowtimes = (movieId, movieTitle) => {
  const baseDate = new Date();
  const mockShowtimes = [];
  const numShowtimes = Math.floor(Math.random() * 3) + 2; // 2 đến 4 suất chiếu

  if (!screensData || screensData.length === 0) { // Sử dụng screensData
    console.error("screensData is empty or undefined! Cannot generate showtimes.");
    return [];
  }

  for (let i = 0; i < numShowtimes; i++) {
    const hour = 10 + i * 3 + (movieId % 2);
    const minute = (i * 15 + movieId * 7) % 60;
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + (i % 3));

    const screenIndex = (movieId + i) % screensData.length; // Sử dụng screensData
    const selectedScreen = screensData[screenIndex];

    mockShowtimes.push({
      id: parseInt(`${movieId}0${i + 1}`), // Tạo ID suất chiếu
      movieId: movieId, // Thêm movieId để dễ tìm phim cha
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      date: date.toISOString().split('T')[0],
      screen: selectedScreen.name,
      screenId: selectedScreen.id, // Thêm screenId nếu cần
      price: (45 + (i * 5)) * 1000,
      filmDetails: `Details for "${movieTitle}" at ${hour}:${minute} on ${selectedScreen.name}`,
    });
  }
  return mockShowtimes;
};
// --- KẾT THÚC DỮ LIỆU GIẢ LẬP ---

const ShowtimesPage = () => {
  const pageTitle = 'Manage Showtimes';
  const [movies, setMovies] = useState(
    initialMoviesData.map(movie => ({
      ...movie,
      showtimes: null // Khởi tạo showtimes là null
    }))
  );

  // State cho Modal 1 (Danh sách)
  const [isMovieListModalOpen, setIsMovieListModalOpen] = useState(false);
  const [movieForListModal, setMovieForListModal] = useState(null);

  // State cho Modal 2 (Chi tiết + Ghế)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedShowtimeForDetail, setSelectedShowtimeForDetail] = useState(null);
  const [parentMovieForDetail, setParentMovieForDetail] = useState(null);

  // State cho Modal 3 (Thêm Suất Chiếu)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddShowtimeOverallClick = () => {
      setIsAddModalOpen(true); // Mở modal thêm suất chiếu
  };

  const handlePosterClick = (movieId) => {
      alert(`Điều hướng đến form Add/Edit Film cho phim ID: ${movieId} (chưa cài đặt)`);
  };

  // --- Xử lý Modal Danh sách Lịch chiếu ---
  const openMovieListModal = (movieId) => {
    const movieIndex = movies.findIndex(m => m.id === movieId);
    if (movieIndex !== -1) {
      let movieToShow = { ...movies[movieIndex] };
      // Chỉ generate showtimes nếu chưa có
      if (!movieToShow.showtimes) {
        movieToShow.showtimes = generateMockShowtimes(movieId, movieToShow.title);
        const updatedMovies = [...movies];
        updatedMovies[movieIndex] = movieToShow;
        setMovies(updatedMovies);
      }
      setMovieForListModal(movieToShow);
      setIsMovieListModalOpen(true);
    }
  };
  const closeMovieListModal = () => {
    setIsMovieListModalOpen(false);
    setMovieForListModal(null);
  };

  // --- Xử lý Modal Chi tiết + Ghế ---
  const handleShowtimeSelectForDetail = (selectedShowtime) => {
    closeMovieListModal(); // Đóng modal danh sách trước

    // Tìm phim cha dựa vào movieId lưu trong suất chiếu
    const parentMovie = movies.find(m => m.id === selectedShowtime.movieId);

    if (parentMovie) {
        setSelectedShowtimeForDetail(selectedShowtime);
        setParentMovieForDetail(parentMovie);
        setIsDetailModalOpen(true); // Mở modal chi tiết
    } else {
        console.error("Could not find parent movie for the selected showtime:", selectedShowtime);
        // Xử lý lỗi, ví dụ hiển thị thông báo
    }
  };
  const handleCloseShowtimeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedShowtimeForDetail(null);
    setParentMovieForDetail(null);
  };

  // --- Xử lý Modal Thêm Suất Chiếu ---
  const closeAddShowtimeModal = () => {
    setIsAddModalOpen(false);
  };
  const handleAddShowtimeSubmit = (newShowtimeData) => {
    console.log('Adding new showtime:', newShowtimeData);
    const movieIndex = movies.findIndex(m => m.id.toString() === newShowtimeData.movieId);
    if (movieIndex !== -1) {
        const updatedMovies = [...movies];
        const newId = Date.now(); // ID tạm thời
        const showtimeToAdd = {
            ...newShowtimeData,
            id: newId,
            // Bạn có thể thêm filmDetails ở đây nếu cần
        };

        // Nếu phim chưa có mảng showtimes, khởi tạo nó
        if (!updatedMovies[movieIndex].showtimes) {
            updatedMovies[movieIndex].showtimes = [];
        }
        updatedMovies[movieIndex].showtimes.push(showtimeToAdd);
        setMovies(updatedMovies);
        alert('Thêm suất chiếu thành công!');
        closeAddShowtimeModal(); // Đóng modal sau khi thêm thành công
    } else {
        alert('Lỗi: Không tìm thấy phim để thêm suất chiếu.');
    }
  };

  return (
    <div className="showtimes-management-page">
      <div className="showtimes-page-header">
        <h1>{pageTitle}</h1>
        <Button variant="primary" size="medium" onClick={handleAddShowtimeOverallClick}>
          + Add New Showtime (Overall)
        </Button>
      </div>

      <div className="movie-cards-container">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card-item">
            <div
              className="movie-poster-display"
              onClick={() => handlePosterClick(movie.id)}
              title={`Click to Edit Poster for: ${movie.title}`}
            >
              {movie.posterUrl ? (
                <img src={movie.posterUrl} alt={`${movie.title} Poster`} className="actual-poster-img" />
              ) : (
                <span className="poster-placeholder-text">Poster</span>
              )}
            </div>
            <div className="movie-title-bar">{movie.title}</div>
            <button
              className="showtime-toggle-button"
              onClick={() => openMovieListModal(movie.id)} // Mở modal danh sách
            >
              Showtimes
            </button>
          </div>
        ))}
      </div>

      {/* Modal 1: Danh sách lịch chiếu */}
      {isMovieListModalOpen && movieForListModal && (
        <ShowtimeListModal
          movie={movieForListModal}
          onClose={closeMovieListModal}
          onSelectShowtime={handleShowtimeSelectForDetail} // Callback để mở modal 2
        />
      )}

      {/* Modal 2: Chi tiết suất chiếu và ghế */}
      {isDetailModalOpen && selectedShowtimeForDetail && parentMovieForDetail && (
        <ShowtimeDetailModal
          movie={parentMovieForDetail} // Truyền phim cha
          showtimeIdFromParent={selectedShowtimeForDetail.id} // Truyền ID suất chiếu
          onClose={handleCloseShowtimeDetailModal}
        />
      )}

      {/* Modal 3: Thêm Suất Chiếu Mới */}
      <AddShowtimeModal
        isOpen={isAddModalOpen}
        onClose={closeAddShowtimeModal}
        movies={initialMoviesData} // Chỉ cần truyền danh sách phim gốc để chọn
        screens={screensData} // Truyền danh sách phòng chiếu
        onAddShowtime={handleAddShowtimeSubmit} // Callback xử lý submit
      />
    </div>
  );
};

export default ShowtimesPage; // QUAN TRỌNG: Export default