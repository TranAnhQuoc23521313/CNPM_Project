import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Chỉ cần useNavigate
import './Login.css'; // Đảm bảo file CSS này tồn tại và được import

// Dữ liệu poster (bạn có thể import từ file khác hoặc định nghĩa ở đây)
const moviePosters = [
  'https://image.tmdb.org/t/p/w342/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  'https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  'https://image.tmdb.org/t/p/w342/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  'https://image.tmdb.org/t/p/w342/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
];

const LOGIN_ATTEMPTS_LIMIT = 3; // Số lần cho phép đăng nhập sai

const LoginPage = ({ onLoginSuccess }) => {
  const [usernameInput, setUsernameInput] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);

  // State để đếm số lần đăng nhập sai
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

    const MOCK_USERNAME = "admin"; 
    const MOCK_PASSWORD = "password123"; 
    
    const enteredUsername = usernameInput.trim(); // Trim whitespace
    const enteredPassword = password;

    if (!enteredUsername || !enteredPassword) {
        setError("Vui lòng nhập username và password.");
        return;
    }

    console.log('Attempting login with:', { username: enteredUsername, password: enteredPassword });

    if (enteredUsername === MOCK_USERNAME && enteredPassword === MOCK_PASSWORD) {
      console.log('Mock login successful!');
      setLoginAttempts(0); 
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      } else {
        console.error("onLoginSuccess prop is not a function or not provided to LoginPage.");
      }
      navigate('/movies'); // Chuyển hướng đến trang chính sau khi đăng nhập
    } else {
      const newAttemptCount = loginAttempts + 1;
      setLoginAttempts(newAttemptCount);
      
      if (newAttemptCount >= LOGIN_ATTEMPTS_LIMIT) {
        setError(''); 
        console.log(`Login attempts exceeded for ${enteredUsername}. Simulating OTP request and navigating to OTP page.`);
        
        // --- GIẢ LẬP GỌI API BACKEND ĐỂ YÊU CẦU GỬI EMAIL OTP ---
        // alert(`(Giả lập) Mã OTP đã được gửi đến email của ${enteredUsername}. Bạn sẽ được chuyển đến trang nhập OTP.`);
        // Sau khi backend xác nhận đã gửi OTP (hoặc ngay lập tức trong ví dụ này):
        navigate('/verify-otp', { state: { username: enteredUsername } }); // Truyền username sang trang OTP
        // --------------------------------------------------------------
      } else {
        setError(`Tên đăng nhập hoặc mật khẩu không đúng. Bạn còn ${LOGIN_ATTEMPTS_LIMIT - newAttemptCount} lần thử.`);
      }
    }
  };

  return (
    <div className="login-page-full-container">
      <div className="login-layout-wrapper">
        {/* Cột bên trái - Poster Slider */}
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

        {/* Cột bên phải (form đăng nhập) */}
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
            {/* Các link khác như Sign Up có thể thêm ở đây nếu muốn */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;