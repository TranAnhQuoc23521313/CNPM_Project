// src/pages/Staff/Facilities/StaffFacilitiesManagement.jsx
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../../components/common/Button';
import ErrorMessageModal from '../../../components/common/ErrorMessageModal';
import SuccessMessageModal from '../../../components/common/SuccessMessageModal';
import AutocompleteDeviceInput from '../../../components/common/AutoCompleteDeviceInput'; // Component Autocomplete
import './StaffFacilitiesManagement.css';

// --- DỮ LIỆU GIẢ LẬP CHO DANH SÁCH THIẾT BỊ ---
const MOCK_DEVICES_LIST = [
  { MA_THIET_BI: "PROJ001", TEN_THIET_BI: "Máy chiếu Laser Phòng 1", LOAI_THIET_BI: "Máy chiếu", VI_TRI: "Phòng chiếu 1", TINH_TRANG_API: "Hoạt động tốt" },
  { MA_THIET_BI: "PROJ002", TEN_THIET_BI: "Máy chiếu LED Phòng 2", LOAI_THIET_BI: "Máy chiếu", VI_TRI: "Phòng chiếu 2", TINH_TRANG_API: "Cần bảo trì" },
  { MA_THIET_BI: "SOUND01", TEN_THIET_BI: "Hệ thống Âm thanh Dolby Atmos - Phòng 1", LOAI_THIET_BI: "Âm thanh", VI_TRI: "Phòng chiếu 1", TINH_TRANG_API: "Đang sửa chữa" },
  { MA_THIET_BI: "SOUND02", TEN_THIET_BI: "Loa Surround 7.1 - Phòng 2", LOAI_THIET_BI: "Âm thanh", VI_TRI: "Phòng chiếu 2", TINH_TRANG_API: "Hoạt động tốt" },
  { MA_THIET_BI: "CAM001", TEN_THIET_BI: "Camera An Ninh - Lối vào", LOAI_THIET_BI: "Camera", VI_TRI: "Sảnh chính", TINH_TRANG_API: "Hỏng - Chờ thay thế" },
  { MA_THIET_BI: "POS001", TEN_THIET_BI: "Máy POS Quầy vé 1", LOAI_THIET_BI: "POS", VI_TRI: "Quầy vé", TINH_TRANG_API: "Hoạt động tốt" },
  { MA_THIET_BI: "LIGHT01", TEN_THIET_BI: "Đèn chiếu sáng sân khấu", LOAI_THIET_BI: "Ánh sáng", VI_TRI: "Sân khấu", TINH_TRANG_API: "Cần bảo trì" },
  { MA_THIET_BI: "AC001", TEN_THIET_BI: "Máy lạnh trung tâm Sảnh", LOAI_THIET_BI: "Điều hòa", VI_TRI: "Sảnh chính", TINH_TRANG_API: "Hoạt động tốt" },
];

// Hàm giả lập gọi API lấy danh sách thiết bị
const fetchMockDevicesApi = () => {
  console.log("Fetching mock devices list...");
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Mock devices list fetched.");
      resolve([...MOCK_DEVICES_LIST]);
    }, 700);
  });
};
// --- KẾT THÚC DỮ LIỆU GIẢ LẬP ---


