// src/repositories/facilityRepair.repository.js
const pool = require('../config/db');
const TABLE_NAME = 'THIETBI_SUACHUA';

class FacilityRepairRepository {
    async create(repairData) {
        try {
            const columns = Object.keys(repairData).join(', ');
            const placeholders = Object.keys(repairData).map(() => '?').join(', ');
            const values = Object.values(repairData);

            const sql = `INSERT INTO ${TABLE_NAME} (${columns}) VALUES (${placeholders})`;
            console.log(`[Repo] Executing SQL: ${sql} with values:`, values);

            const [result] = await pool.query(sql, values);
            // Tương tự như trên, xử lý giá trị trả về
            if (result.insertId) {
                return { ...repairData, id: result.insertId };
            }
            return await this.findById(repairData.MASUACHUA);
        } catch (error) {
            console.error(`Error creating facility repair in repository:`, error);
            throw error;
        }
    }

    async findById(masuachua) {
        try {
            const sql = `SELECT * FROM ${TABLE_NAME} WHERE MASUACHUA = ?`;
            console.log(`[Repo] Executing SQL: ${sql} with MASUACHUA:`, masuachua);

            const [rows] = await pool.query(sql, [masuachua]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error finding repair by ID ${masuachua}:`, error);
            throw error;
        }
    }

    async findAllByIncidentId(masuco) {
        try {
            const sql = `SELECT * FROM ${TABLE_NAME} WHERE MASUCO = ? ORDER BY NGAYSUACHUA DESC`;
            console.log(`[Repo] Executing SQL: ${sql} with MASUCO:`, masuco);

            const [rows] = await pool.query(sql, [masuco]);
            return rows;
        } catch (error) {
            console.error(`Error finding repairs for incident ${masuco}:`, error);
            throw error;
        }
    }

    async findAllRepairs(queryParams = {}) {
        let sql = `
            SELECT 
                sr.*, 
                sc.NGAY_BAOCAO AS NGAY_BAOCAO_SUCO,
                sc.MOTA AS MOTA_SUCO,
                sc.MATHIETBI AS MATHIETBI, /* Lấy MATHIETBI từ sự cố */
                tb.TENTHIETBI AS TENTHIETBI,
                nv_sua.TENNV AS TEN_NV_SUA
            FROM THIETBI_SUACHUA sr
            LEFT JOIN THIETBI_SUCO sc ON sr.MASUCO = sc.MASUCO
            LEFT JOIN THIETBI tb ON sc.MATHIETBI = tb.MATHIETBI
            LEFT JOIN NHANVIEN nv_sua ON sr.MANV = nv_sua.MANV /* MANV này là người sửa */
            ORDER BY sr.NGAYSUACHUA DESC
        `;
        // Thêm logic lọc/phân trang tương tự như findAllIncidents nếu cần

        try {
            const [rows] = await pool.query(sql);
            return rows;
        } catch (error) {
            console.error(`Repository Error: Error finding all repairs:`, error);
            throw error;
        }
    }
}

module.exports = new FacilityRepairRepository();