// src/routes/AppRoutes.jsx
import React, { useState } from 'react'; // Bỏ useEffect nếu không dùng trực tiếp
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // <<--- IMPORT DIALOG XÁC NHẬN

// --- IMPORT LAYOUT COMPONENTS ---
import AdminLayout from '../components/layout/Admin/Layout';
import StaffLayout from '../components/layout/Staff/Layout';

// Import your page components
//import Dashboard from '../pages/Dashboard';
import MoviesPage from '../pages/Admin/Movies/MoviesPage.jsx'; // Using the simplified version for now
import ShowtimesPage from '../pages/Admin/Showtimes/Showtimes.jsx';
import ItemsPage from '../pages/Admin/Items/Items.jsx';
// import Tickets from '../pages/Tickets';
// import Users from '../pages/Users';
// --- IMPORT PAGE COMPONENTS ---
// Auth Pages
import LoginPage from '../pages/Login/Login.jsx';
import OtpPage from '../pages/Login/OtpPage.jsx';

// Admin Pages
import AdminMoviesPage from '../pages/Admin/Movies/MoviesPage.jsx';
import AdminShowtimesPage from '../pages/Admin/Showtimes/Showtimes.jsx';
import AdminItemsPage from '../pages/Admin/Items/Items.jsx';
// Ví dụ, nếu bạn đã tạo AdminDashboardPage:
// import AdminDashboardPage from '../pages/Admin/Dashboard/AdminDashboardPage';

// Staff Pages
// import StaffTicketSalesPage from '../pages/Staff/Tickets/TicketSalesPage.jsx';

