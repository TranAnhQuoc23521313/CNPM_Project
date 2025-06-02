// src/services/seatApiService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const SEAT_API_ENDPOINT = `${API_URL}/api/seats`; // Endpoint cơ sở cho ghế

export const getSeatLayoutForShowtimeApi = async (showtimeId) => {
    console.log(`seatApiService: Fetching seat layout for showtime ${showtimeId}`);
    try {
        // Endpoint: /api/seats/layout/:showtimeId
        const response = await axios.get(`${SEAT_API_ENDPOINT}/layout/${showtimeId}`);
        console.log("seatApiService: getSeatLayoutForShowtime response", response.data);
        // API trả về { data: seatsWithStatus[], roomId: "...", showtimeBasePrice: ... }
        return response.data;
    } catch (error) {
        console.error(`seatApiService: Error fetching seat layout for showtime ${showtimeId}`, error.response?.data || error.message);
        const serverError = error.response?.data || { message: error.message || "Failed to fetch seat layout" };
        throw serverError;
    }
};