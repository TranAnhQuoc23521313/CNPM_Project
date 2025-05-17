import React, { useState, useEffect } from 'react';
import './EditCustomerModal.css'; // Sử dụng chung CSS với AddCustomerModal

function EditCustomerModal({ customerData, onClose, onSave }) { // onSave là prop từ Customers.jsx
  // Khởi tạo state với customerData hoặc một object rỗng nếu customerData chưa có
  const [formData, setFormData] = useState(customerData || {
    id: '', name: '', email: '', phone: '', membershipTier: 'Đồng', joinDate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Cập nhật form data nếu customerData thay đổi (ví dụ: người dùng chọn khách hàng khác để sửa)
    // Đảm bảo joinDate được định dạng YYYY-MM-DD cho input type="date"
    if (customerData) {
        setFormData({
            ...customerData,
            joinDate: customerData.joinDate ? customerData.joinDate.split('T')[0] : ''
        });
    }
  }, [customerData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Họ tên không được để trống.";
    if (!formData.email.trim()) newErrors.email = "Email không được để trống.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ.";
    if (formData.phone.trim() && !/^\d{10,11}$/.test(formData.phone)) {
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
      console.log("EditCustomerModal: Submitting formData", formData); // DEBUG
      onSave(formData); // Gọi hàm onSave từ Customers.jsx
    } else {
      console.log("EditCustomerModal: Validation failed", errors); // DEBUG
    }
  };

  if (!customerData) return null; // Hoặc hiển thị loading spinner

  return (
    <div className="customer-modal-overlay" onClick={onClose}>
      <div className="customer-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="customer-modal-header">
          <h3>Sửa Thông Tin Khách Hàng (ID: {customerData.id})</h3>
          <button onClick={onClose} className="customer-modal-close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label htmlFor="edit-customer-name">Họ và Tên:</label>
            <input type="text" id="edit-customer-name" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-customer-email">Email:</label>
            <input type="email" id="edit-customer-email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-customer-phone">Số Điện Thoại:</label>
            <input type="tel" id="edit-customer-phone" name="phone" value={formData.phone} onChange={handleChange} />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-customer-membershipTier">Hạng Thành Viên:</label>
            <select id="edit-customer-membershipTier" name="membershipTier" value={formData.membershipTier} onChange={handleChange}>
              <option value="Đồng">Đồng</option>
              <option value="Bạc">Bạc</option>
              <option value="Vàng">Vàng</option>
              <option value="Bạch Kim">Bạch Kim</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="edit-customer-joinDate">Ngày Tham Gia:</label>
            <input type="date" id="edit-customer-joinDate" name="joinDate" value={formData.joinDate} onChange={handleChange} />
            {errors.joinDate && <p className="error-message">{errors.joinDate}</p>}
          </div>
          
          <div className="customer-modal-actions">
            <button type="submit" className="btn btn-submit">Lưu Thay Đổi</button>
            <button type="button" onClick={onClose} className="btn btn-cancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCustomerModal;