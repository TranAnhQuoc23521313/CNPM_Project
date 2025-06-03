// src/pages/Admin/Equipments/RepairHistoryDetailModal.jsx
import React from 'react';
import './EquipmentDetailModal.css'; // Reuse existing modal styling
import Button from '../../../components/common/Button';

const RepairHistoryDetailModal = ({ repairItem, onClose, formatDate, formatCurrency }) => {
  if (!repairItem) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content equipment-detail-modal-content"> {/* Reuse class for structure */}
        <div className="modal-header">
          <h2>Chi Tiết Sửa Chữa - Thiết Bị: {repairItem.TENTHIETBI}</h2>
          <Button onClick={onClose} className="btn-close-modal">×</Button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            {/* <div className="detail-item">
              <strong>Mã Sửa Chữa:</strong>
              <p>{repairItem.ID_SUACHUA || 'N/A'}</p>
            </div> */}
            <div className="detail-item">
              <strong>Mã Thiết Bị:</strong>
              <p>{repairItem.MATHIETBI || 'N/A'}</p>
            </div>
             <div className="detail-item">
              <strong>Tên Thiết Bị:</strong>
              <p>{repairItem.TENTHIETBI || 'N/A'}</p>
            </div>
            {/* <div className="detail-item">
              <strong>Mã Sự Cố Liên Quan:</strong>
              <p>{repairItem.MASUCO || 'N/A'}</p>
            </div> */}
            <div className="detail-item">
              <strong>Ngày Báo Cáo Sự Cố:</strong>
              <p>{formatDate(repairItem.NGAY_BAOCAO_SUCO)}</p>
            </div>
            <div className="detail-item">
              <strong>Ngày Hoàn Thành Sửa Chữa:</strong>
              <p>{formatDate(repairItem.NGAYSUACHUA)}</p>
            </div>
            <div className="detail-item">
              <strong>Chi Phí Sửa Chữa:</strong>
              <p>{formatCurrency(repairItem.CHIPHI)}</p>
            </div>
            <div className="detail-item">
              <strong>Nhân Viên Sửa Chữa:</strong>
              <p>{repairItem.TEN_NV_SUA || 'N/A'}</p>
            </div>
             <div className="detail-item">
              <strong>Tình Trạng Sau Sửa Chữa:</strong>
               <p>
                <span className={`status-badge status-repair-${String(repairItem.TINHTRANG_SAU_SC || '').toLowerCase().replace(/\s+/g, '-')}`}>
                    {repairItem.TINHTRANG_SAU_SC || 'Không rõ'}
                </span>
              </p>
            </div>
            <div className="detail-item detail-item-full-width">
              <strong>Mô Tả Sự Cố Gốc:</strong>
              <p className="notes-paragraph">{repairItem.MOTA_SUCO || 'Không có mô tả'}</p>
            </div>
            <div className="detail-item detail-item-full-width">
              <strong>Mô Tả Công Việc Sửa Chữa:</strong>
              <p className="notes-paragraph">{repairItem.MOTA_SUACHUA || 'Không có mô tả'}</p>
            </div>
            {repairItem.HINHANH_SUACHUA && (
              <div className="detail-item detail-item-full-width">
                <strong>Hình Ảnh Sửa Chữa:</strong>
                <img src={repairItem.HINHANH_SUACHUA} alt={`Hình ảnh sửa chữa cho ${repairItem.ID_SUACHUA}`} className="detail-image" />
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Button onClick={onClose} className="btn-secondary">Đóng</Button>
        </div>
      </div>
    </div>
  );
};

export default RepairHistoryDetailModal;