import React from 'react';
import './EmployeeDetailModal.css'; // Hoặc file CSS chung cho modal

function EmployeeDetailModal({ employee, onClose }) {
  if (!employee) return null;

  return (
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-content employee-detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="employee-modal-header">
          <h3>Chi Tiết Nhân Viên</h3>
          <button onClick={onClose} className="employee-modal-close-btn">×</button>
        </div>
        <div className="details-body">
          <div className="detail-item"><strong>ID Nhân Viên:</strong> {employee.id}</div>
          <div className="detail-item"><strong>Họ và Tên:</strong> {employee.name}</div>
          <div className="detail-item"><strong>Chức Vụ:</strong> {employee.position}</div>
          <div className="detail-item"><strong>Bộ Phận:</strong> {employee.department}</div>
          <div className="detail-item"><strong>Số Điện Thoại:</strong> {employee.phone}</div>
          <div className="detail-item"><strong>Email:</strong> {employee.email}</div>
          <div className="detail-item">
            <strong>Ngày Vào Làm:</strong> 
            {employee.startDate ? new Date(employee.startDate).toLocaleDateString('vi-VN') : 'N/A'}
          </div>
          <div className="detail-item">
            <strong>Lương:</strong> 
            {employee.salary ? Number(employee.salary).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A'}
          </div>
          {/* Thêm các chi tiết khác nếu có */}
        </div>
        <div className="employee-modal-actions">
          <button onClick={onClose} className="btn btn-cancel">Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetailModal;