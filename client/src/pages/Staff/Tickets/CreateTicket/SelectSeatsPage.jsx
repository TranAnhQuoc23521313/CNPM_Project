// src/pages/Staff/Tickets/CreateTicket/SelectSeatsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../../components/common/Button';
import './CreateTicketWorkflow.css';
import './SeatMap.css';

// --- DỮ LIỆU GIẢ LẬP (SAU NÀY SẼ LẤY TỪ API) ---
const mockMovies = [
  { id: 1, title: 'Godzilla x Kong: Đế Chế Mới' },
  { id: 2, title: 'Kung Fu Panda 4' },
  { id: 3, title: 'Dune: Part Two'},
];

// GIẢ LẬP GIÁ VÉ CHO SUẤT CHIẾU VÀ THÔNG TIN PHÒNG CHIẾU (BỎ VIP)
const mockShowtimeDetailsAndPricing = {
  101: { price: 75000, currency: 'đ', roomLayout: { rows: ['A', 'B', 'C', 'D', 'E', 'F','G', 'H'], cols: 10 } },
  102: { price: 70000, currency: 'đ', roomLayout: { rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], cols: 10 } },
  201: { price: 80000, currency: 'đ', roomLayout: { rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], cols: 10 } },
};

const mockShowtimes = {
  1: [
    { id: 101, time: '18:00', date: '20/05/2024', room: 'Phòng 1', seatsAvailable: 50 },
    { id: 102, time: '20:30', date: '20/05/2024', room: 'Phòng 2', seatsAvailable: 30 },
  ],
  2: [
    { id: 201, time: '17:00', date: '20/05/2024', room: 'Phòng 3', seatsAvailable: 40 },
  ],
  3: []
};

// Hàm tạo ghế (BỎ VIP)
const generateSeatsForShowtime = (showtimeId) => {
  const details = mockShowtimeDetailsAndPricing[showtimeId];
  if (!details || !details.roomLayout) {
    console.error(`SelectSeatsPage: Không tìm thấy thông tin layout hoặc giá cho suất chiếu ID: ${showtimeId}`);
    return { seatsByRow: {}, rowsOrder: [], cols: 10, totalSeats: 0, availableSeats: 0, soldSeats: 0 };
  }

  const { roomLayout, price } = details; // Chỉ còn price chung
  const seatsByRow = {};
  const rowsOrder = roomLayout.rows;
  let soldCount = 0;

  for (const rowLabel of roomLayout.rows) {
    seatsByRow[rowLabel] = [];
    for (let j = 1; j <= roomLayout.cols; j++) {
      const seatId = `${rowLabel}${j}`;
      const isSold = Math.random() < 0.3;
      if (isSold) soldCount++;

      seatsByRow[rowLabel].push({
        id: seatId, row: rowLabel, number: j, label: `${j}`,
        fullLabel: seatId,
        status: isSold ? 'sold' : 'available',
        // isVip: false, // Bỏ isVip
        price: price // Sử dụng giá chung cho tất cả ghế
      });
    }
  }
  const total = roomLayout.rows.length * roomLayout.cols;
  return { seatsByRow, rowsOrder, cols: roomLayout.cols, totalSeats: total, availableSeats: total - soldCount, soldSeats: soldCount };
};
const STAFF_BASE_PATH = "/staff";
// --- KẾT THÚC DỮ LIỆU GIẢ LẬP ---


const SelectSeatsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousStateFromRouter = location.state || {};
  const { movieId, showtimeId } = previousStateFromRouter;

  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [seatMapData, setSeatMapData] = useState({ seatsByRow: {}, rowsOrder: [], cols: 10, totalSeats: 0, availableSeats: 0, soldSeats: 0 });
  const [selectedSeatObjects, setSelectedSeatObjects] = useState(previousStateFromRouter.selectedSeats || []);

  useEffect(() => {
    if (movieId && showtimeId) {
      const foundMovie = mockMovies.find(m => m.id === movieId);
      const allShowtimesForMovie = mockShowtimes[movieId] || [];
      const foundShowtime = allShowtimesForMovie.find(st => st.id === showtimeId);
      setMovie(foundMovie);
      setShowtime(foundShowtime);
      if (foundShowtime) {
        setSeatMapData(generateSeatsForShowtime(showtimeId));
      }
    } else {
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`, { replace: true });
    }
  }, [movieId, showtimeId, navigate]);

  const toggleSeatSelect = (seatObject) => {
    if (seatObject.status === 'sold') return;
    setSelectedSeatObjects(prevSelected => {
      const isAlreadySelected = prevSelected.some(s => s.id === seatObject.id);
      if (isAlreadySelected) {
        return prevSelected.filter(s => s.id !== seatObject.id);
      } else {
        if (prevSelected.length < 10) {
          return [...prevSelected, seatObject];
        }
        alert("Bạn chỉ có thể chọn tối đa 10 ghế.");
        return prevSelected;
      }
    });
  };

  const totalSeatPrice = useMemo(() => {
    return selectedSeatObjects.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeatObjects]);

  const handleNext = () => {
    if (selectedSeatObjects.length > 0) {
      navigate(`${STAFF_BASE_PATH}/tickets/new/add-concessions`, {
        state: {
          ...previousStateFromRouter, movieId, showtimeId,
          selectedSeats: selectedSeatObjects,
          totalSeatPrice: totalSeatPrice,
          movieTitle: movie?.title,
          showtimeDetails: showtime,
        }
      });
    } else {
      alert('Vui lòng chọn ít nhất một ghế.');
    }
  };

  if (!movie || !showtime || !seatMapData.rowsOrder.length) {
    return <div className="create-ticket-step"><p>Đang tải thông tin suất chiếu và sơ đồ ghế...</p></div>;
  }

  const selectedSeatIds = selectedSeatObjects.map(s => s.id);
  const { seatsByRow, rowsOrder, totalSeats, availableSeats, soldSeats } = seatMapData;

  return (
    <div className="create-ticket-step select-seats-page-workflow">
      <h2 className="page-main-title-workflow">Bước 3: Chọn Ghế cho "{movie.title}"</h2>
      <p className="showtime-details-text">Suất: {showtime.time} - {showtime.date} (Phòng: {showtime.room})</p>

      <div className="seat-selection-area">
        <div className="screen-indicator-seats">MÀN HÌNH</div>
        <div className="seat-map-grid-with-labels">
          {rowsOrder.map(rowLabel => (
            <div key={rowLabel} className="seat-row-layout">
              <span className="seat-row-label">{rowLabel}</span>
              <div className="seats-in-row">
                {(seatsByRow[rowLabel] || []).map(seat => (
                  <div
                    key={seat.id}
                    className={`seat-box
                      ${seat.status === 'sold' ? 'sold' : ''}
                      ${selectedSeatIds.includes(seat.id) ? 'selected' : ''}
                      ${seat.status === 'available' && !selectedSeatIds.includes(seat.id) ? 'available' : ''}
                      {/* ${seat.isVip ? 'vip' : ''} Bỏ class vip */}
                    `}
                    onClick={() => toggleSeatSelect(seat)}
                    title={seat.status === 'sold' ? 'Ghế đã bán' : `Ghế ${seat.fullLabel} (${seat.price.toLocaleString('vi-VN')}đ)`}
                  >
                    {seat.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="seat-legend-select">
            <div className="legend-item"><span className="seat-example available"></span> Còn Trống</div>
            <div className="legend-item"><span className="seat-example selected"></span> Đang Chọn</div>
            <div className="legend-item"><span className="seat-example sold"></span> Đã Bán</div>
            {/* <div className="legend-item"><span className="seat-example vip"></span> Ghế VIP</div> Bỏ legend VIP */}
        </div>
      </div>

      <div className="workflow-summary seats-summary">
        <p>Đã chọn: {selectedSeatObjects.length} ghế</p>
        {selectedSeatObjects.length > 0 && (
            <>
                <p>Ghế: {selectedSeatObjects.map(s => s.fullLabel).join(', ')}</p>
                <p><strong>Tổng tiền vé: {totalSeatPrice.toLocaleString('vi-VN')}đ</strong></p>
            </>
        )}
      </div>
      <div className="workflow-actions">
        <Button onClick={() => navigate(-1)} variant="light" size="medium">Quay lại</Button>
        <Button onClick={handleNext} disabled={selectedSeatObjects.length === 0} variant="primary" size="medium">
          Tiếp tục
        </Button>
      </div>
    </div>
  );
};
export default SelectSeatsPage;