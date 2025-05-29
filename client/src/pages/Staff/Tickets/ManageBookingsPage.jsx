import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import './ManageBookingsPage.css'; // Đảm bảo tên file CSS đúng
import BookingDetailModal from './BookingDetailModal'; // <<--- IMPORT BOOKING DETAIL MODAL

const STAFF_BASE_PATH = "/staff";

const ManageTicketsPage = () => {
  const pageTitle = 'Tra Cứu & Quản Lý Vé';
  const navigate = useNavigate();

  // Dữ liệu vé giả lập (Thêm trường `customerPhone`, `description`, `movieTitle` cho khớp với modal)
  // Và đổi `seats` từ string thành array object
  const [tickets, setTickets] = useState([
    {
      id: 'VE001',
      movieTitle: 'Godzilla x Kong: Đế Chế Mới', // Thêm movieTitle
      movieName: 'Godzilla x Kong: Đế Chế Mới', // Giữ lại movieName nếu cần cho bảng
      room: 'Phòng 1',
      showtime: '20/05/2024 18:00',
      customerName: 'Nguyễn Văn A',
      customerPhone: '090xxxxxxx', // Thêm customerPhone
      description: 'Hóa đơn cho 2 vé Godzilla ...', // Thêm description
      totalAmount: 140000, // Sử dụng number để dễ tính toán và format
      paymentStatus: 'Đã thanh toán',
      statusColor: 'green',
      seats: [{ row: 'A', number: 1 }, { row: 'A', number: 2 }], // Đổi thành array object
      ticketPrice: 70000,
      quantity: 2,
      services: [ {name: "Bắp rang bơ", quantity: 1, price: 50000}] // Ví dụ dịch vụ
    },
    {
      id: 'VE002',
      movieTitle: 'Kung Fu Panda 4',
      movieName: 'Kung Fu Panda 4',
      room: 'Phòng 2',
      showtime: '20/05/2024 20:30',
      customerName: 'Trần Thị B',
      customerPhone: '091xxxxxxx',
      description: 'Hóa đơn cho 1 vé KFP4',
      totalAmount: 70000,
      paymentStatus: 'Chưa thanh toán',
      statusColor: 'orange',
      seats: [{ row: 'C', number: 5 }],
      ticketPrice: 70000,
      quantity: 1,
      services: []
    },
    {
      id: 'VE003',
      movieTitle: 'Godzilla x Kong: Đế Chế Mới',
      movieName: 'Godzilla x Kong: Đế Chế Mới', // Sửa tên cho nhất quán
      room: 'Phòng 1',
      showtime: '21/05/2024 19:00',
      customerName: 'Lê Văn C',
      customerPhone: '092xxxxxxx',
      description: 'Hóa đơn cho 3 vé Godzilla đã hủy',
      totalAmount: 210000,
      paymentStatus: 'Đã hủy',
      statusColor: 'red',
      seats: [{ row: 'D', number: 7 }, { row: 'D', number: 8 }, { row: 'D', number: 9 }],
      ticketPrice: 70000,
      quantity: 3,
      services: [{name: "Nước ngọt", quantity: 2, price: 20000}]
    },
  ]);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);

  const handleAddNewTicket = () => {
    console.log('Navigate to sell ticket page...');
    navigate(`${STAFF_BASE_PATH}/tickets/new`);
  };

  const handleViewTicketDetails = (ticket) => {
    console.log('Viewing details for ticket:', ticket);
    // Đảm bảo ticket object có đủ các trường mà BookingDetailModal cần
    // (id, customerName, customerPhone, description, movieTitle, screen, showtime, seats, totalAmount, paymentStatus, services)
    setSelectedTicketForDetail(ticket);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTicketForDetail(null);
  };

  const handleCancelTicket = (ticket) => {
    console.log('Request to cancel ticket:', ticket);
    alert(`Yêu cầu hủy vé: ${ticket.id}`);
  };

  return (
    <div className="page-container tickets-management-page">
      <div className="page-header">
        <h1>{pageTitle}</h1>
        <div className="header-actions-group">
          <input
            type="text"
            placeholder="Tìm Mã vé, Tên phim, Khách hàng..."
            className="page-header-search-input"
          />
          <Button variant="primary" size="medium" onClick={handleAddNewTicket}>
            + Tạo Vé Mới
          </Button>
        </div>
      </div>

      <div className="table-responsive-container">
        <table className="data-table tickets-table">
          <thead>
            <tr>
              <th>Mã vé</th>
              <th>Tên phim</th>
              <th>Phòng chiếu</th>
              <th>Suất chiếu</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.movieName}</td> {/* Hiển thị movieName trong bảng */}
                  <td>{ticket.room}</td>
                  <td>{ticket.showtime}</td>
                  <td>{ticket.customerName}</td>
                  <td>{ticket.totalAmount?.toLocaleString('vi-VN')} đ</td> {/* Format tiền */}
                  <td>
                    <span className={`status-badge status-${ticket.statusColor}`}>
                      {ticket.paymentStatus}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Button variant="info" size="small" onClick={() => handleViewTicketDetails(ticket)}>
                      Chi tiết
                    </Button>
                    {ticket.paymentStatus !== 'Đã hủy' && (
                       <Button variant="danger" size="small" onClick={() => handleCancelTicket(ticket)} style={{ marginLeft: '5px' }}>
                         Hủy vé
                       </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data-message">Không có dữ liệu vé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SỬ DỤNG BookingDetailModal */}
      <BookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        bookingDetails={selectedTicketForDetail} // Truyền toàn bộ object vé đã chọn
      />

      {/* Các Modals khác (xác nhận hủy, v.v.) */}
    </div>
  );
};

export default ManageTicketsPage;