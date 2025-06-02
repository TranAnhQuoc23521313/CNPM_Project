// server/utils/generateMaHoaDon.js
const pool = require('../config/db');

async function generateMaHoaDon() {
  const prefix = 'HD';
  const length = 8;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT MAHOADON FROM HOADON WHERE MAHOADON LIKE ? ORDER BY MAHOADON DESC LIMIT 1 FOR UPDATE`,
      [`${prefix}%`]
    );

    let nextIdNumber = 1;
    if (rows.length > 0) {
      const lastMaHD = rows[0].MAHOADON;
      const lastNumberStr = lastMaHD.substring(prefix.length);
      if (!isNaN(parseInt(lastNumberStr, 10))) {
        nextIdNumber = parseInt(lastNumberStr, 10) + 1;
      }
    }
    await connection.commit();
    const nextMaHD = prefix + String(nextIdNumber).padStart(length, '0');
    return nextMaHD;
  } catch (error) {
    await connection.rollback();
    console.error('Lỗi khi tạo Mã Hóa Đơn:', error);
    throw new Error('Không thể tạo mã hóa đơn mới.');
  } finally {
    connection.release();
  }
}

module.exports = generateMaHoaDon;