// --- COMPONENT CHO TAB DANH SÁCH THIẾT BỊ ---
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
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'hoạt động tốt': return 'status-active';
      case 'cần bảo trì': return 'status-maintenance';
      case 'đang sửa chữa': return 'status-repairing';
      case 'hỏng - chờ thay thế': return 'status-broken';
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
        <div className="table-responsive-wrapper"> {/* Bọc bảng để cuộn ngang nếu cần */}
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
  const [repairDate, setRepairDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusAfterRepair, setStatusAfterRepair] = useState('Đã sửa chữa - Hoạt động tốt');
  const [cost, setCost] = useState('');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [repairImageFile, setRepairImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!selectedDeviceId || !repairDate || !statusAfterRepair) {
      onSubmitError("Vui lòng chọn Mã thiết bị và điền các trường bắt buộc (*).");
      return;
    }
    setIsSubmitting(true);
    console.log("Submitting Repair Log (BM9.2):", { MA_THIET_BI: selectedDeviceId, NGAY_SUA_CHUA: repairDate, TINH_TRANG_SAU_SUA: statusAfterRepair, CHI_PHI_SUA_CHUA: cost || 0, MO_TA_GIAI_PHAP: solutionDescription, HINH_ANH_SUA_CHUA_FILE_NAME: repairImageFile ? repairImageFile.name : null, MA_NHAN_VIEN_SUA: currentUser.employeeId || 'STAFF_TECH_MOCK', });
    await new Promise(resolve => setTimeout(resolve, 1000));
    const selectedDeviceForMessage = devicesList.find(d => d.MA_THIET_BI === selectedDeviceId);
    onSubmitSuccess(`Thông tin sửa chữa cho "${selectedDeviceForMessage?.TEN_THIET_BI || selectedDeviceId}" đã lưu.`);
    setSelectedDeviceId(''); setRepairDate(new Date().toISOString().split('T')[0]);
    setStatusAfterRepair('Đã sửa chữa - Hoạt động tốt'); setCost(''); setSolutionDescription(''); setRepairImageFile(null);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="device-form repair-log-form">
      <h3>Cập Nhật Thông Tin Sửa Chữa Thiết Bị</h3>
      <div className="form-group">
        <AutocompleteDeviceInput label="Mã thiết bị *" devices={devicesList} value={selectedDeviceId} onChange={handleDeviceSelectionChange} placeholder="Nhập hoặc chọn mã/tên thiết bị..." required disabled={isLoadingDevices} />
        {isLoadingDevices && <p className="loading-text">Đang tải...</p>}
      </div>
      <div className="form-group"><label htmlFor="repairLogDate">Ngày sửa chữa *</label><input type="date" id="repairLogDate" value={repairDate} onChange={(e) => setRepairDate(e.target.value)} required /></div>
      <div className="form-group"><label htmlFor="repairLogStatus">Tình trạng sau sửa chữa *</label><select id="repairLogStatus" value={statusAfterRepair} onChange={(e) => setStatusAfterRepair(e.target.value)} required><option value="Đã sửa chữa - Hoạt động tốt">Đã sửa chữa - Hoạt động tốt</option><option value="Tạm thời sửa chữa - Cần theo dõi thêm">Tạm thời sửa chữa - Cần theo dõi thêm</option><option value="Không thể sửa chữa - Đề xuất thay thế">Không thể sửa chữa - Đề xuất thay thế</option></select></div>
      <div className="form-group"><label htmlFor="repairLogCost">Chi phí sửa chữa (VND)</label><input type="number" id="repairLogCost" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Ví dụ: 500000" min="0" /></div>
      <div className="form-group"><label htmlFor="repairLogSolutionDescription">Mô tả giải pháp/Linh kiện thay thế</label><textarea id="repairLogSolutionDescription" value={solutionDescription} onChange={(e) => setSolutionDescription(e.target.value)} rows="3" /></div>
      <div className="form-group"><label htmlFor="repairLogImage">Hình ảnh (minh họa sửa chữa)</label><input type="file" id="repairLogImage" onChange={handleRepairImageChange} accept="image/*" />{repairImageFile && <p className="file-name-display">Đã chọn: {repairImageFile.name}</p>}</div>
      <div className="form-actions"><Button type="submit" variant="primary" disabled={isSubmitting || isLoadingDevices || !selectedDeviceId}>{isSubmitting ? 'Đang lưu...' : 'Lưu Thông Tin'}</Button></div>
    </form>
  );
};
RepairLogForm.propTypes = { /* ... thêm propTypes nếu cần ... */ };


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
      onSubmitError("Vui lòng chọn/nhập Mã thiết bị và điền Mô tả sự cố.");
      return;
    }
    setIsSubmitting(true);
    console.log("Submitting Issue Report (BM9.3):", { MA_THIET_BI: selectedDeviceId, MA_NHAN_VIEN_BC: currentUser.employeeId || 'STAFF_REPORT_MOCK', NGAY_BAO_CAO: reportDate, MO_TA_SU_CO: description, MUC_DO_UU_TIEN: priority, HINH_ANH_FILES: imageFiles.map(f => f.name), });
    await new Promise(resolve => setTimeout(resolve, 1000));
    const selectedDeviceForMessage = devicesList.find(d => d.MA_THIET_BI === selectedDeviceId);
    onSubmitSuccess(`Báo cáo sự cố cho "${selectedDeviceForMessage?.TEN_THIET_BI || selectedDeviceId}" đã gửi.`);
    setSelectedDeviceId(''); setDescription(''); setImageFiles([]);
    setReportDate(new Date().toISOString().split('T')[0]); setPriority('Trung bình');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="device-form report-issue-form">
      <h3>Báo Cáo Sự Cố Thiết Bị</h3>
      <div className="form-group">
        <AutocompleteDeviceInput label="Mã thiết bị *" devices={devicesList} value={selectedDeviceId} onChange={handleDeviceSelectionChange} placeholder="Nhập hoặc chọn mã/tên thiết bị..." required disabled={isLoadingDevices}/>
        {isLoadingDevices && <p className="loading-text">Đang tải...</p>}
      </div>
      <div className="form-group"><label htmlFor="reportIssueEmployeeId">Mã nhân viên báo cáo</label><input type="text" id="reportIssueEmployeeId" value={currentUser.employeeId || 'STAFF_000'} readOnly disabled /></div>
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
ReportIssueForm.propTypes = { /* ... thêm propTypes nếu cần ... */ };


