const TransactionHistoryService = require('../services/transactionhistoryService');
const fs = require('fs'); // Để xóa file nếu có lỗi
const path = require('path');

class TransactionHistoryController {
    async getAllTransactionHistory(req, res, next) {
        try {
            const transactions = await TransactionHistoryService.getAllTransactionHistory();
            res.status(200).json(transactions);
        } catch (error) {
            next(error);
        }
    }

    async createTransactionHistory(req, res, next) {
        try {
            console.log('Create Transaction History Request Body:', req.body);
            console.log('Create Transaction History Request File:', req.file);

            const transactionData = { ...req.body };

            if (req.file) {
                transactionData.HINHANH = `uploads/transaction_bills/${req.file.filename}`;
            } else {
                transactionData.HINHANH = null;
                console.log('Transaction History Controller: No file uploaded or req.file is invalid, HINHANH set to null.');
            }

            const newTransactionData = await TransactionHistoryService.createTransactionHistory(transactionData);
            res.status(200).json(newTransactionData);
        } catch (error) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path); // Xóa file nếu có lỗi
                    console.log(`Deleted uploaded file ${req.file.filename} due to error: ${error.message}`);
                } catch (unlinkError) {
                    console.error(`Error deleting uploaded file ${req.file.filename}:`, unlinkError);
                }
            }
            if (error.message && error.message.toLowerCase().includes('duplicate entry') && error.message.includes('MAGIAODICH')) {
                error.statusCode = 409; // Conflict
                error.message = `Transaction Code ID ${productData.MAGIAODICH} already exists. This might be a concurrency issue. Please try again.`;
            }
            next(error);
        }
    }
}

module.exports = new TransactionHistoryController();