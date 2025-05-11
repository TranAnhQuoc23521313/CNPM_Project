// server/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../public/uploads/posters');

// Đảm bảo thư mục upload tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Tạo tên file duy nhất: timestamp-ten_goc.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E3); // Thêm phần ngẫu nhiên nhỏ
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_')); // Thay thế khoảng trắng
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép tải lên file ảnh!'), false);
    }
};

const uploadPoster = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    }
});

module.exports = { uploadPoster };