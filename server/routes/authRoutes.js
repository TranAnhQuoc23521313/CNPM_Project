// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware'); // KIỂM TRA ĐƯỜNG DẪN NÀY


router.post('/login', AuthController.login);
// (Tùy chọn) router.post('/verify-otp', AuthController.verifyOtp);
router.get('/me', verifyToken, AuthController.getCurrentUserProfile); 


module.exports = router;