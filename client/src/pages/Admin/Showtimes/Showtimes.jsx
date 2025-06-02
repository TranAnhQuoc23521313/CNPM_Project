// client/src/pages/Showtimes/ShowtimesPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Button from '../../../components/common/Button.jsx';
import './Showtimes.css';
import ShowtimeListModal from './ShowtimeListModal.jsx';
import ShowtimeDetailModal from './ShowtimeDetailModal.jsx';
import AddShowtimeModal from './AddShowtimeModal.jsx';
import EditShowtimeModal from './EditShowtimeModal.jsx';
import { getAllMoviesApi } from '../../../services/movieApiService.js';
import { createShowtimeApi, getShowtimesByMovieApi, updateShowtimeApi } from '../../../services/showtimeApiService.js';
import { getAllScreensApi } from '../../../services/screenApiService.js';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal.jsx';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal.jsx';

// ... (map functions giữ nguyên)
const mapMovieApiToClientForShowtimePage = (apiMovie) => ({
    id: apiMovie.MAPHIM,
    title: apiMovie.TENPHIM,
    posterUrl: apiMovie.HINHANH ? `${process.env.REACT_APP_API_URL}${apiMovie.HINHANH}` : null,
    posterPlaceholder: `Poster ${apiMovie.TENPHIM?.split(' ')[0] || 'Movie'}`,
    HINHANH: apiMovie.HINHANH,
    TENPHIM: apiMovie.TENPHIM
});

const mapScreenApiToClient = (apiScreen) => ({
    id: apiScreen.MAPHONG,
    name: apiScreen.TENPHONG,
    totalSeats: apiScreen.SOGHE,
    status: apiScreen.TRANGTHAIPHONG,
    type: apiScreen.LOAIPHONG,
});

const mapApiShowtimeToClient = (apiShowtime) => ({
    id: apiShowtime.MASUATCHIEU,
    time: new Date(apiShowtime.THOIGIAN).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    date: new Date(apiShowtime.THOIGIAN).toLocaleDateString('vi-VN'),
    screen: apiShowtime.PHONG_TENPHONG || 'N/A',
    screenName: apiShowtime.PHONG_TENPHONG || 'N/A',
    rawDateTime: apiShowtime.THOIGIAN,
    movieId: apiShowtime.PHIM_MAPHIM,
    movieTitle: apiShowtime.PHIM_TENPHIM,
    screenId: apiShowtime.PHONG_MAPHONG,
    price: apiShowtime.GIASUATCHIEU,
    status: apiShowtime.TRANGTHAI,
});


