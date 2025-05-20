import React from 'react';
import './CustomerInvoiceDetailModal.css'; // CSS riêng

function CustomerInvoiceDetailModal({ invoice, onClose, formatCurrency, formatDate }) {
  if (!invoice) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Chi Tiết Hóa Đơn: {invoice.id}</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item"><strong>Mã Hóa Đơn:</strong> <p>{invoice.id}</p></div>
            <div className="detail-item"><strong>Ngày Tạo:</strong> <p>{formatDate(invoice.date, true)}</p></div>
            <div className="detail-item"><strong>Khách Hàng:</strong> <p>{invoice.customerName} {invoice.customerId ? `(${invoice.customerId})` : '(Vãng lai)'}</p></div>
            <div className="detail-item"><strong>Nhân Viên:</strong> <p>{invoice.employeeName}</p></div>
            <div className="detail-item"><strong>Tổng Tiền:</strong> <p>{formatCurrency(invoice.totalAmount)}</p></div>
            <div className="detail-item"><strong>Phương thức TT:</strong> <p>{invoice.paymentMethod}</p></div>
            <div className="detail-item"><strong>Trạng Thái:</strong> <p><span className={`status-badge status-${invoice.status.toLowerCase().replace(/\s+/g, '-')}`}>{invoice.status}</span></p></div>
            <div className="detail-item full-width"><strong>Chi Tiết Mục:</strong> <p style={{whiteSpace: 'pre-wrap'}}>{invoice.items}</p></div>
            {/* Thêm các thông tin khác nếu có */}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-modal-close">Đóng</button>
        </div>
      </div>
    </div>
  );
}
export default CustomerInvoiceDetailModal;