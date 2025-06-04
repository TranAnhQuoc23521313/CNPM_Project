// src/repositories/equipmentRepository.js
const pool = require('../config/db');
const TABLE_NAME_THIETBI = 'THIETBI'; // Đặt tên biến cho tên bảng

class EquipmentRepository { // Sửa lỗi chính tả: EquipmentRepository
    async findAll() {
        try {
            const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME_THIETBI}`);
            // console.log('EquipmentRepository: findAll response:', rows); // Có thể bỏ bớt log khi đã ổn định
            return rows;
        } catch (error) {
            console.error('Error in EquipmentRepository.findAll:', error);
            throw error;
        }
    }

    async findById(mathietbi) { // THÊM HÀM NÀY
        try {
            const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME_THIETBI} WHERE MATHIETBI = ?`, [mathietbi]);
            // console.log(`EquipmentRepository: findById response for ${mathietbi}:`, rows);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error in EquipmentRepository.findById for ${mathietbi}:`, error);
            throw error;
        }
    }

    async create(equipmentData) {
        const {
            MATHIETBI, TENTHIETBI, LOAITHIETBI, VITRITHIETBI, TRANGTHAI,
            NGAYMUA, NGAYHETBAOHANH, NGAYBAOTRI, GIA, GHICHU
        } = equipmentData;

        const sql = `INSERT INTO ${TABLE_NAME_THIETBI} 
                     (MATHIETBI, TENTHIETBI, LOAITHIETBI, VITRITHIETBI, TRANGTHAI, 
                      NGAYMUA, NGAYHETBAOHANH, NGAYBAOTRI, GIA, GHICHU) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            MATHIETBI, TENTHIETBI, LOAITHIETBI, VITRITHIETBI, TRANGTHAI,
            NGAYMUA || null, NGAYHETBAOHANH || null, NGAYBAOTRI || null, 
            GIA === '' || GIA === null || GIA === undefined ? null : GIA, // Xử lý GIA có thể rỗng
            GHICHU || null,
        ];

        // console.log('EquipmentRepository: Attempting to insert equipment with SQL', sql);
        // console.log('EquipmentRepository: Values for insert', values);

        try {
            const [result] = await pool.query(sql, values);
            // console.log('EquipmentRepository: Inserted equipment successfully:', result);
            if (result.affectedRows === 1) {
                // Trả về dữ liệu thiết bị vừa tạo, có thể lấy lại từ DB để đảm bảo nhất quán
                return await this.findById(MATHIETBI); 
            } else {
                throw new Error('Failed to insert equipment: No rows affected.');
            }
        } catch (error) {
            console.error('Error in EquipmentRepository.create:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                const customError = new Error(`Thiết bị với mã ${MATHIETBI} đã tồn tại.`);
                customError.statusCode = 409; // Conflict
                throw customError;
            }
            // Ném lỗi chung hơn nếu không phải lỗi trùng lặp
            throw new Error('Lỗi cơ sở dữ liệu khi tạo thiết bị. Chi tiết: ' + error.message);
        }
    }

    async findExactDuplicate(equipmentDetails){
        const fieldsToCompare = [
            'MATHIETBI', 'TENTHIETBI', 'LOAITHIETBI', 'VITRITHIETBI',
            'TRANGTHAI', 'NGAYMUA', 'NGAYHETBAOHANH', 'NGAYBAOTRI', 'GIA'
        ];
        // Chỉ thêm điều kiện cho các trường thực sự có giá trị trong equipmentDetails
        const validFields = fieldsToCompare.filter(field => equipmentDetails[field] !== undefined && equipmentDetails[field] !== null && equipmentDetails[field] !== '');
        
        if (validFields.length === 0) {
            // Không có trường nào để so sánh, không thể coi là trùng lặp
            return false; 
        }

        const conditions = validFields.map(field => `${field} = ?`).join(' AND ');
        const values = validFields.map(field => equipmentDetails[field]);
        
        const sql = `SELECT COUNT(*) AS count FROM ${TABLE_NAME_THIETBI} WHERE ${conditions}`;
        try {
            const [rows] = await pool.query(sql, values);
            return rows[0].count > 0;
        } catch (error) {
            console.error('Lỗi khi kiểm tra bản ghi trùng:', error);
            throw error;
        }
    }

    // THÊM HÀM MỚI ĐỂ CẬP NHẬT TRẠNG THÁI
    async updateStatus(mathietbi, newStatus) {
        try {
            const sql = `UPDATE ${TABLE_NAME_THIETBI} SET TRANGTHAI = ? WHERE MATHIETBI = ?`;
            console.log(`[EquipmentRepo-updateStatus] SQL: ${sql} Values: [${newStatus}, ${mathietbi}]`);
            const [result] = await pool.query(sql, [newStatus, mathietbi]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating status for equipment ${mathietbi} in repo:`, error);
            throw error;
        }
    }
}

module.exports = new EquipmentRepository();