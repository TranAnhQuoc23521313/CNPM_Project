// src/pages/Showtimes/ShowtimesPage.jsx

import React, { useState } from 'react';
import Button from '../../components/common/Button.jsx'; // Đảm bảo đường dẫn đúng
import './Showtimes.css'; // CSS riêng cho trang này
import ShowtimeListModal from './ShowtimeListModal.jsx'; 
import ShowtimeDetailModal from './ShowtimeDetailModal.jsx'; 
import AddShowtimeModal from './AddShowtimeModal.jsx'; 

// --- DỮ LIỆU GIẢ LẬP BAN ĐẦU ---
const initialMoviesData = [
  { id: 1, title: 'The Shawshank Redemption', year: 1994, posterUrl: null },
  { id: 2, title: 'The Godfather', year: 1972, posterUrl: null },
  { id: 3, title: 'The Dark Knight', year: 2008, posterUrl: null },
  { id: 4, title: 'Pulp Fiction', year: 1994, posterUrl: null },
  { id: 5, title: 'Forrest Gump', year: 1994, posterUrl: null },
];

const screensData = [ // Dữ liệu phòng chiếu
  { id: 'screen1', name: 'Screen 1' },
  { id: 'screen2', name: 'Screen 2' },
  { id: 'screen3', name: 'Screen 3 (VIP)' },
  { id: 'screen4', name: 'IMAX Hall' },
  { id: 'screen5', name: 'Kids Zone Screen' },
];

// Hàm generateMockShowtimes (bao gồm cả kiểm tra screensData)
const generateMockShowtimes = (movieId, movieTitle) => {
  const baseDate = new Date();
  const mockShowtimes = [];
  const numShowtimes = Math.floor(Math.random() * 3) + 2;

  if (!screensData || screensData.length === 0) {
    console.error("screensData is empty or undefined! Cannot generate showtimes.");
    return [];
  }

  for (let i = 0; i < numShowtimes; i++) {
    const hour = 10 + i * 3 + (movieId % 2);
    const minute = (i * 15 + movieId * 7) % 60;
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + (i % 3));
    const screenIndex = (movieId + i) % screensData.length;
    const selectedScreen = screensData[screenIndex];
    mockShowtimes.push({
      id: parseInt(`${movieId}0${i + 1}`),
      movieId: movieId, // Lưu lại movieId
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      date: date.toISOString().split('T')[0],
      screen: selectedScreen.name,
      screenId: selectedScreen.id,
      price: (45 + (i * 5)) * 1000,
      filmDetails: `Details for "${movieTitle}" at ${hour}:${minute} on ${selectedScreen.name}`,
    });
  }
  return mockShowtimes;
};
// --- KẾT THÚC DỮ LIỆU GIẢ LẬP ---

const ShowtimesPage = () => {
  const pageTitle = 'Xuất chiếu';
  
  // State quản lý danh sách phim gốc (có thể thay đổi do thêm/sửa/xóa showtimes)
  const [movies, setMovies] = useState( 
    initialMoviesData.map(movie => ({ 
      ...movie, 
      showtimes: null // Khởi tạo showtimes là null
    })) 
  );
  // State quản lý danh sách phim hiển thị sau khi lọc
  const [filteredMovies, setFilteredMovies] = useState(movies); // Ban đầu hiển thị tất cả
  const [searchQuery, setSearchQuery] = useState(''); 
  
  // State cho các modals
  const [isMovieListModalOpen, setIsMovieListModalOpen] = useState(false);
  const [movieForListModal, setMovieForListModal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedShowtimeForDetail, setSelectedShowtimeForDetail] = useState(null);
  const [parentMovieForDetail, setParentMovieForDetail] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- HÀM HANDLER ---
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    // Lọc từ danh sách state `movies` hiện tại
    const filtered = movies.filter(movie => 
      movie.title.toLowerCase().includes(query)
    );
    setFilteredMovies(filtered); // Cập nhật danh sách hiển thị
  };

  const handleAddShowtimeOverallClick = () => {
    setIsAddModalOpen(true); 
  };

  const openMovieListModal = (movieId) => {
    const movieIndex = movies.findIndex(m => m.id === movieId);
    if (movieIndex !== -1) {
      let movieToShow = { ...movies[movieIndex] };
      // Chỉ generate showtimes nếu chưa có
      if (!movieToShow.showtimes) { 
        movieToShow.showtimes = generateMockShowtimes(movieId, movieToShow.title);
        // Cập nhật state gốc nếu muốn lưu lại showtimes đã tạo
        const updatedMovies = [...movies];
        updatedMovies[movieIndex] = movieToShow;
        setMovies(updatedMovies); 
        // Cập nhật cả danh sách lọc nếu phim này đang hiển thị
        setFilteredMovies(prevFiltered => 
          prevFiltered.map(fm => fm.id === movieId ? movieToShow : fm)
        );
      }
      setMovieForListModal(movieToShow);
      setIsMovieListModalOpen(true);
    }
  };

  const closeMovieListModal = () => {
    setIsMovieListModalOpen(false);
    setMovieForListModal(null);
  };

  const handleShowtimeSelectForDetail = (selectedShowtime) => {
    closeMovieListModal(); 
    const parentMovie = movies.find(m => m.id === selectedShowtime.movieId);
    if (parentMovie) {
        setSelectedShowtimeForDetail(selectedShowtime);
        setParentMovieForDetail(parentMovie);
        setIsDetailModalOpen(true);
    } else {
        console.error("Could not find parent movie for the selected showtime:", selectedShowtime);
    }
  };

  const handleCloseShowtimeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedShowtimeForDetail(null);
    setParentMovieForDetail(null);
  };

  const closeAddShowtimeModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddShowtimeSubmit = (newShowtimeData) => {
    console.log('Adding new showtime:', newShowtimeData);
    const movieIndex = movies.findIndex(m => m.id === newShowtimeData.movieId); 
    if (movieIndex !== -1) {
        const updatedMovies = [...movies];
        const newId = Date.now(); 
        const showtimeToAdd = {
            ...newShowtimeData,
            id: newId,
            movieId: newShowtimeData.movieId, 
            filmDetails: `Details for "${newShowtimeData.movieTitle}" at ${newShowtimeData.time} on ${newShowtimeData.screenName}`,
        };
        if (!updatedMovies[movieIndex].showtimes) {
            updatedMovies[movieIndex].showtimes = [];
        }
        updatedMovies[movieIndex].showtimes.unshift(showtimeToAdd); 
        setMovies(updatedMovies); // Cập nhật state gốc

        // Cập nhật lại danh sách lọc
        setFilteredMovies(updatedMovies.filter(movie => 
          movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        ));

        alert('Thêm suất chiếu thành công!');
        closeAddShowtimeModal(); 
    } else {
        alert('Lỗi: Không tìm thấy phim để thêm suất chiếu.');
    }
  };
  // --- KẾT THÚC HÀM HANDLER ---

  const moviesToDisplay = filteredMovies; // Luôn hiển thị danh sách đã lọc

  // --- PHẦN RENDER ---
  return (
    <div className="page-container showtimes-management-page"> {/* Sử dụng class chung page-container */}
      {/* Header sử dụng class chung */}
      <div className="page-header"> 
        <h1>{pageTitle}</h1>
        <input 
          type="text" 
          placeholder="Search movies by title..." // Cập nhật placeholder
          className="page-header-search-input" // Class chung
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <Button variant="primary" size="medium" onClick={handleAddShowtimeOverallClick}>
          + Add Showtime
        </Button>
      </div>

      {/* Movie Cards Container */}
      <div className="movie-cards-container">
        {moviesToDisplay.length > 0 ? (
          moviesToDisplay.map((movie) => (
            <div key={movie.id} className="movie-card-item">
              <div className="movie-poster-display" title={movie.title}>
                {movie.posterUrl ? ( <img src={movie.posterUrl} alt={`${movie.title} Poster`} className="actual-poster-img" /> ) : ( <span className="poster-placeholder-text">Poster</span> )}
              </div>
              <div className="movie-title-bar">{movie.title}</div>
              <button className="showtime-toggle-button" onClick={() => openMovieListModal(movie.id)}>Showtimes</button>
            </div>
          ))
         ) : (
            <p className="no-items-found">
                {searchQuery ? 'No movies found matching your search.' : 'No movies available.'}
            </p>
         )}
      </div>

      {/* Modals */}
      {isMovieListModalOpen && movieForListModal && (
        <ShowtimeListModal
          movie={movieForListModal}
          onClose={closeMovieListModal}
          onSelectShowtime={handleShowtimeSelectForDetail}
        />
      )}
      {isDetailModalOpen && selectedShowtimeForDetail && parentMovieForDetail && (
        <ShowtimeDetailModal
          movie={parentMovieForDetail}
          showtimeIdFromParent={selectedShowtimeForDetail.id}
          onClose={handleCloseShowtimeDetailModal}
        />
      )}
      <AddShowtimeModal
        isOpen={isAddModalOpen}
        onClose={closeAddShowtimeModal}
        movies={initialMoviesData} // Chỉ cần danh sách phim gốc để chọn trong modal Add
        screens={screensData}
        onAddShowtime={handleAddShowtimeSubmit}
      />
    </div>
  );
};

export default ShowtimesPage;