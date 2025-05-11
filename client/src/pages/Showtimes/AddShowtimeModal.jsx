import React, { useState, useEffect } from 'react';
import './AddShowtimeModal.css';

const AddShowtimeModal = ({ isOpen, onClose, movies, screens, onAddShowtime }) => {
  // ... (useState và useEffect giữ nguyên) ...
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [showtimeTime, setShowtimeTime] = useState('');
  const [showtimeDate, setShowtimeDate] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedMovieId(movies && movies.length > 0 ? movies[0].id : '');
      setShowtimeTime('');
      const today = new Date().toISOString().split('T')[0];
      setShowtimeDate(today);
      setSelectedScreenId(screens && screens.length > 0 ? screens[0].id : '');
      setPrice('');
    }
  }, [isOpen, movies, screens]);

  const handleSubmit = (e) => {
    // ... (logic handleSubmit giữ nguyên) ...
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
      movieId: parseInt(selectedMovieId, 10), movieTitle: selectedMovie.title,
      time: showtimeTime, date: showtimeDate,
      screenId: selectedScreenId, screenName: selectedScreen.name,
      price: parseInt(price, 10),
    };
    onAddShowtime(newShowtimeData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-showtime-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm Suất Chiếu</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        {/* Form bao gồm cả body và nút submit giờ nằm trong body */}
        <form onSubmit={handleSubmit} className="add-showtime-form"> 
          <div className="modal-body add-modal-body">
            {/* Group cho Tên phim */}
            <div className="form-group">
              <label htmlFor="movie-select">Tên phim</label>
              <div className="input-wrapper">
                <select id="movie-select" value={selectedMovieId} onChange={(e) => setSelectedMovieId(e.target.value)} required >
                  {movies.map((movie) => ( <option key={movie.id} value={movie.id}> {movie.title} </option> ))}
                </select>
              </div>
            </div>

            {/* Group cho Giờ chiếu */}
            <div className="form-group">
              <label htmlFor="showtime-time">Giờ chiếu</label>
              <div className="input-wrapper"> 
                <input type="time" id="showtime-time" value={showtimeTime} onChange={(e) => setShowtimeTime(e.target.value)} required />
              </div>
            </div>

            {/* Group cho Ngày chiếu */}
            <div className="form-group">
              <label htmlFor="showtime-date">Ngày chiếu</label>
              <div className="input-wrapper">
                <input type="date" id="showtime-date" value={showtimeDate} onChange={(e) => setShowtimeDate(e.target.value)} required />
              </div>
            </div>

            {/* Group cho Phòng chiếu */}
            <div className="form-group">
              <label htmlFor="screen-select">Phòng chiếu</label>
              <div className="input-wrapper">
                <select id="screen-select" value={selectedScreenId} onChange={(e) => setSelectedScreenId(e.target.value)} required >
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

             {/* ---- DI CHUYỂN NÚT VÀO ĐÂY, BÊN TRONG MODAL-BODY ---- */}
             <div className="modal-form-actions"> 
                 <button type="submit" className="accept-button" title="Thêm suất chiếu">
                    Done
                 </button>
             </div>
             {/* ------------------------------------------------------- */}

          </div> {/* End modal-body */}

          {/* ---- BỎ HOÀN TOÀN MODAL-FOOTER ---- */}
          {/* <div className="modal-footer"> ... </div> */}
        </form>
      </div>
    </div>
  );
};

export default AddShowtimeModal;