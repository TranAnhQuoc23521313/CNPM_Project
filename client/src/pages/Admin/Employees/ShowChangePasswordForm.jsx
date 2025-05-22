// src/pages/Employees/components/ShowChangePasswordForm.jsx
import React, { useState } from 'react';
// Bạn có thể import CSS riêng cho form này hoặc nó sẽ kế thừa từ EditEmployeeModal.css

function ShowChangePasswordForm({ passwordData, onPasswordChange, passwordErrors, onCancelChangePassword }) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  return (
    <div className="change-password-section"> {/* Class để style riêng nếu cần */}
      <h5 className="form-subsection-title">Đặt Mật Khẩu Mới</h5>
      <div className="form-row">
        <div className="form-group password-group">
          <label htmlFor="edit-newPassword">Mật Khẩu Mới:</label>
          <div className="password-input-wrapper">
            <input
              type={showNewPassword ? "text" : "password"}
              id="edit-newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={onPasswordChange} // Sử dụng hàm từ props
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          {passwordErrors.newPassword && <p className="error-message">{passwordErrors.newPassword}</p>}
        </div>
        <div className="form-group password-group">
          <label htmlFor="edit-confirmNewPassword">Xác Nhận Mật Khẩu Mới:</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmNewPassword ? "text" : "password"}
              id="edit-confirmNewPassword"
              name="confirmNewPassword"
              value={passwordData.confirmNewPassword}
              onChange={onPasswordChange} // Sử dụng hàm từ props
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
            >
              {showConfirmNewPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          {passwordErrors.confirmNewPassword && <p className="error-message">{passwordErrors.confirmNewPassword}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onCancelChangePassword} // Sử dụng hàm từ props
        className="btn btn-link-style btn-cancel-change-password"
      >
        Hủy Đổi Mật Khẩu
      </button>
    </div>
  );
}

export default ShowChangePasswordForm;