// services/accountService.js
const AccountRepository = require('../repositories/accountRepository');
const { GenerateRandomAccountId, GenerateFixedMockToken } = require('../utils/idAccout_Token_Generator');
const { generateRandomPassword } = require('../utils/passwordGenerator');
const pool = require('../config/db'); // Import pool để AccountService tự lấy connection nếu cần
const bcrypt = require('bcrypt'); 

const SALT_ROUNDS = 10;

class AccountService {
    async createAccountForEmployee(accountDetails, externalConnection = null) {
        const { MANV, TENDANGNHAP, ROLE_DANGNHAP } = accountDetails;

        // Sử dụng externalConnection nếu có, ngược lại tự lấy connection từ pool
        // QUAN TRỌNG: Nếu tự lấy connection, nó sẽ là một transaction riêng, không nằm trong transaction của EmployeeService (nếu có).
        const connectionToUse = externalConnection || await pool.getConnection();
        let ownConnection = !externalConnection; // Cờ để biết có cần release connection này không

        try {
            if (ownConnection) await connectionToUse.beginTransaction(); // Bắt đầu transaction riêng nếu tự quản lý

            if (!TENDANGNHAP || TENDANGNHAP.trim() === '') { /* ... lỗi ... */ }
            const existingAccountByUsername = await AccountRepository.findByUsername(TENDANGNHAP.trim(), connectionToUse);
            if (existingAccountByUsername) { /* ... lỗi trùng username ... */ }

            let MATK;
            // ... (logic tạo MATK và kiểm tra trùng MATK với connectionToUse) ...
            do {
                MATK = GenerateRandomAccountId(20);
            } while (await AccountRepository.findByMATK(MATK, connectionToUse));


            const rawPassword = generateRandomPassword(10);
            const hashedPassword = await bcrypt.hash(rawPassword, SALT_ROUNDS);
            console.log(`AccountService: Hashed password for ${TENDANGNHAP}.`);
            const passwordToStore = hashedPassword; // Lưu text thuần
            const TOKEN_MOCK = GenerateFixedMockToken();

            const accountToCreate = { MATK, MANV, TENDANGNHAP: TENDANGNHAP.trim(), MATKHAU: passwordToStore, ROLE_DANGNHAP, TOKEN_MOCK };
            const createdAccount = await AccountRepository.create(accountToCreate, connectionToUse);
            console.log('accoutService successful !');
            if (ownConnection) await connectionToUse.commit(); // Commit transaction riêng

            return { ...createdAccount, RAW_PASSWORD_FOR_CLIENT: rawPassword };

        } catch (error) {
            if (ownConnection) await connectionToUse.rollback(); // Rollback transaction riêng
            console.error('Error in AccountService.createAccountForEmployee:', error);
            throw error;
        } finally {
            if (ownConnection && connectionToUse) connectionToUse.release(); // Release connection nếu tự quản lý
        }
    }

    async updatePasswordByManv(manv, newPlainTextPassword, connection) {
        console.log(`AccountService: Updating password for MANV ${manv}`);
        if (!newPlainTextPassword || newPlainTextPassword.trim() === '') {
            const error = new Error("New password cannot be empty.");
            error.statusCode = 400;
            throw error;
        }

        // Theo yêu cầu của bạn là lưu text thuần
        //const passwordToStore = newPlainTextPassword;

        // Nếu bạn muốn hash:
        const saltRounds = 10;
        const MATKHAU_HASHED = await bcrypt.hash(newPlainTextPassword, saltRounds);
        const passwordToStore = MATKHAU_HASHED;

        // AccountRepository.updatePasswordByManv cần được tạo
        const result = await AccountRepository.updatePasswordByManv(manv, passwordToStore, connection);
        
        if (result.affectedRows === 0) {
            // Không tìm thấy tài khoản nào với MANV này để cập nhật
            // Hoặc không có gì thay đổi (ví dụ mật khẩu giống hệt) - tùy vào logic update của repo
            console.warn(`AccountService: No account found or password not changed for MANV ${manv}.`);
            return { success: false, message: "No account found for this employee or password not changed." };
        }
        return { success: true, message: "Password updated successfully." };
    }

     async updateRoleByManv(manv, newRole, connection) {
        console.log(`AccountService: Updating role for MANV ${manv} to ${newRole}`);
        if (!newRole || newRole.trim() === '') {
            const error = new Error("New role cannot be empty.");
            error.statusCode = 400;
            throw error;
        }

        // AccountRepository.updateRoleByManv cần được tạo
        const result = await AccountRepository.updateRoleByManv(manv, newRole.trim(), connection);

        if (result.affectedRows === 0) {
            console.warn(`AccountService: No account found to update role for MANV ${manv}.`);
            // Không nhất thiết phải ném lỗi ở đây nếu nhân viên đó có thể không có tài khoản
            // Hoặc nếu việc không tìm thấy tài khoản là một lỗi, thì ném lỗi.
            // Ví dụ: throw new Error(`No account found for MANV ${manv} to update role.`);
            return { success: false, message: "No account found for this employee to update role." };
        }
        console.log(`AccountService: Role for MANV ${manv} updated to ${newRole}.`);
        return { success: true, message: "Role updated successfully." };
    }

    async authenticateUser(username, plainTextPassword) {
        const account = await AccountRepository.findByUsername(username); // Không cần connection ở đây nếu chỉ đọc
        if (!account) {
            return null; // Không tìm thấy user
        }
        // So sánh mật khẩu người dùng nhập với mật khẩu đã hash trong DB
        const passwordMatch = await bcrypt.compare(plainTextPassword, account.MATKHAU);
        if (passwordMatch) {
            // Mật khẩu khớp, trả về thông tin tài khoản (không bao gồm mật khẩu hash)
            const { MATKHAU, ...accountInfoWithoutPassword } = account;
            return accountInfoWithoutPassword;
        }
        return null; // Mật khẩu không khớp
    }
}
module.exports = new AccountService();