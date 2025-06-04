// src/pages/Admin/Equipments/Equipments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './Equipments.css';
import Button from '../../../components/common/Button.jsx';
import AddEquipmentModal from './AddEquipmentModal';
import EquipmentDetailModal from './EquipmentDetailModal';
import IncidentDetailModal from './IncidentDetailModal';
import RepairHistoryDetailModal from './RepairHistoryDetailModal'; // Quan trọng: Component này cần xử lý save và callback
import SuccessMessageModal from '../../../components/common/SuccessMessageModal';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal';

import { getAllEquipmentApi, createEquipmentApi } from '../../../services/equipmentApiService';
// recordFacilityRepairApi được dùng bởi RepairHistoryDetailModal, nhưng callback sẽ kích hoạt refresh ở đây
import { 
    getAllFacilityIncidentsApi, 
    getAllRepairHistoryApi, 
    resolveIncidentApi // Có thể dùng cho nút "Giải quyết nhanh"
} from '../../../services/facilityApiService';

const BACKEND_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  return `${BACKEND_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

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

// Tùy chọn bộ lọc trạng thái sự cố cho Admin
const INCIDENT_STATUS_FILTER_OPTIONS_ADMIN = [
  { value: 'chưa giải quyết', label: 'Chưa giải quyết' },
  { value: 'đã giải quyết', label: 'Đã giải quyết' },
  { value: 'tất cả', label: 'Tất cả (bao gồm đã và chưa giải quyết)' }
];

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
});

const mapIncidentApiToClient = (apiIncident) => ({
  MASUCO: apiIncident.MASUCO,
  MATHIETBI: apiIncident.MATHIETBI,
  TENTHIETBI: apiIncident.TENTHIETBI || 'N/A', // Giả sử API trả về TENTHIETBI đã join
  LOAITHIETBI: apiIncident.LOAITHIETBI || 'N/A', // Giả sử API trả về LOAITHIETBI đã join
  VITRITHIETBI: apiIncident.VITRITHIETBI || 'N/A', // Giả sử API trả về VITRITHIETBI đã join
  MANV_BAOCAO: apiIncident.MANV,
  TEN_NV_BAOCAO: apiIncident.TEN_NV_BAOCAO || apiIncident.MANV || 'N/A', // Giả sử API trả về TEN_NV_BAOCAO đã join
  NGAY_BAOCAO: apiIncident.NGAY_BAOCAO,
  MOTA: apiIncident.MOTA,
  MUCDO_UUTIEN: apiIncident.MUCDO_UUTIEN,
  TRANGTHAI_SUCO: apiIncident.TRANGTHAI_SUCO, // "Chưa giải quyết" hoặc "Đã giải quyết"
  HINHANH_SUCO: getFullImageUrl(apiIncident.HINHANH_SUCO),
});

const mapRepairHistoryApiToClient = (apiRepairItem) => ({
  ID_SUACHUA: apiRepairItem.MASUACHUA,
  MATHIETBI: apiRepairItem.MATHIETBI,
  TENTHIETBI: apiRepairItem.TENTHIETBI || 'N/A', // Giả sử API trả về TENTHIETBI đã join
  MASUCO: apiRepairItem.MASUCO,
  NGAY_BAOCAO_SUCO: apiRepairItem.NGAY_BAOCAO_SUCO, // API nên trả về ngày này
  NGAYSUACHUA: apiRepairItem.NGAYSUACHUA,
  MOTA_SUCO: apiRepairItem.MOTA_SUCO, // API nên trả về mô tả sự cố gốc
  MOTA_SUACHUA: apiRepairItem.MOTA_SUACHUA || apiRepairItem.MOTA, // MOTA_SUACHUA là tên đúng hơn
  CHIPHI: apiRepairItem.CHIPHI,
  TEN_NV_SUA: apiRepairItem.TEN_NV_SUA || apiRepairItem.MANV_SUA || 'N/A', // Giả sử API trả về TEN_NV_SUA đã join
  TINHTRANG_SAU_SC: apiRepairItem.TINHTRANG_SAU_SC,
  HINHANH_SUACHUA: getFullImageUrl(apiRepairItem.HINHANH_SUACHUA),
});

function Equipments() {
  // STATE THIẾT BỊ
  const [equipments, setEquipments] = useState([]);
  const [searchTermEquipment, setSearchTermEquipment] = useState('');
  const [filterTypeEquipment, setFilterTypeEquipment] = useState('Tất cả');
  const [filterStatusEquipment, setFilterStatusEquipment] = useState('Tất cả');
  const [loadingEquipments, setLoadingEquipments] = useState(false);

  // STATE SỰ CỐ
  const [facilityIncidents, setFacilityIncidents] = useState([]);
  const [searchTermIncident, setSearchTermIncident] = useState('');
  const [filterStatusIncident, setFilterStatusIncident] = useState('tất cả'); // Mặc định cho Admin
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  // STATE LỊCH SỬ SỬA CHỮA
  const [repairHistory, setRepairHistory] = useState([]);
  const [searchTermRepair, setSearchTermRepair] = useState('');
  const [loadingRepairHistory, setLoadingRepairHistory] = useState(false);

  // STATE CHUNG (MODALS, MESSAGES)
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'issues', 'repair-history'
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showEquipmentDetailModal, setShowEquipmentDetailModal] = useState(false);
  const [equipmentToView, setEquipmentToView] = useState(null);
  const [showIncidentDetailModal, setShowIncidentDetailModal] = useState(false);
  const [incidentToView, setIncidentToView] = useState(null);
  const [showRepairHistoryDetailModal, setShowRepairHistoryDetailModal] = useState(false);
  const [repairItemToView, setRepairItemToView] = useState(null); // Dùng để XEM/SỬA lịch sử sửa chữa
  const [incidentForRepairModal, setIncidentForRepairModal] = useState(null); // Dùng để THÊM lịch sử sửa chữa cho sự cố

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

  const fetchAllFacilityIncidents = useCallback(async (currentSearchTerm, currentFilterStatus) => {
    setLoadingIncidents(true);
    setErrorMessage('');
    try {
      const queryParams = {
        status: currentFilterStatus, // Sẽ là 'chưa giải quyết', 'đã giải quyết', hoặc 'tất cả'
      };
      if (currentSearchTerm) {
        queryParams.searchTerm = currentSearchTerm;
      }
      
      console.log("[Admin Equipments-fetchAllFacilityIncidents] Fetching with params:", queryParams);
      const apiIncidentsData = await getAllFacilityIncidentsApi(queryParams);
      setFacilityIncidents(Array.isArray(apiIncidentsData) ? apiIncidentsData.map(mapIncidentApiToClient) : []);
    } catch (error) {
      console.error("Admin Equipments: Error fetching facility incidents", error);
      setErrorMessage(error.message || "Lỗi khi tải danh sách sự cố.");
      setFacilityIncidents([]);
    } finally {
      setLoadingIncidents(false);
    }
  }, []); // Thêm mapIncidentApiToClient nếu nó phụ thuộc vào state/prop từ Equipments

  const fetchRepairHistoryFromApi = useCallback(async () => {
    setLoadingRepairHistory(true);
    setErrorMessage('');
    try {
      const apiRepairHistory = await getAllRepairHistoryApi(); // API này cần JOIN để có TENTHIETBI, TEN_NV_SUA...
      setRepairHistory(Array.isArray(apiRepairHistory) ? apiRepairHistory.map(mapRepairHistoryApiToClient) : []);
    } catch (error) {
      console.error("Equipments: Error fetching repair history", error);
      setErrorMessage(error.message || "Lỗi khi tải lịch sử sửa chữa.");
      setRepairHistory([]);
    } finally {
      setLoadingRepairHistory(false);
    }
  }, []); // Thêm mapRepairHistoryApiToClient nếu nó phụ thuộc vào state/prop từ Equipments

  useEffect(() => {
    if (activeTab === 'all') {
      fetchEquipmentsFromApi();
    } else if (activeTab === 'issues') {
      fetchAllFacilityIncidents(searchTermIncident, filterStatusIncident);
    } else if (activeTab === 'repair-history') {
      fetchRepairHistoryFromApi();
    }
  }, [activeTab, fetchEquipmentsFromApi, fetchAllFacilityIncidents, fetchRepairHistoryFromApi, searchTermIncident, filterStatusIncident]);

  // HANDLER FUNCTIONS
  const handleAddEquipment = useCallback(async (equipmentData) => {
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const newEquipment = await createEquipmentApi(equipmentData);
      setSuccessMessage(`Thiết bị "${newEquipment.TENTHIETBI || 'mới'}" đã được thêm thành công!`);
      setShowAddEquipmentModal(false);
      fetchEquipmentsFromApi(); // Tải lại danh sách thiết bị
    } catch (error) {
      console.error("Equipments: Error adding equipment", error);
      setErrorMessage((error.response?.data?.message || error.message) || "Lỗi khi thêm thiết bị mới.");
    }
  }, [fetchEquipmentsFromApi]);

  const openDetailModalForEquipment = (equipment) => {
    setEquipmentToView(equipment);
    setShowEquipmentDetailModal(true);
  };
  
  const openDetailModalForIncident = (incident) => {
    setIncidentToView(incident);
    setShowIncidentDetailModal(true);
  };

  // Dùng để XEM chi tiết một bản ghi lịch sử sửa chữa
  const openDetailModalForRepairHistory = (repairItem) => {
    setRepairItemToView(repairItem);
    setIncidentForRepairModal(null); // Không phải là thêm mới từ sự cố
    setShowRepairHistoryDetailModal(true);
  };

  // Dùng để MỞ FORM THÊM một bản ghi sửa chữa cho sự cố cụ thể
  const openAddRepairModalForIncident = (incident) => {
    setIncidentForRepairModal(incident); // Cung cấp context của sự cố
    setRepairItemToView(null);           // Đảm bảo là form thêm mới
    setShowRepairHistoryDetailModal(true);
  };

  // Callback khi một bản ghi sửa chữa được lưu thành công từ RepairHistoryDetailModal
  // Backend đã tự động cập nhật TRANGTHAI_SUCO của sự cố liên quan
  const handleRepairRecorded = useCallback(async (savedRepairData, relatedMasuco) => {
    setSuccessMessage(`Sửa chữa cho sự cố ${relatedMasuco} đã được ghi nhận.`);
    setShowRepairHistoryDetailModal(false);
    setIncidentForRepairModal(null);
    setRepairItemToView(null);

    // Tải lại danh sách sự cố và lịch sử sửa chữa
    if (activeTab === 'issues') {
      fetchAllFacilityIncidents(searchTermIncident, filterStatusIncident);
    }
    if (activeTab === 'repair-history') {
      fetchRepairHistoryFromApi(); // Để cập nhật danh sách lịch sử
    }
  }, [activeTab, fetchAllFacilityIncidents, fetchRepairHistoryFromApi, searchTermIncident, filterStatusIncident,fetchEquipmentsFromApi]);
  
  // Lọc client-side: Chủ yếu cho searchTerm nếu backend không lọc, status đã được backend xử lý
  const filteredEquipments = equipments.filter(eq => {
    if (searchTermEquipment && !Object.values(eq).some(value => String(value).toLowerCase().includes(searchTermEquipment.toLowerCase()))) return false;
    if (filterTypeEquipment !== 'Tất cả' && eq.LOAITHIETBI !== filterTypeEquipment) return false;
    if (filterStatusEquipment !== 'Tất cả' && eq.TRANGTHAI !== filterStatusEquipment) return false;
    return true;
  });
  
  const filteredIncidents = facilityIncidents.filter(inc => {
    // Backend đã lọc theo filterStatusIncident.
    // Client chỉ cần lọc theo searchTermIncident nếu backend chưa làm.
    // Giả sử backend CHƯA lọc theo searchTermIncident:
    if (searchTermIncident) {
      const term = searchTermIncident.toLowerCase();
      const match =
        String(inc.MASUCO).toLowerCase().includes(term) ||
        (inc.TENTHIETBI && String(inc.TENTHIETBI).toLowerCase().includes(term)) ||
        (inc.MOTA && String(inc.MOTA).toLowerCase().includes(term)) ||
        (inc.TEN_NV_BAOCAO && String(inc.TEN_NV_BAOCAO).toLowerCase().includes(term));
      if (!match) return false;
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
    if (activeTab === 'issues') return 'Quản lý Sự Cố Thiết Bị';
    if (activeTab === 'repair-history') return 'Lịch sử sửa chữa thiết bị';
    return 'Quản lý Thiết bị & CSVC';
  };

  return (
    <div className="page-container equipments-page">
      <div className="content-card">
        <div className="page-header-custom">
          <h1 className="main-page-title">{getPageTitle()}</h1>
          <div className="view-tabs">
            <button className={`view-tab-button ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Thiết Bị</button>
            <button className={`view-tab-button ${activeTab === 'issues' ? 'active' : ''}`} onClick={() => setActiveTab('issues')}>Sự Cố</button>
            <button className={`view-tab-button ${activeTab === 'repair-history' ? 'active' : ''}`} onClick={() => setActiveTab('repair-history')}>Lịch Sử Sửa Chữa</button>
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
                          <td className="actions-cell"><Button onClick={() => openDetailModalForEquipment(eq)} className="btn-action btn-view btn-sm">Xem</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!loadingEquipments && <p className="no-data-message">{searchTermEquipment || filterTypeEquipment !== 'Tất cả' || filterStatusEquipment !== 'Tất cả' ? "Không tìm thấy thiết bị phù hợp." : "Chưa có thiết bị nào."}</p>)}
            </div>
          )}

          {/* TAB: QUẢN LÝ SỰ CỐ */}
          {activeTab === 'issues' && (
            <div className="facility-incidents-tab-content">
              <div className="page-controls incidents-controls equipments-controls">
                <input
                  type="text"
                  placeholder="Tìm kiếm sự cố (Mã SC, Tên TB, Mô tả...)"
                  className="search-input"
                  value={searchTermIncident}
                  onChange={(e) => setSearchTermIncident(e.target.value)} // useEffect sẽ trigger fetch
                />
                <div className="filter-group">
                  <select 
                    value={filterStatusIncident} 
                    onChange={(e) => setFilterStatusIncident(e.target.value)} // useEffect sẽ trigger fetch
                    className="filter-select"
                  >
                    {INCIDENT_STATUS_FILTER_OPTIONS_ADMIN.map(option => 
                      <option key={option.value} value={option.value}>{option.label}</option>
                    )}
                  </select>
                </div>
                {/* Admin có thể có nút báo cáo sự cố riêng nếu cần, nhưng thường là nhân viên báo cáo */}
              </div>

              {loadingIncidents && <p className="loading-message">Đang tải danh sách sự cố...</p>}
              {!loadingIncidents && filteredIncidents.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="data-table incidents-table equipments-table">
                    <thead><tr>
                      {/* <th>Mã Sự Cố</th> */}
                      <th>Mã thiết bị</th>
                      <th>Tên Thiết Bị</th> 
                      <th>Người Báo Cáo</th>
                      <th>Ngày Báo Cáo</th>
                      <th>Mô Tả</th>
                      <th>Ưu Tiên</th>
                      <th>Trạng Thái SC</th>
                      <th>Hành động</th>
                    </tr></thead>
                    <tbody>
                      {filteredIncidents.map(inc => (
                        <tr key={inc.MASUCO}>
                          {/* <td>{inc.MASUCO}</td> */}
                          <td>{inc.MATHIETBI}</td>
                          <td title={inc.TENTHIETBI} className="equipment-name-cell">{inc.TENTHIETBI}</td>
                          <td>{inc.TEN_NV_BAOCAO}</td>
                          <td>{formatDate(inc.NGAY_BAOCAO)}</td>
                          <td title={inc.MOTA} className="notes-cell">{inc.MOTA}</td>
                          <td>
                            <span className={`priority-badge priority-${String(inc.MUCDO_UUTIEN || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                              {inc.MUCDO_UUTIEN || 'Không rõ'}
                            </span>
                          </td>
                          <td>
                            <span 
                              className={`status-badge status-incident-${String(inc.TRANGTHAI_SUCO || 'abc')
                                .toLowerCase()
                                .replace(/\s+/g, '-') // "Chưa giải quyết" -> "chua-giai-quyet"
                              }`}
                            >
                                {inc.TRANGTHAI_SUCO || 'Không rõ'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <Button onClick={() => openDetailModalForIncident(inc)} className="btn-action btn-view btn-sm">Xem</Button>
                            {/* {inc.TRANGTHAI_SUCO === 'Chưa giải quyết' && (
                                <Button 
                                    onClick={() => openAddRepairModalForIncident(inc)} 
                                    className="btn-action btn-repair btn-sm"
                                    style={{marginLeft: '5px'}}
                                >
                                    Sửa chữa
                                </Button>
                            )} */}
                             {/* Tùy chọn: Nút giải quyết nhanh cho Admin */}
                            {/* {inc.TRANGTHAI_SUCO === 'Chưa giải quyết' && (
                                <Button 
                                    onClick={async () => {
                                        if(window.confirm(`Bạn có chắc muốn đánh dấu sự cố ${inc.MASUCO} là "Đã giải quyết" mà không cần ghi nhận sửa chữa chi tiết?`)){
                                            try {
                                                //setIsLoading(true); // Nên có state isLoading chung cho các action
                                                await resolveIncidentApi(inc.MASUCO);
                                                setSuccessMessage(`Sự cố ${inc.MASUCO} đã được đánh dấu là "Đã giải quyết".`);
                                                fetchAllFacilityIncidents(searchTermIncident, filterStatusIncident); // Tải lại
                                            } catch (err) {
                                                setErrorMessage(err.message || `Lỗi khi giải quyết sự cố ${inc.MASUCO}.`);
                                            } finally {
                                                // setIsLoading(false);
                                            }
                                        }
                                    }} 
                                    className="btn-action btn-sm" // Có thể tạo class btn-resolve
                                    style={{marginLeft: '5px', backgroundColor: '#17a2b8', borderColor: '#17a2b8', color: 'white'}}
                                >
                                    Đã Xong
                                </Button>
                            )} */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!loadingIncidents && 
                    <p className="no-data-message">
                        { (searchTermIncident || (filterStatusIncident !== 'chưa giải quyết' && filterStatusIncident !== 'tất cả')) ? 
                            "Không tìm thấy sự cố phù hợp với bộ lọc." : 
                            (filterStatusIncident === 'chưa giải quyết' ? "Hiện không có sự cố nào chưa được giải quyết." : "Không có sự cố nào để hiển thị.")
                        }
                    </p>
                )}
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
                {/* Có thể thêm bộ lọc cho lịch sử sửa chữa nếu cần */}
              </div>
              {loadingRepairHistory && <p className="loading-message">Đang tải lịch sử sửa chữa...</p>}
              {!loadingRepairHistory && filteredRepairHistory.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="data-table repair-history-table equipments-table">
                    <thead><tr>
                      {/* <th>Mã Sửa Chữa</th>
                      <th>Mã Sự Cố</th> */}
                      <th>Mã thiết bị</th>
                      <th>Tên Thiết Bị</th>
                      <th>Ngày Sửa Xong</th>
                      <th>Người Sửa</th>
                      <th>Tình Trạng Sau SC</th>
                      <th>Chi Phí</th>
                      <th>Hành động</th>
                    </tr></thead>
                    <tbody>
                      {filteredRepairHistory.map(item => (
                        <tr key={item.ID_SUACHUA}>
                          {/* <td>{item.ID_SUACHUA}</td>
                          <td>{item.MASUCO}</td> */}
                          <td>{item.MATHIETBI}</td>
                          <td title={item.TENTHIETBI} className="equipment-name-cell">{item.TENTHIETBI}</td>
                          <td>{formatDate(item.NGAYSUACHUA)}</td>
                          <td>{item.TEN_NV_SUA}</td>
                          <td>
                            <span className={`status-badge status-repair-${String(item.TINHTRANG_SAU_SC || 'unknown').toLowerCase().replace(/\s+/g, '-')/* .normalize("NFD").replace(/[\u0300-\u036f]/g, "") */}`}>
                              {item.TINHTRANG_SAU_SC || 'Không rõ'}
                            </span>
                          </td>
                          <td className="currency-cell">{formatCurrency(item.CHIPHI)}</td>
                          <td className="actions-cell">
                            <Button onClick={() => openDetailModalForRepairHistory(item)} className="btn-action btn-view btn-sm">Xem</Button>
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

      {/* Modals */}
      {showAddEquipmentModal && <AddEquipmentModal onClose={() => setShowAddEquipmentModal(false)} onAddEquipment={handleAddEquipment} equipmentTypes={EQUIPMENT_TYPES_OPTIONS.filter(t => t !== 'Tất cả')} equipmentStatuses={EQUIPMENT_STATUS_OPTIONS.filter(s => s !== 'Tất cả')} />}
      {showEquipmentDetailModal && equipmentToView && <EquipmentDetailModal equipment={equipmentToView} onClose={() => { setShowEquipmentDetailModal(false); setEquipmentToView(null); }} formatCurrency={formatCurrency} formatDate={formatDate} />}
      {showIncidentDetailModal && incidentToView && <IncidentDetailModal incident={incidentToView} onClose={() => { setShowIncidentDetailModal(false); setIncidentToView(null); }} formatDate={formatDate} formatCurrency={formatCurrency} />}
      
      {showRepairHistoryDetailModal && (
        <RepairHistoryDetailModal
          repairItem={repairItemToView} 
          incidentContext={incidentForRepairModal} 
          onClose={() => { 
            setShowRepairHistoryDetailModal(false); 
            setRepairItemToView(null);
            setIncidentForRepairModal(null);
          }}
          onSaveSuccess={handleRepairRecorded} 
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          // recordRepairApiFunc={recordFacilityRepairApi} // Truyền hàm API nếu cần
        />
      )}

      <SuccessMessageModal isOpen={!!successMessage} onClose={() => setSuccessMessage('')} successMessage={successMessage} />
      <ErrorMessageModal isOpen={!!errorMessage} onClose={() => setErrorMessage('')} errorMessage={errorMessage} />
    </div>
  );
}

export default Equipments;