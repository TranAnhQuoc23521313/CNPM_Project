import React, { useState, useEffect, useCallback } from 'react';
import './TransactionHistory.css'; // CSS chính cho trang

// Import Modals
import AddBusinessTransactionModal from './AddBusinessTransactionModal.jsx';
import EditBusinessTransactionModal from './EditBusinessTransactionModal.jsx';     // Tùy chọn
import BusinessTransactionDetailModal from './BusinessTransactionDetailModal.jsx'; // Tùy chọn
import CustomerInvoiceDetailModal from './CustomerInvoiceDetailModal.jsx';
import { getAllEmployeeApi } from '../../../services/employeeApiService.js';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal.jsx';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal.jsx';

import { getAllTransactionHistory, createTransactionHistory } from '../../../services/transactionhistoryApiService.js';
import { getAllOrdersApi } from '../../../services/orderApiService'; // <<<<===== IMPORT API LẤY HÓA ĐƠN


// Helper functions
const formatCurrency = (costs) => Number(costs || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    if (includeTime) { options.hour = '2-digit'; options.minute = '2-digit'; }
    return date.toLocaleDateString('vi-VN', options);
  } catch (e) { return 'N/A'; }
};

// Fecth dữ liệu employee về quản lý hóa đơn
const mapEmployeeApiToClient = (apiEmployee) => ({
  id: apiEmployee.MANV,
  name: apiEmployee.TENNV,
  position: apiEmployee.VITRI,
  phone: apiEmployee.SDT,
  email: apiEmployee.EMAIL,
  startDate: apiEmployee.NGAYLAM,
  birthDate: apiEmployee.NGAYSINH,
  sex: apiEmployee.GIOITINH,
  address: apiEmployee.DIACHI,
  salary: apiEmployee.LUONG,
  // Thông tin tài khoản
  /* accountId: apiEmployee.MATK, // Mã tài khoản
  username: apiEmployee.TENDANGNHAP, // Tên đăng nhập
  password: apiEmployee.MATKHAU, // Mật khẩu text thuần từ API
  role: apiEmployee.ROLE_DANGNHAP, // Vai trò
  mockToken: apiEmployee.TOKEN_MOCK // Token cố định */
});

const mapTransactionHistoryApiToClient = (apiTransactionHistory) => ({
  id: apiTransactionHistory.MAGIAODICH,
  date: apiTransactionHistory.NGAYGIAODICH,
  type: apiTransactionHistory.LOAIGIAODICH,
  description: apiTransactionHistory.MOTA,
  costs: apiTransactionHistory.SOTIEN,
  category: apiTransactionHistory.PHANLOAI,
  employeeId: apiTransactionHistory.MANV,
  referenceId: apiTransactionHistory.MATHAMCHIEU,
  invoiceImageName: apiTransactionHistory.HINHANH,
  invoiceImageNameUrl: apiTransactionHistory.HINHANH
    ? `${process.env.REACT_APP_API_URL}/${apiTransactionHistory.HINHANH.replace(/\\/g, '/')}`
    : null
});

const mapApiOrderToCustomerInvoiceForDisplay = (apiOrder) => {
  // apiOrder từ OrderService.getAllOrders có dạng:
  // { MAHOADON, NGAYTAOHD, TONGTIEN, TRANGTHAITHANHTOAN, HINHTHUCTHANHTOAN, MANV, MAKH,
  //   KhachHang: { HOTEN, SODT },
  //   Phim: { TENPHIM },
  //   SuatChieu: { PhongChieu: { TENPHONG }, THOIGIAN }
  // }
  // Bạn cần map nó sang dạng CustomerInvoiceDetailModal mong đợi:
  // { id, date, customerName, customerId, employeeName (cần fetch thêm), totalAmount, items, paymentMethod, status }

  // Tạm thời, 'items' sẽ là tên phim và phòng chiếu, 'employeeName' sẽ là MANV
  // Để có employeeName đầy đủ, bạn cần join hoặc fetch thêm ở backend, hoặc map ở client nếu có danh sách nhân viên
  let itemsDescription = 'N/A';
  if (apiOrder.Phim?.TENPHIM && apiOrder.SuatChieu?.PhongChieu?.TENPHONG) {
    itemsDescription = `${apiOrder.Phim.TENPHIM} (Phòng: ${apiOrder.SuatChieu.PhongChieu.TENPHONG})`;
  } else if (apiOrder.Phim?.TENPHIM) {
    itemsDescription = apiOrder.Phim.TENPHIM;
  }
  // Để lấy tên nhân viên, chúng ta sẽ dùng getEmployeeNameDisplay đã có
  // nhưng nó cần danh sách employeesList. Trong hàm map này, chúng ta chưa có.
  // Vì vậy, handleViewCustomerInvoiceDetail sẽ phải bổ sung tên nhân viên.

  return {
    id: apiOrder.MAHOADON,
    date: apiOrder.NGAYTAOHD, // NGAYTAOHD là ngày hóa đơn được tạo
    customerName: apiOrder.KhachHang?.HOTEN || 'Khách vãng lai',
    customerId: apiOrder.MAKH || null,
    employeeId: apiOrder.MANV, // Sẽ dùng để lấy tên nhân viên sau
    employeeName: apiOrder.MANV, // Tạm thời hiển thị MANV, sẽ được cập nhật
    totalAmount: apiOrder.TONGTIEN,
    items: itemsDescription, // Mô tả chung về phim/suất chiếu
    paymentMethod: apiOrder.HINHTHUCTHANHTOAN,
    status: apiOrder.TRANGTHAITHANHTOAN,
    // Thêm các trường gốc từ API nếu CustomerInvoiceDetailModal cần (ví dụ để gọi API chi tiết hơn sau này)
    apiOrderData: apiOrder // Lưu lại dữ liệu gốc từ API nếu cần
  };
};

