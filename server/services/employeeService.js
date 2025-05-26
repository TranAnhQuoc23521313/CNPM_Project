const EmployeeRepository = require('../repositories/employeeRepository');
const AccountService = require('./accountService');
const AccountRepository = require('../repositories/accountRepository'); // << THÊM DÒNG NÀY NẾU CHƯA CÓ

class EmployeeService {
    async getAllEmployee() {
        try {
            return await EmployeeRepository.findAll();
        } catch (error) {
            console.error('Error in EmployeeService.getAllEmployee:', error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }

    async getEmployeeById(EmployeeID) {
        try {
            return await EmployeeRepository.findById(EmployeeID);
        } catch (error) {
            console.log('Error in EmployeeService.getEmployeeById:', error);
            throw error;
        }
    }

    async createEmployee(EmployeeDataFromController) {
        console.log('EmployeeService: Attempting to create employee with data:', EmployeeDataFromController);
         const {
            TENNV, VITRI, SDT, EMAIL, NGAYSINH, NGAYLAM, GIOITINH, DIACHI, LUONG,
            TENDANGNHAP // << KHAI BÁO TENDANGNHAP Ở ĐÂY
        } = EmployeeDataFromController;
        try {
            const detailsToCheck = { TENNV, VITRI, SDT, EMAIL, NGAYSINH, NGAYLAM, GIOITINH, DIACHI, LUONG };

            const checkDuplicated = await EmployeeRepository.findExactDuplicate(detailsToCheck);
            if (checkDuplicated) {
                const error = new Error('An identical employee (based on its details) already exists.');
                error.statusCode = 409; // Conflict
                throw error;
            }
            
            const newEmployee = await EmployeeRepository.create(EmployeeDataFromController);

            let createdAccountInfo = null;
            if (newEmployee && newEmployee.MANV && TENDANGNHAP) {
                console.log(`EmployeeService: Employee ${newEmployee.MANV} created. Proceeding to create account for username: ${TENDANGNHAP}`);
                try {
                    let ROLE_DANGNHAP = 'staff';
                    if (VITRI && (VITRI.toLowerCase().includes('quản lý'))) {
                        ROLE_DANGNHAP = 'admin';
                    }

                    const accountDetailsForService = {
                        MANV: newEmployee.MANV,
                        TENDANGNHAP: TENDANGNHAP,
                        ROLE_DANGNHAP
                    };
                    // AccountService.createAccountForEmployee sẽ cần được gọi mà không có 'connection'
                    // nếu nó tự quản lý connection riêng hoặc bạn chấp nhận không có transaction.
                    // Hoặc, AccountService phải có khả năng hoạt động với hoặc không với connection từ bên ngoài.
                    // Đây là điểm phức tạp nếu không có transaction chung.
                    // Giả sử AccountService.createAccountForEmployee có thể chạy độc lập:
                    createdAccountInfo = await AccountService.createAccountForEmployee(accountDetailsForService, null); // Truyền null cho connection

                } catch (accountError) {
                    console.error(`EmployeeService: Failed to create account for employee ${newEmployee.MANV} after employee creation. Error:`, accountError);
                    // QUAN TRỌNG: Ở đây bạn có nhân viên đã được tạo nhưng tài khoản thì không.
                    // Bạn cần quyết định:
                    // 1. Ném lỗi và thông báo cho client biết (nhân viên tạo thành công, tài khoản lỗi).
                    // 2. (Phức tạp hơn) Cố gắng xóa nhân viên vừa tạo (rollback thủ công). Cách này không khuyến khích.
                    // Tốt nhất là ném lỗi rõ ràng.
                    const error = new Error(`Employee created (MANV: ${newEmployee.MANV}), but account creation failed: ${accountError.message}`);
                    error.statusCode = accountError.statusCode || 500;
                    error.employeeCreated = newEmployee; // Có thể đính kèm thông tin NV đã tạo
                    throw error;
                }
            } else if (TENDANGNHAP) {
                // Trường hợp newEmployee không được tạo thành công nhưng có TENDANGNHAP
                console.warn("EmployeeService: Employee creation failed, skipping account creation.");
            }


            // 5. Gộp kết quả trả về
            // newEmployee chỉ có thông tin NV. createdAccountInfo có thông tin TK (bao gồm mật khẩu)
            if (createdAccountInfo) {
                return {
                    ...newEmployee,
                    MATK: createdAccountInfo.MATK,
                    TENDANGNHAP: createdAccountInfo.TENDANGNHAP,
                    MATKHAU: createdAccountInfo.RAW_PASSWORD_FOR_CLIENT,
                    ROLE_DANGNHAP: createdAccountInfo.ROLE_DANGNHAP,
                    TOKEN_MOCK: createdAccountInfo.TOKEN_MOCK,
                    message: "Employee and Account created. Password and Token generated."
                };
            } else {
                // Trường hợp chỉ tạo nhân viên (ví dụ không có TENDANGNHAP được gửi lên)
                return {
                     ...newEmployee,
                     message: "Employee created successfully. Account not created (e.g. username not provided)."
                };
            }

           // return newEmployee;
        } catch (error) {
            console.error('Error in EmployeeService.createEmployee:', error);
            // Xử lý thêm nếu lỗi là do trùng MASP (dù hiếm)
            if (error.message && error.message.toLowerCase().includes('duplicate entry')) {
                error.statusCode = 409;
            }
            throw error;
        }
    } 

    async updateEmployeeAndOptionalPassword(employeeId, updateData) {
        console.log(`EmployeeService: Updating employee ${employeeId}`);
        try {

            const currentEmployee = await EmployeeRepository.findById(employeeId);
            if (!currentEmployee) {
                const error = new Error('Employee not found for update.');
                error.statusCode = 404;
                throw error;
            }

            const { MATKHAU_MOI, ...employeeDetailsToUpdate } = updateData;
            // employeeDetailsToUpdate giờ chứa các trường như TENNV, VITRI (mới), SDT, ...

            // 1. Cập nhật thông tin nhân viên trong bảng NHANVIEN
            await EmployeeRepository.update(employeeId, employeeDetailsToUpdate);

            // 2. Kiểm tra xem VITRI có thay đổi không và cập nhật ROLE_DANGNHAP nếu cần
            // Chỉ cập nhật role nếu nhân viên có tài khoản (currentEmployee.TENDANGNHAP)
            // và VITRI mới được cung cấp trong updateData
            let roleUpdateMessage = "";
            if (currentEmployee.TENDANGNHAP && employeeDetailsToUpdate.VITRI !== undefined && employeeDetailsToUpdate.VITRI !== currentEmployee.VITRI) {
                console.log(`EmployeeService: Position changed for MANV ${employeeId}. Old: ${currentEmployee.VITRI}, New: ${employeeDetailsToUpdate.VITRI}. Updating role.`);
                let newRoleBasedOnPosition = 'staff'; // Mặc định
                if (employeeDetailsToUpdate.VITRI && (employeeDetailsToUpdate.VITRI.toLowerCase().includes('quản lý') || employeeDetailsToUpdate.VITRI.toLowerCase().includes('manager'))) {
                    newRoleBasedOnPosition = 'admin';
                }

                // Chỉ cập nhật nếu role mới khác role cũ trong DB (currentEmployee.ROLE_DANGNHAP)
                if (newRoleBasedOnPosition !== currentEmployee.ROLE_DANGNHAP) {
                    await AccountService.updateRoleByManv(employeeId, newRoleBasedOnPosition);
                    roleUpdateMessage = " Role updated based on new position.";
                } else {
                    console.log(`EmployeeService: New role (${newRoleBasedOnPosition}) is the same as current role (${currentEmployee.ROLE_DANGNHAP}). No role update needed.`);
                }
            }


            // 3. Nếu có MATKHAU_MOI, cập nhật mật khẩu
            let passwordUpdateMessage = "";
            if (MATKHAU_MOI && MATKHAU_MOI.trim() !== '' && currentEmployee.TENDANGNHAP) { // Chỉ cập nhật MK nếu có tài khoản
                console.log(`EmployeeService: Request to update password for MANV ${employeeId}`);
                await AccountService.updatePasswordByManv(employeeId, MATKHAU_MOI);
                passwordUpdateMessage = " Password updated.";
            }


            // Lấy lại thông tin đầy đủ đã join sau khi tất cả cập nhật thành công
            const finalUpdatedEmployee = await EmployeeRepository.findById(employeeId);

            return {
                ...finalUpdatedEmployee,
                message: `Employee updated successfully.${roleUpdateMessage}${passwordUpdateMessage}`
            };

        } catch (error) {
            console.error(`Error in EmployeeService.updateEmployeeAndOptionalPassword for ${employeeId}:`, error);
            throw error;
        } finally {
        }
    }

    async deleteEmployeeAndAssociatedAccount(employeeId) {
        console.log(`EmployeeService: Attempting to hard delete employee ${employeeId} and its account MANUALLY.`);

        try {
            // Bước 1: (Tùy chọn nhưng tốt) Kiểm tra xem nhân viên có tồn tại không
            // Dùng connection của transaction để đảm bảo đọc dữ liệu nhất quán
            const employeeExists = await EmployeeRepository.findById(employeeId);
            if (!employeeExists) {
                // Nếu không tìm thấy, không cần rollback vì chưa làm gì
                // Nhưng vẫn nên release connection
                const error = new Error('Employee not found for deletion.');
                error.statusCode = 404;
                throw error; // Ném lỗi để controller bắt, connection sẽ được release trong finally
            }

            // Bước 2: Xóa các bản ghi tài khoản liên quan đến MANV này
            // AccountRepository.deleteByManv sẽ sử dụng connection của transaction
            // Nếu nhân viên không có tài khoản, affectedRows sẽ là 0, không phải lỗi.
            await AccountRepository.deleteByManv(employeeId);
            console.log(`EmployeeService: Associated accounts for MANV ${employeeId} deleted (if any).`);

            // Bước 3: Xóa bản ghi nhân viên
            // EmployeeRepository.deleteById cũng sử dụng connection của transaction
            const deleteEmployeeResult = await EmployeeRepository.deleteById(employeeId);

            if (deleteEmployeeResult.affectedRows === 0) {
                // Điều này không nên xảy ra nếu findById ở trên đã tìm thấy và transaction vẫn giữ
                // Có thể là lỗi logic hoặc race condition hiếm gặp
                console.warn(`EmployeeService: Employee ${employeeId} was not found during delete operation (affectedRows = 0) within transaction.`);
                const error = new Error('Employee could not be deleted from NHANVIEN table, inconsistency might occur if account was deleted.');
                error.statusCode = 500; // Lỗi nghiêm trọng nếu tài khoản đã xóa mà nhân viên không xóa được
                throw error; // Sẽ rollback
            }
            console.log(`EmployeeService: Employee ${employeeId} and its associated account (manual delete) successfully removed from the database.`);
            return { success: true, message: `Employee ${employeeId} and any associated account have been permanently deleted.` };

        } catch (error) {
            console.error(`Error in EmployeeService.deleteEmployeeAndAssociatedAccount (manual delete) for ${employeeId}:`, error);
            throw error; // Ném lại lỗi để controller xử lý
        } finally {
        }
    }
    /* async createEmployee(EmployeeDataFromController) {
        console.log('EmployeeService: Attempting to create employee with data:', EmployeeDataFromController);

        // LẤY TENDANGNHAP VÀ VITRI (VÀ CÁC TRƯỜNG KHÁC CẦN THIẾT) TỪ EmployeeDataFromController
        const {
            TENNV, VITRI, SDT, EMAIL, NGAYSINH, NGAYLAM, GIOITINH, DIACHI, LUONG,
            TENDANGNHAP // << KHAI BÁO TENDANGNHAP Ở ĐÂY
        } = EmployeeDataFromController;

        try {
            // Phần detailsToCheck có thể giữ nguyên hoặc sử dụng các biến đã destructure
            const detailsToCheck = { TENNV, VITRI, SDT, EMAIL, NGAYSINH, NGAYLAM, GIOITINH, DIACHI, LUONG };

            const checkDuplicated = await EmployeeRepository.findExactDuplicate(detailsToCheck);
            if (checkDuplicated) {
                const error = new Error('An identical employee (based on its details) already exists.');
                error.statusCode = 409; // Conflict
                throw error;
            }

            const newEmployee = await EmployeeRepository.create(EmployeeDataFromController); // Giả sử EmployeeRepository.create xử lý MANV

            let createdAccountInfo = null;
            // Bây giờ TENDANGNHAP đã được định nghĩa trong scope này
            if (newEmployee && newEmployee.MANV && TENDANGNHAP && TENDANGNHAP.trim() !== '') {
                console.log(`EmployeeService: Employee ${newEmployee.MANV} created. Proceeding to create account for username: ${TENDANGNHAP}`);
                try {
                    let ROLE_DANGNHAP = 'NhanVien';
                    // VITRI cũng đã được định nghĩa
                    if (VITRI && (VITRI.toLowerCase().includes('quản lý') || VITRI.toLowerCase().includes('manager'))) {
                        ROLE_DANGNHAP = 'QuanLy';
                    }

                    const accountDetailsForService = {
                        MANV: newEmployee.MANV,
                        TENDANGNHAP: TENDANGNHAP, // Truyền TENDANGNHAP đã được khai báo
                        ROLE_DANGNHAP
                    };
                    createdAccountInfo = await AccountService.createAccountForEmployee(accountDetailsForService, null);

                } catch (accountError) {
                    // ... (xử lý lỗi tạo tài khoản) ...
                    const error = new Error(`Employee created (MANV: ${newEmployee.MANV}), but account creation failed: ${accountError.message}`);
                    error.statusCode = accountError.statusCode || 500;
                    error.employeeCreated = newEmployee;
                    throw error;
                }
            } else if (TENDANGNHAP && TENDANGNHAP.trim() !== '') { // Chỉ kiểm tra TENDANGNHAP nếu nó có giá trị
                console.warn("EmployeeService: Employee creation might have failed or MANV is missing, but TENDANGNHAP was provided. Skipping account creation.");
            } else {
                console.log("EmployeeService: TENDANGNHAP not provided or empty. Skipping account creation.");
            }


            // 5. Gộp kết quả trả về
            if (createdAccountInfo) {
                return {
                    ...newEmployee, // newEmployee từ EmployeeRepository.create
                    MATK: createdAccountInfo.MATK,
                    TENDANGNHAP: createdAccountInfo.TENDANGNHAP, // Lấy TENDANGNHAP từ tài khoản đã tạo
                    MATKHAU: createdAccountInfo.RAW_PASSWORD_FOR_CLIENT,
                    ROLE_DANGNHAP: createdAccountInfo.ROLE_DANGNHAP,
                    TOKEN_MOCK: createdAccountInfo.TOKEN_MOCK,
                    message: "Employee and Account created. Password and Token generated."
                };
            } else {
                return {
                    ...newEmployee, // newEmployee từ EmployeeRepository.create
                    message: "Employee created successfully. Account not created (e.g., username not provided or employee creation failed partially)."
                };
            }

        } catch (error) {
            console.error('Error in EmployeeService.createEmployee (overall):', error);
            if (!error.statusCode && error.message && error.message.toLowerCase().includes('duplicate entry')) {
                error.statusCode = 409;
            }
            throw error;
        }
    } */
}

module.exports = new EmployeeService();