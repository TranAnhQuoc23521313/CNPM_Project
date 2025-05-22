import React, { useState } from 'react';
import './AddEmployeeModal.css'; // Hoặc file CSS chung cho modal

const INITIAL_FORM_STATE = {
  name: '',
  position: '',
  department: 'Bán vé',
  phone: '',
  email: '',
  startDate: new Date().toISOString().split('T')[0],
  salary: '',
  username: '', // Thêm trường tên đăng nhập
  password: '', // Thêm trường mật khẩu
  confirmPassword: '', // Thêm trường xác nhận mật khẩu
};

function AddEmployeeModal({ onClose, onAddEmployee }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


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
    // Validation cho tài khoản và mật khẩu
    if (!formData.username.trim()) newErrors.username = "Tên đăng nhập không được để trống.";
    // Nên có validation cho username (ví dụ: không chứa ký tự đặc biệt, độ dài)
    if (!formData.password) newErrors.password = "Mật khẩu không được để trống.";
    else if (formData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự."; // Ví dụ validation độ dài
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    
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
      // Không gửi confirmPassword lên server
      const { confirmPassword, ...employeeDataToSend } = formData;
      onAddEmployee(employeeDataToSend);
      // setFormData(INITIAL_FORM_STATE); // Parent component sẽ đóng modal nên không cần reset ở đây
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
          {/* Các trường thông tin cá nhân */}
          <div className="form-row"> {/* Sử dụng form-row nếu muốn 2 cột */}
            <div className="form-group">
                <label htmlFor="name">Họ và Tên:</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
                {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
            <div className="form-group">
                <label htmlFor="position">Chức Vụ:</label>
                <input type="text" id="position" name="position" value={formData.position} onChange={handleChange} />
                {errors.position && <p className="error-message">{errors.position}</p>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
                <label htmlFor="department">Bộ Phận:</label>
                <select id="department" name="department" value={formData.department} onChange={handleChange}>
                {/* ... options ... */}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="phone">Số Điện Thoại:</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

         <div className="form-row">
            <div className="form-group">
                <label htmlFor="startDate">Ngày Vào Làm:</label>
                <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} />
                {errors.startDate && <p className="error-message">{errors.startDate}</p>}
            </div>
            <div className="form-group">
                <label htmlFor="salary">Lương (VNĐ):</label>
                <input type="number" id="salary" name="salary" value={formData.salary} onChange={handleChange} placeholder="Ví dụ: 7000000" />
                {errors.salary && <p className="error-message">{errors.salary}</p>}
            </div>
         </div>

          {/* Trường Tài khoản và Mật khẩu */}
          <h4 className="form-section-title">Thông Tin Tài Khoản</h4>
          <div className="form-group">
            <label htmlFor="username">Tên Đăng Nhập:</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} autoComplete="off" />
            {errors.username && <p className="error-message">{errors.username}</p>}
          </div>

          <div className="form-row">
            <div className="form-group password-group">
                <label htmlFor="password">Mật Khẩu:</label>
                <div className="password-input-wrapper">
                    <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} autoComplete="new-password" />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? 'Ẩn' : 'Hiện'}
                    </button>
                </div>
                {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            <div className="form-group password-group">
                <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu:</label>
                 <div className="password-input-wrapper">
                    <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                    <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                    </button>
                </div>
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
            </div>
          </div>
          
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