import React, { useState, useEffect, useCallback } from 'react';

import Button from '../../../components/common/Button.jsx';

import './Employees.css';
import AddEmployeeModal from './AddEmployeeModal.jsx';
import EditEmployeeModal from './EditEmployeeModal.jsx';
import EmployeeDetailModal from './EmployeeDetailModal.jsx'; // Tùy chọn
import { getAllEmployeeApi, createEmployeeApi, updateEmployeeApi, deleteEmployeeApi } from '../../../services/employeeApiService.js';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal.jsx';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal.jsx';

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
  accountId: apiEmployee.MATK, // Mã tài khoản
  username: apiEmployee.TENDANGNHAP, // Tên đăng nhập
  password: apiEmployee.MATKHAU, // Mật khẩu text thuần từ API
  role: apiEmployee.ROLE_DANGNHAP, // Vai trò
  mockToken: apiEmployee.TOKEN_MOCK // Token cố định
});

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToView, setEmployeeToView] = useState(null);

  const [errorToDisplay, setErrorToDisplay] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // State for delete confirmation modal
  const [employeeForDeletion, setEmployeeForDeletion] = useState(null);

  const fetchEmployeesFromApi = useCallback(async () => { // useCallback here if it were passed as prop, but for internal use, it's fine.
    console.log('Fetching employees from API...');
    try {
      const employees_data = await getAllEmployeeApi();
      setEmployees(employees_data.map(mapEmployeeApiToClient));
    } catch (error) {
      console.error('Error fetching employees:', error);
      setErrorToDisplay(error.message || 'Failed to fetch employees');
    } finally {
      //setIsLoading(false);
    }
  }, []); // Empty dependency array assuming getAllEmployeeApi and mapEmployeeApiToClient are stable

  useEffect(() => {
    fetchEmployeesFromApi();
  }, [fetchEmployeesFromApi]);

  const handleAddEmployee = useCallback(async (newEmployeeDataFromForm) => {
    console.log('Adding new employee:', newEmployeeDataFromForm);
    setErrorToDisplay(null);
    setSuccessMessage(null);
    try {
      const newEmployeeWithAccount = await createEmployeeApi(newEmployeeDataFromForm);
      console.log('New employee and account created:', newEmployeeWithAccount);
      fetchEmployeesFromApi();
      setShowAddModal(false);
      setSuccessMessage(`Nhân viên ${newEmployeeWithAccount.TENNV} và tài khoản đã được tạo. Mật khẩu: ${newEmployeeWithAccount.MATKHAU}`);
    } catch (error) {
      console.error('Error adding new employee:', error);
      setErrorToDisplay(error.message || 'Không thể thêm nhân viên.');
    }
  }, [fetchEmployeesFromApi]);

  const handleUpdateEmployee = useCallback(async (employeeId, updatedData) => {
    console.log(`Updating employee ${employeeId}:`, updatedData);
    setErrorToDisplay(null);
    setSuccessMessage(null);
    try {
      const updatedEmployee = await updateEmployeeApi(employeeId, updatedData);
      setSuccessMessage(`Thông tin nhân viên ${updatedEmployee.TENNV || updatedEmployee.name} đã được cập nhật.`);
      fetchEmployeesFromApi();
      setShowEditModal(false);
      setEmployeeToEdit(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      setErrorToDisplay(error.message || 'Không thể cập nhật thông tin nhân viên.');
    }
  }, [fetchEmployeesFromApi]); // Removed 'employees' from dependencies

  // This function now opens the confirmation modal
  const handleDeleteEmployee = useCallback((employeeId, employeeName) => {
    setEmployeeForDeletion({ id: employeeId, name: employeeName });
  }, []); // No complex dependencies, only sets state

  // This function executes the delete after confirmation
  const executeConfirmedDelete = useCallback(async () => {
    if (!employeeForDeletion) return;

    setErrorToDisplay(null);
    setSuccessMessage(null);
    // setIsLoading(true); // Consider adding loading state management

    try {
      const result = await deleteEmployeeApi(employeeForDeletion.id);
      setSuccessMessage(result.message || `Nhân viên ${employeeForDeletion.name} (ID: ${employeeForDeletion.id}) đã được xóa thành công.`);
      fetchEmployeesFromApi();
    } catch (error) {
      console.error('Error deleting employee:', error);
      setErrorToDisplay(error.message || `Không thể xóa nhân viên ${employeeForDeletion.name}.`);
    } finally {
      // setIsLoading(false);
      setEmployeeForDeletion(null); // Close the modal
    }
  }, [employeeForDeletion, fetchEmployeesFromApi, setErrorToDisplay, setSuccessMessage]);

  // This function cancels the deletion and closes the modal
  const cancelDeletion = useCallback(() => {
    setEmployeeForDeletion(null);
  }, []);


  const openEditModal = (employee) => {
    setEmployeeToEdit(employee);
    setShowEditModal(true);
  };

  const openDetailModal = (employee) => {
    setEmployeeToView(employee);
    setShowDetailModal(true);
  };

  const handleCloseErrorModal = useCallback(() => {
    setErrorToDisplay(null);
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const filteredEmployees = employees.filter(employee =>
    (employee.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.id ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.position ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department ?? "").toLowerCase().includes(searchTerm.toLowerCase()) || // Note: department is not in mapEmployeeApiToClient
    (employee.email ?? "").toLowerCase().includes(searchTerm.toLowerCase())
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
              <th>Vị trí làm việc</th>
              <th>Giới tính</th>
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
                <td>{employee.sex}</td>
                <td>{employee.phone}</td>
                <td>{employee.email}</td>
                <td className="employee-actions">
                  <Button onClick={() => openDetailModal(employee)} className="btn-details">View</Button>
                  <Button onClick={() => openEditModal(employee)} className="btn-edit">Edit</Button>
                  {/* Updated onClick for delete button */}
                  <Button onClick={() => handleDeleteEmployee(employee.id, employee.name)} className="btn-delete">Delete</Button>
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

      {/* Modal Xác Nhận Xóa - UPDATED */}
      {employeeForDeletion && (
        <div className="modal-overlay confirmation-overlay" onClick={cancelDeletion}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa nhân viên "{employeeForDeletion.name}" (ID: {employeeForDeletion.id})?</p>
            <div className="confirmation-actions">
              <button onClick={cancelDeletion} className="cancel-btn">Không</button>
              <button onClick={executeConfirmedDelete} className="confirm-delete-btn">Xóa</button>
            </div>
          </div>
        </div>
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

      {showDetailModal && employeeToView && (
        <EmployeeDetailModal
          employee={employeeToView}
          onClose={() => {
            setShowDetailModal(false);
            setEmployeeToView(null);
          }}
        />
      )}

      <SuccessMessageModal
        isOpen={!!successMessage}
        onClose={handleCloseSuccessModal}
        successMessage={successMessage}
      />

      <ErrorMessageModal
        isOpen={!!errorToDisplay}
        onClose={handleCloseErrorModal}
        errorMessage={errorToDisplay}
      />
    </div>
  );
}

export default Employees;