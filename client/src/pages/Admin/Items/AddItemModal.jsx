import React, { useState, useEffect, useRef } from 'react';
import './AddItemModal.css'; // Import CSS riêng cho modal này

const AddItemModal = ({ isOpen, onClose, onAddItem }) => {
  // State cho các trường trong form, khởi tạo rỗng
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState(''); // State cho số lượng
  const [itemStatus, setItemStatus] = useState('Còn hàng'); // Trạng thái mặc định là "Còn hàng"
  const [itemType, setItemType] = useState(''); // State cho loại sản phẩm
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  const fileInputRef = useRef(null); // Ref để trỏ tới input file ẩn

  // Reset form khi modal mở (quan trọng khi mở lại)
  useEffect(() => {
    if (isOpen) {
      setItemName('');
      setItemPrice('');
      setItemQuantity(''); // Reset số lượng
      setItemStatus('Còn hàng'); // Reset trạng thái về mặc định
      setItemType(''); // Reset loại sản phẩm
      setPosterPreview(null);
      setPosterFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset giá trị của input file
      }
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
    } else {
      setPosterFile(null);
      setPosterPreview(null);
      // Nếu người dùng hủy chọn file (ví dụ, nhấn "Cancel" trong dialog chọn file)
      // setPosterFile(null); // Giữ file cũ nếu có, hoặc để trống
      // setPosterPreview(null); // Giữ preview cũ nếu có, hoặc để trống
      // Hoặc reset hoàn toàn nếu muốn:
      // setPosterFile(null);
      // setPosterPreview(null);
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
    // Validation cơ bản (ví dụ: tên và giá không được rỗng)
    if (!itemName.trim() || !itemPrice.trim()) { // Thêm .trim() cho price nếu nó là string
      alert('Tên sản phẩm và Giá là bắt buộc.');
      return;
    }
    // Chuyển đổi giá và số lượng sang số nếu cần, hoặc để server làm
    const priceValue = parseInt(itemPrice, 10);
    const quantityValue = itemQuantity.trim() === '' ? null : parseInt(itemQuantity, 10); // Cho phép số lượng rỗng -> null
    const itemTypeValue = itemType.trim();
    if (isNaN(priceValue) || (itemQuantity.trim() !== '' && isNaN(quantityValue))) {
      alert('Giá và Số lượng (nếu có) phải là số.');
      return;
    }


    const newItemData = {
      name: itemName.trim(),
      type: itemType.trim(),
      price: priceValue, // Đã parseInt
      quantity: quantityValue, // Đã parseInt hoặc null
      status: itemStatus.trim(),
      imageFile: posterFile, // posterFile phải là File object
    };
    console.log("AddItemModal - Submitting with newItemData:", newItemData); // LOG ĐỂ XEM
    console.log("AddItemModal - posterFile state is:", posterFile); // LOG ĐỂ XEM
    onAddItem(newItemData);
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
          <div className="modal-body add-item-modal-body"> {/* Đây là phần sẽ có thanh cuộn */}
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
                step="any" // Cho phép số thập phân
                required
              />
            </div>

            {/* Khu vực số lượng */}
            <div className="form-group add-form-group">
              <label htmlFor="add-item-quantity">Số lượng:</label>
              <input
                type="number"
                id="add-item-quantity"
                className="add-item-input"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                placeholder="Nhập số lượng"
                min="0"
                required
              />
            </div>

            {/* Khu vực Trạng thái */}
            <div className="form-group add-form-group">
              <label htmlFor="add-item-status">Trạng thái:</label>
              <select
                id="add-item-status"
                className="add-item-input"
                value={itemStatus}
                onChange={(e) => setItemStatus(e.target.value)}
              >
                <option value="Còn hàng">Còn hàng</option>
                <option value="Hết hàng">Hết hàng</option>
              </select>
            </div>
            {/* Khu vực Loại sản phẩm */}
            <div className="form-group add-form-group">
              <label htmlFor="add-item-type">Loại sản phẩm:</label>
              <input
                type="text"
                id="add-item-type"
                className="add-item-input"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                placeholder="Nhập loại sản phẩm"
              />
            </div>
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
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;