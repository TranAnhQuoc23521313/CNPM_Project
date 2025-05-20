import React from 'react';
import { Doughnut, Pie } from 'react-chartjs-2'; // Sử dụng Doughnut hoặc Pie

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
              label: function(context) {
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


  return (
    <div className="ranking-tab-container">
      <div className="ranking-filters-info">
        <span>{data.filter.periodType}</span>
        <span>{data.filter.timeframe}</span>
      </div>

      <div className="ranking-grid">
        {/* Card Khách hàng chi tiêu */}
        <div className="stat-card ranking-card">
          <h4>Top 5 khách hàng chi tiêu nhiều nhất</h4>
          <div className="ranking-chart-container">
            <Doughnut data={customerSegmentData} options={pieChartOptions} />
          </div>
          <table className="ranking-table">
            <thead>
              <tr><th>STT</th><th>Tên khách hàng</th><th>Số điện thoại</th><th>Chi tiêu</th></tr>
            </thead>
            <tbody>
              {data.topSpendingCustomers.map(cust => (
                <tr key={cust.stt}>
                  <td>{cust.stt}</td><td>{cust.name}</td><td>{cust.phone}</td><td>{formatCurrency(cust.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Nhân viên đóng góp */}
        <div className="stat-card ranking-card">
          <h4>Top 5 nhân viên đóng góp nhiều nhất</h4>
          <div className="ranking-chart-container">
             {/* Giả sử bạn có một biểu đồ cho nhân viên, ví dụ Pie */}
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

export default RankingTab;