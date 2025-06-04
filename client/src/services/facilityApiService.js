// src/services/facilityApiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Hàm helper để lấy token và tạo headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// --- Facility Issue (Sự cố Thiết bị) APIs ---

export const reportFacilityIssueApi = async (issueData, imageFiles = []) => {
    try {
        const formData = new FormData();
        Object.keys(issueData).forEach(key => {
            if (issueData[key] !== undefined && issueData[key] !== null) {
                formData.append(key, issueData[key]);
            }
        });

        if (imageFiles && imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('HINHANH_SUCO_FILES', imageFiles[i]);
            }
        }
        
        const response = await axios.post(`${API_BASE_URL}/facilities/issues`, formData, {
            headers: {
                ...getAuthHeaders(), // Thêm header Authorization
                // Axios sẽ tự đặt 'Content-Type': 'multipart/form-data' khi dùng FormData
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("API Error - Reporting facility issue:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getFacilityIssueByIdApi = async (masuco) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/facilities/issues/${masuco}`, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    } catch (error) {
        console.error(`API Error - Getting facility issue ${masuco}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getDeviceIssuesApi = async (mathietbi) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/facilities/devices/${mathietbi}/issues`, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    } catch (error) {
        console.error(`API Error - Getting issues for device ${mathietbi}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const resolveIncidentApi = async (masuco) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/facilities/issues/${masuco}/resolve`, {}, { // payload rỗng nếu API không cần
            headers: getAuthHeaders()
        });
        return response.data; // API trả về { success: true, message: '...', data: { MASUCO, TRANGTHAI_SUCO } }
    } catch (error) {
        console.error(`API Error - Resolving incident ${masuco}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};


// --- Facility Repair (Sửa chữa Thiết bị) APIs ---

export const recordFacilityRepairApi = async (repairData, repairImageFile = null) => {
    try {
        const formData = new FormData();
        Object.keys(repairData).forEach(key => {
            if (repairData[key] !== undefined && repairData[key] !== null) {
                formData.append(key, repairData[key]);
            }
        });

        if (repairImageFile) {
            formData.append('HINHANH_SUACHUA_FILE', repairImageFile);
        }

        const response = await axios.post(`${API_BASE_URL}/facilities/repairs`, formData, {
            headers: {
                ...getAuthHeaders(),
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("API Error - Recording facility repair:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getFacilityRepairByIdApi = async (masuachua) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/facilities/repairs/${masuachua}`, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    } catch (error) {
        console.error(`API Error - Getting facility repair ${masuachua}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getIncidentRepairsApi = async (masuco) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/facilities/issues/${masuco}/repairs`, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    } catch (error) {
        console.error(`API Error - Getting repairs for incident ${masuco}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getAllFacilityIncidentsApi = async (params = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/facilities/incidents/all`, { // Giả sử endpoint
            headers: getAuthHeaders(),
            params: params 
        });
        return response.data.data;
    } catch (error) {
        console.error("API Error - Getting all facility incidents:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getAllRepairHistoryApi = async (params = {}) => {
    try {
        // Endpoint này cần được định nghĩa ở backend (ví dụ trong facility.routes.js)
        // GET /api/facilities/repairs/history
        const response = await axios.get(`${API_BASE_URL}/facilities/repairs/history`, {
            headers: getAuthHeaders(),
            params: params 
        });
        return response.data.data;
    } catch (error) {
        console.error("API Error - Getting all facility repair history:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};