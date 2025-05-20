import React, { use, useCallback, useState, useEffect } from 'react';
import Button from '../../../components/common/Button.jsx'; // Đảm bảo đường dẫn đúng
import './Items.css'; // Import CSS cho trang này
import EditItemModal from './EditItemModal.jsx'; // Import Edit Modal
import AddItemModal from './AddItemModal.jsx'; // Import Add Modal (nếu bạn đã tạo)
import { getAllProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../../../services/productApiService.js';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal.jsx';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal.jsx';

// --- DỮ LIỆU GIẢ LẬP BAN ĐẦU ---
// const initialItemsData = [
//   { id: 1, name: 'Bắp Rang Bơ Caramel', price: 55000, status: 'Còn hàng', posterUrl: null, posterPlaceholder: 'Poster Bắp' },
//   { id: 2, name: 'Nước ngọt Coca-Cola', price: 25000, status: 'Hết hàng', posterUrl: null, posterPlaceholder: 'Poster Coca' },
//   { id: 3, name: 'Combo 2 Nước 1 Bắp', price: 95000, status: 'Ngừng bán', posterUrl: null, posterPlaceholder: 'Poster Combo' },
//   { id: 4, name: 'Vé xem phim 2D (Cuối tuần)', price: 120000, status: 'Còn hàng', posterUrl: null, posterPlaceholder: 'Poster Vé' },
//   { id: 5, name: 'Snack Khoai Tây Vị BBQ', price: 30000, status: 'Ngừng bán', posterUrl: null, posterPlaceholder: 'Poster Snack' },
// ];

const mapProductApiToClient = (apiProduct) => ({
  id: apiProduct.MASP,
  name: apiProduct.TENSP,
  type: apiProduct.LOAISP,
  price: apiProduct.GIASP,
  quantity: apiProduct.SOLUONG,
  status: apiProduct.TRANGTHAISP,
  posterUrl: apiProduct.HINHANHSP ? `${process.env.REACT_APP_API_URL}${apiProduct.HINHANHSP}` : null,
  posterPlaceholder: apiProduct.HINHANHSP ? null : `Poster ${apiProduct.TENSP.split(' ')[0] || 'Item'}`,
  // ... các trường gốc nếu cần
  MASP: apiProduct.MASP,
  LOAISP: apiProduct.LOAISP,
  GIASP: apiProduct.GIASP,
  SOLUONG: apiProduct.SOLUONG,
  TRANGTHAISP: apiProduct.TRANGTHAISP,
  HINHANHSP: apiProduct.HINHANHSP,
  TENSP: apiProduct.TENSP,
});


const ItemsPage = () => {
  const pageTitle = 'Sản phẩm';
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State cho Add Modal

  const [errorToDisplay, setErrorToDisplay] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProductsFromApi = async () => {
    console.log('Fetching products from API...');
    setIsLoading(true);
    try {
      const products = await getAllProductsApi();
      const mappedProducts = products.map(mapProductApiToClient);
      setItems(mappedProducts);
      setFilteredItems(mappedProducts);
      console.log('Fetched products:', mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorToDisplay(error.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProductsFromApi();
  }, []);

  // --- HÀM HANDLER ---
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const currentItems = items;
    const filtered = currentItems.filter(item =>
      item.name.toLowerCase().includes(query)
    );
    setFilteredItems(filtered);
  };

  const handleAddItemClick = () => {
    setIsAddModalOpen(true); // Mở AddItemModal
  };
  const handleCloseAddItemModal = () => {
    setIsAddModalOpen(false);
  };
  const handleAddItemSubmit = useCallback(async (formDataFromModal) => {
    // const newItemId = Date.now();
    // const itemToAdd = {
    //   ...newItemData, id: newItemId, posterUrl: null,
    //   posterPlaceholder: `Poster ${newItemData.name.split(' ')[0] || 'Item'}`
    // };
    // const newItemsList = [itemToAdd, ...items];
    // setItems(newItemsList);
    // setFilteredItems(newItemsList.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())));
    // alert('Thêm sản phẩm thành công!');
    // handleCloseAddItemModal();
    console.log('Adding new item:', formDataFromModal);
    setIsLoading(true);
    setErrorToDisplay(null);
    const dataPayload = new FormData();
    dataPayload.append('TENSP', formDataFromModal.name);
    dataPayload.append('LOAISP', formDataFromModal.type);
    dataPayload.append('GIASP', formDataFromModal.price);
    dataPayload.append('SOLUONG', formDataFromModal.quantity);
    dataPayload.append('TRANGTHAISP', formDataFromModal.status);
    if (formDataFromModal.imageFile) { // TẠM THỜI BỎ instanceof File
      console.log('ItemsPage: formDataFromModal.imageFile is truthy. Type:', typeof formDataFromModal.imageFile, 'Is File instance:', formDataFromModal.imageFile instanceof File);
      if (formDataFromModal.imageFile instanceof File) { // Kiểm tra lại instanceof ở đây
        dataPayload.append('HINHANHSP_FILE', formDataFromModal.imageFile, formDataFromModal.imageFile.name);
        console.log('ItemsPage: Successfully appended HINHANHSP_FILE:', formDataFromModal.imageFile.name);
      } else {
        console.error('ItemsPage: formDataFromModal.imageFile is truthy BUT NOT an instance of File. Actual object:', formDataFromModal.imageFile);
        // Có thể nó là một object thường có cấu trúc giống File?
      }
    } else {
      console.warn('ItemsPage: formDataFromModal.imageFile is falsy or missing.');
    }

    try {
      const newItem = await createProductApi(dataPayload);
      console.log('New item created:', newItem);
      fetchProductsFromApi(); // Fetch lại danh sách sản phẩm sau khi thêm mới
      setSuccessMessage('Thêm sản phẩm thành công!');
      handleCloseAddItemModal();
    } catch (error) {
      console.error('Error adding new item:', error);
      setErrorToDisplay(error.message || 'Failed to add new item');
    } finally {
      setIsLoading(false);
    }
  }, [fetchProductsFromApi, handleCloseAddItemModal]);

  const handleEditItemClick = (item) => { setItemToEdit(item); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setItemToEdit(null); };
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
    if (updatedData.newPosterFile) {
      dataPayload.append('HINHANHSP_FILE', updatedData.newPosterFile, updatedData.newPosterFile.name);
      console.log('ItemsPage: Successfully appended HINHANHSP:', updatedData.newPosterFile.name);
    }
    try {
      const updatedItem = await updateProductApi(itemId, dataPayload);
      console.log('Item updated:', updatedItem);
      fetchProductsFromApi(); // Fetch lại danh sách sản phẩm sau khi cập nhật
      setSuccessMessage('Cập nhật sản phẩm thành công!');
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating item:', error);
      setErrorToDisplay(error.message || 'Failed to update item');
    } finally {
      setIsLoading(false);
    }
  }, [items, fetchProductsFromApi, handleCloseEditModal]);

  const handleDeleteClick = (item) => { setItemToDelete(item); };
  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;

    console.log('Deleting item:', itemToDelete);
    setIsLoading(true);
    setErrorToDisplay(null);  
    try {
      await deleteProductApi(itemToDelete.id);
      console.log('Item deleted:', itemToDelete.id);
      fetchProductsFromApi(); // Fetch lại danh sách sản phẩm sau khi xóa
      setSuccessMessage('Xóa sản phẩm thành công!');
    } catch (error) {
      console.error('Error deleting item:', error);
      setErrorToDisplay(error.message || 'Failed to delete item');
    } finally {
      setIsLoading(false);
      setItemToDelete(null); // Đóng modal xác nhận xóa
    }
  },[itemToDelete, fetchProductsFromApi]);
  const cancelDelete = () => { setItemToDelete(null); };
  // --- KẾT THÚC HÀM HANDLER ---

  const itemsToDisplay = filteredItems;

  return (
    <div className="items-page"> {/* Sử dụng class cụ thể cho trang */}
      {/* Header */}
      <div className="items-page-header"> {/* Class cụ thể cho header của trang này */}
        <h1>{pageTitle}</h1>
        <div className="header-actions"> {/* Container cho actions nếu cần nhóm */}
          <input
            type="text"
            placeholder="Search items by name..."
            className="items-search-input" // Class cụ thể cho search bar của trang này
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {/* Sử dụng variant="primary" để có màu xanh */}
          <Button variant="primary" size="medium" onClick={handleAddItemClick}>
            + Add Item
          </Button>
        </div>
      </div>

      {/* Item List Container */}
      <div className="items-list-container item-row-layout">
        {itemsToDisplay.length > 0 ? (
          itemsToDisplay.map((item) => {
            let statusInputClasses = 'item-field-input status-input';
            if (item.status === 'Hết hàng') {
              statusInputClasses += ' status-out-of-stock-input';
            } else if (item.status === 'Ngừng bán') {
              statusInputClasses += ' status-discontinued-input';
            }
            return (
              <div key={item.id} className="item-row">
                <div className="item-poster-container">
                  <div className="item-poster-placeholder">
                    {item.posterUrl ? (<img src={item.posterUrl} alt={item.name} className="item-actual-poster" />) : (item.posterPlaceholder || 'Poster')}
                  </div>
                </div>
                <div className="item-info-container">
                  <div className="item-name">{item.TENSP}</div>
                  <div className="item-details">
                    <input id={`price-${item.id}`} type="text" className="item-field-input price-input" value={item.price ? item.price.toLocaleString('vi-VN') + ' đ' : ''} placeholder="Nhập giá" readOnly title={`Giá: ${item.price ? item.price.toLocaleString('vi-VN') + ' đ' : 'N/A'}`} />
                    <input id={`status-${item.id}`} type="text" className={statusInputClasses} value={item.status || ''} placeholder="Nhập tình trạng" readOnly title={`Trạng thái: ${item.status || 'N/A'}`} />
                    <input id={`quantity-${item.id}`} type="text" className="item-field-input quantity-input" value={item.quantity || ''} placeholder="Nhập số lượng" readOnly title={`Số lượng: ${item.quantity || 'N/A'}`} />
                    <input id={`type-${item.id}`} type="text" className="item-field-input type-input" value={item.type || ''} placeholder="Nhập loại sản phẩm" readOnly title={`Loại sản phẩm: ${item.type || 'N/A'}`} />
                  </div>
                </div>
                <div className="item-actions-container">
                  <button onClick={() => handleEditItemClick(item)} className="item-action-text-btn edit-text-btn" title="Edit">Edit</button>
                  <button onClick={() => handleDeleteClick(item)} className="item-action-text-btn delete-text-btn" title="Delete">Delete</button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-items-found">{searchQuery ? 'No items found matching your search.' : 'No items available.'}</p>
        )}
      </div>

      {/* Modal Xác Nhận Xóa */}
      {itemToDelete && (
        <div className="modal-overlay confirmation-overlay" onClick={cancelDelete}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa sản phẩm "{itemToDelete.name}"?</p>
            <div className="confirmation-actions">
              <button onClick={cancelDelete} className="cancel-btn">Không</button>
              <button onClick={confirmDelete} className="confirm-delete-btn">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Item */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        item={itemToEdit}
        onUpdateItem={handleUpdateItemSubmit}
      />

      {/* Modal Thêm Item Mới */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddItemModal}
        onAddItem={handleAddItemSubmit}
      // Không cần truyền movies/screens cho AddItemModal nếu nó không dùng
      />
    </div>
  );
};

export default ItemsPage;