// services/authService.js
const AccountRepository = require('../repositories/accountRepository'); // Giả sử AccountRepository có findByUsername
const bcrypt = require('bcrypt'); // Bỏ qua nếu mật khẩu là text thuần
const jwt = require('jsonwebtoken'); // Thêm thư viện jwt
require('dotenv').config(); // Để lấy JWT_SECRET từ .env

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-secret-key-for-jwt'; // Nên đặt trong .env
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Ví dụ: token hết hạn sau 1 giờ

class AuthService {
    async login(username, password) {
        console.log(`AuthService: Attempting login for username: ${username}`);
        const account = await AccountRepository.findByUsername(username);

        if (!account) {
            console.log(`AuthService: Account not found for username: ${username}`);
            return null;
        }

        const isMatch = await bcrypt.compare(password, account.MATKHAU);
        if (isMatch) {
            console.log(`AuthService: Password match for username: ${username}. Login successful.`);

            // Tạo payload cho JWT
            const payload = {
                // Các thông tin bạn muốn lưu trong token và truy cập qua req.user
                id: account.MANV, // Quan trọng: dùng 'id' hoặc một key chuẩn để lưu MANV
                                  // Client sẽ dựa vào đây để lấy mã nhân viên
                username: account.TENDANGNHAP,
                role: account.ROLE_DANGNHAP
                // Bạn có thể bỏ `manv: account.MANV` nếu đã có `id: account.MANV`
            };
            
            // Tạo JWT
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

            return {
                manv: account.MANV, // Vẫn trả về manv riêng nếu client cần trực tiếp
                username: account.TENDANGNHAP,
                role: account.ROLE_DANGNHAP,
                token: token // Trả về JWT mới tạo
            };
        } else {
            console.log(`AuthService: Password mismatch for username: ${username}`);
            return null;
        }
    }

    // (Tùy chọn) Thêm logic xác thực OTP nếu bạn muốn triển khai đầy đủ
    // async verifyOtpAndLogin(username, otp, currentPassword) { ... }
}

module.exports = new AuthService();