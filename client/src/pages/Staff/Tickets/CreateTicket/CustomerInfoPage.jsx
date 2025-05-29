// src/pages/Staff/Tickets/CreateTicket/CustomerInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../../components/common/Button'; // Đảm bảo đường dẫn đúng
import './CreateTicketWorkflow.css'; // CSS chung cho workflow
import './CustomerInfoPage.css';   // CSS riêng cho trang này

const STAFF_BASE_PATH = "/staff"; // Hoặc import từ constants

const CustomerInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousState = location.state || {};

  // Khởi tạo state từ previousState nếu có, hoặc giá trị mặc định
  const [customerPhone, setCustomerPhone] = useState(previousState.customerInfo?.phone || '');
  const [customerName, setCustomerName] = useState(previousState.customerInfo?.name || '');
  const [customerEmail, setCustomerEmail] = useState(previousState.customerInfo?.email || '');
  const [customerType, setCustomerType] = useState(previousState.customerInfo?.type || 'guest');
  const [wantsToRegisterAsMember, setWantsToRegisterAsMember] = useState(
    // Chỉ true nếu type là guest VÀ wantsToRegister là true từ state trước
    previousState.customerInfo?.type === 'guest' && previousState.customerInfo?.wantsToRegisterAsMember
    ? true
    : false
  );

  const handleNext = async () => {
    let customerData = null;
    // let isNewRegistration = false; // Bạn có thể dùng biến này nếu cần phân biệt

    if (customerType === 'member') {
      if (!customerPhone.trim()) {
        alert("Vui lòng nhập Số Điện Thoại Thành Viên.");
        return;
      }
      // Logic tìm kiếm/đăng ký thành viên
      console.log("Processing member with phone:", customerPhone.trim(), "Name:", customerName, "Email:", customerEmail);
      // Giả lập:
      if (customerPhone.trim() === "0912345678") { // Giả sử thành viên cũ
        customerData = {
          type: 'member',
          phone: customerPhone.trim(),
          name: "Trần Văn B (TV Cũ)",
          email: "tranvanb.old@example.com",
          memberDetails: { id: "MEM001", points: 1500 },
          wantsToRegisterAsMember: true, // Vì đã là thành viên
        };
        alert(`Chào mừng thành viên cũ: ${customerData.name}`);
      } else { // Giả lập đăng ký thành viên mới
        if (!customerName.trim() && !customerEmail.trim()) {
            // Nếu đang ở chế độ "Thành viên" và SĐT mới, có thể yêu cầu tên/email nếu chính sách bắt buộc
            // alert("Vui lòng nhập Tên và Email để đăng ký thành viên mới.");
            // return;
        }
        customerData = {
          type: 'member',
          phone: customerPhone.trim(),
          name: customerName.trim() || `Thành viên ${customerPhone.trim().slice(-4)}`,
          email: customerEmail.trim(),
          memberDetails: { id: `MEM_NEW_${Date.now().toString().slice(-4)}`, points: 0 },
          wantsToRegisterAsMember: true,
        };
        // isNewRegistration = true;
        alert(`Đăng ký thành viên mới thành công cho SĐT: ${customerData.phone}`);
      }
    } else { // customerType === 'guest'
      if (wantsToRegisterAsMember && customerPhone.trim()) {
        // Khách vãng lai muốn đăng ký TV
        if (!customerName.trim() && !customerEmail.trim()) {
            // Có thể yêu cầu tên/email nếu chính sách bắt buộc khi đăng ký
            // alert("Vui lòng nhập Tên và Email để đăng ký thành viên.");
            // return;
        }
        console.log("Guest wants to register with phone:", customerPhone.trim(), "Name:", customerName, "Email:", customerEmail);
        customerData = {
          type: 'member', // Sẽ trở thành thành viên
          phone: customerPhone.trim(),
          name: customerName.trim() || `Thành viên ${customerPhone.trim().slice(-4)}`,
          email: customerEmail.trim(),
          memberDetails: { id: `MEM_GUEST_REG_${Date.now().toString().slice(-4)}`, points: 0 },
          wantsToRegisterAsMember: true,
        };
        // isNewRegistration = true;
        alert(`Đăng ký thành viên mới thành công cho SĐT: ${customerData.phone} (từ khách vãng lai)`);
      } else {
        // Khách vãng lai không đăng ký, hoặc không nhập SĐT để đăng ký
        // Chỉ lưu thông tin nếu có (SĐT, Tên, Email là tùy chọn cho khách vãng lai không đăng ký)
        if (customerPhone.trim() || customerName.trim() || customerEmail.trim()) {
          customerData = {
            type: 'guest',
            phone: customerPhone.trim(),
            name: customerName.trim(),
            email: customerEmail.trim(),
            wantsToRegisterAsMember: false,
          };
        } else {
          customerData = null; // Không có thông tin gì cả
        }
      }
    }

    navigate(`${STAFF_BASE_PATH}/tickets/new/confirm-order`, {
      state: { ...previousState, customerInfo: customerData }
    });
  };

  const handleSkip = () => {
    const { customerInfo, ...restOfState } = previousState;
    navigate(`${STAFF_BASE_PATH}/tickets/new/confirm-order`, { state: restOfState });
  };

  useEffect(() => {
    // Kiểm tra điều kiện tiên quyết để ở lại trang này
    if (!previousState.movieId || !previousState.showtimeId || !previousState.selectedSeats) {
      console.warn("Missing prerequisite data, navigating back to movie selection.");
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`, { replace: true });
    }
  }, [previousState, navigate]);


  // Xử lý khi customerType thay đổi
  useEffect(() => {
    if (customerType === 'member') {
      setWantsToRegisterAsMember(false); // Nếu là thành viên, không cần checkbox "đăng ký" nữa
      // Không xóa SĐT, Tên, Email vì người dùng có thể nhập để tìm/đăng ký thành viên
    } else if (customerType === 'guest') {
      // Nếu chuyển sang khách vãng lai, và KHÔNG muốn đăng ký, thì xóa Tên, Email
      if (!wantsToRegisterAsMember) {
        setCustomerName('');
        setCustomerEmail('');
      }
    }
  }, [customerType]);

  // Xử lý khi checkbox wantsToRegisterAsMember thay đổi (chỉ khi là guest)
  useEffect(() => {
    if (customerType === 'guest' && !wantsToRegisterAsMember) {
      // Nếu bỏ tick đăng ký khi là khách vãng lai, xóa tên và email
      setCustomerName('');
      setCustomerEmail('');
    }
  }, [wantsToRegisterAsMember, customerType]);


  return (
    <div className="create-ticket-step customer-info-page">
      <div className="customer-info-card">
        <div className="card-header">
          <p className="page-step-title">(Tùy chọn) Bước 5</p>
          <h2 className="page-main-title">Thông Tin Khách Hàng</h2>
        </div>

        <div className="card-body">
          <p className="form-description">
            Chọn loại khách hàng. Với thành viên, vui lòng nhập SĐT để tìm hoặc đăng ký.
          </p>

          <div className="form-field customer-type-selector">
            <label>Loại Khách Hàng:</label>
            <div className="radio-group">
              <label htmlFor="guest" className={customerType === 'guest' ? 'active' : ''}>
                <input type="radio" id="guest" name="customerType" value="guest" checked={customerType === 'guest'} onChange={(e) => setCustomerType(e.target.value)} />
                Khách vãng lai
              </label>
              <label htmlFor="member" className={customerType === 'member' ? 'active' : ''}>
                <input type="radio" id="member" name="customerType" value="member" checked={customerType === 'member'} onChange={(e) => setCustomerType(e.target.value)} />
                Thành viên
              </label>
            </div>
          </div>

          {/* SỐ ĐIỆN THOẠI */}
          <div className="form-field">
            <label htmlFor="customerPhone">
              {customerType === 'member' ? 'Số Điện Thoại Thành Viên*' : 'Số Điện Thoại Khách'}
            </label>
            <input
              type="tel"
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder={customerType === 'member' ? "Nhập SĐT để tìm/đăng ký" : "Nhập SĐT (tùy chọn)"}
              className="styled-input"
            />
            {customerType === 'member' && <small className="field-hint">Nhập SĐT để tìm kiếm hoặc hệ thống sẽ tự đăng ký mới nếu SĐT chưa có.</small>}
            {customerType === 'guest' && <small className="field-hint">Nhập SĐT nếu khách muốn cung cấp hoặc đăng ký thành viên.</small>}
          </div>

          {/* CHECKBOX ĐĂNG KÝ THÀNH VIÊN (CHO KHÁCH VÃNG LAI) */}
          {customerType === 'guest' && (
            <div className="form-field register-member-checkbox">
              <label htmlFor="wantsToRegisterAsMember">
                <input
                  type="checkbox"
                  id="wantsToRegisterAsMember"
                  checked={wantsToRegisterAsMember}
                  onChange={(e) => setWantsToRegisterAsMember(e.target.checked)}
                  disabled={!customerPhone.trim()} // Chỉ cho phép tick khi có SĐT
                />
                Đăng ký thành viên với SĐT này?
              </label>
              {wantsToRegisterAsMember && !customerPhone.trim() && (
                <small className="field-error">Vui lòng nhập SĐT ở trên để đăng ký.</small>
              )}
            </div>
          )}

          {/* TÊN VÀ EMAIL - HIỂN THỊ KHI:
              1. Là "Thành viên" (để nhập thông tin đăng ký mới nếu SĐT chưa có, hoặc hiển thị thông tin TV đã tìm thấy)
              2. Hoặc là "Khách vãng lai" VÀ đã tick "Đăng ký thành viên"
          */}
          {(customerType === 'member' || (customerType === 'guest' && wantsToRegisterAsMember)) && (
            <>
              <div className="form-field">
                <label htmlFor="customerName">
                  Tên Khách Hàng {customerType === 'member' || wantsToRegisterAsMember ? '' : '(tùy chọn)'}
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="styled-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="customerEmail">
                  Email {customerType === 'member' || wantsToRegisterAsMember ? '' : '(tùy chọn)'}
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Ví dụ: nguyenvana@example.com"
                  className="styled-input"
                />
              </div>
            </>
          )}

          {/* Nơi hiển thị thông tin thành viên đã tìm thấy (nếu có) */}
          {customerType === 'member' && customerPhone.trim() === "0912345678" && ( // Ví dụ đã tìm thấy TV
            <div className="found-member-info" style={{marginTop: '15px', padding: '10px', border: '1px solid lightgreen', borderRadius: '4px'}}>
                <p><strong>Thành viên:</strong> Trần Văn B (TV Cũ)</p>
                <p><strong>Điểm:</strong> 1500</p>
            </div>
          )}

        </div>

        <div className="card-footer workflow-actions">
          <Button onClick={() => navigate(-1)} variant="light" size="medium">
            Quay lại
          </Button>
          <div className="actions-right">
            <Button onClick={handleSkip} variant="secondary" size="medium">
              Bỏ qua
            </Button>
            <Button onClick={handleNext} variant="primary" size="medium">
              Tiếp tục
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoPage;