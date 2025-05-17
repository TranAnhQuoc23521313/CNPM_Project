import React, { useState } from 'react';
import './AddEmployeeModal.css'; // Hoặc file CSS chung cho modal

const INITIAL_FORM_STATE = {
  name: '',
  position: '',
  department: 'Bán vé', // Default
  phone: '',
  email: '',
  startDate: new Date().toISOString().split('T')[0], // Default to today
  salary: '',
  // Thêm các trường khác nếu cần
};

function AddEmployeeModal({ onClose, onAddEmployee }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

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
      onAddEmployee(formData);
      setFormData(INITIAL_FORM_STATE); // Reset form for next time (optional)
    }
  };

  return (
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="employee-modal-header">
          <h3>Thêm Nhân Viên Mới</h3>
          <button onClick={onClose} className="employee-modal-close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label htmlFor="name">Họ và Tên:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="position">Chức Vụ:</label>
            <input type="text" id="position" name="position" value={formData.position} onChange={handleChange} />
             {errors.position && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.position}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="department">Bộ Phận:</label>
            <select id="department" name="department" value={formData.department} onChange={handleChange}>
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
            <label htmlFor="phone">Số Điện Thoại:</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            {errors.phone && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.phone}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Ngày Vào Làm:</label>
            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} />
            {errors.startDate && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.startDate}</p>}
          </div>
           <div className="form-group">
            <label htmlFor="salary">Lương (VNĐ):</label>
            <input type="number" id="salary" name="salary" value={formData.salary} onChange={handleChange} placeholder="Ví dụ: 7000000" />
            {errors.salary && <p className="error-message" style={{color: 'red', fontSize: '0.8em'}}>{errors.salary}</p>}
          </div>
          {/* Thêm các trường khác tại đây */}
          <div className="employee-modal-actions">
            <button type="submit" className="btn btn-submit">Thêm Nhân Viên</button>
            <button type="button" onClick={onClose} className="btn btn-cancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployeeModal;