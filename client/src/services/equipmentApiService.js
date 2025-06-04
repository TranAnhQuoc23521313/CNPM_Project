import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
const EQUIPMENT_API_ENDPOINT = `${API_BASE_URL}/equipment`; // Đường dẫn tới API thiết bị

// Hàm helper để lấy token và tạo headers (NẾU CHƯA CÓ, HÃY THÊM VÀO)
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken'); // Đảm bảo key 'authToken' là đúng
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`; // Định dạng 'Bearer <token>' là phổ biến
        // Bạn có thể thêm các headers chung khác ở đây nếu cần
        // headers['Content-Type'] = 'application/json'; // Axios tự xử lý cho GET, POST với object
    }
    return headers;
};


export const getAllEquipmentApi = async () => {
    console.log(`equipmentApiService: Fetching all equipment from ${EQUIPMENT_API_ENDPOINT}`);
    try {
        const response = await axios.get(EQUIPMENT_API_ENDPOINT, {
            headers: getAuthHeaders() // THÊM DÒNG NÀY
        });
        console.log("equipmentApiService: getAllEquipment response received", response.data);
        // response.data nên là một mảng các thiết bị nếu API trả về đúng
        // Nếu API của bạn trả về dạng { data: [...] }, thì cần return response.data.data
        return response.data; 
    } catch (error) {
        console.error("equipmentApiService: Error in getAllEquipmentApi", error.response?.data || error.message);
        // Ném lỗi cụ thể từ server nếu có, hoặc một lỗi chung
        throw error.response?.data || new Error(error.response?.data?.message || "Lỗi khi tải danh sách thiết bị.");
    }
};

export const getEquipmentByIdApi = async (equipmentId) => {
    console.log(`equipmentApiService: Fetching equipment by ID ${equipmentId} from ${EQUIPMENT_API_ENDPOINT}/${equipmentId}`);
    try {
        const response = await axios.get(`${EQUIPMENT_API_ENDPOINT}/${equipmentId}`, {
            headers: getAuthHeaders() // THÊM DÒNG NÀY
        });
        console.log("equipmentApiService: getEquipmentById response received", response.data);
        // Tương tự, response.data nên là object thiết bị
        return response.data;
    } catch (error) {
        console.error(`equipmentApiService: Error in getEquipmentByIdApi for ID ${equipmentId}`, error.response?.data || error.message);
        throw error.response?.data || new Error(error.response?.data?.message || `Lỗi khi tải thiết bị với ID ${equipmentId}.`);
    }
};

export const createEquipmentApi = async (equipmentData) => {
    console.log(`equipmentApiService: Attempting to create equipment at ${EQUIPMENT_API_ENDPOINT} with data:`, equipmentData);
    try {
        const response = await axios.post(EQUIPMENT_API_ENDPOINT, equipmentData, {
            headers: {
                ...getAuthHeaders(), // THÊM DÒNG NÀY
                'Content-Type': 'application/json' // Nên chỉ định rõ cho POST/PUT
            }
        });
        console.log("equipmentApiService: createEquipment response received", response.data);
        // response.data nên là object thiết bị vừa tạo
        return response.data; 
    } catch (error) {
        console.error("equipmentApiService: Error creating equipment", error.response?.data || error.message);
        const serverErrorMessage = error.response?.data?.message || "Lỗi khi tạo thiết bị.";
        // Đảm bảo ném đối tượng Error để các component khác có thể bắt .message
        const customError = new Error(serverErrorMessage);
        customError.originalError = error.response?.data; // Giữ lại lỗi gốc từ server nếu cần
        customError.statusCode = error.response?.status;
        throw customError;
    }
};

// Nếu bạn có các hàm update, delete, chúng cũng cần được thêm headers tương tự
// export const updateEquipmentApi = async (equipmentId, equipmentData) => {
//     try {
//         const response = await axios.put(`${EQUIPMENT_API_ENDPOINT}/${equipmentId}`, equipmentData, {
//             headers: {
//                 ...getAuthHeaders(),
//                 'Content-Type': 'application/json'
//             }
//         });
//         return response.data;
//     } catch (error) {
//         // ... xử lý lỗi
//     }
// };