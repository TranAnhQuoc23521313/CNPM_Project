const pool = require('../config/db');

async function getMaxProductIdNumeric() {
    try {
        // Giả sử MASP có dạng SPxxxxxxx (SP + 7 chữ số)
        const [rows] = await pool.query("SELECT MAX(CAST(SUBSTRING(MASP, 3) AS UNSIGNED)) as max_id FROM SANPHAMKHAC WHERE MASP LIKE 'SP%'");
        if (rows && rows.length > 0 && rows[0].max_id !== null) {
            return parseInt(rows[0].max_id, 10);
        }
        return 0;
    } catch (error) {
        console.error("Error fetching max product ID:", error);
        throw new Error("Could not determine the next product ID.");
    }
}

async function generateNextProductId() { // Tên hàm phải chính xác
    const maxId = await getMaxProductIdNumeric();
    const nextNumericId = maxId + 1;
    // Đảm bảo padStart đúng số lượng chữ số bạn muốn (ví dụ 7 hoặc 8)
    const paddedNumericId = String(nextNumericId).padStart(8, '0');
    return `SP${paddedNumericId}`;
}

module.exports = { generateNextProductId };