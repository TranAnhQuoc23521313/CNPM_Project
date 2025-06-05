// src/pages/Staff/Tickets/TicketItem.jsx
import React from 'react';
import myDefaultLogo from '../../../assets/star_icon.jpg'; // Điều chỉnh đường dẫn này!
// (Import các helper formatDateForTicket, formatCurrencyForTicket nếu cần)
// import QRCode from 'qrcode.react';

// (Định nghĩa lại helper nếu chưa import)
const formatDateForTicket = (dateObject) => {
    if (!dateObject || isNaN(new Date(dateObject).getTime())) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateObject);
    return {
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
};
const formatCurrencyForTicket = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};


const TicketItem = ({ ticket }) => {
    if (!ticket) return null;

    const showtime = formatDateForTicket(ticket.thoiGianSuatChieu);
    const giaVeFormatted = formatCurrencyForTicket(ticket.giaVeDaLuu);

    let qrCodeDisplay;
    if (ticket.qrCodeDataUrl) {
        qrCodeDisplay = <img src={ticket.qrCodeDataUrl} alt={`QR Vé ${ticket.maVe}`} className="ticket-qr-img-print" />;
    } else {
        // Ví dụ dùng qrcode.react (cần cài đặt và import)
        // if (ticket.maVe) {
        //   qrCodeDisplay = <QRCode value={String(ticket.maVe)} size={parseInt("50mm".replace('mm',''))*3.77} level="H" renderAs="svg" className="ticket-qr-img-print"/>;
        // } else {
        //   qrCodeDisplay = <div className="qr-placeholder">QR</div>;
        // }
        // Hoặc placeholder đơn giản
        qrCodeDisplay = <div className="stub-qr-code-placeholder">QR CODE</div>; // Đổi tên class cho dễ phân biệt
    }

    return (
        // Chỉ render cấu trúc của một vé
        <div className="modern-ticket">
            <div className="ticket-main-content">
                <div className="ticket-main-header">
                    {/* <img src={ticket.logoRapUrl || "https://via.placeholder.com/80x40.png?text=LOGO"} alt="Logo Rạp" className="cinema-logo" /> */}
                    <img
                        src={myDefaultLogo} // Sử dụng biến đã import
                        alt="Logo Rạp"
                        className="cinema-logo"
                    />
                    <div className="cinema-info">
                        <h2 className="cinema-name">{ticket.tenRap || 'RẠP PHIM'}</h2>
                        <p className="cinema-address">{ticket.diaChiRap || ''}</p>
                    </div>
                </div>

                <div className="movie-details-section">
                    <h3 className="movie-title">{ticket.tenPhim || 'N/A'}</h3>
                    <div className="showtime-info">
                        <div className="info-block">
                            <span className="label">Ngày chiếu</span>
                            <span className="data">{showtime.date}</span>
                        </div>
                        <div className="info-block">
                            <span className="label">Giờ chiếu</span>
                            <span className="data time-data">{showtime.time}</span>
                        </div>
                        <div className="info-block">
                            <span className="label">Phòng</span>
                            <span className="data">{ticket.phongChieu || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="seat-info-block">
                        <div className="seat-item">
                            <span className="label">Ghế</span>
                            <span className="data seat-number">{ticket.dayGhe || ''}{ticket.viTriGhe || ''}</span>
                        </div>
                        <div className="seat-item">
                            <span className="label">Loại</span>
                            <span className="data">{ticket.loaiGhe || 'Thường'}</span>
                        </div>
                        <div className="seat-item price-item">
                            <span className="label">Giá vé</span>
                            <span className="data">{giaVeFormatted}</span>
                        </div>
                    </div>
                </div>
                {ticket.quyDinh && ticket.quyDinh.length > 0 && (
                    <div className="ticket-regulations">
                        <h4>Quy định:</h4>
                        <ul>
                            {ticket.quyDinh.map((rule, index) => (
                                <li key={index}>{rule}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="ticket-stub">
                <div className="stub-qr-code">
                    {qrCodeDisplay}
                </div>
                {/* <p className="ticket-id">Mã vé: <strong>{ticket.maVe || 'N/A'}</strong></p>
                <p className="order-id">Mã HĐ: {ticket.maHoaDon || 'N/A'}</p> */}
                <p className="stub-movie-title">{ticket.tenPhim || 'N/A'}</p>
                <p className="stub-seat-info">{ticket.dayGhe || ''}{ticket.viTriGhe || ''} - {ticket.phongChieu || 'N/A'}</p>
                <p className="stub-showtime">{showtime.date} | {showtime.time}</p>
                <div className="stub-footer-brand">{ticket.tenRap || 'RẠP PHIM'}</div>
            </div>
        </div>
    );
};

export default TicketItem;