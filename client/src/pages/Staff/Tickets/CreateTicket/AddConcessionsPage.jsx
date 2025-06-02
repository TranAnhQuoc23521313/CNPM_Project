// src/pages/Staff/Tickets/CreateTicket/AddConcessionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../../components/common/Button';
import './CreateTicketWorkflow.css';
import './AddConcessionsPage.css';
import { getAllProductsApi, checkProductStockApi } from '../../../../services/productApiService'; // Import checkProductStockApi

const STAFF_BASE_PATH = "/staff";

// mapProductApiToClient giữ nguyên như bản gốc bạn cung cấp
const mapProductApiToClient = (apiProduct) => ({
  id: apiProduct.MASP,
  name: apiProduct.TENSP,
  category: apiProduct.LOAISP, // Sửa type thành category để khớp với cách bạn dùng groupedConcessions
  price: apiProduct.GIASP,
  // SOLUONG từ API get all products là tồn kho ban đầu, không phải số lượng khách chọn
  // Ta sẽ không lưu trực tiếp vào đây, mà để API check-stock xử lý khi cần
  initialStock: apiProduct.SOLUONG, // Lưu tồn kho ban đầu để kiểm tra sơ bộ nếu muốn
  status: apiProduct.TRANGTHAISP,
  posterUrl: apiProduct.HINHANHSP ? `${process.env.REACT_APP_API_URL}${apiProduct.HINHANHSP}` : null
});


