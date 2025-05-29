const pool = require('../config/db');

class TransactionHistoryRepository {
    async findAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM GIAODICH_NOIBO');
            //console.log('TransactionHistoryRepository: findAll response:', rows);
            return rows;
        } catch (error) {
            console.error('Error in TransactionHistoryRepository.findAll:', error);
            throw error;
        }
    }

    async create(transactionData) {
        const {
            MAGIAODICH,
            LOAIGIAODICH,
            NGAYGIAODICH,
            MANV,
            MOTA,
            SOTIEN,
            PHANLOAI,
            MATHAMCHIEU,
            HINHANH
        } = transactionData;

        const sql = 'INSERT INTO GIAODICH_NOIBO(MAGIAODICH, LOAIGIAODICH, NGAYGIAODICH, MANV, MOTA, SOTIEN, PHANLOAI, MATHAMCHIEU, HINHANH) VALUES (?,?,?,?,?,?,?,?,?)'

        const values = [MAGIAODICH,
            LOAIGIAODICH,
            NGAYGIAODICH,
            MANV,
            MOTA || null,
            SOTIEN,
            PHANLOAI,
            MATHAMCHIEU,
            HINHANH || null];

        console.log('TransactionHistoryRepository: Attempting to insert TransactionHistory with SQL', sql);
        console.log('TransactionHistoryRepository: Values for insert', values);

        try {
            const [result] = await pool.query(sql, values);
            console.log('TransactionHistoryRepository: Inserted TransactionHistory successfully:', result);
            if (result.affectedRows === 1) {
                return { ...transactionData }
            }
            else {
                throw new Error('Failed to insert TransactionHistory: No rows affected.');
            }
        } catch (error) {
            console.error('Error in TransactionHistoryRepository.create:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                error.statusCode = 409; // Conflict
                error.message = `TransactionHistory with ID ${MAGIAODICH} already exists.`;
            }
            throw new Error('Database query failed to create TransactionHistory. Details: ' + error.message);
        }
    }

    async findExactDuplicate(transactionDetails) {
        const fieldsToCompare = [
            'MAGIAODICH', 'LOAIGIAODICH',
            'NGAYGIAODICH', 'MANV', 'SOTIEN',
            'PHANLOAI', 'MATHAMCHIEU'];

        const conditions = fieldsToCompare.map(field => `${field} = ?`).join(' AND ');
        const values = fieldsToCompare.map(field => transactionDetails[field] ?? null);
        const sql = `SELECT COUNT(*) AS count FROM GIAODICH_NOIBO WHERE ${conditions}`;

        try {
            const [rows] = await pool.query(sql, values);
            return rows[0].count > 0; // Trả về true nếu có bản ghi trùng
        } catch (error) {
            console.error('Lỗi khi kiểm tra bản ghi trùng:', error);
            throw error;
        }
    }
}

module.exports = new TransactionHistoryRepository();