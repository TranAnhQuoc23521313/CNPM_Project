// src/pages/Employees/components/ShowChangePasswordForm.jsx
import React, { useState } from 'react';
// Bạn có thể import CSS riêng cho form này hoặc nó sẽ kế thừa từ EditEmployeeModal.css
// import './ShowChangePasswordForm.css';

function ShowChangePasswordForm({
  passwordData,
  onPasswordDataChange, // << ĐỔI TÊN PROP CHO NHẤT QUÁN
  passwordErrors,
  onCancelChangePassword
}) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  return (
    <div className="change-password-section">
      <h5 className="form-subsection-title">Đặt Mật Khẩu Mới</h5>
      <div className="form-row"> {/* Giả sử bạn có class form-row từ CSS chung */}
        <div className="form-group password-group"> {/* Giả sử bạn có class form-group từ CSS chung */}
          <label htmlFor="edit-newPassword">Mật Khẩu Mới:</label>
          <div className="password-input-wrapper"> {/* Class để style input và nút ẩn/hiện */}
            <input
              type={showNewPassword ? "text" : "password"}
              id="edit-newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={onPasswordDataChange} // Sử dụng hàm từ props
              autoComplete="new-password"
              aria-describedby={passwordErrors.newPassword ? "newPasswordError" : undefined}
              aria-invalid={!!passwordErrors.newPassword}
            />
            <button
              type="button"
              className="toggle-password" // Class cho nút ẩn/hiện
              onClick={() => setShowNewPassword(!showNewPassword)}
              title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} // Title cho accessibility
            >
              {showNewPassword ? 'Ẩn' : 'Hiện'}
              {/* Hoặc dùng icon mắt SVG như đã làm */}
              {/* {showNewPassword ? <EyeSlashIcon /> : <EyeOpenIcon />} */}
            </button>
          </div>
          {passwordErrors.newPassword && <p id="newPasswordError" className="error-message">{passwordErrors.newPassword}</p>}
        </div>

        <div className="form-group password-group">
          <label htmlFor="edit-confirmNewPassword">Xác Nhận Mật Khẩu Mới:</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmNewPassword ? "text" : "password"}
              id="edit-confirmNewPassword"
              name="confirmNewPassword"
              value={passwordData.confirmNewPassword}
              onChange={onPasswordDataChange} // Sử dụng hàm từ props
              autoComplete="new-password"
              aria-describedby={passwordErrors.confirmNewPassword ? "confirmNewPasswordError" : undefined}
              aria-invalid={!!passwordErrors.confirmNewPassword}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              title={showConfirmNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showConfirmNewPassword ? 'Ẩn' : 'Hiện'}
              {/* {showConfirmNewPassword ? <EyeSlashIcon /> : <EyeOpenIcon />} */}
            </button>
          </div>
          {passwordErrors.confirmNewPassword && <p id="confirmNewPasswordError" className="error-message">{passwordErrors.confirmNewPassword}</p>}
        </div>
      </div>
      <div className="form-group password-actions"> {/* Class mới để style nút hủy nếu cần */}
        <button
          type="button"
          onClick={onCancelChangePassword} // Sử dụng hàm từ props
          className="btn btn-link-style btn-cancel-change-password" // Class cho nút hủy
        >
          Hủy Đổi Mật Khẩu
        </button>
      </div>
    </div>
  );
}

export default ShowChangePasswordForm;