import React from 'react';
import { Doughnut, Pie } from 'react-chartjs-2';
import { CSVLink } from 'react-csv'; // Import CSVLink

function RankingTab({ data, formatCurrency }) {
  if (!data) return <div className="loading-indicator">Đang tải dữ liệu bảng xếp hạng...</div>;

  const customerSegmentData = {
    labels: ['Khách hàng mới', 'Khách hàng cũ', 'Khách VIP'], // Điều chỉnh nếu có VIP
    datasets: [
      {
        label: 'Phân khúc khách hàng',
        data: [data.customerSegments.new, data.customerSegments.returning, data.customerSegments.vip || 0],
        backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
        hoverOffset: 4,
      },
    ],
  };
  const staffPerformanceData = {
    labels: data.topStaffPerformance.labels,
    datasets: [
      {
        label: 'Doanh thu nhân viên',
        data: data.topStaffPerformance.data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverOffset: 4,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { padding: 10, boxWidth: 15 } },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) { label += ': '; }
            if (context.dataset.label?.includes("Doanh thu")) { // Check if it's staff performance
              label += formatCurrency(context.parsed);
            } else { // For customer segments
              label += context.parsed + '%';
            }
            return label;
          }
        }
      }
    },
  };


  // --- Chuẩn bị dữ liệu và headers cho CSV ---

  // 1. Top 5 khách hàng chi tiêu nhiều nhất
  const topSpendingCustomersCSVHeaders = [
    { label: "STT", key: "stt" },
    { label: "Tên khách hàng", key: "name" },
    { label: "Số điện thoại", key: "phone" },
    { label: "Email", key: "email" }, 
    { label: "Ngày sinh", key: "birthDate" }, 
    { label: "Ngày đăng ký thành viên", key: "joinDate" }, 
    { label: "Tổng chi tiêu (VND)", key: "amount" } // Key 'amount' sẽ được format sau
  ];
  const topSpendingCustomersCSVData = data.topSpendingCustomers.map(cust => ({
    ...cust,
    amount: cust.amount // Giữ nguyên số để CSV có thể tính toán, format khi hiển thị
  }));

  // 2. Top 5 nhân viên đóng góp nhiều nhất
  const topContributingStaffCSVHeaders = [
    { label: "STT", key: "stt" },
    { label: "Mã nhân viên", key: "id" },
    { label: "Tên nhân viên", key: "name" },
    { label: "Doanh số đóng góp (VND)", key: "revenue" }
  ];
  const topContributingStaffCSVData = data.topContributingStaff.map(staff => ({
    ...staff,
    revenue: staff.revenue
  }));


  // BM7.2.1: Báo cáo doanh thu khách hàng (dựa trên topSpendingCustomers)
  const customerRevenueReportHeaders = [
    // Giả sử bạn muốn các cột này, có thể cần thêm dữ liệu vào MOCK_DATA hoặc API
    { label: "Tên khách hàng", key: "name" },
    { label: "SĐT", key: "phone" },
    { label: "Email", key: "email" }, 
    { label: "Ngày sinh", key: "birthDate" }, 
    { label: "Ngày đăng ký thành viên", key: "joinDate" },
    { label: "Số tiền đã chi (VND)", key: "amount" }
  ];
  // Bạn cần đảm bảo data.topSpendingCustomers có đủ các trường này, ví dụ:
  const customerRevenueReportData = data.topSpendingCustomers.map(cust => ({
    name: cust.name,
    phone: cust.phone,
    email: cust.email || 'N/A', // Thêm từ dữ liệu gốc
    birthDate: cust.birthDate ? formatDate(cust.birthDate) : 'N/A', // Thêm và format
    joinDate: cust.joinDate ? formatDate(cust.joinDate) : 'N/A', // Thêm và format
    amount: cust.amount
  }));


  return (
    <div className="ranking-tab-container">
      <div className="ranking-filters-info">
        <span>{data.filter.periodType}</span>
        <span>{data.filter.timeframe}</span>
      </div>

      <div className="ranking-grid">
        {/* Card Khách hàng chi tiêu */}
        <div className="stat-card ranking-card">
          <div className="card-header-with-actions">
            <h4>Top 5 khách hàng chi tiêu nhiều nhất</h4>
            <CSVLink
              data={topSpendingCustomersCSVData}
              headers={topSpendingCustomersCSVHeaders}
              filename={`top_5_khach_hang_chi_tieu_${data.filter.timeframe.replace(/\s|\//g, '_')}.csv`}
              className="btn btn-export-csv"
            >
              Xuất báo cáo khách hàng
            </CSVLink>
          </div>

          <div className="ranking-chart-container">
            <Doughnut data={customerSegmentData} options={pieChartOptions} />
          </div>
          <table className="ranking-table">
            <thead>
              <tr><th>STT</th><th>Tên khách hàng</th><th>Số điện thoại</th><th>Email</th><th>Ngày sinh</th><th>Ngày đăng ký thành viên</th><th>Chi tiêu</th></tr>
            </thead>
            <tbody>
              {data.topSpendingCustomers.map(cust => (
                <tr key={cust.stt}>
                  <td>{cust.stt}</td><td>{cust.name}</td><td>{cust.phone}</td><td>{cust.email}</td><td>{cust.birthDate}</td><td>{cust.joinDate}</td><td>{formatCurrency(cust.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          
        </div>

        {/* Card Nhân viên đóng góp */}
        <div className="stat-card ranking-card">
          <div className="card-header-with-actions">
            <h4>Top 5 nhân viên đóng góp nhiều nhất</h4>
            <CSVLink
              data={topContributingStaffCSVData}
              headers={topContributingStaffCSVHeaders}
              filename={`top_5_nhan_vien_dong_gop_${data.filter.timeframe.replace(/\s|\//g, '_')}.csv`}
              className="btn btn-export-csv"
            >
              Xuất báo cáo nhân viên
            </CSVLink>
          </div>
        
          <div className="ranking-chart-container">
             <Pie data={staffPerformanceData} options={pieChartOptions} />
          </div>
          <table className="ranking-table">
            <thead>
              <tr><th>STT</th><th>Mã nhân viên</th><th>Tên nhân viên</th><th>Doanh số</th></tr>
            </thead>
            <tbody>
              {data.topContributingStaff.map(staff => (
                <tr key={staff.stt}>
                  <td>{staff.stt}</td><td>{staff.id}</td><td>{staff.name}</td><td>{formatCurrency(staff.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
// Hàm formatDate cần được import hoặc định nghĩa nếu chưa có
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try { const date = new Date(dateString); return date.toLocaleDateString('vi-VN'); }
  catch (e) { return 'N/A'; }
};

export default RankingTab;