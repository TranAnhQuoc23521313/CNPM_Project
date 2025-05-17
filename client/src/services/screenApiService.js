// client/src/services/screenApiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// Đảm bảo endpoint này khớp với những gì bạn định nghĩa trong server/server.js và screenRoutes.js
const SCREENS_API_ENDPOINT = `${API_BASE_URL}/api/screens`;

/**
 * Lấy tất cả các phòng chiếu từ server.
 * @returns {Promise<Array>} Mảng các đối tượng phòng chiếu.
 */
export const getAllScreensApi = async () => {
  const endpoint = `${API_BASE_URL}/api/screens`; // Đã sửa lại để dùng SCREENS_API_ENDPOINT
  console.log(`screenApiService: Fetching all screens from ${endpoint}`);
  try {
    const response = await axios.get(endpoint);
    console.log('screenApiService: getAllScreens RAW RESPONSE:', response); // LOG QUAN TRỌNG
    console.log('screenApiService: getAllScreens response.data received:', response.data); // LOG QUAN TRỌNG
    return response.data;
  } catch (error) {
    console.error('screenApiService: Error in getAllScreensApi. Full error object:', error);
    if (error.response) {
        console.error('screenApiService: Error response data:', error.response.data);
        console.error('screenApiService: Error response status:', error.response.status);
    }
    throw error.response?.data || new Error('Failed to fetch screening rooms from API');
  }
};

/**
 * Lấy thông tin một phòng chiếu bằng ID.
 * @param {string} screenId ID của phòng chiếu (MAPHONG).
 * @returns {Promise<Object>} Đối tượng phòng chiếu.
 */
export const getScreenByIdApi = async (screenId) => {
  const endpoint = `${SCREENS_API_ENDPOINT}/${screenId}`;
  console.log(`screenApiService: Fetching screen by ID from ${endpoint}`);
  try {
    const response = await axios.get(endpoint);
    console.log(`screenApiService: getScreenById (${screenId}) response received`, response.data);
    return response.data;
  } catch (error) {
    console.error(`screenApiService: Error in getScreenByIdApi for ${screenId}`, error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to fetch screening room ${screenId} from API`);
  }
};

// Các hàm API khác cho CRUD phòng chiếu (createScreenApi, updateScreenApi, deleteScreenApi) có thể thêm sau