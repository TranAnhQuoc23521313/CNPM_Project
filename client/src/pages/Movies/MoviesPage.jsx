import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Thêm dòng này
import Button from '../../components/common/Button.jsx';
import './MoviesPage.css'; // CSS riêng của MoviesPage
import AddMovieModal from './AddMovieModal.jsx';
import EditMovieModal from './EditMovieModal.jsx';
import MovieDetailModal from './MovieDetailModal.jsx';
import { getAllMoviesApi } from '../../services/movieApiService.js';

// --- DỮ LIỆU GIẢ LẬP BAN ĐẦU (Bao gồm các trường mới) ---
/* const initialMoviesData = [
  { 
    id: 1, title: 'The Shawshank Redemption', year: 1994, type: 'Drama', country: 'USA', 
    genre: 'Drama', duration: 142, posterUrl: null, posterPlaceholder: 'Poster SR',
    director: 'Frank Darabont', 
    language: 'English',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
  },
  { 
    id: 2, title: 'The Godfather', year: 1972, type: 'Crime', country: 'USA', 
    genre: 'Crime', duration: 175, posterUrl: null, posterPlaceholder: 'Poster GF',
    director: 'Francis Ford Coppola',
    language: 'English, Italian, Latin',
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'
  },
  { 
    id: 3, title: 'The Dark Knight', year: 2008, type: 'Action', country: 'USA', 
    genre: 'Action, Crime, Drama', duration: 152, posterUrl: null, posterPlaceholder: 'Poster DK',
    director: 'Christopher Nolan',
    language: 'English, Mandarin',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.'
  },
  { 
    id: 4, title: 'Pulp Fiction', year: 1994, type: 'Crime', country: 'USA', 
    genre: 'Crime, Drama', duration: 154, posterUrl: null, posterPlaceholder: 'Poster PF',
    director: 'Quentin Tarantino',
    language: 'English, Spanish, French',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.'
  },
  { 
    id: 5, title: 'Forrest Gump', year: 1994, type: 'Drama', country: 'USA', 
    genre: 'Drama, Romance', duration: 142, posterUrl: null, posterPlaceholder: 'Poster FG',
    director: 'Robert Zemeckis',
    language: 'English',
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.'
  },
]; */
// --- KẾT THÚC DỮ LIỆU GIẢ LẬP ---

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

