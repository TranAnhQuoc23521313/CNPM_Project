import React, { useState, useEffect, useCallback } from 'react';

import Button from '../../../components/common/Button.jsx';

import './Employees.css';
import AddEmployeeModal from './AddEmployeeModal.jsx';
import EditEmployeeModal from './EditEmployeeModal.jsx';
import EmployeeDetailModal from './EmployeeDetailModal.jsx'; // Tùy chọn
import { getAllEmployeeApi, createEmployeeApi, updateEmployeeApi, deleteEmployeeApi } from '../../../services/employeeApiService.js';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal.jsx';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal.jsx';

// Dữ liệu mẫu ban đầu
/* const INITIAL_EMPLOYEES = [
  { id: 'NV001', name: 'Nguyễn Văn An', position: 'Nhân viên bán vé', department: 'Bán vé', phone: '0901234567', email: 'vana@cinema.com', startDate: '2023-01-15', salary: 7000000 },
  { id: 'NV002', name: 'Trần Thị Bình', position: 'Nhân viên soát vé', department: 'Soát vé', phone: '0907654321', email: 'thib@cinema.com', startDate: '2022-11-20', salary: 6500000 },
  { id: 'NV003', name: 'Lê Văn Cường', position: 'Quản lý ca', department: 'Quản lý', phone: '0912345678', email: 'vanc@cinema.com', startDate: '2021-05-10', salary: 12000000 },
]; */

/* const generateNewId = (employees) => {
  if (!employees || employees.length === 0) return 'NV001';
  const lastId = employees[employees.length - 1].id;
  const num = parseInt(lastId.replace('NV', ''), 10) + 1;
  return `NV${String(num).padStart(3, '0')}`;
}; */

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
})

const Employees = () => {
  const [employees, setEmployees] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // Tùy chọn

  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToView, setEmployeeToView] = useState(null); // Tùy chọn

  const [errorToDisplay, setErrorToDisplay] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchEmployeesFromApi = async () => {
    console.log('Fetching products from API...');
    try {
      const employees_data = await getAllEmployeeApi();
      setEmployees(employees_data.map(mapEmployeeApiToClient));
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorToDisplay(error.message || 'Failed to fetch products');
    } finally {
      //setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployeesFromApi();
  }, []);

  const handleAddEmployee = useCallback(async (newEmployeeDataFromForm) => {
    console.log('Adding new employee:', newEmployeeDataFromForm);
    setErrorToDisplay(null);
    setSuccessMessage(null);
    // Giả sử newEmployeeDataFromForm là object JSON từ AddEmployeeModal
    try {
      const newEmployeeWithAccount = await createEmployeeApi(newEmployeeDataFromForm);
      console.log('New employee and account created:', newEmployeeWithAccount);
      // Xử lý sau khi tạo thành công:
      fetchEmployeesFromApi(); // Tải lại toàn bộ danh sách để có dữ liệu mới nhất
      setShowAddModal(false); // Đóng modal thêm
      setSuccessMessage(`Nhân viên ${newEmployeeWithAccount.TENNV} và tài khoản đã được tạo. Mật khẩu: ${newEmployeeWithAccount.MATKHAU}`);
      // Hoặc bạn có thể chỉ thêm nhân viên mới vào state employees nếu API trả về đúng định dạng
      // setEmployees(prev => [mapEmployeeApiToClient(newEmployeeWithAccount), ...prev]);
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
      
      // Cập nhật lại danh sách nhân viên trong state
      // Cách 1: Fetch lại toàn bộ (đơn giản nhất)
      fetchEmployeesFromApi();
      
      // Cách 2: Cập nhật trực tiếp trong state (nếu API trả về đối tượng đầy đủ)
      // setEmployees(prevEmployees =>
      //   prevEmployees.map(emp =>
      //     emp.id === employeeId ? mapEmployeeApiToClient(updatedEmployee) : emp
      //   )
      // );

      setShowEditModal(false);
      setEmployeeToEdit(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      setErrorToDisplay(error.message || 'Không thể cập nhật thông tin nhân viên.');
    } finally {
      //setIsLoading(false);
    }
  }, [employees, fetchEmployeesFromApi]); // Bổ sung dependencies

  const handleDeleteEmployee = useCallback(async (employeeId, employeeName) => { // Thêm employeeName để hiển thị trong confirm
    // Hiện thông báo xác nhận trước khi xóa
    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn nhân viên "${employeeName}" (ID: ${employeeId})? Hành động này không thể hoàn tác.`)) {
      setErrorToDisplay(null);
      setSuccessMessage(null);
      //setIsLoading(true);
      try {
        const result = await deleteEmployeeApi(employeeId); // Gọi API xóa
        setSuccessMessage(result.message || `Nhân viên ${employeeName} (ID: ${employeeId}) đã được xóa thành công.`);
        
        // Cập nhật UI: Xóa nhân viên khỏi state 'employees'
        // setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== employeeId));
        // Hoặc tốt hơn là fetch lại toàn bộ danh sách:
        fetchEmployeesFromApi();

      } catch (error) {
        console.error('Error deleting employee:', error);
        setErrorToDisplay(error.message || `Không thể xóa nhân viên ${employeeName}.`);
      } finally {
        //setIsLoading(false);
      }
    }
  }, [fetchEmployeesFromApi, setErrorToDisplay, setSuccessMessage]); // Bổ sung dependencies

  const openEditModal = (employee) => {
    setEmployeeToEdit(employee);
    setShowEditModal(true);
  };

  // Tùy chọn: cho EmployeeDetailModal
  const openDetailModal = (employees) => {
    setEmployeeToView(employees);
    setShowDetailModal(true);
  };

  // Error Modal
  const handleCloseErrorModal = useCallback(() => {
    setErrorToDisplay(null);
  }, []);

  // Success Modal
  const handleCloseSuccessModal = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const filteredEmployees = employees.filter(employee =>
    (employee.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.id ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.position ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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