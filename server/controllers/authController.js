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

    async getCurrentUserProfile(req, res, next) {
        try {
            // Thông tin người dùng đã được middleware verifyToken giải mã
            // và lưu vào req.user (ví dụ: { id: MANV, username, role })
            const userProfile = req.user;

            if (!userProfile) {
                // Trường hợp này ít khi xảy ra nếu verifyToken hoạt động đúng
                return res.status(404).json({ message: "User profile not found after token verification." });
            }

            // Bạn có thể muốn trả về một object user đã được "làm sạch"
            // hoặc lấy thêm thông tin từ DB dựa trên userProfile.id (MANV) nếu cần
            // Ví dụ, chỉ trả về những thông tin cần thiết cho client:
            const clientSafeUserProfile = {
                id: userProfile.id, // Hoặc manv: userProfile.id
                username: userProfile.username,
                role: userProfile.role,
                // Thêm các trường khác nếu có trong payload token và bạn muốn trả về
                // Ví dụ: nếu AuthService đã thêm Tên Nhân Viên vào payload token
                // name: userProfile.name 
            };
            
            console.log("AuthController: Sending current user profile:", clientSafeUserProfile);
            res.status(200).json(clientSafeUserProfile);

        } catch (error) {
            console.error("AuthController getCurrentUserProfile error:", error);
            next(error);
        }
    }

    // (Tùy chọn) Thêm API cho OTP nếu cần
    // async verifyOtp(req, res, next) { ... }
}

module.exports = new AuthController();