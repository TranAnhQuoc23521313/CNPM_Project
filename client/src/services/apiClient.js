// src/services/apiClient.js (hoặc tên tương tự)
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // <<<<---- KIỂM TRA KEY NÀY CÓ PHẢI 'authToken' KHÔNG?

    console.log('Axios Interceptor: Retrieved token from localStorage with key "authToken":', token ? 'Token Found' : 'No Token Found');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Axios Interceptor: Authorization header set.');
    } else {
      console.warn('Axios Interceptor: No token "authToken" found in localStorage.');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;