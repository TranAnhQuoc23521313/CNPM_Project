// client/src/pages/Showtimes/ShowtimesPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Thêm useCallback, useMemo
import Button from '../../../components/common/Button.jsx';
import './Showtimes.css';
import ShowtimeListModal from './ShowtimeListModal.jsx';
import ShowtimeDetailModal from './ShowtimeDetailModal.jsx';
import AddShowtimeModal from './AddShowtimeModal.jsx';
import { getAllMoviesApi } from '../../../services/movieApiService.js';
import { createShowtimeApi, getShowtimesByMovieApi } from '../../../services/showtimeApiService.js'; // Giả sử bạn đã tạo hàm này trong showtimeApiService.js
import { getAllScreensApi } from '../../../services/screenApiService.js'; // Giả sử bạn đã tạo hàm này trong screenApiService.js
import ErrorMessageModal from '../../../components/common/ErrorMessageModal.jsx'; // Nếu bạn có modal này
import SuccessMessageModal from '../../../components/common/SuccessMessageModal.jsx';
// Bạn sẽ cần import service cho showtimes và screens
// import { getAllShowtimesForMovieApi } from '../../services/showtimeApiService.js'; // Ví dụ
// import { getAllScreensApi } from '../../services/screenApiService.js'; // Ví dụ

// mapMovieApiToClientForShowtimePage giữ nguyên

const mapMovieApiToClientForShowtimePage = (apiMovie) => ({
    id: apiMovie.MAPHIM,
    title: apiMovie.TENPHIM,
    posterUrl: apiMovie.HINHANH ? `${process.env.REACT_APP_API_URL}${apiMovie.HINHANH}` : null,
    posterPlaceholder: `Poster ${apiMovie.TENPHIM?.split(' ')[0] || 'Movie'}`,
    // Thêm các trường gốc nếu các modal con cần
    HINHANH: apiMovie.HINHANH,
    TENPHIM_GOC: apiMovie.TENPHIM // Giữ lại tên gốc nếu title có thể bị thay đổi ở client
});

const mapScreenApiToClient = (apiScreen) => ({
    id: apiScreen.MAPHONG,
    name: apiScreen.TENPHONG,
    totalSeats: apiScreen.SOGHE,
    status: apiScreen.TRANGTHAIPHONG,
    type: apiScreen.LOAIPHONG,
    // Thêm các trường khác nếu có
});

const mapApiShowtimeToClient = (apiShowtime) => ({
    id: apiShowtime.MASUATCHIEU,
    time: new Date(apiShowtime.THOIGIAN).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }), // Format giờ
    date: new Date(apiShowtime.THOIGIAN).toLocaleDateString(), // Format ngày
    screen: apiShowtime.PHONG_TENPHONG || 'N/A', // Lấy tên phòng từ dữ liệu JOINED
    // Thêm các trường khác nếu cần
    rawDateTime: apiShowtime.THOIGIAN, // Giữ lại thời gian gốc nếu cần
    movieId: apiShowtime.PHIM_MAPHIM, // Giữ lại để truyền cho DetailModal
    // ... (thêm các thông tin bạn muốn truyền cho onSelectShowtime)
    price: apiShowtime.GIASUATCHIEU,
    status: apiShowtime.TRANGTHAI,
});

