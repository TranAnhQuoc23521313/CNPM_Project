import React, { useState, useEffect } from 'react';
import './AddShowtimeModal.css'; // CSS riêng cho modal này
// Giả sử bạn đã cài đặt và import Font Awesome hoặc thư viện icon khác
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faClock, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const AddShowtimeModal = ({ isOpen, onClose, movies, screens, onAddShowtime }) => {
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [showtimeTime, setShowtimeTime] = useState('');
  const [showtimeDate, setShowtimeDate] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form khi mở modal, chọn giá trị đầu tiên làm mặc định nếu có
      setSelectedMovieId(movies && movies.length > 0 ? movies[0].id : '');
      setShowtimeTime('');
      const today = new Date().toISOString().split('T')[0];
      setShowtimeDate(today);
      setSelectedScreenId(screens && screens.length > 0 ? screens[0].id : '');
      setPrice('');
    }
  }, [isOpen, movies, screens]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMovieId || !showtimeTime || !showtimeDate || !selectedScreenId || !price) {
      alert('Vui lòng điền đầy đủ thông tin suất chiếu.');
      return;
    }
    const selectedMovie = movies.find(m => m.id.toString() === selectedMovieId);
    const selectedScreen = screens.find(s => s.id === selectedScreenId);

    if (!selectedMovie || !selectedScreen) {
      alert('Phim hoặc phòng chiếu không hợp lệ.');
      return;
    }

    const newShowtimeData = {
      movieId: parseInt(selectedMovieId, 10), // Chuyển về số nếu ID là số
      movieTitle: selectedMovie.title,
      time: showtimeTime,
      date: showtimeDate,
      screenId: selectedScreenId,
      screenName: selectedScreen.name,
      price: parseInt(price, 10),
    };

    onAddShowtime(newShowtimeData);
    // onClose(); // Để component cha đóng sau khi xử lý thành công
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-showtime-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm Suất Chiếu</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Sử dụng cấu trúc với label ở trên */}
          <div className="modal-body add-modal-body">
            {/* Group cho Tên phim */}
            <div className="form-group">
              <label htmlFor="movie-select">Tên phim</label>
              <div className="input-wrapper">
                <select id="movie-select" value={selectedMovieId} onChange={(e) => setSelectedMovieId(e.target.value)} required >
                  {/* <option value="" disabled>-- Chọn phim --</option> */}
                  {movies.map((movie) => ( <option key={movie.id} value={movie.id}> {movie.title} </option> ))}
                </select>
              </div>
            </div>

            {/* Group cho Giờ chiếu */}
            <div className="form-group">
              <label htmlFor="showtime-time">Giờ chiếu</label>
              <div className="input-wrapper with-icon">
                <input type="time" id="showtime-time" value={showtimeTime} onChange={(e) => setShowtimeTime(e.target.value)} required />
                <span className="input-icon">🕒</span> {/* Placeholder icon */}
                {/* <FontAwesomeIcon icon={faClock} className="input-icon" /> */}
              </div>
            </div>

            {/* Group cho Ngày chiếu */}
            <div className="form-group">
              <label htmlFor="showtime-date">Ngày chiếu</label>
              <div className="input-wrapper with-icon">
                <input type="date" id="showtime-date" value={showtimeDate} onChange={(e) => setShowtimeDate(e.target.value)} required />
                 <span className="input-icon">📅</span> {/* Placeholder icon */}
                 {/* <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" /> */}
              </div>
            </div>

            {/* Group cho Phòng chiếu */}
            <div className="form-group">
              <label htmlFor="screen-select">Phòng chiếu</label>
              <div className="input-wrapper">
                <select id="screen-select" value={selectedScreenId} onChange={(e) => setSelectedScreenId(e.target.value)} required >
                   {/* <option value="" disabled>-- Chọn phòng chiếu --</option> */}
                  {screens.map((screen) => ( <option key={screen.id} value={screen.id}> {screen.name} </option> ))}
                </select>
              </div>
            </div>

            {/* Group cho Giá vé */}
            <div className="form-group">
              <label htmlFor="showtime-price">Giá vé</label>
              <div className="input-wrapper">
                <input type="number" id="showtime-price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Nhập giá vé" min="0" required />
              </div>
            </div>
          </div> {/* End modal-body */}

          <div className="modal-footer">
             <button type="submit" className="accept-button" title="Thêm suất chiếu">✓</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShowtimeModal; // Đảm bảo có export default ở cuối