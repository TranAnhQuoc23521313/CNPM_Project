import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../../components/common/Button.jsx';
import './Customers.css';
// import AddCustomerModal from './AddCustomerModal.jsx';
import EditCustomerModal from './EditCustomerModal.jsx';
import CustomerDetailModal from './CustomerDetailModal.jsx';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog.jsx'; // << THÊM IMPORT

// Import API services
import {
  getAllCustomersApi,
  updateCustomerApi,
  deleteCustomerApi
} from '../../../services/customerApiService.js';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading cho lần fetch đầu hoặc khi search
  const [isActionLoading, setIsActionLoading] = useState(false); // Loading cho các action (update, delete)
  const [error, setError] = useState(null); // Lỗi fetch ban đầu

  const [searchTerm, setSearchTerm] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [customerToView, setCustomerToView] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null); // << THÊM STATE MỚI

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllCustomersApi(searchTerm);
      setCustomers(data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách khách hàng.");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]); // Đổi dependency thành fetchCustomers

  const handleUpdateCustomer = async (updatedCustomerDataFromModal) => {
    setIsActionLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const payloadForApi = {
        name: updatedCustomerDataFromModal.name,
        email: updatedCustomerDataFromModal.email,
        phone: updatedCustomerDataFromModal.phone,
      };
      const updatedCustomerFromServer = await updateCustomerApi(updatedCustomerDataFromModal.id, payloadForApi);
      
      setCustomers(prevCustomers =>
        prevCustomers.map(cust =>
          cust.id === updatedCustomerFromServer.id ? updatedCustomerFromServer : cust
        )
      );
      setSuccessMessage(`Thông tin khách hàng "${updatedCustomerDataFromModal.name}" đã được cập nhật.`);
      
      setShowEditModal(false); 
      setCustomerToEdit(null);

      await fetchCustomers();

    } catch (err) {
      console.error("Error updating customer:", err);
      let errMsg = "Lỗi khi cập nhật khách hàng. Vui lòng thử lại.";
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      setErrorMessage(errMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // << HÀM XÓA ĐÃ ĐƯỢC CẬP NHẬT >>
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return; // Không làm gì nếu không có khách hàng nào được chọn để xóa

    const { id: customerId, name: customerName } = customerToDelete;

    setIsActionLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      await deleteCustomerApi(customerId);
      
      setCustomers(prevCustomers => prevCustomers.filter(cust => cust.id !== customerId));
      setSuccessMessage(`Khách hàng "${customerName}" (ID: ${customerId}) đã được xóa thành công.`);

    } catch (err) {
      console.error("Error deleting customer:", err);
      let errMsg = `Lỗi khi xóa khách hàng "${customerName}". Vui lòng thử lại.`;
      if (err.response && err.response.data && err.response.data.message) {
          errMsg = err.response.data.message;
      } else if (err.message) {
          errMsg = err.message;
      }
      setErrorMessage(errMsg);
    } finally {
      setIsActionLoading(false);
      setCustomerToDelete(null); // Đóng hộp thoại xác nhận sau khi hoàn tất
    }
  };


  const openEditModal = (customer) => {
    const customerForEdit = {
        id: customer.id || customer.MaKH,
        name: customer.name || customer.HoTen,
        email: customer.email || customer.Email,
        phone: customer.phone || customer.SoDT,
        membershipTier: customer.membershipTier,
        joinDate: customer.joinDate || customer.NgayDKTV
    };
    setCustomerToEdit(customerForEdit);
    setShowEditModal(true);
    setErrorMessage('');
  };

  const openDetailModal = (customer) => {
    const customerForView = {
        id: customer.id || customer.MaKH,
        name: customer.name || customer.HoTen,
        email: customer.email || customer.Email,
        phone: customer.phone || customer.SoDT,
        membershipTier: customer.membershipTier,
        joinDate: customer.joinDate || customer.NgayDKTV,
        birthDate: customer.NgaySinh, 
        totalSpent: customer.SoTienDaChi,
        points: customer.DiemTichLuy
    };
    setCustomerToView(customerForView);
    setShowDetailModal(true);
  };
  
  // Do fetchCustomers đã xử lý searchTerm, việc filter ở client là không cần thiết nữa
  // và có thể gây nhầm lẫn. Bỏ filteredCustomers để hiển thị trực tiếp state `customers`
  // là kết quả từ API.
  // const filteredCustomers = customers.filter(...);

  const handleCloseSuccessModal = () => {
    setSuccessMessage('');
  };

  const handleCloseErrorModal = () => {
    setErrorMessage('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    } catch (e) {
        return 'N/A';
    }
  };

  if (isLoading && customers.length === 0 && !error && !searchTerm) {
    return <div className="customers-page-container"><p className="loading-text">Đang tải dữ liệu khách hàng...</p></div>;
  }

  if (error && customers.length === 0) {
    return <div className="customers-page-container"><p className="error-text" style={{ color: 'red' }}>Lỗi: {error}</p></div>;
  }

  return (
    <div className="customers-page-container">
      <h2>Quản Lý Khách Hàng</h2>

      <div className="customer-controls">
        <input
          type="text"
          placeholder="Tìm kiếm theo ID, tên, email, SĐT..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isActionLoading || isLoading}
        />
        <Button onClick={fetchCustomers} className="btn-search" disabled={isActionLoading || isLoading}>
          Tìm kiếm
        </Button>
      </div>

      {isActionLoading && <p className="loading-text action-loading-text">Đang xử lý...</p>}
      {isLoading && !isActionLoading && <p className="loading-text">Đang tải...</p>}

      {!isLoading && customers.length === 0 && (
        <p className="no-customers-message">
          {searchTerm ? "Không tìm thấy khách hàng phù hợp." : "Chưa có dữ liệu khách hàng."}
        </p>
      )}
      
      {!isLoading && customers.length > 0 && (
        <table className="customer-list-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ và Tên</th>
              <th>Email</th>
              <th>Điện Thoại</th>
              <th>Hạng TV</th>
              <th>Ngày Tham Gia</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email || 'N/A'}</td>
                <td>{customer.phone || 'N/A'}</td>
                <td>{customer.membershipTier}</td>
                <td>{formatDate(customer.joinDate)}</td>
                <td className="customer-actions">
                  <Button 
                    onClick={() => openDetailModal(customer)} 
                    className="btn-details" 
                    variant="info" 
                    size="small"
                    disabled={isActionLoading}>
                      Chi tiết
                  </Button>
                  <Button 
                    onClick={() => openEditModal(customer)} 
                    className="btn-edit" 
                    variant="warning" 
                    size="small"
                    disabled={isActionLoading}>
                      Sửa
                  </Button>
                  <Button 
                    // << CẬP NHẬT ONCLICK ĐỂ MỞ HỘP THOẠI >>
                    onClick={() => setCustomerToDelete({ id: customer.id, name: customer.name })} 
                    className="btn-delete" 
                    variant="danger" 
                    size="small"
                    disabled={isActionLoading}>
                      Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODALS */}
      {showEditModal && customerToEdit && (
        <EditCustomerModal
          customerData={customerToEdit}
          onClose={() => {
            setShowEditModal(false);
            setCustomerToEdit(null);
            setErrorMessage('');
          }}
          onSave={handleUpdateCustomer}
          isSaving={isActionLoading}
        />
      )}

      {showDetailModal && customerToView && (
        <CustomerDetailModal
          customerData={customerToView}
          onClose={() => {
            setShowDetailModal(false);
            setCustomerToView(null);
          }}
        />
      )}
      
      {/* << THÊM COMPONENT HỘP THOẠI XÁC NHẬN >> */}
      {customerToDelete && (
        <ConfirmationDialog
          isOpen={!!customerToDelete}
          onClose={() => setCustomerToDelete(null)} // Đóng modal khi nhấn hủy
          onConfirm={handleDeleteCustomer} // Gọi hàm xóa khi xác nhận
          title="Xác nhận xóa khách hàng"
          message={
            <span>
              Bạn có chắc chắn muốn xóa khách hàng <strong>"{customerToDelete.name}"</strong> (ID: {customerToDelete.id})? 
              <br/>
              Hành động này không thể hoàn tác.
            </span>
          }
          confirmButtonText="Xác nhận Xóa"
          isLoading={isActionLoading}
        />
      )}

      <SuccessMessageModal
        isOpen={!!successMessage}
        onClose={handleCloseSuccessModal}
        successMessage={successMessage}
      />
      <ErrorMessageModal
        isOpen={!!errorMessage}
        onClose={handleCloseErrorModal}
        errorMessage={errorMessage}
      />
    </div>
  );
}

export default Customers;