const ShowtimesPage = () => {
    const pageTitle = 'Quản lý Suất Chiếu';

    const [movies, setMovies] = useState([]); // Danh sách phim từ API
    const [screens, setScreens] = useState([]); // State cho danh sách phòng chiếu
    //const [showtimes, setShowtimes] = useState([]); // Danh sách suất chiếu từ API
    //const [isLoadingMovies, setIsLoadingMovies] = useState(true); // Loading riêng cho phim
    const [isLoadingScreens, setIsLoadingScreens] = useState(true); // Loading riêng cho phòng
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoadingShowtimes, setIsLoadingShowtimes] = useState(true); // Loading riêng cho suất chiếu

    // State cho các modals
    const [isMovieListModalOpen, setIsMovieListModalOpen] = useState(false);
    const [selectedMovieForShowtimes, setSelectedMovieForShowtimes] = useState(null); // Phim được chọn để xem/quản lý suất chiếu
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedShowtimeForDetail, setSelectedShowtimeForDetail] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [movieContextForAddShowtime, setMovieContextForAddShowtime] = useState(null);
    const [currentMovieShowtimes, setCurrentMovieShowtimes] = useState([]); // Suất chiếu cho phim đang chọn

    // State cho Modal thông báo lỗi
    const [errorToDisplay, setErrorToDisplay] = useState(null); // null khi không có lỗi, string khi có lỗi

    // State cho Modal thông báo thành công
    const [successMessage, setSuccessMessage] = useState(null);

    // Fetch danh sách phim
    const fetchMovies = useCallback(async () => {
        console.log('ShowtimesPage: Attempting to fetch movies...');
        setIsLoading(true);
        setError(null);
        try {
            const apiMovies = await getAllMoviesApi();
            setMovies(apiMovies.map(mapMovieApiToClientForShowtimePage));
        } catch (err) {
            console.error("ShowtimesPage: Error fetching movies", err);
            //setError(err.message || "An error occurred while fetching movies.");
            const displayError = err.message || "Không thể tải xuống danh sách phim."
            setErrorToDisplay(displayError);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchScreens = useCallback(async () => {
        console.log('ShowtimesPage: Attempting to fetch screens...');
        setIsLoadingScreens(true);
        // setError(null); // Hoặc setErrorScreens(null)
        try {
            const apiScreens = await getAllScreensApi();
            console.log('ShowtimesPage: Screens fetched successfully:', apiScreens);
            setScreens(apiScreens.map(mapScreenApiToClient)); // Map nếu cần
        } catch (err) {
            console.error("ShowtimesPage: Error fetching screens", err);
            //setError(err.message || "Could not load screening rooms."); // Hoặc setErrorScreens
            const displayError = err.message || "Không thể tải danh sách phòng chiếu."
            setErrorToDisplay(displayError);
        } finally {
            setIsLoadingScreens(false);
        }
    }, []);

    useEffect(() => {
        fetchMovies();
        fetchScreens(); // Gọi khi component mount
    }, [fetchMovies, fetchScreens]); // Thêm fetchScreens vào dependencies nếu có

    // Lọc phim để hiển thị
    const moviesToDisplay = useMemo(() => {
        if (!searchQuery) return movies;
        return movies.filter(movie =>
            movie.title && movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [movies, searchQuery]);


    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value);
    }, []);

    // Mở Modal hiển thị danh sách suất chiếu của một phim
    const openShowtimeListModal = useCallback(async (movie) => {
        if (!movie || !movie.id) return;

        console.log(`ShowtimesPage: Opening showtime list for movie: ${movie.title} (ID: ${movie.id})`);
        setSelectedMovieForShowtimes(movie); // Lưu phim đang được chọn
        setIsMovieListModalOpen(true);       // Mở modal
        setIsLoadingShowtimes(true);         // Bắt đầu loading cho suất chiếu
        setCurrentMovieShowtimes([]);        // Xóa suất chiếu cũ (nếu có)
        setErrorToDisplay(null);             // Reset lỗi hiển thị

        try {
            const apiShowtimes = await getShowtimesByMovieApi(movie.id);
            console.log(`ShowtimesPage: Fetched showtimes for ${movie.title}:`, apiShowtimes);
            setCurrentMovieShowtimes(apiShowtimes.map(mapApiShowtimeToClient));
            console.log("ShowtimesPage: Current movie showtimes:", apiShowtimes);
        } catch (err) {
            console.error(`ShowtimesPage: Error fetching showtimes for movie ${movie.id}`, err);
            const displayError = err.message || `Could not load showtimes for ${movie.title}.`;
            setErrorToDisplay(displayError); // Dùng modal lỗi chung
            setCurrentMovieShowtimes([]); // Đảm bảo là mảng rỗng khi lỗi
        } finally {
            setIsLoadingShowtimes(false);
        }
    }, []); // Dependencies sẽ được thêm bởi ESLint nếu cần, hoặc để trống nếu không có

    const closeShowtimeListModal = useCallback(() => {
        setIsMovieListModalOpen(false);
        setSelectedMovieForShowtimes(null);
        setCurrentMovieShowtimes([]); // Reset suất chiếu khi đóng modal
    }, []);

    // Mở Modal chi tiết một suất chiếu (được gọi từ ShowtimeListModal)
    const handleShowtimeSelectForDetail = useCallback((showtime, parentMovie) => {
        console.log("ShowtimesPage: Opening detail for showtime:", showtime, "of movie:", parentMovie);
        closeShowtimeListModal(); // Đóng modal danh sách trước
        setSelectedShowtimeForDetail(showtime);
        // parentMovieForDetail có thể không cần nếu selectedShowtime đã có đủ thông tin phim
        // Hoặc nếu selectedMovieForShowtimes vẫn còn giá trị và đó chính là parentMovie
        setIsDetailModalOpen(true);
    }, [closeShowtimeListModal]);

    const handleCloseShowtimeDetailModal = useCallback(() => {
        setIsDetailModalOpen(false);
        setSelectedShowtimeForDetail(null);
        // Mở lại modal danh sách suất chiếu nếu người dùng muốn quay lại
        // if (selectedMovieForShowtimes) {
        //   setIsMovieListModalOpen(true);
        // }
    }, []);

    const handleOpenAddShowtimeForSpecificMovie = useCallback((movieFromListModal) => {
        closeShowtimeListModal();
        setMovieContextForAddShowtime(movieFromListModal);
        setIsAddModalOpen(true);
    }, [closeShowtimeListModal]);

    // Mở Modal thêm suất chiếu chung (có thể được kích hoạt từ nút "+ Add Showtime" chính)
    const handleOpenAddShowtimeOverallModal = useCallback(() => {
        setIsAddModalOpen(true);
    }, []);

    const closeAddShowtimeModal = useCallback(() => {
        setIsAddModalOpen(false);
        setMovieContextForAddShowtime(null);
    }, []);

    // Xử lý khi submit form thêm suất chiếu
    const handleAddShowtimeSubmit = useCallback(async (newShowtimeDataFromModal) => {
        console.log('ShowtimesPage: Attempting to add new showtime from modal:', newShowtimeDataFromModal);
        setIsLoading(true); // Có thể cần state loading riêng cho việc thêm suất chiếu
        setError(null);
        try {
            // newShowtimeDataFromModal có: movieId, movieTitle, time, date, screenId, screenName, price
            // Hàm createShowtimeApi sẽ map nó sang định dạng server cần
            const addedShowtime = await createShowtimeApi(newShowtimeDataFromModal);
            //alert(`Suất chiếu cho phim "${newShowtimeDataFromModal.movieTitle}" đã được thêm thành công! (ID: ${addedShowtime.MASUATCHIEU})`);
            closeAddShowtimeModal();
            const displaySuccessMessage = `Suất chiếu cho phim "${newShowtimeDataFromModal.movieTitle}" đã được thêm thành công!`;
            setSuccessMessage(displaySuccessMessage);
            // TODO: Cập nhật danh sách suất chiếu nếu cần (ví dụ: nếu đang xem danh sách suất chiếu của một phim cụ thể)
            // Hoặc chỉ đơn giản là thông báo thành công.
        } catch (err) {
            console.error("ShowtimesPage: Error adding showtime", err);
            // setError(err.message || "Could not add showtime."); // Có thể dùng ErrorMessageModal
            //alert(err.message || "Could not add showtime.");
            //const displayError = err.message || "Không thể thêm xuất chiếu này.";
            const displayError = "Không thể thêm suất chiếu này. Do đã tồn tại suất chiếu khác trong khoảng thời gian này.";
            setErrorToDisplay(displayError);
        } finally {
            setIsLoading(false);
        }
    }, [closeAddShowtimeModal]); // Thêm các dependencies khác nếu cần (ví dụ hàm fetch lại suất chiếu)

    const handleCloseErrorModal = useCallback(() => {
        setErrorToDisplay(null);
    }, []);

    // Success Modal
    const handleCloseSuccessModal = useCallback(() => {
        setSuccessMessage(null);
    }, []);




    // --- RENDER ---
    if (isLoading && movies.length === 0 && !error) {
        return <div className="page-container showtimes-management-page loading-container"><p>Loading movies...</p></div>;
    }
    if (error && movies.length === 0) {
        return <div className="page-container showtimes-management-page error-container"><h1>{pageTitle}</h1><p className="error-message">Error: {error}</p><Button onClick={fetchMovies}>Retry</Button></div>;
    }

    return (
        <div className="showtimes-management-page page-container"> {/* Thêm page-container */}
            <div className="content-card"> {/* Card trắng bao ngoài */}

                <h1 className="page-main-title">Quản Lý Suất Chiếu</h1> {/* Tiêu đề chính của trang */}

                <div className="showtimes-page-header"> {/* Thanh controls */}
                    <div className="search-input-container"> {/* Bọc ô tìm kiếm */}
                        <input
                            type="text"
                            placeholder="Tìm kiếm suất chiếu (theo phim, phòng, ngày...)"
                            className="showtime-search-input" // Class mới cho input
                         value={searchQuery}
                         onChange={handleSearchChange}
                         disabled={isLoading&&movies.length > 0}
                        />
                    </div>
                    <button
                        className="btn-add-new-showtime" // Class mới cho nút
                     onClick={handleOpenAddShowtimeForSpecificMovie}
                    >
                        + Add Showtiem
                    </button>
                </div>

                {/* Khu vực hiển thị danh sách thẻ phim và suất chiếu */}
                <div className="movie-cards-container">
                    {/* ... các thẻ phim ... */}
                </div>

                {/* Thông báo không có dữ liệu */}
                {/* ... */}

            </div> {/* Đóng content-card */}


            {error && movies.length > 0 && <p className="error-message inline-error">{error}</p>}
            {isLoading && movies.length > 0 && <div className="inline-loading">Updating...</div>}

            <div className="movie-cards-container"> {/* Đổi tên class cho rõ ràng */}
                {moviesToDisplay.length > 0 ? (
                    moviesToDisplay.map((movie) => (
                        <div key={movie.id} className="movie-card-item"> {/* Class của card phim */}
                            <div className="movie-poster-display"> {/* Vùng chứa poster */}
                                {movie.posterUrl ? (
                                    <img src={movie.posterUrl} alt={`${movie.title} Poster`} className="actual-poster-img" />
                                ) : (
                                    <span className="poster-placeholder-text">{movie.posterPlaceholder}</span>
                                )}
                            </div>
                            <div className="movie-title-bar">{movie.title}</div>
                            <button className="showtime-toggle-button" onClick={() => openShowtimeListModal(movie)}>
                                Showtimes
                            </button>
                        </div>
                    ))
                ) : (
                    !isLoading && !error && (
                        <p className="no-items-found">
                            {searchQuery ? 'No movies found matching your search.' : 'No movies available.'}
                        </p>
                    )
                )}
            </div>

            {/* Modals */}
            {isMovieListModalOpen && selectedMovieForShowtimes && (
                <ShowtimeListModal
                    isOpen={isMovieListModalOpen}
                    movie={selectedMovieForShowtimes}
                    showtimes={currentMovieShowtimes} // Truyền suất chiếu đã fetch
                    isLoading={isLoadingShowtimes}    // Truyền trạng thái loading
                    error={errorToDisplay && selectedMovieForShowtimes ? errorToDisplay : null} // Truyền lỗi nếu có và liên quan đến modal này
                    onClose={closeShowtimeListModal}
                    onSelectShowtime={handleShowtimeSelectForDetail}
                    onOpenAddShowtimeModalForMovie={() => handleOpenAddShowtimeForSpecificMovie(selectedMovieForShowtimes)}
                />
            )}

            {isDetailModalOpen && selectedShowtimeForDetail && (
                <ShowtimeDetailModal
                    isOpen={isDetailModalOpen} // Truyền prop isOpen
                    // movie={parentMovieForDetail} // Có thể không cần nếu selectedShowtimeForDetail đã có thông tin phim
                    showtime={selectedShowtimeForDetail} // Truyền toàn bộ object suất chiếu
                    onClose={handleCloseShowtimeDetailModal}
                />
            )}

            <AddShowtimeModal
                isOpen={isAddModalOpen}
                onClose={closeAddShowtimeModal}
                // Truyền danh sách phim và phòng chiếu đã fetch từ API
                movies={movies} // Danh sách phim để người dùng chọn
                screens={screens} // Danh sách phòng chiếu
                onAddShowtime={handleAddShowtimeSubmit}
            // selectedMovieId={selectedMovieForShowtimes?.id} // Nếu mở từ một phim cụ thể
            />
            <SuccessMessageModal
                isOpen={!!successMessage} // Chỉ mở khi có thông báo thành công
                successMessage={successMessage}
                onClose={handleCloseSuccessModal} // Đóng modal khi nhấn nút
            />
            <ErrorMessageModal
                isOpen={!!errorToDisplay} // Chỉ mở khi có thông báo lỗi
                errorMessage={errorToDisplay}
                onClose={handleCloseErrorModal} // Đóng modal khi nhấn nút
            />
        </div>
    );
};

export default ShowtimesPage;