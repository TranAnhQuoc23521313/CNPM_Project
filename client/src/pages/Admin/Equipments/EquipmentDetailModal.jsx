import React from 'react';
import './EquipmentDetailModal.css'; // Tạo file CSS này ở bước 3

const EquipmentDetailModal = ({ equipment, onClose, formatCurrency, formatDate }) => {
  if (!equipment) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content equipment-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>×</button>
        <h2>Chi Tiết Thiết Bị</h2>
        
        <div className="detail-section">
          {/* <h3>Thông Tin Chung</h3> */}
          <div className="detail-grid">
            <div className="detail-item"><strong>Mã Thiết Bị:</strong> {equipment.MATHIETBI || 'Chưa có'}</div>
            <div className="detail-item detail-item-full"><strong>Tên Thiết Bị:</strong> {equipment.TENTHIETBI || 'Chưa có'}</div>
            <div className="detail-item"><strong>Loại Thiết Bị:</strong> {equipment.LOAITHIETBI || 'Chưa có'}</div>
            <div className="detail-item"><strong>Vị Trí:</strong> {equipment.VITRITHIETBI || 'Chưa có'}</div>
            <div className="detail-item">
              <strong>Trạng Thái:</strong> 
              {equipment.TRANGTHAI ? (
                <span className={`status-badge-detail status-equipment-${String(equipment.TRANGTHAI).toLowerCase().replace(/\s+/g, '-')}`}>
                  {equipment.TRANGTHAI}
                </span>
              ) : 'Chưa có'}
            </div>
            <div className="detail-item"><strong>Giá Mua:</strong> {equipment.GIA ? formatCurrency(equipment.GIA) : 'Chưa có'}</div>
            <div className="detail-item"><strong>Ngày Mua:</strong> {equipment.NGAYMUA ? formatDate(equipment.NGAYMUA) : 'Chưa có'}</div>
            <div className="detail-item"><strong>Hết Hạn Bảo Hành:</strong> {equipment.NGAYHETBAOHANH ? formatDate(equipment.NGAYHETBAOHANH) : 'Chưa có'}</div>
            <div className="detail-item"><strong>Ngày Bảo Trì Cuối:</strong> {equipment.NGAYBAOTRI ? formatDate(equipment.NGAYBAOTRI) : 'Chưa có'}</div>
            <div className="detail-item detail-item-full"><strong>Ghi Chú:</strong> <pre className="notes-display">{equipment.GHICHU || 'Không có ghi chú'}</pre></div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailModal;