// src/services/customerApiService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CUSTOMER_API_ENDPOINT = `${API_URL}/api/customers`;

export const findCustomerByPhoneApi = async (phoneNumber) => {
    console.log(`customerApiService: Finding customer by phone ${phoneNumber}`);
    try {
        // Quan trọng: Endpoint là /api/customers/phone/:phone
        const response = await axios.get(`${CUSTOMER_API_ENDPOINT}/phone/${phoneNumber}`);
        console.log("customerApiService: findCustomerByPhone response", response.data);
        // API có thể trả về null nếu không tìm thấy, client xử lý điều này
        return response.data;
    } catch (error) {
        console.error("customerApiService: Error finding customer by phone", error.response?.data || error.message);
        // Không ném lỗi nếu là 404 (không tìm thấy), để service/component xử lý null
        if (error.response?.status === 404) {
            return null;
        }
        throw error.response?.data || new Error("Failed to find customer by phone");
    }
};

export const registerCustomerApi = async (customerData) => {
    // customerData: { HoTen, SoDT, Email?, NgaySinh? }
    console.log("customerApiService: Registering new customer with data:", customerData);
    try {
        const response = await axios.post(CUSTOMER_API_ENDPOINT, customerData);
        console.log("customerApiService: registerCustomer response", response.data);
        // API trả về thông tin khách hàng mới được tạo
        return response.data;
    } catch (error) {
        console.error("customerApiService: Error registering customer", error.response?.data || error.message);
        const serverError = error.response?.data || { message: error.message || "Failed to register customer" };
        throw serverError;
    }
};

export const getAllCustomersApi = async () => { // Bỏ searchTerm
    console.log(`customerApiService: Fetching all customers`);
    try {
        // const response = await axios.get(`${CUSTOMER_API_ENDPOINT}?searchTerm=${encodeURIComponent(searchTerm)}`); // URL cũ
        const response = await axios.get(CUSTOMER_API_ENDPOINT); // URL mới không có searchTerm
        console.log("customerApiService: getAllCustomers response", response.data);
        return response.data;
    } catch (error) {
        console.error("customerApiService: Error fetching all customers", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to fetch customers");
    }
};

export const getCustomerByIdApi = async (customerId) => {
    console.log(`customerApiService: Fetching customer by ID ${customerId}`);
    try {
        const response = await axios.get(`${CUSTOMER_API_ENDPOINT}/${customerId}`);
        console.log("customerApiService: getCustomerById response", response.data);
        return response.data; // Object khách hàng chi tiết
    } catch (error) {
        console.error(`customerApiService: Error fetching customer ${customerId}`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch customer ${customerId}`);
    }
};

export const updateCustomerApi = async (customerId, customerData) => {
    // customerData: { name, email, phone, joinDate (là NgaySinh ở backend)}
    console.log(`customerApiService: Updating customer ${customerId} with data:`, customerData);
    try {
        const response = await axios.put(`${CUSTOMER_API_ENDPOINT}/${customerId}`, customerData);
        console.log("customerApiService: updateCustomer response", response.data);
        // API trả về { success: true, message: "...", customer: updatedCustomer }
        return response.data;
    } catch (error) {
        console.error(`customerApiService: Error updating customer ${customerId}`, error.response?.data || error.message);
        const serverError = error.response?.data || { message: `Failed to update customer ${customerId}` };
        throw serverError;
    }
};

export const deleteCustomerApi = async (customerId) => {
    console.log(`customerApiService: Deleting customer ${customerId}`);
    try {
        const response = await axios.delete(`${CUSTOMER_API_ENDPOINT}/${customerId}`);
        console.log("customerApiService: deleteCustomer response", response.data);
        // API trả về { success: true, message: "..." }
        return response.data;
    } catch (error) {
        console.error(`customerApiService: Error deleting customer ${customerId}`, error.response?.data || error.message);
        const serverError = error.response?.data || { message: `Failed to delete customer ${customerId}` };
        throw serverError;
    }
};