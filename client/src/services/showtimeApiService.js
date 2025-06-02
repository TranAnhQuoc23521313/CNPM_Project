// client/src/services/showtimeApiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SHOWTIMES_API_ENDPOINT = `${API_BASE_URL}/api/showtimes`; // Giả sử endpoint là /api/showtimes

export const getAllShowtimesApi = async () => {
  console.log(`showtimeApiService: Fetching all showtimes from ${SHOWTIMES_API_ENDPOINT}`);
  try {
    const response = await axios.get(SHOWTIMES_API_ENDPOINT);
    console.log('showtimeApiService: getAllShowtimes response received', response.data);
    return response.data; // Mảng các suất chiếu (bao gồm thông tin phim liên quan)
  } catch (error) {
    console.error('showtimeApiService: Error in getAllShowtimesApi', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch showtimes from API');
  }
};

export const createShowtimeApi = async (showtimeData) => {
  // showtimeData từ client: { movieId, movieTitle, time, date, screenId, screenName, price }
  // Server controller mong đợi: { MAPHIM, MAPHONG, date, time, GIASUATCHIEU, TRANGTHAI }
  const payload = {
    MAPHIM: showtimeData.movieId,       // Đúng
    MAPHONG: showtimeData.screenId,     // Đúng
    date: showtimeData.date,            // Client gửi 'date'
    time: showtimeData.time,            // Client gửi 'time'
    GIASUATCHIEU: showtimeData.price,   // Đúng
    TRANGTHAI: 'Sắp chiếu'             // Đúng
  };
  console.log(`showtimeApiService: Attempting to create showtime with payload:`, payload);
  try {
    const response = await axios.post(SHOWTIMES_API_ENDPOINT, payload);
    console.log('showtimeApiService: createShowtime response received', response.data);
    return response.data;
  } catch (error) {
    console.error('showtimeApiService: Error creating showtime', error.response?.data || error.message, error.config);
    const serverError = error.response?.data?.message || error.response?.data || error.message || 'Failed to create showtime via API';
    throw new Error(typeof serverError === 'object' ? JSON.stringify(serverError) : serverError);
  }
};

export const getShowtimesByMovieApi = async (movieId) => {
  // Sử dụng query parameter để gửi movieId
  const endpoint = `${SHOWTIMES_API_ENDPOINT}?movieId=${movieId}`;
  console.log(`showtimeApiService: Fetching showtimes for movie ${movieId} from ${endpoint}`);
  try {
    const response = await axios.get(endpoint);
    console.log(`showtimeApiService: getShowtimesByMovieApi response for ${movieId}:`, response.data);
    return response.data; // Mảng các suất chiếu cho phim đó
  } catch (error) {
    console.error(`showtimeApiService: Error fetching showtimes for movie ${movieId}`, error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to fetch showtimes for movie ID ${movieId}`);
  }
};

export const getShowtimeByIdApi = async (showtimeId) => {
  const endpoint = `${SHOWTIMES_API_ENDPOINT}/${showtimeId}`;
  console.log(`showtimeApiService: Fetching showtime details for ID ${showtimeId} from ${endpoint}`);
  try {
    const response = await axios.get(endpoint);
    console.log(`showtimeApiService: getShowtimeById response for ${showtimeId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`showtimeApiService: Error fetching showtime ${showtimeId}`, error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to fetch showtime ID ${showtimeId}`);
  }
};

export const deleteShowtimeApi = async (showtimeId) => {
  const endpoint = `${SHOWTIMES_API_ENDPOINT}/${showtimeId}`;
  console.log(`showtimeApiService: Attempting to delete showtime ${showtimeId} from ${endpoint}`);
  try {
    const response = await axios.delete(endpoint);
    console.log(`showtimeApiService: deleteShowtime response for ${showtimeId}:`, response.data);
    return response.data; // Thường là { success: true, message: "..." }
  } catch (error) {
    console.error(`showtimeApiService: Error deleting showtime ${showtimeId}`, error.response?.data || error.message);
    const serverError = error.response?.data || { message: error.message || `Failed to delete showtime ${showtimeId}` };
    throw serverError; // Ném object lỗi từ server
  }
};

export const updateShowtimeApi = async (showtimeId, showtimeUpdateData) => {
  // showtimeUpdateData: { movieId?, screenId?, date?, time?, price?, status? }
  // Cần map sang định dạng backend: { MAPHIM?, MAPHONG?, date?, time?, GIASUATCHIEU?, TRANGTHAI? }
  const payload = {
    ...(showtimeUpdateData.movieId && { MAPHIM: showtimeUpdateData.movieId }),
    ...(showtimeUpdateData.screenId && { MAPHONG: showtimeUpdateData.screenId }),
    ...(showtimeUpdateData.date && { date: showtimeUpdateData.date }),
    ...(showtimeUpdateData.time && { time: showtimeUpdateData.time }),
    ...(showtimeUpdateData.price !== undefined && { GIASUATCHIEU: showtimeUpdateData.price }),
    ...(showtimeUpdateData.status && { TRANGTHAI: showtimeUpdateData.status }),
  };
  const endpoint = `${SHOWTIMES_API_ENDPOINT}/${showtimeId}`;
  console.log(`showtimeApiService: Attempting to update showtime ${showtimeId} with payload:`, payload);
  try {
    const response = await axios.put(endpoint, payload);
    console.log(`showtimeApiService: updateShowtime response for ${showtimeId}:`, response.data);
    return response.data; // { success, message, data }
  } catch (error) {
    console.error(`showtimeApiService: Error updating showtime ${showtimeId}`, error.response?.data || error.message);
    const serverError = error.response?.data || { message: error.message || `Failed to update showtime ${showtimeId}` };
    throw serverError;
  }
};

// Thêm các hàm khác cho CRUD suất chiếu sau này (createShowtimeApi, etc.)