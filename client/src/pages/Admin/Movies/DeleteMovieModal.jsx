// client/src/pages/Movies/DeleteConfirmationModal.jsx
import React from 'react';
import Button from '../../../components/common/Button'; // Giả sử bạn có component Button chung
import './MovieDetailModal'; // File CSS riêng cho modal này

const DeleteMovieModal = ({ isOpen, onClose, onConfirm, movieName, isLoading }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay confirmation-overlay" onClick={isLoading ? null : onClose}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa phim "{movieName}"?</p>
            <div className="confirmation-actions">
              <button onClick={onClose} className="cancel-btn">Không</button>
              <button onClick={onConfirm} className="confirm-delete-btn">Có, Xóa</button>
            </div>
          </div>
        </div>
  );
};

export default DeleteMovieModal;