const MoviesPage = () => {
  const pageTitle = 'Movies';
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedStates, setFlippedStates] = useState({});
  
  // States cho các Modals
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [isEditMovieModalOpen, setIsEditMovieModalOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState(null);
  const [isMovieDetailModalOpen, setIsMovieDetailModalOpen] = useState(false);
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState(null);
  const [movieToDelete, setMovieToDelete] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- LẤY DỮ LIỆU PHIM TỪ API ---
  // Sử dụng useEffect để lấy dữ liệu phim từ API
  const fetchMoviesFromApi = async () => {
      console.log('MoviesPage: Attempting to fetch movies...');
      setIsLoading(true);
      setError(null);
      try {
          const response = await getAllMoviesApi();
          console.log('MoviesPage: Movies fetched successfully:', response);
          const mappedMovies = response.map(mapApiToClient); // Chuyển đổi dữ liệu từ API
          setMovies(mappedMovies);
          console.log('MoviesPage: Movies fetched and set to state', mappedMovies);
          setFilteredMovies(mappedMovies);
      } catch (err) {
            console.error("MoviesPage: Error fetching movies", err);
            setError(err.message || "An error occurred while fetching movies.");
        } finally {
            setIsLoading(false);
        }
    };

  // Lấy dữ liệu phim từ API khi component mount
  useEffect(() => {
    fetchMoviesFromApi();
  }, []);

  // --- HÀM HANDLER ---
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const currentItems = movies; 
    const filtered = currentItems.filter(movie => movie.title.toLowerCase().includes(query));
    setFilteredMovies(filtered);
  };

  // Add Modal
  const handleOpenAddMovieModal = () => { setIsAddMovieModalOpen(true); };
  const handleCloseAddMovieModal = () => { setIsAddMovieModalOpen(false); };
  const handleAddMovieSubmit = (newMovieData) => {
    const newMovieId = Date.now(); 
    const movieToAdd = {
      ...newMovieData, id: newMovieId,
      posterPlaceholder: `Poster ${newMovieData.title.split(' ')[0] || 'Movie'}` // Tạo placeholder
    };
    const newMoviesList = [movieToAdd, ...movies];
    setMovies(newMoviesList);
    setFilteredMovies(newMoviesList.filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase())));
    alert(`Added new movie: ${newMovieData.title}`);
    handleCloseAddMovieModal();
  };

  // Edit Modal
  const handleOpenEditMovieModal = (movie) => { setMovieToEdit(movie); setIsEditMovieModalOpen(true); };
  const handleCloseEditMovieModal = () => { setIsEditMovieModalOpen(false); setMovieToEdit(null); };
  const handleUpdateMovieSubmit = (movieId, updatedData) => {
    const updatedMoviesList = movies.map(movie => movie.id === movieId ? { ...movie, ...updatedData } : movie);
    setMovies(updatedMoviesList);
    setFilteredMovies(updatedMoviesList.filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase())));
    alert('Movie updated successfully!');
    handleCloseEditMovieModal();
  };

  // Detail Modal
  const handleOpenMovieDetailModal = (movie) => { setSelectedMovieForDetails(movie); setIsMovieDetailModalOpen(true); };
  const handleCloseMovieDetailModal = () => { setIsMovieDetailModalOpen(false); setSelectedMovieForDetails(null); };

  // Delete Confirmation Modal
  const handleDeleteClick = (movie) => { setMovieToDelete(movie); };
  const confirmDelete = () => {
    if (movieToDelete) {
      const newMovies = movies.filter(m => m.id !== movieToDelete.id);
      setMovies(newMovies);
      setFilteredMovies(newMovies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())));
      alert(`Đã xóa phim: ${movieToDelete.title}`);
      setMovieToDelete(null);
    }
  };
  const cancelDelete = () => { setMovieToDelete(null); };

  // Flip Card
  const handleCardFlip = (movieId) => { setFlippedStates(prev => ({ ...prev, [movieId]: !prev[movieId] })); };
  // --- KẾT THÚC HÀM HANDLER ---

  const moviesToDisplay = filteredMovies;

  return (
    <>
      <div className="page-container movies-page-container">
        {/* Header */}
        <div className="page-header movies-page-header">
          <h1>{pageTitle}</h1>
          <input type="text" placeholder="Search movies by title..." className="page-header-search-input" value={searchQuery} onChange={handleSearchChange}/>
          <Button variant="primary" size="medium" onClick={handleOpenAddMovieModal}> + Add New Movie</Button>
        </div>

        {/* Movie Cards */}
        <div className="movies-list-cards">
          {moviesToDisplay.length > 0 ? (
            moviesToDisplay.map((movie) => (
            <div key={movie.id} className={`flip-card ${flippedStates[movie.id] ? 'flipped' : ''}`} 
                 onClick={(e) => { 
                    if (e.target.closest('.film-actions button, .film-actions .btn, .view-detail-button')) return; 
                    handleCardFlip(movie.id); 
                 }}>
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <div className="poster-area">{movie.posterPlaceholder || 'Poster Film'}</div>
                  <div className="film-name-front">{movie.title}</div>
                </div>
                <div className="flip-card-back">
                  <div className="film-info-content">
                    <h4>Thông tin tóm tắt</h4>
                    <p><strong>Tên:</strong> {movie.title}</p>
                    <p><strong>Thể loại:</strong> {movie.genre || movie.type}</p>
                    <p><strong>Quốc gia:</strong> {movie.country}</p>
                    <p><strong>Thời lượng:</strong> {movie.duration} min</p>
                    <button 
                        className="view-detail-button" 
                        onClick={(e) => { e.stopPropagation(); handleOpenMovieDetailModal(movie); }}
                    >
                        Xem đầy đủ chi tiết
                    </button>
                  </div>
                  <div className="film-actions">
                     <Button variant="danger" size="small" onClick={(e) => { e.stopPropagation(); handleDeleteClick(movie); }}>Delete</Button>
                     <Button variant="secondary" size="small" onClick={(e) => { e.stopPropagation(); handleOpenEditMovieModal(movie); }}>Edit</Button>
                  </div>
                </div>
              </div>
            </div>
          ))
         ) : (
            <p className="no-items-found">{searchQuery ? 'No movies found matching your search.' : 'No movies available.'}</p>
         )}
        </div>
      </div>

      {/* Modals */}
      <AddMovieModal isOpen={isAddMovieModalOpen} onClose={handleCloseAddMovieModal} onAddMovie={handleAddMovieSubmit} />
      <EditMovieModal isOpen={isEditMovieModalOpen} onClose={handleCloseEditMovieModal} movie={movieToEdit} onUpdateMovie={handleUpdateMovieSubmit}/>
      <MovieDetailModal isOpen={isMovieDetailModalOpen} onClose={handleCloseMovieDetailModal} movie={selectedMovieForDetails} />
      
      {/* Modal Xác Nhận Xóa */}
       {movieToDelete && (
         <div className="modal-overlay confirmation-overlay" onClick={cancelDelete}>
           <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
             <h3>Xác nhận xóa</h3>
             <p>Bạn có chắc chắn muốn xóa phim "{movieToDelete.title}"?</p>
             <div className="confirmation-actions">
               <button onClick={cancelDelete} className="cancel-btn">Không</button>
               <button onClick={confirmDelete} className="confirm-delete-btn">Có, Xóa</button>
             </div>
           </div>
         </div>
       )}
    </>
  );
};
export default MoviesPage;