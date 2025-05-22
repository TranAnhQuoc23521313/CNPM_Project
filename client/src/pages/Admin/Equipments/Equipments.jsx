import React, { useState, useEffect } from 'react';
import './Equipments.css'; // CSS chính cho trang
import AddEquipmentModal from './AddEquipmentModal';
//import EditEquipmentModal from './EditEquipmentModal';
//import EquipmentDetailModal from './EquipmentDetailModal';

// Helper functions
const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) { return 'N/A'; }
};
const generateEquipmentId = (prefix = 'TB') => `${prefix}-${Date.now().toString().slice(-5)}${Math.random().toString(16).slice(2, 7).toUpperCase()}`;

// Dữ liệu mẫu
const INITIAL_EQUIPMENTS_DATA = [
  { id: generateEquipmentId('MP'), name: 'Máy chiếu Laser Christie CP2309-RGB', type: 'Máy chiếu', location: 'Phòng chiếu 1', purchaseDate: '2022-08-15', warrantyEndDate: '2025-08-14', status: 'Đang hoạt động', lastMaintenance: '2023-10-20', notes: 'Độ sáng tốt, cần kiểm tra định kỳ 6 tháng.' },
  { id: generateEquipmentId('LOA'), name: 'Hệ thống loa Dolby Atmos L-Acoustics', type: 'Âm thanh', location: 'Phòng chiếu 1', purchaseDate: '2022-08-15', warrantyEndDate: '2024-08-14', status: 'Đang hoạt động', lastMaintenance: '2023-11-05', notes: 'Âm thanh vòm chất lượng cao.' },
  { id: generateEquipmentId('MP'), name: 'Máy chiếu Barco SP2K-15', type: 'Máy chiếu', location: 'Phòng chiếu 2', purchaseDate: '2021-05-10', warrantyEndDate: '2023-05-09', status: 'Cần bảo trì', lastMaintenance: '2023-04-01', notes: 'Độ sáng giảm, có điểm mờ nhỏ.' },
  { id: generateEquipmentId('POS'), name: 'Máy POS bán vé Suno', type: 'Thiết bị bán vé', location: 'Quầy vé 1', purchaseDate: '2023-01-20', warrantyEndDate: '2024-01-19', status: 'Đang hoạt động', lastMaintenance: 'N/A', notes: '' },
  { id: generateEquipmentId('AC'), name: 'Điều hòa trung tâm Daikin', type: 'Điều hòa', location: 'Toàn rạp', purchaseDate: '2020-07-01', warrantyEndDate: '2022-06-30', status: 'Hỏng hóc', lastMaintenance: '2023-09-15', notes: 'Block nén gặp sự cố, chờ thay thế.' },
];

// Các loại thiết bị và trạng thái để filter (ví dụ)
const EQUIPMENT_TYPES = ['Tất cả', 'Máy chiếu', 'Âm thanh', 'Thiết bị bán vé', 'Điều hòa', 'Ghế ngồi', 'Khác'];
const EQUIPMENT_STATUSES = ['Tất cả', 'Đang hoạt động', 'Cần bảo trì', 'Đang sửa chữa', 'Hỏng hóc', 'Không sử dụng'];


function Equipments() {
  const [equipments, setEquipments] = useState(() => {
    const saved = localStorage.getItem('cinemaEquipmentsData');
    try {
      return saved ? JSON.parse(saved) : INITIAL_EQUIPMENTS_DATA;
    } catch (error) {
      console.error("Error parsing equipments from localStorage:", error);
      return INITIAL_EQUIPMENTS_DATA;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);     // For Edit Modal
  const [viewingEquipment, setViewingEquipment] = useState(null);   // For Detail Modal (nếu bạn làm Detail dạng modal)

  useEffect(() => {
    try {
      localStorage.setItem('cinemaEquipmentsData', JSON.stringify(equipments));
    } catch (error) {
      console.error("Error stringifying equipments to localStorage:", error);
    }
  }, [equipments]);

  const handleAddEquipment = (newEquipmentData) => {
    const equipmentToAdd = {
      ...newEquipmentData,
      id: newEquipmentData.id || generateEquipmentId(newEquipmentData.type.substring(0,3).toUpperCase()), // Tạo ID dựa trên loại
      amount: Number(newEquipmentData.amount || 0) // Đảm bảo amount là số
    };
    setEquipments(prev => [equipmentToAdd, ...prev]);
    setShowAddModal(false);
  };

  const handleUpdateEquipment = (updatedEquipmentData) => {
    // Logic cho sửa (nếu có Edit Modal)
    setEquipments(prev => prev.map(eq => eq.id === updatedEquipmentData.id ? {...updatedEquipmentData, amount: Number(updatedEquipmentData.amount || 0)} : eq));
    setEditingEquipment(null);
  };

  const handleDeleteEquipment = (equipmentId) => {
    if (window.confirm(`Bạn có chắc muốn xóa thiết bị có ID: ${equipmentId}?`)) {
      setEquipments(prev => prev.filter(eq => eq.id !== equipmentId));
    }
  };
  
  const filteredEquipments = equipments.filter(eq => {
    const matchesSearchTerm = Object.values(eq).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesType = filterType === 'Tất cả' || eq.type === filterType;
    const matchesStatus = filterStatus === 'Tất cả' || eq.status === filterStatus;
    return matchesSearchTerm && matchesType && matchesStatus;
  });

  return (
    <div className="page-container equipments-page"> {/* Class riêng cho trang thiết bị */}
      <div className="content-card">
        <h1 className="page-title">Quản Lý Trang Thiết Bị</h1>
        
        <div className="page-controls equipments-controls"> {/* Class riêng cho controls */}
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
          <div className="table-responsive-wrapper"> {/* Wrapper cho table để cuộn ngang nếu cần */}
            <table className="data-table equipments-table"> {/* Class riêng cho bảng */}
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Thiết Bị</th>
                  <th>Loại</th>
                  <th>Vị Trí</th>
                  <th>Ngày Mua</th>
                  <th>Hết BH</th>
                  <th>Trạng Thái</th>
                  <th>Bảo trì cuối</th>
                  <th>Ghi Chú</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipments.map(eq => (
                  <tr key={eq.id}>
                    <td>{eq.id}</td>
                    <td title={eq.name} className="equipment-name-cell">{eq.name}</td>
                    <td>{eq.type}</td>
                    <td>{eq.location}</td>
                    <td>{formatDate(eq.purchaseDate)}</td>
                    <td>{formatDate(eq.warrantyEndDate)}</td>
                    <td>
                      <span className={`status-badge status-equipment-${eq.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {eq.status}
                      </span>
                    </td>
                    <td>{formatDate(eq.lastMaintenance)}</td>
                    <td title={eq.notes} className="notes-cell">{eq.notes}</td>
                    <td className="actions-cell">
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

      {/* Modals */}
      {showAddModal && (
        <AddEquipmentModal
          onClose={() => setShowAddModal(false)}
          onAddEquipment={handleAddEquipment}
          generateId={generateEquipmentId}
          equipmentTypes={EQUIPMENT_TYPES.filter(t => t !== 'Tất cả')} // Bỏ "Tất cả"
          equipmentStatuses={EQUIPMENT_STATUSES.filter(s => s !== 'Tất cả')} // Bỏ "Tất cả"
        />
      )}
      
      {/* {editingEquipment && (
        <EditEquipmentModal
          equipmentToEdit={editingEquipment}
          onUpdateEquipment={handleUpdateEquipment}
          onClose={() => setEditingEquipment(null)}
          equipmentTypes={EQUIPMENT_TYPES.filter(t => t !== 'Tất cả')}
          equipmentStatuses={EQUIPMENT_STATUSES.filter(s => s !== 'Tất cả')}
        />
      )} */}

      {/* {viewingEquipment && (
          <EquipmentDetailModal
            equipment={viewingEquipment}
            onClose={() => setViewingEquipment(null)}
            formatDate={formatDate}
          />
      )} */}
    </div>
  );
}

export default Equipments;