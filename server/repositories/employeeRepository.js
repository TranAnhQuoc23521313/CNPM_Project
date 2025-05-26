const pool = require("../config/db")

class EmployeeRepository {
    async findAll() {
        const sql = `
            SELECT 
                nv.*, 
                tk.MATK, tk.TENDANGNHAP, tk.MATKHAU, tk.ROLE_DANGNHAP, tk.TOKEN_MOCK 
            FROM NHANVIEN nv
            LEFT JOIN TAIKHOAN tk ON nv.MANV = tk.MANV
        `;
        try {
            const [rows] = await pool.query(sql);
            return rows;
        } catch (error) {
            console.error('Error in EmployeeRepository.findAll:', error);
            throw new Error('Database query failed to fetch employees with account info.');
        }
    }

    async findById(employeeId) {
        const sql = `
            SELECT 
                nv.*, 
                tk.MATK, tk.TENDANGNHAP, tk.MATKHAU, tk.ROLE_DANGNHAP, tk.TOKEN_MOCK 
            FROM NHANVIEN nv
            LEFT JOIN TAIKHOAN tk ON nv.MANV = tk.MANV
            WHERE nv.MANV = ?
        `;
        try {
            const [rows] = await pool.query(sql, [employeeId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error)
        {
            console.error('Error in EmployeeRepository.findById:', error);
            throw new Error('Database query failed to fetch employee by ID with account info.');
        }
    }

    async create(employeeData) {
        const { MANV, TENNV, VITRI, SDT, EMAIL, NGAYSINH, NGAYLAM, GIOITINH, DIACHI, LUONG } = employeeData;

        const sql = 'INSERT INTO NHANVIEN (MANV, TENNV, VITRI, SDT, EMAIL, NGAYSINH, NGAYLAM, GIOITINH, DIACHI, LUONG) VALUES (?,?,?,?,?,?,?,?,?,?)';

        const values = [
            MANV,
            TENNV,
            VITRI,
            SDT,
            EMAIL,
            NGAYSINH ? new Date(NGAYSINH).toISOString().slice(0, 10) : null,
            NGAYLAM ? new Date(NGAYLAM).toISOString().slice(0, 10) : null,
            GIOITINH,
            DIACHI,
            LUONG];

        console.log('EmployeeRepository: Attempting to insert employee with SQL:', sql);
        console.log('EmployeeRepository: Values for insert:', values);

        try {
            const [result] = await pool.query(sql, values);
            console.log('EmployeeRepository: Insert result:', result);
            if (result.affectedRows === 1) {
                return { ...employeeData };
            }
            throw new Error('Failed to create product in DB: No rows affected.');
        } catch (error) {
            console.error('Error in EmployeeRepository.create:', error);
            if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes(MANV)) {
                throw new Error(`Employee ID (MANV) '${MANV}' already exists.`);
            }
            throw new Error('DB query failed: Could not create employee. Details: ' + error.message);
        }

    }

    async findExactDuplicate(employeeDetails) {
        const fieldsToCompare = [
            'TENNV', 'VITRI', 'SDT', 'EMAIL', 'NGAYSINH',
            'NGAYLAM', 'GIOITINH', 'DIACHI', 'LUONG'
        ];

        const conditions = fieldsToCompare.map(field => `${field} = ?`).join(' AND ');
        const values = fieldsToCompare.map(field => employeeDetails[field] ?? null);

        const sql = `SELECT COUNT(*) AS count FROM NHANVIEN WHERE ${conditions}`;

        try {
            const [rows] = await pool.execute(sql, values); // nếu dùng mysql2
            return rows[0].count > 0;
        } catch (error) {
            console.error('Lỗi khi kiểm tra bản ghi trùng:', error);
            throw error;
        }
    }

    async update(manv, employeeData) {
        // Chỉ lấy các trường được phép cập nhật từ employeeData
        const fieldsToUpdate = {};
        const allowedFields = ['TENNV', 'VITRI', 'SDT', 'EMAIL', 'NGAYSINH', 'NGAYLAM', 'GIOITINH', 'DIACHI', 'LUONG'];
        
        for (const key of allowedFields) {
            if (employeeData[key] !== undefined) { // Chỉ cập nhật nếu trường đó được cung cấp
                if((key === 'NGAYSINH' || key === 'NGAYLAM') && employeeData[key]) {
                    fieldsToUpdate[key] = new Date(employeeData[key]).toISOString().slice(0,10);
                } else if (key === 'LUONG' && employeeData[key]) {
                    fieldsToUpdate[key] = parseInt(employeeData[key], 10);
                }
                else {
                    fieldsToUpdate[key] = employeeData[key];
                }
            }
        }

        if (Object.keys(fieldsToUpdate).length === 0) {
            console.log("No fields to update for employee:", manv);
            return { affectedRows: 0 }; // Không có gì để cập nhật
        }

        const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), manv];
        const sql = `UPDATE NHANVIEN SET ${setClauses} WHERE MANV = ?`;

        console.log("Executing SQL for update employee:", sql, values);
        try {
            const [result] = await pool.query(sql, values);
            if (result.affectedRows === 0) {
                console.warn(`No employee found with MANV ${manv} to update, or no data changed.`);
            }
            return result; // Trả về result object từ mysql (chứa affectedRows, etc.)
        } catch (error) {
            console.error(`Error updating employee ${manv}:`, error);
            throw error;
        }
    }

    async deleteById(employeeId, connectionOrPool = pool) {
        const sql = 'DELETE FROM NHANVIEN WHERE MANV = ?';
        console.log(`EmployeeRepository: Deleting employee with MANV ${employeeId}`);
        try {
            const [result] = await connectionOrPool.query(sql, [employeeId]);
            // result.affectedRows sẽ là 1 nếu xóa thành công, 0 nếu không tìm thấy MANV
            return result; // Trả về result object từ mysql
        } catch (error) {
            console.error(`Error deleting employee ${employeeId}:`, error);
            throw error; // Ném lỗi để service xử lý
        }
    }
}

module.exports = new EmployeeRepository();