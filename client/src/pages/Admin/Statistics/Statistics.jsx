// client/src/pages/Statistics/Statistics.jsx (hoặc đường dẫn của bạn)
import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import './Statistics.css'; // Đảm bảo đường dẫn CSS đúng

// Import các tab component
import RevenueExpenseTab from './RevenueExpenseTab';
import RankingTab from './RankingTab';
import TrendsTab from './TrendsTab';

// Import API service
import {
    getRevenueExpenseStatsApi,
    getRankingStatsApi,
    getTrendsStatsApi
} from '../../../services/statisticsApiService'; // Đảm bảo đường dẫn đúng

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler
);

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫'; // Thêm kiểm tra isNaN
  return parseFloat(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

function Statistics() {
  const [activeTab, setActiveTab] = useState('revenueExpense');
  const [filterPeriod, setFilterPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [statisticsData, setStatisticsData] = useState({
    revenueExpense: null,
    ranking: null,
    trends: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State để lưu lỗi

  // Sử dụng useCallback để tránh tạo lại hàm fetchStatisticsData mỗi lần render
  const fetchStatisticsData = useCallback(async (period, month, year, tab) => {
    console.log(`Fetching data for: ${tab}, Period: ${period}, Month: ${month}, Year: ${year}`);
    setLoading(true);
    setError(null); // Reset lỗi trước khi fetch
    try {
      let data;
      if (tab === 'revenueExpense') {
        data = await getRevenueExpenseStatsApi(period, year, month);
      } else if (tab === 'ranking') {
        data = await getRankingStatsApi(period, year, month);
      } else if (tab === 'trends') {
        data = await getTrendsStatsApi(period, year, month);
      }
      setStatisticsData(prev => ({ ...prev, [tab]: data }));
    } catch (err) {
      console.error(`Error fetching data for ${tab}:`, err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu.');
      setStatisticsData(prev => ({ ...prev, [tab]: null })); // Xóa dữ liệu cũ nếu có lỗi
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies rỗng vì hàm này không phụ thuộc vào state/props bên ngoài mà nhận qua tham số


  useEffect(() => {
    // Fetch data cho tab hiện tại khi filter thay đổi hoặc khi tab được chọn lần đầu
    // Hoặc khi activeTab thay đổi và chưa có dữ liệu cho tab đó
    if (activeTab) {
        // Luôn fetch lại khi filter thay đổi hoặc khi tab thay đổi
        fetchStatisticsData(filterPeriod, selectedMonth, selectedYear, activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPeriod, selectedMonth, selectedYear, activeTab, fetchStatisticsData]); // Thêm fetchStatisticsData vào dependencies

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // Data sẽ được fetch bởi useEffect khi activeTab thay đổi
  };

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
  const currentUiYear = new Date().getFullYear(); // Đổi tên để tránh trùng với selectedYear
  const years = Array.from({ length: 5 }, (_, i) => ({ value: currentUiYear - i, label: (currentUiYear - i).toString() }));

  return (
    <div className="statistics-page-container">
      <div className="statistics-header">
        <h2>Thống Kê</h2>
      </div>

      <div className="statistics-tabs">
        <button
          className={`tab-button ${activeTab === 'revenueExpense' ? 'active' : ''}`}
          onClick={() => handleTabChange('revenueExpense')}
        >
          Tổng thu chi
        </button>
        <button
          className={`tab-button ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => handleTabChange('ranking')}
        >
          Bảng xếp hạng
        </button>
        <button
          className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => handleTabChange('trends')}
        >
          Xu hướng
        </button>
      </div>

      <div className="statistics-filters">
        <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="filter-select"
        >
          <option value="monthly">Theo tháng</option>
          <option value="yearly">Theo năm</option>
        </select>

        {filterPeriod === 'monthly' && (
          <>
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="filter-select"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="filter-select"
            >
              {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
          </>
        )}
         {filterPeriod === 'yearly' && (
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="filter-select"
            >
              {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
        )}
      </div>

      <div className="statistics-content">
        {loading && <div className="loading-indicator">Đang tải dữ liệu...</div>}
        {error && !loading && <div className="error-message">Lỗi: {error}</div>} {/* Hiển thị lỗi */}

        {!loading && !error && activeTab === 'revenueExpense' && statisticsData.revenueExpense && (
          <RevenueExpenseTab data={statisticsData.revenueExpense} formatCurrency={formatCurrency} />
        )}
        {!loading && !error && activeTab === 'ranking' && statisticsData.ranking && (
          <RankingTab data={statisticsData.ranking} formatCurrency={formatCurrency} />
        )}
        {!loading && !error && activeTab === 'trends' && statisticsData.trends && (
          <TrendsTab data={statisticsData.trends} formatCurrency={formatCurrency} />
        )}
        {/* Trường hợp không có lỗi, không loading, nhưng không có data (ví dụ API trả về null hoặc mảng rỗng) */}
        {!loading && !error && !statisticsData[activeTab] && (
            <div className="placeholder-tab">Không có dữ liệu cho lựa chọn này hoặc dữ liệu đang được xử lý.</div>
        )}
      </div>
    </div>
  );
}

export default Statistics;