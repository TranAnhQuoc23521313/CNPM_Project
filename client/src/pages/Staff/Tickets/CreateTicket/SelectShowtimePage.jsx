// src/pages/Staff/Tickets/CreateTicket/SelectShowtimePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../../components/common/Button';
import './CreateTicketWorkflow.css';

const mockMovies = [{ id: 1, title: 'Godzilla x Kong: Đế Chế Mới', posterUrl: 'https://image.tmdb.org/t/p/w185/v4uV53L4P6h4HnZDx7ELhN1HkX1.jpg', duration: 115, genre: 'Hành động, Viễn tưởng' },
                    { id: 2, title: 'Kung Fu Panda 4', posterUrl: 'https://image.tmdb.org/t/p/w185/kDp1vUBnMfTfS5iS7M05Y703s3s.jpg', duration: 94, genre: 'Hoạt hình, Phiêu lưu' },
                    { id: 3, title: 'Dune: Part Two', posterUrl: 'https://image.tmdb.org/t/p/w185/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', duration: 166, genre: 'Khoa học viễn tưởng, Phiêu lưu' }, ];
const mockShowtimes = {   1: [ // Showtimes for movie ID 1
    { id: 101, time: '18:00', date: '20/05/2024', room: 'Phòng 1', seatsAvailable: 50 },
    { id: 102, time: '20:30', date: '20/05/2024', room: 'Phòng 2', seatsAvailable: 30 },
    { id: 103, time: '19:00', date: '21/05/2024', room: 'Phòng 1', seatsAvailable: 60 },
  ],
                           2: [ // Showtimes for movie ID 2
    { id: 201, time: '17:00', date: '20/05/2024', room: 'Phòng 3', seatsAvailable: 40 },
    { id: 202, time: '19:30', date: '20/05/2024', room: 'Phòng 3', seatsAvailable: 25 },
  ],
};
const STAFF_BASE_PATH = "/staff";

const SelectShowtimePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const movieId = location.state?.movieId; // Nhận movieId từ trang trước

  const [movie, setMovie] = useState(null);
  const [availableShowtimes, setAvailableShowtimes] = useState([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);

  useEffect(() => {
    if (movieId) {
      const foundMovie = mockMovies.find(m => m.id === movieId);
      setMovie(foundMovie);
      setAvailableShowtimes(mockShowtimes[movieId] || []);
    } else {
      // Nếu không có movieId, điều hướng về trang chọn phim
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`);
    }
  }, [movieId, navigate]);

  const handleShowtimeSelect = (showtimeId) => {
    setSelectedShowtimeId(showtimeId);
  };

  const handleNext = () => {
    if (selectedShowtimeId) {
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-seats`, { state: { movieId, showtimeId: selectedShowtimeId } });
    } else {
      alert('Vui lòng chọn một suất chiếu.');
    }
  };

  if (!movie) return <p>Đang tải thông tin phim...</p>; // Hoặc loading indicator

  return (
    <div className="create-ticket-step">
      <h2>Bước 2: Chọn Suất Chiếu cho phim "{movie.title}"</h2>
      {availableShowtimes.length > 0 ? (
        <div className="showtime-list-workflow">
          {availableShowtimes.map(st => (
            <Button
              key={st.id}
              variant={selectedShowtimeId === st.id ? 'primary' : 'secondary'}
              onClick={() => handleShowtimeSelect(st.id)}
              className="showtime-button-workflow"
            >
              {st.date} - {st.time} ({st.room})
            </Button>
          ))}
        </div>
      ) : (
        <p>Không có suất chiếu nào cho phim này.</p>
      )}
      <div className="workflow-actions">
        <Button onClick={() => navigate(-1)} variant="light">Quay lại</Button>
        <Button onClick={handleNext} disabled={!selectedShowtimeId} variant="primary">Tiếp tục: Chọn Ghế</Button>
      </div>
    </div>
  );
};
export default SelectShowtimePage;