// --- START OF FILE Login.jsx ---

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { loginApi } from '../../services/authApiService';

const moviePosters = [
  'https://image.tmdb.org/t/p/w342/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  'https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  'https://image.tmdb.org/t/p/w342/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  'https://image.tmdb.org/t/p/w342/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
];

const LOGIN_ATTEMPTS_LIMIT = 3;

// --- TÀI KHOẢN GIẢ LẬP ---
const mockUsers = [
  { username: "admin", password: "password123", role: "admin", token: "adminMockToken123" },
  { username: "staff", password: "password456", role: "staff", token: "staffMockToken456" },
  { username: "anotheradmin", password: "adminpass", role: "admin", token: "anotherAdminToken789" }
];
// -------------------------

const LoginPage = ({ onLoginSuccess }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    if (moviePosters.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentPosterIndex((prevIndex) => (prevIndex + 1) % moviePosters.length);
    }, 3500);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    //setIsLoading(true); // Bắt đầu loading

    const enteredUsername = usernameInput.trim();
    const enteredPassword = password;

    if (!enteredUsername || !enteredPassword) {
      setError("Vui lòng nhập username và password.");
      //setIsLoading(false);
      return;
    }

    console.log('Attempting login with:', { username: enteredUsername, password: enteredPassword });

    try {
      const responseData = await loginApi({ username: enteredUsername, password: enteredPassword });
      // responseData.user chứa { username, role, manv }
      // responseData.token chứa TOKEN_MOCK từ CSDL

      console.log(`Login successful for user: ${responseData.user.username}, role: ${responseData.user.role}`);
      setLoginAttempts(0); // Reset số lần thử sai
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess({ token: responseData.token, role: responseData.user.role, username: responseData.user.username, manv: responseData.user.manv });
      } else {
        console.error("onLoginSuccess prop is not a function or not provided to LoginPage.");
      }
      // Điều hướng sẽ do AppRoutes xử lý dựa trên currentUser state mới
    } catch (apiError) {
      console.error("Login API call failed:", apiError);
      const newAttemptCount = loginAttempts + 1;
      setLoginAttempts(newAttemptCount);

      if (apiError.message && apiError.message.toLowerCase().includes("invalid username or password")) {
        if (newAttemptCount >= LOGIN_ATTEMPTS_LIMIT) {
          setError(''); // Xóa lỗi trước khi chuyển trang
          console.log(`Login attempts exceeded for ${enteredUsername}. Simulating OTP request and navigating to OTP page.`);
          navigate('/xac-minh-otp', { state: { username: enteredUsername } });
        } else {
          setError(`Tên đăng nhập hoặc mật khẩu không đúng. Bạn còn ${LOGIN_ATTEMPTS_LIMIT - newAttemptCount} lần thử.`);
        }
      } else {
        // Lỗi khác từ server hoặc lỗi mạng
        setError(apiError.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      //setIsLoading(false); // Kết thúc loading
    }
  };

  return (
    <div className="login-page-full-container">
      <div className="login-layout-wrapper">
        <div className="login-image-panel poster-slider-panel">
          <div className="poster-slider-container">
            {moviePosters.map((posterUrl, index) => (
              <img
                key={index}
                src={posterUrl}
                alt={`Movie Poster ${index + 1}`}
                className={`slider-poster ${index === currentPosterIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="login-form-panel">
          <div className="login-form-content">
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="login-form-fields">
              {error && <p className="login-error-message">{error}</p>}
              <div className="form-field-group">
                <label htmlFor="login-username">Username</label>
                <input
                  type="text"
                  id="login-username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="form-field-group">
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <button type="submit" className="login-submit-button primary-login-button">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
// --- END OF FILE Login.jsx ---