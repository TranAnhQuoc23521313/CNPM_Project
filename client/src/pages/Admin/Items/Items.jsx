import React, { useCallback, useState, useEffect } from 'react';
// import Button from '../../../components/common/Button.jsx'; // Không dùng trực tiếp Button này nữa
import './Items.css'; // Import CSS cho trang này
import EditItemModal from './EditItemModal.jsx'; // Import Edit Modal
import AddItemModal from './AddItemModal.jsx'; // Import Add Modal
import { getAllProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../../../services/productApiService.js';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal.jsx';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal.jsx';

const mapProductApiToClient = (apiProduct) => ({
  id: apiProduct.MASP,
  name: apiProduct.TENSP,
  type: apiProduct.LOAISP,
  price: apiProduct.GIASP,
  quantity: apiProduct.SOLUONG,
  status: apiProduct.TRANGTHAISP,
  posterUrl: apiProduct.HINHANHSP ? `${process.env.REACT_APP_API_URL}${apiProduct.HINHANHSP}` : null,
  posterPlaceholder: apiProduct.HINHANHSP ? null : `Poster ${apiProduct.TENSP.split(' ')[0] || 'Item'}`,
  // Giữ lại các trường gốc nếu modal cần (EditItemModal có thể đang dùng)
  MASP: apiProduct.MASP,
  LOAISP: apiProduct.LOAISP,
  GIASP: apiProduct.GIASP,
  SOLUONG: apiProduct.SOLUONG,
  TRANGTHAISP: apiProduct.TRANGTHAISP,
  HINHANHSP: apiProduct.HINHANHSP,
  TENSP: apiProduct.TENSP, // Dù đã có name, giữ lại để tương thích nếu modal dùng trực tiếp
});


const ItemsPage = () => {
  const pageTitle = 'Sản phẩm'; // Có thể dùng cho document.title nếu muốn
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [errorToDisplay, setErrorToDisplay] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProductsFromApi = useCallback(async () => {
    console.log('Fetching products from API...');
    setIsLoading(true);
    setErrorToDisplay(null); // Clear previous errors
    try {
      const products = await getAllProductsApi();
      const mappedProducts = products.map(mapProductApiToClient);
      setItems(mappedProducts);
      // Áp dụng bộ lọc tìm kiếm hiện tại nếu có
      if (searchQuery) {
        const filtered = mappedProducts.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredItems(filtered);
      } else {
        setFilteredItems(mappedProducts);
      }
      console.log('Fetched products:', mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorToDisplay(error.message || 'Không thể tải danh sách sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]); // Thêm searchQuery vào dependencies của useCallback

  useEffect(() => {
    fetchProductsFromApi();
  }, []); // Chỉ fetchProductsFromApi là dependency

  // --- HÀM HANDLER ---
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const currentItems = items; // Luôn lọc từ danh sách gốc
    const filtered = currentItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.id && item.id.toString().toLowerCase().includes(query)) || // Tìm theo ID
      (item.type && item.type.toLowerCase().includes(query)) // Tìm theo loại
    );
    setFilteredItems(filtered);
  };

  const handleAddItemClick = () => {
    setIsAddModalOpen(true);
  };
  const handleCloseAddItemModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleAddItemSubmit = useCallback(async (formDataFromModal) => {
    console.log('Adding new item:', formDataFromModal);
    setIsLoading(true);
    setErrorToDisplay(null);
    const dataPayload = new FormData();
    dataPayload.append('TENSP', formDataFromModal.name);
    dataPayload.append('LOAISP', formDataFromModal.type);
    dataPayload.append('GIASP', formDataFromModal.price);
    dataPayload.append('SOLUONG', formDataFromModal.quantity);
    dataPayload.append('TRANGTHAISP', formDataFromModal.status);
    if (formDataFromModal.imageFile && formDataFromModal.imageFile instanceof File) {
      dataPayload.append('HINHANHSP_FILE', formDataFromModal.imageFile, formDataFromModal.imageFile.name);
      console.log('ItemsPage: Successfully appended HINHANHSP_FILE:', formDataFromModal.imageFile.name);
    } else if (formDataFromModal.imageFile) {
      console.warn('ItemsPage: formDataFromModal.imageFile is present but not an instance of File. Type:', typeof formDataFromModal.imageFile);
    }

    try {
      await createProductApi(dataPayload);
      setSuccessMessage('Thêm sản phẩm thành công!');
      handleCloseAddItemModal();
      fetchProductsFromApi(); // Fetch lại danh sách
    } catch (error) {
      console.error('Error adding new item:', error);
      setErrorToDisplay(error.response?.data?.message || error.message || 'Không thể thêm sản phẩm mới.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchProductsFromApi, handleCloseAddItemModal]);

  const handleEditItemClick = (item) => { setItemToEdit(item); setIsEditModalOpen(true); };
  const handleCloseEditModal = useCallback(() => { setIsEditModalOpen(false); setItemToEdit(null); }, []);

  const handleUpdateItemSubmit = useCallback(async (itemId, updatedData) => {
    console.log('Updating item:', itemId, 'with data:', updatedData);
    setIsLoading(true);
    setErrorToDisplay(null);
    const dataPayload = new FormData();
    dataPayload.append('TENSP', updatedData.name);
    dataPayload.append('LOAISP', updatedData.type);
    dataPayload.append('GIASP', updatedData.price);
    dataPayload.append('SOLUONG', updatedData.quantity);
    dataPayload.append('TRANGTHAISP', updatedData.status);
    if (updatedData.newPosterFile && updatedData.newPosterFile instanceof File) {
      dataPayload.append('HINHANHSP_FILE', updatedData.newPosterFile, updatedData.newPosterFile.name);
    }

    try {
      await updateProductApi(itemId, dataPayload);
      setSuccessMessage('Cập nhật sản phẩm thành công!');
      handleCloseEditModal();
      fetchProductsFromApi(); // Fetch lại danh sách
    } catch (error) {
      console.error('Error updating item:', error);
      setErrorToDisplay(error.response?.data?.message || error.message || 'Không thể cập nhật sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchProductsFromApi, handleCloseEditModal]);

  const handleDeleteClick = (item) => { setItemToDelete(item); };
  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    setErrorToDisplay(null);
    try {
      await deleteProductApi(itemToDelete.id);
      setSuccessMessage('Xóa sản phẩm thành công!');
      fetchProductsFromApi(); // Fetch lại danh sách
    } catch (error) {
      console.error('Error deleting item:', error);
      setErrorToDisplay(error.response?.data?.message || error.message || 'Không thể xóa sản phẩm.');
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, fetchProductsFromApi]);

  const cancelDelete = useCallback(() => { setItemToDelete(null); }, []);
  const handleCloseErrorModal = useCallback(() => { setErrorToDisplay(null); }, []);
  const handleCloseSuccessModal = useCallback(() => { setSuccessMessage(null); }, []);

  const itemsToDisplay = filteredItems;

  return (
    <div className="items-page page-container">
      <div className="content-card">
        {isLoading && (
          <div className="loading-spinner-overlay">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        )}

        <h1 className="page-main-title">Quản Lý Sản Phẩm</h1>

        <div className="items-page-header">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm (tên, mã, loại...)"
              className="items-search-input"
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={isLoading} // Disable khi đang tải
            />
          </div>
          <button
            className="btn-add-new-item"
            onClick={handleAddItemClick}
            disabled={isLoading} // Disable khi đang tải
          >
            {/* Có thể thêm icon ở đây nếu muốn, ví dụ: <i className="fas fa-plus"></i> */}
            + Thêm Sản Phẩm
          </button>
        </div>

        <div className="items-list-container item-row-layout">
          {itemsToDisplay.length > 0 ? (
            itemsToDisplay.map((item) => {
              let statusDisplayClasses = 'item-detail-field';
              if (item.status === 'Hết hàng') {
                statusDisplayClasses += ' status-out-of-stock';
              } else if (item.status === 'Ngừng bán') {
                statusDisplayClasses += ' status-discontinued';
              }

              const formattedPrice = item.price != null ? item.price.toLocaleString('vi-VN') + ' đ' : 'N/A';
              const displayQuantity = item.quantity != null ? item.quantity : 'N/A';

              return (
                <div key={item.id} className="item-row">
                  <div className="item-poster-container">
                    <div className="item-poster-placeholder">
                      {item.posterUrl ? (
                        <img src={item.posterUrl} alt={item.name} className="item-actual-poster" />
                      ) : (
                        item.posterPlaceholder || 'Poster'
                      )}
                    </div>
                  </div>
                  <div className="item-info-container">
                    <div className="item-name" title={item.name}>{item.name}</div>
                    <div className="item-details">
                      <div className="item-detail-field price-field" title={`Giá: ${formattedPrice}`}>
                        <span className="item-detail-label">Giá:</span>
                        <span className="item-detail-value">{formattedPrice}</span>
                      </div>
                      <div className={statusDisplayClasses} title={`Trạng thái: ${item.status || 'N/A'}`}>
                        <span className="item-detail-label">Trạng thái:</span>
                        <span className="item-detail-value">{item.status || 'N/A'}</span>
                      </div>
                      <div className="item-detail-field quantity-field" title={`Số lượng: ${displayQuantity}`}>
                        <span className="item-detail-label">SL:</span>
                        <span className="item-detail-value">{displayQuantity}</span>
                      </div>
                      <div className="item-detail-field type-field" title={`Loại sản phẩm: ${item.type || 'N/A'}`}>
                        <span className="item-detail-label">Loại:</span>
                        <span className="item-detail-value">{item.type || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="item-actions-container">
                    <button
                      onClick={() => handleEditItemClick(item)}
                      className="item-action-text-btn edit-text-btn"
                      title="Chỉnh sửa"
                      disabled={isLoading} // Disable khi đang tải
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="item-action-text-btn delete-text-btn"
                      title="Xóa"
                      disabled={isLoading} // Disable khi đang tải
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            // Chỉ hiển thị "Không có sản phẩm" nếu không phải đang loading
            !isLoading && (
              <p className="no-items-found">
                {searchQuery ? 'Không tìm thấy sản phẩm nào phù hợp.' : 'Chưa có sản phẩm nào.'}
              </p>
            )
          )}
        </div>
      </div>

      {itemToDelete && (
        <div className="modal-overlay confirmation-overlay" onClick={!isLoading ? cancelDelete : undefined}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa sản phẩm "{itemToDelete.name}"?</p>
            <div className="confirmation-actions">
              <button onClick={cancelDelete} className="cancel-btn" disabled={isLoading}>Không</button>
              <button onClick={confirmDelete} className="confirm-delete-btn" disabled={isLoading}>
                {isLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        item={itemToEdit}
        onUpdateItem={handleUpdateItemSubmit}
        isLoading={isLoading} // Truyền trạng thái loading cho modal
      />

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddItemModal}
        onAddItem={handleAddItemSubmit}
        isLoading={isLoading} // Truyền trạng thái loading cho modal
      />

      <SuccessMessageModal
        isOpen={!!successMessage}
        onClose={handleCloseSuccessModal}
        successMessage={successMessage}
      />

      <ErrorMessageModal
        isOpen={!!errorToDisplay}
        onClose={handleCloseErrorModal}
        errorMessage={errorToDisplay}
      />
    </div>
  );
};

export default ItemsPage;