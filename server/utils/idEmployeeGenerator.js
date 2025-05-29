const pool = require('../config/db')

async function getMaxEmployeeID() {
    try {
        const [rows] = await pool.query("SELECT MAX(CAST(SUBSTRING(MANV, 3) AS UNSIGNED)) as max_id FROM NHANVIEN WHERE MANV LIKE 'NV%'");
        if (rows && rows.length > 0 && rows[0].max_id !== null) {
            return parseInt(rows[0].max_id, 10);
        }
        return 0; // Nếu không có phim nào hoặc không có dạng NVxxxxxxxx
    } catch (error) {
        console.error("Error fetching max employee ID:", error);
        throw new Error("Could not determine the next employee ID.");
    }
}

async function GenerateNextEmployeeId() {
    const maxId = await getMaxEmployeeID();
    const nextNumericId = maxId + 1;
    // Đảm bảo ID có 9 chữ số, thêm số 0 vào trước nếu cần
    const paddedNumericId = String(nextNumericId).padStart(8, '0');
    return `NV${paddedNumericId}`;
}

module.exports = { GenerateNextEmployeeId };