import React, { useState, useEffect, useRef } from 'react';
import './AddMovieModal.css'; // Đảm bảo file CSS này tồn tại và được import

const AddMovieModal = ({ isOpen, onClose, onAddMovie }) => {
  // State cho các trường của form "Add Movie"
  const [movieTitle, setMovieTitle] = useState('');
  const [movieYear, setMovieYear] = useState('');
  const [movieType, setMovieType] = useState(''); // Thể loại/Loại phim
  const [movieCountry, setMovieCountry] = useState('');
  const [movieDuration, setMovieDuration] = useState('');
  const [movieDirector, setMovieDirector] = useState(''); // Thêm Đạo diễn
  const [movieLanguage, setMovieLanguage] = useState(''); // Thêm Ngôn ngữ
  const [movieDescription, setMovieDescription] = useState(''); // Thêm Mô tả

  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMovieTitle(''); setMovieYear(''); setMovieType('');
      setMovieCountry(''); setMovieDuration('');
      setMovieDirector(''); setMovieLanguage(''); setMovieDescription('');
      setPosterPreview(null); setPosterFile(null);
      if (fileInputRef.current) { fileInputRef.current.value = ""; }
    }
  }, [isOpen]);

  // Xử lý khi chọn file ảnh mới
  const handlePosterChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPosterFile(file); // Lưu File object
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result); // Tạo data URL cho preview
      };
      reader.readAsDataURL(file);
    } else {
      setPosterFile(null);
      setPosterPreview(null);
    }
  };

  // Kích hoạt input file ẩn khi click vào khu vực poster
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!movieTitle.trim() || !movieYear.trim() || isNaN(parseInt(movieYear)) ||
      !movieType.trim() || !movieCountry.trim() ||
      !movieDuration.trim() || isNaN(parseInt(movieDuration)) || parseInt(movieDuration) <= 0
    ) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (Title, Year, Type, Country, Duration).");
      return;
    }
    const formDataFromModal = {
      MAPHIM: '', // ID sẽ được tạo tự động trên server
      TENPHIM: movieTitle,
      NAMPH: parseInt(movieYear),
      THELOAI: movieType,
      DAODIEN: movieDirector,
      THOILUONG: parseInt(movieDuration),
      MOTA: movieDescription,
      QUOCGIA: movieCountry,
      NGONNGU: movieLanguage,
      HINHANH: posterFile, // Gửi file ảnh
    };
    onAddMovie(formDataFromModal);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay add-movie-overlay" onClick={onClose}>
      <div className="modal-content add-movie-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header add-movie-modal-header">
          <h2>Add New Movie</h2>
          <button className="modal-close-button add-movie-close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-movie-form">
          <div className="modal-body add-movie-modal-body">
            <div className="form-group add-movie-form-group"><label htmlFor="movie-title-add">Title:</label><input type="text" id="movie-title-add" className="add-movie-input" value={movieTitle} onChange={(e) => setMovieTitle(e.target.value)} placeholder="Enter movie title" required /></div>
            <div className="form-group add-movie-form-group"><label htmlFor="movie-year-add">Year:</label><input type="number" id="movie-year-add" className="add-movie-input" value={movieYear} onChange={(e) => setMovieYear(e.target.value)} placeholder="e.g., 2023" min="1800" max={new Date().getFullYear() + 5} required /></div>
            <div className="form-group add-movie-form-group"><label htmlFor="movie-type-add">Type/Genre:</label><input type="text" id="movie-type-add" className="add-movie-input" value={movieType} onChange={(e) => setMovieType(e.target.value)} placeholder="e.g., Drama, Action" required /></div>
            <div className="form-group add-movie-form-group"><label htmlFor="movie-director-add">Director:</label><input type="text" id="movie-director-add" className="add-movie-input" value={movieDirector} onChange={(e) => setMovieDirector(e.target.value)} placeholder="Director's name" /></div>
            <div className="form-group add-movie-form-group"><label htmlFor="movie-country-add">Country:</label><input type="text" id="movie-country-add" className="add-movie-input" value={movieCountry} onChange={(e) => setMovieCountry(e.target.value)} placeholder="e.g., USA, Vietnam" required /></div>
            <div className="form-group add-movie-form-group"><label htmlFor="movie-language-add">Language:</label><input type="text" id="movie-language-add" className="add-movie-input" value={movieLanguage} onChange={(e) => setMovieLanguage(e.target.value)} placeholder="e.g., English, Vietnamese" /></div>
            <div className="form-group add-movie-form-group"><label htmlFor="movie-duration-add">Duration (min):</label><input type="number" id="movie-duration-add" className="add-movie-input" value={movieDuration} onChange={(e) => setMovieDuration(e.target.value)} placeholder="Enter duration" min="1" required /></div>
            <div className="form-group add-movie-form-group"><label htmlFor="movie-description-add">Description:</label><textarea id="movie-description-add" className="add-movie-input" value={movieDescription} onChange={(e) => setMovieDescription(e.target.value)} placeholder="Movie description" rows="3"></textarea></div>
            <div className="form-group add-movie-form-group poster-group"><label htmlFor="add-movie-poster">Poster (Optional):</label><div className="add-movie-poster-area" onClick={triggerFileInput} title="Click to add poster">{posterPreview ? (<img src={posterPreview} alt="Poster Preview" className="add-poster-preview-img" />) : (<span className="add-poster-placeholder">Choose Image</span>)}<input type="file" id="add-movie-poster" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePosterChange} /></div></div>
            <div className="form-actions-within-body"><button type="submit" className="submit-done-button" title="Add New Movie">Add Movie</button></div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddMovieModal;