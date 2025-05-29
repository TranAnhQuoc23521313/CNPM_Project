import React, { useState, useEffect, useCallback } from 'react';
import './Equipments.css';
import Button from '../../../components/common/Button.jsx';
import AddEquipmentModal from './AddEquipmentModal';
import { getAllEquipmentApi, createEquipmentApi } from '../../../services/equipmentApiService';
import EquipmentDetailModal from './EquipmentDetailModal';

// Helper functions - Giữ nguyên
const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A'; // Kiểm tra ngày hợp lệ
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch (e) { return 'N/A'; }
};
// Hàm generateEquipmentId cần prefix từ LOAITHIETBI
/* const generateEquipmentId = (prefix = 'TB') => `${prefix}-${Date.now().toString().slice(-5)}${Math.random().toString(16).slice(2, 7).toUpperCase()}`; */

// Dữ liệu mẫu - CẬP NHẬT KEYS
/* const INITIAL_EQUIPMENTS_DATA = [
  { MATHIETBI: generateEquipmentId('MP'), TENTHIETBI: 'Máy chiếu Laser Christie CP2309-RGB', LOAITHIETBI: 'Máy chiếu', VITRITHIETBI: 'Phòng chiếu 1', NGAYMUA: '2022-08-15', NGAYHETBAOHANH: '2025-08-14', TRANGTHAI: 'Đang hoạt động', NGAYBAOTRI: '2023-10-20', GHICHU: 'Độ sáng tốt, cần kiểm tra định kỳ 6 tháng.', GIA: 150000000 },
  { MATHIETBI: generateEquipmentId('LOA'), TENTHIETBI: 'Hệ thống loa Dolby Atmos L-Acoustics', LOAITHIETBI: 'Âm thanh', VITRITHIETBI: 'Phòng chiếu 1', NGAYMUA: '2022-08-15', NGAYHETBAOHANH: '2024-08-14', TRANGTHAI: 'Đang hoạt động', NGAYBAOTRI: '2023-11-05', GHICHU: 'Âm thanh vòm chất lượng cao.', GIA: 250000000 },
  { MATHIETBI: generateEquipmentId('MP'), TENTHIETBI: 'Máy chiếu Barco SP2K-15', LOAITHIETBI: 'Máy chiếu', VITRITHIETBI: 'Phòng chiếu 2', NGAYMUA: '2021-05-10', NGAYHETBAOHANH: '2023-05-09', TRANGTHAI: 'Cần bảo trì', NGAYBAOTRI: '2023-04-01', GHICHU: 'Độ sáng giảm, có điểm mờ nhỏ.', GIA: 120000000 },
  { MATHIETBI: generateEquipmentId('POS'), TENTHIETBI: 'Máy POS bán vé Suno', LOAITHIETBI: 'Thiết bị bán vé', VITRITHIETBI: 'Quầy vé 1', NGAYMUA: '2023-01-20', NGAYHETBAOHANH: '2024-01-19', TRANGTHAI: 'Đang hoạt động', NGAYBAOTRI: 'N/A', GHICHU: '', GIA: 15000000 },
  { MATHIETBI: generateEquipmentId('AC'), TENTHIETBI: 'Điều hòa trung tâm Daikin', LOAITHIETBI: 'Điều hòa', VITRITHIETBI: 'Toàn rạp', NGAYMUA: '2020-07-01', NGAYHETBAOHANH: '2022-06-30', TRANGTHAI: 'Hỏng hóc', NGAYBAOTRI: '2023-09-15', GHICHU: 'Block nén gặp sự cố, chờ thay thế.', GIA: 300000000 },
]; */

// Các loại thiết bị và trạng thái để filter (ví dụ) - Giữ nguyên
const EQUIPMENT_TYPES = ['Tất cả', 'Máy chiếu', 'Âm thanh', 'Thiết bị bán vé', 'Điều hòa', 'Ghế ngồi', 'Khác'];
const EQUIPMENT_STATUSES = ['Tất cả', 'Đang hoạt động', 'Cần bảo trì', 'Đang sửa chữa', 'Hỏng hóc', 'Không sử dụng'];

const mapEquipmentApiToClient = (apiEquipment) => ({
  MATHIETBI: apiEquipment.MATHIETBI,
  TENTHIETBI: apiEquipment.TENTHIETBI,
  LOAITHIETBI: apiEquipment.LOAITHIETBI,
  VITRITHIETBI: apiEquipment.VITRITHIETBI,
  NGAYMUA: apiEquipment.NGAYMUA,
  NGAYHETBAOHANH: apiEquipment.NGAYHETBAOHANH,
  TRANGTHAI: apiEquipment.TRANGTHAI,
  NGAYBAOTRI: apiEquipment.NGAYBAOTRI,
  GIA: apiEquipment.GIA,
  GHICHU: apiEquipment.GHICHU
});

