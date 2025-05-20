// server/utils/showtimeIdGenerator.js (hoặc thêm vào file idGenerator.js)
const pool = require('../config/db');

async function getMaxShowtimeIdNumeric() {
    try {
        // Giả sử MASUATCHIEU có dạng SCxxxxxxx (SC + 7 chữ số)
        const [rows] = await pool.query("SELECT MAX(CAST(SUBSTRING(MASUATCHIEU, 3) AS UNSIGNED)) as max_id FROM SUATCHIEU WHERE MASUATCHIEU LIKE 'SC%'");
        if (rows && rows.length > 0 && rows[0].max_id !== null) {
            return parseInt(rows[0].max_id, 10);
        }
        return 0;
    } catch (error) {
        console.error("Error fetching max showtime ID:", error);
        throw new Error("Could not determine the next showtime ID.");
    }
}

async function generateNextShowtimeId() {
    const maxId = await getMaxShowtimeIdNumeric();
    const nextNumericId = maxId + 1;
    const paddedNumericId = String(nextNumericId).padStart(7, '0'); // 7 chữ số
    return `SC${paddedNumericId}`;
}

module.exports = { generateNextShowtimeId };