const ShowtimesPage = () => {
    const pageTitle = 'Quản lý Suất Chiếu';

    const [movies, setMovies] = useState([]);
    const [screens, setScreens] = useState([]);
    const [isLoadingScreens, setIsLoadingScreens] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoadingShowtimes, setIsLoadingShowtimes] = useState(false);

    const [isMovieListModalOpen, setIsMovieListModalOpen] = useState(false);
    const [selectedMovieForShowtimes, setSelectedMovieForShowtimes] = useState(null);
    const [currentMovieShowtimes, setCurrentMovieShowtimes] = useState([]);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedShowtimeForDetail, setSelectedShowtimeForDetail] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [movieContextForAddShowtime, setMovieContextForAddShowtime] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showtimeToEdit, setShowtimeToEdit] = useState(null);

    const [errorToDisplay, setErrorToDisplay] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // ... (fetchMovies, fetchScreens, useEffect, moviesToDisplay, handleSearchChange giữ nguyên) ...
    const fetchMovies = useCallback(async () => {
        console.log('ShowtimesPage: Đang tải danh sách phim...');
        setIsLoading(true);
        setError(null);
        try {
            const apiMovies = await getAllMoviesApi();
            setMovies(apiMovies.map(mapMovieApiToClientForShowtimePage));
        } catch (err) {
            console.error("ShowtimesPage: Lỗi tải phim", err);
            const displayError = err.message || "Không thể tải xuống danh sách phim."
            setErrorToDisplay(displayError);
            setError(displayError);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchScreens = useCallback(async () => {
        console.log('ShowtimesPage: Đang tải danh sách phòng chiếu...');
        setIsLoadingScreens(true);
        try {
            const apiScreens = await getAllScreensApi();
            console.log('ShowtimesPage: Tải phòng chiếu thành công:', apiScreens);
            setScreens(apiScreens.map(mapScreenApiToClient));
        } catch (err) {
            console.error("ShowtimesPage: Lỗi tải phòng chiếu", err);
            const displayError = err.message || "Không thể tải danh sách phòng chiếu."
            setErrorToDisplay(displayError);
        } finally {
            setIsLoadingScreens(false);
        }
    }, []);

    useEffect(() => {
        fetchMovies();
        fetchScreens();
    }, [fetchMovies, fetchScreens]);

    const moviesToDisplay = useMemo(() => {
        if (!searchQuery) return movies;
        return movies.filter(movie =>
            movie.title && movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [movies, searchQuery]);

    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value);
    }, []);


    const openShowtimeListModal = useCallback(async (movie) => {
        if (!movie || !movie.id) return;
        console.log(`ShowtimesPage: Mở danh sách suất chiếu cho phim: ${movie.title} (ID: ${movie.id})`);
        setSelectedMovieForShowtimes(movie); // Quan trọng: set phim đang được chọn
        setIsMovieListModalOpen(true);
        setIsLoadingShowtimes(true);
        setCurrentMovieShowtimes([]);
        setErrorToDisplay(null);
        try {
            const apiShowtimes = await getShowtimesByMovieApi(movie.id);
            setCurrentMovieShowtimes(apiShowtimes.map(mapApiShowtimeToClient));
        } catch (err) {
            console.error(`ShowtimesPage: Lỗi tải suất chiếu cho phim ${movie.id}`, err);
            const displayError = err.response?.data?.message || err.message || `Không thể tải suất chiếu cho phim ${movie.title}.`;
            setErrorToDisplay(displayError);
            setCurrentMovieShowtimes([]);
        } finally {
            setIsLoadingShowtimes(false);
        }
    }, []);

    const closeShowtimeListModal = useCallback(() => {
        setIsMovieListModalOpen(false);
        // Không reset selectedMovieForShowtimes ở đây nếu muốn Detail/Edit Modal có thể quay lại list
        // Nếu không muốn quay lại, có thể reset: setSelectedMovieForShowtimes(null);
    }, []);

    const handleShowtimeSelectForDetail = useCallback((showtime) => {
        console.log("ShowtimesPage: Mở chi tiết suất chiếu:", showtime);
        setSelectedShowtimeForDetail(showtime);
        // selectedMovieForShowtimes vẫn giữ giá trị từ openShowtimeListModal
        setIsDetailModalOpen(true);
        // Giữ ShowtimeListModal mở ở nền
    }, []);

    const handleCloseShowtimeDetailModal = useCallback(() => {
        setIsDetailModalOpen(false);
        setSelectedShowtimeForDetail(null);
        // Không tự động mở lại list, để user tự quyết định
    }, []);

    // HÀM MỚI ĐỂ MỞ EDIT MODAL TỪ DETAIL MODAL
    const openEditModalFromDetailCallback = useCallback((showtimeData) => {
        console.log("ShowtimesPage: Yêu cầu mở Edit Modal cho suất chiếu:", showtimeData);
        setShowtimeToEdit(showtimeData); // showtimeData đã được mapApiShowtimeToClient
        setIsEditModalOpen(true);
        setIsDetailModalOpen(false); // Đóng Detail Modal
        // isMovieListModalOpen vẫn giữ trạng thái của nó
    }, []);


    const handleOpenAddShowtimeForSpecificMovie = useCallback((movieFromContext) => {
        setMovieContextForAddShowtime(movieFromContext || selectedMovieForShowtimes);
        setIsAddModalOpen(true);
        // Giữ ShowtimeListModal mở ở nền
    }, [selectedMovieForShowtimes]);

    const handleOpenAddShowtimeOverallModal = useCallback(() => {
        setMovieContextForAddShowtime(null);
        setIsAddModalOpen(true);
    }, []);

    const closeAddShowtimeModal = useCallback(() => {
        setIsAddModalOpen(false);
        setMovieContextForAddShowtime(null);
    }, []);

    const handleAddShowtimeSubmit = useCallback(async (newShowtimeDataFromModal) => {
        console.log('ShowtimesPage: Đang thêm suất chiếu mới:', newShowtimeDataFromModal);
        setErrorToDisplay(null);
        setSuccessMessage(null);
        try {
            await createShowtimeApi(newShowtimeDataFromModal);
            const displaySuccessMessage = `Suất chiếu cho phim "${newShowtimeDataFromModal.movieTitle}" lúc ${newShowtimeDataFromModal.time} ngày ${newShowtimeDataFromModal.date} tại phòng ${newShowtimeDataFromModal.screenName} đã được thêm thành công!`;
            setSuccessMessage(displaySuccessMessage);
            closeAddShowtimeModal();

            if (selectedMovieForShowtimes && selectedMovieForShowtimes.id === newShowtimeDataFromModal.movieId && isMovieListModalOpen) {
                await openShowtimeListModal(selectedMovieForShowtimes); // Tải lại danh sách
            }
        } catch (err) {
            console.error("ShowtimesPage: Lỗi thêm suất chiếu", err);
            const displayError = err.response?.data?.message || err.message || "Không thể thêm suất chiếu. Vui lòng kiểm tra trùng lịch hoặc thông tin phòng chiếu.";
            setErrorToDisplay(displayError);
        }
    }, [closeAddShowtimeModal, selectedMovieForShowtimes, openShowtimeListModal, isMovieListModalOpen]);

    const handleShowtimeDeleted = useCallback(async (deletedShowtimeId, movieIdOfDeletedShowtime) => {
        setSuccessMessage(`Suất chiếu ID ${deletedShowtimeId} đã được xóa thành công.`);
        handleCloseShowtimeDetailModal();

        if (selectedMovieForShowtimes && selectedMovieForShowtimes.id === movieIdOfDeletedShowtime && isMovieListModalOpen) {
            await openShowtimeListModal(selectedMovieForShowtimes); // Tải lại danh sách
        }
    }, [handleCloseShowtimeDetailModal, selectedMovieForShowtimes, openShowtimeListModal, isMovieListModalOpen]);


    const closeEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setShowtimeToEdit(null);
        // Nếu muốn quay lại list sau khi sửa và list đang mở cho phim đó:
        if (selectedMovieForShowtimes && showtimeToEdit?.movieId === selectedMovieForShowtimes.id && isMovieListModalOpen) {
            // Có thể không cần làm gì nếu isMovieListModalOpen vẫn true
        } else if (selectedMovieForShowtimes && showtimeToEdit?.movieId === selectedMovieForShowtimes.id && !isMovieListModalOpen) {
            // Nếu list đã bị đóng nhưng vẫn muốn quay lại, mở lại list
            // setIsMovieListModalOpen(true); // Điều này có thể không cần thiết, tùy vào luồng UX
        }
    }, [selectedMovieForShowtimes, showtimeToEdit, isMovieListModalOpen]);

    const handleUpdateShowtimeSubmit = useCallback(async (updatedData, showtimeId) => {
        console.log('ShowtimesPage: Đang cập nhật suất chiếu ID:', showtimeId, 'với dữ liệu:', updatedData);
        setErrorToDisplay(null);
        setSuccessMessage(null);
        try {
            const result = await updateShowtimeApi(showtimeId, updatedData);
            setSuccessMessage(result.message || `Suất chiếu ID ${showtimeId} đã được cập nhật thành công!`);
            
            const movieOfEditedShowtimeId = showtimeToEdit?.movieId;
            closeEditModal(); // Đóng edit modal

            // Nếu modal danh sách của phim đó đang mở, làm mới nó
            if (selectedMovieForShowtimes && selectedMovieForShowtimes.id === movieOfEditedShowtimeId && isMovieListModalOpen) {
                await openShowtimeListModal(selectedMovieForShowtimes);
            }
        } catch (err) {
            console.error("ShowtimesPage: Lỗi cập nhật suất chiếu", err);
            setErrorToDisplay(err.response?.data?.message || err.message || "Không thể cập nhật suất chiếu.");
        }
    }, [closeEditModal, showtimeToEdit, selectedMovieForShowtimes, openShowtimeListModal, isMovieListModalOpen]);

    const handleCloseErrorModal = useCallback(() => {
        setErrorToDisplay(null);
    }, []);

    const handleCloseSuccessModal = useCallback(() => {
        setSuccessMessage(null);
    }, []);

    // --- RENDER ---
    if (isLoading && movies.length === 0 && !error) {
        return <div className="page-container showtimes-management-page loading-container"><p>Đang tải danh sách phim...</p></div>;
    }
    if (error && movies.length === 0) {
        return (
            <div className="page-container showtimes-management-page error-container">
                <h1>{pageTitle}</h1>
                <p className="error-message">Lỗi: {error}</p>
                <Button onClick={fetchMovies}>Thử lại</Button>
            </div>
        );
    }

    return (
        <div className="showtimes-management-page page-container">
            <div className="content-card">
                <h1 className="page-main-title">{pageTitle}</h1>
                <div className="showtimes-page-header">
                    <div className="search-input-container">
                        <input
                            type="text"
                            placeholder="Tìm kiếm phim..."
                            className="showtime-search-input"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            disabled={isLoading && movies.length > 0}
                        />
                    </div>
                    <Button
                        variant="primary"
                        className="btn-add-new-showtime"
                        onClick={handleOpenAddShowtimeOverallModal}
                        disabled={isLoadingScreens || movies.length === 0 || screens.length === 0}
                    >
                        + Thêm Suất Chiếu
                    </Button>
                </div>

                {error && movies.length > 0 && <p className="error-message inline-error" style={{textAlign: 'center', marginBottom: '15px'}}>{error}</p>}
                {isLoading && movies.length > 0 && <div className="inline-loading" style={{textAlign: 'center', marginBottom: '15px'}}>Đang cập nhật...</div>}

                <div className="movie-cards-container">
                    {moviesToDisplay.length > 0 ? (
                        moviesToDisplay.map((movie) => (
                            <div key={movie.id} className="movie-card-item">
                                <div className="movie-poster-display">
                                    {movie.posterUrl ? (
                                        <img src={movie.posterUrl} alt={`Poster phim ${movie.title}`} className="actual-poster-img" />
                                    ) : (
                                        <span className="poster-placeholder-text">{movie.posterPlaceholder}</span>
                                    )}
                                </div>
                                <div className="movie-title-bar">{movie.title}</div>
                                <Button
                                    variant="secondary"
                                    className="showtime-toggle-button"
                                    onClick={() => openShowtimeListModal(movie)}
                                    disabled={isLoadingShowtimes && selectedMovieForShowtimes?.id === movie.id}
                                >
                                    {isLoadingShowtimes && selectedMovieForShowtimes?.id === movie.id ? "Đang tải..." : "Xem Suất Chiếu"}
                                </Button>
                            </div>
                        ))
                    ) : (
                        !isLoading && !error && (
                            <p className="no-items-found">
                                {searchQuery ? 'Không tìm thấy phim nào phù hợp với tìm kiếm của bạn.' : 'Chưa có phim nào để hiển thị.'}
                            </p>
                        )
                    )}
                </div>
            </div>

            {isMovieListModalOpen && selectedMovieForShowtimes && (
                <ShowtimeListModal
                    isOpen={isMovieListModalOpen}
                    movie={selectedMovieForShowtimes}
                    showtimes={currentMovieShowtimes}
                    isLoading={isLoadingShowtimes}
                    error={errorToDisplay && selectedMovieForShowtimes ? errorToDisplay : null}
                    onClose={closeShowtimeListModal}
                    onSelectShowtime={handleShowtimeSelectForDetail}
                    onOpenAddShowtimeModalForMovie={() => handleOpenAddShowtimeForSpecificMovie(selectedMovieForShowtimes)}
                />
            )}

            {isDetailModalOpen && selectedShowtimeForDetail && (
                <ShowtimeDetailModal
                    isOpen={isDetailModalOpen}
                    movie={selectedMovieForShowtimes} // Phim cha, chứa tất cả suất chiếu để hiển thị "các giờ chiếu khác"
                    showtime={selectedShowtimeForDetail} // Suất chiếu cụ thể đang xem
                    onClose={handleCloseShowtimeDetailModal}
                    onShowtimeDeleted={handleShowtimeDeleted}
                    onOpenEditModal={openEditModalFromDetailCallback} // TRUYỀN CALLBACK MỚI
                />
            )}

            {isAddModalOpen && (
                <AddShowtimeModal
                    isOpen={isAddModalOpen}
                    onClose={closeAddShowtimeModal}
                    movies={movieContextForAddShowtime ? [movieContextForAddShowtime] : movies}
                    screens={screens}
                    onAddShowtime={handleAddShowtimeSubmit}
                />
            )}

            {isEditModalOpen && showtimeToEdit && (
                <EditShowtimeModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    movies={movies} // Cần danh sách tất cả phim để hiển thị tên phim nếu phim bị disable
                    screens={screens}
                    initialShowtimeData={showtimeToEdit} // Dữ liệu suất chiếu cần sửa
                    onSubmitUpdate={handleUpdateShowtimeSubmit}
                />
            )}

            <SuccessMessageModal
                isOpen={!!successMessage}
                successMessage={successMessage}
                onClose={handleCloseSuccessModal}
            />
            <ErrorMessageModal
                isOpen={!!errorToDisplay}
                errorMessage={errorToDisplay}
                onClose={handleCloseErrorModal}
            />
        </div>
    );
};

export default ShowtimesPage;