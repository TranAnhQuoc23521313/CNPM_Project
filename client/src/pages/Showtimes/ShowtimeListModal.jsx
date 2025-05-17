// client/src/pages/Movies/ShowtimeListModal.jsx
import React from 'react';
import Button from '../../components/common/Button'; // Giả sử bạn có component Button
// import './ShowtimeListModal.css'; // Đảm bảo CSS được import đúng nếu có file riêng

const ShowtimeListModal = ({
  isOpen,
  movie,
  showtimes, // Nhận mảng showtimes từ props
  isLoading, // Nhận trạng thái loading từ props
  error,     // Nhận lỗi từ props
  onClose,
  onSelectShowtime,
  onOpenAddShowtimeModalForMovie // Prop này vẫn cần thiết từ ShowtimesPage
}) => {

  if (!isOpen || !movie) {
    return null;
  }

  const handleDetailClick = (showtime) => {
    onSelectShowtime(showtime); // Gọi callback đã nhận từ props
  };

  return (
    <div className="modal-overlay simple-showtime-list-modal-overlay" onClick={onClose}>
      <div className="modal-content simple-showtime-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Suất chiếu của phim: {movie.title}</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {isLoading && <p>Loading showtimes for {movie.title}...</p>}
          {!isLoading && error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
          {!isLoading && !error && showtimes && showtimes.length > 0 ? (
            <table className="showtimes-table">
              {/* KHÔNG CÓ KHOẢNG TRẮNG HOẶC COMMENT Ở ĐÂY */}
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
              {/* KHÔNG CÓ KHOẢNG TRẮNG HOẶC COMMENT Ở ĐÂY */}
              <tbody>
                {showtimes.map((showtime) => (
                  <tr key={showtime.id} className="showtime-row">
                    <td>{showtime.date}</td>
                    <td>{showtime.time}</td>
                    <td>{showtime.screenName || showtime.screen}</td>
                    <td>{showtime.price ? `${showtime.price.toLocaleString()} VND` : 'N/A'}</td>
                    <td>{showtime.status}</td>
                    <td>
                      <Button
                        variant="info"
                        size="small"
                        className="detail-button"
                        onClick={() => handleDetailClick(showtime)}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* KHÔNG CÓ KHOẢNG TRẮNG HOẶC COMMENT Ở ĐÂY */}
            </table>
          ) : (
            !isLoading && !error && <p>No showtimes currently available for this movie.</p>
          )}
          {/* Nút thêm suất chiếu vẫn có thể ở đây 
          {!isLoading && !error && movie && ( // Chỉ hiển thị nếu không loading, không lỗi và có movie
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Button variant="primary" onClick={onOpenAddShowtimeModalForMovie} disabled={isLoading}>
                + Add Showtime for {movie.title}
              </Button>
            </div>
          )} */ }
        </div>
      </div>
    </div>
  );
};

export default ShowtimeListModal;