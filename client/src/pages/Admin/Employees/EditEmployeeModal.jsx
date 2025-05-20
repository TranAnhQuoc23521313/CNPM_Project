import React, { useState, useEffect } from 'react';
import './EditEmployeeModal.css'; // Hoặc file CSS chung cho modal

function EditEmployeeModal({ employeeData, onClose, onUpdateEmployee }) {
  const [formData, setFormData] = useState(employeeData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(employeeData); // Cập nhật form khi employeeData thay đổi
  }, [employeeData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Họ tên không được để trống.";
    if (!formData.position.trim()) newErrors.position = "Chức vụ không được để trống.";
    if (!formData.phone.trim()) newErrors.phone = "Số điện thoại không được để trống.";
    else if (!/^\d{10,11}$/.test(formData.phone)) newErrors.phone = "Số điện thoại không hợp lệ.";
    if (!formData.email.trim()) newErrors.email = "Email không được để trống.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ.";
     if (!formData.startDate) newErrors.startDate = "Ngày vào làm không được để trống.";
    if (formData.salary && (isNaN(formData.salary) || Number(formData.salary) <= 0)) {
        newErrors.salary = "Lương phải là một số dương.";
    }
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
      onUpdateEmployee(formData);
    }
  };

  if (!employeeData) return null; // Không render gì nếu không có data

  return (
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="employee-modal-header">
          <h3>Sửa Thông Tin Nhân Viên (ID: {employeeData.id})</h3>
          <button onClick={onClose} className="employee-modal-close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label htmlFor="edit-name">Họ và Tên:</label>
            <input type="text" id="edit-name" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-position">Chức Vụ:</label>
            <input type="text" id="edit-position" name="position" value={formData.position} onChange={handleChange} />
            {errors.position && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.position}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-department">Bộ Phận:</label>
            <select id="edit-department" name="department" value={formData.department} onChange={handleChange}>
              <option value="Bán vé">Bán vé</option>
              <option value="Soát vé">Soát vé</option>
              <option value="Kỹ thuật">Kỹ thuật</option>
              <option value="Vệ sinh">Vệ sinh</option>
              <option value="Marketing">Marketing</option>
              <option value="Quản lý">Quản lý</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="edit-phone">Số Điện Thoại:</label>
            <input type="tel" id="edit-phone" name="phone" value={formData.phone} onChange={handleChange} />
            {errors.phone && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.phone}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-email">Email:</label>
            <input type="email" id="edit-email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-startDate">Ngày Vào Làm:</label>
            <input type="date" id="edit-startDate" name="startDate" value={formData.startDate} onChange={handleChange} />
             {errors.startDate && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.startDate}</p>}
          </div>
           <div className="form-group">
            <label htmlFor="edit-salary">Lương (VNĐ):</label>
            <input type="number" id="edit-salary" name="salary" value={formData.salary} onChange={handleChange} />
            {errors.salary && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.salary}</p>}
          </div>
          {/* Thêm các trường khác tại đây */}
          <div className="employee-modal-actions">
            <button type="submit" className="btn btn-submit">Lưu Thay Đổi</button>
            <button type="button" onClick={onClose} className="btn btn-cancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEmployeeModal;