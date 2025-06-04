// src/pages/Admin/Equipments/IncidentDetailModal.jsx
import React from 'react';
import './EquipmentDetailModal.css'; // Reuse existing modal styling
import Button from '../../../components/common/Button';

const IncidentDetailModal = ({ incident, onClose, formatDate, formatCurrency }) => {
  if (!incident) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content equipment-detail-modal-content"> {/* Reuse class for structure */}
        <div className="modal-header">
          <h2>Chi Tiết Sự Cố - {incident.MASUCO}</h2>
          <Button onClick={onClose} className="btn-close-modal">×</Button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            {/* <div className="detail-item">
              <strong>Mã Sự Cố:</strong>
              <p>{incident.MASUCO || 'N/A'}</p>
            </div> */}
            <div className="detail-item">
              <strong>Mã Thiết Bị:</strong>
              <p>{incident.MATHIETBI || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <strong>Tên Thiết Bị:</strong>
              <p>{incident.TENTHIETBI || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <strong>Loại Thiết Bị:</strong>
              <p>{incident.LOAITHIETBI || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <strong>Vị Trí Thiết Bị:</strong>
              <p>{incident.VITRITHIETBI || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <strong>Ngày Báo Cáo:</strong>
              <p>{formatDate(incident.NGAY_BAOCAO)}</p>
            </div>
            <div className="detail-item">
              <strong>Người Báo Cáo:</strong>
              <p>{incident.TEN_NV_BAOCAO}</p>
            </div>
            <div className="detail-item">
              <strong>Mức Độ Ưu Tiên:</strong>
              <p>
                <span className={`priority-badge priority-${String(incident.MUCDO_UUTIEN || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                    {incident.MUCDO_UUTIEN || 'Không rõ'}
                </span>
              </p>
            </div>
            <div className="detail-item">
              <strong>Trạng Thái Sự Cố:</strong>
              <p>
                <span className={`status-badge status-incident-${String(incident.TRANGTHAI_SUCO || '').toLowerCase().replace(/\s+/g, '-')}`}>
                    {incident.TRANGTHAI_SUCO || 'Không rõ'}
                </span>
              </p>
            </div>
            <div className="detail-item detail-item-full-width">
              <strong>Mô Tả Sự Cố:</strong>
              <p className="notes-paragraph">{incident.MOTA || 'Không có mô tả'}</p>
            </div>
            {incident.HINHANH_SUCO && (
              <div className="detail-item detail-item-full-width">
                <strong>Hình Ảnh Sự Cố:</strong>
                <img src={incident.HINHANH_SUCO} alt={`Hình ảnh sự cố ${incident.MASUCO}`} className="detail-image" />
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

export default IncidentDetailModal;