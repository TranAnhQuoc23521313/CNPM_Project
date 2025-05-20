import React, { useState, useEffect } from 'react';
// Các import của Chart.js và đăng ký component vẫn giữ nguyên như trước
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, // Thêm ArcElement (cho Pie/Doughnut) và BarElement
  Title, Tooltip, Legend, Filler
} from 'chart.js';

import './Statistics.css';
// Import các tab component mới
import RevenueExpenseTab from './RevenueExpenseTab';
import RankingTab from './RankingTab';
import TrendsTab from './TrendsTab';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler
);

// Hàm định dạng tiền tệ (giữ nguyên)
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0 ₫';
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

function Statistics() {
  const [activeTab, setActiveTab] = useState('revenueExpense');
  const [filterPeriod, setFilterPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // State để lưu trữ tất cả dữ liệu thống kê, có thể chia nhỏ theo tab
  const [statisticsData, setStatisticsData] = useState({
    revenueExpense: null, // Dữ liệu cho tab Tổng thu chi
    ranking: null,        // Dữ liệu cho tab Bảng xếp hạng
    trends: null          // Dữ liệu cho tab Xu hướng
  });
  const [loading, setLoading] = useState(true);

  // Hàm giả lập fetch API
  const fetchStatisticsData = async (period, month, year, tab) => {
    console.log(`Fetching data for: ${tab}, Period: ${period}, Month: ${month}, Year: ${year}`);
    setLoading(true);
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Dữ liệu mẫu cho từng tab (bạn sẽ thay thế bằng API call thực tế)
    const MOCK_DATA = {
      revenueExpense: { /* ... dữ liệu từ MOCK_STATS_DATA_MONTHLY trước đó ... */
        revenueBreakdown: { tickets: { percentage: 38.4, amount: 1170000, trend: 250.00 }, products: { percentage: 61.6, amount: 1875000, trend: 180.50 }},
        expenseBreakdown: { products: { percentage: 100, amount: 1550000, trend: 63.00 }, repairs: { percentage: 0, amount: 0, trend: 0 }},
        totalRevenue: 3225000, totalExpense: 1550000,
        summary: { periodType: 'Theo tháng', timeframe: `Tháng ${month}/${year}`, invoiceCount: 14, profit: 1675000,},
        dailyTrend: { labels: Array.from({ length: 30 }, (_, i) => (i + 1).toString()), revenue: Array.from({length: 30}, () => Math.floor(Math.random() * 1500000)), expense: Array.from({length: 30}, () => Math.floor(Math.random() * 1000000)) }
      },
      ranking: {
        topSpendingCustomers: [
          { stt: 1, name: 'Trần Dương', phone: '09876581234', amount: 1230000 },
          { stt: 2, name: 'Nguyễn Tiến', phone: '0987651234', amount: 735000 },
          { stt: 3, name: 'Nguyễn Tiến Linh', phone: '09876585678', amount: 540000 },
          { stt: 4, name: 'Phong Trần', phone: '09876584566', amount: 360000 },
          { stt: 5, name: 'Đỗ Tiến Đạt', phone: '09876582123', amount: 270000 },
        ],
        topContributingStaff: [
          { stt: 1, id: 'NV002', name: 'Đỗ Thành Đạt', revenue: 2490000 },
          { stt: 2, id: 'NV004', name: 'Lê Hải Phong', revenue: 495000 },
          { stt: 3, id: 'NV005', name: 'Kiều Bá Dương', revenue: 240000 },
          { stt: 4, id: 'NV001', name: 'Nguyễn Văn An', revenue: 180000 },
          { stt: 5, id: 'NV003', name: 'Lê Văn Cường', revenue: 150000 },
        ],
        customerSegments: { new: 60, returning: 40, vip: 0 }, // Tỷ lệ %
        topStaffPerformance: { // Dữ liệu cho biểu đồ tròn nhân viên
            labels: ['NV002', 'NV004', 'NV005', 'Các NV khác'],
            data: [2490000, 495000, 240000, 500000] // Tổng doanh thu của NV002, NV004, NV005, và tổng của các NV còn lại
        },
        filter: { periodType: 'Theo tháng', timeframe: `Tháng ${month}/${year}` } // Để hiển thị trên card
      },
      trends: {
        topMoviesRevenue: [
          { stt: 1, title: 'John Wick: Chapter 4', revenue: 2890000, tickets: 52 },
          { stt: 2, title: 'Bố Già', revenue: 2745000, tickets: 61 },
          { stt: 3, title: 'Thor: Love and Thunder', revenue: 1305000, tickets: 29 },
          { stt: 4, title: 'Mission Impossible', revenue: 855000, tickets: 19 },
          { stt: 5, title: 'Vương triều xác sống', revenue: 675000, tickets: 15 },
        ],
        topProductsRevenue: [
          { stt: 1, name: 'Coca cola', revenue: 2790000, quantity: 62 },
          { stt: 2, name: 'Pepsi không calo', revenue: 2115000, quantity: 47 },
          { stt: 3, name: 'Bánh Chorros', revenue: 1860000, quantity: 35 },
          { stt: 4, name: 'Hạt dẻ', revenue: 1750000, quantity: 62 },
          { stt: 5, name: 'Mực trộn bơ', revenue: 1200000, quantity: 40 },
        ],
        filter: { periodType: 'Theo tháng', timeframe: `Tháng ${month}/${year}` }
      }
    };
    setStatisticsData(prev => ({ ...prev, [tab]: MOCK_DATA[tab] }));
    setLoading(false);
  };

  useEffect(() => {
    // Fetch data cho tab hiện tại khi filter thay đổi hoặc khi tab được chọn lần đầu
    if (activeTab && !statisticsData[activeTab]) {
      fetchStatisticsData(filterPeriod, selectedMonth, selectedYear, activeTab);
    } else if (activeTab) {
      // Nếu muốn refresh data mỗi khi filter thay đổi (kể cả khi đã có data)
      fetchStatisticsData(filterPeriod, selectedMonth, selectedYear, activeTab);
    }
  }, [filterPeriod, selectedMonth, selectedYear, activeTab]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // Không cần fetch ở đây nữa, useEffect sẽ xử lý khi activeTab thay đổi
  };
  
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({ value: currentYear - i, label: (currentYear - i).toString() }));

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
          {/* <option value="daily">Theo ngày</option> */}
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
        {!loading && activeTab === 'revenueExpense' && statisticsData.revenueExpense && (
          <RevenueExpenseTab data={statisticsData.revenueExpense} formatCurrency={formatCurrency} />
        )}
        {!loading && activeTab === 'ranking' && statisticsData.ranking && (
          <RankingTab data={statisticsData.ranking} formatCurrency={formatCurrency} />
        )}
        {!loading && activeTab === 'trends' && statisticsData.trends && (
          <TrendsTab data={statisticsData.trends} formatCurrency={formatCurrency} />
        )}
        {!loading && !statisticsData[activeTab] && (
            <div className="placeholder-tab">Không có dữ liệu cho lựa chọn này.</div>
        )}
      </div>
    </div>
  );
}

export default Statistics;