// client/src/pages/Showtimes/AddShowtimeModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './AddShowtimeModal.css'; // Sử dụng CSS đã cập nhật ở trên

const AddShowtimeModal = ({ isOpen, onClose, movies, screens, onAddShowtime }) => {
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [showtimeTime, setShowtimeTime] = useState('');
  const [showtimeDate, setShowtimeDate] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [price, setPrice] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedMovieId(movies && movies.length > 0 ? movies[0].id : '');
      setShowtimeTime('');
      const today = new Date().toISOString().split('T')[0];
      setShowtimeDate(today);
      setSelectedScreenId(screens && screens.length > 0 ? screens[0].id : '');
      setPrice('');
      setFormError('');
    }
  }, [isOpen, movies, screens]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedMovieId || !showtimeTime || !showtimeDate || !selectedScreenId || !price) {
      setFormError('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return;
    }
    const selectedMovie = movies.find(m => m.id.toString() === selectedMovieId);
    const selectedScreen = screens.find(s => s.id.toString() === selectedScreenId);

    if (!selectedMovie || !selectedScreen) {
      setFormError('Phim hoặc phòng chiếu đã chọn không hợp lệ.');
      return;
    }
    const numericPrice = parseInt(price, 10);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setFormError('Giá vé không hợp lệ. Vui lòng nhập một số dương.');
      return;
    }

    const newShowtimeData = {
      movieId: selectedMovieId, movieTitle: selectedMovie.title,
      time: showtimeTime, date: showtimeDate,
      screenId: selectedScreenId, screenName: selectedScreen.name,
      price: numericPrice,
    };
    onAddShowtime(newShowtimeData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-showtime-modal-v2" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-v2">
          <h2>Thêm Suất Chiếu Mới</h2>
          <button className="modal-close-button-v2" onClick={onClose} title="Đóng">×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-showtime-form-v2">
          <div className="modal-body-v2">
            <div className="form-grid-v2">
              {formError && <p className="form-error-message-v2">{formError}</p>}

              <div className="form-group-v2 full-span"> {/* Tên phim chiếm cả hàng */}
                <label htmlFor="movie-select-v2">Chọn phim *</label>
                <div className="input-wrapper-v2">
                  <select id="movie-select-v2" value={selectedMovieId} onChange={(e) => setSelectedMovieId(e.target.value)} required>
                    {movies.length === 0 && <option value="" disabled>Không có phim để chọn</option>}
                    {movies.map((movie) => (<option key={movie.id} value={movie.id}>{movie.title}</option>))}
                  </select>
                </div>
              </div>

              <div className="form-group-v2">
                <label htmlFor="showtime-date-v2">Ngày chiếu *</label>
                <div className="input-wrapper-v2">
                  <input type="date" id="showtime-date-v2" value={showtimeDate} onChange={(e) => setShowtimeDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-group-v2">
                <label htmlFor="showtime-time-v2">Giờ chiếu *</label>
                <div className="input-wrapper-v2">
                  <input type="time" id="showtime-time-v2" value={showtimeTime} onChange={(e) => setShowtimeTime(e.target.value)} required />
                </div>
              </div>

              <div className="form-group-v2">
                <label htmlFor="screen-select-v2">Phòng chiếu *</label>
                <div className="input-wrapper-v2">
                  <select id="screen-select-v2" value={selectedScreenId} onChange={(e) => setSelectedScreenId(e.target.value)} required>
                    {screens.length === 0 && <option value="" disabled>Không có phòng chiếu</option>}
                    {screens.map((screen) => (<option key={screen.id} value={screen.id}>{screen.name} {screen.type && `(${screen.type})`} {screen.status !== "Sẵn Sàng" ? ` - ${screen.status}` : ""}</option>))}
                  </select>
                </div>
              </div>

              <div className="form-group-v2">
                <label htmlFor="showtime-price-v2">Giá vé (VND) *</label>
                <div className="input-wrapper-v2">
                  <input
                    type="number"
                    id="showtime-price-v2"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ví dụ: 75000"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
              </div>
            </div> {/* End form-grid-v2 */}
          </div> {/* End modal-body-v2 */}

          <div className="modal-footer-v2">
            <button type="submit" className="submit-button-v2" disabled={!movies.length || !screens.length}>
              Hoàn tất & Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddShowtimeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  movies: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
  screens: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    status: PropTypes.string,
  })).isRequired,
  onAddShowtime: PropTypes.func.isRequired,
};

// Đổi tên export nếu bạn muốn dùng layout này
export default AddShowtimeModal; // Hoặc giữ AddShowtimeModal và thay thế nội dung