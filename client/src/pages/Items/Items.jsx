import React, { useState } from 'react';
import Button from '../../components/common/Button.jsx'; // Đảm bảo đường dẫn đúng
import './Items.css'; // Import CSS cho trang này
import EditItemModal from './EditItemModal.jsx'; // Import Edit Modal
import AddItemModal from './AddItemModal.jsx'; // Import Add Modal (nếu bạn đã tạo)

// --- DỮ LIỆU GIẢ LẬP BAN ĐẦU ---
const initialItemsData = [
  { id: 1, name: 'Bắp Rang Bơ Caramel', price: 55000, status: 'Còn hàng', posterUrl: null, posterPlaceholder: 'Poster Bắp' },
  { id: 2, name: 'Nước ngọt Coca-Cola', price: 25000, status: 'Hết hàng', posterUrl: null, posterPlaceholder: 'Poster Coca' },
  { id: 3, name: 'Combo 2 Nước 1 Bắp', price: 95000, status: 'Ngừng bán', posterUrl: null, posterPlaceholder: 'Poster Combo' },
  { id: 4, name: 'Vé xem phim 2D (Cuối tuần)', price: 120000, status: 'Còn hàng', posterUrl: null, posterPlaceholder: 'Poster Vé' },
  { id: 5, name: 'Snack Khoai Tây Vị BBQ', price: 30000, status: 'Ngừng bán', posterUrl: null, posterPlaceholder: 'Poster Snack' },
];

const ItemsPage = () => {
  const pageTitle = 'Sản phẩm';
  const [items, setItems] = useState(initialItemsData);
  const [filteredItems, setFilteredItems] = useState(initialItemsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State cho Add Modal

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
  const handleAddItemSubmit = (newItemData) => {
    const newItemId = Date.now();
    const itemToAdd = {
        ...newItemData, id: newItemId, posterUrl: null,
        posterPlaceholder: `Poster ${newItemData.name.split(' ')[0] || 'Item'}`
    };
    const newItemsList = [itemToAdd, ...items];
    setItems(newItemsList);
    setFilteredItems(newItemsList.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())));
    alert('Thêm sản phẩm thành công!');
    handleCloseAddItemModal();
  };

  const handleEditItemClick = (item) => { setItemToEdit(item); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setItemToEdit(null); };
  const handleUpdateItemSubmit = (itemId, updatedData) => {
    const updatedItemsList = items.map(item => item.id === itemId ? { ...item, ...updatedData } : item);
    setItems(updatedItemsList);
    setFilteredItems(updatedItemsList.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())));
    alert('Cập nhật sản phẩm thành công!');
    handleCloseEditModal();
  };

  const handleDeleteClick = (item) => { setItemToDelete(item); };
  const confirmDelete = () => {
    if (itemToDelete) {
      const newItems = items.filter(item => item.id !== itemToDelete.id);
      setItems(newItems);
      setFilteredItems(newItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())));
      alert(`Đã xóa sản phẩm: ${itemToDelete.name}`);
      setItemToDelete(null);
    }
  };
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
                    {item.posterUrl ? ( <img src={item.posterUrl} alt={item.name} className="item-actual-poster"/> ) : ( item.posterPlaceholder || 'Poster' )}
                  </div>
                </div>
                <div className="item-info-container">
                  <div className="item-name">{item.name}</div>
                  <div className="item-details">
                    <input id={`price-${item.id}`} type="text" className="item-field-input price-input" value={item.price ? item.price.toLocaleString('vi-VN') + ' đ' : ''} placeholder="Nhập giá" readOnly title={`Giá: ${item.price ? item.price.toLocaleString('vi-VN') + ' đ' : 'N/A'}`} />
                    <input id={`status-${item.id}`} type="text" className={statusInputClasses} value={item.status || ''} placeholder="Nhập tình trạng" readOnly title={`Trạng thái: ${item.status || 'N/A'}`} />
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