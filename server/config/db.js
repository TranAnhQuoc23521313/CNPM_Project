// server/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Quoc0909561219',
    port: 3306,
    database: 'CNPM_QuanLyRapPhim',
});

// Kiểm tra kết nối và in ra danh sách database
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL Connected successfully!');
        const [databases] = await connection.query('SHOW DATABASES');
        console.log('Danh sách database:', databases);
        connection.release();
    } catch (err) {
        console.error('Error connecting to MySQL:', err.stack);
    }
})();

module.exports = pool;