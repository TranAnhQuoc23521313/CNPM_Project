// src/pages/Staff/Tickets/CreateTicket/SelectShowtimePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../../components/common/Button';
import './CreateTicketWorkflow.css';
import { getShowtimesByMovieApi } from '../../../../services/showtimeApiService';

// Hàm chuyển đổi dữ liệu suất chiếu từ API sang định dạng client
const mapApiShowtimeToClient = (apiShowtime) => ({
  id: apiShowtime.MASUATCHIEU,
  // Sử dụng định dạng nhất quán như phiên bản tốt đã đề xuất
  time: new Date(apiShowtime.THOIGIAN).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
  date: new Date(apiShowtime.THOIGIAN).toLocaleDateString('vi-VN'),
  screen: apiShowtime.PHONG_TENPHONG || 'N/A',
  rawDateTime: apiShowtime.THOIGIAN,
  movieId: apiShowtime.PHIM_MAPHIM,
  price: apiShowtime.GIASUATCHIEU,
  status: apiShowtime.TRANGTHAI,
  // cinemaRoomId: apiShowtime.MAPHONG, // Ví dụ: mã phòng chiếu
});

const STAFF_BASE_PATH = "/staff";

const SelectShowtimePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const movieId = location.state?.movieId;
  const movieTitle = location.state?.movieTitle; // Nhận movieTitle từ trang trước

  const [availableShowtimes, setAvailableShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null); // Lưu trữ toàn bộ object suất chiếu đã chọn
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId || !movieTitle) {
      // alert('Thông tin phim không hợp lệ. Vui lòng chọn lại phim từ đầu.');
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`);
      return;
    }

    const fetchShowtimesForMovie = async () => {
      setIsLoading(true);
      setError(null);
      setAvailableShowtimes([]); // Xóa suất chiếu cũ trước khi tải mới
      setSelectedShowtime(null); // Reset lựa chọn cũ
      try {
        const response = await getShowtimesByMovieApi(movieId);
        console.log("FOUND RESPONSE:", response);
        const mappedShowtimes = response.map(mapApiShowtimeToClient).sort((a, b) => new Date(a.rawDateTime) - new Date(b.rawDateTime));

        setAvailableShowtimes(mappedShowtimes);
        if (mappedShowtimes.length === 0) {
          setError('Không có suất chiếu nào khả dụng cho phim này.');
        }

      } catch (err) {
        console.error("Lỗi khi tải suất chiếu:", err);
        setError(err.message || 'Đã xảy ra lỗi khi tải danh sách suất chiếu.');
      } finally {
        setIsLoading(false);
        console.log("SELECT SHOWTIME PAGE");
      }
    };

    fetchShowtimesForMovie();
    // Thêm navigate vào dependency array nếu bạn muốn useEffect chạy lại khi navigate thay đổi (thường không cần thiết cho logic này)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, movieTitle]); // Chạy lại khi movieId hoặc movieTitle thay đổi

  const handleShowtimeSelect = (showtime) => {
    setSelectedShowtime(showtime);
  };

  const handleNext = () => {
    if (selectedShowtime) {
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-seats`, {
        state: {
          movieId,
          movieTitle,
          showtimeId: selectedShowtime.id,
          selectedShowtime // Truyền toàn bộ thông tin suất chiếu đã chọn
        }
      });
    } else {
      alert('Vui lòng chọn một suất chiếu.');
    }
  };

  // Kiểm tra movieTitle để hiển thị tiêu đề chính xác
  if (!movieTitle && !isLoading && !error) {
    // Nếu không có movieTitle và không đang tải/lỗi, có thể useEffect đang xử lý chuyển hướng
    return <p>Đang kiểm tra thông tin phim...</p>;
  }

  return (
    <div className="create-ticket-step">
      {/* Sử dụng movieTitle từ location.state */}
      <h2>Bước 2: Chọn Suất Chiếu cho phim "{movieTitle || 'Chưa chọn phim'}"</h2>

      {isLoading && <p>Đang tải danh sách suất chiếu...</p>}
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

      {!isLoading && !error && availableShowtimes.length > 0 && (
        <div className="showtime-list-workflow">
          {availableShowtimes.map(st => (
            <Button
              key={st.id}
              variant={selectedShowtime?.id === st.id ? 'primary' : 'secondary'}
              onClick={() => handleShowtimeSelect(st)}
              className="showtime-button-workflow"
            >
              {st.date} - {st.time} ({st.screen})
            </Button>
          ))}
        </div>
      )}
      {/* Thông báo khi không có suất chiếu đã được xử lý bởi setError */}

      <div className="workflow-actions">
        <Button onClick={() => navigate(-1)} variant="light">Quay lại</Button>
        <Button
          onClick={handleNext}
          disabled={!selectedShowtime || isLoading}
          variant="primary"
        >
          Tiếp tục: Chọn Ghế
        </Button>
      </div>
    </div>
  );
};
export default SelectShowtimePage;