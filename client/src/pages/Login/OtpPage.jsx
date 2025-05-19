// --- START OF FILE OtpPage.jsx ---
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OtpPage.css';

// --- GIẢ LẬP USER SAU KHI XÁC THỰC OTP THÀNH CÔNG ---
// Giả sử OTP này là để admin "admin" lấy lại quyền truy cập
const MOCK_OTP_USER_DATA = {
    username: "admin", // Username này có thể không cần thiết nếu OTP là chung
    role: "admin",
    token: "adminOtpVerifiedToken"
};
// -------------------------------------------------

const OtpPage = ({ onLoginSuccess }) => {
  const [otpInput, setOtpInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  // const navigate = useNavigate(); // Không cần navigate trực tiếp ở đây nữa
  const location = useLocation();

  const usernameFromLogin = location.state?.username || '';

  const handleOtpVerify = async (event) => {
    event.preventDefault();
    setError('');

    if (!otpInput.trim() || !currentPassword.trim()) {
      setError('Vui lòng nhập mã OTP và mật khẩu hiện tại của bạn.');
      return;
    }

    const MOCK_OTP = "123456";
    // Mật khẩu cũ của user mà OTP này dành cho (trong trường hợp này là user "admin" từ mockUsers)
    const MOCK_CURRENT_PASSWORD_FOR_USER = "password123"; 

    console.log('Verifying OTP:', otpInput, 'and current password for username:', usernameFromLogin);

    if (otpInput === MOCK_OTP && currentPassword === MOCK_CURRENT_PASSWORD_FOR_USER) {
      console.log('OTP and current password verification successful (mock)!');
      if (typeof onLoginSuccess === 'function') {
        // Gọi callback với thông tin người dùng giả lập sau khi OTP thành công
        onLoginSuccess(MOCK_OTP_USER_DATA);
      } else {
        console.error("onLoginSuccess prop is not a function or not provided to OtpPage.");
      }
      // Không navigate ở đây, AppRoutes sẽ xử lý
    } else {
      let errorMessage = '';
      if (otpInput !== MOCK_OTP) {
        errorMessage += 'Mã OTP không hợp lệ. ';
      }
      if (currentPassword !== MOCK_CURRENT_PASSWORD_FOR_USER) {
        errorMessage += 'Mật khẩu hiện tại không đúng.';
      }
      setError(errorMessage.trim() || 'Thông tin xác thực không chính xác.');
    }
  };

  return (
    <div className="otp-page-full-container">
      <div className="otp-form-wrapper">
        <h2>Verify Your Action</h2>
        <p className="otp-instruction-page">
          Để hoàn tất, vui lòng nhập lại mật khẩu hiện tại và mã OTP đã được gửi đến email liên kết với tài khoản <strong>{usernameFromLogin || 'của bạn'}</strong>.
          (OTP giả lập: 123456, Mật khẩu hiện tại giả lập cho user 'admin': password123)
        </p>
        <form onSubmit={handleOtpVerify} className="otp-form-fields">
          {error && <p className="otp-error-message">{error}</p>}
          <div className="form-field-group">
            <label htmlFor="otp-code">Mã OTP:</label>
            <input
              type="text"
              id="otp-code"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="Enter OTP"
              maxLength="6"
              autoFocus
              required
            />
          </div>
          <div className="form-field-group">
            <label htmlFor="current-password">Mật khẩu hiện tại:</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="otp-submit-button">Xác nhận</button>
        </form>
      </div>
    </div>
  );
};

export default OtpPage;
// --- END OF FILE OtpPage.jsx ---