function Equipments() {
  const [equipments, setEquipments] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [viewingEquipment, setViewingEquipment] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [equipmentToView, setEquipmentToView] = useState(null);

  const fetchEquipmentsFromApi = useCallback(async () => {
    console.log("Equipments: Fetching equipments from API...");
    try {
      const apiEquipments = await getAllEquipmentApi();
      console.log("Equipments: API data fetched successfully", apiEquipments);
      const mappedEquipments = apiEquipments.map(mapEquipmentApiToClient);
      setEquipments(mappedEquipments);
    } catch (error) {
      console.error("Equipments: Error fetching equipments from API", error);
      alert("Lỗi khi tải dữ liệu thiết bị từ máy chủ. Vui lòng thử lại sau.");
    } finally {
      console.log("Equipments: Finished fetching equipments from API.");
    }
  }, []);

  useEffect(() => {
    fetchEquipmentsFromApi();
  }, [fetchEquipmentsFromApi]);

  const handleAddEquipment = useCallback(async (equipmentData) => {
    console.log("Equipments: Adding new equipment", equipmentData);
    try {
      const newEquipment = await createEquipmentApi(equipmentData);
      console.log("Equipments: New equipment added successfully", newEquipment);
      fetchEquipmentsFromApi(); // Cập nhật danh sách thiết bị sau khi thêm mới
    } catch (error) {
      console.error("Equipments: Error adding new equipment", error);
      alert("Lỗi khi thêm thiết bị mới. Vui lòng kiểm tra dữ liệu và thử lại.");
    }
  }, [fetchEquipmentsFromApi]);

  const handleUpdateEquipment = (updatedEquipmentData) => {
    setEquipments(prev => prev.map(eq =>
      eq.MATHIETBI === updatedEquipmentData.MATHIETBI
        ? {
          ...updatedEquipmentData,
          GIA: updatedEquipmentData.GIA ? parseFloat(updatedEquipmentData.GIA) : null // Parse GIA khi update
        }
        : eq
    ));
    setEditingEquipment(null);
  };

  const handleDeleteEquipment = (equipmentId) => { // Giả sử equipmentId là MATHIETBI
    if (window.confirm(`Bạn có chắc muốn xóa thiết bị có ID: ${equipmentId}?`)) {
      setEquipments(prev => prev.filter(eq => eq.MATHIETBI !== equipmentId));
    }
  };

  // << HÀM MỞ MODAL CHI TIẾT >>
  const openDetailModal = (equipment) => {
    setEquipmentToView(equipment);
    setShowDetailModal(true);
  };

  // CẬP NHẬT KEYS TRONG FILTER
  const filteredEquipments = equipments.filter(eq => {
    // Kiểm tra eq có phải là object không trước khi dùng Object.values
    if (typeof eq !== 'object' || eq === null) return false;

    const matchesSearchTerm = Object.values(eq).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesType = filterType === 'Tất cả' || eq.LOAITHIETBI === filterType;
    const matchesStatus = filterStatus === 'Tất cả' || eq.TRANGTHAI === filterStatus;
    return matchesSearchTerm && matchesType && matchesStatus;
  });

  return (
    <div className="page-container equipments-page">
      <div className="content-card">
        <h1 className="page-title">Quản Lý Trang Thiết Bị</h1>

        <div className="page-controls equipments-controls">
          <input
            type="text"
            placeholder="Tìm kiếm thiết bị (ID, tên, loại, vị trí...)"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="filter-group">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              {EQUIPMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              {EQUIPMENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-add-new">
            + Thêm Thiết Bị Mới
          </button>
        </div>

        {filteredEquipments.length > 0 ? (
          <div className="table-responsive-wrapper">
            <table className="data-table equipments-table">
              <thead>
                <tr>
                  <th>Mã TB</th>
                  <th>Tên Thiết Bị</th>
                  <th>Loại</th>
                  <th>Vị Trí</th>
                  <th>Ngày Mua</th>
                  <th>Trạng Thái</th>
                  <th>Giá</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipments.map(eq => (
                  <tr key={eq.MATHIETBI}>
                    <td>{eq.MATHIETBI}</td>
                    <td title={eq.TENTHIETBI} className="equipment-name-cell">{eq.TENTHIETBI}</td>
                    <td>{eq.LOAITHIETBI}</td>
                    <td>{eq.VITRITHIETBI}</td>
                    <td>{formatDate(eq.NGAYMUA)}</td>
                    <td>
                      {eq.TRANGTHAI ? (
                        <span className={`status-badge status-equipment-${eq.TRANGTHAI.toLowerCase().replace(/\s+/g, '-')}`}>
                          {eq.TRANGTHAI}
                        </span>
                      ) : (
                        <span className="status-badge status-equipment-unknown">Không rõ</span>
                      )}
                    </td>
                    <td>{formatCurrency(eq.GIA)}</td>
                    <td className="actions-cell">
                      {/* <button onClick={() => setEditingEquipment(eq)} className="btn-action btn-edit">Sửa</button>
                      <button onClick={() => handleDeleteEquipment(eq.MATHIETBI)} className="btn-action btn-delete">Xóa</button> */}
                      <Button onClick={() => openDetailModal(eq)} className="btn-action btn-view">Xem</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data-message">
            {searchTerm || filterType !== 'Tất cả' || filterStatus !== 'Tất cả'
              ? "Không tìm thấy thiết bị phù hợp."
              : "Chưa có thiết bị nào."}
          </p>
        )}
      </div>

      {showAddModal && (
        <AddEquipmentModal
          onClose={() => setShowAddModal(false)}
          onAddEquipment={handleAddEquipment}
          // generateId prop không còn cần thiết nếu ID được xử lý hoàn toàn trong Equipments
          equipmentTypes={EQUIPMENT_TYPES.filter(t => t !== 'Tất cả')}
          equipmentStatuses={EQUIPMENT_STATUSES.filter(s => s !== 'Tất cả')}
        />
      )}
      {showDetailModal && equipmentToView && (
        <EquipmentDetailModal
          equipment={equipmentToView}
          onClose={() => {
            setShowDetailModal(false);
            setEquipmentToView(null);
          }}
          formatCurrency={formatCurrency} // Truyền các hàm helper
          formatDate={formatDate}
        />
      )}
      {/* Các modal Edit và Detail sẽ cần được cập nhật tương tự nếu bạn sử dụng chúng */}
      {/* Ví dụ EditEquipmentModal sẽ nhận equipmentToEdit với các key mới */}

    </div>
  );
}

export default Equipments;