const generateId = (prefix = 'TRX') => `${prefix}-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

// Dữ liệu mẫu
/* const MOCK_EMPLOYEES = [
  { id: 'NV001', name: 'Nguyễn Văn An' }, { id: 'NV002', name: 'Trần Thị Bình' }, { id: 'NV003', name: 'Lê Văn Cường' },
]; */

/* const INITIAL_BUSINESS_TRANSACTIONS = [
  { id: generateId('DN'), date: '2023-11-01', type: 'expense', description: 'Chi phí tiền điện tháng 10', costs: 5500000, category: 'Vận hành', employeeId: 'NV003', employeeName: 'Lê Văn Cường', referenceId: 'HD-DIEN-1023', invoiceImageName: null },
  { id: generateId('DN'), date: '2023-11-05', type: 'income', description: 'Thu từ cho thuê mặt bằng quảng cáo', costs: 10000000, category: 'Thu khác', employeeId: 'NV003', employeeName: 'Lê Văn Cường', referenceId: 'HD-QC-1123', invoiceImageName: 'qc_invoice.jpg' },
]; */

/* const INITIAL_CUSTOMER_INVOICES = [
  { id: 'HD00123', date: '2023-11-15T10:30:00Z', customerName: 'Nguyễn Văn A', customerId: 'KH001', employeeName: 'Trần Thị Bình', totalAmount: 250000, items: '2 vé John Wick, 1 Bắp rang bơ', paymentMethod: 'Tiền mặt', status: 'Đã thanh toán' },
  { id: 'HD00124', date: '2023-11-15T11:45:00Z', customerName: 'Lê Thị C (vãng lai)', customerId: null, employeeName: 'Trần Thị Bình', totalAmount: 180000, items: '2 vé Phim hoạt hình, 1 Nước ngọt', paymentMethod: 'Chuyển khoản', status: 'Đã thanh toán' },
];
 */

function TransactionHistory() {
  const [activeTab, setActiveTab] = useState('business'); // 'business' or 'customerOrders'

  // --- State và logic cho Tab 1: Giao dịch Doanh nghiệp ---
  const [businessTransactions, setBusinessTransactions] = useState([]);
  const [searchTermBusiness, setSearchTermBusiness] = useState('');
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [editingBusinessTransaction, setEditingBusinessTransaction] = useState(null);     // For Edit Modal
  const [viewingBusinessTransaction, setViewingBusinessTransaction] = useState(null); // For Detail Modal


  const [customerInvoices, setCustomerInvoices] = useState([]); // Khởi tạo mảng rỗng
  const [searchTermCustomer, setSearchTermCustomer] = useState('');
  const [viewingCustomerInvoice, setViewingCustomerInvoice] = useState(null);
  const [isLoadingCustomerInvoices, setIsLoadingCustomerInvoices] = useState(false); // Thêm state loading

  const [employeesList, setEmployeesList] = useState(null);

  const [errorToDisplay, setErrorToDisplay] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const handleCloseErrorModal = useCallback(() => {
    setErrorToDisplay(null);
  }, []);

  // Success Modal
  const handleCloseSuccessModal = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const fetchEmployeesFromApi = useCallback(async () => {
    console.log('TransactionHistoryPage: Attempting to fetch employees ...');
    try {
      const apiEmployee = await getAllEmployeeApi();
      setEmployeesList(apiEmployee.map(mapEmployeeApiToClient));
      console.log('TransactionHistoryPage: Fecth Employees successful');
      //setSuccessMessage('TransactionHistoryPage: Fecth Employees successful');
    } catch (error) {
      console.error('TransactionHistoryPage: Error fetching employees:', error);
      setErrorToDisplay(error);
    } finally {

    }
  }, []);

  const fecthTransactionHistoryFromApi = useCallback(async () => {
    console.log('Fetching products from API...');
    //setIsLoading(true);
    try {
      const transactionhistorys = await getAllTransactionHistory();
      const mappedTransaction = transactionhistorys.map(mapTransactionHistoryApiToClient);
      setBusinessTransactions(mappedTransaction);
      //setItems(mappedProducts);
      //setFilteredItems(mappedTransaction);
      console.log('Fetched transaction history:', mappedTransaction);
    } catch (error) {
      console.error('Error fetching trainsaction history:', error);
      setErrorToDisplay(error.message || 'Failed to fetch transaction history');
    } finally {
      //setIsLoading(false);
    }
  }, []);

  const fetchCustomerInvoicesFromApi = useCallback(async () => {
    console.log('Fetching customer invoices from API /api/orders...');
    setIsLoadingCustomerInvoices(true);
    setErrorToDisplay(null); // Reset lỗi trước khi fetch
    try {
      // API getAllOrdersApi có thể nhận object { searchTerm }, nhưng ở đây ta tìm kiếm ở client
      // nên có thể gọi không cần searchTerm hoặc searchTerm rỗng.
      // Giả sử API của bạn cho phép không có searchTerm.
      const apiOrders = await getAllOrdersApi({ searchTerm: searchTermCustomer }); // Gửi searchTermCustomer nếu API hỗ trợ
      const mappedInvoices = apiOrders.map(mapApiOrderToCustomerInvoiceForDisplay);
      setCustomerInvoices(mappedInvoices);
      console.log('Fetched customer invoices:', mappedInvoices);
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
      setErrorToDisplay({message: error.message || 'Không thể tải danh sách hóa đơn khách hàng.'});
      setCustomerInvoices([]); // Reset nếu lỗi
    } finally {
      setIsLoadingCustomerInvoices(false);
    }
  }, []); // Fetch lại khi searchTermCustomer thay đổi nếu API hỗ trợ search

  useEffect(() => {
    //localStorage.setItem('th_businessTransactions_v2', JSON.stringify(businessTransactions));
    fetchEmployeesFromApi();
    fecthTransactionHistoryFromApi();
    fetchCustomerInvoicesFromApi();
  }, [fecthTransactionHistoryFromApi, fetchEmployeesFromApi, fetchCustomerInvoicesFromApi]);

  const handleAddBusinessTx = async (newTxDataFromModal) => {
    const dataToPassToParent = new FormData();
    dataToPassToParent.append("MAGIAODICH", newTxDataFromModal.MAGIAODICH);
    dataToPassToParent.append("LOAIGIAODICH", newTxDataFromModal.LOAIGIAODICH);
    dataToPassToParent.append("NGAYGIAODICH", newTxDataFromModal.NGAYGIAODICH);
    dataToPassToParent.append("MANV", newTxDataFromModal.MANV);
    dataToPassToParent.append("MOTA", newTxDataFromModal.MOTA);
    dataToPassToParent.append("SOTIEN", newTxDataFromModal.SOTIEN);
    dataToPassToParent.append("PHANLOAI", newTxDataFromModal.PHANLOAI);
    dataToPassToParent.append("MATHAMCHIEU", newTxDataFromModal.MATHAMCHIEU);
    //dataToPassToParent.append("HINHANH", newTxDataFromModal.HINHANH);
    if (newTxDataFromModal.imageFile && newTxDataFromModal.imageFile instanceof File) {
      dataToPassToParent.append('transactionImageFile', newTxDataFromModal.imageFile, newTxDataFromModal.imageFile.name);
      console.log('TransactionHistory: Appended imageFile to FormData with key "transactionImageFile":', newTxDataFromModal.imageFile.name);
    } else {
      console.log('TransactionHistory: No imageFile to append or not a File instance.');
      // Không cần append "HINHANH" là null ở đây, controller backend sẽ xử lý nếu không có file
    }
    try {
      const createdTransactionApi = await createTransactionHistory(dataToPassToParent);

      // Map lại kết quả từ API về client format (nếu cần)
      const newClientTransaction = mapTransactionHistoryApiToClient(createdTransactionApi);

      // Thêm vào state để UI cập nhật
      setBusinessTransactions(prevTxs => [newClientTransaction, ...prevTxs]);

      setSuccessMessage('Thêm giao dịch doanh nghiệp thành công!');
      setShowAddBusinessModal(false);

    } catch (error) {
      console.error("Error adding business transaction:", error);
      let errorMessage = "Không thể thêm giao dịch.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErrorToDisplay({ message: errorMessage }); // Đảm bảo errorToDisplay là object có key message
      // setShowAddBusinessModal(false); // Có thể giữ modal mở để người dùng sửa
    }
  };

  const handleUpdateBusinessTx = (updatedTx) => {
    setEditingBusinessTransaction(null);
  };

  const handleDeleteBusinessTx = (txId) => {
    if (window.confirm(`Bạn có chắc muốn xóa giao dịch ${txId}?`)) {
      setBusinessTransactions(prev => prev.filter(tx => tx.id !== txId));
    }
  };

  const getEmployeeNameDisplay = (employeeId) => {
    if (!employeesList || employeesList.length === 0) {
      // Nếu danh sách nhân viên chưa có hoặc rỗng, trả về ID hoặc 'N/A'
      return employeeId || 'N/A';
    }
    const employee = employeesList.find(emp => emp.id === employeeId);
    // Nếu tìm thấy nhân viên, trả về tên, ngược lại trả về ID hoặc 'N/A'
    return employee ? employee.name : (employeeId || 'N/A');
  };

  const filteredBusinessTxs = businessTransactions.filter(t =>
    Object.values(t).some(val => String(val).toLowerCase().includes(searchTermBusiness.toLowerCase()))
  );

  // --- State và logic cho Tab 2: Hóa đơn Khách hàng ---
  /* const [customerInvoices, setCustomerInvoices] = useState(() => {
    const saved = localStorage.getItem('th_customerInvoices_v2');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_INVOICES;
  });
  const [searchTermCustomer, setSearchTermCustomer] = useState('');
  const [viewingCustomerInvoice, setViewingCustomerInvoice] = useState(null);

  useEffect(() => {
    localStorage.setItem('th_customerInvoices_v2', JSON.stringify(customerInvoices));
  }, [customerInvoices]);

  const filteredCustomerInvoices = customerInvoices.filter(inv =>
    Object.values(inv).some(val => String(val).toLowerCase().includes(searchTermCustomer.toLowerCase()))
  ); */

  

  const filteredCustomerInvoices = customerInvoices.filter(inv =>
    Object.values(inv).some(val => String(val).toLowerCase().includes(searchTermCustomer.toLowerCase()))
  );

  const handleViewCustomerInvoiceDetail = (invoice) => {
    const employeeName = getEmployeeNameDisplay(invoice.employeeId);
    setViewingCustomerInvoice({ ...invoice, employeeName });
  };

  // --- Render ---
  return (
    <div className="page-container th-page"> {/* Thêm class th-page để có thể style riêng nếu cần */}
      <div className="content-card">
        <h1 className="page-title">Quản Lý Lịch Sử Giao Dịch</h1>

        <div className="main-tabs-nav">
          <button
            className={`tab-nav-button ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            Giao dịch Doanh nghiệp
          </button>
          <button
            className={`tab-nav-button ${activeTab === 'customerOrders' ? 'active' : ''}`}
            onClick={() => setActiveTab('customerOrders')}
          >
            Hóa đơn Khách hàng
          </button>
        </div>

        <div className="tab-content-area">
          {/* TAB 1: GIAO DỊCH DOANH NGHIỆP */}
          {activeTab === 'business' && (
            <>
              <div className="page-controls">
                <input
                  type="text"
                  placeholder="Tìm kiếm giao dịch doanh nghiệp..."
                  className="search-input"
                  value={searchTermBusiness}
                  onChange={(e) => setSearchTermBusiness(e.target.value)}
                />
                <button onClick={() => setShowAddBusinessModal(true)} className="btn-add-new">
                  + Thêm Giao Dịch
                </button>
              </div>
              {filteredBusinessTxs.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã GD</th><th>Ngày</th><th>Loại</th><th>Mô tả</th>
                      <th>Phân loại</th><th>Số tiền</th><th>Nhân viên</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBusinessTxs.map(t => (
                      <tr key={t.id}>
                        <td>{t.id}</td><td>{formatDate(t.date)}</td>
                        <td>{t.type === 'expense' ? 'Chi phí' : 'Thu nhập'}</td>
                        <td title={t.description} className="description-cell">{t.description}</td>
                        <td>{t.category}</td>
                        <td style={{ textAlign: 'right', color: t.type === 'expense' ? '#dc3545' : '#28a745' }}>
                          {t.type === 'expense' ? '-' : '+'} {formatCurrency(t.costs)}
                        </td>
                        <td>{getEmployeeNameDisplay(t.employeeId)}</td>
                        {/* <td>{t.invoiceImageName ? <a href="#" onClick={(e) => { e.preventDefault(); alert(`Xem ảnh: ${t.invoiceImageName}`) }} className="link-style">Xem</a> : 'Không có'}</td> */}
                        <td className="actions-cell">
                          <button onClick={() => setViewingBusinessTransaction(t)} className="action-button view-button">Xem</button>
                          {/* <button onClick={() => setEditingBusinessTransaction(t)} className="action-button edit-button">Sửa</button>
                          <button onClick={() => handleDeleteBusinessTx(t.id)} className="action-button delete-button">Xóa</button> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (<p className="no-data-message">Không có giao dịch nào của doanh nghiệp.</p>)}
            </>
          )}

          {/* TAB 2: HÓA ĐƠN KHÁCH HÀNG */}
          {activeTab === 'customerOrders' && (
            <>
              <div className="page-controls">
                <input
                  type="text"
                  placeholder="Tìm kiếm hóa đơn khách hàng..."
                  className="search-input"
                  value={searchTermCustomer}
                  onChange={(e) => setSearchTermCustomer(e.target.value)}
                />
                {/* Nút thêm hóa đơn khách hàng thường không có ở đây nếu tạo từ POS */}
              </div>
              {filteredCustomerInvoices.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã HĐ</th><th>Ngày tạo</th><th>Khách hàng</th><th>Nhân viên</th>
                      <th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomerInvoices.map(inv => (
                      <tr key={inv.id}>
                        <td>{inv.id}</td><td>{formatDate(inv.date, true)}</td>
                        {/* <td>{inv.customerName} {inv.customerId ? `(${inv.customerId})` : ''}</td> */}
                        <td>{inv.customerName}</td>
                        <td>{getEmployeeNameDisplay(inv.employeeId)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(inv.totalAmount)}</td>
                        <td><span className={`status-badge status-${inv.status.toLowerCase().replace(/\s+/g, '-')}`}>{inv.status}</span></td>
                        <td className="actions-cell">
                          <button onClick={() => setViewingCustomerInvoice(inv)} className="action-button view-button">Xem</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (<p className="no-data-message">Không có hóa đơn khách hàng nào.</p>)}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddBusinessModal && (
        <AddBusinessTransactionModal
          onClose={() => setShowAddBusinessModal(false)}
          onAddTransaction={handleAddBusinessTx}
          employeesList={employeesList}
          generateId={generateId}
        />
      )}
      {editingBusinessTransaction && (
        <EditBusinessTransactionModal
          transactionToEdit={editingBusinessTransaction}
          onUpdateTransaction={handleUpdateBusinessTx}
          employeesList={employeesList}
          onClose={() => setEditingBusinessTransaction(null)}
          formatDate={formatDate}
        />
      )}
      {viewingBusinessTransaction && (
        <BusinessTransactionDetailModal
          transaction={{
            ...viewingBusinessTransaction,
            employeeName: getEmployeeNameDisplay(viewingBusinessTransaction.employeeId),
            // invoiceImageName giờ đây có thể là tên file gốc (từ viewingBusinessTransaction.invoiceImageName)
            // invoiceImageNameUrl là URL đầy đủ (từ viewingBusinessTransaction.invoiceImageNameUrl)
          }}
          onClose={() => setViewingBusinessTransaction(null)}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}
      {viewingCustomerInvoice && (
        <CustomerInvoiceDetailModal
          invoice={viewingCustomerInvoice}
          onClose={() => setViewingCustomerInvoice(null)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      <SuccessMessageModal
        isOpen={!!successMessage} // Chỉ mở khi có thông báo thành công
        successMessage={successMessage}
        onClose={handleCloseSuccessModal} // Đóng modal khi nhấn nút
      />
      <ErrorMessageModal
        isOpen={!!errorToDisplay} // Chỉ mở khi có thông báo lỗi
        errorMessage={errorToDisplay}
        onClose={handleCloseErrorModal} // Đóng modal khi nhấn nút
      />
    </div>
  );
}

export default TransactionHistory;