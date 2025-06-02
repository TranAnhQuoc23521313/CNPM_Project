// src/pages/Showtimes/EditShowtimeModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// import Button from '../../../components/common/Button'; // Không cần Button component nếu dùng button HTML thuần
import './EditShowtimeModal.css'; // Import CSS mới

const EditShowtimeModal = ({ // Đổi tên component nếu muốn giữ bản cũ
  isOpen,
  onClose,
  movies = [],
  screens = [],
  onSubmitUpdate,
  initialShowtimeData
}) => {
  const [selectedMovieId, setSelectedMovieId] = useState(''); // Vẫn giữ để lấy movieTitle
  const [movieTitleForDisplay, setMovieTitleForDisplay] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [showDate, setShowDate] = useState('');
  const [showTime, setShowTime] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('Sắp chiếu');
  const [formError, setFormError] = useState('');

  // convertTo24HourFormat và formatDateToYYYYMMDD giữ nguyên như trong EditShowtimeModal trước
  const convertTo24HourFormat = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return '';
    const [time, modifierPart] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (modifierPart) {
        const modifier = modifierPart.toUpperCase();
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}`;
  };

  const formatDateToYYYYMMDD = (dateInput) => {
    if (!dateInput) return '';
    try {
      let dateObj;
      if (dateInput.includes('/')) {
        const parts = dateInput.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
            dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            if (isNaN(dateObj.getTime())) {
                 dateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
            }
             if (isNaN(dateObj.getTime())) {
                dateObj = new Date(dateInput);
            }
        } else {
           dateObj = new Date(dateInput);
        }
      } else {
        dateObj = new Date(dateInput);
      }
      if (!isNaN(dateObj.getTime())) return dateObj.toISOString().split('T')[0];
    } catch (e) { console.warn("Lỗi parse ngày:", dateInput, e); }
    if (initialShowtimeData?.rawDateTime) {
        try {
            const rawDateObj = new Date(initialShowtimeData.rawDateTime);
            if (!isNaN(rawDateObj.getTime())) return rawDateObj.toISOString().split('T')[0];
        } catch (e) { /* Bỏ qua */ }
    }
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen && initialShowtimeData) {
      const movieId = initialShowtimeData.movieId || initialShowtimeData.MAPHIM || '';
      setSelectedMovieId(movieId);
      const movie = movies.find(m => m.id === movieId);
      setMovieTitleForDisplay(movie?.title || initialShowtimeData.movieTitle || 'N/A');

      let scrId = initialShowtimeData.screenId || initialShowtimeData.MAPHONG || '';
      if (!scrId && initialShowtimeData.screen && screens.length > 0) {
        const foundScreen = screens.find(s => s.name === initialShowtimeData.screen);
        scrId = foundScreen?.id || '';
      }
      setSelectedScreenId(scrId);
      
      if (initialShowtimeData.rawDateTime) {
        const dateTimeObj = new Date(initialShowtimeData.rawDateTime);
        if (!isNaN(dateTimeObj.getTime())) {
          setShowDate(dateTimeObj.toISOString().split('T')[0]);
          setShowTime(`${dateTimeObj.getHours().toString().padStart(2, '0')}:${dateTimeObj.getMinutes().toString().padStart(2, '0')}`);
        } else {
            setShowDate(formatDateToYYYYMMDD(initialShowtimeData.date));
            setShowTime(convertTo24HourFormat(initialShowtimeData.time));
        }
      } else if (initialShowtimeData.date && initialShowtimeData.time) {
        setShowDate(formatDateToYYYYMMDD(initialShowtimeData.date));
        setShowTime(convertTo24HourFormat(initialShowtimeData.time));
      } else {
        const today = new Date();
        setShowDate(today.toISOString().split('T')[0]);
        setShowTime(today.toTimeString().slice(0,5));
      }
      setPrice(initialShowtimeData.price?.toString() || initialShowtimeData.GIASUATCHIEU?.toString() || '');
      setStatus(initialShowtimeData.status || initialShowtimeData.TRANGTHAI || 'Sắp chiếu');
      setFormError('');
    }
  }, [isOpen, initialShowtimeData, movies, screens]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!selectedScreenId || !showDate || !showTime || price.toString().trim() === '' || !status) {
      setFormError('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return;
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setFormError('Giá vé không hợp lệ.');
      return;
    }
    const updatedShowtimeData = {
      screenId: selectedScreenId, date: showDate, time: showTime,
      price: numericPrice, status: status,
    };
    onSubmitUpdate(updatedShowtimeData, initialShowtimeData.id);
  };

  if (!isOpen || !initialShowtimeData) {
    return null;
  }

  return (
    <div className="edit-showtime-modal-overlay" onClick={onClose}>
      <div className="edit-showtime-modal-content-v2" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-v2">
          <h2>Cập nhật Suất Chiếu</h2>
          <button className="modal-close-button-v2" onClick={onClose} title="Đóng">×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-showtime-form-v2">
          <div className="modal-body-v2">
            <div className="form-grid-v2">
              {formError && <p className="form-error-message-v2">{formError}</p>}

              <div className="form-group-v2 full-span">
                <label>Phim (Không thể thay đổi)</label>
                <div className="input-wrapper-v2">
                  <input type="text" value={movieTitleForDisplay} disabled readOnly />
                </div>
              </div>

              <div className="form-group-v2">
                <label htmlFor="edit-showtime-date-v2">Ngày chiếu *</label>
                <div className="input-wrapper-v2">
                  <input type="date" id="edit-showtime-date-v2" value={showDate} onChange={(e) => setShowDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-group-v2">
                <label htmlFor="edit-showtime-time-v2">Giờ chiếu *</label>
                <div className="input-wrapper-v2">
                  <input type="time" id="edit-showtime-time-v2" value={showTime} onChange={(e) => setShowTime(e.target.value)} required />
                </div>
              </div>

              <div className="form-group-v2">
                <label htmlFor="edit-screen-select-v2">Phòng chiếu *</label>
                <div className="input-wrapper-v2">
                  <select id="edit-screen-select-v2" value={selectedScreenId} onChange={(e) => setSelectedScreenId(e.target.value)} required>
                    <option value="" disabled>-- Chọn phòng --</option>
                    {(screens || []).map((screen) => (
                      <option key={screen.id} value={screen.id}>
                        {screen.name} {screen.type && `(${screen.type})`}
                        {screen.status !== 'Sẵn Sàng' ? ` - ${screen.status}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-v2">
                <label htmlFor="edit-showtime-price-v2">Giá vé (VND) *</label>
                <div className="input-wrapper-v2">
                  <input
                    type="number" id="edit-showtime-price-v2"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ví dụ: 75000" min="0" step="1000" required
                  />
                </div>
              </div>
              
              <div className="form-group-v2 full-span"> {/* Trạng thái chiếm cả hàng */}
                <label htmlFor="edit-statusShowtime-v2">Trạng thái suất chiếu *</label>
                <div className="input-wrapper-v2">
                  <select id="edit-statusShowtime-v2" value={status} onChange={(e) => setStatus(e.target.value)} required>
                    <option value="Sắp chiếu">Sắp chiếu</option>
                    <option value="Đang chiếu">Đang chiếu</option>
                    <option value="Đã chiếu">Đã chiếu</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>
              </div>
            </div> {/* End form-grid-v2 */}
          </div> {/* End modal-body-v2 */}

          <div className="modal-footer-v2">
            <button type="button" className="action-button-v2 cancel-button-v2" onClick={onClose}>
              Hủy Bỏ
            </button>
            <button type="submit" className="action-button-v2 submit-button-v2">
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditShowtimeModal.propTypes = { // Nhớ cập nhật PropTypes
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
  onSubmitUpdate: PropTypes.func.isRequired,
  initialShowtimeData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    movieId: PropTypes.string, MAPHIM: PropTypes.string, movieTitle: PropTypes.string,
    screen: PropTypes.string, screenId: PropTypes.string, MAPHONG: PropTypes.string,
    date: PropTypes.string, time: PropTypes.string, rawDateTime: PropTypes.string, THOIGIAN: PropTypes.string,
    price: PropTypes.number, GIASUATCHIEU: PropTypes.number,
    status: PropTypes.string, TRANGTHAI: PropTypes.string,
  }).isRequired,
};

export default EditShowtimeModal; // Hoặc EditShowtimeModal