// src/pages/Staff/Tickets/CreateTicket/SelectSeatsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../../components/common/Button';
import './CreateTicketWorkflow.css';
import './SeatMap.css'; // Đổi tên CSS cho phù hợp hơn nếu cần
import { getSeatLayoutForShowtimeApi } from '../../../../services/seatApiService'; // API Service mới

const STAFF_BASE_PATH = "/staff";

const SelectSeatsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // previousStateFromRouter chứa: movieId, movieTitle, showtimeId, selectedShowtime (object suất chiếu)
  const { movieId, movieTitle, showtimeId, selectedShowtime } = location.state || {};

  // State cho sơ đồ ghế thực tế từ API
  const [seatDataFromAPI, setSeatDataFromAPI] = useState([]); // Mảng ghế gốc từ API
  const [roomLayout, setRoomLayout] = useState({ rows: [], maxCols: 0, roomId: null }); // Dữ liệu đã được tổ chức
  const [selectedSeatObjects, setSelectedSeatObjects] = useState(location.state?.selectedSeats || []); // Ghế đã chọn từ lần trước (nếu có)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm tổ chức ghế từ API vào layout để render
  const organizeSeatsIntoLayout = useCallback((apiSeats, fetchedRoomId) => {
    if (!apiSeats || apiSeats.length === 0) {
      setRoomLayout({ rows: [], maxCols: 0, roomId: fetchedRoomId });
      return;
    }
    const layout = {};
    let maxCols = 0;
    apiSeats.forEach(seat => {
      if (!layout[seat.row]) {
        layout[seat.row] = [];
      }
      // API trả về seat.number là vị trí ghế (1, 2, ...)
      // Mảng trong JS bắt đầu từ 0
      layout[seat.row][seat.number - 1] = seat;
      if (seat.number > maxCols) {
        maxCols = seat.number;
      }
    });

    const sortedRowKeys = Object.keys(layout).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })); // Sắp xếp A, B, C... 1, 2, 3...

    const rowsArray = sortedRowKeys.map(rowKey => {
      const rowSeats = [];
      for (let i = 0; i < maxCols; i++) {
        rowSeats.push(layout[rowKey][i] || null); // null cho ghế trống/lối đi
      }
      return { rowId: rowKey, seats: rowSeats };
    });
    setRoomLayout({ rows: rowsArray, maxCols, roomId: fetchedRoomId });
  }, []);


  useEffect(() => {
    // Kiểm tra thông tin đầu vào
    if (!movieId || !movieTitle || !showtimeId || !selectedShowtime) {
      console.warn("SelectSeatsPage: Thiếu thông tin suất chiếu, điều hướng về chọn phim.");
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`, { replace: true });
      return;
    }

    const fetchLayout = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedSeatObjects([]); // Reset ghế đã chọn khi tải layout mới
      try {
        // API trả về { data: seatsWithStatus, roomId: roomId, showtimeBasePrice: basePrice }
        const response = await getSeatLayoutForShowtimeApi(showtimeId);
        if (response && Array.isArray(response.data)) {
          setSeatDataFromAPI(response.data);
          organizeSeatsIntoLayout(response.data, response.roomId);
          // showtimeBasePrice từ API có thể dùng để đối chiếu với selectedShowtime.price nếu cần
        } else {
          setError("Không thể tải sơ đồ ghế hoặc định dạng dữ liệu không đúng.");
          setSeatDataFromAPI([]);
          organizeSeatsIntoLayout([], null);
        }
      } catch (err) {
        console.error("SelectSeatsPage: Lỗi khi tải sơ đồ ghế:", err);
        setError(err.message || 'Đã xảy ra lỗi khi tải sơ đồ ghế.');
        setSeatDataFromAPI([]);
        organizeSeatsIntoLayout([], null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLayout();
  }, [showtimeId, movieId, movieTitle, selectedShowtime, navigate, organizeSeatsIntoLayout]);

  const toggleSeatSelect = (seatObject) => {
    if (!seatObject || seatObject.status === 'booked' || seatObject.status === 'unavailable') {
      return; // Không cho chọn ghế đã đặt hoặc không khả dụng
    }

    setSelectedSeatObjects(prevSelected => {
      const isAlreadySelected = prevSelected.some(s => s.id === seatObject.id);
      if (isAlreadySelected) {
        return prevSelected.filter(s => s.id !== seatObject.id);
      } else {
        // Có thể thêm giới hạn số lượng ghế được chọn (ví dụ: 10 ghế)
        if (prevSelected.length >= 10) {
          alert("Bạn chỉ có thể chọn tối đa 10 ghế.");
          return prevSelected;
        }
        return [...prevSelected, seatObject];
      }
    });
  };

  // totalSeatPrice được tính dựa trên các ghế đã chọn (mỗi ghế có totalPrice riêng từ API)
  const totalSeatPrice = useMemo(() => {
    // selectedSeatObjects là mảng các object ghế, mỗi object có trường 'totalPrice'
    // totalPrice này là (GIASUATCHIEU của suất đó + GIAGHE của ghế đó)
    return selectedSeatObjects.reduce((sum, seat) => sum + (seat.totalPrice || 0), 0);
  }, [selectedSeatObjects]);

  const handleNext = () => {
    if (selectedSeatObjects.length > 0) {
      navigate(`${STAFF_BASE_PATH}/tickets/new/add-concessions`, {
        state: {
          movieId,
          movieTitle,
          showtimeId,
          selectedShowtime, // Object suất chiếu, chứa GIASUATCHIEU gốc (selectedShowtime.price)
          selectedSeats: selectedSeatObjects, // Mảng các object ghế đã chọn, mỗi ghế có:
          // id (MAGHE), row, number, type,
          // basePricePerSeat (GIASUATCHIEU gốc),
          // surcharge (GIAGHE),
          // totalPrice (GIASUATCHIEU + GIAGHE)
          totalSeatPrice, // Đã là tổng tiền của tất cả các vé
          roomId: roomLayout.roomId,
        }
      });
    } else {
      alert('Vui lòng chọn ít nhất một ghế.');
    }
  };

  if (isLoading) {
    return <div className="create-ticket-step"><p>Đang tải sơ đồ ghế...</p></div>;
  }
  // Kiểm tra ban đầu
  if (!movieTitle || !selectedShowtime) {
    return <div className="create-ticket-step"><p>Đang chuẩn bị thông tin...</p></div>;
  }


  return (
    <div className="create-ticket-step select-seats-page-workflow">
      <h2 className="page-main-title-workflow">Bước 3: Chọn Ghế cho "{movieTitle}"</h2>
      <p className="showtime-details-text">
        Suất: {selectedShowtime.time} - {selectedShowtime.date}
        (Phòng: {selectedShowtime.screen === 'N/A' && roomLayout.roomId ? roomLayout.roomId : selectedShowtime.screen})
      </p>

      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

      <div className="seat-selection-area">
        <div className="screen-indicator-seats">MÀN HÌNH</div>
        {roomLayout.rows.length > 0 ? (
          <div className="seat-map-grid-with-labels">
            {roomLayout.rows.map(({ rowId, seats: seatsInRow }) => (
              <div key={rowId} className="seat-row-layout">
                <span className="seat-row-label">{rowId}</span>
                <div className="seats-in-row">
                  {seatsInRow.map((seat, index) => {
                    if (!seat) {
                      return <div key={`empty-${rowId}-${index}`} className="seat-placeholder"></div>;
                    }
                    const isSelected = selectedSeatObjects.some(s => s.id === seat.id);
                    let seatClass = `seat-box ${seat.type?.toLowerCase() || 'thuong'}`; // seat.type từ API (VIP, Thuong)
                    if (seat.status === 'booked') seatClass += ' sold'; // API trả về 'booked'
                    else if (seat.status === 'unavailable') seatClass += ' unavailable'; // API trả về 'unavailable'
                    else if (isSelected) seatClass += ' selected';
                    else seatClass += ' available';

                    return (
                      <div
                        key={seat.id}
                        className={seatClass}
                        onClick={() => toggleSeatSelect(seat)}
                        title={`Ghế ${seat.row}${seat.number} (${seat.type}) - Giá: ${seat.totalPrice?.toLocaleString('vi-VN')}đ - Trạng thái: ${seat.status}`}
                      >
                        {seat.number}
                      </div>
                    );
                  })}
                </div>
                <span className="seat-row-label">{rowId}</span> {/* Nhãn dãy ở cuối */}
              </div>
            ))}
          </div>
        ) : (
          !isLoading && !error && <p>Không có sơ đồ ghế để hiển thị cho phòng này.</p>
        )}
        <div className="seat-legend-select">
          <div className="legend-item"><span className="seat-example available"></span> Còn Trống</div>
          <div className="legend-item"><span className="seat-example selected"></span> Đang Chọn</div>
          <div className="legend-item"><span className="seat-example sold"></span> Đã Bán</div>
          <div className="legend-item"><span className="seat-example unavailable"></span> Không khả dụng</div>
          <div className="legend-item"><span className="seat-example vip"></span> Ghế VIP</div>
          <div className="legend-item"><span className="seat-example thuong"></span> Ghế Thường</div>
        </div>
      </div>

      <div className="workflow-summary seats-summary">
        <p>Đã chọn: {selectedSeatObjects.length} ghế</p>
        {selectedSeatObjects.length > 0 && (
          <>
            <p>Ghế: {selectedSeatObjects.map(s => `${s.row}${s.number}`).join(', ')}</p>
            <p><strong>Tổng tiền vé: {totalSeatPrice.toLocaleString('vi-VN')}đ</strong></p>
          </>
        )}
      </div>
      <div className="workflow-actions">
        <Button onClick={() => navigate(-1)} variant="light" size="medium">Quay lại</Button>
        <Button onClick={handleNext} disabled={isLoading || selectedSeatObjects.length === 0} variant="primary" size="medium">
          Tiếp tục: Chọn Sản Phẩm
        </Button>
      </div>
    </div>
  );
};
export default SelectSeatsPage;