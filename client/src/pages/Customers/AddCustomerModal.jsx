import React, { useState } from 'react';
// Bạn sẽ cần tạo file CSS này hoặc điều chỉnh CSS hiện có cho modal
import './AddCustomerModal.css'; // File CSS chung cho Add/Edit Customer Modal

const INITIAL_CUSTOMER_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  membershipTier: 'Đồng', // Default
  joinDate: new Date().toISOString().split('T')[0], // Default to today
};

function AddCustomerModal({ onClose, onSave }) { // onSave là prop từ Customers.jsx
  const [formData, setFormData] = useState(INITIAL_CUSTOMER_FORM_STATE);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Họ tên không được để trống.";
    if (!formData.email.trim()) newErrors.email = "Email không được để trống.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ.";
    if (formData.phone.trim() && !/^\d{10,11}$/.test(formData.phone)) { // Phone là tùy chọn, nhưng nếu nhập phải đúng
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số).";
    }
    if (!formData.joinDate) newErrors.joinDate = "Ngày tham gia không được để trống.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
        setErrors(prev => ({...prev, [name]: null}));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("AddCustomerModal: Submitting formData", formData); // DEBUG
      onSave(formData); // Gọi hàm onSave từ Customers.jsx
      // Không cần reset form ở đây vì Customers.jsx sẽ đóng modal, làm component unmount
      // setFormData(INITIAL_CUSTOMER_FORM_STATE); // Nếu muốn reset nếu modal không unmount
    } else {
      console.log("AddCustomerModal: Validation failed", errors); // DEBUG
    }
  };

  return (
    <div className="customer-modal-overlay" onClick={onClose}>
      <div className="customer-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="customer-modal-header">
          <h3>Thêm Khách Hàng Mới</h3>
          <button onClick={onClose} className="customer-modal-close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="customer-form"> {/* Đổi tên class form */}
          <div className="form-group">
            <label htmlFor="customer-name">Họ và Tên:</label>
            <input type="text" id="customer-name" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="customer-email">Email:</label>
            <input type="email" id="customer-email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="customer-phone">Số Điện Thoại:</label>
            <input type="tel" id="customer-phone" name="phone" value={formData.phone} onChange={handleChange} />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="customer-membershipTier">Hạng Thành Viên:</label>
            <select id="customer-membershipTier" name="membershipTier" value={formData.membershipTier} onChange={handleChange}>
              <option value="Đồng">Đồng</option>
              <option value="Bạc">Bạc</option>
              <option value="Vàng">Vàng</option>
              <option value="Bạch Kim">Bạch Kim</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="customer-joinDate">Ngày Tham Gia:</label>
            <input type="date" id="customer-joinDate" name="joinDate" value={formData.joinDate} onChange={handleChange} />
            {errors.joinDate && <p className="error-message">{errors.joinDate}</p>}
          </div>
          
          <div className="customer-modal-actions">
            <button type="submit" className="btn btn-submit">Thêm Khách Hàng</button>
            <button type="button" onClick={onClose} className="btn btn-cancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomerModal;