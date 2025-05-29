// controllers/authController.js
const AuthService = require('../services/authService');

class AuthController {
    async login(req, res, next) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: "Username and password are required." });
            }

            const userData = await AuthService.login(username, password);

            if (userData) {
                // userData chứa: username, role, token (là TOKEN_MOCK cố định)
                res.status(200).json({
                    message: "Login successful",
                    user: { // Gửi về một object user rõ ràng hơn
                        username: userData.username,
                        role: userData.role,
                        manv: userData.manv
                    },
                    token: userData.token // Token này là TOKEN_MOCK từ CSDL
                });
            } else {
                res.status(401).json({ message: "Invalid username or password." });
            }
        } catch (error) {
            console.error("AuthController login error:", error);
            next(error); // Chuyển cho global error handler
        }
    }

    // (Tùy chọn) Thêm API cho OTP nếu cần
    // async verifyOtp(req, res, next) { ... }
}

module.exports = new AuthController();