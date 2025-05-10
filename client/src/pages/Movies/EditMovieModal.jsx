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
    if (movie) {
      setEditedTitle(movie.title || '');
      setEditedYear(movie.year?.toString() || '');
      setEditedType(movie.type || movie.genre || '');
      setEditedCountry(movie.country || '');
      setEditedDuration(movie.duration?.toString() || '');
      setEditedDirector(movie.director || '');
      setEditedLanguage(movie.language || '');
      setEditedDescription(movie.description || '');
      setPosterPreview(movie.posterUrl || null);
      setPosterFile(null);
    } else {
      // Reset
      setEditedTitle(''); setEditedYear(''); setEditedType(''); setEditedCountry(''); 
      setEditedDuration(''); setEditedDirector(''); setEditedLanguage(''); 
      setEditedDescription(''); setPosterPreview(null); setPosterFile(null);
    }
  }, [movie]);

  const handlePosterChange = (event) => { /* ... như trước ... */ };
  const triggerFileInput = () => { /* ... như trước ... */ };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editedTitle.trim() || !editedYear.trim() || isNaN(parseInt(editedYear)) ||
        !editedType.trim() || !editedCountry.trim() || 
        !editedDuration.trim() || isNaN(parseInt(editedDuration)) || parseInt(editedDuration) <= 0
    ) {
        alert("Vui lòng điền đầy đủ các thông tin bắt buộc (Title, Year, Type, Country, Duration).");
        return;
    }
    const updatedMovieData = {
      title: editedTitle.trim(), year: parseInt(editedYear, 10),
      type: editedType.trim(), country: editedCountry.trim(),
      duration: parseInt(editedDuration, 10),
      director: editedDirector.trim(), language: editedLanguage.trim(),
      description: editedDescription.trim(),
      newPosterFile: posterFile, posterUrl: posterPreview,
    };
    onUpdateMovie(movie.id, updatedMovieData);
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