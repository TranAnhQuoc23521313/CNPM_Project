import React, { useState } from 'react';
import './AddBusinessTransactionModal.css'; // Đảm bảo file CSS này tồn tại và được style

function AddBusinessTransactionModal({ onClose, onAddTransaction, employeesList = [], generateId }) {
  const [formData, setFormData] = useState({
    transactionCode: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    employeeId: '',
    description: '',
    amount: '',
    category: '',
    referenceId: '',
    invoiceImage: null, // File object
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files && files[0];
      setFormData(prev => ({ ...prev, [name]: file || null }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => { setImagePreviewUrl(reader.result); };
        reader.readAsDataURL(file);
      } else {
        setImagePreviewUrl('');
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = "Mô tả không được để trống.";
    if (!formData.amount.toString().trim()) newErrors.amount = "Số tiền không được để trống.";
    else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) newErrors.amount = "Số tiền phải là một số dương.";
    if (!formData.date) newErrors.date = "Ngày giao dịch không được để trống.";
    if (!formData.employeeId) newErrors.employeeId = "Vui lòng chọn nhân viên thực hiện.";
    if (formData.type === 'expense' && !formData.category.trim()) newErrors.category = "Phân loại chi phí không được để trống.";
    // Thêm các validation khác nếu cần
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToPassToParent = {
        transactionCode: formData.transactionCode,
        type: formData.type,
        date: formData.date,
        employeeId: formData.employeeId,
        description: formData.description,
        amount: Number(formData.amount),
        category: formData.category,
        referenceId: formData.referenceId,
        invoiceImageName: formData.invoiceImage ? formData.invoiceImage.name : null,
        // Nếu bạn cần upload file thực sự, bạn sẽ gửi formData.invoiceImage (File object)
        // và hàm onAddTransaction ở parent sẽ xử lý việc tạo FormData và gọi API.
        // Hiện tại, chúng ta giả định chỉ lưu tên file.
      };
      onAddTransaction(dataToPassToParent);
      // onClose(); // Parent sẽ đóng modal thông qua state của nó
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container transaction-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Thêm Giao Dịch Doanh Nghiệp</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-bt-code">Mã Giao Dịch (tùy chọn):</label>
              <input type="text" id="add-bt-code" name="transactionCode" value={formData.transactionCode} onChange={handleChange} placeholder="Để trống nếu tự sinh"/>
              {errors.transactionCode && <p className="error-message">{errors.transactionCode}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="add-bt-type">Loại Giao Dịch:</label>
              <select id="add-bt-type" name="type" value={formData.type} onChange={handleChange}>
                <option value="expense">Chi phí</option>
                <option value="income">Thu nhập khác</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-bt-date">Ngày Giao Dịch:</label>
              <input type="date" id="add-bt-date" name="date" value={formData.date} onChange={handleChange} required />
              {errors.date && <p className="error-message">{errors.date}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="add-bt-employee">Nhân viên thực hiện:</label>
              <select id="add-bt-employee" name="employeeId" value={formData.employeeId} onChange={handleChange} required>
                <option value="">-- Chọn nhân viên --</option>
                {employeesList.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                ))}
              </select>
              {errors.employeeId && <p className="error-message">{errors.employeeId}</p>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="add-bt-description">Mô tả chi tiết:</label>
            <textarea id="add-bt-description" name="description" value={formData.description} onChange={handleChange} rows="3" required />
            {errors.description && <p className="error-message">{errors.description}</p>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-bt-amount">Số tiền (VND):</label>
              <input type="number" id="add-bt-amount" name="amount" value={formData.amount} onChange={handleChange} placeholder="Ví dụ: 1500000" required />
              {errors.amount && <p className="error-message">{errors.amount}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="add-bt-category">Phân loại:</label>
              <input type="text" id="add-bt-category" name="category" value={formData.category} onChange={handleChange} placeholder={formData.type === 'expense' ? "VD: Chi phí điện nước" : "VD: Thu quảng cáo"} required={formData.type === 'expense'} />
              {errors.category && <p className="error-message">{errors.category}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-bt-referenceId">Mã Tham Chiếu (nếu có):</label>
              <input type="text" id="add-bt-referenceId" name="referenceId" value={formData.referenceId} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="add-bt-invoiceImage">Hình Ảnh Hóa Đơn:</label>
              <input type="file" id="add-bt-invoiceImage" name="invoiceImage" onChange={handleChange} accept="image/*" />
              {imagePreviewUrl && (
                <div className="image-preview-modal">
                  <img src={imagePreviewUrl} alt="Xem trước" />
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-modal-cancel">Hủy</button>
            <button type="submit" className="btn-modal-save">Thêm Giao Dịch</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AddBusinessTransactionModal;