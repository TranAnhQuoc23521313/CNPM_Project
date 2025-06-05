// server/controllers/statisticsController.js
const StatisticsService = require('../services/statisticsService');

class StatisticsController {

    async getRevenueExpenseStats(req, res, next) {
        try {
            const { period, year, month } = req.query; // Lấy từ query params

            // Validate inputs (cơ bản)
            if (!period || (period === 'monthly' && (!year || !month))) {
                // Nếu period là yearly thì year là bắt buộc, month không cần
                if (period === 'yearly' && !year) {
                     return res.status(400).json({ message: "Year is required for yearly period." });
                } else if (period !== 'yearly') { // Các trường hợp khác của monthly hoặc period không hợp lệ
                     return res.status(400).json({ message: "Invalid parameters. 'period' is required. For 'monthly', 'year' and 'month' are required." });
                }
            }
            
            const data = await StatisticsService.getRevenueExpenseData(period, year, month);
            res.status(200).json(data);
        } catch (error) {
            console.error("StatisticsController.getRevenueExpenseStats error:", error);
            // Chuyển lỗi đến middleware xử lý lỗi chung
            // Service có thể đã set statusCode cho lỗi
            next(error);
        }
    }

    async getRankingStats(req, res, next) {
        try {
            const { period, year, month } = req.query;

            if (!period || (period === 'monthly' && (!year || !month))) {
                 if (period === 'yearly' && !year) {
                     return res.status(400).json({ message: "Year is required for yearly period." });
                } else if (period !== 'yearly') {
                     return res.status(400).json({ message: "Invalid parameters. 'period' is required. For 'monthly', 'year' and 'month' are required." });
                }
            }

            const data = await StatisticsService.getRankingData(period, year, month);
            res.status(200).json(data);
        } catch (error) {
            console.error("StatisticsController.getRankingStats error:", error);
            next(error);
        }
    }

    async getTrendsStats(req, res, next) {
        try {
            const { period, year, month } = req.query;

            if (!period || (period === 'monthly' && (!year || !month))) {
                 if (period === 'yearly' && !year) {
                     return res.status(400).json({ message: "Year is required for yearly period." });
                } else if (period !== 'yearly') {
                     return res.status(400).json({ message: "Invalid parameters. 'period' is required. For 'monthly', 'year' and 'month' are required." });
                }
            }
            
            const data = await StatisticsService.getTrendsData(period, year, month);
            res.status(200).json(data);
        } catch (error) {
            console.error("StatisticsController.getTrendsStats error:", error);
            next(error);
        }
    }
}

module.exports = new StatisticsController();