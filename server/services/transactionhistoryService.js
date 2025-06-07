const TransactionHistoryRepository = require('../repositories/transactionhistoryRepository');

class TransactionHistoryService {
    async getAllTransactionHistory() {
        try {
            return await TransactionHistoryRepository.findAll();
        } catch (error) {
            console.error('Error in TransactionHistoryService.getAllTransactionHistory:', error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }

    async createTransactionHistory(TransactionHistoryDataFromController) {
        try {
            const detailsToCheck = {
                MAGIAODICH: TransactionHistoryDataFromController.MAGIAODICH,
                LOAIGIAODICH: TransactionHistoryDataFromController.LOAIGIAODICH,
                NGAYGIAODICH: TransactionHistoryDataFromController.NGAYGIAODICH,
                MANV: TransactionHistoryDataFromController.MANV,
                SOTIEN: TransactionHistoryDataFromController.SOTIEN,
                PHANLOAI: TransactionHistoryDataFromController.PHANLOAI,
                MATHAMCHIEU: TransactionHistoryDataFromController.MATHAMCHIEU
            };
            const isExactDuplicate = await TransactionHistoryRepository.findExactDuplicate(detailsToCheck);
            if (isExactDuplicate) {
                const error = new Error('Giao dịch bạn vừa thêm đã tồn trạng, hãy kiểm tra lại các trường thông tin vừa nhập !');
                error.statusCode = 409; // Conflict
                throw error;
            }
            // 2. Nếu không trùng, tiến hành tạo thiết bị
            const newTransactionHistory = await TransactionHistoryRepository.create(TransactionHistoryDataFromController);
            return newTransactionHistory;
        } catch (error) {
            console.error('Error in TransactionHistoryService.createTransactionHistory:', error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }
}

module.exports = new TransactionHistoryService();