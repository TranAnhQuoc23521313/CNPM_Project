// src/middlewares/upload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../public/uploads/facilities'); // Ví dụ: src/uploads/facilities
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Thư mục lưu file
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất để tránh trùng lặp
        // Ví dụ: prefix-timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname); // Lấy phần mở rộng .jpg, .png
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// Bộ lọc file (chỉ cho phép các loại ảnh nhất định)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true); // Chấp nhận file
    } else {
        cb(new Error('Chỉ cho phép tải lên file ảnh (JPEG, PNG, GIF).'), false); // Từ chối file
    }
};

// Khởi tạo Multer với cấu hình
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Giới hạn kích thước file (ví dụ: 5MB)
    },
    fileFilter: fileFilter
});

// Middleware để xử lý một file đơn lẻ
// 'imageField' là tên của trường input type="file" trong form HTML
// Ví dụ: <input type="file" name="hinhAnhSuCo"> thì fieldname là 'hinhAnhSuCo'
// exports.uploadSingleImage = (fieldName) => upload.single(fieldName);

// Middleware để xử lý nhiều file (ví dụ: tối đa 3 ảnh cho báo cáo sự cố)
// 'imagesField' là tên của trường input type="file" multiple
// exports.uploadMultipleImages = (fieldName, maxCount) => upload.array(fieldName, maxCount);

module.exports = upload; // Export instance upload để tùy biến trong route