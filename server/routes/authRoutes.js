// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

router.post('/login', AuthController.login);
// (Tùy chọn) router.post('/verify-otp', AuthController.verifyOtp);

module.exports = router;