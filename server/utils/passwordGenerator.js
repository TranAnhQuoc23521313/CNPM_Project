const crypto = require('crypto');

function generateRandomPassword(length = 12) {
  // Bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (tùy chỉnh nếu cần)
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(crypto.randomInt(n)));
  }
  return password;
}

module.exports = { generateRandomPassword };