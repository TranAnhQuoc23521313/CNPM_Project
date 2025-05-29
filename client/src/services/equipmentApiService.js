import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
const EQUIPMENT_API_ENDPOINT = `${API_BASE_URL}/equipment`;
export const getAllEquipmentApi = async () => {
    console.log(`equipmentApiService: Fetching all equipment from ${EQUIPMENT_API_ENDPOINT}`);
    try {
        const response = await axios.get(EQUIPMENT_API_ENDPOINT);
        console.log("equipmentApiService: getAllEquipment response received", response.data);
        return response.data; // Trả về mảng thiết bị
    } catch (error) {
        console.error("equipmentApiService: Error in getAllEquipmentApi", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to fetch equipment from API");
    }
};
export const getEquipmentByIdApi = async (equipmentId) => {
    console.log(`equipmentApiService: Fetching equipment by ID ${equipmentId} from ${EQUIPMENT_API_ENDPOINT}/${equipmentId}`);
    try {
        const response = await axios.get(`${EQUIPMENT_API_ENDPOINT}/${equipmentId}`);
        console.log("equipmentApiService: getEquipmentById response received", response.data);
        return response.data; // Trả về thiết bị
    } catch (error) {
        console.error(`equipmentApiService: Error in getEquipmentByIdApi for ID ${equipmentId}`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch equipment with ID ${equipmentId} from API`);
    }
};
export const createEquipmentApi = async (equipmentData) => {
    console.log(`equipmentApiService: Attempting to create equipment at ${EQUIPMENT_API_ENDPOINT}`);
    try {
        const response = await axios.post(EQUIPMENT_API_ENDPOINT, equipmentData);
        console.log("equipmentApiService: createEquipment response received", response.data);
        return response.data; // Trả về thiết bị mới được tạo
    } catch (error) {
        console.error("equipmentApiService: Error creating equipment", error.response?.data || error.message);
        const serverError = error.response?.data?.message || error.response?.data || error.message || "Failed to create equipment via API";
        throw new Error(typeof serverError === "object" ? JSON.stringify(serverError) : serverError);
    }
};