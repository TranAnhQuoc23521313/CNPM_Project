// src/components/common/AutocompleteDeviceInput.jsx (Tạo file mới)
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './AutoCompleteDeviceInput.css'; // Sẽ tạo file CSS này sau

const AutocompleteDeviceInput = ({
  label,
  devices = [], // Danh sách tất cả thiết bị { MA_THIET_BI, TEN_THIET_BI }
  value, // MA_THIET_BI hiện tại đang được chọn
  onChange, // Hàm callback khi một thiết bị được chọn (trả về MA_THIET_BI)
  onInputChange, // Hàm callback khi nội dung input thay đổi (trả về chuỗi nhập) - tùy chọn
  placeholder = "Nhập mã hoặc tên thiết bị...",
  required = false,
  disabled = false,
  error = null, // Thông báo lỗi
}) => {
  const [inputValue, setInputValue] = useState(''); // Giá trị người dùng nhập vào ô input
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const wrapperRef = useRef(null); // Để xử lý click ra ngoài

  // Cập nhật inputValue khi value (MA_THIET_BI được chọn) thay đổi từ bên ngoài
  useEffect(() => {
    if (value) {
      const selectedDevice = devices.find(d => d.MA_THIET_BI === value);
      if (selectedDevice) {
        setInputValue(`${selectedDevice.TEN_THIET_BI} (${selectedDevice.MA_THIET_BI})`);
      } else {
        setInputValue(''); // Nếu value không khớp thiết bị nào, xóa input
      }
    } else {
      setInputValue(''); // Nếu value là rỗng (ví dụ sau khi reset form)
    }
  }, [value, devices]);

  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);
    if (onInputChange) {
      onInputChange(query); // Gọi callback nếu component cha muốn biết giá trị input thô
    }

    if (query.trim() === '') {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
      onChange(''); // Nếu xóa hết input, coi như chưa chọn thiết bị nào
      return;
    }

    const filteredSuggestions = devices.filter(
      (device) =>
        device.TEN_THIET_BI.toLowerCase().includes(query.toLowerCase()) ||
        device.MA_THIET_BI.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
    setIsSuggestionsVisible(true);
  };

  const handleSuggestionClick = (device) => {
    setInputValue(`${device.TEN_THIET_BI} (${device.MA_THIET_BI})`);
    onChange(device.MA_THIET_BI); // Gọi callback với MA_THIET_BI được chọn
    setIsSuggestionsVisible(false);
    setSuggestions([]);
  };

  // Xử lý click ra ngoài để ẩn suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsSuggestionsVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      {label && <label htmlFor={`autocomplete-${label.replace(/\s+/g, '-')}`}>{label}{required && ' *'}</label>}
      <input
        type="text"
        id={`autocomplete-${label?.replace(/\s+/g, '-')}`}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue && suggestions.length > 0 && setIsSuggestionsVisible(true)} // Hiển thị lại suggestions khi focus nếu có query
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off" // Tắt gợi ý mặc định của trình duyệt
      />
      {isSuggestionsVisible && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((device) => (
            <li
              key={device.MA_THIET_BI}
              onClick={() => handleSuggestionClick(device)}
              onMouseDown={(e) => e.preventDefault()} // Ngăn input mất focus trước khi click được xử lý
            >
              {device.TEN_THIET_BI} ({device.MA_THIET_BI})
            </li>
          ))}
        </ul>
      )}
      {isSuggestionsVisible && inputValue && suggestions.length === 0 && (
         <div className="no-suggestions">Không tìm thấy thiết bị.</div>
      )}
      {error && <span className="error-text autocomplete-error">{error}</span>}
    </div>
  );
};

AutocompleteDeviceInput.propTypes = {
  label: PropTypes.string,
  devices: PropTypes.arrayOf(
    PropTypes.shape({
      MA_THIET_BI: PropTypes.string.isRequired,
      TEN_THIET_BI: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string, // MA_THIET_BI đã chọn
  onChange: PropTypes.func.isRequired, // Callback khi chọn 1 thiết bị
  onInputChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
};

export default AutocompleteDeviceInput;