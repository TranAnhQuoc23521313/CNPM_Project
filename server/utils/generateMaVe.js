// server/utils/generateMaVe.js
async function generateMultipleMaVe(connection, count) {
  const prefix = 'V';
  const numericPartLength = 9;
  const callId = Math.random().toString(36).substring(7); // Để debug
  // console.log(`[generateMultipleMaVe - ${callId}] Requesting ${count} MAVEs`);
  const generatedCodes = [];

  try {
    // Vẫn dùng FOR UPDATE để lấy số bắt đầu một cách an toàn,
    // đảm bảo không có transaction nào khác xen vào giữa lúc đọc và "đặt chỗ" dãy số này.
    const [rows] = await connection.query(
      `SELECT MAVE FROM VE WHERE MAVE LIKE ? ORDER BY MAVE DESC LIMIT 1 FOR UPDATE`,
      [`${prefix}%`]
    );
    // console.log(`[generateMultipleMaVe - ${callId}] SELECT FOR UPDATE result:`, JSON.stringify(rows));

    let nextNumericValue = 1;
    if (rows.length > 0) {
      const lastMaVe = rows[0].MAVE;
      if (lastMaVe && lastMaVe.startsWith(prefix)) {
        const lastNumericPart = lastMaVe.substring(prefix.length);
        const parsedLastNumeric = parseInt(lastNumericPart, 10);
        if (!isNaN(parsedLastNumeric)) {
          nextNumericValue = parsedLastNumeric + 1;
        } else {
          console.warn(`[generateMultipleMaVe - ${callId}] Phần số '${lastNumericPart}' từ MAVE '${lastMaVe}' không hợp lệ. Defaulting to 1.`);
        }
      } else {
        console.warn(`[generateMultipleMaVe - ${callId}] MAVE cuối cùng '${lastMaVe}' không có tiền tố '${prefix}'. Defaulting to 1.`);
      }
    } else {
      // console.log(`[generateMultipleMaVe - ${callId}] No existing MAVE found. Starting from 1.`);
    }
    // console.log(`[generateMultipleMaVe - ${callId}] Starting numeric value for batch: ${nextNumericValue}`);

    for (let i = 0; i < count; i++) {
      const currentNumericValue = nextNumericValue + i;
      const newMaVe = prefix + String(currentNumericValue).padStart(numericPartLength, '0');
      generatedCodes.push(newMaVe);
    }
    console.log(`[generateMultipleMaVe - ${callId}] Generated MAVE Batch:`, JSON.stringify(generatedCodes));
    return generatedCodes;

  } catch (error) {
    console.error(`[generateMultipleMaVe - ${callId}] ACTUAL ERROR:`, error);
    throw new Error('Không thể tạo các mã vé mới do lỗi hệ thống.');
  }
}

module.exports = generateMultipleMaVe; // Đổi tên export