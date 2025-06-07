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
import { getAllOrdersApi } from '../../../services/orderApiService';


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
  let itemsDescription = 'N/A';
  if (apiOrder.Phim?.TENPHIM && apiOrder.SuatChieu?.PhongChieu?.TENPHONG) {
    itemsDescription = `${apiOrder.Phim.TENPHIM} (Phòng: ${apiOrder.SuatChieu.PhongChieu.TENPHONG})`;
  } else if (apiOrder.Phim?.TENPHIM) {
    itemsDescription = apiOrder.Phim.TENPHIM;
  }

  return {
    id: apiOrder.MAHOADON,
    date: apiOrder.NGAYTAOHD,
    customerName: apiOrder.KhachHang?.HOTEN || 'Khách vãng lai',
    customerId: apiOrder.MAKH || null,
    employeeId: apiOrder.MANV,
    employeeName: apiOrder.MANV,
    totalAmount: apiOrder.TONGTIEN,
    items: itemsDescription,
    paymentMethod: apiOrder.HINHTHUCTHANHTOAN,
    status: apiOrder.TRANGTHAITHANHTOAN,
    apiOrderData: apiOrder
  };
};

const generateId = (prefix = 'TRX') => `${prefix}-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

function TransactionHistory() {
  const [activeTab, setActiveTab] = useState('business');

  const [businessTransactions, setBusinessTransactions] = useState([]);
  const [searchTermBusiness, setSearchTermBusiness] = useState('');
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [editingBusinessTransaction, setEditingBusinessTransaction] = useState(null);
  const [viewingBusinessTransaction, setViewingBusinessTransaction] = useState(null);

  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [searchTermCustomer, setSearchTermCustomer] = useState('');
  const [viewingCustomerInvoice, setViewingCustomerInvoice] = useState(null);
  const [isLoadingCustomerInvoices, setIsLoadingCustomerInvoices] = useState(false);

  const [employeesList, setEmployeesList] = useState([]); // Khởi tạo mảng rỗng để tránh lỗi

  const [errorToDisplay, setErrorToDisplay] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleCloseErrorModal = useCallback(() => setErrorToDisplay(null), []);
  const handleCloseSuccessModal = useCallback(() => setSuccessMessage(null), []);

  const fetchEmployeesFromApi = useCallback(async () => {
    console.log('TransactionHistoryPage: Attempting to fetch employees ...');
    try {
      const apiEmployee = await getAllEmployeeApi();
      setEmployeesList(apiEmployee.map(mapEmployeeApiToClient));
      console.log('TransactionHistoryPage: Fetch Employees successful');
    } catch (error) {
      console.error('TransactionHistoryPage: Error fetching employees:', error);
      // <<< SỬA LỖI: Gán chuỗi thông báo lỗi, không phải object lỗi
      setErrorToDisplay(error.message || 'Không thể tải danh sách nhân viên.');
    }
  }, []);

  const fecthTransactionHistoryFromApi = useCallback(async () => {
    console.log('Fetching business transactions from API...');
    try {
      const transactionhistorys = await getAllTransactionHistory();
      const mappedTransaction = transactionhistorys.map(mapTransactionHistoryApiToClient);
      setBusinessTransactions(mappedTransaction);
      console.log('Fetched transaction history:', mappedTransaction);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      // <<< SỬA LỖI: Gán chuỗi thông báo lỗi, không phải object lỗi
      setErrorToDisplay(error.message || 'Không thể tải lịch sử giao dịch doanh nghiệp.');
    }
  }, []);

  const fetchCustomerInvoicesFromApi = useCallback(async () => {
    console.log('Fetching customer invoices from API /api/orders...');
    setIsLoadingCustomerInvoices(true);
    setErrorToDisplay(null);
    try {
      const apiOrders = await getAllOrdersApi({ searchTerm: searchTermCustomer });
      const mappedInvoices = apiOrders.map(mapApiOrderToCustomerInvoiceForDisplay);
      setCustomerInvoices(mappedInvoices);
      console.log('Fetched customer invoices:', mappedInvoices);
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
      // <<< SỬA LỖI: Gán chuỗi thông báo lỗi, không phải object lỗi
      setErrorToDisplay(error.message || 'Không thể tải danh sách hóa đơn khách hàng.');
      setCustomerInvoices([]);
    } finally {
      setIsLoadingCustomerInvoices(false);
    }
  }, [searchTermCustomer]); // Thêm searchTermCustomer vào dependencies

  useEffect(() => {
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

    if (newTxDataFromModal.imageFile && newTxDataFromModal.imageFile instanceof File) {
      dataToPassToParent.append('transactionImageFile', newTxDataFromModal.imageFile, newTxDataFromModal.imageFile.name);
      console.log('TransactionHistory: Appended imageFile to FormData with key "transactionImageFile":', newTxDataFromModal.imageFile.name);
    } else {
      console.log('TransactionHistory: No imageFile to append or not a File instance.');
    }
    
    try {
      const createdTransactionApi = await createTransactionHistory(dataToPassToParent);
      const newClientTransaction = mapTransactionHistoryApiToClient(createdTransactionApi);
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
      // <<< SỬA LỖI: Gán trực tiếp chuỗi `errorMessage`, không phải object `{ message: ... }`
      setErrorToDisplay(errorMessage);
      // Giữ modal mở để người dùng sửa lại thông tin
    }
  };


  const getEmployeeNameDisplay = (employeeId) => {
    if (!employeesList || employeesList.length === 0) return employeeId || 'N/A';
    const employee = employeesList.find(emp => emp.id === employeeId);
    return employee ? employee.name : (employeeId || 'N/A');
  };

  const filteredBusinessTxs = businessTransactions.filter(t =>
    Object.values(t).some(val => String(val).toLowerCase().includes(searchTermBusiness.toLowerCase()))
  );

  const filteredCustomerInvoices = customerInvoices.filter(inv =>
    Object.entries(inv).some(([key, val]) => 
      key !== 'apiOrderData' && String(val).toLowerCase().includes(searchTermCustomer.toLowerCase())
    )
  );
  
  const handleViewCustomerInvoiceDetail = (invoice) => {
    const employeeName = getEmployeeNameDisplay(invoice.employeeId);
    setViewingCustomerInvoice({ ...invoice, employeeName });
  };

  return (
    <div className="page-container th-page">
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
                        <td className="actions-cell">
                          <button onClick={() => setViewingBusinessTransaction(t)} className="action-button view-button">Xem</button>
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
                        <td>{inv.customerName}</td>
                        <td>{getEmployeeNameDisplay(inv.employeeId)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(inv.totalAmount)}</td>
                        <td><span className={`status-badge status-${inv.status.toLowerCase().replace(/\s+/g, '-')}`}>{inv.status}</span></td>
                        <td className="actions-cell">
                          <button onClick={() => handleViewCustomerInvoiceDetail(inv)} className="action-button view-button">Xem</button>
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
        />
      )}
      {editingBusinessTransaction && (
        <EditBusinessTransactionModal
          transactionToEdit={editingBusinessTransaction}
          onUpdateTransaction={() => {}} // Placeholder
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
        isOpen={!!successMessage}
        successMessage={successMessage}
        onClose={handleCloseSuccessModal}
      />
      <ErrorMessageModal
        isOpen={!!errorToDisplay}
        errorMessage={errorToDisplay} // Bây giờ errorToDisplay là một chuỗi, nên sẽ hoạt động đúng
        onClose={handleCloseErrorModal}
      />
    </div>
  );
}

export default TransactionHistory;