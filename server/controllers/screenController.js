// server/controllers/screenController.js
const screenService = require('../services/screenService');

class ScreenController {
    async getAllScreens(req, res, next) {
        try {
            console.log('ScreenController: Received request to get all screens.');
            const screens = await screenService.getAllScreens();
            res.status(200).json(screens);
        } catch (error) {
            console.error('ScreenController: Error in getAllScreens:', error);
            next(error); // Chuyển lỗi đến middleware xử lý lỗi chung
        }
    }

    async getScreenById(req, res, next) {
        try {
            const maPhong = req.params.id; // Giả sử ID được truyền qua params
            console.log(`ScreenController: Received request to get screen by ID: ${maPhong}`);
            const screen = await screenService.getScreenById(maPhong);
            if (!screen) {
                const err = new Error('Screening room not found.');
                err.statusCode = 404;
                return next(err);
            }
            res.status(200).json(screen);
        } catch (error) {
            console.error('ScreenController: Error in getScreenById:', error);
            next(error);
        }
    }
    // ... (các controller khác cho CRUD phòng chiếu nếu cần)
}

module.exports = new ScreenController();