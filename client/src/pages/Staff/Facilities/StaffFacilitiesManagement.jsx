// src/pages/Staff/Facilities/StaffFacilitiesManagement.jsx
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../../components/common/Button';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal';
import AutocompleteDeviceInput from '../../../components/common/AutoCompleteDeviceInput';
import './StaffFacilitiesManagement.css';

import { getAllEquipmentApi } from '../../../services/equipmentApiService';
import { getCurrentUserApi } from '../../../services/authApiService';

// IMPORT CÁC HÀM API THẬT
import {
  reportFacilityIssueApi,
  // getAllFacilityIncidentsApi, // Dùng nếu muốn lấy tất cả sự cố một lần
  getDeviceIssuesApi,      // Dùng để lấy sự cố theo thiết bị
  recordFacilityRepairApi
} from '../../../services/facilityApiService'; // Đảm bảo đường dẫn đúng


// --- XÓA CÁC HÀM MOCK API ---
// const getAllIncidentsApiMock = ... (XÓA)
// const createRepairLogApiMock = ... (XÓA)
// const createIncidentReportApiMock = ... (XÓA)


// --- COMPONENT CHO TAB DANH SÁCH THIẾT BỊ ---
// (Giữ nguyên DeviceListTab)
const DeviceListTab = ({ devices, isLoading, errorLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return <p className="loading-text-tab">Đang tải danh sách thiết bị...</p>;
  }
  if (errorLoading) {
    return <p className="error-text-tab">Lỗi: {errorLoading}</p>;
  }
  if (!devices || devices.length === 0) {
    return <p className="no-items-found-tab">Không có thiết bị nào để hiển thị.</p>;
  }

  const filteredDevices = devices.filter(device =>
    Object.values(device).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusClassName = (status) => {
    if (!status) return 'status-unknown';
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
    switch (normalizedStatus) {
      case 'đang-hoạt-động': return 'status-active';
      case 'cần-bảo-trì': return 'status-maintenance';
      case 'đang-sửa-chữa': return 'status-repairing';
      case 'hỏng-hóc': return 'status-broken';
      case 'không-sử-dụng': return 'status-unused';
      default: return 'status-unknown';
    }
  };

  return (
    <div className="device-list-tab-content">
      <h3>Danh Sách Thiết Bị Hiện Có</h3>
      <div className="device-list-search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mã, vị trí, loại, tình trạng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredDevices.length > 0 ? (
        <div className="table-responsive-wrapper">
          <table className="device-list-table">
            <thead>
              <tr>
                <th>Mã Thiết Bị</th>
                <th>Tên Thiết Bị</th>
                <th>Loại</th>
                <th>Vị Trí</th>
                <th>Tình Trạng</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <tr key={device.MA_THIET_BI}>
                  <td>{device.MA_THIET_BI}</td>
                  <td>{device.TEN_THIET_BI}</td>
                  <td>{device.LOAI_THIET_BI || 'N/A'}</td>
                  <td>{device.VI_TRI || 'N/A'}</td>
                  <td className={getStatusClassName(device.TINH_TRANG_API)}>
                    {device.TINH_TRANG_API || 'Chưa rõ'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-items-found-tab">
          {searchTerm ? 'Không tìm thấy thiết bị nào khớp.' : 'Không có thiết bị nào.'}
        </p>
      )}
    </div>
  );
};
DeviceListTab.propTypes = {
  devices: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorLoading: PropTypes.string,
};


// --- COMPONENT CHO FORM SỬA CHỮA THIẾT BỊ (BM9.2) ---
const RepairLogForm = ({ currentUser, devicesList, isLoadingDevices, onSubmitSuccess, onSubmitError }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedSuCoId, setSelectedSuCoId] = useState('');
  // const [allIncidents, setAllIncidents] = useState([]); // Không cần nữa nếu fetch theo device
  const [filteredIncidentsForDevice, setFilteredIncidentsForDevice] = useState([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);

  const [repairDate, setRepairDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusAfterRepair, setStatusAfterRepair] = useState('Đã sửa chữa - Hoạt động tốt');
  const [cost, setCost] = useState('');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [repairImageFile, setRepairImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lọc sự cố khi thiết bị được chọn thay đổi
  useEffect(() => {
    const fetchIncidentsForDevice = async () => {
      if (selectedDeviceId) {
        setIsLoadingIncidents(true);
        setFilteredIncidentsForDevice([]); // Xóa danh sách cũ
        setSelectedSuCoId(''); // Reset lựa chọn sự cố cũ
        try {
          // Gọi API thật để lấy sự cố cho thiết bị đã chọn
          const incidentsData = await getDeviceIssuesApi(selectedDeviceId);
          // Lọc các sự cố chưa được giải quyết (Backend nên có filter này, hoặc client tự lọc)
          // Giả sử backend trả về cột TRANGTHAI_SUCO
          const unresolvedIncidents = (incidentsData || []).filter(
            (inc) => inc.TRANGTHAI_SUCO !== 'Đã giải quyết' // Cần có cột này từ API
          );
          setFilteredIncidentsForDevice(unresolvedIncidents);
        } catch (error) {
          console.error(`Error fetching incidents for device ${selectedDeviceId}:`, error);
          onSubmitError(`Lỗi: Không thể tải danh sách sự cố cho thiết bị ${selectedDeviceId}.`);
        } finally {
          setIsLoadingIncidents(false);
        }
      } else {
        setFilteredIncidentsForDevice([]);
        setSelectedSuCoId('');
      }
    };
    fetchIncidentsForDevice();
  }, [selectedDeviceId, onSubmitError]);

  const handleDeviceSelectionChange = useCallback((deviceIdValue) => {
    setSelectedDeviceId(deviceIdValue);
  }, []);

  const handleRepairImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRepairImageFile(e.target.files[0]);
    } else { setRepairImageFile(null); }
    e.target.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeviceId || !selectedSuCoId || !repairDate || !statusAfterRepair) {
      onSubmitError("Vui lòng chọn Thiết bị, Sự cố cần sửa và điền các trường bắt buộc (*).");
      return;
    }
    setIsSubmitting(true);

    const repairDataForApi = {
      MASUCO: selectedSuCoId,
      // MANV sẽ được backend lấy từ token
      NGAYSUACHUA: repairDate,
      TINHTRANG_SAU_SC: statusAfterRepair,
      CHIPHI: cost ? parseInt(cost, 10) : null, // Gửi null nếu rỗng để backend xử lý (hoặc 0)
      MOTA: solutionDescription || null, // Gửi null nếu rỗng
    };

    try {
      // Gọi API thật, truyền repairDataForApi và repairImageFile (nếu có)
      const createdRepair = await recordFacilityRepairApi(repairDataForApi, repairImageFile);
      
      const selectedDeviceForMessage = devicesList.find(d => d.MA_THIET_BI === selectedDeviceId);
      onSubmitSuccess(`Thông tin sửa chữa cho sự cố ${selectedSuCoId} của thiết bị "${selectedDeviceForMessage?.TEN_THIET_BI || selectedDeviceId}" đã lưu. Mã sửa chữa: ${createdRepair.MASUACHUA}`);
      
      // Reset form và tải lại danh sách sự cố cho thiết bị (nếu cần)
      setSelectedDeviceId(''); // Điều này sẽ trigger useEffect để fetch lại
      setSelectedSuCoId(''); // (Không cần thiết vì selectedDeviceId rỗng sẽ xóa)
      setRepairDate(new Date().toISOString().split('T')[0]);
      setStatusAfterRepair('Đã sửa chữa - Hoạt động tốt'); 
      setCost(''); 
      setSolutionDescription(''); 
      setRepairImageFile(null);
      // Tải lại danh sách sự cố cho thiết bị vừa sửa (nếu muốn cập nhật dropdown ngay)
      // Tuy nhiên, khi setSelectedDeviceId('') ở trên, useEffect đã chạy và setFilteredIncidentsForDevice([])
      // Có thể cần logic khác nếu muốn giữ selectedDeviceId và cập nhật danh sách sự cố.

    } catch (error) {
      console.error("Error submitting repair log:", error);
      const errorMessage = (error.data?.message || error.message) || "Lỗi khi lưu thông tin sửa chữa. Vui lòng thử lại.";
      onSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="device-form repair-log-form">
      <h3>Cập Nhật Thông Tin Sửa Chữa Thiết Bị</h3>
      <div className="form-group">
        <AutocompleteDeviceInput label="Thiết bị cần sửa chữa *" devices={devicesList} value={selectedDeviceId} onChange={handleDeviceSelectionChange} placeholder="Nhập hoặc chọn mã/tên thiết bị..." required disabled={isLoadingDevices} />
        {isLoadingDevices && <p className="loading-text-inline">Đang tải DS thiết bị...</p>}
      </div>

      <div className="form-group">
        <label htmlFor="repairLogSuCo">Sự cố được giải quyết *</label>
        <select
            id="repairLogSuCo"
            value={selectedSuCoId}
            onChange={(e) => setSelectedSuCoId(e.target.value)}
            required
            disabled={!selectedDeviceId || isLoadingIncidents || (filteredIncidentsForDevice.length === 0 && !!selectedDeviceId)}
        >
            <option value="">-- Chọn sự cố --</option>
            {filteredIncidentsForDevice.map(suco => (
                <option key={suco.MASUCO} value={suco.MASUCO}>
                    {`${suco.MASUCO} - ${suco.MOTA ? suco.MOTA.substring(0,50) : 'Không có mô tả'}... (${suco.NGAY_BAOCAO})`}
                </option>
            ))}
        </select>
        {!selectedDeviceId && <p className="form-text-muted">Vui lòng chọn thiết bị ở trên trước.</p>}
        {selectedDeviceId && filteredIncidentsForDevice.length === 0 && !isLoadingIncidents && <p className="form-text-muted">Không có sự cố nào (chưa giải quyết) cho thiết bị này.</p>}
        {isLoadingIncidents && <p className="loading-text-inline">Đang tải DS sự cố...</p>}
      </div>
      
      <div className="form-group"><label htmlFor="repairLogEmployeeId">Nhân viên sửa chữa</label><input type="text" id="repairLogEmployeeId" value={currentUser.name || currentUser.employeeId || currentUser.id || 'N/A'} readOnly disabled /></div>
      <div className="form-group"><label htmlFor="repairLogDate">Ngày sửa chữa *</label><input type="date" id="repairLogDate" value={repairDate} onChange={(e) => setRepairDate(e.target.value)} required /></div>
      <div className="form-group"><label htmlFor="repairLogStatus">Tình trạng sau sửa chữa *</label><select id="repairLogStatus" value={statusAfterRepair} onChange={(e) => setStatusAfterRepair(e.target.value)} required><option value="Đã sửa chữa - Hoạt động tốt">Đã sửa chữa - Hoạt động tốt</option><option value="Tạm thời sửa chữa - Cần theo dõi thêm">Tạm thời sửa chữa - Cần theo dõi thêm</option><option value="Không thể sửa chữa - Đề xuất thay thế">Không thể sửa chữa - Đề xuất thay thế</option><option value="Chờ linh kiện">Chờ linh kiện</option></select></div>
      <div className="form-group"><label htmlFor="repairLogCost">Chi phí sửa chữa (VND)</label><input type="number" id="repairLogCost" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Ví dụ: 500000" min="0" /></div>
      <div className="form-group"><label htmlFor="repairLogSolutionDescription">Mô tả công việc sửa chữa/Linh kiện thay thế</label><textarea id="repairLogSolutionDescription" value={solutionDescription} onChange={(e) => setSolutionDescription(e.target.value)} rows="3" /></div>
      <div className="form-group"><label htmlFor="repairLogImage">Hình ảnh (minh họa sửa chữa)</label><input type="file" id="repairLogImage" onChange={handleRepairImageChange} accept="image/*" />{repairImageFile && <p className="file-name-display">Đã chọn: {repairImageFile.name}</p>}</div>
      <div className="form-actions"><Button type="submit" variant="primary" disabled={isSubmitting || isLoadingDevices || isLoadingIncidents || !selectedSuCoId}>{isSubmitting ? 'Đang lưu...' : 'Lưu Thông Tin Sửa Chữa'}</Button></div>
    </form>
  );
};
RepairLogForm.propTypes = { 
    currentUser: PropTypes.object.isRequired,
    devicesList: PropTypes.array.isRequired,
    isLoadingDevices: PropTypes.bool.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitError: PropTypes.func.isRequired,
};


// --- COMPONENT CHO FORM BÁO CÁO SỰ CỐ (BM9.3) ---
const ReportIssueForm = ({ currentUser, devicesList, isLoadingDevices, onSubmitSuccess, onSubmitError }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [priority, setPriority] = useState('Trung bình');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeviceSelectionChange = useCallback((deviceIdValue) => {
    setSelectedDeviceId(deviceIdValue);
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 3 - imageFiles.length);
      setImageFiles(prevFiles => [...prevFiles, ...filesArray].slice(0, 3));
      e.target.value = null;
    }
  };

  const removeImage = (fileName) => {
    setImageFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeviceId || !description.trim()) {
      onSubmitError("Vui lòng chọn Mã thiết bị và điền Mô tả sự cố.");
      return;
    }
    setIsSubmitting(true);

    const incidentDataForApi = {
      MATHIETBI: selectedDeviceId,
      // MANV sẽ được backend lấy từ token
      NGAY_BAOCAO: reportDate,
      MOTA: description,
      MUCDO_UUTIEN: priority,
    };
    
    try {
        const newIncident = await reportFacilityIssueApi(incidentDataForApi, imageFiles);

        const selectedDeviceForMessage = devicesList.find(d => d.MA_THIET_BI === selectedDeviceId);
        onSubmitSuccess(`Báo cáo sự cố ${newIncident.MASUCO} cho thiết bị "${selectedDeviceForMessage?.TEN_THIET_BI || selectedDeviceId}" đã gửi thành công.`);
        
        setSelectedDeviceId(''); 
        setDescription(''); 
        setImageFiles([]);
        setReportDate(new Date().toISOString().split('T')[0]); 
        setPriority('Trung bình');

    } catch (error) {
        console.error("Error submitting issue report:", error);
        const errorMessage = (error.data?.message || error.message) || "Lỗi khi gửi báo cáo sự cố. Vui lòng thử lại.";
        onSubmitError(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="device-form report-issue-form">
      <h3>Báo Cáo Sự Cố Thiết Bị</h3>
      <div className="form-group">
        <AutocompleteDeviceInput label="Mã thiết bị *" devices={devicesList} value={selectedDeviceId} onChange={handleDeviceSelectionChange} placeholder="Nhập hoặc chọn mã/tên thiết bị..." required disabled={isLoadingDevices} />
        {isLoadingDevices && <p className="loading-text-inline">Đang tải DS thiết bị...</p>}
      </div>
      <div className="form-group"><label htmlFor="reportIssueEmployeeId">Nhân viên báo cáo</label><input type="text" id="reportIssueEmployeeId" value={currentUser.name || currentUser.employeeId || currentUser.id || 'N/A'} readOnly disabled /></div>
      <div className="form-group"><label htmlFor="reportIssueDate">Ngày báo cáo</label><input type="date" id="reportIssueDate" value={reportDate} onChange={(e) => setReportDate(e.target.value)} /></div>
      <div className="form-group"><label htmlFor="reportIssueDescription">Mô tả sự cố *</label><textarea id="reportIssueDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" required /></div>
      <div className="form-group"><label htmlFor="reportIssueImages">Hình ảnh minh họa (tối đa 3 ảnh)</label><input type="file" id="reportIssueImages" multiple onChange={handleImageChange} accept="image/png, image/jpeg, image/gif" disabled={imageFiles.length >= 3} />
        {imageFiles.length > 0 && (
          <div className="image-preview-list">
            <p className="image-count-text">Đã chọn {imageFiles.length}/3 ảnh:</p>
            {imageFiles.map((file, index) => (
              <div key={index} className="image-preview-item">
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                <Button type="button" variant="danger" size="small" onClick={() => removeImage(file.name)}>Xóa</Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="form-group"><label htmlFor="reportIssuePriority">Mức độ ưu tiên</label><select id="reportIssuePriority" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="Thấp">Thấp</option><option value="Trung bình">Trung bình</option><option value="Cao">Cao</option><option value="Khẩn cấp">Khẩn cấp</option></select></div>
      <div className="form-actions"><Button type="submit" variant="primary" disabled={isSubmitting || isLoadingDevices || !selectedDeviceId}>{isSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}</Button></div>
    </form>
  );
};
ReportIssueForm.propTypes = { 
    currentUser: PropTypes.object.isRequired,
    devicesList: PropTypes.array.isRequired,
    isLoadingDevices: PropTypes.bool.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitError: PropTypes.func.isRequired,
};


// --- COMPONENT CHÍNH CỦA TRANG ---
// (Giữ nguyên StaffFacilitiesManagementPage, chỉ đảm bảo nó truyền đúng props)
const StaffFacilitiesManagementPage = ({ currentUser: currentUserFromProps }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [errorToDisplay, setErrorToDisplay] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [devicesList, setDevicesList] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  const [userToDisplay, setUserToDisplay] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userFetchError, setUserFetchError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      setUserFetchError(null);
      if (currentUserFromProps) {
        const formattedPropUser = {
          ...currentUserFromProps,
          id: currentUserFromProps.id || currentUserFromProps.employeeId, 
          name: currentUserFromProps.name || currentUserFromProps.username,
        };
        setUserToDisplay(formattedPropUser);
        setIsLoadingUser(false);
      } else {
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            const userDataFromApi = await getCurrentUserApi();
            const formattedApiUser = userDataFromApi ? {
              ...userDataFromApi,
              id: userDataFromApi.id, 
              employeeId: userDataFromApi.id, 
              name: userDataFromApi.name || userDataFromApi.username,
            } : null;
            setUserToDisplay(formattedApiUser);
          } else {
            setUserFetchError("Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.");
            setUserToDisplay(null);
          }
        } catch (error) {
          console.error("Error fetching current user in FacilitiesPage:", error);
          setUserFetchError(error.message || "Lỗi khi tải thông tin người dùng.");
          setUserToDisplay(null);
        } finally {
          setIsLoadingUser(false);
        }
      }
    };
    fetchUser();
  }, [currentUserFromProps]);

  useEffect(() => {
    const loadDevices = async () => {
      setIsLoadingDevices(true);
      try {
        const apiData = await getAllEquipmentApi();
        const mappedData = apiData.map(device => ({
          MA_THIET_BI: device.MATHIETBI,
          TEN_THIET_BI: device.TENTHIETBI,
          LOAI_THIET_BI: device.LOAITHIETBI,
          VI_TRI: device.VITRITHIETBI,
          TINH_TRANG_API: device.TRANGTHAI,
        }));
        setDevicesList(mappedData || []);
        if (errorToDisplay && errorToDisplay.includes("Không thể tải danh sách thiết bị")) {
            setErrorToDisplay(null);
        }
      } catch (error) {
        console.error("Error loading devices in Page:", error);
        const errorMessageContent = error.message || "Không thể tải danh sách thiết bị. Vui lòng thử làm mới trang.";
        setErrorToDisplay(errorMessageContent);
        setDevicesList([]);
      } finally {
        setIsLoadingDevices(false);
      }
    };
    loadDevices();
  }, [errorToDisplay]);

  const handleShowSuccess = useCallback((message) => { setSuccessMessage(message); setErrorToDisplay(null); }, []);
  const handleShowError = useCallback((message) => { setErrorToDisplay(message); setSuccessMessage(null); }, []);

  useEffect(() => {
    let successTimer, errorTimer;
    if (successMessage) successTimer = setTimeout(() => setSuccessMessage(null), 3500);
    if (errorToDisplay) errorTimer = setTimeout(() => setErrorToDisplay(null), 5000);
    return () => { clearTimeout(successTimer); clearTimeout(errorTimer); };
  }, [successMessage, errorToDisplay]);

  if (isLoadingUser) {
    return (
      <div className="page-container staff-facilities-management-page">
        <p className="loading-text-tab">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  if (!userToDisplay) {
    return (
      <div className="page-container staff-facilities-management-page">
        <p className="error-text-tab">
          {userFetchError || "Không thể xác định người dùng. Vui lòng đăng nhập lại."}
        </p>
      </div>
    );
  }

  const effectiveCurrentUser = userToDisplay;

  return (
    <div className="page-container staff-facilities-management-page">
      <div className="page-header">
        <h1>Quản Lý Sự Cố và Sửa Chữa Thiết Bị</h1>
        {/* {effectiveCurrentUser?.name && <p className="current-user-greeting">Nhân viên: {effectiveCurrentUser.name} ({effectiveCurrentUser.id})</p>} */}
        <div className="tab-navigation">
          <Button variant={activeTab === 'list' ? "primary" : "light"} onClick={() => setActiveTab('list')} size="medium">Danh Sách Thiết Bị</Button>
          <Button variant={activeTab === 'report_issue' ? "primary" : "light"} onClick={() => setActiveTab('report_issue')} size="medium">Báo Cáo Sự Cố </Button>
          <Button variant={activeTab === 'repair' ? "primary" : "light"} onClick={() => setActiveTab('repair')} size="medium">Cập Nhật Sửa Chữa </Button>
        </div>
      </div>

      <div className="tab-content">
        {isLoadingDevices && devicesList.length === 0 && <p className="loading-text-tab">Đang tải dữ liệu thiết bị...</p>}
        {errorToDisplay && !userFetchError && devicesList.length === 0 && activeTab === 'list' && <p className="error-text-tab">Lỗi: {errorToDisplay}</p>}
        {!isLoadingDevices && devicesList.length === 0 && !errorToDisplay && activeTab === 'list' && <p className="no-items-found-tab">Không có dữ liệu thiết bị nào.</p>}
        
        <div style={{ display: activeTab === 'list' ? 'block' : 'none' }}>
          <DeviceListTab devices={devicesList} isLoading={isLoadingDevices} errorLoading={errorToDisplay && errorToDisplay.includes("Không thể tải danh sách thiết bị") ? errorToDisplay : null} />
        </div>
        <div style={{ display: activeTab === 'repair' ? 'block' : 'none' }}>
          <RepairLogForm currentUser={effectiveCurrentUser} devicesList={devicesList} isLoadingDevices={isLoadingDevices} onSubmitSuccess={handleShowSuccess} onSubmitError={handleShowError} />
        </div>
        <div style={{ display: activeTab === 'report_issue' ? 'block' : 'none' }}>
          <ReportIssueForm currentUser={effectiveCurrentUser} devicesList={devicesList} isLoadingDevices={isLoadingDevices} onSubmitSuccess={handleShowSuccess} onSubmitError={handleShowError} />
        </div>
      </div>

      <ErrorMessageModal isOpen={!!errorToDisplay} onClose={() => setErrorToDisplay(null)} errorMessage={errorToDisplay} />
      <SuccessMessageModal isOpen={!!successMessage} onClose={() => setSuccessMessage(null)} successMessage={successMessage} />
    </div>
  );
};

StaffFacilitiesManagementPage.propTypes = {
  currentUser: PropTypes.shape({
    employeeId: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default StaffFacilitiesManagementPage;