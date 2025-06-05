// src/repositories/facilityIssue.repository.js
const pool = require('../config/db');
const TABLE_NAME = 'THIETBI_SUCO';

class FacilityIssueRepository {
    async create(issueData) {
        try {
            // Service sẽ đảm bảo TRANGTHAI_SUCO được đặt đúng trước khi gọi hàm này.
            // Hoặc bạn có thể đặt DEFAULT 'Chưa giải quyết' cho cột TRANGTHAI_SUCO trong CSDL.
            const columns = Object.keys(issueData).join(', ');
            const placeholders = Object.keys(issueData).map(() => '?').join(', ');
            const values = Object.values(issueData);

            const sql = `INSERT INTO ${TABLE_NAME} (${columns}) VALUES (${placeholders})`;
            console.log(`[Repository-create] Executing SQL: ${sql} with values:`, values);

            const [result] = await pool.query(sql, values);
            return await this.findById(issueData.MASUCO);
        } catch (error) {
            console.error(`Error creating facility issue in repository:`, error);
            throw error;
        }
    }

    async findById(masuco) {
        try {
            const sql = `
                SELECT 
                    sc.*, 
                    tb.TENTHIETBI AS TENTHIETBI_JOINED, 
                    tb.LOAITHIETBI AS LOAITHIETBI_JOINED,
                    tb.VITRITHIETBI AS VITRITHIETBI_JOINED,
                    nv.TENNV AS TEN_NV_BAOCAO_JOINED 
                FROM ${TABLE_NAME} sc
                LEFT JOIN THIETBI tb ON sc.MATHIETBI = tb.MATHIETBI
                LEFT JOIN NHANVIEN nv ON sc.MANV = nv.MANV
                WHERE sc.MASUCO = ?
            `;
            console.log(`[Repo-findById] Executing SQL: ${sql} with MASUCO:`, masuco);

            const [rows] = await pool.query(sql, [masuco]);
            // Ánh xạ lại tên trường để nhất quán với findAllIncidents nếu cần thiết
            // hoặc để client chỉ cần dùng một kiểu map
            if (rows.length > 0) {
                const row = rows[0];
                return {
                    ...row,
                    TENTHIETBI: row.TENTHIETBI_JOINED || row.TENTHIETBI, // Ưu tiên joined, fallback về cột gốc nếu có
                    LOAITHIETBI: row.LOAITHIETBI_JOINED || row.LOAITHIETBI,
                    VITRITHIETBI: row.VITRITHIETBI_JOINED || row.VITRITHIETBI,
                    TEN_NV_BAOCAO: row.TEN_NV_BAOCAO_JOINED || row.MANV // Hoặc một fallback khác
                };
            }
            return null;
        } catch (error) {
            console.error(`Error finding issue by ID ${masuco}:`, error);
            throw error;
        }
    }

    async findAllByDeviceId(mathietbi) {
        try {
            // Chỉ lấy các sự cố "Chưa giải quyết" cho thiết bị này
            const sql = `
                SELECT 
                    sc.*, 
                    tb.TENTHIETBI AS TENTHIETBI, 
                    tb.LOAITHIETBI AS LOAITHIETBI,
                    tb.VITRITHIETBI AS VITRITHIETBI,
                    nv.TENNV AS TEN_NV_BAOCAO
                FROM ${TABLE_NAME} sc
                LEFT JOIN THIETBI tb ON sc.MATHIETBI = tb.MATHIETBI
                LEFT JOIN NHANVIEN nv ON sc.MANV = nv.MANV
                WHERE sc.MATHIETBI = ? AND sc.TRANGTHAI_SUCO = ?
                ORDER BY sc.NGAY_BAOCAO DESC
            `;
            console.log(`[Repo-findAllByDeviceId] Executing SQL with MATHIETBI: ${mathietbi}, TRANGTHAI_SUCO: 'Chưa giải quyết'`);
            const [rows] = await pool.query(sql, [mathietbi, 'Chưa giải quyết']);
            return rows;
        } catch (error) {
            console.error(`Error finding 'Chưa giải quyết' issues for device ${mathietbi}:`, error);
            throw error;
        }
    }

    async findAllIncidents(queryParams = {}) {
        let sql = `
            SELECT 
                sc.*, 
                tb.TENTHIETBI AS TENTHIETBI,  -- Giữ nguyên alias này để client dễ dùng
                tb.LOAITHIETBI AS LOAITHIETBI,
                tb.VITRITHIETBI AS VITRITHIETBI,
                nv.TENNV AS TEN_NV_BAOCAO 
            FROM ${TABLE_NAME} sc
            LEFT JOIN THIETBI tb ON sc.MATHIETBI = tb.MATHIETBI
            LEFT JOIN NHANVIEN nv ON sc.MANV = nv.MANV
        `;
        const conditions = [];
        const values = [];

        // Lọc theo TRANGTHAI_SUCO
        const filterStatus = queryParams.status ? queryParams.status.toLowerCase() : 'chưa giải quyết'; // Mặc định là 'chưa giải quyết'

        if (filterStatus === 'chưa giải quyết') {
            conditions.push("sc.TRANGTHAI_SUCO = ?");
            values.push('Chưa giải quyết');
        } else if (filterStatus === 'đã giải quyết') {
            conditions.push("sc.TRANGTHAI_SUCO = ?");
            values.push('Đã giải quyết');
        } else if (filterStatus === 'tất cả') {
            // Không thêm điều kiện lọc theo TRANGTHAI_SUCO, lấy cả hai
        } else {
            // Mặc định nếu status không hợp lệ, vẫn lấy "Chưa giải quyết"
            conditions.push("sc.TRANGTHAI_SUCO = ?");
            values.push('Chưa giải quyết');
        }

        // Lọc theo từ khóa tìm kiếm
        if (queryParams.searchTerm) {
            const term = `%${queryParams.searchTerm.toLowerCase()}%`;
            conditions.push(`(LOWER(sc.MASUCO) LIKE ? OR LOWER(tb.TENTHIETBI) LIKE ? OR LOWER(sc.MOTA) LIKE ? OR LOWER(nv.TENNV) LIKE ?)`);
            values.push(term, term, term, term);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " ORDER BY sc.NGAY_BAOCAO DESC";
        // (Thêm LIMIT OFFSET cho phân trang nếu cần)

        try {
            console.log(`[Repo-findAllIncidents] Executing SQL: ${sql} with values:`, values);
            const [rows] = await pool.query(sql, values);
            return rows;
        } catch (error) {
            console.error(`Repository Error: Error finding all incidents:`, error);
            throw error;
        }
    }

    // Hàm cập nhật trạng thái sự cố
    async updateStatus(masuco, newStatus) {
        try {
            const sql = `UPDATE ${TABLE_NAME} SET TRANGTHAI_SUCO = ? WHERE MASUCO = ?`;
            console.log(`[Repo-updateStatus] Executing SQL: ${sql} with values: [${newStatus}, ${masuco}]`);
            const [result] = await pool.query(sql, [newStatus, masuco]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating status for issue ${masuco}:`, error);
            throw error;
        }
    }
}

module.exports = new FacilityIssueRepository();