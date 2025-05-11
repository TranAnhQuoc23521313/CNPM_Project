const mysql = require('mysql2/promise');

async function showDatabases() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',      // Đổi thành user của bạn nếu khác
      password: 'Quoc0909561219',      // Đổi thành password của bạn nếu có
      port: 3306,      // Đổi thành port của bạn nếu khác
      database: 'CNPM_QuanLyRapPhim', // Đổi thành database bạn muốn kết nối
    });
    const [rows] = await conn.query('SELECT * FROM PHIM');
    console.log('Danh sách database:', rows);
    await conn.end();
  } catch (err) {
    console.error('Lỗi khi truy vấn database:', err);
  }
}

showDatabases();