// server/repositories/customerRepository.js
const pool = require('../config/db');

class CustomerRepository {

    async findAll(connection = pool) { // Bỏ searchTerm
        const sql = `
            SELECT MAKH, HOTEN, SODT, NGAYDKTV, EMAIL, NGAYSINH, SOTIENDACHI 
            FROM KHACHHANG
            ORDER BY NGAYDKTV DESC 
        `; // Bỏ phần WHERE và params
        try {
            const [rows] = await connection.query(sql); // Không cần params
            return rows;
        } catch (error) {
            console.error('Error in CustomerRepository.findAll:', error);
            throw error;
        }
    }

    async findByPhone(phoneNumber, connection = pool) {
        const sql = 'SELECT MAKH, HOTEN, SODT, NGAYDKTV, EMAIL, NGAYSINH, SOTIENDACHI FROM KHACHHANG WHERE SODT = ?'; // Lấy các cột cần thiết
        try {
            const [rows] = await connection.query(sql, [phoneNumber]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error in CustomerRepository.findByPhone:', error);
            throw error;
        }
    }

    async findById(maKH, connection = pool) {
        const sql = 'SELECT MAKH, HOTEN, SODT, NGAYDKTV, EMAIL, NGAYSINH, SOTIENDACHI FROM KHACHHANG WHERE MAKH = ?';
        try {
            const [rows] = await connection.query(sql, [maKH]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error in CustomerRepository.findById:', error);
            throw error;
        }
    }

    async create(customerData, connection = pool) {
        const { MAKH, HOTEN, SODT, EMAIL, NGAYSINH } = customerData;
        const NGAYDKTV = new Date(); // NGAYDKTV là ngày hiện tại
        const SOTIENDACHI = 0;       // SOTIENDACHI mặc định là 0

        const sql = `
            INSERT INTO KHACHHANG (MAKH, HOTEN, SODT, NGAYDKTV, EMAIL, NGAYSINH, SOTIENDACHI)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            MAKH,
            HOTEN,
            SODT,
            NGAYDKTV, // Date object
            EMAIL || null,
            NGAYSINH ? new Date(NGAYSINH).toISOString().slice(0, 10) : null, // Format YYYY-MM-DD
            SOTIENDACHI
        ];
        try {
            const [result] = await connection.query(sql, values);
            if (result.affectedRows === 1) {
                // Trả về object với NGAYDKTV đã được format nếu cần, hoặc để Date object
                return { MAKH, HOTEN, SODT, NGAYDKTV, EMAIL, NGAYSINH, SOTIENDACHI };
            }
            throw new Error('Failed to create customer in DB.');
        } catch (error) {
            console.error('Error in CustomerRepository.create:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                 if (error.sqlMessage.toLowerCase().includes('primary')) { // Giả sử MAKH là PRIMARY KEY
                    throw new Error(`Mã khách hàng '${MAKH}' đã tồn tại.`);
                } else if (error.sqlMessage.toLowerCase().includes('sodt')) { // Nếu có UNIQUE constraint trên SODT
                    throw new Error(`Số điện thoại '${SODT}' đã được đăng ký.`);
                }
            }
            throw error;
        }
    }

    async updateSpending(maKH, amountToAdd, connection = pool) {
        // amountToAdd có thể âm (khi hủy hóa đơn)
        const sql = 'UPDATE KHACHHANG SET SOTIENDACHI = SOTIENDACHI + ? WHERE MAKH = ?';
        try {
            const [result] = await connection.query(sql, [amountToAdd, maKH]);
            if (result.affectedRows === 0) {
                console.warn(`CustomerRepository.updateSpending: No customer found with MAKH ${maKH} or SOTIENDACHI not changed.`);
            }
            return result;
        } catch (error) {
            console.error('Error in CustomerRepository.updateSpending:', error);
            throw error;
        }
    }

    async update(maKH, customerData, connection = pool) { // Thêm hàm update
        const { HOTEN, EMAIL, NGAYSINH, SODT } = customerData; // Chỉ cho phép cập nhật các trường này
        const fieldsToUpdate = [];
        const values = [];

        if (HOTEN !== undefined) { fieldsToUpdate.push('HOTEN = ?'); values.push(HOTEN); }
        if (EMAIL !== undefined) { fieldsToUpdate.push('EMAIL = ?'); values.push(EMAIL || null); }
        if (NGAYSINH !== undefined) { fieldsToUpdate.push('NGAYSINH = ?'); values.push(NGAYSINH ? new Date(NGAYSINH).toISOString().slice(0, 10) : null); }
        if (SODT !== undefined) { fieldsToUpdate.push('SODT = ?'); values.push(SODT); }
        // Không cho update MAKH, NGAYDKTV, SOTIENDACHI trực tiếp qua form này

        if (fieldsToUpdate.length === 0) {
            throw new Error("Không có thông tin nào để cập nhật.");
        }

        values.push(maKH);
        const sql = `UPDATE KHACHHANG SET ${fieldsToUpdate.join(', ')} WHERE MAKH = ?`;
        try {
            const [result] = await connection.query(sql, values);
            return result.affectedRows;
        } catch (error) {
            console.error('Error in CustomerRepository.update:', error);
             if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.toLowerCase().includes('sodt_unique')) {
                throw new Error(`Số điện thoại '${SODT}' đã được sử dụng bởi một khách hàng khác.`);
            }
            throw error;
        }
    }

    async delete(maKH, connection = pool) { // Thêm hàm delete
        const sql = 'DELETE FROM KHACHHANG WHERE MAKH = ?';
        try {
            const [result] = await connection.query(sql, [maKH]);
            return result.affectedRows;
        } catch (error)
        {
            console.error('Error in CustomerRepository.delete:', error);
            // Check for foreign key constraint errors if KHACHHANG is referenced by HOADON
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
                throw new Error('Không thể xóa khách hàng này vì đã có hóa đơn liên quan. Vui lòng xem xét việc vô hiệu hóa tài khoản thay vì xóa.');
            }
            throw error;
        }
    }
}

module.exports = new CustomerRepository();