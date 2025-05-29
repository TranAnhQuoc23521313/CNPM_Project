const pool = require('../config/db');

class EquipmentReposiotry {
    async findAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM THIETBI');
            console.log('EquipmentRepository: findAll response:', rows);
            return rows;
        } catch (error) {
            console.error('Error in EquipmentRepository.findAll:', error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }

    async create(equipmentData) {
        const {
            MATHIETBI,
            TENTHIETBI,
            LOAITHIETBI,
            VITRITHIETBI,
            TRANGTHAI,
            NGAYMUA,
            NGAYHETBAOHANH,
            NGAYBAOTRI,
            GIA,
            GHICHU
        } = equipmentData;

        const sql = 'INSERT INTO THIETBI (MATHIETBI, TENTHIETBI, LOAITHIETBI, VITRITHIETBI, TRANGTHAI, NGAYMUA, NGAYHETBAOHANH, NGAYBAOTRI, GIA, GHICHU) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [
            MATHIETBI,
            TENTHIETBI,
            LOAITHIETBI,
            VITRITHIETBI,
            TRANGTHAI,
            NGAYMUA,
            NGAYHETBAOHANH,
            NGAYBAOTRI,
            GIA,
            GHICHU || null,
        ];

        console.log('EquipmentRepository: Attempting to insert equipment with SQL', sql);
        console.log('EquipmentRepository: Values for insert', values);

        try {
            const [result] = await pool.query(sql, values);
            console.log('EquipmentRepository: Inserted equipment successfully:', result);
            if (result.affectedRows === 1) {
                return { ...equipmentData }
            }
            else {
                throw new Error('Failed to insert equipment: No rows affected.');
            }
        } catch (error) {
            console.error('Error in EquipmentRepository.create:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                error.statusCode = 409; // Conflict
                error.message = `Equipment with ID ${MATHIETBI} already exists.`;
            }
            throw new Error('Database query failed to create equipment. Details: ' + error.message);
        }
    }

    async findExactDuplicate(equipmentDetails){
        const fieldsToCompare = [
            'MATHIETBI', 'TENTHIETBI', 'LOAITHIETBI', 'VITRITHIETBI',
            'TRANGTHAI', 'NGAYMUA', 'NGAYHETBAOHANH', 'NGAYBAOTRI', 'GIA'
        ];
        const conditions = fieldsToCompare.map(field => `${field} = ?`).join(' AND ');
        const values = fieldsToCompare.map(field => equipmentDetails[field] ?? null);
        const sql = `SELECT COUNT(*) AS count FROM THIETBI WHERE ${conditions}`;
        try {
            const [rows] = await pool.query(sql, values);
            return rows[0].count > 0; // Trả về true nếu có bản ghi trùng
        } catch (error) {
            console.error('Lỗi khi kiểm tra bản ghi trùng:', error);
            throw error;
        }
    }
}

module.exports = new EquipmentReposiotry();