import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const EMPLOYEE_API_ENDPOINT = `${API_URL}/api/employees`;

export const getAllEmployeeApi = async () => {
    console.log(`employeeApiService: Fetching all employees from ${EMPLOYEE_API_ENDPOINT}`);
    try {
        const response = await axios.get(EMPLOYEE_API_ENDPOINT);
        console.log("employeeApiService: getAllemployees response received", response.data);
        return response.data;
    } catch (error) {
        console.error("employeeApiService: Error in getAllemployeesApi", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to fetch employees from API");
    }
};

export const createEmployeeApi = async(formDataPayload) => {
    console.log(`employeeApiService: Attempting to create employee at ${EMPLOYEE_API_ENDPOINT}`);
    try {
        const response = await axios.post(EMPLOYEE_API_ENDPOINT, formDataPayload, {
            headers: {
                // 'Content-Type': 'multipart/form-data', // Axios tự động set
            },
        });
        console.log("employeeApiService: createemployee response received", response.data);
        return response.data;
    } catch (error) {
        console.error("employeeApiService: Error creating employee", error.response?.data || error.message);
        const serverError = error.response?.data?.message || error.response?.data || error.message || "Failed to create employee via API";
        throw new Error(typeof serverError === "object" ? JSON.stringify(serverError) : serverError);
    }
};

export const updateEmployeeApi = async (employeeId, employeeUpdateData) => {
    console.log(`employeeApiService: Attempting to update employee ${employeeId} with data:`, employeeUpdateData);
    try {
        const response = await axios.put(`${EMPLOYEE_API_ENDPOINT}/${employeeId}`, employeeUpdateData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("employeeApiService: updateEmployee response received", response.data);
        // response.data nên là thông tin nhân viên đã được cập nhật (bao gồm cả thông tin tài khoản nếu có thay đổi)
        return response.data;
    } catch (error) {
        console.error(`employeeApiService: Error updating employee ${employeeId}`, error.response?.data || error.message);
        const serverError = error.response?.data || { message: error.message || "Failed to update employee via API" };
        throw serverError;
    }
};

export const deleteEmployeeApi = async (employeeId) => {
    console.log(`employeeApiService: Attempting to delete employee ${employeeId}`);
    try {
        const response = await axios.delete(`${EMPLOYEE_API_ENDPOINT}/${employeeId}`);
        console.log("employeeApiService: deleteEmployee response received", response.data);
        // response.data từ server sẽ là { success: true, message: "..." }
        return response.data;
    } catch (error) {
        console.error(`employeeApiService: Error deleting employee ${employeeId}`, error.response?.data || error.message);
        const serverError = error.response?.data || { message: error.message || "Failed to delete employee via API" };
        throw serverError;
    }
};