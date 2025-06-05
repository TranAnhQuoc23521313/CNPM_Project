import React, { useState, useEffect } from 'react'; // Đã xóa 'use' không cần thiết
import './AddEquipmentModal.css';

function AddEquipmentModal({ onClose, onAddEquipment, equipmentTypes = [], equipmentStatuses = [] }) {
  // Các trường thông tin cần lưu trữ
  const [errors, setErrors] = useState({});

  // Khởi tạo state với giá trị mặc định hợp lệ
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  // Khởi tạo type và status với giá trị đầu tiên từ props nếu có, hoặc chuỗi rỗng
  const [type, setType] = useState(equipmentTypes.length > 0 ? equipmentTypes[0] : '');
  const [location, setLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [status, setStatus] = useState(equipmentStatuses.length > 0 ? equipmentStatuses[0] : '');
  const [lastMaintenance, setLastMaintenance] = useState('');
  const [notes, setNotes] = useState('');
  const [costs, setCosts] = useState(''); // Giữ là chuỗi, sẽ parse khi submit

  // XÓA BỎ useEffect này vì nó gây lỗi reset state thành undefined
  /*
  useEffect(() => {
    setId();
    setName();
    setType(equipmentTypes[0]);
    setLocation();
    setPurchaseDate();
    setWarrantyEndDate();
    setStatus(equipmentStatuses[0]);
    setLastMaintenance();
    setCosts();
    setNotes();
  });
  */

  // useEffect để cập nhật type/status nếu props thay đổi (ví dụ: tải dữ liệu không đồng bộ)
  // Điều này hữu ích nếu danh sách types/statuses được tải sau khi modal mở
  /* useEffect(() => {
    if (equipmentTypes.length > 0 && !type) { // Nếu type chưa có giá trị và có danh sách
        setType(equipmentTypes[0]);
    } else if (equipmentTypes.length === 0) { // Nếu danh sách rỗng, reset type
        setType('');
    }
  }, [equipmentTypes]); // Chỉ chạy khi equipmentTypes thay đổi

  useEffect(() => {
    if (equipmentStatuses.length > 0 && !status) {
        setStatus(equipmentStatuses[0]);
    } else if (equipmentStatuses.length === 0) {
        setStatus('');
    }
  }, [equipmentStatuses]); // Chỉ chạy khi equipmentStatuses thay đổi */


  const validateForm = () => {
    const newErrors = {};
    // Các giá trị name, location sẽ là '' nếu rỗng, không phải undefined
    if (!name.trim()) newErrors.name = "Tên thiết bị không được để trống.";
    if (!type) newErrors.type = "Vui lòng chọn loại thiết bị."; // type có thể là ''
    if (!location.trim()) newErrors.location = "Vị trí không được để trống.";
    if (!purchaseDate) newErrors.purchaseDate = "Ngày mua không được để trống."; // purchaseDate có thể bị xóa
    if (!status) newErrors.status = "Vui lòng chọn trạng thái."; // status có thể là ''

    if (costs && isNaN(parseFloat(costs))) { // Chuyển đổi sang số để kiểm tra
      newErrors.costs = "Chi phí bảo trì phải là số hợp lệ.";
    }
    if (warrantyEndDate && purchaseDate && new Date(warrantyEndDate) < new Date(purchaseDate)) {
      newErrors.warrantyEndDate = "Ngày hết hạn bảo hành phải sau ngày mua.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Xử lý ID: nếu id rỗng và có hàm generateId, thì gọi hàm đó
      //const finalId = id.trim() ? id.trim() : (generateId ? generateId() : undefined);

      const newEquipment = {
        MATHIETBI: id,
        TENTHIETBI: name.trim(),
        LOAITHIETBI: type,
        VITRITHIETBI: location.trim(),
        TRANGTHAI: status,
        NGAYMUA: purchaseDate,
        NGAYHETBAOHANH: warrantyEndDate, // Gửi null nếu rỗng
        NGAYBAOTRI: lastMaintenance || null,   // Gửi null nếu rỗng
        GIA: costs, // Chuyển thành số hoặc null
        GHICHU: notes || null          // Trim và gửi null nếu rỗng
      };
      onAddEquipment(newEquipment);
      onClose(); // Đóng modal sau khi thêm thành công
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
          {/* Mã Thiết Bị */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eq-id">Mã Thiết Bị (tùy chọn):</label>
              <input type="text" id="eq-id" name="id" value={id} onChange={(e) => setId(e.target.value)} placeholder="Để trống tự sinh" />
              {/* {errors.id && <p className="error-message">{errors.id}</p>}  // Hiện tại chưa có validation cho id */}
            </div>
            <div className="form-group">
              <label htmlFor="eq-name">Tên Thiết Bị:</label>
              <input type="text" id="eq-name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
          </div>

          {/* Loại Thiết Bị & Vị Trí */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eq-type">Loại Thiết Bị:</label>
              <select id="eq-type" name="type" value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="">-- Chọn loại --</option>
                {equipmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className="error-message">{errors.type}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="eq-location">Vị Trí Lắp Đặt:</label>
              <input type="text" id="eq-location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
              {errors.location && <p className="error-message">{errors.location}</p>}
            </div>
          </div>

          {/* Ngày Mua & Ngày Hết Hạn Bảo Hành */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eq-purchaseDate">Ngày Mua:</label>
              <input type="date" id="eq-purchaseDate" name="purchaseDate" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
              {errors.purchaseDate && <p className="error-message">{errors.purchaseDate}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="eq-warrantyEndDate">Ngày Hết Hạn Bảo Hành:</label>
              <input type="date" id="eq-warrantyEndDate" name="warrantyEndDate" value={warrantyEndDate} onChange={(e) => setWarrantyEndDate(e.target.value)} />
              {errors.warrantyEndDate && <p className="error-message">{errors.warrantyEndDate}</p>}
            </div>
          </div>

          {/* Trạng Thái & Ngày Bảo Trì Cuối */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eq-status">Trạng Thái Hiện Tại:</label>
              <select id="eq-status" name="status" value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option value="">-- Chọn trạng thái --</option>
                {equipmentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.status && <p className="error-message">{errors.status}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="eq-lastMaintenance">Ngày Bảo Trì Cuối:</label>
              <input type="date" id="eq-lastMaintenance" name="lastMaintenance" value={lastMaintenance} onChange={(e) => setLastMaintenance(e.target.value)} />
            </div>
          </div>

          {/* Chi Phí */}
          <div className="form-group">
            <label htmlFor="eq-costs">Chi Phí</label>
            <input
              type="number" // Đổi thành type="number" để dễ nhập hơn
              step="any"    // Cho phép số thập phân
              id="eq-costs"
              name="costs"
              value={costs}
              onChange={(e) => setCosts(e.target.value)} // value vẫn là string, parse khi submit
              placeholder="Nhập chi phí (ví dụ: 100000)"
            />
            {errors.costs && <p className="error-message">{errors.costs}</p>}
          </div>

          {/* Ghi Chú */}
          <div className="form-group">
            <label htmlFor="eq-notes">Ghi Chú Thêm:</label>
            <textarea id="eq-notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" />
          </div>

          {/* Buttons */}
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