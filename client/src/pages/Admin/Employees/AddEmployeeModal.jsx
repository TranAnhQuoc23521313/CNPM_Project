import React, { useEffect, useState } from 'react';
import './AddEmployeeModal.css'; // Hoặc file CSS chung cho modal

/* const INITIAL_FORM_STATE = {
  name: '',
  position: '',
  department: 'Bán vé',
  phone: '',
  email: '',
  startDate: new Date().toISOString().split('T')[0],
  salary: '',
  username: '', // Thêm trường tên đăng nhập
  password: '', // Thêm trường mật khẩu
  confirmPassword: '', // Thêm trường xác nhận mật khẩu
}; */

function AddEmployeeModal({ isOpen, onClose, employees, onAddEmployee }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setbirthDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [sex, setSex] = useState('');
  const [address, setAddress] = useState('');
  const [salary, setSalary] = useState('');
  const [username, setUserName] = useState('');
  //const [password, setPassWord] = useState('');
  //const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  //const [showPassword, setShowPassword] = useState(false);
  //const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPosition('');
      setPhone('');
      setEmail('');
      setbirthDate('');
      setStartDate('');
      setSex('');
      setAddress('');
      setSalary('');
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim())
      newErrors.name = "Họ tên không được để trống.";

    if (!position.trim())
      newErrors.position = "Chức vụ không được để trống.";

    if (!phone.trim())
      newErrors.phone = "Số điện thoại không được để trống.";
    else if (!/^\d{10,11}$/.test(phone))
      newErrors.phone = "Số điện thoại không hợp lệ.";

    if (!email.trim()) newErrors.email = "Email không được để trống.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Email không hợp lệ.";

    if (!startDate) newErrors.startDate = "Ngày vào làm không được để trống.";

    if (!birthDate) newErrors.birthDate = "Ngày sinh không được để trống.";

    if (!sex.trim())
      newErrors.sex = "Giới tính không được để trống.";

    if (salary && (isNaN(salary) || Number(salary) <= 0)) {
      newErrors.salary = "Lương phải là một số dương.";
    }
    // Validation cho tài khoản và mật khẩu
    if (!username.trim()) newErrors.username = "Tên đăng nhập không được để trống.";
    // Nên có validation cho username (ví dụ: không chứa ký tự đặc biệt, độ dài)
    /* if (!password) newErrors.password = "Mật khẩu không được để trống.";
    else if (password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự."; // Ví dụ validation độ dài
    if (password !== confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp."; */

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* const handleChange = (e) => {
    const { name, value } = e.target;
    //set(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }; */

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Không gửi confirmPassword lên server
      //const { confirmPassword, ...employeeDataToSend } = ;
      const employeeDataToSend = {
        //MANV: '',
        TENNV: name,
        VITRI: position,
        SDT: phone,
        EMAIL: email,
        NGAYSINH: birthDate,
        NGAYLAM: startDate,
        GIOITINH: sex,
        DIACHI: address,
        LUONG: salary,
        TENDANGNHAP: username
      }
      onAddEmployee(employeeDataToSend);
      // set(INITIAL_FORM_STATE); // Parent component sẽ đóng modal nên không cần reset ở đây
    }
  };

  return (
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="employee-modal-header">
          <h3>Thêm Nhân Viên Mới</h3>
          <button onClick={onClose} className="employee-modal-close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="employee-form">
          {/* Các trường thông tin cá nhân */}
          <div className="form-row"> {/* Sử dụng form-row nếu muốn 2 cột */}
            <div className="form-group">
              <label htmlFor="name">Họ và Tên:</label>
              <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="position">Vị trí công việc:</label>
              <select id="position" name="position" value={position} onChange={(e) => setPosition(e.target.value)}>
                <option>--Chọn vị trí làm việc</option>
                <option>Nhân viên</option>
                <option>Quản lý</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sex">Giới tính:</label>
              <select id="sex" name="sex" value={sex} onChange={(e) => setSex(e.target.value)}>
                <option>--Chọn giới tính--</option>
                <option>Nam</option>
                <option>Nữ</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Số Điện Thoại:</label>
              <input type="text" id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>
          </div>


          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="text" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Ngày sinh:</label>
              <input type="date" id="birthDate" name="birthDate" value={birthDate} onChange={(e) => setbirthDate(e.target.value)} />
              {errors.birthDate && <p className="error-message">{errors.birthDate}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Ngày Vào Làm:</label>
              <input type="date" id="startDate" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              {errors.startDate && <p className="error-message">{errors.startDate}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="salary">Lương (VNĐ):</label>
              <input type="number" id="salary" name="salary" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Ví dụ: 7000000" />
              {errors.salary && <p className="error-message">{errors.salary}</p>}
            </div>
          </div>

          <div className="form-group">
              <label htmlFor="address">Địa chỉ:</label>
              <input type="text" id="address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              {errors.address && <p className="error-message">{errors.email}</p>}
            </div>

          {/* Trường Tài khoản và Mật khẩu */}
          <h4 className="form-section-title">Thông Tin Tài Khoản</h4>
          <div className="form-group">
            <label htmlFor="username">Tên Đăng Nhập:</label>
            <input type="text" id="username" name="username" value={username} onChange={(e) => setUserName(e.target.value)} autoComplete="off" />
            {errors.username && <p className="error-message">{errors.username}</p>}
          </div>

          {/* <div className="form-row">
            <div className="form-group password-group">
              <label htmlFor="password">Mật Khẩu:</label>
              <div className="password-input-wrapper">
                <input type={showPassword ? "text" : "password"} id="password" name="password" value={password} onChange={(e) => setPassWord(e.target.value)} autoComplete="new-password" />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            <div className="form-group password-group">
              <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu:</label>
              <div className="password-input-wrapper">
                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
            </div>
          </div> */}

          <div className="employee-modal-actions">
            <button type="submit" className="btn btn-submit">Thêm Nhân Viên</button>
            <button type="button" onClick={onClose} className="btn btn-cancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployeeModal;