// services/authApiService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Đảm bảo đúng port
const AUTH_API_ENDPOINT = `${API_URL}/api/auth`;

export const loginApi = async (credentials) => {
    // credentials là object { username: "...", password: "..." }
    console.log("authApiService: Attempting login with credentials:", credentials);
    try {
        const response = await axios.post(`${AUTH_API_ENDPOINT}/login`, credentials, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("authApiService: Login API response received", response.data);
        // response.data từ server nên là { message: "...", user: { username, role, manv }, token: "..." }
        return response.data;
    } catch (error) {
        console.error("authApiService: Error during login API call", error.response?.data || error.message);
        const serverError = error.response?.data || { message: error.message || "Login failed via API" };
        throw serverError; // Ném object lỗi từ server
    }
};

// (Tùy chọn) Thêm hàm gọi API xác thực OTP
// export const verifyOtpApi = async (otpData) => { ... }