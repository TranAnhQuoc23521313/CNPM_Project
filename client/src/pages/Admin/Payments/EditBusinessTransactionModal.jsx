import React, { useState, useEffect } from 'react';
import './EditBusinessTransactionModal.css'; // Đảm bảo file CSS này tồn tại

function EditBusinessTransactionModal({ transactionToEdit, onUpdateTransaction, employeesList = [], onClose }) {
  const [formData, setFormData] = useState({
    transactionCode: '', type: 'expense', date: '', employeeId: '',
    description: '', amount: '', category: '', referenceId: '',
    invoiceImage: null, // Cho file mới nếu có
    invoiceImageName: '', // Tên ảnh hiện tại hoặc tên file mới
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transactionToEdit) {
      setFormData({
        // Giữ lại tất cả các trường từ transactionToEdit, ghi đè những trường cần thiết
        ...transactionToEdit,
        amount: String(transactionToEdit.amount || ''), // Input number nên nhận string
        date: transactionToEdit.date ? transactionToEdit.date.split('T')[0] : new Date().toISOString().split('T')[0],
        invoiceImage: null, // Reset input file, chỉ hiển thị tên/preview ảnh cũ (nếu có)
        // invoiceImageName đã có sẵn trong transactionToEdit nếu được lưu
      });
      // Nếu có transactionToEdit.imageUrl (URL ảnh đã upload), hiển thị nó
      // if (transactionToEdit.imageUrl) {
      //   setImagePreviewUrl(transactionToEdit.imageUrl);
      // } else 
      if (transactionToEdit.invoiceImageName) {
        // Nếu chỉ có tên file (demo localStorage), không có URL để preview trực tiếp
        // Có thể hiển thị tên file hoặc một placeholder
        console.log("Current image (name only for demo):", transactionToEdit.invoiceImageName);
        setImagePreviewUrl(''); // Hoặc một ảnh placeholder nếu có
      } else {
        setImagePreviewUrl('');
      }
    }
  }, [transactionToEdit]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files && files[0];
      setFormData(prev => ({ 
        ...prev, 
        invoiceImage: file || null, // File object mới hoặc null
        invoiceImageName: file ? file.name : prev.invoiceImageName // Cập nhật tên file mới, hoặc giữ tên cũ nếu bỏ chọn
      }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => { setImagePreviewUrl(reader.result); };
        reader.readAsDataURL(file);
      } else {
        // Nếu bỏ chọn file, có thể hiển thị lại preview ảnh cũ (nếu có URL) hoặc xóa preview
        // if (transactionToEdit && transactionToEdit.imageUrl) setImagePreviewUrl(transactionToEdit.imageUrl);
        // else 
        setImagePreviewUrl('');
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => { /* ... Tương tự AddModal ... */
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = "Mô tả không được để trống.";
    if (!formData.amount.toString().trim()) newErrors.amount = "Số tiền không được để trống.";
    else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) newErrors.amount = "Số tiền phải là một số dương.";
    if (!formData.date) newErrors.date = "Ngày giao dịch không được để trống.";
    if (!formData.employeeId) newErrors.employeeId = "Vui lòng chọn nhân viên thực hiện.";
    if (formData.type === 'expense' && !formData.category.trim()) newErrors.category = "Phân loại chi phí không được để trống.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToUpdate = {
        ...formData, // Bao gồm cả các trường không thay đổi
        id: transactionToEdit.id, // Quan trọng: giữ lại ID gốc
        amount: Number(formData.amount),
        // invoiceImageName đã được cập nhật trong handleChange
        // Nếu formData.invoiceImage là File (file mới), thì parent component sẽ xử lý upload
        // Nếu formData.invoiceImage là null, và invoiceImageName vẫn là tên file cũ,
        // parent component có thể hiểu là không thay đổi ảnh.
      };
      // Nếu bạn cần gửi File object để upload:
      // if (formData.invoiceImage instanceof File) {
      //   dataToUpdate.newInvoiceFile = formData.invoiceImage; // Gửi kèm file mới
      // }
      // Xóa File object khỏi dataToUpdate nếu chỉ lưu tên file trong state của parent
      delete dataToUpdate.invoiceImage; 

      onUpdateTransaction(dataToUpdate);
      // onClose(); // Parent sẽ đóng
    }
  };

  if (!transactionToEdit) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container transaction-form-modal edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Sửa Giao Dịch Doanh Nghiệp</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Mã Giao Dịch:</label>
            <p className="form-control-static">{formData.id}</p>
          </div>
          {/* Các trường form tương tự AddModal, value lấy từ formData */}
          {/* ... (Loại GD, Ngày GD, Nhân viên, Mô tả, Số tiền, Phân loại, Mã tham chiếu, Ảnh HĐ) ... */}
          {/* Ví dụ cho Ngày GD */}
          <div className="form-group">
            <label htmlFor="edit-bt-date">Ngày Giao Dịch:</label>
            <input type="date" id="edit-bt-date" name="date" value={formData.date} onChange={handleChange} required />
            {errors.date && <p className="error-message">{errors.date}</p>}
          </div>
          {/* ... Các input khác ... */}
           <div className="form-group">
              <label htmlFor="edit-bt-invoiceImage">Hình Ảnh HĐ (chọn file mới để thay thế):</label>
              <input type="file" id="edit-bt-invoiceImage" name="invoiceImage" onChange={handleChange} accept="image/*" />
              {imagePreviewUrl ? (
                  <div className="image-preview-modal">
                      <img src={imagePreviewUrl} alt="Xem trước hóa đơn" />
                  </div>
              ) : formData.invoiceImageName && (
                  <p style={{fontSize: '0.85em', color: '#555', marginTop: '5px'}}>Ảnh hiện tại: {formData.invoiceImageName}</p>
              )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-modal-cancel">Hủy</button>
            <button type="submit" className="btn-modal-save">Lưu Thay Đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default EditBusinessTransactionModal;