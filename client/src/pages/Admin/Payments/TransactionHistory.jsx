import React, { useState, useEffect } from 'react';
import './TransactionHistory.css'; // CSS chính cho trang

// Import Modals
import AddBusinessTransactionModal from './AddBusinessTransactionModal.jsx';
import EditBusinessTransactionModal from './EditBusinessTransactionModal.jsx';     // Tùy chọn
import BusinessTransactionDetailModal from './BusinessTransactionDetailModal.jsx'; // Tùy chọn
import CustomerInvoiceDetailModal from './CustomerInvoiceDetailModal.jsx';

// Helper functions
const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        if (includeTime) { options.hour = '2-digit'; options.minute = '2-digit';}
        return date.toLocaleDateString('vi-VN', options);
    } catch (e) { return 'N/A'; }
};
const generateId = (prefix = 'TRX') => `${prefix}-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

// Dữ liệu mẫu
const MOCK_EMPLOYEES = [
  { id: 'NV001', name: 'Nguyễn Văn An' }, { id: 'NV002', name: 'Trần Thị Bình' }, { id: 'NV003', name: 'Lê Văn Cường' },
];

const INITIAL_BUSINESS_TRANSACTIONS = [
  { id: generateId('DN'), date: '2023-11-01', type: 'expense', description: 'Chi phí tiền điện tháng 10', amount: 5500000, category: 'Vận hành', employeeId: 'NV003', employeeName: 'Lê Văn Cường', referenceId: 'HD-DIEN-1023', invoiceImageName: null },
  { id: generateId('DN'), date: '2023-11-05', type: 'income', description: 'Thu từ cho thuê mặt bằng quảng cáo', amount: 10000000, category: 'Thu khác', employeeId: 'NV003', employeeName: 'Lê Văn Cường', referenceId: 'HD-QC-1123', invoiceImageName: 'qc_invoice.jpg' },
];

const INITIAL_CUSTOMER_INVOICES = [
  { id: 'HD00123', date: '2023-11-15T10:30:00Z', customerName: 'Nguyễn Văn A', customerId: 'KH001', employeeName: 'Trần Thị Bình', totalAmount: 250000, items: '2 vé John Wick, 1 Bắp rang bơ', paymentMethod: 'Tiền mặt', status: 'Đã thanh toán' },
  { id: 'HD00124', date: '2023-11-15T11:45:00Z', customerName: 'Lê Thị C (vãng lai)', customerId: null, employeeName: 'Trần Thị Bình', totalAmount: 180000, items: '2 vé Phim hoạt hình, 1 Nước ngọt', paymentMethod: 'Chuyển khoản', status: 'Đã thanh toán' },
];


function TransactionHistory() {
  const [activeTab, setActiveTab] = useState('business'); // 'business' or 'customerOrders'

  // --- State và logic cho Tab 1: Giao dịch Doanh nghiệp ---
  const [businessTransactions, setBusinessTransactions] = useState(() => {
    const saved = localStorage.getItem('th_businessTransactions_v2');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_TRANSACTIONS;
  });
  const [searchTermBusiness, setSearchTermBusiness] = useState('');
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [editingBusinessTransaction, setEditingBusinessTransaction] = useState(null);     // For Edit Modal
  const [viewingBusinessTransaction, setViewingBusinessTransaction] = useState(null); // For Detail Modal

  useEffect(() => {
    localStorage.setItem('th_businessTransactions_v2', JSON.stringify(businessTransactions));
  }, [businessTransactions]);

  const handleAddBusinessTx = (newTx) => {
    setBusinessTransactions(prev => [
      { ...newTx, 
        id: newTx.transactionCode || generateId('DN'), 
        employeeName: MOCK_EMPLOYEES.find(e => e.id === newTx.employeeId)?.name || newTx.employeeId
      }, 
      ...prev
    ]);
    setShowAddBusinessModal(false);
  };

  const handleUpdateBusinessTx = (updatedTx) => {
    setBusinessTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? 
        {...updatedTx, employeeName: MOCK_EMPLOYEES.find(e => e.id === updatedTx.employeeId)?.name || updatedTx.employeeId} 
        : tx
    ));
    setEditingBusinessTransaction(null);
  };

  const handleDeleteBusinessTx = (txId) => {
    if (window.confirm(`Bạn có chắc muốn xóa giao dịch ${txId}?`)) {
      setBusinessTransactions(prev => prev.filter(tx => tx.id !== txId));
    }
  };

  const filteredBusinessTxs = businessTransactions.filter(t =>
    Object.values(t).some(val => String(val).toLowerCase().includes(searchTermBusiness.toLowerCase()))
  );

  // --- State và logic cho Tab 2: Hóa đơn Khách hàng ---
  const [customerInvoices, setCustomerInvoices] = useState(() => {
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
  );

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
                      <th>Phân loại</th><th>Số tiền</th><th>Nhân viên</th><th>Ảnh HĐ</th>
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
                        <td style={{textAlign: 'right', color: t.type === 'expense' ? '#dc3545' : '#28a745'}}>
                            {t.type === 'expense' ? '-' : '+'} {formatCurrency(t.amount)}
                        </td>
                        <td>{t.employeeName}</td>
                        <td>{t.invoiceImageName ? <a href="#" onClick={(e) => {e.preventDefault(); alert(`Xem ảnh: ${t.invoiceImageName}`)}} className="link-style">Xem</a> : 'Không có'}</td>
                        <td className="actions-cell">
                            <button onClick={() => setViewingBusinessTransaction(t)} className="action-button view-button">Xem</button>
                            <button onClick={() => setEditingBusinessTransaction(t)} className="action-button edit-button">Sửa</button>
                            <button onClick={() => handleDeleteBusinessTx(t.id)} className="action-button delete-button">Xóa</button>
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
                        <td>{inv.customerName} {inv.customerId ? `(${inv.customerId})` : ''}</td>
                        <td>{inv.employeeName}</td>
                        <td style={{textAlign: 'right'}}>{formatCurrency(inv.totalAmount)}</td>
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
          employeesList={MOCK_EMPLOYEES}
          generateId={generateId}
        />
      )}
      {editingBusinessTransaction && (
        <EditBusinessTransactionModal
          transactionToEdit={editingBusinessTransaction}
          onUpdateTransaction={handleUpdateBusinessTx}
          employeesList={MOCK_EMPLOYEES}
          onClose={() => setEditingBusinessTransaction(null)}
          formatDate={formatDate}
        />
      )}
      {viewingBusinessTransaction && (
        <BusinessTransactionDetailModal
          transaction={viewingBusinessTransaction}
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
    </div>
  );
}

export default TransactionHistory;