import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback

import Button from '../../../components/common/Button.jsx';

import './Customers.css';
// import AddCustomerModal from './AddCustomerModal.jsx'; // AddCustomerModal chưa được tạo, sẽ bỏ qua phần thêm mới từ đây
import EditCustomerModal from './EditCustomerModal.jsx';
import CustomerDetailModal from './CustomerDetailModal.jsx';

// Import API services
import {
  getAllCustomersApi,
  // getCustomerByIdApi, // Sẽ dùng trong openDetailModal nếu cần fetch lại
  updateCustomerApi,
  deleteCustomerApi
} from '../../../services/customerApiService.js'; // Đường dẫn tới file service của bạn

// Bỏ INITIAL_CUSTOMERS, sẽ fetch từ API
// const INITIAL_CUSTOMERS = [ ... ];

// generateNewCustomerId sẽ không cần thiết nếu ID được tạo ở backend
// const generateNewCustomerId = (customers) => { ... };

function Customers() {
  const [customers, setCustomers] = useState([]); // Khởi tạo mảng rỗng
  const [isLoading, setIsLoading] = useState(true); // State cho loading
  const [error, setError] = useState(null); // State cho lỗi fetch

  const [searchTerm, setSearchTerm] = useState('');
  
  // const [showAddModal, setShowAddModal] = useState(false); // Bỏ qua Add Modal vì chưa có
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [customerToView, setCustomerToView] = useState(null);

  // Hàm fetch dữ liệu khách hàng
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllCustomersApi(searchTerm); // Gọi API với searchTerm
      setCustomers(data || []); // API có thể trả null nếu không có kết quả hoặc lỗi
    } catch (err) {
      setError(err.message || "Không thể tải danh sách khách hàng.");
      setCustomers([]); // Đặt lại customers nếu có lỗi
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]); // Phụ thuộc vào searchTerm để fetch lại khi tìm kiếm

  useEffect(() => {
    fetchCustomers();
  }, []); // Gọi khi component mount hoặc hàm fetchCustomers thay đổi

  // Bỏ qua handleAddCustomer vì chưa có AddCustomerModal
  // const handleAddCustomer = (newCustomerData) => { ... };

  const handleUpdateCustomer = async (updatedCustomerDataFromModal) => {
    // updatedCustomerDataFromModal là dữ liệu từ EditCustomerModal
    // có thể có dạng: { id, name, email, phone, membershipTier, joinDate }
    // Cần đảm bảo gửi đúng payload mà backend updateCustomerApi mong muốn
    // Backend service: { name, email, phone, joinDate (là NgaySinh)}
    console.log("Customers.jsx: handleUpdateCustomer called with:", updatedCustomerDataFromModal); // DEBUG
    setIsLoading(true); // Có thể thêm loading riêng cho việc update
    try {
      const payloadForApi = { // Chuẩn bị payload đúng cho API
        name: updatedCustomerDataFromModal.name,
        email: updatedCustomerDataFromModal.email,
        phone: updatedCustomerDataFromModal.phone,
        //joinDate: updatedCustomerDataFromModal.joinDate // Backend service sẽ map joinDate -> NgaySinh
      };
      const result = await updateCustomerApi(updatedCustomerDataFromModal.id, payloadForApi);
      if (result.success) {
        // Cập nhật customer list với thông tin mới từ result.customer
        setCustomers(prevCustomers =>
          prevCustomers.map(cust =>
            cust.id === result.customer.id ? result.customer : cust
          )
        );
        // Hoặc đơn giản là fetch lại toàn bộ danh sách
        // fetchCustomers(); 
        alert(result.message || "Cập nhật thành công!");
      } else {
        alert(`Lỗi cập nhật: ${result.message || "Không rõ nguyên nhân."}`);
      }
    } catch (err) {
      alert(`Lỗi khi cập nhật khách hàng: ${err.message || "Vui lòng thử lại."}`);
    } finally {
      setIsLoading(false);
      setShowEditModal(false);
      setCustomerToEdit(null);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng có ID: ${customerId}?`)) {
      setIsLoading(true); // Có thể thêm loading riêng
      try {
        const result = await deleteCustomerApi(customerId);
        if (result.success) {
          setCustomers(prevCustomers => prevCustomers.filter(cust => cust.id !== customerId));
          alert(result.message || "Xóa khách hàng thành công!");
        } else {
          alert(`Lỗi khi xóa: ${result.message || "Không rõ nguyên nhân."}`);
        }
      } catch (err) {
        alert(`Lỗi khi xóa khách hàng: ${err.message || "Vui lòng thử lại."}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEditModal = (customer) => {
    // customer object từ API có thể là:
    // { id, MaKH, name, HoTen, SoDT, phone, Email, email, NgaySinh, joinDate, NgayDKTV, membershipTier }
    // EditCustomerModal đang mong đợi: { id, name, email, phone, membershipTier, joinDate }
    // Cần đảm bảo customerToEdit có các trường đúng
    const customerForEdit = {
        id: customer.id || customer.MaKH,
        name: customer.name || customer.HoTen,
        email: customer.email || customer.Email,
        phone: customer.phone || customer.SoDT,
        membershipTier: customer.membershipTier, // Đã có từ service
        joinDate: customer.joinDate || customer.NgayDKTV // joinDate từ service (map từ NGAYDKTV)
    };
    console.log("Customers.jsx: Opening edit modal for:", customerForEdit); // DEBUG
    setCustomerToEdit(customerForEdit);
    setShowEditModal(true);
  };

  const openDetailModal = (customer) => {
    // CustomerDetailModal cũng mong đợi các trường tương tự
    const customerForView = {
        id: customer.id || customer.MaKH,
        name: customer.name || customer.HoTen,
        email: customer.email || customer.Email,
        phone: customer.phone || customer.SoDT,
        membershipTier: customer.membershipTier,
        joinDate: customer.joinDate || customer.NgayDKTV,
        // Có thể thêm các trường khác nếu CustomerDetailModal hỗ trợ
        // NgaySinh: customer.NgaySinh,
        // SoTienDaChi: customer.SoTienDaChi
    };
    console.log("Customers.jsx: Opening detail modal for:", customerForView); // DEBUG
    setCustomerToView(customerForView);
    setShowDetailModal(true);
  };

  // filteredCustomers sẽ tự động cập nhật khi searchTerm hoặc customers thay đổi
  // Không cần thay đổi logic filteredCustomers vì nó dựa trên state `customers`
  // đã được map với các trường 'name', 'email', 'phone', 'membershipTier' từ API
  const filteredCustomers = customers.filter(customer =>
    (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.id && customer.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm)) ||
    (customer.membershipTier && customer.membershipTier.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // API có thể trả về date string có dạng ISO 8601 (có 'T' và 'Z')
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A'; // Kiểm tra ngày không hợp lệ
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    } catch (e) {
        return 'N/A';
    }
  };

  if (isLoading && customers.length === 0) { // Chỉ hiển thị loading chính khi chưa có dữ liệu
    return <div className="customers-page-container"><p>Đang tải dữ liệu khách hàng...</p></div>;
  }

  if (error) {
    return <div className="customers-page-container"><p style={{color: 'red'}}>Lỗi: {error}</p></div>;
  }

  return (
    <div className="customers-page-container">
      <h2>Quản Lý Khách Hàng</h2>

      <div className="customer-controls">
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng (ID, tên, email, SĐT...)"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // Việc tìm kiếm sẽ tự động nhờ useEffect theo dõi searchTerm
        />
        {/* Nút thêm mới, tạm thời comment lại
        <Button onClick={() => setShowAddModal(true)} className="btn-add"> 
          + Thêm Khách Hàng Mới
        </Button>
        */}
      </div>

      {isLoading && <p>Đang làm mới danh sách...</p>} 
      {/* Hiển thị loading phụ khi fetch lại do search */}

      {!isLoading && filteredCustomers.length === 0 ? (
        <p className="no-customers-message">
          {searchTerm ? "Không tìm thấy khách hàng phù hợp." : "Chưa có dữ liệu khách hàng."}
        </p>
      ) : (
        !isLoading && filteredCustomers.length > 0 && ( // Chỉ render bảng khi không loading và có data
          <table className="customer-list-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ và Tên</th>
                <th>Email</th>
                <th>Điện Thoại</th>
                <th>Hạng Thành Viên</th>
                <th>Ngày Tham Gia</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email || 'N/A'}</td>
                  <td>{customer.phone || 'N/A'}</td>
                  <td>{customer.membershipTier}</td>
                  <td>{formatDate(customer.joinDate)}</td>
                  <td className="customer-actions">
                    <Button onClick={() => openDetailModal(customer)} className="btn-details" variant="info" size="small">Chi tiết</Button>
                    <Button onClick={() => openEditModal(customer)} className="btn-edit" variant="warning" size="small">Sửa</Button>
                    <Button onClick={() => handleDeleteCustomer(customer.id)} className="btn-delete" variant="danger" size="small">Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {/* Modal thêm mới, tạm thời comment
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCustomer} 
        />
      )} */}

      {showEditModal && customerToEdit && (
        <EditCustomerModal
          customerData={customerToEdit} // customerToEdit đã được chuẩn bị các trường cần thiết
          onClose={() => {
            setShowEditModal(false);
            setCustomerToEdit(null);
          }}
          onSave={handleUpdateCustomer} // Prop này sẽ gọi handleUpdateCustomer của Customers.jsx
        />
      )}

      {showDetailModal && customerToView && (
        <CustomerDetailModal
          customerData={customerToView} // customerToView đã được chuẩn bị
          onClose={() => {
            setShowDetailModal(false);
            setCustomerToView(null);
          }}
        />
      )}
    </div>
  );
}

export default Customers;