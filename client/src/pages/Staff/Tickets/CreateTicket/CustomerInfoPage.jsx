// src/pages/Staff/Tickets/CreateTicket/CustomerInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../../components/common/Button';
import './CreateTicketWorkflow.css';
import './CustomerInfoPage.css';
import { findCustomerByPhoneApi, registerCustomerApi } from '../../../../services/customerApiService';

const STAFF_BASE_PATH = "/staff";

const CustomerInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousState = location.state || {};

  // State ban đầu cho thông tin khách hàng (sẽ được cập nhật khi người dùng nhập)
  const [customerPhone, setCustomerPhone] = useState(previousState.customerInfo?.phone || '');
  const [customerName, setCustomerName] = useState(previousState.customerInfo?.name || '');
  const [customerEmail, setCustomerEmail] = useState(previousState.customerInfo?.email || '');

  // customerType: 'guest' (khách vãng lai) hoặc 'member' (thành viên)
  const [customerType, setCustomerType] = useState(previousState.customerInfo?.type || 'guest');

  // wantsToRegisterAsMember: Chỉ áp dụng khi customerType là 'guest'
  // Nếu ban đầu là guest và có thông tin (tức là đã từng muốn đăng ký ở lần trước) -> true
  // Hoặc nếu là member mà quay lại và đổi thành guest -> false
  const [wantsToRegisterAsMember, setWantsToRegisterAsMember] = useState(
    previousState.customerInfo?.type === 'guest' && (!!previousState.customerInfo?.phone || !!previousState.customerInfo?.name)
  );

  const [foundMember, setFoundMember] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (!previousState.movieId || !previousState.showtimeId || !previousState.selectedSeats || previousState.totalSeatPrice === undefined) {
      console.warn("CustomerInfoPage: Thiếu thông tin từ các bước trước, điều hướng về chọn phim.");
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`, { replace: true });
    }
  }, [previousState, navigate]);

  // Tự động tìm kiếm khi SĐT thay đổi và là thành viên
  useEffect(() => {
    const searchMember = async () => {
      if (customerType === 'member' && customerPhone.trim().length >= 9) {
        setIsProcessing(true);
        setSearchError('');
        setFoundMember(null);
        try {
          const memberData = await findCustomerByPhoneApi(customerPhone.trim());
          if (memberData) {
            setFoundMember(memberData);
            setCustomerName(memberData.HoTen || '');
            setCustomerEmail(memberData.Email || '');
          } else {
            setSearchError('Không tìm thấy thành viên. Vui lòng nhập tên để đăng ký mới.');
            setCustomerName(''); // Xóa tên cũ nếu không tìm thấy
            setCustomerEmail(''); // Xóa email cũ
          }
        } catch (error) {
          setSearchError(error.message || 'Lỗi khi tìm kiếm thành viên.');
          setFoundMember(null);
        } finally {
          setIsProcessing(false);
        }
      } else if (customerType === 'member') {
        setFoundMember(null);
        setSearchError(customerPhone.trim().length > 0 && customerPhone.trim().length < 9 ? 'SĐT thành viên cần ít nhất 9 số.' : '');
        // Không tự động xóa customerName, customerEmail ở đây khi SĐT không hợp lệ,
        // để người dùng có thể sửa SĐT mà không mất thông tin đã nhập nếu muốn đăng ký mới.
      }
    };

    // Chỉ tìm kiếm khi là thành viên
    if (customerType === 'member') {
        const debounceSearch = setTimeout(searchMember, 500);
        return () => clearTimeout(debounceSearch);
    } else {
        // Nếu chuyển sang guest, xóa thông tin tìm kiếm cũ
        setFoundMember(null);
        setSearchError('');
    }
  }, [customerPhone, customerType]);


  // Xử lý khi customerType thay đổi
  useEffect(() => {
    // Reset các trường khi chuyển đổi qua lại giữa guest và member
    setCustomerPhone('');
    setCustomerName('');
    setCustomerEmail('');
    setFoundMember(null);
    setSearchError('');

    if (customerType === 'guest') {
      setWantsToRegisterAsMember(false); // Mặc định khách vãng lai không đăng ký
    }
    // Nếu là member, wantsToRegisterAsMember không có ý nghĩa, không cần set
  }, [customerType]);


  const handleNext = async () => {
    setIsProcessing(true);
    let customerDataForNextStep = null;

    if (customerType === 'member') {
      if (foundMember) { // Thành viên đã tồn tại
        customerDataForNextStep = {
          type: 'member', MaKH: foundMember.MaKH,
          phone: foundMember.SoDT, name: foundMember.HoTen, email: foundMember.Email,
        };
      } else { // Đăng ký thành viên mới
        if (!customerPhone.trim() || customerPhone.trim().length < 9) {
          alert("Vui lòng nhập Số Điện Thoại hợp lệ (ít nhất 9 số) để đăng ký thành viên.");
          setIsProcessing(false); return;
        }
        if (!customerName.trim()) {
          alert("Vui lòng nhập Tên Khách Hàng để đăng ký thành viên.");
          setIsProcessing(false); return;
        }
        try {
            const newMemberPayload = { HoTen: customerName.trim(), SoDT: customerPhone.trim(), Email: customerEmail.trim() || null };
            const registeredMember = await registerCustomerApi(newMemberPayload);
            customerDataForNextStep = {
                type: 'member', MaKH: registeredMember.MaKH,
                phone: registeredMember.SoDT, name: registeredMember.HoTen, email: registeredMember.Email,
            };
            alert(`Đăng ký thành viên mới thành công: ${registeredMember.HoTen}`);
        } catch (error) {
            console.error("Lỗi đăng ký thành viên mới:", error);
            alert(error.message || "Lỗi khi đăng ký thành viên mới.");
            setIsProcessing(false); return;
        }
      }
    } else { // customerType === 'guest'
      if (wantsToRegisterAsMember) { // Khách vãng lai muốn đăng ký
        if (!customerPhone.trim() || customerPhone.trim().length < 9) {
          alert("Vui lòng nhập Số Điện Thoại hợp lệ (ít nhất 9 số) để đăng ký thành viên.");
          setIsProcessing(false); return;
        }
        if (!customerName.trim()) {
          alert("Vui lòng nhập Tên Khách Hàng để đăng ký thành viên.");
          setIsProcessing(false); return;
        }
        try {
            const newMemberPayload = { HoTen: customerName.trim(), SoDT: customerPhone.trim(), Email: customerEmail.trim() || null };
            const registeredMember = await registerCustomerApi(newMemberPayload);
            customerDataForNextStep = {
                type: 'member', MaKH: registeredMember.MaKH,
                phone: registeredMember.SoDT, name: registeredMember.HoTen, email: registeredMember.Email,
            };
            alert(`Đăng ký thành viên mới thành công: ${registeredMember.HoTen} (từ khách vãng lai)`);
        } catch (error) {
            console.error("Lỗi đăng ký thành viên (từ khách vãng lai):", error);
            alert(error.message || "Lỗi khi đăng ký thành viên.");
            setIsProcessing(false); return;
        }
      } else {
        // Khách vãng lai không đăng ký, không có thông tin gì cần gửi
        customerDataForNextStep = null;
      }
    }

    navigate(`${STAFF_BASE_PATH}/tickets/new/confirm-order`, {
      state: { ...previousState, customerInfo: customerDataForNextStep }
    });
    setIsProcessing(false); // Đặt ở đây để đảm bảo nó được gọi sau navigate
  };

  const handleSkip = () => {
    const { customerInfo, ...restOfState } = previousState;
    navigate(`${STAFF_BASE_PATH}/tickets/new/confirm-order`, { state: restOfState });
  };

  const handleCustomerTypeChange = (e) => {
    setCustomerType(e.target.value);
    // Các state khác sẽ được reset trong useEffect theo dõi customerType
  };

    return (
    <div className="create-ticket-step customer-info-page">
      <div className="customer-info-card">
        <div className="card-header">
          <p className="page-step-title">(Tùy chọn) Bước 5</p>
          <h2 className="page-main-title">Thông Tin Khách Hàng</h2>
        </div>
        <div className="card-body">
          <div className="form-field customer-type-selector"> {/* Giữ class gốc */}
            <label>Loại Khách Hàng:</label>
            <div className="radio-group"> {/* Giữ class gốc */}
              <label htmlFor="guest" className={customerType === 'guest' ? 'active' : ''}>
                <input type="radio" id="guest" name="customerType" value="guest" checked={customerType === 'guest'} onChange={handleCustomerTypeChange} disabled={isProcessing}/> Khách vãng lai
              </label>
              <label htmlFor="member" className={customerType === 'member' ? 'active' : ''}>
                <input type="radio" id="member" name="customerType" value="member" checked={customerType === 'member'} onChange={handleCustomerTypeChange} disabled={isProcessing}/> Thành viên
              </label>
            </div>
          </div>

          {/* Phần hiển thị cho KHÁCH VÃNG LAI */}
          {customerType === 'guest' && (
            <>
              <div className="form-field register-member-checkbox"> {/* Giữ class gốc */}
                <label htmlFor="wantsToRegisterAsMember">
                  <input type="checkbox" id="wantsToRegisterAsMember" checked={wantsToRegisterAsMember} onChange={(e) => setWantsToRegisterAsMember(e.target.checked)} disabled={isProcessing} /> Đăng ký thành viên?
                </label>
                {/* Thông báo lỗi cho checkbox này nếu cần, ví dụ, nếu muốn đăng ký mà chưa nhập SĐT ở trên (logic này chưa có) */}
                {/* {wantsToRegisterAsMember && !customerPhone.trim() && <small className="field-error">Vui lòng nhập SĐT ở trên để đăng ký.</small>} */}
              </div>

              {/* Các trường nhập liệu cho khách vãng lai muốn đăng ký */}
              {/* Logic hiện tại của bạn là dùng chung state customerPhone, customerName, customerEmail */}
              {/* Nên các trường này sẽ hiển thị nếu customerType là 'guest' VÀ wantsToRegisterAsMember là true */}
              {wantsToRegisterAsMember && (
                <>
                  <div className="form-field"> {/* Giữ class gốc */}
                    <label htmlFor="customerPhone"> {/* Giữ for/id gốc */}
                      Số Điện Thoại*
                    </label>
                    <input
                      type="tel"
                      id="customerPhone" // Giữ for/id gốc
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Nhập SĐT (ít nhất 9 số)"
                      className="styled-input" // Giữ class gốc
                      disabled={isProcessing}
                    />
                    {/* Lỗi searchError thường không áp dụng trực tiếp ở đây cho guest, trừ khi có logic tìm kiếm SĐT guest */}
                  </div>

                  <div className="form-field"> {/* Giữ class gốc */}
                    <label htmlFor="customerName">Tên Khách Hàng*</label> {/* Giữ for/id gốc */}
                    <input
                      type="text"
                      id="customerName" // Giữ for/id gốc
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="styled-input" // Giữ class gốc
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="form-field"> {/* Giữ class gốc */}
                    <label htmlFor="customerEmail">Email (tùy chọn)</label> {/* Giữ for/id gốc */}
                    <input
                      type="email"
                      id="customerEmail" // Giữ for/id gốc
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Ví dụ: nguyenvana@example.com"
                      className="styled-input" // Giữ class gốc
                      disabled={isProcessing}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* Phần hiển thị cho THÀNH VIÊN */}
          {customerType === 'member' && (
            <>
              <div className="form-field"> {/* Giữ class gốc */}
                <label htmlFor="customerPhone"> {/* Giữ for/id gốc */}
                  Số Điện Thoại Thành Viên*
                  {/* Gợi ý này vẫn có thể hiển thị dựa trên logic state hiện tại của bạn */}
                  {!foundMember && customerPhone.trim().length >= 9 && !searchError && !isProcessing && <span className="field-hint-inline"> (SĐT này chưa là thành viên, nhấn Tiếp tục để đăng ký)</span>}
                </label>
                <input
                  type="tel"
                  id="customerPhone" // Giữ for/id gốc
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Nhập SĐT (ít nhất 9 số) để tìm hoặc đăng ký"
                  className="styled-input" // Giữ class gốc
                  disabled={isProcessing}
                />
                {searchError && <small className="field-error">{searchError}</small>}
              </div>

              {/* CÁC TRƯỜNG TÊN VÀ EMAIL SẼ KHÔNG ĐƯỢC RENDER KHI LÀ THÀNH VIÊN */}
              {/*
                Logic state của bạn (customerName, customerEmail) vẫn sẽ được cập nhật
                bởi useEffect khi tìm thấy thành viên, hoặc khi người dùng nhập SĐT không tìm thấy
                và (theo logic ngầm) có thể đã có tên/email từ trước đó hoặc được set rỗng.
                Nhưng các input này sẽ không hiển thị trên giao diện.
              */}
              
              {/*
              <div className="form-field">
                <label htmlFor="customerName">Tên Khách Hàng*</label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="styled-input"
                  disabled={isProcessing || (!!foundMember && !!foundMember.HoTen) } 
                />
              </div>

              <div className="form-field">
                <label htmlFor="customerEmail">Email (tùy chọn)</label>
                <input
                  type="email"
                  id="customerEmail"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Ví dụ: nguyenvana@example.com"
                  className="styled-input"
                  disabled={isProcessing || (!!foundMember && !!foundMember.Email)}
                />
              </div>
              */}

              {isProcessing && customerPhone.trim().length >=9 && <p className="processing-text">Đang tìm kiếm thành viên...</p>}

              {foundMember && (
                <div className="found-member-info" style={{marginTop: '15px', padding: '10px', border: '1px solid lightgreen', borderRadius: '4px'}}> {/* Giữ class gốc, style inline nếu bạn muốn */}
                    <h4>Thông tin thành viên:</h4>
                    <p><strong>Mã KH:</strong> {foundMember.MaKH}</p>
                    <p><strong>Tên:</strong> {foundMember.HoTen}</p>
                    <p><strong>Email:</strong> {foundMember.Email || 'Chưa có'}</p>
                    <p><strong>Đã chi tiêu:</strong> {foundMember.SoTienDaChi?.toLocaleString('vi-VN')}đ</p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="card-footer workflow-actions"> {/* Giữ class gốc */}
          <Button onClick={() => navigate(-1)} variant="light" size="medium" disabled={isProcessing}>Quay lại</Button>
          <div className="actions-right"> {/* Giữ class gốc */}
            <Button onClick={handleSkip} variant="secondary" size="medium" disabled={isProcessing}>Bỏ qua thông tin KH</Button>
            <Button onClick={handleNext} variant="primary" size="medium" disabled={isProcessing}>
              {isProcessing ? 'Đang xử lý...' : 'Tiếp tục'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerInfoPage;