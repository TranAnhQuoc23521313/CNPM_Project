const pool = require("../config/db");

class AccountRepository {
    async findByUsername(username) {
        const sql = 'SELECT * FROM TAIKHOAN WHERE TENDANGNHAP = ?';
        try {
            const [rows] = await pool.query(sql, [username]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error in AccountRepository.findByUsername:', error);
            throw error;
        }
    }

    async findByMATK(matk) { // Cần thiết để kiểm tra MATK trùng
        const sql = 'SELECT * FROM TAIKHOAN WHERE MATK = ?';
        try {
            const [rows] = await pool.query(sql, [matk]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error in AccountRepository.findByMATK:', error);
            throw error;
        }
    }


    async create(accountData) {
        const { MATK, MANV, TENDANGNHAP, MATKHAU, ROLE_DANGNHAP, TOKEN_MOCK } = accountData;
        const sql = 'INSERT INTO TAIKHOAN (MATK, MANV, TENDANGNHAP, MATKHAU, ROLE_DANGNHAP, TOKEN_MOCK) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [MATK, MANV, TENDANGNHAP, MATKHAU, ROLE_DANGNHAP, TOKEN_MOCK];
        try {
            const [result] = await pool.query(sql, values);
            if (result.affectedRows === 1) {
                return { ...accountData };
            }
            throw new Error('Failed to create account in DB: No rows affected.');
        } catch (error) {
            console.error('Error in AccountRepository.create:', error);
            throw error; // Ném lỗi để service xử lý (rollback transaction)
        }
    }

    async updatePasswordByManv(manv, newHashedPasswordOrPlainText) {
        // newHashedPasswordOrPlainText là mật khẩu đã được xử lý (hash hoặc text thuần) bởi service
        const sql = 'UPDATE TAIKHOAN SET MATKHAU = ? WHERE MANV = ?';
        const values = [newHashedPasswordOrPlainText, manv];
        console.log(`AccountRepository: Updating password for MANV ${manv}`);
        try {
            const [result] = await pool.query(sql, values);
            return result; // Trả về result object từ mysql
        } catch (error) {
            console.error(`Error updating password for MANV ${manv}:`, error);
            throw error;
        }
    }

    async updateRoleByManv(manv, newRole, connectionOrPool = pool) {
        const sql = 'UPDATE TAIKHOAN SET ROLE_DANGNHAP = ? WHERE MANV = ?';
        const values = [newRole, manv];
        console.log(`AccountRepository: Updating role for MANV ${manv} to ${newRole}`);
        try {
            const [result] = await connectionOrPool.query(sql, values);
            return result; // Trả về result object từ mysql
        } catch (error) {
            console.error(`Error updating role for MANV ${manv}:`, error);
            throw error;
        }
    }

    async deleteByManv(manv, connectionOrPool = pool) {
        const sql = 'DELETE FROM TAIKHOAN WHERE MANV = ?';
        console.log(`AccountRepository: Deleting accounts for MANV ${manv}`);
        try {
            const [result] = await connectionOrPool.query(sql, [manv]);
            // result.affectedRows sẽ là số lượng tài khoản đã bị xóa (có thể là 0 nếu không có tài khoản nào)
            console.log(`AccountRepository: Deleted ${result.affectedRows} account(s) for MANV ${manv}.`);
            return result;
        } catch (error) {
            console.error(`Error deleting accounts for MANV ${manv}:`, error);
            throw error; // Ném lỗi để service xử lý (rollback transaction)
        }
    }
}

module.exports = new AccountRepository();