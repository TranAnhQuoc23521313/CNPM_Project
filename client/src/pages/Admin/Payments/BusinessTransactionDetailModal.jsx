import React from 'react';
import './BusinessTransactionDetailModal.css'; // Đảm bảo file CSS này tồn tại

function BusinessTransactionDetailModal({ transaction, onClose, formatDate, formatCurrency }) {
  if (!transaction) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container detail-modal transaction-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Chi Tiết Giao Dịch Doanh Nghiệp</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item"><strong>Mã Giao Dịch:</strong> <p>{transaction.id}</p></div>
            <div className="detail-item"><strong>Ngày Giao Dịch:</strong> <p>{formatDate(transaction.date)}</p></div>
            <div className="detail-item"><strong>Loại Giao Dịch:</strong> <p>{transaction.type === 'expense' ? 'Chi phí' : 'Thu nhập khác'}</p></div>
            <div className="detail-item"><strong>Nhân viên:</strong> <p>{transaction.employeeName || transaction.employeeId || 'N/A'}</p></div>
            <div className="detail-item full-width"><strong>Mô tả:</strong> <p style={{whiteSpace: 'pre-wrap'}}>{transaction.description}</p></div>
            <div className="detail-item"><strong>Số Tiền:</strong> <p style={{color: transaction.type === 'expense' ? '#dc3545' : '#28a745', fontWeight: 'bold'}}>{formatCurrency(transaction.amount)}</p></div>
            <div className="detail-item"><strong>Phân Loại:</strong> <p>{transaction.category || 'N/A'}</p></div>
            <div className="detail-item"><strong>Mã Tham Chiếu:</strong> <p>{transaction.referenceId || 'N/A'}</p></div>
            <div className="detail-item">
                <strong>Ảnh Hóa Đơn:</strong> 
                {transaction.invoiceImageName ? 
                    // Nếu có URL thực tế, dùng <img src={transaction.imageUrl || transaction.invoiceImagePreviewUrl} />
                    <p><a href="#" onClick={(e) => {e.preventDefault(); alert(`Xem ảnh (tên file): ${transaction.invoiceImageName}`)}} className="link-style">{transaction.invoiceImageName}</a></p> 
                    : <p>Không có</p>}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-modal-close">Đóng</button>
        </div>
      </div>
    </div>
  );
}
export default BusinessTransactionDetailModal;