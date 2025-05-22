import React, { useState, useEffect } from 'react';
import './EditEmployeeModal.css';
import ShowChangePasswordForm from './ShowChangePasswordForm'; // Đường dẫn đến component con

function EditEmployeeModal({ employeeData, onClose, onUpdateEmployee }) {
  // formData sẽ chứa các trường có thể sửa đổi
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: 'Bán vé',
    phone: '',
    email: '',
    startDate: '',
    salary: '',
    // username sẽ không sửa, chỉ hiển thị
  });
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmNewPassword: '' });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  useEffect(() => {
    if (employeeData) {
      setFormData({
        name: employeeData.name || '',
        position: employeeData.position || '',
        department: employeeData.department || 'Bán vé',
        phone: employeeData.phone || '',
        email: employeeData.email || '',
        startDate: employeeData.startDate ? employeeData.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        salary: employeeData.salary ? String(employeeData.salary) : '', // Chuyển lương thành string cho input number
        // username không cần set ở đây vì nó không sửa đổi trong formData này
      });
    }
    // Reset form đổi mật khẩu và ẩn nó đi
    setPasswordData({ newPassword: '', confirmNewPassword: '' });
    setPasswordErrors({});
    setShowChangePasswordForm(false);
  }, [employeeData]);

  const validateInfoForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Họ tên không được để trống.";
    if (!formData.position.trim()) newErrors.position = "Chức vụ không được để trống.";
    if (!formData.department) newErrors.department = "Bộ phận không được để trống.";
    if (!formData.phone.trim()) newErrors.phone = "Số điện thoại không được để trống.";
    else if (!/^\d{10,11}$/.test(formData.phone)) newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số).";
    if (!formData.email.trim()) newErrors.email = "Email không được để trống.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ.";
    if (!formData.startDate) newErrors.startDate = "Ngày vào làm không được để trống.";
    if (formData.salary && (isNaN(Number(formData.salary)) || Number(formData.salary) < 0)) { // Cho phép lương = 0
      newErrors.salary = "Lương phải là một số không âm.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newPasswordErrors = {};
    if (showChangePasswordForm) { // Chỉ validate nếu form đang hiện
      if (!passwordData.newPassword) {
        newPasswordErrors.newPassword = "Mật khẩu mới không được để trống.";
      } else if (passwordData.newPassword.length < 6) {
        newPasswordErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
      }
      // Chỉ validate confirmPassword nếu newPassword đã được nhập và không có lỗi
      if (passwordData.newPassword && !newPasswordErrors.newPassword && passwordData.newPassword !== passwordData.confirmNewPassword) {
        newPasswordErrors.confirmNewPassword = "Mật khẩu xác nhận không khớp.";
      }
    }
    setPasswordErrors(newPasswordErrors);
    return Object.keys(newPasswordErrors).length === 0;
  };
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };
  const handlePasswordDataChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: null }));
  };
  const handleCancelChangePassword = () => {
    setShowChangePasswordForm(false);
    setPasswordData({ newPassword: '', confirmNewPassword: '' });
    setPasswordErrors({});
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const isInfoValid = validateInfoForm();
    let isPasswordValid = true;

    if (showChangePasswordForm && (passwordData.newPassword || passwordData.confirmNewPassword)) {
      isPasswordValid = validatePasswordForm();
    }

    if (isInfoValid && isPasswordValid) {
      const dataToUpdate = {
        ...formData, // Các thông tin cá nhân đã sửa
        id: employeeData.id, // Luôn gửi ID gốc
        username: employeeData.username, // Gửi lại username gốc (không cho sửa ở đây)
        salary: formData.salary ? Number(formData.salary) : null, // Chuyển lương về số hoặc null nếu rỗng
      };
      if (showChangePasswordForm && isPasswordValid && passwordData.newPassword) {
        dataToUpdate.password = passwordData.newPassword;
      }
      console.log("Submitting updated employee data:", dataToUpdate); // DEBUG
      onUpdateEmployee(dataToUpdate);
    }
  };

  if (!employeeData) return null;

  return (
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-content edit-employee-modal" onClick={(e) => e.stopPropagation()}>
        <div className="employee-modal-header">
          <h3>Sửa Thông Tin Nhân Viên (ID: {employeeData.id})</h3>
          <button onClick={onClose} className="employee-modal-close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="employee-form modal-body">
          <h4 className="form-section-title">Thông Tin Cá Nhân</h4>
          {/* --- Các trường thông tin cá nhân có thể chỉnh sửa --- */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-name">Họ và Tên:</label>
              <input type="text" id="edit-name" name="name" value={formData.name} onChange={handleInfoChange} />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="edit-position">Chức Vụ:</label>
              <input type="text" id="edit-position" name="position" value={formData.position} onChange={handleInfoChange} />
              {errors.position && <p className="error-message">{errors.position}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-department">Bộ Phận:</label>
              <select id="edit-department" name="department" value={formData.department} onChange={handleInfoChange}>
                <option value="Bán vé">Bán vé</option>
                <option value="Soát vé">Soát vé</option>
                <option value="Kỹ thuật">Kỹ thuật</option>
                <option value="Vệ sinh">Vệ sinh</option>
                <option value="Marketing">Marketing</option>
                <option value="Quản lý">Quản lý</option>
                <option value="Khác">Khác</option>
              </select>
              {errors.department && <p className="error-message">{errors.department}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="edit-phone">Số Điện Thoại:</label>
              <input type="tel" id="edit-phone" name="phone" value={formData.phone} onChange={handleInfoChange} />
              {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-email">Email:</label>
            <input type="email" id="edit-email" name="email" value={formData.email} onChange={handleInfoChange} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-startDate">Ngày Vào Làm:</label>
              <input type="date" id="edit-startDate" name="startDate" value={formData.startDate} onChange={handleInfoChange} />
              {errors.startDate && <p className="error-message">{errors.startDate}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="edit-salary">Lương (VNĐ):</label>
              <input type="number" id="edit-salary" name="salary" value={formData.salary} onChange={handleInfoChange} placeholder="Ví dụ: 7000000" />
              {errors.salary && <p className="error-message">{errors.salary}</p>}
            </div>
          </div>

          {/* --- Phần Tài khoản --- */}
          <h4 className="form-section-title">Thông Tin Tài Khoản</h4>
          <div className="form-group">
            <label>Tên Đăng Nhập:</label>
            {/* Username không cho sửa, chỉ hiển thị từ employeeData */}
            <p className="form-control-static">{employeeData.username || 'N/A'}</p>
          </div>

          {!showChangePasswordForm && (
            <div className="form-group change-password-trigger">
              <button
                type="button"
                onClick={() => setShowChangePasswordForm(true)}
                className="btn btn-link-style"
              >
                Đổi Mật Khẩu
              </button>
            </div>
          )}

          {showChangePasswordForm && (
            <ShowChangePasswordForm
              passwordData={passwordData}
              onPasswordChange={handlePasswordDataChange}
              passwordErrors={passwordErrors}
              onCancelChangePassword={handleCancelChangePassword}
            />
          )}

          <div className="employee-modal-actions modal-footer">
            <button type="button" onClick={onClose} className="btn btn-cancel">Hủy</button>
            <button type="submit" className="btn btn-submit">Lưu Thay Đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEmployeeModal;