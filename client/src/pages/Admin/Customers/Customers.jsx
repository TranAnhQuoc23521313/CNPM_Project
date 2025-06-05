import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../../components/common/Button.jsx';
import './Customers.css';
// import AddCustomerModal from './AddCustomerModal.jsx';
import EditCustomerModal from './EditCustomerModal.jsx';
import CustomerDetailModal from './CustomerDetailModal.jsx';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal';

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

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // const [pendingNavigation, setPendingNavigation] = useState(null); // Không cần ở đây

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // Không reset errorMessage ở đây, vì nó có thể là kết quả của một action trước đó
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
  }, []); // Phụ thuộc vào fetchCustomers để chạy lại khi searchTerm thay đổi

  const handleUpdateCustomer = async (updatedCustomerDataFromModal) => {
    console.log("Customers.jsx: handleUpdateCustomer called with:", updatedCustomerDataFromModal);
    setIsActionLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const payloadForApi = {
        name: updatedCustomerDataFromModal.name,
        email: updatedCustomerDataFromModal.email,
        phone: updatedCustomerDataFromModal.phone,
      };
      // Giả sử API trả về customer đã được cập nhật đầy đủ
      const updatedCustomerFromServer = await updateCustomerApi(updatedCustomerDataFromModal.id, payloadForApi);
      
      // Cập nhật customer list với thông tin mới từ updatedCustomerFromServer
      // API của bạn có thể trả về cấu trúc khác, ví dụ: { success: true, message: "...", customer: {...} }
      // Nếu API trả về { success: true, customer: {...} }:
      // if (updatedCustomerFromServer.success && updatedCustomerFromServer.customer) {
      //   setCustomers(prevCustomers =>
      //     prevCustomers.map(cust =>
      //       cust.id === updatedCustomerFromServer.customer.id ? updatedCustomerFromServer.customer : cust
      //     )
      //   );
      //   setSuccessMessage(updatedCustomerFromServer.message || `Cập nhật thông tin khách hàng "${updatedCustomerFromServer.customer.name || updatedCustomerFromServer.customer.HoTen}" thành công!`);
      // } else { 
      //   // Xử lý trường hợp API không trả về customer như mong đợi hoặc success: false
      //   setErrorMessage(updatedCustomerFromServer.message || "Lỗi cập nhật: Dữ liệu trả về không hợp lệ.");
      //   return; // Ngăn đóng modal nếu có lỗi logic từ API
      // }

      // Nếu API trả về trực tiếp customer object đã cập nhật:
      setCustomers(prevCustomers =>
        prevCustomers.map(cust =>
          // If the API returns the full updated object, use it. Otherwise, merge.
          // For now, let's assume updatedCustomerFromServer might not be the full customer object
          // or might not even be returned if the API is a 204 No Content or simple success.
          // The safest is to update based on what was sent, if the API response isn't detailed.
          // However, the current code *expects* updatedCustomerFromServer to be the full object for list update.
          // If API just returns success, we'd need to merge updatedCustomerDataFromModal with existing customer.
          // For now, assuming API returns the updated object:
          cust.id === updatedCustomerFromServer.id ? updatedCustomerFromServer : cust
        )
      );
      // Use the name from the data submitted to the modal, as the API response might not contain it.
      setSuccessMessage(`Thông tin khách hàng "${updatedCustomerDataFromModal.name}" đã được cập nhật.`);
      
      setShowEditModal(false); // Đóng modal khi thành công
      setCustomerToEdit(null);

      await fetchCustomers(); // Refetch to ensure data consistency, especially if API response was minimal

    } catch (err) {
      console.error("Error updating customer:", err);
      let errMsg = "Lỗi khi cập nhật khách hàng. Vui lòng thử lại.";
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      setErrorMessage(errMsg);
      // Không đóng modal edit khi lỗi để người dùng sửa
    } finally {
      setIsActionLoading(false);
      // Không nên gọi setIsLoading(false) ở đây vì đây là isActionLoading
      // Không đóng modal ở finally nếu có lỗi, chỉ đóng khi thành công (đã làm ở trên)
    }
  };

  const handleDeleteCustomer = async (customerId, customerName) => { // customerName đã được truyền vào
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customerName}" (ID: ${customerId})? Hành động này không thể hoàn tác.`)) {
      setIsActionLoading(true);
      setSuccessMessage('');
      setErrorMessage('');
      try {
        // Giả sử API của bạn không trả về gì nếu thành công, hoặc throw lỗi nếu thất bại
        // Hoặc API trả về { success: true/false, message: "..." }
        await deleteCustomerApi(customerId); 
        
        setCustomers(prevCustomers => prevCustomers.filter(cust => cust.id !== customerId));
        setSuccessMessage(`Khách hàng "${customerName}" (ID: ${customerId}) đã được xóa thành công.`);
        
        // Nếu API trả về result object:
        // const result = await deleteCustomerApi(customerId);
        // if (result.success) {
        //   setCustomers(prevCustomers => prevCustomers.filter(cust => cust.id !== customerId));
        //   setSuccessMessage(result.message || `Khách hàng "${customerName}" (ID: ${customerId}) đã được xóa thành công.`);
        // } else {
        //   setErrorMessage(result.message || `Lỗi khi xóa khách hàng "${customerName}".`);
        // }

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
      }
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
    setErrorMessage(''); // Xóa lỗi cũ khi mở modal edit
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

  const filteredCustomers = customers.filter(customer =>
    (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.id && String(customer.id).toLowerCase().includes(searchTerm.toLowerCase())) || // Đã sửa
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm)) ||
    (customer.membershipTier && customer.membershipTier.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleCloseSuccessModal = () => {
    setSuccessMessage('');
    // Bỏ pendingNavigation vì không dùng ở đây
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

  if (isLoading && customers.length === 0 && !error && !searchTerm) { // Điều kiện loading ban đầu
    return <div className="customers-page-container"><p className="loading-text">Đang tải dữ liệu khách hàng...</p></div>;
  }

  if (error && customers.length === 0) { // Lỗi fetch ban đầu và không có dữ liệu
    return <div className="customers-page-container"><p className="error-text" style={{ color: 'red' }}>Lỗi: {error}</p></div>;
  }

  return (
    <div className="customers-page-container">
      <h2>Quản Lý Khách Hàng</h2>

      <div className="customer-controls">
        <input
          type="text"
          placeholder="Tìm kiếm (ID, tên, email, SĐT...)"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isActionLoading || isLoading} // Vô hiệu hóa khi đang action hoặc fetch
        />
        {/* 
        <Button onClick={() => {
          // setShowAddModal(true); 
          // setErrorMessage(''); // Xóa lỗi cũ khi mở modal thêm
        }} 
        className="btn-add" 
        disabled={isActionLoading || isLoading}> 
          + Thêm Khách Hàng Mới
        </Button>
        */}
      </div>

      {isActionLoading && <p className="loading-text action-loading-text">Đang xử lý...</p>}
      {isLoading && searchTerm && !isActionLoading && <p className="loading-text">Đang tìm kiếm...</p>}


      {!isLoading && filteredCustomers.length === 0 && (
        <p className="no-customers-message">
          {searchTerm ? "Không tìm thấy khách hàng phù hợp." : "Chưa có dữ liệu khách hàng."}
        </p>
      )}
      
      {!isLoading && filteredCustomers.length > 0 && (
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
            {filteredCustomers.map(customer => (
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
                    onClick={() => handleDeleteCustomer(customer.id, customer.name)} 
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

      {/* 
      {showAddModal && (
        <AddCustomerModal
          onClose={() => {
            setShowAddModal(false);
            setErrorMessage(''); 
          }}
          onSave={handleAddCustomer} 
          isSaving={isActionLoading}
        />
      )} 
      */}

      {showEditModal && customerToEdit && (
        <EditCustomerModal
          customerData={customerToEdit}
          onClose={() => {
            setShowEditModal(false);
            setCustomerToEdit(null);
            setErrorMessage(''); // Xóa lỗi khi người dùng chủ động đóng modal
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