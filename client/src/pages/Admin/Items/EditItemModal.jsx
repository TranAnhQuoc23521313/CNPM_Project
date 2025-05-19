import React, { useState, useEffect, useRef } from 'react';
import './EditItemModal.css'; // Đảm bảo file CSS này tồn tại và được import

const EditItemModal = ({ isOpen, onClose, item, onUpdateItem }) => {
  const [editedName, setEditedName] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  // Giữ nguyên editedStatus, nó sẽ khớp với giá trị của option trong select
  const [editedStatus, setEditedStatus] = useState(''); 
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  const fileInputRef = useRef(null);

  // Các trạng thái có thể chọn
  const availableStatuses = ["Còn hàng", "Hết hàng", "Ngừng bán"];

  useEffect(() => {
    if (item) {
      setEditedName(item.name || '');
      setEditedPrice(item.price?.toString() || '');
      // Đảm bảo giá trị ban đầu của status có trong danh sách availableStatuses
      // Nếu không, có thể đặt một giá trị mặc định
      setEditedStatus(item.status && availableStatuses.includes(item.status) ? item.status : availableStatuses[0]);
      setPosterPreview(item.posterUrl || null);
      setPosterFile(null);
    } else {
      setEditedName(''); 
      setEditedPrice(''); 
      setEditedStatus(availableStatuses[0]); // Giá trị mặc định khi không có item
      setPosterPreview(null); 
      setPosterFile(null);
    }
  }, [item, isOpen]); // Thêm isOpen vào dependency array để reset khi mở lại

  const handlePosterChange = (event) => {
    // ... (logic giữ nguyên)
    const file = event.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setPosterPreview(reader.result); };
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
    if (!editedName.trim() || isNaN(parseFloat(editedPrice)) || parseFloat(editedPrice) < 0 || !editedStatus) {
        alert("Vui lòng nhập đầy đủ và hợp lệ các thông tin.");
        return;
    }
    const updatedData = {
      name: editedName.trim(),
      price: parseFloat(editedPrice),
      status: editedStatus, // Giá trị đã được chọn từ select
      newPosterFile: posterFile, 
      posterUrl: posterPreview 
    };
    onUpdateItem(item.id, updatedData);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Item: {item.name}</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body edit-modal-body">
            {/* Khu vực Poster */}
            <div className="edit-poster-section">
              {/* ... (JSX cho poster giữ nguyên) ... */}
              <label>Poster</label>
              <div className="edit-poster-area" onClick={triggerFileInput} title="Click to change poster">
                {posterPreview ? (
                  <img src={posterPreview} alt="Poster Preview" className="poster-preview-img" />
                ) : (
                  <span className="poster-edit-placeholder">{item.posterPlaceholder || 'Edit Poster'}</span>
                )}
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePosterChange} />
              </div>
            </div>
            {/* Các trường thông tin */}
            <div className="edit-fields-section">
              <div className="form-group edit-form-group">
                <label htmlFor={`edit-item-name-${item.id}`}>Tên:</label>
                <input type="text" id={`edit-item-name-${item.id}`} className="edit-input" value={editedName} onChange={(e) => setEditedName(e.target.value)} required />
              </div>
              <div className="form-group edit-form-group">
                <label htmlFor={`edit-item-price-${item.id}`}>Giá:</label>
                <input type="number" id={`edit-item-price-${item.id}`} className="edit-input" value={editedPrice} onChange={(e) => setEditedPrice(e.target.value)} placeholder="Nhập giá" min="0" required />
              </div>
              {/* ---- THAY ĐỔI TRƯỜNG TRẠNG THÁI SANG SELECT ---- */}
              <div className="form-group edit-form-group">
                <label htmlFor={`edit-item-status-${item.id}`}>Trạng thái:</label>
                <select 
                    id={`edit-item-status-${item.id}`} 
                    className="edit-input" // Vẫn dùng class edit-input để có style tương tự
                    value={editedStatus} 
                    onChange={(e) => setEditedStatus(e.target.value)} 
                    required
                 >
                    {/* <option value="" disabled>-- Chọn trạng thái --</option>  // Bỏ nếu không muốn option rỗng */}
                    {availableStatuses.map(statusOption => (
                        <option key={statusOption} value={statusOption}>
                            {statusOption}
                        </option>
                    ))}
                 </select>
              </div>
              {/* ---- KẾT THÚC THAY ĐỔI ---- */}
            </div>
          </div>
          <div className="modal-footer edit-modal-footer">
             <button type="submit" className="save-changes-button">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;