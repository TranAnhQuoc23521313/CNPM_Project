import React, { useState } from 'react';
import './EmployeeDetailModal.css'; // Hoặc file CSS chung cho modal

const EyeOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
  </svg>
);

function EmployeeDetailModal({ employee, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

  const toggleShowToken = () => { // Hàm mới cho token
    setShowToken(prevShowToken => !prevShowToken);
  };

  const getTruncatedToken = (token, startLength = 8, endLength = 8) => {
    if (!token) return 'N/A';
    if (token.length <= startLength + endLength + 3) return token; // Nếu token quá ngắn, hiển thị hết
    return `${token.substring(0, startLength)}...${token.substring(token.length - endLength)}`;
  };

  if (!employee) return null;

  return (
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-content employee-detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="employee-modal-header">
          <h3>Chi Tiết Nhân Viên</h3>
          <button onClick={onClose} className="employee-modal-close-btn">×</button>
        </div>
        <div className="details-body">
          <div className="detail-section">
            <h4>Thông Tin Cá Nhân</h4>
            <div className="detail-item"><strong>ID Nhân Viên:</strong> {employee.id || 'N/A'}</div>
            <div className="detail-item"><strong>Họ và Tên:</strong> {employee.name || 'N/A'}</div>
            <div className="detail-item"><strong>Chức Vụ:</strong> {employee.position || 'N/A'}</div>
            <div className="detail-item"><strong>Giới tính:</strong> {employee.sex || 'N/A'}</div>
            <div className="detail-item"><strong>Số Điện Thoại:</strong> {employee.phone || 'N/A'}</div>
            <div className="detail-item"><strong>Email:</strong> {employee.email || 'N/A'}</div>
            <div className="detail-item"><strong>Địa chỉ:</strong> {employee.address || 'N/A'}</div>
            <div className="detail-item">
              <strong>Ngày Sinh:</strong>
              {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('vi-VN') : 'N/A'}
            </div>
            <div className="detail-item">
              <strong>Ngày Vào Làm:</strong>
              {employee.startDate ? new Date(employee.startDate).toLocaleDateString('vi-VN') : 'N/A'}
            </div>
            <div className="detail-item">
              <strong>Lương:</strong>
              {employee.salary ? Number(employee.salary).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A'}
            </div>
          </div>

          {/* Thêm phần chi tiết tài khoản */}
          {/* Phần Thông Tin Tài Khoản - Chỉ hiển thị nếu có username */}
          {employee.username && (
            <div className="detail-section">
              <h4>Thông Tin Tài Khoản</h4>
              {/* {employee.accountId && <div className="detail-item full-width"><strong>Mã Tài Khoản (MATK):</strong> {employee.accountId}</div>} */}
              <div className="detail-item full-width"><strong>Tên Đăng Nhập:</strong> {employee.username}</div>
              {employee.password && ( // Chỉ hiển thị mục mật khẩu nếu có mật khẩu
                <div className="detail-item password-display-item full-width">
                  <strong>Mật Khẩu:</strong>
                  <span className="password-text">
                    {showPassword ? employee.password : '••••••••••'}
                  </span>
                  <button
                    onClick={toggleShowPassword}
                    className="btn-toggle-password-visibility svg-eye-button" // Class mới cho SVG button
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
              )}
              {/* {employee.role && <div className="detail-item full-width"><strong>Vai trò:</strong> {employee.role}</div>}
              {employee.mockToken && (
                <div className="detail-item full-width token-display">
                  <strong>Token Mock:</strong>
                  <span>{employee.mockToken}</span>
                </div>
              )} */}
            </div>
          )}
          {!employee.username && (
            <div className="detail-section">
              <h4>Thông Tin Tài Khoản</h4>
              <p>Nhân viên này chưa có tài khoản.</p>
            </div>
          )}
        </div>
        <div className="employee-modal-actions">
          <button onClick={onClose} className="btn btn-cancel">Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetailModal;