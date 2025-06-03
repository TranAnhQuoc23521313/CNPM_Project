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

export const getCurrentUserApi = async () => {
    console.log("authApiService: Attempting to fetch current user profile");
    const token = localStorage.getItem('authToken'); // Lấy token
    console.log("authApiService: Token from localStorage for /me request:", token); // DEBUG
    if (!token && !axios.defaults.headers.common['Authorization']) { // Nếu không có token ở cả hai nơi
         console.error("authApiService: No auth token found for /me request.");
         throw new Error("Auth token not found. Please login."); // Ném lỗi rõ ràng
    }
    try {
        // Nếu axios defaults chưa chắc đã có token, tốt nhất là set header ở đây
        // Hoặc đảm bảo nó đã được set sau khi login
        const config = {};
        if (token && !axios.defaults.headers.common['Authorization']) { // Chỉ set nếu default chưa có và token tồn tại
             config.headers = { 'Authorization': `Bearer ${token}` };
        }
        console.log("authApiService: Sending GET /me with config:", config); // DEBUG
        const response = await axios.get(`${AUTH_API_ENDPOINT}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("authApiService: Get current user response received (THIS IS userData):", response.data); // DEBUG THÊM
        return response.data; // response.data sẽ là { id, username, role }
    } catch (error) {
        console.error("authApiService: Error fetching current user", error.response?.data || error.message);
        const serverError = error.response?.data || { message: error.message || "Failed to fetch current user" };
        throw serverError;
    }
};

// (Tùy chọn) Thêm hàm gọi API xác thực OTP
// export const verifyOtpApi = async (otpData) => { ... }