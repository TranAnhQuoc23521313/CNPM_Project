// server/routes/statisticsRoutes.js
const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/statisticsController');
const { verifyToken } = require('../middleware/authMiddleware');
// (Tùy chọn) Middleware xác thực nếu API thống kê cần bảo vệ
// const authMiddleware = require('../middlewares/authMiddleware'); // Ví dụ

// Định nghĩa các routes cho nghiệp vụ thống kê

// API cho tab "Tổng thu chi"
// GET /api/statistics/revenue-expense?period=monthly&year=2023&month=12
// GET /api/statistics/revenue-expense?period=yearly&year=2023
router.get(
    '/revenue-expense',
    verifyToken,
    // authMiddleware.authenticate, // (Tùy chọn) Nếu cần xác thực
    // authMiddleware.authorize(['admin', 'manager']), // (Tùy chọn) Nếu cần phân quyền
    StatisticsController.getRevenueExpenseStats
);

// API cho tab "Bảng xếp hạng"
// GET /api/statistics/ranking?period=monthly&year=2023&month=12
router.get(
    '/ranking',
    verifyToken,
    // authMiddleware.authenticate, 
    // authMiddleware.authorize(['admin', 'manager']), 
    StatisticsController.getRankingStats
);

// API cho tab "Xu hướng"
// GET /api/statistics/trends?period=monthly&year=2023&month=12
router.get(
    '/trends',
    verifyToken,
    // authMiddleware.authenticate, 
    // authMiddleware.authorize(['admin', 'manager']), 
    StatisticsController.getTrendsStats
);

module.exports = router;