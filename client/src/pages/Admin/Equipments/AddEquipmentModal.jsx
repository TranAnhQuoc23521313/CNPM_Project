import React, { useState } from 'react';
import './AddEquipmentModal.css'; // CSS riêng cho modal này

function AddEquipmentModal({ onClose, onAddEquipment, generateId, equipmentTypes = [], equipmentStatuses = [] }) {
  const [formData, setFormData] = useState({
    id: '', // Mã có thể để trống để tự sinh hoặc cho phép nhập
    name: '',
    type: equipmentTypes[0] || '', // Chọn loại đầu tiên làm mặc định
    location: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyEndDate: '',
    status: equipmentStatuses[0] || '', // Chọn trạng thái đầu tiên
    lastMaintenance: '',
    notes: '',
    // Thêm các trường khác nếu cần: nhà cung cấp, giá mua, v.v.
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên thiết bị không được để trống.";
    if (!formData.type) newErrors.type = "Vui lòng chọn loại thiết bị.";
    if (!formData.location.trim()) newErrors.location = "Vị trí không được để trống.";
    if (!formData.purchaseDate) newErrors.purchaseDate = "Ngày mua không được để trống.";
    if (!formData.status) newErrors.status = "Vui lòng chọn trạng thái.";
    // Validation cho warrantyEndDate và lastMaintenance có thể phức tạp hơn (ví dụ: warrantyEndDate > purchaseDate)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddEquipment(formData); // Không cần tự generate ID ở đây nếu parent đã làm
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container equipment-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Thêm Thiết Bị Mới</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eq-id">Mã Thiết Bị (tùy chọn):</label>
              <input type="text" id="eq-id" name="id" value={formData.id} onChange={handleChange} placeholder="Để trống tự sinh"/>
              {errors.id && <p className="error-message">{errors.id}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="eq-name">Tên Thiết Bị:</label>
              <input type="text" id="eq-name" name="name" value={formData.name} onChange={handleChange} required />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eq-type">Loại Thiết Bị:</label>
              <select id="eq-type" name="type" value={formData.type} onChange={handleChange} required>
                <option value="">-- Chọn loại --</option>
                {equipmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              {errors.type && <p className="error-message">{errors.type}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="eq-location">Vị Trí Lắp Đặt:</label>
              <input type="text" id="eq-location" name="location" value={formData.location} onChange={handleChange} required />
              {errors.location && <p className="error-message">{errors.location}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eq-purchaseDate">Ngày Mua:</label>
              <input type="date" id="eq-purchaseDate" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
              {errors.purchaseDate && <p className="error-message">{errors.purchaseDate}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="eq-warrantyEndDate">Ngày Hết Hạn Bảo Hành:</label>
              <input type="date" id="eq-warrantyEndDate" name="warrantyEndDate" value={formData.warrantyEndDate} onChange={handleChange} />
              {errors.warrantyEndDate && <p className="error-message">{errors.warrantyEndDate}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eq-status">Trạng Thái Hiện Tại:</label>
              <select id="eq-status" name="status" value={formData.status} onChange={handleChange} required>
                <option value="">-- Chọn trạng thái --</option>
                {equipmentStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
              {errors.status && <p className="error-message">{errors.status}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="eq-lastMaintenance">Ngày Bảo Trì Cuối:</label>
              <input type="date" id="eq-lastMaintenance" name="lastMaintenance" value={formData.lastMaintenance} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="eq-notes">Ghi Chú Thêm:</label>
            <textarea id="eq-notes" name="notes" value={formData.notes} onChange={handleChange} rows="3" />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-modal-cancel">Hủy</button>
            <button type="submit" className="btn-modal-save">Thêm Thiết Bị</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AddEquipmentModal;