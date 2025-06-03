// src/pages/Admin/Equipments/Equipments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './Equipments.css';
import Button from '../../../components/common/Button.jsx';
import AddEquipmentModal from './AddEquipmentModal';
import EquipmentDetailModal from './EquipmentDetailModal';
import IncidentDetailModal from './IncidentDetailModal';
import RepairHistoryDetailModal from './RepairHistoryDetailModal';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal';

import { getAllEquipmentApi, createEquipmentApi } from '../../../services/equipmentApiService';
import { getAllFacilityIncidentsApi, getAllRepairHistoryApi } from '../../../services/facilityApiService';

// --- START: Configuration for Backend URL ---
// Define your backend base URL here.
// If your API returns full URLs already, this might not be strictly necessary,
// but it's good practice for constructing URLs if only paths are returned.
const BACKEND_BASE_URL = 'http://localhost:5000'; // Your backend server
// --- END: Configuration for Backend URL ---

// Helper function to construct full image URL
const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path; // Already an absolute URL or a blob URL
  }
  // Ensure there's a single slash between base URL and path
  return `${BACKEND_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};


// Helper functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return 'N/A';
  return Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch (e) { return 'N/A'; }
};

// Constants
const EQUIPMENT_TYPES_OPTIONS = ['Tất cả', 'Máy chiếu', 'Âm thanh', 'Thiết bị bán vé', 'Điều hòa', 'Ghế ngồi', 'Khác'];
const EQUIPMENT_STATUS_OPTIONS = ['Tất cả', 'Đang hoạt động', 'Cần bảo trì', 'Đang sửa chữa', 'Hỏng hóc', 'Không sử dụng'];
const INCIDENT_STATUS_OPTIONS = ['Tất cả', 'Mới báo cáo', 'Đã tiếp nhận', 'Đang xử lý', 'Chờ sửa chữa', 'Đang sửa chữa', 'Đã giải quyết', 'Không thể sửa', 'Đã hủy'];

// Map functions
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
  // Assuming equipment images are not handled here, but if they were:
  // HINHANH_THIETBI: getFullImageUrl(apiEquipment.HINHANH_THIETBI),
});

const mapIncidentApiToClient = (apiIncident) => ({
  MASUCO: apiIncident.MASUCO,
  MATHIETBI: apiIncident.MATHIETBI,
  TENTHIETBI: apiIncident.THIETBI_INFO?.TENTHIETBI || apiIncident.TENTHIETBI || 'N/A',
  LOAITHIETBI: apiIncident.THIETBI_INFO?.LOAITHIETBI || apiIncident.LOAITHIETBI || 'N/A',
  VITRITHIETBI: apiIncident.THIETBI_INFO?.VITRITHIETBI || apiIncident.VITRITHIETBI || 'N/A',
  MANV_BAOCAO: apiIncident.MANV,
  TEN_NV_BAOCAO: apiIncident.NHANVIEN_INFO?.TEN_NV || apiIncident.TEN_NV_BAOCAO || 'N/A',
  NGAY_BAOCAO: apiIncident.NGAY_BAOCAO,
  MOTA: apiIncident.MOTA,
  MUCDO_UUTIEN: apiIncident.MUCDO_UUTIEN,
  TRANGTHAI_SUCO: apiIncident.TRANGTHAI_SUCO,
  HINHANH_SUCO: getFullImageUrl(apiIncident.HINHANH_SUCO), // MODIFIED
});

const mapRepairHistoryApiToClient = (apiRepairItem) => ({
  ID_SUACHUA: apiRepairItem.MASUACHUA,
  MATHIETBI: apiRepairItem.MATHIETBI,
  TENTHIETBI: /* apiRepairItem.THIETBI_INFO?.TENTHIETBI || */ apiRepairItem.TENTHIETBI || 'N/A',
  MASUCO: apiRepairItem.MASUCO,
  NGAY_BAOCAO_SUCO: apiRepairItem.NGAY_BAOCAO_SUCO,
  NGAYSUACHUA: apiRepairItem.NGAYSUACHUA,
  MOTA_SUCO: apiRepairItem.MOTA_SUCO,
  MOTA_SUACHUA: apiRepairItem.MOTA,
  CHIPHI: apiRepairItem.CHIPHI,
  TEN_NV_SUA: apiRepairItem.NHANVIEN_SUA_INFO?.TENNV || apiRepairItem.TEN_NV_SUA || apiRepairItem.MANV_SUA,
  TINHTRANG_SAU_SC: apiRepairItem.TINHTRANG_SAU_SC,
  HINHANH_SUACHUA: getFullImageUrl(apiRepairItem.HINHANH_SUACHUA), // MODIFIED
});

function Equipments() {
  // STATE CHO TAB THIẾT BỊ (all)
  const [equipments, setEquipments] = useState([]);
  const [searchTermEquipment, setSearchTermEquipment] = useState('');
  const [filterTypeEquipment, setFilterTypeEquipment] = useState('Tất cả');
  const [filterStatusEquipment, setFilterStatusEquipment] = useState('Tất cả');
  const [loadingEquipments, setLoadingEquipments] = useState(false);

  // STATE CHO TAB SỰ CỐ (issues)
  const [facilityIncidents, setFacilityIncidents] = useState([]);
  const [searchTermIncident, setSearchTermIncident] = useState('');
  const [filterStatusIncident, setFilterStatusIncident] = useState('Tất cả');
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  // STATE CHO TAB LỊCH SỬ SỬA CHỮA (repair-history)
  const [repairHistory, setRepairHistory] = useState([]);
  const [searchTermRepair, setSearchTermRepair] = useState('');
  const [loadingRepairHistory, setLoadingRepairHistory] = useState(false);

  // STATE CHUNG
  const [activeTab, setActiveTab] = useState('all');
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showEquipmentDetailModal, setShowEquipmentDetailModal] = useState(false);
  const [equipmentToView, setEquipmentToView] = useState(null);

  const [showIncidentDetailModal, setShowIncidentDetailModal] = useState(false);
  const [incidentToView, setIncidentToView] = useState(null);
  const [showRepairHistoryDetailModal, setShowRepairHistoryDetailModal] = useState(false);
  const [repairItemToView, setRepairItemToView] = useState(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // FETCH FUNCTIONS
  const fetchEquipmentsFromApi = useCallback(async () => {
    setLoadingEquipments(true);
    setErrorMessage('');
    try {
      const apiEquipments = await getAllEquipmentApi();
      setEquipments(apiEquipments.map(mapEquipmentApiToClient));
    } catch (error) {
      console.error("Equipments: Error fetching equipments", error);
      setErrorMessage("Lỗi khi tải danh sách thiết bị. " + (error.message || ''));
    } finally {
      setLoadingEquipments(false);
    }
  }, []);

  const fetchAllFacilityIncidents = useCallback(async () => {
    setLoadingIncidents(true);
    setErrorMessage('');
    try {
      const apiIncidents = await getAllFacilityIncidentsApi();
      setFacilityIncidents(Array.isArray(apiIncidents) ? apiIncidents.map(mapIncidentApiToClient) : []);
    } catch (error) {
      console.error("Equipments: Error fetching facility incidents", error);
      setErrorMessage(error.message || "Lỗi khi tải danh sách sự cố.");
      setFacilityIncidents([]);
    } finally {
      setLoadingIncidents(false);
    }
  }, []);

  const fetchRepairHistoryFromApi = useCallback(async () => {
    setLoadingRepairHistory(true);
    setErrorMessage('');
    try {
      const apiRepairHistory = await getAllRepairHistoryApi();
      setRepairHistory(Array.isArray(apiRepairHistory) ? apiRepairHistory.map(mapRepairHistoryApiToClient) : []);
    } catch (error) {
      console.error("Equipments: Error fetching repair history", error);
      setErrorMessage(error.message || "Lỗi khi tải lịch sử sửa chữa.");
      setRepairHistory([]);
    } finally {
      setLoadingRepairHistory(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchEquipmentsFromApi();
    } else if (activeTab === 'issues') {
      fetchAllFacilityIncidents();
    } else if (activeTab === 'repair-history') {
      fetchRepairHistoryFromApi();
    }
  }, [activeTab, fetchEquipmentsFromApi, fetchAllFacilityIncidents, fetchRepairHistoryFromApi]);

  // HANDLER FUNCTIONS
  const handleAddEquipment = useCallback(async (equipmentData) => {
    setSuccessMessage('');
    setErrorMessage('');
    try {
      // If equipmentData contains an image file, it should be handled by createEquipmentApi
      // For now, assuming equipmentData is ready for the API
      const newEquipment = await createEquipmentApi(equipmentData);
      setSuccessMessage(`Thiết bị "${newEquipment.TENTHIETBI || 'mới'}" đã được thêm thành công!`);
      setShowAddEquipmentModal(false);
      if (activeTab === 'all') {
        fetchEquipmentsFromApi();
      }
    } catch (error) {
      console.error("Equipments: Error adding equipment", error);
      let apiErrorMessage = "Lỗi khi thêm thiết bị mới.";
      if (error.response?.data?.message) apiErrorMessage = error.response.data.message;
      else if (error.message) apiErrorMessage = error.message;
      setErrorMessage(apiErrorMessage);
    }
  }, [activeTab, fetchEquipmentsFromApi]);

  const openDetailModalForEquipment = (equipment) => {
    setEquipmentToView(equipment);
    setShowEquipmentDetailModal(true);
  };

  const openDetailModalForIncident = (incident) => {
    setIncidentToView(incident);
    setShowIncidentDetailModal(true);
  };

  const openDetailModalForRepairHistory = (repairItem) => {
    setRepairItemToView(repairItem);
    setShowRepairHistoryDetailModal(true);
  };


  // Lọc dữ liệu (Client-side filtering)
  const filteredEquipments = equipments.filter(eq => {
    if (searchTermEquipment && !Object.values(eq).some(value => String(value).toLowerCase().includes(searchTermEquipment.toLowerCase()))) return false;
    if (filterTypeEquipment !== 'Tất cả' && eq.LOAITHIETBI !== filterTypeEquipment) return false;
    if (filterStatusEquipment !== 'Tất cả' && eq.TRANGTHAI !== filterStatusEquipment) return false;
    return true;
  });

  const filteredIncidents = facilityIncidents.filter(inc => {
    if (searchTermIncident) {
      const term = searchTermIncident.toLowerCase();
      const match =
        String(inc.MASUCO).toLowerCase().includes(term) ||
        String(inc.MATHIETBI).toLowerCase().includes(term) ||
        String(inc.TENTHIETBI).toLowerCase().includes(term) ||
        String(inc.MOTA).toLowerCase().includes(term);
      if (!match) return false;
    }
    if (filterStatusIncident !== 'Tất cả' && inc.TRANGTHAI_SUCO !== filterStatusIncident) {
      return false;
    }
    return true;
  });

  const filteredRepairHistory = repairHistory.filter(item => {
    if (searchTermRepair &&
      !Object.values(item).some(value => String(value).toLowerCase().includes(searchTermRepair.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const getPageTitle = () => {
    if (activeTab === 'all') return 'Danh sách thiết bị';
    if (activeTab === 'issues') return 'Danh sách thiết bị gặp sự cố';
    if (activeTab === 'repair-history') return 'Lịch sử sửa chữa thiết bị';
    return 'Quản lý Thiết bị & CSVC';
  };

  return (
    <div className="page-container equipments-page">
      <div className="content-card">
        <div className="page-header-custom">
          <h1 className="main-page-title">{getPageTitle()}</h1>
          <div className="view-tabs">
            <button
              className={`view-tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Thiết Bị
            </button>
            <button
              className={`view-tab-button ${activeTab === 'issues' ? 'active' : ''}`}
              onClick={() => setActiveTab('issues')}
            >
              Sự Cố
            </button>
            <button
              className={`view-tab-button ${activeTab === 'repair-history' ? 'active' : ''}`}
              onClick={() => setActiveTab('repair-history')}
            >
              Lịch Sử Sửa Chữa
            </button>
          </div>
        </div>

        <div className="tab-content-area">
          {/* TAB: DANH SÁCH THIẾT BỊ */}
          {activeTab === 'all' && (
            <div className="equipment-list-tab-content">
              <div className="page-controls equipments-controls">
                <input
                  type="text"
                  placeholder="Tìm kiếm thiết bị (ID, tên, loại, vị trí...)"
                  className="search-input"
                  value={searchTermEquipment}
                  onChange={(e) => setSearchTermEquipment(e.target.value)}
                />
                <div className="filter-group">
                  <select value={filterTypeEquipment} onChange={(e) => setFilterTypeEquipment(e.target.value)} className="filter-select">
                    {EQUIPMENT_TYPES_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <select value={filterStatusEquipment} onChange={(e) => setFilterStatusEquipment(e.target.value)} className="filter-select">
                    {EQUIPMENT_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
                <Button onClick={() => setShowAddEquipmentModal(true)} className="btn-add-new">
                  + Thêm Thiết Bị Mới
                </Button>
              </div>

              {loadingEquipments && <p className="loading-message">Đang tải danh sách thiết bị...</p>}
              {!loadingEquipments && filteredEquipments.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="data-table equipments-table">
                    <thead><tr><th>Mã TB</th><th>Tên Thiết Bị</th><th>Loại</th><th>Vị Trí</th><th>Ngày Mua</th><th>Trạng Thái TB</th><th>Giá</th><th>Hành động</th></tr></thead>
                    <tbody>
                      {filteredEquipments.map(eq => (
                        <tr key={eq.MATHIETBI}>
                          <td>{eq.MATHIETBI}</td>
                          <td title={eq.TENTHIETBI} className="equipment-name-cell">{eq.TENTHIETBI}</td>
                          <td>{eq.LOAITHIETBI}</td>
                          <td>{eq.VITRITHIETBI}</td>
                          <td>{formatDate(eq.NGAYMUA)}</td>
                          <td><span className={`status-badge status-equipment-${eq.TRANGTHAI ? String(eq.TRANGTHAI).toLowerCase().replace(/\s+/g, '-') : 'unknown'}`}>{eq.TRANGTHAI || 'Không rõ'}</span></td>
                          <td className="currency-cell">{formatCurrency(eq.GIA)}</td>
                          <td className="actions-cell"><Button onClick={() => openDetailModalForEquipment(eq)} className="btn-action btn-view">Xem</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!loadingEquipments && <p className="no-data-message">{searchTermEquipment || filterTypeEquipment !== 'Tất cả' || filterStatusEquipment !== 'Tất cả' ? "Không tìm thấy thiết bị phù hợp." : "Chưa có thiết bị nào."}</p>)}
            </div>
          )}

          {/* TAB: DANH SÁCH SỰ CỐ */}
          {activeTab === 'issues' && (
            <div className="facility-incidents-tab-content">
              <div className="page-controls incidents-controls equipments-controls">
                <input
                  type="text"
                  placeholder="Tìm kiếm sự cố (Mã SC, Tên TB, Mô tả...)"
                  className="search-input"
                  value={searchTermIncident}
                  onChange={(e) => setSearchTermIncident(e.target.value)}
                />
                <div className="filter-group">
                  <select value={filterStatusIncident} onChange={(e) => setFilterStatusIncident(e.target.value)} className="filter-select">
                    {INCIDENT_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>

              {loadingIncidents && <p className="loading-message">Đang tải danh sách sự cố...</p>}
              {!loadingIncidents && filteredIncidents.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="data-table incidents-table equipments-table">
                    <thead><tr>
                      <th>Mã Sự Cố</th>
                      <th>Tên Thiết Bị</th>
                      <th>Ngày Báo Cáo</th>
                      <th>Mô Tả Sự Cố</th>
                      <th>Ưu Tiên</th>
                      {/* <th>Trạng Thái Sự Cố</th> */}
                      <th>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                      {filteredIncidents.map(inc => (
                        <tr key={inc.MASUCO}>
                          <td>{inc.MASUCO}</td>
                          <td title={inc.TENTHIETBI} className="equipment-name-cell">{inc.TENTHIETBI}</td>
                          <td>{formatDate(inc.NGAY_BAOCAO)}</td>
                          <td title={inc.MOTA} className="notes-cell">{inc.MOTA}</td>
                          <td>
                            <span className={`priority-badge priority-${String(inc.MUCDO_UUTIEN || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                              {inc.MUCDO_UUTIEN || 'Không rõ'}
                            </span>
                          </td>
                          {/* <td><span className={`status-badge status-incident-${String(inc.TRANGTHAI_SUCO || '').toLowerCase().replace(/\s+/g, '-')}`}>{inc.TRANGTHAI_SUCO || 'Không rõ'}</span></td> */}
                          <td className="actions-cell">
                            <Button onClick={() => openDetailModalForIncident(inc)} className="btn-action btn-view">Xem chi tiết</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!loadingIncidents && <p className="no-data-message">{searchTermIncident || filterStatusIncident !== 'Tất cả' ? "Không tìm thấy sự cố phù hợp." : "Không có sự cố nào."}</p>)}
            </div>
          )}

          {/* TAB: LỊCH SỬ SỬA CHỮA */}
          {activeTab === 'repair-history' && (
            <div className="facility-repair-history-tab-content">
              <div className="page-controls repair-history-controls equipments-controls">
                <input
                  type="text"
                  placeholder="Tìm kiếm lịch sử (Mã SC, Mã TB, Mô tả...)"
                  className="search-input"
                  value={searchTermRepair}
                  onChange={(e) => setSearchTermRepair(e.target.value)}
                />
              </div>
              {loadingRepairHistory && <p className="loading-message">Đang tải lịch sử sửa chữa...</p>}
              {!loadingRepairHistory && filteredRepairHistory.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="data-table repair-history-table equipments-table">
                    <thead><tr>
                      <th>Mã Sửa Chữa</th>
                      <th>Tên Thiết Bị</th>
                      <th>Ngày Báo Sự Cố</th>
                      <th>Ngày Sửa Xong</th>
                      <th>Chi Phí</th>
                      <th>Người Sửa</th>
                      <th>Trạng Thái Sau SC</th>
                      <th>Xem chi tiết</th>
                    </tr>
                    </thead>
                    <tbody>
                      {filteredRepairHistory.map(item => (
                        <tr key={item.ID_SUACHUA}>
                          <td>{item.ID_SUACHUA}</td>
                          <td title={item.TENTHIETBI} className="equipment-name-cell">{item.TENTHIETBI}</td>
                          <td>{formatDate(item.NGAY_BAOCAO_SUCO)}</td>
                          <td>{formatDate(item.NGAYSUACHUA)}</td>
                          <td className="currency-cell">{formatCurrency(item.CHIPHI)}</td>
                          <td>{item.TEN_NV_SUA}</td>
                          <td><span className={`status-badge status-repair-${String(item.TINHTRANG_SAU_SC || '').toLowerCase().replace(/\s+/g, '-')}`}>{item.TINHTRANG_SAU_SC || 'Không rõ'}</span></td>
                          <td className="actions-cell">
                            <Button onClick={() => openDetailModalForRepairHistory(item)} className="btn-action btn-view">Xem chi tiết</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!loadingRepairHistory && <p className="no-data-message">{searchTermRepair ? "Không tìm thấy lịch sử phù hợp." : "Chưa có lịch sử sửa chữa."}</p>)}
            </div>
          )}
        </div>
      </div>

      {showAddEquipmentModal && (
        <AddEquipmentModal
          onClose={() => setShowAddEquipmentModal(false)}
          onAddEquipment={handleAddEquipment}
          equipmentTypes={EQUIPMENT_TYPES_OPTIONS.filter(t => t !== 'Tất cả')}
          equipmentStatuses={EQUIPMENT_STATUS_OPTIONS.filter(s => s !== 'Tất cả')}
        />
      )}
      {showEquipmentDetailModal && equipmentToView && (
        <EquipmentDetailModal
          equipment={equipmentToView}
          onClose={() => { setShowEquipmentDetailModal(false); setEquipmentToView(null); }}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        // If EquipmentDetailModal also shows images, ensure its image path is also processed
        // or pass getFullImageUrl to it.
        />
      )}
      {showIncidentDetailModal && incidentToView && (
        <IncidentDetailModal
          incident={incidentToView}
          onClose={() => { setShowIncidentDetailModal(false); setIncidentToView(null); }}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}
      {showRepairHistoryDetailModal && repairItemToView && (
        <RepairHistoryDetailModal
          repairItem={repairItemToView}
          onClose={() => { setShowRepairHistoryDetailModal(false); setRepairItemToView(null); }}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}

      <SuccessMessageModal isOpen={!!successMessage} onClose={() => setSuccessMessage('')} successMessage={successMessage} />
      <ErrorMessageModal isOpen={!!errorMessage} onClose={() => setErrorMessage('')} errorMessage={errorMessage} />
    </div>
  );
}

export default Equipments;