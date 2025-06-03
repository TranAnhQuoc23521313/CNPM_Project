// src/utils/issue_fix_id_Generator.js
const pool = require('../config/db'); // Giả định pool là từ mysql2/promise hoặc tương tự

/**
 * Hàm chung để tạo ID mới dựa trên ID số lớn nhất hiện có với một tiền tố nhất định,
 * sử dụng pool.query()
 *
 * @param {string} tableName Tên bảng.
 * @param {string} columnName Tên cột chứa ID.
 * @param {string} prefix Tiền tố của ID (ví dụ: 'SC', 'SR').
 * @param {number} minLength Độ dài mong muốn của phần số trong ID (sẽ được đệm bằng số 0 ở đầu).
 * @returns {Promise<string>} ID mới được tạo.
 * @throws {Error} Nếu không thể xác định ID tiếp theo.
 */
async function generateNewId(tableName, columnName, prefix, minLength = 3) {
    console.log(`[idGenerator] Đang tạo ID cho: table=${tableName}, column=${columnName}, prefix=${prefix}, minNumericLength=${minLength}`);
    let lastIdFromDb = null;

    try {
        // Câu SQL để lấy ID lớn nhất hiện tại có dạng prefix + số, sắp xếp theo phần số giảm dần
        // Ví dụ: Nếu ID là 'SC005', prefix 'SC', thì SUBSTRING sẽ lấy '005' và CAST thành số 5.
        const sql = `
            SELECT ${columnName}
            FROM ${tableName}
            WHERE ${columnName} LIKE ?
            ORDER BY CAST(SUBSTRING(${columnName}, ${prefix.length + 1}) AS UNSIGNED) DESC
            LIMIT 1
        `;
        // SQL LIKE pattern, ví dụ 'SC%'
        const likePattern = `${prefix}%`;

        console.log(`[idGenerator] Thực thi query: ${sql.trim().replace(/\s+/g, ' ')} với pattern: ${likePattern}`);
        const [rows] = await pool.query(sql, [likePattern]); // pool.query trả về [rows, fields]

        if (rows && rows.length > 0 && rows[0] && rows[0][columnName]) {
            lastIdFromDb = rows[0][columnName];
            console.log(`[idGenerator] ID cuối cùng tìm thấy từ DB: ${lastIdFromDb}`);
        } else {
            console.log(`[idGenerator] Không tìm thấy ID nào với tiền tố ${prefix} trong bảng ${tableName}. Bắt đầu từ 1.`);
        }
    } catch (error) {
        console.error(`[idGenerator] Lỗi khi lấy ID cuối cùng cho ${prefix} từ ${tableName}:`, error);
        throw new Error(`Không thể lấy ID cuối cùng cho ${prefix}. Lỗi gốc: ${error.message}`);
    }

    let nextNumericPart = 1;
    if (lastIdFromDb) {
        const numericPartStr = lastIdFromDb.substring(prefix.length);
        if (!isNaN(parseInt(numericPartStr))) {
            nextNumericPart = parseInt(numericPartStr) + 1;
        } else {
            // Trường hợp này không nên xảy ra nếu dữ liệu DB đúng định dạng
            console.warn(`[idGenerator] ID cuối cùng ${lastIdFromDb} cho tiền tố ${prefix} không đúng định dạng. Bắt đầu từ 1.`);
        }
    }
    // else: nextNumericPart đã là 1

    const newId = `${prefix}${String(nextNumericPart).padStart(minLength, '0')}`;
    console.log(`[idGenerator] ID mới được tạo: ${newId}`);
    return newId;
}

module.exports = {
    generateNewIncidentId: async () => generateNewId('THIETBI_SUCO', 'MASUCO', 'SC', 12),
    generateNewRepairId: async () => generateNewId('THIETBI_SUACHUA', 'MASUACHUA', 'SR', 12),
    // Bạn có thể export cả hàm generateNewId nếu muốn dùng trực tiếp từ nơi khác
    // generateNewId
};