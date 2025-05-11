// client/src/services/movieApiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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

// ... (các hàm createMovieApi, updateMovieApi, deleteMovieApi) ...