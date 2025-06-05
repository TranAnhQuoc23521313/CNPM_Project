// src/services/orderApiService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const ORDER_API_ENDPOINT = `${API_URL}/api/orders`;

// Hàm tiện ích để lấy token từ localStorage
// Đảm bảo key 'authToken' khớp với key bạn đã sử dụng ở Bước 2.1
const getAuthToken = () => localStorage.getItem('authToken');

export const createOrderApi = async (orderPayload) => {
    console.log("orderApiService: Creating order with payload:", JSON.stringify(orderPayload, null, 2)); // Log chi tiết payload
    const token = getAuthToken();

    if (!token) {
        console.error("orderApiService: Auth token not found in localStorage. User might need to login again.");
        // Ném lỗi rõ ràng hơn hoặc điều hướng người dùng
        const error = new Error("Token xác thực không tồn tại. Vui lòng đăng nhập lại.");
        error.isAuthError = true; // Thêm cờ để nhận biết lỗi xác thực
        throw error;
    }
    console.log("orderApiService: Using token for createOrderApi:", token.substring(0, 20) + "..."); // Log một phần token

    try {
        const response = await axios.post(ORDER_API_ENDPOINT, orderPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // QUAN TRỌNG: Gửi token với tiền tố "Bearer "
            },
        });
        console.log("orderApiService: createOrder response", response.data);
        return response.data;
    } catch (error) {
        console.error("orderApiService: Error creating order. Status:", error.response?.status, "Data:", error.response?.data || error.message);
        const serverError = error.response?.data || { message: error.message || "Failed to create order" };
        if (error.response?.status === 401 || error.response?.status === 403) {
            serverError.isAuthError = true; // Đánh dấu lỗi xác thực từ server
        }
        throw serverError;
    }
};

export const getAllOrdersApi = async ({ searchTerm = '' }) => {
    console.log(`orderApiService: Fetching all orders. SearchTerm: "${searchTerm}"`);
    const token = getAuthToken();
    if (!token) {
        throw new Error("Token xác thực không tồn tại. Vui lòng đăng nhập lại.");
    }
    try {
        const response = await axios.get(ORDER_API_ENDPOINT, {
            params: { searchTerm },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("orderApiService: getAllOrders response", response.data);
        return response.data;
    } catch (error) {
        console.error("orderApiService: Error fetching all orders", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to fetch orders");
    }
};

export const getOrderByIdApi = async (orderId) => {
    console.log(`orderApiService: Fetching order details for ID: ${orderId}`);
    const token = getAuthToken();
    if (!token) {
        throw new Error("Token xác thực không tồn tại. Vui lòng đăng nhập lại.");
    }
    try {
        const response = await axios.get(`${ORDER_API_ENDPOINT}/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("orderApiService: getOrderById response", response.data);
        return response.data;
    } catch (error) {
        console.error(`orderApiService: Error fetching order ${orderId}`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch order ${orderId}`);
    }
};

export const cancelOrderApi = async (orderId) => {
    console.log(`orderApiService: Cancelling order ID: ${orderId}`);
    const token = getAuthToken();
    if (!token) {
        throw new Error("Token xác thực không tồn tại. Vui lòng đăng nhập lại.");
    }
    try {
        const response = await axios.put(`${ORDER_API_ENDPOINT}/${orderId}/cancel`, {}, { // Thêm data rỗng cho PUT
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("orderApiService: cancelOrder response", response.data);
        return response.data;
    } catch (error) {
        console.error(`orderApiService: Error cancelling order ${orderId}`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to cancel order ${orderId}`);
    }
};

export const getTicketsForPrintingApi = async (orderId) => {
  try {
    // ĐẢM BẢO URL NÀY ĐÚNG VÀ BAO GỒM CẢ API_URL prefix
    // Hiện tại nó đang là URL tương đối: `/orders/${orderId}/print-tickets`
    // Nó nên là: `${ORDER_API_ENDPOINT}/${orderId}/print-tickets`
    // HOẶC nếu apiClient của bạn đã cấu hình baseUrl: `apiClient.get(`/orders/${orderId}/print-tickets`)`
    const response = await axios.get(`${ORDER_API_ENDPOINT}/${orderId}/print-tickets`, { // <--- SỬA LẠI URL
         headers: { // <--- THÊM HEADERS NẾU CẦN XÁC THỰC
             'Authorization': `Bearer ${getAuthToken()}` // Quan trọng nếu API yêu cầu token
         }
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi gọi API lấy vé để in cho hóa đơn ${orderId}:`, error.response?.data || error.message);
    // Ném lại lỗi để component có thể bắt và hiển thị thông báo
    const errToThrow = error.response?.data || new Error("Không thể lấy dữ liệu vé để in.");
    errToThrow.status = error.response?.status; // Gán thêm status code nếu có
    throw errToThrow;
  }
};