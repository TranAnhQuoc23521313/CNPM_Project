import React, { useState, useEffect, useRef } from 'react';
import './EditMovieModal.css'; // Hoặc dùng chung AddMovieModal.css / EditItemModal.css

const EditMovieModal = ({ isOpen, onClose, movie, onUpdateMovie }) => {
  const [editedTitle, setEditedTitle] = useState('');
  const [editedYear, setEditedYear] = useState('');
  const [editedType, setEditedType] = useState('');
  const [editedCountry, setEditedCountry] = useState('');
  const [editedDuration, setEditedDuration] = useState('');
  const [editedDirector, setEditedDirector] = useState('');
  const [editedLanguage, setEditedLanguage] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && movie) {
      console.log('EditMovieModal: Populating form with movie data:', movie);
      setEditedTitle(movie.title || '');
      setEditedYear(movie.year?.toString() || '');
      // Sử dụng movie.type vì mapApiToClient đã map THELOAI sang type
      setEditedType(movie.type || '');
      setEditedCountry(movie.country || '');
      setEditedDuration(movie.duration?.toString() || '');
      setEditedDirector(movie.director || '');
      setEditedLanguage(movie.language || '');
      setEditedDescription(movie.description || '');

      setPosterPreview(movie.posterUrl || null); // Hiển thị ảnh hiện tại (URL từ server)
      setPosterFile(null); // Reset trạng thái file mới

      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input file để có thể chọn lại cùng file
      }
    } else if (!isOpen) {
      // Tùy chọn: Reset hoàn toàn khi đóng (nếu không muốn giữ lại state)
      // Tuy nhiên, việc reset khi movie thay đổi hoặc isOpen đã đủ
    }
  }, [movie]); // Chạy lại khi modal mở hoặc phim cần sửa thay đổi

  const handlePosterChange = (event) => { 
    const file = event.target.files[0];
    if (file) {
      setPosterFile(file); // Lưu File object của ảnh MỚI
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result); // Hiển thị preview của ảnh MỚI (dataURL)
      };
      reader.readAsDataURL(file);
    }
  };

   const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ... (validation) ...

    const updatedMovieData = {
      // MAPHIM không cần gửi trong object này, nó đã là movie.id
      TENPHIM: editedTitle.trim(),
      NAMPH: editedYear.trim() ? parseInt(editedYear.trim(), 10) : null,
      THELOAI: editedType.trim(),
      DAODIEN: editedDirector.trim(),
      THOILUONG: editedDuration.trim() ? parseInt(editedDuration.trim(), 10) : null,
      MOTA: editedDescription.trim(),
      QUOCGIA: editedCountry.trim(),
      NGONNGU: editedLanguage.trim(),

      // Thông tin ảnh để MoviesPage xử lý
      newPosterFile: posterFile, // File object mới (nếu có)
      currentPosterDisplayUrl: posterPreview, // URL đang hiển thị (dataURL mới, URL gốc cũ, hoặc null)
    };

    console.log('EditMovieModal - Submitting data:', JSON.stringify(updatedMovieData, null, 2));
    onUpdateMovie(movie.id, updatedMovieData); // movie.id là MAPHIM
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="modal-overlay edit-movie-overlay" onClick={onClose}>
      <div className="modal-content edit-movie-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header edit-movie-modal-header">
          <h2>Edit Movie: {movie.title}</h2>
          <button className="modal-close-button edit-movie-close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="edit-movie-form">
          <div className="modal-body edit-movie-modal-body">
            {/* Cột Poster */}
            <div className="edit-poster-section">
              <label htmlFor={`edit-movie-poster-${movie.id}`}>Poster</label> {/* Thêm htmlFor */}
              <div className="edit-movie-poster-area" onClick={triggerFileInput} title="Click to change poster">
                {posterPreview ? (
                  <img src={posterPreview} alt="Poster Preview" className="edit-poster-preview-img" />
                ) : (
                  <span className="edit-poster-placeholder">{movie.posterPlaceholder || 'Edit Poster'}</span>
                )}
                <input type="file" id={`edit-movie-poster-${movie.id}`} ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePosterChange} />
              </div>
            </div>

            {/* Cột các trường thông tin */}
            <div className="edit-fields-section">
              <div className="form-group edit-movie-form-group">
                <label htmlFor={`edit-movie-title-${movie.id}`}>Title:</label>
                <input type="text" id={`edit-movie-title-${movie.id}`} className="edit-movie-input" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} required />
              </div>
              <div className="form-group edit-movie-form-group">
                <label htmlFor={`edit-movie-year-${movie.id}`}>Year:</label>
                <input type="number" id={`edit-movie-year-${movie.id}`} className="edit-movie-input" value={editedYear} onChange={(e) => setEditedYear(e.target.value)} min="1800" max={new Date().getFullYear() + 5} required />
              </div>
              <div className="form-group edit-movie-form-group">
                <label htmlFor={`edit-movie-type-${movie.id}`}>Type/Genre:</label>
                <input type="text" id={`edit-movie-type-${movie.id}`} className="edit-movie-input" value={editedType} onChange={(e) => setEditedType(e.target.value)} placeholder="e.g., Drama, Action" required />
              </div>
              <div className="form-group edit-movie-form-group">
                <label htmlFor={`edit-movie-director-${movie.id}`}>Director:</label>
                <input type="text" id={`edit-movie-director-${movie.id}`} className="edit-movie-input" value={editedDirector} onChange={(e) => setEditedDirector(e.target.value)} placeholder="Director's name" />
              </div>
              <div className="form-group edit-movie-form-group">
                <label htmlFor={`edit-movie-country-${movie.id}`}>Country:</label>
                <input type="text" id={`edit-movie-country-${movie.id}`} className="edit-movie-input" value={editedCountry} onChange={(e) => setEditedCountry(e.target.value)} placeholder="e.g., USA, Vietnam" required />
              </div>
              <div className="form-group edit-movie-form-group">
                <label htmlFor={`edit-movie-language-${movie.id}`}>Language:</label>
                <input type="text" id={`edit-movie-language-${movie.id}`} className="edit-movie-input" value={editedLanguage} onChange={(e) => setEditedLanguage(e.target.value)} placeholder="e.g., English" />
              </div>
              <div className="form-group edit-movie-form-group">
                <label htmlFor={`edit-movie-duration-${movie.id}`}>Duration (min):</label>
                <input type="number" id={`edit-movie-duration-${movie.id}`} className="edit-movie-input" value={editedDuration} onChange={(e) => setEditedDuration(e.target.value)} placeholder="Enter duration" min="1" required />
              </div>
              <div className="form-group edit-movie-form-group">
                <label htmlFor={`edit-movie-description-${movie.id}`}>Description:</label>
                <textarea id={`edit-movie-description-${movie.id}`} className="edit-movie-input" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} placeholder="Movie description" rows="3"></textarea>
              </div>
            </div>
          </div>
          <div className="modal-footer edit-movie-modal-footer">
             <button type="submit" className="save-changes-button">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditMovieModal;