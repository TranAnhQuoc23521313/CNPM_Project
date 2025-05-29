const pool = require('../config/db');
const crypto = require('crypto');

function GenerateRandomAccountId(length = 20) {
    // Tạo chuỗi ký tự ngẫu nhiên gồm chữ và số, độ dài 20
    // Bạn có thể tùy chỉnh bộ ký tự nếu muốn
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') // Chuyển sang hex, mỗi byte thành 2 ký tự hex
        .slice(0, length); // Cắt lấy đúng độ dài mong muốn
}

function GenerateFixedMockToken(length = 255) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

module.exports = {
    GenerateRandomAccountId,
    GenerateFixedMockToken
};