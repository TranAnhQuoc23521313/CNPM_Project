import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const PRODUCT_API_ENDPOINT = `${API_URL}/api/products`;

export const getAllProductsApi = async () => {
    console.log(`productApiService: Fetching all products from ${PRODUCT_API_ENDPOINT}`);
    try {
        const response = await axios.get(PRODUCT_API_ENDPOINT);
        console.log("productApiService: getAllProducts response received", response.data);
        return response.data; // Trả về mảng sản phẩm
    } catch (error) {
        console.error("productApiService: Error in getAllProductsApi", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to fetch products from API");
    }
};

export const createProductApi = async (formDataPayload) => {
    console.log(`productApiService: Attempting to create product at ${PRODUCT_API_ENDPOINT}`);
    try {
        const response = await axios.post(PRODUCT_API_ENDPOINT, formDataPayload, {
            headers: {
                // 'Content-Type': 'multipart/form-data', // Axios tự động set
            },
        });
        console.log("productApiService: createProduct response received", response.data);
        return response.data;
    } catch (error) {
        console.error("productApiService: Error creating product", error.response?.data || error.message);
        const serverError = error.response?.data?.message || error.response?.data || error.message || "Failed to create product via API";
        throw new Error(typeof serverError === "object" ? JSON.stringify(serverError) : serverError);
    }
};

export const updateProductApi = async (productId, formDataPayload) => {
    console.log(`productApiService: Attempting to update product ${productId} at ${PRODUCT_API_ENDPOINT}/${productId}`);
    for (let pair of formDataPayload.entries()) {
        console.log(`productApiService UpdateFormData: ${pair[0]} = ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
    }
    try {
        const response = await axios.put(`${PRODUCT_API_ENDPOINT}/${productId}`, formDataPayload, {
            // headers: { 'Content-Type': 'multipart/form-data' } // Thường tự động
        });
        console.log("productApiService: updateProduct response received", response.data);
        return response.data;
    } catch (error) {
        console.error(`productApiService: Error updating product ${productId}`, error.response?.data || error.message);
        const serverError = error.response?.data?.message || error.response?.data || error.message || `Failed to update product ${productId} via API`;
        throw new Error(typeof serverError === "object" ? JSON.stringify(serverError) : serverError);
    }
};

export const deleteProductApi = async (productId) => {
    console.log(`productApiService: Attempting to delete product ${productId} at ${PRODUCT_API_ENDPOINT}/${productId}`);
    try {
        const response = await axios.delete(`${PRODUCT_API_ENDPOINT}/${productId}`);
        console.log("productApiService: deleteProduct response received", response.data);
        return response.data;
    } catch (error) {
        console.error(`productApiService: Error deleting product ${productId}`, error.response?.data || error.message);
        const serverError = error.response?.data?.message || error.response?.data || error.message || `Failed to delete product ${productId} via API`;
        throw new Error(typeof serverError === "object" ? JSON.stringify(serverError) : serverError);
    }
};