import React, { useState, useEffect } from 'react'; // Thêm useEffect nếu cần logic phức tạp cho isLoggedIn
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import Layout component
import Layout from '../components/layout/Layout'; // Đảm bảo đường dẫn này đúng

// Import các trang
import LoginPage from '../pages/Login/Login.jsx';
import OtpPage from '../pages/Login/OtpPage.jsx'; // Import trang OTP
import MoviesPage from '../pages/Movies/MoviesPage.jsx'; 
import ShowtimesPage from '../pages/Showtimes/Showtimes.jsx'; // Giả sử tên file là Showtimes.jsx
import ItemsPage from '../pages/Items/Items.jsx';       // Giả sử tên file là Items.jsx
// import Dashboard from '../pages/Dashboard/Dashboard.jsx'; // Ví dụ

// Component NotFound
const NotFound = () => (
  <div style={{ padding: '2rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <h2>404 - Page Not Found</h2>
    <p>Sorry, the page you requested could not be found.</p>
  </div>
);

// Component ProtectedRoutes
const ProtectedRoutes = ({ isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout headerTitle="Cinema Management">
      <Outlet />
    </Layout>
  );
};

const AppRoutes = () => {
  // Quản lý trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Ví dụ: kiểm tra token khi ứng dụng khởi chạy
    // const token = localStorage.getItem('authToken');
    // return !!token; // true nếu có token, false nếu không
    return false; // Mặc định là chưa đăng nhập
  });

  // Hàm được gọi từ LoginPage hoặc OtpPage khi đăng nhập/xác minh thành công
  const handleLoginSuccess = () => {
    console.log("Login successful, updating isLoggedIn state.");
    setIsLoggedIn(true);
    // Trong thực tế, bạn có thể lưu token vào localStorage ở đây
    // localStorage.setItem('authToken', 'your_actual_token_from_server');
  };

  // (Tùy chọn) Hàm logout
  // const handleLogout = () => {
  //   setIsLoggedIn(false);
  //   localStorage.removeItem('authToken');
  //   // Có thể cần navigate('/login') ở đây nếu đang ở trang được bảo vệ
  // };

  return (
    <Routes>
      {/* Route cho trang Login */}
      <Route 
        path="/login" 
        element={
          isLoggedIn ? (
            <Navigate to="/movies" replace /> 
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} /> 
          )
        } 
      />

      {/* Route cho trang nhập OTP */}
      <Route 
        path="/verify-otp" 
        element={
          isLoggedIn ? ( 
            <Navigate to="/movies" replace /> 
          ) : (
            <OtpPage onLoginSuccess={handleLoginSuccess} /> 
          )
        } 
      />

      {/* Route mặc định (/) */}
      <Route 
        path="/" 
        element={
          isLoggedIn ? <Navigate to="/movies" replace /> : <Navigate to="/login" replace />
        } 
      />
      
      {/* Các Route được bảo vệ (sẽ sử dụng Layout chung) */}
      <Route element={<ProtectedRoutes isLoggedIn={isLoggedIn} />}>
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/showtimes" element={<ShowtimesPage />} />
        <Route path="/items" element={<ItemsPage />} />
        {/* Thêm các trang khác cần Layout ở đây */}
      </Route>

      {/* Route 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;