const AddConcessionsPage = () => {
  const [allConcessions, setAllConcessions] = useState([]); // Đổi tên mockConcessions thành allConcessions
  const navigate = useNavigate();
  const location = useLocation();
  const previousBookingState = location.state || {};

  const [selectedConcessions, setSelectedConcessions] = useState(
    previousBookingState.concessions ? previousBookingState.concessions.reduce((acc, item) => {
      if (item && item.id) {
        acc[item.id] = item.quantity;
      }
      return acc;
    }, {}) : {}
  );

  // State đơn giản để theo dõi sản phẩm nào đang được kiểm tra và lỗi của nó
  const [checkingStockState, setCheckingStockState] = useState({ itemId: null, isLoading: false, error: null, stockInfo: null });

  const fetchProductsFromApi = async () => {
    console.log('Fetching products from API...');
    try {
      const products = await getAllProductsApi();
      const mappedProducts = products.map(mapProductApiToClient);
      setAllConcessions(mappedProducts); // Cập nhật state allConcessions
      console.log('Fetched products:', mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setCheckingStockState({ itemId: null, isLoading: false, error: "Lỗi tải danh sách sản phẩm.", stockInfo: null });
    }
  };

  useEffect(() => {
    fetchProductsFromApi();
    if (
      !previousBookingState.movieId ||
      !previousBookingState.showtimeId ||
      !previousBookingState.selectedSeats ||
      previousBookingState.selectedSeats.length === 0 ||
      previousBookingState.totalSeatPrice === undefined
    ) {
      console.warn("AddConcessionsPage: Thiếu thông tin từ bước chọn ghế, điều hướng về chọn phim.");
      navigate(`${STAFF_BASE_PATH}/tickets/new/select-movie`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Bỏ previousBookingState và navigate khỏi dependencies nếu không muốn fetch lại khi chúng thay đổi không cần thiết

  // handleQuantityChange đã được cập nhật để gọi API
  const handleQuantityChange = useCallback(async (itemId, change) => {
    const currentSelectedQuantity = selectedConcessions[itemId] || 0;
    let newRequestedQuantity = currentSelectedQuantity + change;

    if (newRequestedQuantity < 0) newRequestedQuantity = 0;

    setCheckingStockState({ itemId: itemId, isLoading: true, error: null, stockInfo: null });

    try {
      const productClientInfo = allConcessions.find(p => p.id === itemId);
      if (!productClientInfo) throw new Error("Sản phẩm không tồn tại ở client.");

      if (productClientInfo.status === 'Ngừng kinh doanh' && newRequestedQuantity > currentSelectedQuantity) {
          setCheckingStockState({ itemId: itemId, isLoading: false, error: `Sản phẩm "${productClientInfo.name}" đã ngừng kinh doanh.`, stockInfo: null });
          return;
      }
      
      const apiResponse = await checkProductStockApi(itemId, newRequestedQuantity);

      if (apiResponse.available) {
        setSelectedConcessions(prev => {
          const updated = { ...prev };
          if (newRequestedQuantity === 0) {
            delete updated[itemId];
          } else {
            updated[itemId] = newRequestedQuantity;
          }
          return updated;
        });
        // Cập nhật thông tin tồn kho từ API để hiển thị "Còn lại: X"
        setCheckingStockState({ 
            itemId: itemId, 
            isLoading: false, 
            error: null, 
            stockInfo: { currentStock: apiResponse.currentStock, productStatus: apiResponse.productStatus } 
        });
      } else {
        setCheckingStockState({ 
            itemId: itemId, 
            isLoading: false, 
            error: apiResponse.message, 
            stockInfo: { currentStock: apiResponse.currentStock, productStatus: apiResponse.productStatus, maxAllowed: apiResponse.maxAllowed }
        });
      }
    } catch (error) {
      console.error(`Lỗi khi thay đổi số lượng cho ${itemId}:`, error);
      setCheckingStockState({ itemId: itemId, isLoading: false, error: error.message || "Lỗi không xác định.", stockInfo: null });
    }
  }, [selectedConcessions, allConcessions]);


  const calculateTotalConcessionsPrice = () => {
    let total = 0;
    for (const itemId in selectedConcessions) {
      if (!selectedConcessions[itemId] || selectedConcessions[itemId] === 0) continue; // Bỏ qua nếu số lượng là 0
      const item = allConcessions.find(c => c.id === itemId); // Tìm trong allConcessions
      if (item) {
        total += item.price * selectedConcessions[itemId];
      }
    }
    return total;
  };

  const totalConcessionsPrice = calculateTotalConcessionsPrice();

  const handleNext = () => {
    if (checkingStockState.error && checkingStockState.itemId) {
        const itemWithError = allConcessions.find(p => p.id === checkingStockState.itemId);
        alert(`Sản phẩm "${itemWithError?.name || checkingStockState.itemId}" đang có vấn đề: ${checkingStockState.error}. Vui lòng điều chỉnh.`);
        return;
    }
    // Tạo concessionsData gửi đi với các trường backend cần
    const concessionsData = Object.entries(selectedConcessions)
      .map(([itemId, quantity]) => {
        if (!quantity || quantity === 0) return null; // Bỏ qua sản phẩm có số lượng là 0
        const itemDetails = allConcessions.find(c => c.id === itemId);
        if (!itemDetails) return null; // Nên có trường hợp này không
        return {
          // Các trường backend cần cho bảng CHITIETHOADON_SANPHAMKHAC
          MaSP: itemDetails.id,
          SoLuong: quantity,
          GiaBan_LucChon: itemDetails.price, // GIASP của sản phẩm tại thời điểm chọn
          ThanhTien: itemDetails.price * quantity,

          // Các trường client có thể cần để hiển thị ở bước sau hoặc nếu quay lại trang này
          id: itemDetails.id, // Để khôi phục selectedConcessions
          name: itemDetails.name,
          price: itemDetails.price, // Giá gốc của sản phẩm
          quantity: quantity, // Số lượng đã chọn
          posterUrl: itemDetails.posterUrl,
          // ... thêm các trường khác của itemDetails nếu cần ...
        };
      })
      .filter(item => item !== null);

    navigate(`${STAFF_BASE_PATH}/tickets/new/customer-info`, {
      state: {
        ...previousBookingState,
        concessions: concessionsData,
        totalConcessionsPrice,
      }
    });
  };

  const handleSkip = () => {
    navigate(`${STAFF_BASE_PATH}/tickets/new/customer-info`, {
      state: {
        ...previousBookingState,
        concessions: [],
        totalConcessionsPrice: 0,
      }
    });
  };

  // useEffect cho việc kiểm tra previousBookingState vẫn giữ nguyên
  // Chỉ cần sửa `fetchProductsFromApi` và cách dùng allConcessions (trước đây là mockConcessions)

  const groupedConcessions = allConcessions.reduce((acc, item) => {
    const categoryKey = item.category || 'Khác'; // Sử dụng item.category từ mapProductApiToClient
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {});

  return (
    <div className="create-ticket-step add-concessions-page-list-view">
      <h2 className="page-step-title-main">Bước 4: Chọn Sản Phẩm/Combo (Tùy chọn)</h2>
      {checkingStockState.itemId === null && checkingStockState.error && (
        <p className="global-error-message" style={{ color: 'red', textAlign: 'center' }}>{checkingStockState.error}</p>
      )}
      <div className="concessions-list-rows-wrapper">
        <div className="concessions-list-rows">
          {Object.entries(groupedConcessions).map(([category, items]) => (
            <div key={category} className="concession-category-group">
              <h3 className="concession-category-title">{category}</h3>
              {items.map(item => {
                const currentSelectedQty = selectedConcessions[item.id] || 0;
                const isLoadingThisItem = checkingStockState.itemId === item.id && checkingStockState.isLoading;
                const errorForThisItem = checkingStockState.itemId === item.id ? checkingStockState.error : null;
                const stockInfoForThisItem = checkingStockState.itemId === item.id ? checkingStockState.stockInfo : null;

                let displayStock = item.initialStock; // Mặc định hiển thị tồn kho ban đầu
                let displayStatus = item.status;    // Mặc định hiển thị trạng thái ban đầu

                if (stockInfoForThisItem) { // Nếu có thông tin từ API check-stock gần nhất
                    displayStock = stockInfoForThisItem.currentStock !== undefined ? stockInfoForThisItem.currentStock : displayStock;
                    displayStatus = stockInfoForThisItem.productStatus || displayStatus;
                }
                
                let disableIncreaseButton = isLoadingThisItem;
                if (displayStatus === 'Ngừng kinh doanh') {
                    disableIncreaseButton = true;
                } else if (displayStatus === 'Hết hàng' && displayStock <= 0) {
                    disableIncreaseButton = true;
                } else if (currentSelectedQty >= displayStock && displayStock > 0) { // Nếu chọn bằng số lượng còn lại
                    disableIncreaseButton = true;
                }

                // Nếu API báo lỗi cụ thể không cho tăng, cũng disable
                if (errorForThisItem && (errorForThisItem.includes("hết hàng") || errorForThisItem.includes("chỉ còn") || errorForThisItem.includes("ngừng kinh doanh"))) {
                    disableIncreaseButton = true;
                }


                return (
                  <div key={item.id} className={`concession-row-item ${errorForThisItem ? 'has-item-error' : ''}`}>
                    <img src={item.posterUrl || 'https://via.placeholder.com/80x80?text=No+Image'} alt={item.name} className="concession-row-image" />
                    <div className="concession-row-details">
                      <h4 className="concession-row-name">{item.name}</h4>
                      <p className="concession-row-price">{item.price.toLocaleString('vi-VN')}đ</p>
                      
                      {/* Hiển thị thông tin tồn kho/trạng thái */}
                      <p className="concession-row-stock-info">
                        {displayStatus === 'Ngừng kinh doanh' ? <span style={{color: 'orange'}}>Ngừng kinh doanh</span> :
                         (displayStatus === 'Hết hàng' && displayStock <= 0) ? <span style={{color: 'red'}}>Hết hàng</span> :
                         `Còn: ${displayStock}`
                        }
                      </p>
                      
                      {errorForThisItem && <small className="concession-item-error-text">{errorForThisItem}</small>}
                    </div>
                    <div className="concession-row-quantity-selector">
                      <Button
                        size="small" variant="secondary" className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        disabled={isLoadingThisItem || currentSelectedQty === 0}
                        aria-label={`Giảm số lượng ${item.name}`}
                      >-</Button>
                      <span className="concession-quantity-value">
                        {isLoadingThisItem ? "..." : currentSelectedQty}
                      </span>
                      <Button
                        size="small" variant="secondary" className="quantity-btn quantity-btn-plus"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        disabled={disableIncreaseButton} // Sử dụng biến đã tính toán
                        aria-label={`Tăng số lượng ${item.name}`}
                      >+</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="workflow-actions-footer">
        <Button onClick={() => navigate(-1)} variant="light" size="medium" className="footer-back-button">Quay lại</Button>
        <div className="footer-main-actions">
          <div className="total-concessions-price">Tổng sản phẩm: <strong>{totalConcessionsPrice.toLocaleString('vi-VN')}đ</strong></div>
          <Button onClick={totalConcessionsPrice > 0 ? handleNext : handleSkip} variant="primary" size="medium" className="footer-continue-button">
            {totalConcessionsPrice > 0 ? 'Tiếp tục' : 'Bỏ qua & Tiếp tục'}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default AddConcessionsPage;