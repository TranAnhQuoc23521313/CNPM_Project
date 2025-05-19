import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Thêm dòng này
import Button from '../../../components/common/Button.jsx';
import './MoviesPage.css'; // CSS riêng của MoviesPage
import AddMovieModal from './AddMovieModal.jsx';
import EditMovieModal from './EditMovieModal.jsx';
import MovieDetailModal from './MovieDetailModal.jsx';
import DeleteMovieModal from './DeleteMovieModal.jsx'; // Giả sử bạn có component DeleteMovieModal
import { getAllMoviesApi, createMovieApi, updateMovieApi, deleteMovieApi } from '../../../services/movieApiService.js';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal.jsx';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal.jsx'; // Giả sử bạn có component SuccessMessageModal
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
  const pageTitle = 'Quản lý phim';
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

  // State cho Modal thông báo lỗi
  const [errorToDisplay, setErrorToDisplay] = useState(null); // null khi không có lỗi, string khi có lỗi

  // State cho Modal thông báo thành công
  const [successMessage, setSuccessMessage] = useState(null);

  // --- LẤY DỮ LIỆU PHIM TỪ API ---
  // Sử dụng useEffect để lấy dữ liệu phim từ API
  const fetchMoviesFromApi = async () => {
    console.log('MoviesPage: Attempting to fetch movies...');
    setIsLoading(true);
    //setError(null);
    try {
      const response = await getAllMoviesApi();
      console.log('MoviesPage: Movies fetched successfully:', response);
      const mappedMovies = response.map(mapApiToClient); // Chuyển đổi dữ liệu từ API
      setMovies(mappedMovies);
      console.log('MoviesPage: Movies fetched and set to state', mappedMovies);
      setFilteredMovies(mappedMovies);
    } catch (err) {
      console.error("MoviesPage: Error fetching movies", err);
      const displayError = err.message || "An error occurred while fetching movies.";
      setErrorToDisplay(displayError);
      //setError(err.message || "An error occurred while fetching movies.");
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
  const handleAddMovieSubmit = useCallback(async (formDataFromModal) => {
    console.log('MoviesPage: handleAddMovieSubmit called with:', formDataFromModal);
    setIsLoading(true);
    setError(null);

    const dataPayload = new FormData();
    // Server sẽ tự sinh MAPHIM
    dataPayload.append('TENPHIM', formDataFromModal.TENPHIM); // Sử dụng tên trường từ AddMovieModal
    dataPayload.append('NAMPH', formDataFromModal.NAMPH);
    dataPayload.append('THELOAI', formDataFromModal.THELOAI);
    dataPayload.append('QUOCGIA', formDataFromModal.QUOCGIA || '');
    dataPayload.append('THOILUONG', formDataFromModal.THOILUONG || 0);
    dataPayload.append('DAODIEN', formDataFromModal.DAODIEN || '');
    dataPayload.append('NGONNGU', formDataFromModal.NGONNGU || '');
    dataPayload.append('MOTA', formDataFromModal.MOTA || '');

    // Trong AddMovieModal, bạn đặt tên là HINHANH cho file
    if (formDataFromModal.HINHANH) { // Kiểm tra HINHANH (là posterFile)
      dataPayload.append('HINHANH_FILE', formDataFromModal.HINHANH, formDataFromModal.HINHANH.name);
      console.log('MoviesPage: Appended HINHANH_FILE to FormData');
    } else {
      console.log('MoviesPage: No posterFile (HINHANH) to append.');
    }

    try {
      const newMovie = await createMovieApi(dataPayload);
      console.log('MoviesPage: Movie added successfully via API', newMovie);
      setSuccessMessage(`Phim "${newMovie.TENPHIM}" được thêm thành công!`);
      // handleCloseAddMovieModal đã được useCallback, gọi trực tiếp
      handleCloseAddMovieModal();
      // fetchMoviesFromApi đã được useCallback, gọi trực tiếp
      fetchMoviesFromApi();
    } catch (err) {
      console.error("MoviesPage: Failed to add movie via API", err);
      let displayErrorMessage = "Có lỗi xảy ra: Không thể thêm phim.";
      if (err.response?.data?.message) {
        displayErrorMessage = err.response.data.message;
      } else if (err.message) {
        displayErrorMessage = err.message;
      }
      // Tùy chỉnh thông báo nếu là lỗi trùng lặp cụ thể
      if (displayErrorMessage.toLowerCase().includes("already exists") || displayErrorMessage.toLowerCase().includes("duplicate")) {
        displayErrorMessage = "Phim bạn vừa nhập đã tồn tại trong hệ thống.";
      }
      setErrorToDisplay(displayErrorMessage); // HIỂN THỊ LỖI QUA MODAL
    } finally {
      setIsLoading(false);
    }
  }, [fetchMoviesFromApi, handleCloseAddMovieModal]); // Dependencies cho useCallback

  // Edit Modal
  const handleOpenEditMovieModal = (movie) => { setMovieToEdit(movie); setIsEditMovieModalOpen(true); };
  const handleCloseEditMovieModal = () => { setIsEditMovieModalOpen(false); setMovieToEdit(null); };
  const handleUpdateMovieSubmit = useCallback(async (movieId, updatedDataFromModal) => {
    console.log(`MoviesPage: handleUpdateMovieSubmit for ID ${movieId} with data from modal:`, JSON.stringify(updatedDataFromModal, null, 2));
    setIsLoading(true);
    setError(null);

    const dataPayload = new FormData();

    // Đọc trực tiếp các key đã là tên trường server từ updatedDataFromModal
    if (updatedDataFromModal.TENPHIM !== undefined) dataPayload.append('TENPHIM', updatedDataFromModal.TENPHIM);
    if (updatedDataFromModal.NAMPH !== undefined) {
      dataPayload.append('NAMPH', updatedDataFromModal.NAMPH === null ? '' : updatedDataFromModal.NAMPH.toString());
    }
    if (updatedDataFromModal.THELOAI !== undefined) dataPayload.append('THELOAI', updatedDataFromModal.THELOAI);
    if (updatedDataFromModal.QUOCGIA !== undefined) dataPayload.append('QUOCGIA', updatedDataFromModal.QUOCGIA);
    if (updatedDataFromModal.THOILUONG !== undefined) {
      dataPayload.append('THOILUONG', updatedDataFromModal.THOILUONG === null ? '' : updatedDataFromModal.THOILUONG.toString());
    }
    if (updatedDataFromModal.DAODIEN !== undefined) dataPayload.append('DAODIEN', updatedDataFromModal.DAODIEN);
    if (updatedDataFromModal.NGONNGU !== undefined) dataPayload.append('NGONNGU', updatedDataFromModal.NGONNGU);
    if (updatedDataFromModal.MOTA !== undefined) dataPayload.append('MOTA', updatedDataFromModal.MOTA);


    // Xử lý file ảnh (logic này có vẻ ổn từ trước, dựa trên newPosterFile và currentPosterDisplayUrl)
    if (updatedDataFromModal.newPosterFile) {
      dataPayload.append('HINHANH_FILE', updatedDataFromModal.newPosterFile, updatedDataFromModal.newPosterFile.name);
      console.log('MoviesPage: Appended NEW HINHANH_FILE to FormData for update');
    } else if (updatedDataFromModal.currentPosterDisplayUrl === null) {
      // Người dùng muốn xóa ảnh (ví dụ: đã nhấn "Remove Poster" trong EditModal)
      dataPayload.append('HINHANH', ''); // Gửi chuỗi rỗng để server hiểu là xóa
      console.log('MoviesPage: Sending empty HINHANH to delete poster');
    } else {
      // Không có file mới, và currentPosterDisplayUrl không phải null
      // => Có thể là giữ lại ảnh cũ. Server không nên cập nhật HINHANH nếu không có HINHANH_FILE
      // và HINHANH không phải là chuỗi rỗng.
      // Nếu bạn muốn server *luôn* nhận được giá trị HINHANH (dù là giữ cũ), bạn có thể gửi lại HINHANH gốc.
      const originalMovie = movies.find(m => m.id === movieId);
      if (originalMovie && updatedDataFromModal.currentPosterDisplayUrl === originalMovie.posterUrl && originalMovie.HINHANH) {
        // dataPayload.append('HINHANH', originalMovie.HINHANH); // Gửi lại đường dẫn ảnh gốc từ DB
        console.log('MoviesPage: Keeping existing image. HINHANH field for update will rely on server logic if not explicitly sent or cleared.');
      }
    }

    console.log('MoviesPage: FormData entries being sent for update:');
    for (let pair of dataPayload.entries()) {
      console.log(pair[0], '=', pair[1] instanceof File ? pair[1].name : pair[1]);
    }

    try {
      const updatedMovieResult = await updateMovieApi(movieId, dataPayload); // Gọi API service
      console.log('MoviesPage: Movie updated successfully via API', updatedMovieResult);
      //setSuccessMessage('Movie updated successfully!');
      //setSuccessMessage(`Phim "${updatedMovieResult.TENPHIM}" được chỉnh sửa thành công!`);
      setSuccessMessage(`Phim "${updatedDataFromModal.TENPHIM}" được thêm thành công!`);
      handleCloseEditMovieModal();
      fetchMoviesFromApi(); // Tải lại danh sách
    } catch (err) {
      console.error("MoviesPage: Failed to update movie. Full error object:", err);
      let displayErrorMessage = "Có lỗi xảy ra: Thay đổi thất bại.";
      if (err.response?.data?.message) {
        displayErrorMessage = err.response.data.message;
      } else if (err.message) {
        displayErrorMessage = err.message;
      }
      if (displayErrorMessage.toLowerCase().includes("already exists") || displayErrorMessage.toLowerCase().includes("duplicate")) {
        displayErrorMessage = "Cập nhật sẽ tạo ra phim trùng lặp với một phim khác đã tồn tại.";
      }
      setErrorToDisplay(displayErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [movies, fetchMoviesFromApi, handleCloseEditMovieModal]); // Dependencies

  // Detail Modal
  const handleOpenMovieDetailModal = (movie) => { setSelectedMovieForDetails(movie); setIsMovieDetailModalOpen(true); };
  const handleCloseMovieDetailModal = () => { setIsMovieDetailModalOpen(false); setSelectedMovieForDetails(null); };

  // Delete Confirmation Modal
  const handleDeleteClick = useCallback((movie) => {
    console.log('MoviesPage: handleDeleteClick for movie:', movie);
    setMovieToDelete(movie);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!movieToDelete) return;

    console.log(`MoviesPage: Confirming deletion for movie ID: ${movieToDelete.id}`);
    setIsLoading(true);
    setError(null);
    try {
      await deleteMovieApi(movieToDelete.id); // Gọi API service
      setSuccessMessage(`Phim "${movieToDelete.title}" đã được xóa thành công.`);
      setMovieToDelete(null); // Đóng modal xác nhận
      fetchMoviesFromApi(); // Tải lại danh sách phim
    } catch (err) {
      console.error("MoviesPage: Failed to delete movie. Full error object:", err);
      let displayErrorMessage = "Could not delete movie. An unknown error occurred.";
      if (err.response?.data?.message) {
        displayErrorMessage = err.response.data.message;
      } else if (err.message) {
        displayErrorMessage = err.message;
      }
      setErrorToDisplay(displayErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [movieToDelete, fetchMoviesFromApi]); // Dependencies

  const cancelDelete = useCallback(() => {
    console.log('MoviesPage: Deletion cancelled.');
    setMovieToDelete(null);
  }, []);


  // Error Modal
  const handleCloseErrorModal = useCallback(() => {
    setErrorToDisplay(null);
  }, []);

  // Success Modal
  const handleCloseSuccessModal = useCallback(() => {
    setSuccessMessage(null);
  }, []);

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
          <input type="text" placeholder="Search movies by title..." className="page-header-search-input" value={searchQuery} onChange={handleSearchChange} />
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
                    <div className="poster-area">
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title || 'Movie poster'} className="poster-area img" />
                      ) : (
                        <span className="poster-placeholder-text">{movie.posterPlaceholder || 'No Poster'}</span>
                      )}
                    </div>
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
      <EditMovieModal isOpen={isEditMovieModalOpen} onClose={handleCloseEditMovieModal} movie={movieToEdit} onUpdateMovie={handleUpdateMovieSubmit} />
      <MovieDetailModal isOpen={isMovieDetailModalOpen} onClose={handleCloseMovieDetailModal} movie={selectedMovieForDetails} />
      <ErrorMessageModal isOpen={!!errorToDisplay} onClose={handleCloseErrorModal} errorMessage={errorToDisplay} />
      <SuccessMessageModal isOpen={!!successMessage} onClose={handleCloseSuccessModal} successMessage={successMessage} />
      {/* Modal Xác Nhận Xóa */}
      {/*movieToDelete && (
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
      )  */}
      <DeleteMovieModal
        isOpen={!!movieToDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        movieName={movieToDelete ? movieToDelete.title : ''}
        isLoading={isLoading}>  </DeleteMovieModal>
    </>
  );
};
export default MoviesPage;