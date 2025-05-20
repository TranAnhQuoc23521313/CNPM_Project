import React, { useState, useEffect } from 'react';

import Button from '../../../components/common/Button.jsx';

import './Employees.css';
import AddEmployeeModal from './AddEmployeeModal.jsx';
import EditEmployeeModal from './EditEmployeeModal.jsx';
import EmployeeDetailModal from './EmployeeDetailModal.jsx'; // Tùy chọn

// Dữ liệu mẫu ban đầu
const INITIAL_EMPLOYEES = [
  { id: 'NV001', name: 'Nguyễn Văn An', position: 'Nhân viên bán vé', department: 'Bán vé', phone: '0901234567', email: 'vana@cinema.com', startDate: '2023-01-15', salary: 7000000 },
  { id: 'NV002', name: 'Trần Thị Bình', position: 'Nhân viên soát vé', department: 'Soát vé', phone: '0907654321', email: 'thib@cinema.com', startDate: '2022-11-20', salary: 6500000 },
  { id: 'NV003', name: 'Lê Văn Cường', position: 'Quản lý ca', department: 'Quản lý', phone: '0912345678', email: 'vanc@cinema.com', startDate: '2021-05-10', salary: 12000000 },
];

const generateNewId = (employees) => {
  if (!employees || employees.length === 0) return 'NV001';
  const lastId = employees[employees.length - 1].id;
  const num = parseInt(lastId.replace('NV', ''), 10) + 1;
  return `NV${String(num).padStart(3, '0')}`;
};

function Employees() {
  const [employees, setEmployees] = useState(() => {
    const savedEmployees = localStorage.getItem('cinemaEmployeesData');
    return savedEmployees ? JSON.parse(savedEmployees) : INITIAL_EMPLOYEES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // Tùy chọn

  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToView, setEmployeeToView] = useState(null); // Tùy chọn

  useEffect(() => {
    localStorage.setItem('cinemaEmployeesData', JSON.stringify(employees));
  }, [employees]);

  const handleAddEmployee = (newEmployeeData) => {
    const newEmployeeWithId = {
      ...newEmployeeData,
      id: generateNewId(employees),
    };
    setEmployees(prevEmployees => [...prevEmployees, newEmployeeWithId]);
    setShowAddModal(false);
  };

  const handleUpdateEmployee = (updatedEmployeeData) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === updatedEmployeeData.id ? updatedEmployeeData : emp
      )
    );
    setShowEditModal(false);
    setEmployeeToEdit(null);
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên có ID: ${employeeId}?`)) {
      setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== employeeId));
    }
  };

  const openEditModal = (employee) => {
    setEmployeeToEdit(employee);
    setShowEditModal(true);
  };

  // Tùy chọn: cho EmployeeDetailModal
  const openDetailModal = (employee) => {
    setEmployeeToView(employee);
    setShowDetailModal(true);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employees-page-container">
      <h2>Quản Lý Nhân Viên</h2>

      <div className="employee-controls">
        <input
          type="text"
          placeholder="Tìm kiếm nhân viên (ID, tên, chức vụ, email...)"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setShowAddModal(true)} className="btn-add-employee">
          + Add Staff
        </button>
      </div>

      {filteredEmployees.length > 0 ? (
        <table className="employee-list-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ và Tên</th>
              <th>Chức Vụ</th>
              <th>Bộ Phận</th>
              <th>Điện Thoại</th>
              <th>Email</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>{employee.name}</td>
                <td>{employee.position}</td>
                <td>{employee.department}</td>
                <td>{employee.phone}</td>
                <td>{employee.email}</td>
                <td className="employee-actions">
                  <Button onClick={() => openDetailModal(employee)} className="btn-details">View</Button>
                  <Button onClick={() => openEditModal(employee)} className="btn-edit">Edit</Button>
                  <Button onClick={() => handleDeleteEmployee(employee.id)} className="btn-delete">Delete</Button>
                  {/* Tùy chọn: Nút xem chi tiết */}
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-employees-message">
          {searchTerm ? "Không tìm thấy nhân viên phù hợp." : "Chưa có nhân viên nào."}
        </p>
      )}

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onAddEmployee={handleAddEmployee}
        />
      )}

      {showEditModal && employeeToEdit && (
        <EditEmployeeModal
          employeeData={employeeToEdit}
          onClose={() => {
            setShowEditModal(false);
            setEmployeeToEdit(null);
          }}
          onUpdateEmployee={handleUpdateEmployee}
        />
      )}

      {/* Tùy chọn: EmployeeDetailModal */}
      {showDetailModal && employeeToView && (
        <EmployeeDetailModal
          employee={employeeToView}
          onClose={() => {
            setShowDetailModal(false);
            setEmployeeToView(null);
          }}
        />
      )}
    </div>
  );
}

export default Employees;