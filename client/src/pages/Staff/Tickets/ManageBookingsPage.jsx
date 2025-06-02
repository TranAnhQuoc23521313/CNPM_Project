// src/pages/Staff/Tickets/ManageBookingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation nếu cần state từ trang khác
import Button from '../../../components/common/Button';
import './ManageBookingsPage.css';
import BookingDetailModal from './BookingDetailModal';
import { getAllOrdersApi, getOrderByIdApi, cancelOrderApi } from '../../../services/orderApiService';

const STAFF_BASE_PATH = "/staff";

const mapApiOrderToBookingForList = (order) => {
  // ... (giữ nguyên hàm map của bạn)
  const movieTitle = order.Phim?.TENPHIM || 'N/A';
  const roomName = order.SuatChieu?.PhongChieu?.TENPHONG || 'N/A';
  const showtimeDateTime = order.SuatChieu?.THOIGIAN;

  const formattedShowtime = showtimeDateTime
    ? `${new Date(showtimeDateTime).toLocaleDateString('vi-VN')} ${new Date(showtimeDateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    : 'N/A';

  return {
    id: order.MAHOADON,
    movieTitle: movieTitle,
    room: roomName,
    showtime: formattedShowtime,
    customerName: order.KhachHang?.HOTEN || 'Khách vãng lai',
    customerPhone: order.KhachHang?.SODT || '',
    totalAmount: order.TONGTIEN,
    paymentStatus: order.TRANGTHAITHANHTOAN,
    statusColor: order.TRANGTHAITHANHTOAN === 'Đã thanh toán' ? 'green' : (order.TRANGTHAITHANHTOAN === 'Đã hủy' ? 'red' : 'orange'),
  };
};

const ManageBookingsPage = () => {
  const pageTitle = 'Tra Cứu & Quản Lý Vé';
  const navigate = useNavigate();
  const location = useLocation(); // Để nhận state nếu cần refresh sau khi tạo mới

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Set true ban đầu để có loading khi vào trang lần đầu
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  // Sử dụng useCallback để fetchBookings không bị tạo lại mỗi lần render trừ khi searchTerm thay đổi
  const fetchBookings = useCallback(async () => {
    console.log("Fetching bookings with searchTerm:", searchTerm);
    setIsLoading(true); // Bắt đầu tải
    setError(null);
    // KHÔNG reset setBookings([]) ở đây để giữ lại dữ liệu cũ trong khi tải
    try {
      const apiOrders = await getAllOrdersApi({ searchTerm });
      const mappedBookings = apiOrders.map(mapApiOrderToBookingForList);
      setBookings(mappedBookings);
    } catch (err) {
      console.error("Lỗi khi tải danh sách hóa đơn:", err);
      setError(err.message || "Không thể tải danh sách hóa đơn.");
      // Có thể setBookings([]) ở đây nếu muốn xóa hẳn khi lỗi
      // setBookings([]);
    } finally {
      setIsLoading(false); // Kết thúc tải
    }
  }, [searchTerm]); // Phụ thuộc vào searchTerm

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]); // Gọi fetchBookings khi component mount hoặc fetchBookings (searchTerm) thay đổi

  // Xử lý refresh nếu có state từ trang tạo hóa đơn
  useEffect(() => {
    if (location.state?.refreshBookings) {
      console.log("Refresh bookings triggered from location state");
      fetchBookings(); // Gọi fetchBookings
      // Xóa state để không refresh lại khi không cần thiết (ví dụ khi người dùng tự refresh trang)
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, fetchBookings, navigate, location.pathname]);


  const handleSearch = () => {
    // useEffect đã phụ thuộc vào searchTerm, nên việc thay đổi searchTerm sẽ tự trigger fetchBookings
    // Tuy nhiên, nếu bạn muốn nút search có hành động rõ ràng, bạn vẫn có thể gọi fetchBookings()
    // Hoặc đơn giản là để useEffect xử lý
    // fetchBookings(); // Nếu muốn nút search chủ động gọi
  };

  const handleAddNewBooking = () => {
    // Khi điều hướng đến trang tạo, không cần làm gì đặc biệt ở đây
    // Sau khi tạo xong, trang tạo sẽ điều hướng lại đây với state refresh
    navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`);
  };

  const handleViewBookingDetails = async (bookingSummary) => {
    // ... (giữ nguyên logic của bạn, đã khá tốt)
    setIsFetchingDetail(true);
    setSelectedBookingForDetail(null);
    setIsDetailModalOpen(true);
    try {
      const detailedOrder = await getOrderByIdApi(bookingSummary.id);
      const bookingDetailsForModal = {
        id: detailedOrder.MAHOADON,
        movieTitle: detailedOrder.Ve?.[0]?.TENPHIM || 'N/A',
        roomName: detailedOrder.Ve?.[0]?.TENPHONG || 'N/A',
        showtimeDate: detailedOrder.Ve?.[0]?.THOIGIANSUATCHIEU ? new Date(detailedOrder.Ve[0].THOIGIANSUATCHIEU).toLocaleDateString('vi-VN') : 'Invalid',
        showtimeTime: detailedOrder.Ve?.[0]?.THOIGIANSUATCHIEU ? new Date(detailedOrder.Ve[0].THOIGIANSUATCHIEU).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Invalid Date',
        customerName: detailedOrder.KhachHang?.HOTEN || 'Khách vãng lai',
        customerPhone: detailedOrder.KhachHang?.SODT || 'N/A',
        seatsChosen: detailedOrder.Ve?.map(v => ({
          id: v.MAGHE,
          ticketId: v.MAVE,
          row: v.GheNgoi?.DAYGHE,
          number: v.GheNgoi?.VITRIGHE,
          type: v.GheNgoi?.LOAIGHE,
          price: v.GIABAN,
          basePrice: v.baseShowtimePrice, // v.baseShowtimePrice sẽ là undefined
          surcharge: v.seatSurcharge   // v.seatSurcharge sẽ là undefined
        })) || [],
        totalAmount: detailedOrder.TONGTIEN,
        paymentStatus: detailedOrder.TRANGTHAITHANHTOAN,
        paymentMethod: detailedOrder.HINHTHUCTHANHTOAN,
        creationDate: detailedOrder.NGAYTAOHD ? new Date(detailedOrder.NGAYTAOHD).toLocaleString('vi-VN') : 'N/A',
        staffName: detailedOrder.NhanVien?.TENNV || 'N/A',
        concessions: detailedOrder.ChiTietSanPham?.map(sp => ({
          name: sp.SanPhamKhac?.TENSANPHAM,
          quantity: sp.SOLUONG,
          price: sp.GIABAN_LUCCHON,
          total: sp.THANHTIEN
        })) || [],
        roomId: detailedOrder.Ve?.[0]?.MAPHONG,
        maSuatChieu: detailedOrder.Ve?.[0]?.MASUATCHIEU,
      };
      setSelectedBookingForDetail(bookingDetailsForModal);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết hóa đơn:", err);
      alert("Không thể tải chi tiết hóa đơn: " + (err.message || "Lỗi không xác định"));
      setIsDetailModalOpen(false);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBookingForDetail(null);
  };

  const handleCancelBooking = async (bookingSummary) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy hóa đơn ${bookingSummary.id}? Hành động này không thể hoàn tác.`)) {
      // Không set setIsLoading(true) ở đây, vì fetchBookings sẽ làm điều đó
      // và chúng ta muốn giữ lại UI cũ trong khi chờ hủy và fetch lại
      try {
        await cancelOrderApi(bookingSummary.id);
        alert(`Đã hủy thành công hóa đơn ${bookingSummary.id}.`);
        fetchBookings(); // Tải lại danh sách sau khi hủy
      } catch (error) {
        console.error(`Lỗi khi hủy hóa đơn ${bookingSummary.id}:`, error);
        alert(`Lỗi khi hủy hóa đơn: ${error.message || 'Vui lòng thử lại.'}`);
      }
      // Không cần finally setIsLoading(false) vì fetchBookings sẽ xử lý
    }
  };

  return (
    <div className="page-container tickets-management-page">
      <div className="page-header">
        <h1>{pageTitle}</h1>
        <div className="header-actions-group">
          <input
            type="text"
            placeholder="Tìm Mã HĐ, SĐT Khách, Tên Phim..."
            className="page-header-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          // onKeyPress={(e) => e.key === 'Enter' && handleSearch()} // Enter sẽ tự trigger do useEffect
          />
          {/* Nút search không thực sự cần thiết nếu useEffect đã theo dõi searchTerm */}
          {/* <Button variant="info" size="medium" onClick={handleSearch} style={{ marginRight: '10px' }} disabled={isLoading}>
            Tìm kiếm
          </Button> */}
          <Button variant="primary" size="medium" onClick={handleAddNewBooking}>
            + Tạo Hóa Đơn Mới
          </Button>
        </div>
      </div>

      {/* Hiển thị loading chỉ khi chưa có dữ liệu bookings nào VÀ đang tải */}
      {isLoading && bookings.length === 0 && <p>Đang tải dữ liệu...</p>}
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

      {/* Luôn hiển thị bảng nếu có bookings, ngay cả khi đang loading (sẽ hiển thị bookings cũ) */}
      {/* Hoặc chỉ hiển thị bảng khi không loading VÀ không có lỗi VÀ có bookings */}
      {(!isLoading || bookings.length > 0) && !error && (
        <div className="table-responsive-container">
          <table className="data-table tickets-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Khách hàng</th>
                <th>SĐT Khách</th>
                <th>Tên phim</th>
                <th>Suất chiếu</th>
                <th>Tổng tiền</th>
                <th>Trạng thái TT</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((bookingItem) => (
                  <tr key={bookingItem.id}>
                    <td>{bookingItem.id}</td>
                    <td>{bookingItem.customerName}</td>
                    <td>{bookingItem.customerPhone}</td>
                    <td>{bookingItem.movieTitle}</td>
                    <td>{bookingItem.showtime}</td>
                    <td>{bookingItem.totalAmount?.toLocaleString('vi-VN')} đ</td>
                    <td><span className={`status-badge status-${bookingItem.statusColor}`}>{bookingItem.paymentStatus}</span></td>
                    <td className="actions-cell">
                      <Button variant="info" size="small" onClick={() => handleViewBookingDetails(bookingItem)} disabled={isFetchingDetail}>Chi tiết</Button>
                      {bookingItem.paymentStatus !== 'Đã hủy' && (
                        <Button variant="danger" size="small" onClick={() => handleCancelBooking(bookingItem)} style={{ marginLeft: '5px' }}>Hủy HĐ</Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                // Chỉ hiển thị "Không có dữ liệu" khi không loading và không có lỗi
                !isLoading && <tr><td colSpan="8" className="no-data-message">Không có dữ liệu hóa đơn.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <BookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        bookingDetails={selectedBookingForDetail}
        isLoading={isFetchingDetail}
      />
    </div>
  );
};

export default ManageBookingsPage;