// --- COMPONENT CHÍNH CỦA TRANG ---
const StaffFacilitiesManagementPage = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [errorToDisplay, setErrorToDisplay] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [devicesList, setDevicesList] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  const effectiveCurrentUser = currentUser || { employeeId: 'STAFF_DEMO_007' };

  useEffect(() => {
    const loadDevices = async () => {
      setIsLoadingDevices(true);
      setErrorToDisplay(null);
      try {
        const data = await fetchMockDevicesApi();
        setDevicesList(data || []);
      } catch (error) {
        console.error("Error loading devices in Page:", error);
        setErrorToDisplay("Không thể tải danh sách thiết bị. Vui lòng thử làm mới trang.");
        setDevicesList([]);
      } finally {
        setIsLoadingDevices(false);
      }
    };
    loadDevices();
  }, []);

  const handleShowSuccess = useCallback((message) => { setSuccessMessage(message);}, []);
  const handleShowError = useCallback((message) => { setErrorToDisplay(message);}, []);

  useEffect(() => {
    let successTimer, errorTimer;
    if (successMessage) successTimer = setTimeout(() => setSuccessMessage(null), 3500);
    if (errorToDisplay) errorTimer = setTimeout(() => setErrorToDisplay(null), 5000);
    return () => { clearTimeout(successTimer); clearTimeout(errorTimer); };
  }, [successMessage, errorToDisplay]);

  return (
    <div className="page-container staff-facilities-management-page">
      <div className="page-header">
        <h1>Quản Lý Sự Cố Thiết Bị</h1>
        <div className="tab-navigation">
          <Button variant={activeTab === 'list' ? "primary" : "light"} onClick={() => setActiveTab('list')} size="medium">Danh Sách Thiết Bị</Button>
          <Button variant={activeTab === 'report_issue' ? "primary" : "light"} onClick={() => setActiveTab('report_issue')} size="medium">Báo Cáo Sự Cố </Button>
          <Button variant={activeTab === 'repair' ? "primary" : "light"} onClick={() => setActiveTab('repair')} size="medium">Cập Nhật Sửa Chữa </Button>
        </div>
      </div>

      <div className="tab-content">
        {isLoadingDevices && devicesList.length === 0 && <p className="loading-text-tab">Đang tải dữ liệu thiết bị...</p> }
        {!isLoadingDevices && devicesList.length === 0 && !errorToDisplay && <p className="no-items-found-tab">Không có dữ liệu thiết bị nào để hiển thị.</p>}

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
    // các trường khác của currentUser nếu có
  }),
};

export default StaffFacilitiesManagementPage;