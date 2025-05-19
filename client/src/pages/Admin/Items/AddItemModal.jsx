import React, { useState, useEffect, useRef } from 'react';
import './AddItemModal.css'; // Import CSS riêng cho modal này

const AddItemModal = ({ isOpen, onClose, onAddItem }) => {
  // State cho các trường trong form, khởi tạo rỗng
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  // Không còn state itemStatus
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  const fileInputRef = useRef(null); // Ref để trỏ tới input file ẩn

  // Reset form khi modal mở (quan trọng khi mở lại)
  useEffect(() => {
    if (isOpen) {
      setItemName('');
      setItemPrice('');
      // Không cần reset itemStatus nữa
      setPosterPreview(null);
      setPosterFile(null);
    }
  }, [isOpen]);

  // Xử lý khi chọn file ảnh mới
  const handlePosterChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setPosterPreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  // Kích hoạt input file ẩn khi click vào khu vực poster
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Xử lý khi nhấn nút Thêm (submit form)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation cơ bản, bỏ kiểm tra itemStatus
    if (!itemName.trim() || isNaN(parseFloat(itemPrice)) || parseFloat(itemPrice) < 0) {
        alert("Vui lòng nhập Tên và Giá sản phẩm hợp lệ.");
        return;
    }

    // Tạo object chứa dữ liệu sản phẩm mới
    const newItemData = {
      name: itemName.trim(),
      price: parseFloat(itemPrice),
      status: 'Còn hàng', // Mặc định là "Còn hàng"
      newPosterFile: posterFile, // Gửi file object
    };

    onAddItem(newItemData); // Gọi callback để thêm item ở component cha
    // onClose(); // Component cha sẽ đóng modal sau khi xử lý
  };

  if (!isOpen) {
    return null; // Không render gì nếu modal không mở
  }

  return (
    <div className="modal-overlay add-item-overlay" onClick={onClose}>
      <div className="modal-content add-item-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header add-item-modal-header">
          <h2>Thêm Sản Phẩm</h2>
          <button className="modal-close-button add-item-close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="modal-body add-item-modal-body">
            {/* Trường Tên */}
            <div className="form-group add-form-group">
              <label htmlFor="add-item-name">Tên:</label>
              <input
                type="text"
                id="add-item-name"
                className="add-item-input"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>
            {/* Trường Giá */}
            <div className="form-group add-form-group">
              <label htmlFor="add-item-price">Giá:</label>
              <input
                type="number"
                id="add-item-price"
                className="add-item-input"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="Nhập giá"
                min="0"
                required
              />
            </div>
            
            {/* ---- TRƯỜNG TRẠNG THÁI ĐÃ BỊ LOẠI BỎ ---- */}

            {/* Khu vực Poster */}
            <div className="form-group add-form-group poster-group">
              <label>Poster (Tùy chọn):</label>
              <div className="add-item-poster-area" onClick={triggerFileInput} title="Click to add poster">
                {posterPreview ? (
                  <img src={posterPreview} alt="Poster Preview" className="add-poster-preview-img" />
                ) : (
                  <span className="add-poster-placeholder">Chọn ảnh</span> 
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handlePosterChange}
                />
              </div>
            </div>

            {/* Nút Done được đặt ở đây, bên trong modal-body */}
            <div className="form-actions-within-body">
                 <button type="submit" className="submit-done-button" title="Thêm sản phẩm">
                    Done
                 </button>
            </div>
          </div> {/* End modal-body */}
          {/* Không còn modal-footer */}
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;