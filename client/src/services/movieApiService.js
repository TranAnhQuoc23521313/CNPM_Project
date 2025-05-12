// client/src/services/movieApiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
//const API_BASE_URL = 'http://localhost:5000'; // Địa chỉ API của bạn
const MOVIES_API_ENDPOINT = `${API_BASE_URL}/api/movies`;

export const getAllMoviesApi = async () => {
  console.log(`movieApiService: Fetching all movies from ${MOVIES_API_ENDPOINT}`);
  try {
    const response = await axios.get(MOVIES_API_ENDPOINT);
    console.log('movieApiService: getAllMovies response received', response.data);
    return response.data; // Trả về mảng phim
  } catch (error) {
    console.error('movieApiService: Error in getAllMoviesApi', error.response?.data || error.message);
    // Ném lỗi để component có thể bắt và hiển thị thông báo
    throw error.response?.data || new Error('Failed to fetch movies from API');
  }
};

export const createMovieApi = async (formDataPayload) => { // formDataPayload là FormData
  console.log(`movieApiService: Attempting to create movie at ${MOVIES_API_ENDPOINT}`);
  // Log các entry trong FormData để debug
  /* for (let pair of formDataPayload.entries()) {
      console.log(`movieApiService FormData: ${pair[0]} = ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
  } */
  try {
    const response = await axios.post(MOVIES_API_ENDPOINT, formDataPayload, {
      headers: {
        // Khi gửi FormData, Axios thường tự động set 'Content-Type': 'multipart/form-data'
        // Nếu không, bạn có thể cần thêm nó:
        // 'Content-Type': 'multipart/form-data',
      }
    });
    console.log('movieApiService: createMovie response received', response.data);
    return response.data;
  } catch (error) {
    console.error('movieApiService: Error creating movie', error.response?.data || error.message, error.config);
    // Ném lỗi chi tiết hơn nếu có từ server
    const serverError = error.response?.data?.message || error.response?.data || error.message || 'Failed to create movie via API';
    throw new Error(typeof serverError === 'object' ? JSON.stringify(serverError) : serverError);
  }
};

export const updateMovieApi = async (movieId, formDataPayload) => { // formDataPayload là FormData
  console.log(`movieApiService: Attempting to update movie ${movieId} at ${MOVIES_API_ENDPOINT}/${movieId}`);
  for (let pair of formDataPayload.entries()) { // Log FormData để debug
      console.log(`movieApiService UpdateFormData: ${pair[0]} = ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
  }
  try {
    const response = await axios.put(`${MOVIES_API_ENDPOINT}/${movieId}`, formDataPayload, {
      // headers: { 'Content-Type': 'multipart/form-data' } // Thường tự động
    });
    console.log('movieApiService: updateMovie response received', response.data);
    return response.data;
  } catch (error) {
    console.error(`movieApiService: Error updating movie ${movieId}`, error.response?.data || error.message, error.config);
    const serverError = error.response?.data?.message || error.response?.data || error.message || `Failed to update movie ${movieId} via API`;
    throw new Error(typeof serverError === 'object' ? JSON.stringify(serverError) : serverError);
  }
};

export const deleteMovieApi = async (movieId) => {
  console.log(`movieApiService: Attempting to delete movie ${movieId} at ${MOVIES_API_ENDPOINT}/${movieId}`);
  try {
    const response = await axios.delete(`${MOVIES_API_ENDPOINT}/${movieId}`);
    console.log('movieApiService: deleteMovie response received', response.data);
    return response.data; // Thường là một object chứa message
  } catch (error) {
    console.error(`movieApiService: Error deleting movie ${movieId}`, error.response?.data || error.message, error.config);
    const serverError = error.response?.data?.message || error.response?.data || error.message || `Failed to delete movie ${movieId} via API`;
    throw new Error(typeof serverError === 'object' ? JSON.stringify(serverError) : serverError);
  }
};
// ... (các hàm createMovieApi, updateMovieApi, deleteMovieApi) ...