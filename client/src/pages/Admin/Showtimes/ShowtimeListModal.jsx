// client/src/pages/Movies/ShowtimeListModal.jsx
import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import Button from '../../../components/common/Button';
import './ShowtimeListModal.css'; // Đảm bảo import file CSS đã cập nhật

const ShowtimeListModal = ({
  isOpen,
  movie,
  showtimes,
  isLoading,
  error,
  onClose,
  onSelectShowtime,
  onOpenAddShowtimeModalForMovie
}) => {

  if (!isOpen || !movie) {
    return null;
  }

  const handleDetailClick = (showtime) => {
    onSelectShowtime(showtime);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'sắp chiếu':
        return 'sap-chieu';
      case 'đang chiếu':
        return 'dang-chieu';
      case 'đã chiếu':
        return 'da-chieu';
      case 'đã hủy':
        return 'da-huy';
      default:
        return '';
    }
  };

  return (
    <div className="showtime-list-modal-overlay" onClick={onClose}>
      <div className="showtime-list-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="showtime-list-modal-header">
          <h2>Suất chiếu của phim: <span className="movie-title-highlight">{movie.title}</span></h2>
          <button className="showtime-list-modal-close-button" onClick={onClose}>×</button>
        </div>

        <div className="showtime-list-modal-body">
          {isLoading && <p className="loading-message-list">Đang tải danh sách suất chiếu cho phim {movie.title}...</p>}
          {!isLoading && error && <p className="error-message-list">{error}</p>}
          {!isLoading && !error && showtimes && showtimes.length > 0 ? (
            <div className="showtimes-table-container">
              <table className="showtimes-table">
                <thead>
                  <tr>
                    <th>Ngày chiếu</th>
                    <th>Thời gian</th>
                    <th>Phòng chiếu</th>
                    <th>Giá vé</th>
                    <th>Trạng thái</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {showtimes.map((showtime) => (
                    <tr key={showtime.id} className="showtime-row">
                      <td>{showtime.date}</td> {/* Giả sử date đã format DD/MM/YYYY */}
                      <td>{showtime.time}</td> {/* Giả sử time đã format HH:MM AM/PM */}
                      <td>{showtime.screenName || showtime.screen}</td>
                      <td>{showtime.price ? `${showtime.price.toLocaleString()} VND` : 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(showtime.status)}`}>
                          {showtime.status || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="info" // Hoặc "secondary", "outline-primary" tùy theo Button component
                          size="small"
                          className="detail-button-list" // Class để tùy chỉnh thêm nếu cần
                          onClick={() => handleDetailClick(showtime)}
                        >
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !isLoading && !error && <p className="no-showtimes-message">Hiện tại không có suất chiếu nào cho phim này.</p>
          )}
        </div>
        
        {/* Nút "+ Thêm Suất Chiếu" trong footer (tùy chọn) */}
        {/* {!isLoading && !error && movie && onOpenAddShowtimeModalForMovie && (
            <div className="showtime-list-modal-footer">
              <Button variant="primary" onClick={onOpenAddShowtimeModalForMovie} disabled={isLoading}>
                + Thêm Suất Chiếu Mới
              </Button>
            </div>
        )} */}
      </div>
    </div>
  );
};

// Thêm PropTypes để kiểm tra kiểu dữ liệu của props
ShowtimeListModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  movie: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }), // movie có thể là null khi modal đóng
  showtimes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string,
    time: PropTypes.string,
    screenName: PropTypes.string,
    screen: PropTypes.string,
    price: PropTypes.number,
    status: PropTypes.string,
  })),
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSelectShowtime: PropTypes.func.isRequired,
  onOpenAddShowtimeModalForMovie: PropTypes.func, // Prop này có thể không bắt buộc
};

export default ShowtimeListModal;