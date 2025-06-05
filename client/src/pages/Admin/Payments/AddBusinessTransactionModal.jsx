import React, { useRef, useState } from 'react';
import './AddBusinessTransactionModal.css'; // Đảm bảo file CSS này tồn tại và được style

function AddBusinessTransactionModal({ onClose, onAddTransaction, employeesList}) {
  /* const [formData, setFormData] = useState({
    transactionCode: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    employeeId: '',
    description: '',
    cost: '',
    category: '',
    referenceId: '',
    invoiceImage: null, // File object
  }); */

  const [transactionCode, setTransactionCode] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeId, setEmployeeId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [invoiceImageFile, setInvoiceImageFile] = useState(null); // File object

  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, invoiceImage: "Kích thước ảnh không được vượt quá 2MB." }));
        setImagePreviewUrl('');
        setInvoiceImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setInvoiceImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, invoiceImage: null }));
    } else {
      setInvoiceImageFile(null);
      setImagePreviewUrl('');
    }
  };

  // Hàm này được gọi khi click vào div custom
  const triggerCustomFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeSelectedImage = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra div cha và mở lại dialog chọn file
    setImagePreviewUrl('');
    setInvoiceImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Quan trọng: reset input file
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!type) newErrors.type = "Vui lòng chọn loại giao dịch.";
    if (!description.trim()) newErrors.description = "Mô tả không được để trống.";
    if (!cost.toString().trim()) newErrors.cost = "Số tiền không được để trống.";
    else if (isNaN(Number(cost)) || Number(cost) <= 0) newErrors.cost = "Số tiền phải là một số dương.";
    if (!date) newErrors.date = "Ngày giao dịch không được để trống.";
    if (!employeeId) newErrors.employeeId = "Vui lòng chọn nhân viên thực hiện.";
    if (type === 'expense' && !category.trim()) newErrors.category = "Phân loại chi phí không được để trống.";
    // Thêm các validation khác nếu cần
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      /* const dataToPassToParent = new FormData();
      dataToPassToParent.append("MAGIAODICH", transactionCode.trim());
      dataToPassToParent.append("LOAIGIAODICH", type);
      dataToPassToParent.append("NGAYGIAODICH", date);
      dataToPassToParent.append("MANV", employeeId);
      dataToPassToParent.append("MOTA", description);
      dataToPassToParent.append("SOTIEN", cost);
      dataToPassToParent.append("PHANLOAI", category);
      dataToPassToParent.append("MATHAMCHIEU", referenceId);
      dataToPassToParent.append("HINHANH", imagePreviewUrl); */
      const dataToPassToParent = {
        MAGIAODICH: transactionCode,
        LOAIGIAODICH: type,
        NGAYGIAODICH: date,
        MANV: employeeId,
        MOTA: description,
        SOTIEN: cost,
        PHANLOAI: category,
        MATHAMCHIEU: referenceId,
        //HINHANH: invoiceImageFile
        imageFile: invoiceImageFile
      }
      onAddTransaction(dataToPassToParent);
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
              <input type="text" id="add-bt-code" name="transactionCode" value={transactionCode} onChange={(e) => setTransactionCode(e.target.value)} placeholder="Để trống nếu tự sinh" />
              {errors.transactionCode && <p className="error-message">{errors.transactionCode}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="add-bt-type">Loại Giao Dịch:</label>
              <select id="add-bt-type" name="type" value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="expense">Chi phí</option>
                <option value="income">Thu nhập khác</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-bt-date">Ngày Giao Dịch:</label>
              <input type="date" id="add-bt-date" name="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              {errors.date && <p className="error-message">{errors.date}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="add-bt-employee">Nhân viên thực hiện:</label>
              <select id="add-bt-employee" name="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
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
            <textarea id="add-bt-description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" required />
            {errors.description && <p className="error-message">{errors.description}</p>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-bt-cost">Số tiền (VND):</label>
              <input type="number" id="add-bt-cost" name="cost" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Ví dụ: 1500000" required />
              {errors.cost && <p className="error-message">{errors.cost}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="add-bt-category">Phân loại:</label>
              <input type="text" id="add-bt-category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={type === 'expense' ? "VD: Chi phí điện nước" : "VD: Thu quảng cáo"} required={type === 'expense'} />
              {errors.category && <p className="error-message">{errors.category}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-bt-referenceId">Mã Tham Chiếu (nếu có):</label>
              <input type="text" id="add-bt-referenceId" name="referenceId" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} />
            </div>
            <div className="form-group custom-file-upload-group"> {/* Thêm class để style riêng nếu cần */}
              <label htmlFor="add-bt-invoiceImage">Hình Ảnh Hóa Đơn (tối đa 2MB):</label>
              <div
                className="custom-file-input-area" // Class tương tự "add-movie-poster-area"
                onClick={triggerCustomFileInput}
                title="Nhấp để chọn hoặc thay đổi ảnh hóa đơn"
                role="button" // Thêm role cho accessibility
                tabIndex={0} // Cho phép focus bằng bàn phím
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerCustomFileInput(); }} // Hỗ trợ kích hoạt bằng bàn phím
              >
                {imagePreviewUrl ? (
                  <>
                    <img src={imagePreviewUrl} alt="Xem trước hóa đơn" className="invoice-preview-img" />
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="btn-remove-image-overlay" // Style nút này để nó hiện trên ảnh
                      title="Xóa ảnh đã chọn"
                    >
                      {/* Có thể dùng Icon ở đây, ví dụ: <TrashIcon className="icon-sm"/> */}
                      Xóa
                    </button>
                  </>
                ) : (
                  <div className="invoice-placeholder">
                    {/* Có thể dùng Icon ở đây, ví dụ: <CameraIcon className="icon-lg"/> */}
                    <span>Chọn Hình Ảnh</span>
                  </div>
                )}
                <input
                  type="file"
                  id="add-bt-invoiceImage" // id vẫn cần cho label (dù label này có thể ẩn nếu thiết kế không cần)
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleImageChange}
                />
              </div>
              {errors.invoiceImage && <p className="error-message">{errors.invoiceImage}</p>}
            </div>
            {/* ================================================ */}
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