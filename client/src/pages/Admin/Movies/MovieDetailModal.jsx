import React from 'react';
import './MovieDetailModal.css'; // Đảm bảo import file CSS này

const MovieDetailModal = ({ isOpen, onClose, movie }) => {
  if (!isOpen || !movie) {
    return null;
  }

  return (
    <div className="modal-overlay movie-detail-overlay" onClick={onClose}>
      <div className="modal-content movie-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header movie-detail-modal-header">
          <h2>{movie.title || 'Movie Details'} - Chi tiết đầy đủ</h2>
          <button className="modal-close-button movie-detail-close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body movie-detail-modal-body">
          <div className="detail-item">
            <span className="detail-label">Tên phim:</span>
            <span className="detail-value">{movie.title || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Năm sản xuất:</span>
            <span className="detail-value">{movie.year || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Thể loại:</span>
            <span className="detail-value">{movie.genre || movie.type || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Đạo diễn:</span>
            <span className="detail-value">{movie.director || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Quốc gia:</span>
            <span className="detail-value">{movie.country || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Ngôn ngữ:</span>
            <span className="detail-value">{movie.language || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Thời lượng:</span>
            <span className="detail-value">{movie.duration ? `${movie.duration} min` : 'N/A'}</span>
          </div>
          {/* Phần Mô tả sẽ có style riêng để có thể xuống dòng */}
          <div className="detail-item description-item"> 
            <span className="detail-label">Mô tả:</span>
            {/* Sử dụng div hoặc p cho value của mô tả để dễ dàng xuống dòng */}
            <div className="detail-value description-text-value"> 
              {movie.description || 'Chưa có mô tả.'}
            </div>
          </div>
        </div>
        <div className="modal-footer movie-detail-modal-footer">
          <button onClick={onClose} className="detail-modal-action-button">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailModal;