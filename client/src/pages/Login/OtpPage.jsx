// src/pages/Auth/OtpPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OtpPage.css'; // Đảm bảo file CSS này tồn tại

const OtpPage = ({ onLoginSuccess }) => { // onLoginSuccess có thể cần đổi tên nếu OTP dùng cho mục đích khác
  const [otpInput, setOtpInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // <<--- THÊM STATE CHO MẬT KHẨU CŨ
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const usernameFromLogin = location.state?.username || '';

  const handleOtpVerify = async (event) => {
    event.preventDefault();
    setError('');

    if (!otpInput.trim() || !currentPassword.trim()) { // <<--- KIỂM TRA CẢ MẬT KHẨU CŨ
      setError('Vui lòng nhập mã OTP và mật khẩu hiện tại của bạn.');
      return;
    }

    // --- THAY THẾ BẰNG LOGIC GỌI API BACKEND ĐỂ XÁC MINH OTP VÀ MẬT KHẨU CŨ ---
    const MOCK_OTP = "123456"; 
    const MOCK_CURRENT_PASSWORD_FOR_USER = "password123"; // Mật khẩu cũ giả lập cho user này

    console.log('Verifying OTP:', otpInput, 'and current password for username:', usernameFromLogin);

    // Trong thực tế, backend sẽ kiểm tra cả OTP và mật khẩu cũ của user (usernameFromLogin)
    if (otpInput === MOCK_OTP && currentPassword === MOCK_CURRENT_PASSWORD_FOR_USER) {
      console.log('OTP and current password verification successful (mock)!');
      
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(); // Gọi callback để cập nhật trạng thái đăng nhập/xác thực
      } else {
        console.error("onLoginSuccess prop is not a function or not provided to OtpPage.");
      }
      // Chuyển hướng đến trang tiếp theo (ví dụ: trang chính, hoặc trang đổi mật khẩu mới nếu đây là luồng reset)
      navigate('/movies'); 
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
    // -----------------------------------------------------------
  };

  return (
    <div className="otp-page-full-container">
      <div className="otp-form-wrapper">
        <h2>Verify Your Action</h2> {/* Tiêu đề có thể chung chung hơn */}
        <p className="otp-instruction-page">
          Để hoàn tất, vui lòng nhập lại mật khẩu hiện tại và mã OTP đã được gửi đến email liên kết với tài khoản <strong>{usernameFromLogin || 'của bạn'}</strong>.
          (OTP giả lập: 123456)
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
          
          {/* ---- THÊM TRƯỜNG NHẬP MẬT KHẨU CŨ ---- */}
          <div className="form-field-group">
            <label htmlFor="current-password">Mật khẩu hiện tại:</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              autoComplete="current-password" // Giúp trình duyệt gợi ý
              required
            />
          </div>
          {/* ------------------------------------ */}

          
          <button type="submit" className="otp-submit-button">Xác nhận</button>
        </form>
      </div>
    </div>
  );
};

export default OtpPage;