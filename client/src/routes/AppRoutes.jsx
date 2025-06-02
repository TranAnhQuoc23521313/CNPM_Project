// src/routes/AppRoutes.jsx
import React, { useState } from 'react'; // Bỏ useEffect nếu không dùng trực tiếp
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // <<--- IMPORT DIALOG XÁC NHẬN

// --- IMPORT LAYOUT COMPONENTS ---
import AdminLayout from '../components/layout/Admin/Layout';
import StaffLayout from '../components/layout/Staff/Layout';

// --- IMPORT PAGE COMPONENTS ---
// Auth Pages
import LoginPage from '../pages/Login/Login.jsx';
import OtpPage from '../pages/Login/OtpPage.jsx';

// Admin Pages
import AdminMoviesPage from '../pages/Admin/Movies/MoviesPage.jsx';
import AdminShowtimesPage from '../pages/Admin/Showtimes/Showtimes.jsx';
import AdminItemsPage from '../pages/Admin/Items/Items.jsx';
import Customers from '../pages/Admin/Customers/Customers.jsx';
import Employees from '../pages/Admin/Employees/Employees.jsx';
import Statistics from '../pages/Admin/Statistics/Statistics.jsx';
import TransactionHistory from '../pages/Admin/Payments/TransactionHistory.jsx';
import Equipments from '../pages/Admin/Equipments/Equipments.jsx';
// Ví dụ, nếu bạn đã tạo AdminDashboardPage:
// import AdminDashboardPage from '../pages/Admin/Dashboard/AdminDashboardPage';

// Staff Pages
import ManageBookingsPage from '../pages/Staff/Tickets/ManageBookingsPage.jsx';
import SelectMoviePage from '../pages/Staff/Tickets/CreateTicket/SelectMoviePage.jsx';
import SelectShowtimePage from '../pages/Staff/Tickets/CreateTicket/SelectShowtimePage.jsx';
import SelectSeatsPage from '../pages/Staff/Tickets/CreateTicket/SelectSeatsPage.jsx';
import AddConcessionsPage from '../pages/Staff/Tickets/CreateTicket/AddConcessionsPage.jsx'; // Tùy chọn
import CustomerInfoPage from '../pages/Staff/Tickets/CreateTicket/CustomerInfoPage.jsx';   // Tùy chọn
import ConfirmOrderPage from '../pages/Staff/Tickets/CreateTicket/ConfirmOrderPage.jsx';
import StaffFacilitiesManagementPage from '../pages/Staff/Facilities/StaffFacilitiesManagement.jsx'; 

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
    const token = localStorage.getItem('authToken'); // Lấy token đã lưu
    const role = localStorage.getItem('userRole');   // Lấy role đã lưu
    // Bạn có thể lưu thêm username và manv nếu cần
    const username = localStorage.getItem('username');
    const manv = localStorage.getItem('manv');

    if (token && role) {
      // Nếu có token và role, khôi phục currentUser
      return { token, role, username, manv }; // Thêm username, manv vào đây
    }
    return null;
  });

  // State cho modal xác nhận đăng xuất
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    // userData từ API giờ có thể là: { token, user: { username, role, manv } }
    // Hoặc nếu LoginPage đã trích xuất user: { token, username, role, manv }
    console.log("Login successful in AppRoutes, updating currentUser state:", userData);

    // Đảm bảo userData có cấu trúc đúng như mong đợi từ LoginPage
    // LoginPage gửi: { token: responseData.token, role: responseData.user.role, username: responseData.user.username, manv: responseData.user.manv }
    if (userData && userData.token && userData.role) {
      setCurrentUser({
        token: userData.token,
        role: userData.role,
        username: userData.username,
        manv: userData.manv
      });
      // Lưu vào localStorage để duy trì đăng nhập
      localStorage.setItem('authToken', userData.token); // ĐỔI TÊN KEY LƯU TRỮ CHO NHẤT QUÁN
      localStorage.setItem('userRole', userData.role);
      if (userData.username) localStorage.setItem('username', userData.username);
      if (userData.manv) localStorage.setItem('manv', userData.manv);
    } else {
      console.error("AppRoutes - handleLoginSuccess: Invalid userData received", userData);
    }
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
    localStorage.removeItem('username'); // <<< THÊM DÒNG NÀY
    localStorage.removeItem('manv');     // <<< THÊM DÒNG NÀY
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
          <Route path="customers" element={<Customers />} />
          <Route path="staffs" element={<Employees />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="payments" element={<TransactionHistory />} />
          <Route path="facilities" element={<Equipments />} />
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
          <Route path="tickets" element={<ManageBookingsPage />} />
          {/* Thêm các route Staff khác */}
          {/* Các route cho quy trình tạo vé mới, lồng trong "tickets/new/" */}
          <Route path="tickets/new"> {/* Route cha cho quy trình tạo vé mới */}
            <Route index element={<Navigate to="select-movie" replace />} /> {/* Mặc định chuyển đến chọn phim */}
            <Route path="select-movie" element={<SelectMoviePage />} />
            <Route path="select-showtime" element={<SelectShowtimePage />} />
            <Route path="select-seats" element={<SelectSeatsPage />} />
            <Route path="add-concessions" element={<AddConcessionsPage />} />
            <Route path="customer-info" element={<CustomerInfoPage />} />
            <Route path="confirm-order" element={<ConfirmOrderPage />} />
          </Route>
          <Route path="facilities" element={<StaffFacilitiesManagementPage />} />
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
      {<ConfirmationDialog
        isOpen={isLogoutConfirmOpen}
        onClose={cancelLogout}      // Khi nhấn "Ở lại" hoặc click ra ngoài
        onConfirm={confirmLogout}   // Khi nhấn "Đăng xuất" trên modal
        title="Xác nhận Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmButtonText="Đăng xuất" // Text cho nút màu đỏ/xác nhận
        cancelButtonText="Ở lại"    // Text cho nút hủy/phụ
        confirmButtonVariant="danger" // Để nút "Đăng xuất" có style của btn-danger
        cancelButtonVariant="secondary"// Để nút "Ở lại" có style của btn-secondary
      />}
    </>
  );
};

export default AppRoutes;