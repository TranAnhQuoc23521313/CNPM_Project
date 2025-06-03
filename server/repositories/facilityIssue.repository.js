// src/repositories/facilityIssue.repository.js
const pool = require('../config/db'); // Đổi tên db thành pool cho nhất quán nếu cần
const TABLE_NAME = 'THIETBI_SUCO';

class FacilityIssueRepository {
    async create(issueData) { // issueData đã chứa HINHANH_SUCO
        try {
            const columns = Object.keys(issueData).join(', ');
            const placeholders = Object.keys(issueData).map(() => '?').join(', ');
            const values = Object.values(issueData);

            const sql = `INSERT INTO ${TABLE_NAME} (${columns}) VALUES (${placeholders})`;
            console.log(`[Repository] Executing SQL: ${sql} with values:`, values);
            // Kiểm tra xem `values` có chứa đúng giá trị cho HINHANH_SUCO không

            const [result] = await pool.query(sql, values);

            // ... (phần trả về kết quả)
            // Quan trọng là giá trị HINHANH_SUCO đã được truyền đúng vào `values`
            // và cột HINHANH_SUCO trong bảng THIETBI_SUCO có kiểu dữ liệu phù hợp
            // (ví dụ: VARCHAR, TEXT để lưu chuỗi tên file, hoặc JSON/ARRAY nếu CSDL hỗ trợ)
            
            // Trả về bản ghi vừa tạo (hoặc thông tin cần thiết)
            // Ví dụ, nếu MASUCO là khóa chính và đã có trong issueData:
            return await this.findById(issueData.MASUCO); 
            // Hoặc nếu bạn muốn trả về issueData trực tiếp:
            // return issueData;
        } catch (error) {
            console.error(`Error creating facility issue in repository:`, error);
            throw error;
        }
    }

    async findById(masuco) {
        try {
            const sql = `SELECT * FROM ${TABLE_NAME} WHERE MASUCO = ?`;
            console.log(`[Repo] Executing SQL: ${sql} with MASUCO:`, masuco);

            const [rows] = await pool.query(sql, [masuco]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error finding issue by ID ${masuco}:`, error);
            throw error;
        }
    }

    async findAllByDeviceId(mathietbi) {
        try {
            const sql = `SELECT * FROM ${TABLE_NAME} WHERE MATHIETBI = ? ORDER BY NGAY_BAOCAO DESC`;
            console.log(`[Repo] Executing SQL: ${sql} with MATHIETBI:`, mathietbi);

            const [rows] = await pool.query(sql, [mathietbi]);
            return rows;
        } catch (error) {
            console.error(`Error finding issues for device ${mathietbi}:`, error);
            throw error;
        }
    }

    // HÀM MỚI
    async findAllIncidents(queryParams = {}) {
        // Xây dựng câu SQL động dựa trên queryParams nếu cần lọc/phân trang
        // Ví dụ đơn giản:
        let sql = `
            SELECT 
                sc.*, 
                tb.TENTHIETBI AS TENTHIETBI, 
                tb.LOAITHIETBI AS LOAITHIETBI,
                tb.VITRITHIETBI AS VITRITHIETBI,
                nv.TENNV AS TEN_NV_BAOCAO 
            FROM THIETBI_SUCO sc
            LEFT JOIN THIETBI tb ON sc.MATHIETBI = tb.MATHIETBI
            LEFT JOIN NHANVIEN nv ON sc.MANV = nv.MANV
            ORDER BY sc.NGAY_BAOCAO DESC
        `;
        // Ví dụ thêm điều kiện lọc nếu có:
        // const conditions = [];
        // const values = [];
        // if (queryParams.status) {
        //   conditions.push("sc.TRANGTHAI_SUCO = ?");
        //   values.push(queryParams.status);
        // }
        // if (conditions.length > 0) {
        //   sql += " WHERE " + conditions.join(" AND ");
        // }
        // sql += " ORDER BY sc.NGAY_BAOCAO DESC";
        // if (queryParams.limit && queryParams.page) {
        //   sql += " LIMIT ? OFFSET ?";
        //   values.push(parseInt(queryParams.limit), (parseInt(queryParams.page) - 1) * parseInt(queryParams.limit));
        // }


        try {
            // const [rows] = await pool.query(sql, values); // Nếu có values
            const [rows] = await pool.query(sql);
            return rows;
        } catch (error) {
            console.error(`Repository Error: Error finding all incidents:`, error);
            throw error;
        }
    }
}

module.exports = new FacilityIssueRepository();