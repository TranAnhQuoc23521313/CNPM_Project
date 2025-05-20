const pool = require('../config/db');

class ProductRepository {
    async findAll() {
        const sql = 'SELECT MASP, TENSP, LOAISP, GIASP, SOLUONG, TRANGTHAISP, HINHANHSP FROM SANPHAMKHAC ORDER BY TENSP ASC';
        try {
            const [rows] = await pool.query(sql);
            return rows;
        } catch (error) {
            console.error('Error in ProductRepository.findAll:', error);
            throw new Error('DB query failed: Could not fetch products.');
        }
    }

    async findById(masp) {
        const sql = 'SELECT MASP, TENSP, LOAISP, GIASP, SOLUONG, TRANGTHAISP, HINHANHSP FROM SANPHAMKHAC WHERE MASP = ?';
        try {
            const [rows] = await pool.query(sql, [masp]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error in ProductRepository.findById for ${masp}:`, error);
            throw new Error(`DB query failed: Could not find product ${masp}.`);
        }
    }

    async create(productData) {
        // productData đã có MASP tự sinh từ service
        const { MASP, TENSP, LOAISP, GIASP, SOLUONG, TRANGTHAISP, HINHANHSP } = productData;

        const sql = `INSERT INTO SANPHAMKHAC (MASP, TENSP, LOAISP, GIASP, SOLUONG, TRANGTHAISP, HINHANHSP)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`; // 7 dấu ?
        const values = [
            MASP,
            TENSP,
            LOAISP,
            GIASP,
            SOLUONG,
            TRANGTHAISP, // Giá trị mặc định
            HINHANHSP
        ];
        console.log('ProductRepository: Attempting to insert product with SQL:', sql);
        console.log('ProductRepository: Values for insert:', values);

        try {
            const [result] = await pool.query(sql, values);
            console.log('ProductRepository: Insert result:', result);
            if (result.affectedRows === 1) {
                return { ...productData };
            }
            throw new Error('Failed to create product in DB: No rows affected.');
        } catch (error) {
            console.error('Error in ProductRepository.create:', error);
            if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes(MASP)) {
                throw new Error(`Product ID (MASP) '${MASP}' already exists.`);
            }
            throw new Error('DB query failed: Could not create product. Details: ' + error.message);
        }
    }

    async update(masp, productData) {
        const fieldsToUpdate = [];
        const values = [];
        const updatableFields = ['TENSP', 'LOAISP', 'GIASP', 'SOLUONG', 'TRANGTHAISP', 'HINHANHSP'];

        updatableFields.forEach(field => {
            if (productData.hasOwnProperty(field)) {
                fieldsToUpdate.push(`${field} = ?`);
                let valueToSet = productData[field];
                if (field === 'GIASP' || field === 'SOLUONG') {
                    valueToSet = (valueToSet === undefined || valueToSet === null || valueToSet === '') ? null : parseInt(valueToSet, 10);
                    if (isNaN(valueToSet)) valueToSet = null;
                } else if (valueToSet === '') {
                    // Cho phép chuỗi rỗng cho các trường text hoặc set null nếu cột cho phép
                    valueToSet = (field === 'TENSP' && valueToSet === '') ? '' : (valueToSet === '' ? null : valueToSet);
                }
                values.push(valueToSet);
            }
        });

        if (fieldsToUpdate.length === 0) return 0;

        values.push(masp);
        const sql = `UPDATE SANPHAMKHAC SET ${fieldsToUpdate.join(', ')} WHERE MASP = ?`;
        try {
            const [result] = await pool.query(sql, values);
            return result.affectedRows;
        } catch (error) {
            console.error(`Error in ProductRepository.update for ${masp}:`, error);
            throw new Error(`DB query failed: Could not update product ${masp}.`);
        }
    }

    async delete(masp) {
        const sql = 'DELETE FROM SANPHAMKHAC WHERE MASP = ?';
        try {
            const [result] = await pool.query(sql, [masp]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Error in ProductRepository.delete for ${masp}:`, error);
            throw new Error(`DB query failed: Could not delete product ${masp}.`);
        }
    }

    async findExactDuplicate(productDetails, excludeMasp = null) { // Thêm excludeMasp cho update sau này
        // Danh sách các trường sẽ được dùng để so sánh sự trùng lặp chính xác
        // (ngoại trừ MASP và HINHANHSP)
        const fieldsToCompare = ['TENSP', 'LOAISP', 'GIASP', 'SOLUONG', 'TRANGTHAISP'];
        const conditions = [];
        const params = [];

        fieldsToCompare.forEach(field => {
            if (productDetails.hasOwnProperty(field) && productDetails[field] !== undefined && productDetails[field] !== null) {
                if (field === 'GIASP' || field === 'SOLUONG') {
                    const numericValue = parseInt(productDetails[field], 10);
                    if (!isNaN(numericValue)) {
                        conditions.push(`${field} = ?`);
                        params.push(numericValue);
                    } else {
                        // Nếu không phải số hợp lệ, có thể so sánh với NULL hoặc bỏ qua (tùy logic)
                        // Để so sánh chính xác, nếu client gửi giá trị không phải số cho trường số,
                        // thì không nên coi là trùng với bản ghi có giá trị số khác.
                        // Ở đây, ta có thể coi là không khớp nếu parse lỗi.
                        // Hoặc nếu muốn so sánh với NULL nếu parse lỗi:
                        conditions.push(`${field} IS NULL`);
                    }
                } else { // Trường text
                    conditions.push(`${field} = ?`);
                    params.push(productDetails[field]);
                }
            } else {
                // Nếu trường không có trong productDetails hoặc là null/undefined,
                // chúng ta sẽ so sánh với cột tương ứng trong DB là NULL
                conditions.push(`${field} IS NULL`);
            }
        });

        if (conditions.length === 0) {
            console.warn('ProductRepository.findExactDuplicate: No valid fields provided for comparison.');
            return false; // Không có gì để so sánh, không thể trùng
        }

        let sql = `SELECT COUNT(*) as count FROM SANPHAMKHAC WHERE ${conditions.join(' AND ')}`;

        if (excludeMasp) {
            sql += ' AND MASP != ?';
            params.push(excludeMasp);
        }

        console.log(`ProductRepository: Checking exact duplicate product with SQL: ${sql}`, params);
        try {
            const [rows] = await pool.query(sql, params);
            return rows[0].count > 0;
        } catch (error) {
            console.error('Error in ProductRepository.findExactDuplicate:', error);
            throw new Error('DB query failed while checking for exact duplicate product.');
        }
    }
}
module.exports = new ProductRepository();