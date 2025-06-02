// src/pages/Staff/Facilities/DeviceListTab.jsx (Tạo file mới)
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './DeviceListTab.css'; // Bạn có thể tạo file CSS riêng nếu cần style phức tạp

const DeviceListTab = ({ devices, isLoading, errorLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return <p className="loading-text-tab">Đang tải danh sách thiết bị...</p>;
  }

  if (errorLoading) {
    return <p className="error-text-tab">Lỗi: Không thể tải danh sách thiết bị. ({errorLoading})</p>;
  }

  if (!devices || devices.length === 0) {
    return <p className="no-items-found-tab">Không có thiết bị nào để hiển thị.</p>;
  }

  const filteredDevices = devices.filter(device =>
    (device.TEN_THIET_BI && device.TEN_THIET_BI.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (device.MA_THIET_BI && device.MA_THIET_BI.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (device.VI_TRI && device.VI_TRI.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (device.LOAI_THIET_BI && device.LOAI_THIET_BI.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Hàm giả lập để lấy tình trạng thiết bị (bạn sẽ thay thế bằng dữ liệu thật từ API)
  const getMockDeviceStatus = (deviceId) => {
    const statuses = ['Hoạt động tốt', 'Cần bảo trì', 'Đang sửa chữa', 'Hỏng - Chờ thay thế'];
    // Tạo một giá trị giả lập dựa trên ID để có sự đa dạng
    const hash = deviceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return statuses[hash % statuses.length];
  };

  const getStatusClassName = (status) => {
    switch (status) {
      case 'Hoạt động tốt':
        return 'status-active';
      case 'Cần bảo trì':
        return 'status-maintenance';
      case 'Đang sửa chữa':
        return 'status-repairing';
      case 'Hỏng - Chờ thay thế':
        return 'status-broken';
      default:
        return '';
    }
  };


  return (
    <div className="device-list-tab-content">
      <h3>Danh Sách Thiết Bị Hiện Có</h3>
      <div className="device-list-search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mã, vị trí, loại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredDevices.length > 0 ? (
        <table className="device-list-table">
          <thead>
            <tr>
              <th>Mã Thiết Bị</th>
              <th>Tên Thiết Bị</th>
              <th>Loại Thiết Bị</th>
              <th>Vị Trí</th>
              <th>Tình Trạng Hiện Tại</th>
              {/* Thêm các cột khác nếu cần, ví dụ: Ngày kiểm tra cuối */}
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => {
              const currentStatus = getMockDeviceStatus(device.MA_THIET_BI); // Lấy tình trạng giả lập
              return (
                <tr key={device.MA_THIET_BI}>
                  <td>{device.MA_THIET_BI}</td>
                  <td>{device.TEN_THIET_BI}</td>
                  <td>{device.LOAI_THIET_BI || 'N/A'}</td>
                  <td>{device.VI_TRI || 'N/A'}</td>
                  <td className={getStatusClassName(currentStatus)}>
                    {currentStatus}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="no-items-found-tab">
            {searchTerm ? 'Không tìm thấy thiết bị nào khớp với tìm kiếm của bạn.' : 'Không có thiết bị nào trong danh sách.'}
        </p>
      )}
    </div>
  );
};

DeviceListTab.propTypes = {
  devices: PropTypes.arrayOf(
    PropTypes.shape({
      MA_THIET_BI: PropTypes.string.isRequired,
      TEN_THIET_BI: PropTypes.string.isRequired,
      LOAI_THIET_BI: PropTypes.string,
      VI_TRI: PropTypes.string,
      // Thêm các trường khác nếu có từ API
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorLoading: PropTypes.string, // Chứa thông báo lỗi nếu có
};

export default DeviceListTab;