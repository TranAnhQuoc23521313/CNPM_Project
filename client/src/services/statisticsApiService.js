// client/src/services/statisticsApiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const STATS_API_ENDPOINT = `${API_BASE_URL}/api/statistics`;

// Hàm helper để lấy token và tạo headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken'); // Đảm bảo key này đúng với key bạn dùng để lưu token
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // Bạn có thể thêm các headers chung khác ở đây nếu cần
    // headers['Content-Type'] = 'application/json'; // Axios tự xử lý cho GET
    return headers;
};

/**
 * Fetch data for Revenue & Expense Tab.
 * @param {string} period - 'monthly' or 'yearly'
 * @param {number} year
 * @param {number} [month] - Required if period is 'monthly'
 * @returns {Promise<object>} Data for the revenue and expense tab.
 */
export const getRevenueExpenseStatsApi = async (period, year, month) => {
    const params = { period, year };
    if (period === 'monthly' && month) {
        params.month = month;
    }
    console.log(`statisticsApiService: Fetching revenue-expense stats with params:`, params);
    try {
        const response = await axios.get(`${STATS_API_ENDPOINT}/revenue-expense`, {
            params,
            headers: getAuthHeaders() // <--- THÊM HEADERS VÀO ĐÂY
        });
        console.log('statisticsApiService: getRevenueExpenseStatsApi response received:', response.data);
        return response.data;
    } catch (error) {
        console.error('statisticsApiService: Error in getRevenueExpenseStatsApi:', error.response?.data || error.message);
        // Nếu lỗi 401 hoặc 403, có thể bạn muốn xử lý đặc biệt (ví dụ: logout người dùng)
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Xử lý lỗi xác thực, ví dụ:
            // localStorage.removeItem('authToken');
            // window.location.href = '/login'; // Chuyển hướng về trang login
            // Hoặc ném một lỗi cụ thể để component cha xử lý
            throw new Error('Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
        }
        throw error.response?.data || new Error('Failed to fetch revenue and expense statistics');
    }
};

/**
 * Fetch data for Ranking Tab.
 * @param {string} period - 'monthly' or 'yearly'
 * @param {number} year
 * @param {number} [month] - Required if period is 'monthly'
 * @returns {Promise<object>} Data for the ranking tab.
 */
export const getRankingStatsApi = async (period, year, month) => {
    const params = { period, year };
    if (period === 'monthly' && month) {
        params.month = month;
    }
    console.log(`statisticsApiService: Fetching ranking stats with params:`, params);
    try {
        const response = await axios.get(`${STATS_API_ENDPOINT}/ranking`, {
            params,
            headers: getAuthHeaders() // <--- THÊM HEADERS VÀO ĐÂY
        });
        console.log('statisticsApiService: getRankingStatsApi response received:', response.data);
        return response.data;
    } catch (error) {
        console.error('statisticsApiService: Error in getRankingStatsApi:', error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
        }
        throw error.response?.data || new Error('Failed to fetch ranking statistics');
    }
};

/**
 * Fetch data for Trends Tab.
 * @param {string} period - 'monthly' or 'yearly'
 * @param {number} year
 * @param {number} [month] - Required if period is 'monthly'
 * @returns {Promise<object>} Data for the trends tab.
 */
export const getTrendsStatsApi = async (period, year, month) => {
    const params = { period, year };
    if (period === 'monthly' && month) {
        params.month = month;
    }
    console.log(`statisticsApiService: Fetching trends stats with params:`, params);
    try {
        const response = await axios.get(`${STATS_API_ENDPOINT}/trends`, {
            params,
            headers: getAuthHeaders() // <--- THÊM HEADERS VÀO ĐÂY
        });
        console.log('statisticsApiService: getTrendsStatsApi response received:', response.data);
        return response.data;
    } catch (error) {
        console.error('statisticsApiService: Error in getTrendsStatsApi:', error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
        }
        throw error.response?.data || new Error('Failed to fetch trends statistics');
    }
};