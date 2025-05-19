import React from 'react';
// Import CSS nếu có file riêng, ví dụ: import './ShowtimeListModal.css'; 

const ShowtimeListModal = ({ movie, onClose, onSelectShowtime }) => {
  // Component này không cần state riêng

  if (!movie) return null;

  const handleDetailClick = (showtime) => {
    onSelectShowtime(showtime); // Gọi callback đã nhận từ props
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content simple-showtime-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Showtimes List for: {movie.title}</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {movie.showtimes && movie.showtimes.length > 0 ? (
            <table className="showtimes-table"> {/* Tái sử dụng class CSS chung */}
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Screen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movie.showtimes.map((showtime) => (
                  <tr
                    key={showtime.id}
                    className="showtime-row"
                  >
                    <td>{showtime.time}</td>
                    <td>{showtime.date}</td>
                    <td>{showtime.screen}</td>
                    <td>
                      <button
                        className="detail-button" // Tái sử dụng class CSS chung
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDetailClick(showtime); // Gọi hàm xử lý khi click Detail
                        }}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No showtimes available for this movie.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowtimeListModal; // QUAN TRỌNG: Export default