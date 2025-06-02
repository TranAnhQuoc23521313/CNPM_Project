// server/utils/generateMaKhachHang.js
const pool = require('../config/db');

async function generateMaKhachHang() {
  const prefix = 'KH';
  const length = 8;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Khóa bảng để tránh race condition, hoặc sử dụng một bảng sequence riêng
    // Cách đơn giản:
    const [rows] = await connection.query(
      `SELECT MAKH FROM KHACHHANG WHERE MAKH LIKE ? ORDER BY MAKH DESC LIMIT 1 FOR UPDATE`,
      [`${prefix}%`]
    );

    let nextIdNumber = 1;
    if (rows.length > 0) {
      const lastMaKH = rows[0].MAKH;
      const lastNumberStr = lastMaKH.substring(prefix.length);
      if (!isNaN(parseInt(lastNumberStr, 10))) {
        nextIdNumber = parseInt(lastNumberStr, 10) + 1;
      }
    }
    await connection.commit();
    const nextMaKH = prefix + String(nextIdNumber).padStart(length, '0');
    return nextMaKH;
  } catch (error) {
    await connection.rollback();
    console.error('Lỗi khi tạo Mã Khách Hàng:', error);
    throw new Error('Không thể tạo mã khách hàng mới.');
  } finally {
    connection.release();
  }
}

module.exports = generateMaKhachHang;