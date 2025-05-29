const express = require('express');
const router = express.Router();
const {uploadTransactionHistoryImage} = require('../middleware/uploadTransactionHistoryMiddleware');
const transactionhistoryController = require('../controllers/transactionhistoryController');

router.get('/',transactionhistoryController.getAllTransactionHistory);
router.post('/',uploadTransactionHistoryImage.single('transactionImageFile'), transactionhistoryController.createTransactionHistory);

module.exports = router;