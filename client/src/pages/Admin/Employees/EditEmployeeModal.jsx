import React, { useState, useEffect } from 'react';
import './EditEmployeeModal.css'; // Đảm bảo bạn có file CSS này hoặc dùng chung
import ShowChangePasswordForm from './ShowChangePasswordForm'; // Component con cho form đổi mật khẩu

function EditEmployeeModal({ employeeData, onClose, onUpdateEmployee }) {
  // State cho các trường thông tin cá nhân
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [sex, setSex] = useState('');
  const [address, setAddress] = useState('');
  const [salary, setSalary] = useState('');
  // Tên đăng nhập (username) và ID thường không được sửa đổi ở client
  // Chúng sẽ được gửi lại cùng với dữ liệu cập nhật để backend xác định đúng nhân viên.

  // State cho việc hiển thị form đổi mật khẩu và dữ liệu mật khẩu mới
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });

  const [errors, setErrors] = useState({}); // Lỗi cho thông tin cá nhân
  const [passwordErrors, setPasswordErrors] = useState({}); // Lỗi riêng cho form mật khẩu

  // Điền dữ liệu vào form khi employeeData thay đổi (khi modal được mở với nhân viên mới)
  useEffect(() => {
    if (employeeData) {
      setName(employeeData.name || '');
      setPosition(employeeData.position || '');
      setPhone(employeeData.phone || '');
      setEmail(employeeData.email || '');
      setBirthDate(employeeData.birthDate ? new Date(employeeData.birthDate).toISOString().split('T')[0] : '');
      setStartDate(employeeData.startDate ? new Date(employeeData.startDate).toISOString().split('T')[0] : '');
      setSex(employeeData.sex || '');
      setAddress(employeeData.address || '');
      setSalary(employeeData.salary || '');

      // Reset trạng thái form đổi mật khẩu và các lỗi
      setShowChangePasswordForm(false);
      setPasswordData({ newPassword: '', confirmNewPassword: '' });
      setErrors({});
      setPasswordErrors({});
    }
  }, [employeeData]);

  // Validate thông tin cá nhân
  const validateInfoForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Họ tên không được để trống.";
    if (!position.trim()) newErrors.position = "Chức vụ không được để trống.";
    if (!phone.trim()) newErrors.phone = "Số điện thoại không được để trống.";
    else if (!/^\d{10,11}$/.test(phone)) newErrors.phone = "Số điện thoại không hợp lệ.";
    if (!email.trim()) newErrors.email = "Email không được để trống.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email không hợp lệ.";
    if (!startDate) newErrors.startDate = "Ngày vào làm không được để trống.";
    if (!birthDate) newErrors.birthDate = "Ngày sinh không được để trống.";
    if (!sex.trim()) newErrors.sex = "Giới tính không được để trống.";
    if (!address.trim()) newErrors.address = "Địa chỉ không được để trống.";
    if (salary && (isNaN(Number(salary)) || Number(salary) < 0)) { // Cho phép lương = 0
        newErrors.salary = "Lương phải là một số không âm.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate form mật khẩu (được gọi từ ShowChangePasswordForm hoặc từ handleSubmit)
  const validatePasswordForm = (currentPasswordData) => {
    const newPasswordErrors = {};
    if (!currentPasswordData.newPassword) {
      newPasswordErrors.newPassword = "Mật khẩu mới không được để trống.";
    } else if (currentPasswordData.newPassword.length < 6) {
      newPasswordErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    }
    if (currentPasswordData.newPassword && currentPasswordData.newPassword !== currentPasswordData.confirmNewPassword) {
      newPasswordErrors.confirmNewPassword = "Mật khẩu xác nhận không khớp.";
    }
    setPasswordErrors(newPasswordErrors); // Cập nhật state lỗi của form cha
    return Object.keys(newPasswordErrors).length === 0;
  };

  // Xử lý thay đổi cho các input thông tin cá nhân
  const handleInfoInputChange = (setter) => (e) => {
    setter(e.target.value);
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };


  // Xử lý thay đổi cho các input trong form mật khẩu (được truyền xuống ShowChangePasswordForm)
  const handlePasswordDataChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Xử lý khi hủy đổi mật khẩu
  const handleCancelChangePassword = () => {
    setShowChangePasswordForm(false);
    setPasswordData({ newPassword: '', confirmNewPassword: '' });
    setPasswordErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isInfoValid = validateInfoForm();
    let isPasswordSectionValid = true; // Mặc định là true nếu không đổi mật khẩu

    // Chỉ validate mật khẩu nếu form đổi mật khẩu đang hiện và người dùng có nhập gì đó
    if (showChangePasswordForm && (passwordData.newPassword || passwordData.confirmNewPassword)) {
      isPasswordSectionValid = validatePasswordForm(passwordData);
    }


    if (isInfoValid && isPasswordSectionValid) {
      const dataToUpdate = {
        // Thông tin nhân viên (sẽ được gửi lên server với tên key như backend mong đợi)
        TENNV: name,
        VITRI: position,
        SDT: phone,
        EMAIL: email,
        NGAYSINH: birthDate,
        NGAYLAM: startDate,
        GIOITINH: sex,
        DIACHI: address,
        LUONG: salary ? parseInt(salary, 10) : null,
        // TENDANGNHAP: employeeData.username, // Gửi lại username gốc (nếu backend cần)
                                             // hoặc backend tự lấy theo employeeId
      };

      // Chỉ thêm mật khẩu mới nếu người dùng chọn đổi và mật khẩu mới hợp lệ
      if (showChangePasswordForm && passwordData.newPassword && isPasswordSectionValid) {
        dataToUpdate.MATKHAU_MOI = passwordData.newPassword; // Backend sẽ xử lý trường này
      }
      
      console.log("Submitting updated employee data for ID:", employeeData.id, dataToUpdate);
      onUpdateEmployee(employeeData.id, dataToUpdate); // Truyền ID và dữ liệu cập nhật
    }
  };

  if (!employeeData) return null; // Không render gì nếu không có dữ liệu

  return (
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-content edit-employee-modal" onClick={(e) => e.stopPropagation()}>
        <div className="employee-modal-header">
          <h3>Sửa Thông Tin Nhân Viên (ID: {employeeData.id})</h3>
          <button onClick={onClose} className="employee-modal-close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="employee-form modal-body">
          <h4 className="form-section-title">Thông Tin Cá Nhân</h4>
          {/* --- Các trường thông tin cá nhân --- */}
          {/* Sử dụng handleInfoInputChange cho mỗi trường */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-name">Họ và Tên:</label>
              <input type="text" id="edit-name" name="name" value={name} onChange={handleInfoInputChange(setName)} />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="edit-position">Chức Vụ:</label>
              <input type="text" id="edit-position" name="position" value={position} onChange={handleInfoInputChange(setPosition)} />
              {errors.position && <p className="error-message">{errors.position}</p>}
            </div>
          </div>
           <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-sex">Giới tính:</label>
              <select id="edit-sex" name="sex" value={sex} onChange={handleInfoInputChange(setSex)}>
                <option value="">--Chọn giới tính--</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
              {errors.sex && <p className="error-message">{errors.sex}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="edit-phone">Số Điện Thoại:</label>
              <input type="tel" id="edit-phone" name="phone" value={phone} onChange={handleInfoInputChange(setPhone)} />
              {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>
          </div>
           <div className="form-group">
            <label htmlFor="edit-email">Email:</label>
            <input type="email" id="edit-email" name="email" value={email} onChange={handleInfoInputChange(setEmail)} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-birthDate">Ngày Sinh:</label>
              <input type="date" id="edit-birthDate" name="birthDate" value={birthDate} onChange={handleInfoInputChange(setBirthDate)} />
              {errors.birthDate && <p className="error-message">{errors.birthDate}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="edit-startDate">Ngày Vào Làm:</label>
              <input type="date" id="edit-startDate" name="startDate" value={startDate} onChange={handleInfoInputChange(setStartDate)} />
              {errors.startDate && <p className="error-message">{errors.startDate}</p>}
            </div>
          </div>
           <div className="form-group">
            <label htmlFor="edit-address">Địa chỉ:</label>
            <input type="text" id="edit-address" name="address" value={address} onChange={handleInfoInputChange(setAddress)} />
            {errors.address && <p className="error-message">{errors.address}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-salary">Lương (VNĐ):</label>
            <input type="number" id="edit-salary" name="salary" value={salary} onChange={handleInfoInputChange(setSalary)} placeholder="Ví dụ: 7000000" />
            {errors.salary && <p className="error-message">{errors.salary}</p>}
          </div>


          {/* --- Phần Tài khoản --- */}
          <h4 className="form-section-title">Thông Tin Tài Khoản</h4>
          <div className="form-group">
            <label>Tên Đăng Nhập:</label>
            <p className="form-control-static">{employeeData.username || '(Chưa có tài khoản)'}</p>
          </div>

          {/* Chỉ hiển thị nút "Đổi Mật Khẩu" nếu nhân viên đã có tài khoản (có username) */}
          {employeeData.username && !showChangePasswordForm && (
            <div className="form-group change-password-trigger">
              <button
                type="button"
                onClick={() => setShowChangePasswordForm(true)}
                className="btn btn-link-style" // Style cho nút này giống link
              >
                Đổi Mật Khẩu
              </button>
            </div>
          )}

          {/* Hiển thị form đổi mật khẩu nếu showChangePasswordForm là true */}
          {employeeData.username && showChangePasswordForm && (
            <ShowChangePasswordForm
              passwordData={passwordData}
              onPasswordDataChange={handlePasswordDataChange} // Truyền hàm xử lý thay đổi
              passwordErrors={passwordErrors}
              onCancelChangePassword={handleCancelChangePassword}
              // validatePasswordFormProp={validatePasswordForm} // Truyền hàm validate xuống nếu component con tự gọi
            />
          )}

          <div className="employee-modal-actions modal-footer">
            <button type="button" onClick={onClose} className="btn btn-cancel">Hủy</button>
            <button type="submit" className="btn btn-submit">Lưu Thay Đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEmployeeModal;