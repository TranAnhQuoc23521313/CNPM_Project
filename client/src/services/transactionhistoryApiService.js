import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const TRANSACTION_HISTORY_API_ENDPOINT = `${API_URL}/api/transactionhistory`;

export const getAllTransactionHistory = async() => {
    console.log(`Transaction History Api Service: Fetching all products from ${TRANSACTION_HISTORY_API_ENDPOINT}`);
    try {
        const response = await axios.get(TRANSACTION_HISTORY_API_ENDPOINT);
        console.log("TransactionHistoryApiService: getAllTransactionHistory response received", response.data);
        return response.data;
    } catch (error){
        console.error("TransactionHistoryApiService: Error in getAllTransactionHistory", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to fetch transaction history from API");
    }
};

export const createTransactionHistory = async(formDataPayload) => {
    console.log(`TransactionHistoryApiService: Attempting to create product at ${TRANSACTION_HISTORY_API_ENDPOINT}`);
    try {
        const response = await axios.post(TRANSACTION_HISTORY_API_ENDPOINT, formDataPayload, {
            headers: {
                // 'Content-Type': 'multipart/form-data', // Axios tự động set
            },
        });
        console.log("TransactionHistoryApiService: createTransactionHistory response received", response.data);
        return response.data;
    } catch (error) {
        console.error("TransactionHistoryApiService: Error creating transaction history", error.response?.data || error.message);
        const serverError = error.response?.data?.message || error.response?.data || error.message || "Failed to create transaction history via API";
        throw new Error(typeof serverError === "object" ? JSON.stringify(serverError) : serverError);
    }
}