const pool = require('../config/db');

async function getMaxMovieId() {
    try {
        const [rows] = await pool.query("SELECT MAX(CAST(SUBSTRING(MAPHIM, 2) AS UNSIGNED)) as max_id FROM PHIM WHERE MAPHIM LIKE 'P%'");
        if (rows && rows.length > 0 && rows[0].max_id !== null) {
            return parseInt(rows[0].max_id, 10);
        }
        return 0; // Nếu không có phim nào hoặc không có dạng Pxxxxxxxxx
    } catch (error) {
        console.error("Error fetching max movie ID:", error);
        throw new Error("Could not determine the next movie ID.");
    }
}

async function generateNextMovieId() {
    const maxId = await getMaxMovieId();
    const nextNumericId = maxId + 1;
    // Đảm bảo ID có 9 chữ số, thêm số 0 vào trước nếu cần
    const paddedNumericId = String(nextNumericId).padStart(9, '0');
    return `P${paddedNumericId}`;
}

module.exports = { generateNextMovieId };
