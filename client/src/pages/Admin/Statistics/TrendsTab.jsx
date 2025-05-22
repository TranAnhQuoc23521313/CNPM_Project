import React from 'react';
import { Bar } from 'react-chartjs-2';
import { CSVLink } from 'react-csv'; // Import CSVLink

function TrendsTab({ data, formatCurrency }) {
  if (!data) return <div className="loading-indicator">Đang tải dữ liệu xu hướng...</div>;

  const topMoviesChartData = {
    labels: data.topMoviesRevenue.map(movie => movie.title.length > 20 ? movie.title.substring(0, 17) + '...' : movie.title), // Rút gọn tên phim dài
    datasets: [{
      label: 'Doanh thu phim (VND)',
      data: data.topMoviesRevenue.map(movie => movie.revenue),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  };
  const topProductsChartData = {
    labels: data.topProductsRevenue.map(product => product.name),
    datasets: [{
      label: 'Doanh thu sản phẩm (VND)',
      data: data.topProductsRevenue.map(product => product.revenue),
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
    }]
  };
  const barChartOptions = {
    indexAxis: 'y', // Hiển thị bar ngang để dễ đọc tên nếu nhiều
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Ẩn legend vì đã có title
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label || ''}: ${formatCurrency(context.parsed.x)}`; // x vì indexAxis là y
          }
        }
      }
    },
    scales: {
      x: { // Trục x bây giờ là giá trị
        beginAtZero: true,
        ticks: { callback: (value) => (value / 1000000) + ' Tr' },
        title: { display: true, text: 'Doanh thu (Triệu VND)' }
      },
      y: { // Trục y bây giờ là category
        ticks: { autoSkip: false } // Hiển thị tất cả label
      }
    }
  };


  // --- Chuẩn bị dữ liệu và headers cho CSV ---
  const currentYear = new Date(data.filter.timeframe.split(' ')[1] || new Date().getFullYear()).getFullYear(); // Lấy năm từ timeframe

  // BM7.1.1: Thống kê doanh thu phim
  const movieRevenueReportHeaders = [
    { label: "STT", key: "stt" },
    { label: "Năm", key: "year" },
    { label: "Tên phim", key: "title" },
    { label: "Tổng doanh thu (VND)", key: "revenue" },
    // { label: "Số vé", key: "tickets" } // Thêm nếu biểu mẫu yêu cầu
  ];
  const movieRevenueReportData = data.topMoviesRevenue.map(movie => ({
    stt: movie.stt,
    year: currentYear, // Hoặc lấy từ dữ liệu filter nếu có
    title: movie.title,
    revenue: movie.revenue,
    // tickets: movie.tickets
  }));

  // BM7.1.2: Thống kê doanh thu sản phẩm
  const productRevenueReportHeaders = [
    { label: "STT", key: "stt" },
    { label: "Năm", key: "year" },
    { label: "Tên sản phẩm", key: "name" }, // Đổi "Tên phim" thành "Tên sản phẩm"
    { label: "Tổng doanh thu (VND)", key: "revenue" },
    // { label: "Số lượng", key: "quantity" } // Thêm nếu biểu mẫu yêu cầu
  ];
  const productRevenueReportData = data.topProductsRevenue.map(product => ({
    stt: product.stt,
    year: currentYear, // Hoặc lấy từ dữ liệu filter nếu có
    name: product.name,
    revenue: product.revenue,
    // quantity: product.quantity
  }));

  return (
    <div className="trends-tab-container">
      <div className="trends-filters-info">
        <span>{data.filter.periodType}</span>
        <span>{data.filter.timeframe}</span>
      </div>

      <div className="trends-grid">
        {/* Card Phim doanh thu cao */}
        <div className="stat-card trends-card">
          <div className="card-header-with-actions">
            <h4>Top 5 phim doanh thu cao nhất</h4>
            <CSVLink
              data={movieRevenueReportData}
              headers={movieRevenueReportHeaders}
              filename={`BM7.1.1_Thong_ke_doanh_thu_phim_${data.filter.timeframe.replace(/\s|\//g, '_')}.csv`}
              className="btn btn-export-csv" // Dùng chung class nút export
            >
              Xuất Báo cáo Phim
            </CSVLink>
          </div>
          <div className="trends-chart-container">
            <Bar data={topMoviesChartData} options={barChartOptions} />
          </div>
          <table className="ranking-table"> {/* Tái sử dụng class table */}
            <thead>
              <tr><th>STT</th><th>Tên phim</th><th>Doanh thu</th><th>Số vé</th></tr>
            </thead>
            <tbody>
              {data.topMoviesRevenue.map(movie => (
                <tr key={movie.stt}>
                  <td>{movie.stt}</td><td>{movie.title}</td><td>{formatCurrency(movie.revenue)}</td><td>{movie.tickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Sản phẩm doanh thu cao */}
        <div className="stat-card trends-card">
          <div className="card-header-with-actions">
            <h4>Top 5 sản phẩm doanh thu cao nhất</h4>
            <CSVLink
              data={productRevenueReportData}
              headers={productRevenueReportHeaders}
              filename={`BM7.1.2_Thong_ke_doanh_thu_SP_${data.filter.timeframe.replace(/\s|\//g, '_')}.csv`}
              className="btn btn-export-csv" // Dùng chung class nút export
            >
              Xuất Báo cáo Sản phẩm
            </CSVLink>
          </div>
          <div className="trends-chart-container">
            <Bar data={topProductsChartData} options={barChartOptions} />
          </div>
          <table className="ranking-table">
            <thead>
              <tr><th>STT</th><th>Tên sản phẩm</th><th>Doanh thu</th><th>Số lượng</th></tr>
            </thead>
            <tbody>
              {data.topProductsRevenue.map(product => (
                <tr key={product.stt}>
                  <td>{product.stt}</td><td>{product.name}</td><td>{formatCurrency(product.revenue)}</td><td>{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TrendsTab;