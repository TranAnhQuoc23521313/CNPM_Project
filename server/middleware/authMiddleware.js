// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-secret-key-for-jwt';

const verifyToken = (req, res, next) => {
    // Lấy token từ header 'Authorization' (ví dụ: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Tách lấy phần token

    if (!token) {
        return res.status(403).json({ message: "No token provided. Access forbidden." });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT Verification Error:", err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Token has expired. Please login again." });
            }
            return res.status(401).json({ message: "Failed to authenticate token. Invalid token." });
        }

        // Token hợp lệ, lưu payload đã giải mã vào req.user
        // Payload này sẽ chứa { id: MANV, username, role } như đã định nghĩa ở AuthService
        req.user = decoded;
        console.log("authMiddleware - Decoded user from token:", req.user);
        next(); // Cho phép request đi tiếp
    });
};

// (Tùy chọn) Middleware phân quyền dựa trên role
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: "User role not available. Access forbidden." });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role '${req.user.role}' is not authorized to access this resource.` });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    authorizeRoles
};