// Common Pages
const NotFound = () => (
  <div style={{ padding: '2rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <h2>404 - Page Not Found</h2>
    <p>Sorry, the page you requested could not be found.</p>
  </div>
);

const AccessDenied = () => (
  <div style={{ padding: '2rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <h2>403 - Access Denied</h2>
    <p>You do not have permission to view this page.</p>
  </div>
);

// --- ROUTE CONSTANTS ---
const LOGIN_PATH = "/dang-nhap"; // Đảm bảo khớp với những nơi khác
const OTP_PATH = "/xac-minh-otp";
const ADMIN_BASE_PATH = "/admin";
const STAFF_BASE_PATH = "/staff";

// --- PROTECTED ROUTE WRAPPER ---
const ProtectedWrapper = ({ currentUser, allowedRoles, children }) => {
  if (!currentUser) {
    return <Navigate to={LOGIN_PATH} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'admin') return <Navigate to={ADMIN_BASE_PATH} replace />;
    if (currentUser.role === 'staff') return <Navigate to={STAFF_BASE_PATH} replace />;
    return <Navigate to="/403" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const navigate = useNavigate(); // KHỞI TẠO useNavigate
  const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      return { token, role };
    }
    return null;
  });

  // State cho modal xác nhận đăng xuất
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    console.log("Login successful, updating currentUser state:", userData);
    setCurrentUser(userData);
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userRole', userData.role);
  };

  // Hàm này sẽ được gọi khi người dùng nhấn nút "Đăng xuất" trên Header
  // Nó sẽ mở modal xác nhận.
  const requestLogout = () => {
    console.log("Logout requested, opening confirmation dialog.");
    setIsLogoutConfirmOpen(true);
  };

  // Hàm này sẽ được gọi khi người dùng XÁC NHẬN muốn đăng xuất từ modal
  const confirmLogout = () => {
    console.log("User confirmed logout. Logging out...");
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setIsLogoutConfirmOpen(false); // Đóng modal
    navigate(LOGIN_PATH, { replace: true }); // Điều hướng về trang login
  };

  // Hàm này sẽ được gọi khi người dùng HỦY đăng xuất từ modal
  const cancelLogout = () => {
    console.log("User cancelled logout.");
    setIsLogoutConfirmOpen(false); // Chỉ cần đóng modal
  };

  return (
    <> {/* Bọc trong Fragment để có thể render Routes và Modal cùng cấp */}
      <Routes>
        {/* --- AUTH ROUTES --- */}
        <Route
          path={LOGIN_PATH}
          element={
            currentUser ? (
              currentUser.role === 'admin' ? <Navigate to={ADMIN_BASE_PATH} replace /> :
              currentUser.role === 'staff' ? <Navigate to={STAFF_BASE_PATH} replace /> :
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path={OTP_PATH}
          element={
            currentUser ? (
              currentUser.role === 'admin' ? <Navigate to={ADMIN_BASE_PATH} replace /> :
              currentUser.role === 'staff' ? <Navigate to={STAFF_BASE_PATH} replace /> :
              <Navigate to="/" replace />
            ) : (
              <OtpPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* --- ADMIN PROTECTED ROUTES --- */}
        <Route
          path={`${ADMIN_BASE_PATH}/*`}
          element={
            <ProtectedWrapper currentUser={currentUser} allowedRoles={['admin']}>
              {/* Truyền requestLogout vào prop onLogout của AdminLayout */}
              <AdminLayout headerTitle="Trang Quản Lý" onLogout={requestLogout}>
                <Outlet />
              </AdminLayout>
            </ProtectedWrapper>
          }
        >
          {/* Trang mặc định của Admin */}
          {/* Nếu bạn có AdminDashboardPage: <Route index element={<AdminDashboardPage />} /> */}
          {/* Hoặc điều hướng đến trang movies: */}
          <Route index element={<Navigate to="movies" replace />} />
          {/* <Route path="dashboard" element={<AdminDashboardPage />} /> */}
          <Route path="movies" element={<AdminMoviesPage />} />
          <Route path="showtimes" element={<AdminShowtimesPage />} />
          <Route path="items" element={<AdminItemsPage />} />
          {/* Thêm các route Admin khác */}
        </Route>

        {/* --- STAFF PROTECTED ROUTES --- */}
        <Route
          path={`${STAFF_BASE_PATH}/*`}
          element={
            <ProtectedWrapper currentUser={currentUser} allowedRoles={['staff']}>
              {/* Truyền requestLogout vào prop onLogout của StaffLayout */}
              <StaffLayout headerTitle="Cổng Nhân Viên" onLogout={requestLogout}>
                <Outlet />
              </StaffLayout>
            </ProtectedWrapper>
          }
        >
          <Route index element={<Navigate to="tickets" replace />} />
          {/* Ví dụ: <Route path="tickets" element={<StaffTicketSalesPage />} /> */}
          <Route path="tickets" element={<div>Trang Bán Vé Nhân Viên (Placeholder)</div>} />
          {/* Thêm các route Staff khác */}
        </Route>

        {/* --- DEFAULT ROUTE & FALLBACKS --- */}
        <Route
          path="/"
          element={
            !currentUser ? <Navigate to={LOGIN_PATH} replace /> :
            currentUser.role === 'admin' ? <Navigate to={ADMIN_BASE_PATH} replace /> :
            currentUser.role === 'staff' ? <Navigate to={STAFF_BASE_PATH} replace /> :
            <Navigate to={LOGIN_PATH} replace />
          }
        />
        <Route path="/403" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* MODAL XÁC NHẬN ĐĂNG XUẤT */}
      { <ConfirmationDialog
        isOpen={isLogoutConfirmOpen}
        onClose={cancelLogout}      // Khi nhấn "Ở lại" hoặc click ra ngoài
        onConfirm={confirmLogout}   // Khi nhấn "Đăng xuất" trên modal
        title="Xác nhận Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmButtonText="Đăng xuất" // Text cho nút màu đỏ/xác nhận
        cancelButtonText="Ở lại"    // Text cho nút hủy/phụ
        confirmButtonVariant="danger" // Để nút "Đăng xuất" có style của btn-danger
        cancelButtonVariant="secondary"// Để nút "Ở lại" có style của btn-secondary
      /> }
    </>
  );
};

export default AppRoutes;