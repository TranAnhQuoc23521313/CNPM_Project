// services/authService.js
const AccountRepository = require('../repositories/accountRepository'); // Giả sử AccountRepository có findByUsername
const bcrypt = require('bcrypt'); // Bỏ qua nếu mật khẩu là text thuần

class AuthService {
    async login(username, password) {
        console.log(`AuthService: Attempting login for username: ${username}`);
        const account = await AccountRepository.findByUsername(username); // Tìm tài khoản theo TENDANGNHAP

        if (!account) {
            console.log(`AuthService: Account not found for username: ${username}`);
            return null; // Không tìm thấy người dùng
        }

        // So sánh mật khẩu text thuần (KHÔNG AN TOÀN CHO PRODUCTION)
        /* if (password === account.MATKHAU) {
            console.log(`AuthService: Password match for username: ${username}. Login successful.`);
            // Trả về thông tin cần thiết cho client, bao gồm role và token cố định
            return {
                manv: account.MANV,
                username: account.TENDANGNHAP,
                role: account.ROLE_DANGNHAP,
                token: account.TOKEN_MOCK // Token cố định đã lưu trong DB
            };
        } else {
            console.log(`AuthService: Password mismatch for username: ${username}`);
            return null; // Sai mật khẩu
        } */

        //Nếu dùng bcrypt để hash mật khẩu:
        const isMatch = await bcrypt.compare(password, account.MATKHAU);
        if (isMatch) {
            return { username: account.TENDANGNHAP, role: account.ROLE_DANGNHAP, token: account.TOKEN_MOCK };
        } else {
            return null;
        }
    }

    // (Tùy chọn) Thêm logic xác thực OTP nếu bạn muốn triển khai đầy đủ
    // async verifyOtpAndLogin(username, otp, currentPassword) { ... }
}

module.exports = new AuthService();