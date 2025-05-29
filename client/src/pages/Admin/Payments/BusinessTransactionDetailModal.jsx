import React, { useState } from 'react';
import './BusinessTransactionDetailModal.css'; // Đảm bảo file CSS này tồn tại

function BusinessTransactionDetailModal({ transaction, onClose, formatDate, formatCurrency }) {


  const [showEnlargedImage, setShowEnlargedImage] = useState(false);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState('');

  const handleImageClick = (imageUrl) => {
    setEnlargedImageUrl(imageUrl);
    setShowEnlargedImage(true);
  };

  const handleCloseEnlargedImage = () => {
    setShowEnlargedImage(false);
    setEnlargedImageUrl('');
  };

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
            <div className="detail-item full-width"><strong>Mô tả:</strong> <p style={{ whiteSpace: 'pre-wrap' }}>{transaction.description}</p></div>
            <div className="detail-item"><strong>Số Tiền:</strong> <p style={{ color: transaction.type === 'expense' ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>{formatCurrency(transaction.costs)}</p></div>
            <div className="detail-item"><strong>Phân Loại:</strong> <p>{transaction.category || 'N/A'}</p></div>
            <div className="detail-item"><strong>Mã Tham Chiếu:</strong> <p>{transaction.referenceId || 'N/A'}</p></div>
            {/* <div className="detail-item">
                <strong>Ảnh Hóa Đơn:</strong> 
                {transaction.invoiceImageName ? 
                    // Nếu có URL thực tế, dùng <img src={transaction.imageUrl || transaction.invoiceImagePreviewUrl} />
                    <p><a href="#" onClick={(e) => {e.preventDefault(); alert(`Xem ảnh (tên file): ${transaction.invoiceImageName}`)}} className="link-style">{transaction.invoiceImageName}</a></p> 
                    : <p>Không có</p>}
            </div> */}
            <div className="detail-item image-detail-item">
              <strong>Ảnh Hóa Đơn:</strong>
              {transaction.invoiceImageName ? (
                <div className="transaction-image-container">
                  <img
                    src={transaction.invoiceImageNameUrl} // SỬ DỤNG URL ĐẦY ĐỦ
                    alt={`Hóa đơn cho ${transaction.description || transaction.id}`}
                    className="transaction-invoice-image"
                    onClick={() => handleImageClick(transaction.invoiceImageNameUrl)}
                  />
                  {/* <p className="image-filename-caption">
                    <a href={transaction.invoiceImageName} target="_blank" rel="noopener noreferrer" className="link-style">
                      {transaction.invoiceImageName || 'Xem ảnh'}
                    </a>
                  </p> */}
                </div>
              ) : <p>Không có</p>}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-modal-close">Đóng</button>
        </div>
      </div>
      {/* MODAL ẢNH PHÓNG TO (chỉ render khi showEnlargedImage là true) */}
      {showEnlargedImage && (
        <div className="enlarged-image-overlay" onClick={(e) => {
          e.stopPropagation(); // Ngăn sự kiện lan ra modal-overlay cha
          handleCloseEnlargedImage();
        }}>
          <button className="enlarged-image-close-button" onClick={handleCloseEnlargedImage}>
            ×
          </button>
          <div className="enlarged-image-content" onClick={(e) => e.stopPropagation()}>
            <img src={enlargedImageUrl} alt="Ảnh hóa đơn phóng to" className="enlarged-image" />
          </div>
        </div>
      )}
    </div>
  );
}
export default BusinessTransactionDetailModal;