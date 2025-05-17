// server/services/screenService.js
const screenRepository = require('../repositories/screenRepository');

class ScreenService {
    async getAllScreens() {
        console.log('ScreenService: Attempting to get all screens.');
        try {
            return await screenRepository.findAll();
        } catch (error) {
            console.error('Error in ScreenService.getAllScreens:', error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }

    async getScreenById(maPhong) {
        console.log(`ScreenService: Attempting to get screen by ID: ${maPhong}`);
        try {
            const screen = await screenRepository.findById(maPhong);
            if (!screen) {
                // Không cần throw 404 ở đây, để controller quyết định
                return null;
            }
            return screen;
        } catch (error) {
            console.error(`Error in ScreenService.getScreenById for ${maPhong}:`, error);
            throw error;
        }
    }
    // ... (các hàm service khác cho CRUD phòng chiếu nếu cần)
}

module.exports = new ScreenService();