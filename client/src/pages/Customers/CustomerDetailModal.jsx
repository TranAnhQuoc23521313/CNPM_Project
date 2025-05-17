import React from 'react';
// Sử dụng chung CustomerModal.css hoặc tạo file riêng nếu cần thiết
import './CustomerDetailModal.css'; // Hoặc './CustomerDetailModal.css' nếu bạn tách riêng

function CustomerDetailModal({ customerData, onClose }) {
  if (!customerData) return null;

  // Helper to format date string to dd/MM/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Giả sử dateString là YYYY-MM-DD từ input date
      // Cần đảm bảo dateString được coi là ngày cục bộ, không phải UTC
      const date = new Date(dateString.split('T')[0] + 'T00:00:00Z'); // Thêm 'Z' nếu dateString là UTC, hoặc bỏ nếu là local
      if (isNaN(date.getTime())) return 'N/A'; // Kiểm tra ngày không hợp lệ
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    // Sử dụng các class CSS tương tự như EmployeeDetailModal
    <div className="customer-modal-overlay" onClick={onClose}>
      <div className="customer-modal-content customer-detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="customer-modal-header">
          <h3>Chi Tiết Khách Hàng</h3>
          <button onClick={onClose} className="customer-modal-close-btn">×</button>
        </div>
        <div className="details-body"> {/* Giữ lại class này nếu CSS EmployeeDetailModal dùng nó */}
          <div className="detail-item"><strong>ID Khách Hàng:</strong> {customerData.id}</div>
          <div className="detail-item"><strong>Họ và Tên:</strong> {customerData.name}</div>
          <div className="detail-item"><strong>Email:</strong> {customerData.email}</div>
          <div className="detail-item"><strong>Số Điện Thoại:</strong> {customerData.phone || 'N/A'}</div>
          <div className="detail-item"><strong>Hạng Thành Viên:</strong> {customerData.membershipTier}</div>
          <div className="detail-item">
            <strong>Ngày Tham Gia:</strong> 
            {formatDate(customerData.joinDate)}
          </div>
          {/* Bạn có thể thêm các trường chi tiết khác của khách hàng tại đây nếu có */}
          {/* Ví dụ:
          <div className="detail-item"><strong>Địa chỉ:</strong> {customerData.address || 'N/A'}</div>
          <div className="detail-item"><strong>Số lần mua hàng:</strong> {customerData.purchaseCount || 0}</div>
          */}
        </div>
        <div className="customer-modal-actions">
          <button onClick={onClose} className="btn btn-cancel">Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailModal;