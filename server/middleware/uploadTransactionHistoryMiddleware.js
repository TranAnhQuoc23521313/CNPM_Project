// server/middleware/uploadProductImage.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const TRANSACTION_HISTORY_UPLOAD_DIR = path.join(__dirname, '../public/uploads/transaction_bills'); // THƯ MỤC MỚI
if (!fs.existsSync(TRANSACTION_HISTORY_UPLOAD_DIR)) {
    fs.mkdirSync(TRANSACTION_HISTORY_UPLOAD_DIR, { recursive: true });
}
// ... (storage, fileFilter tương tự như uploadPoster, có thể đặt tên file khác)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, TRANSACTION_HISTORY_UPLOAD_DIR)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E3);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép tải lên file ảnh!'), false);
    }
};

const uploadTransactionHistoryImage = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
}); // Giới hạn 5MB

module.exports = { uploadTransactionHistoryImage };