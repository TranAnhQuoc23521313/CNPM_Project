import React, { useState, useEffect } from 'react';

import Button from '../../components/common/Button.jsx'; // Assuming this is your common Button

import './Customers.css'; // New CSS file for customers
import AddCustomerModal from './AddCustomerModal.jsx';
import EditCustomerModal from './EditCustomerModal.jsx';
import CustomerDetailModal from './CustomerDetailModal.jsx';

// Initial sample data for customers
const INITIAL_CUSTOMERS = [
  { id: 'KH001', name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', phone: '0901234567', membershipTier: 'Vàng', joinDate: '2023-01-15' },
  { id: 'KH002', name: 'Trần Thị Bình', email: 'binh.tran@example.com', phone: '0907654321', membershipTier: 'Bạc', joinDate: '2023-03-22' },
  { id: 'KH003', name: 'Lê Văn Cường', email: 'cuong.le@example.com', phone: '0912345678', membershipTier: 'Đồng', joinDate: '2022-11-10' },
  { id: 'KH004', name: 'Phạm Thị Dung', email: 'dung.pham@example.com', phone: '0987654321', membershipTier: 'Bạch Kim', joinDate: '2023-05-01' },
];

const generateNewCustomerId = (customers) => {
  if (!customers || customers.length === 0) return 'KH001';
  // Ensure sorting or finding max ID correctly if IDs are not sequential or added out of order
  const maxIdNum = customers.reduce((max, cust) => {
    const num = parseInt(cust.id.replace('KH', ''), 10);
    return num > max ? num : max;
  }, 0);
  return `KH${String(maxIdNum + 1).padStart(3, '0')}`;
};

function Customers() {
  const [customers, setCustomers] = useState(() => {
    const savedCustomers = localStorage.getItem('cinemaCustomersData');
    return savedCustomers ? JSON.parse(savedCustomers) : INITIAL_CUSTOMERS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [customerToView, setCustomerToView] = useState(null);

  useEffect(() => {
    localStorage.setItem('cinemaCustomersData', JSON.stringify(customers));
  }, [customers]);

  const handleAddCustomer = (newCustomerData) => {
    const newCustomerWithId = {
      ...newCustomerData,
      id: generateNewCustomerId(customers),
      // joinDate is already handled in AddCustomerModal or passed in newCustomerData
    };
    setCustomers(prevCustomers => [...prevCustomers, newCustomerWithId]);
    setShowAddModal(false);
  };

  const handleUpdateCustomer = (updatedCustomerData) => {
    setCustomers(prevCustomers =>
      prevCustomers.map(cust =>
        cust.id === updatedCustomerData.id ? updatedCustomerData : cust
      )
    );
    setShowEditModal(false);
    setCustomerToEdit(null);
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng có ID: ${customerId}?`)) {
      setCustomers(prevCustomers => prevCustomers.filter(cust => cust.id !== customerId));
    }
  };

  const openEditModal = (customer) => {
    setCustomerToEdit(customer);
    setShowEditModal(true);
  };

  const openDetailModal = (customer) => {
    setCustomerToView(customer);
    setShowDetailModal(true);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) || // Phone search might not need toLowerCase
    customer.membershipTier.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Helper to format date string to dd/MM/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // Assuming dateString is YYYY-MM-DD from date input
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        // Fallback for other date formats if necessary
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('vi-VN');
    }
  };


  return (
    <div className="customers-page-container"> {/* Matches employees-page-container */}
      <h2>Quản Lý Khách Hàng</h2>

      <div className="customer-controls"> {/* Matches employee-controls */}
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng (ID, tên, email, SĐT...)"
          className="search-input" // Same class as in employee
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Using a standard button element to match Employees.jsx */}
        <button onClick={() => setShowAddModal(true)} className="btn-add-customer">
          + Add Customer
        </button>
      </div>

      {filteredCustomers.length > 0 ? (
        <table className="customer-list-table"> {/* Matches employee-list-table */}
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
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.membershipTier}</td>
                <td>{formatDate(customer.joinDate)}</td>
                <td className="customer-actions"> {/* Matches employee-actions */}
                  <Button onClick={() => openDetailModal(customer)} className="btn-details">View</Button>
                  <Button onClick={() => openEditModal(customer)} className="btn-edit">Edit</Button>
                  <Button onClick={() => handleDeleteCustomer(customer.id)} className="btn-delete">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-customers-message"> {/* Matches no-employees-message */}
          {searchTerm ? "Không tìm thấy khách hàng phù hợp." : "Chưa có khách hàng nào."}
        </p>
      )}

      {showAddModal && (
        <AddCustomerModal
          // isOpen prop is handled by the common Modal component internally
          onClose={() => setShowAddModal(false)}
          // Use onSave as defined in AddCustomerModal from previous step
          // Or rename onSave to onAddCustomer in AddCustomerModal
          onSave={handleAddCustomer} 
        />
      )}

      {showEditModal && customerToEdit && (
        <EditCustomerModal
          customerData={customerToEdit}
          onClose={() => {
            setShowEditModal(false);
            setCustomerToEdit(null);
          }}
          // Use onSave as defined in EditCustomerModal from previous step
          // Or rename onSave to onUpdateCustomer in EditCustomerModal
          onSave={handleUpdateCustomer}
        />
      )}

      {showDetailModal && customerToView && (
        <CustomerDetailModal
          customerData={customerToView} // Pass data as customerData
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