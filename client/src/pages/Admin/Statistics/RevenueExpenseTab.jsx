// client/src/components/Statistics/RevenueExpenseTab.jsx (hoặc đường dẫn của bạn)

import React from 'react';
import { Line } from 'react-chartjs-2';

// Component này nhận data và hàm formatCurrency từ Statistics.jsx
function RevenueExpenseTab({ data, formatCurrency }) {
  if (!data) return <div className="loading-indicator">Đang tải dữ liệu tổng thu chi...</div>;

  // Helper function để làm tròn và hiển thị phần trăm
  const formatPercentage = (value, decimalPlaces = 2) => {
    if (value === undefined || value === null || isNaN(value)) return '0.00'; // Hoặc 'N/A'
    if (value === Infinity || value === -Infinity) return '∞'; // Hoặc một ký hiệu khác cho vô cực
    return parseFloat(value).toFixed(decimalPlaces);
  };

  const chartData = {
    labels: data.dailyTrend.labels,
    datasets: [
      {
        label: 'Thu',
        data: data.dailyTrend.revenue,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.3, fill: true, pointRadius: 3, pointHoverRadius: 6,
      },
      {
        label: 'Chi',
        data: data.dailyTrend.expense,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.3, fill: true, pointRadius: 3, pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 20,}},
      tooltip: { mode: 'index', intersect: false, callbacks: { label: (context) => `${context.dataset.label || ''}: ${formatCurrency(context.parsed.y)}`}},
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => (value / 1000000) + ' Tr' }, title: { display: true, text: 'Triệu đồng'}},
      x: { grid: { display: false }}
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  // Kiểm tra sự tồn tại của các nested object trước khi truy cập
  const ticketsRevenue = data.revenueBreakdown?.tickets;
  const productsRevenue = data.revenueBreakdown?.products;
  const productsExpense = data.expenseBreakdown?.products;
  const repairsExpense = data.expenseBreakdown?.repairs;
  const equipmentPurchaseExpense = data.expenseBreakdown?.equipmentPurchase;

  return (
    <div className="stats-content-grid">
      <div className="stats-cards-column">
        <div className="stat-card revenue-card">
          <div className="card-header">
            <h4>
              Thu:
              {ticketsRevenue && ticketsRevenue.trend !== undefined && (
                <span className="trend-positive">
                  {formatPercentage(ticketsRevenue.trend, 2)}%
                </span>
              )}
              {ticketsRevenue && productsRevenue && ticketsRevenue.trend !== undefined && productsRevenue.trend !== undefined && " & "} 
              {productsRevenue && productsRevenue.trend !== undefined && (
                <span className="trend-positive">
                  {formatPercentage(productsRevenue.trend, 2)}%
                </span>
              )}
            </h4>
          </div>
          <div className="card-body breakdown-container">
            <div className="breakdown-item">
              <h5>Vé</h5>
              <p className="percentage">{formatPercentage(ticketsRevenue?.percentage, 2)}%</p>
              <p className="amount">{formatCurrency(ticketsRevenue?.amount)}</p>
            </div>
            <div className="breakdown-item">
              <h5>Sản phẩm</h5>
              <p className="percentage">{formatPercentage(productsRevenue?.percentage, 2)}%</p>
              <p className="amount">{formatCurrency(productsRevenue?.amount)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card expense-card">
          <div className="card-header">
            <h4>
              Chi:
              {equipmentPurchaseExpense && equipmentPurchaseExpense.trend !== undefined && (
                <span className="trend-negative">
                  {formatPercentage(equipmentPurchaseExpense.trend, 2)}%
                </span>
              )}
              {/* Dấu & chỉ hiển thị nếu cả hai trend đều có */}
              {equipmentPurchaseExpense?.trend !== undefined && repairsExpense?.trend !== undefined && " & "}
              {repairsExpense && repairsExpense.trend !== undefined && (
                <span className="trend-negative">
                  {formatPercentage(repairsExpense.trend, 2)}%
                </span>
              )}
              {/* (Tùy chọn) Nếu có operationalExpense trend:
              {operationalExpense?.trend !== undefined && (repairsExpense?.trend !== undefined || equipmentPurchaseExpense?.trend !== undefined) && " & "}
              {operationalExpense && operationalExpense.trend !== undefined && (
                <span className="trend-negative">
                  {formatPercentage(operationalExpense.trend, 2)}%
                </span>
              )}
              */}
            </h4>
          </div>
          <div className="card-body breakdown-container">
            {/* <div className="breakdown-item">
              <h5>Sản phẩm</h5>
              <p className="percentage">{formatPercentage(productsExpense?.percentage, 2)}%</p>
              <p className="amount">{formatCurrency(productsExpense?.amount)}</p>
            </div> */}
            <div className="breakdown-item">
              {/* ĐỔI TÊN VÀ LẤY DỮ LIỆU MỚI */}
              <h5>Thiết bị</h5> 
              <p className="percentage">{formatPercentage(equipmentPurchaseExpense?.percentage, 2)}%</p>
              <p className="amount">{formatCurrency(equipmentPurchaseExpense?.amount)}</p>
            </div>
            <div className="breakdown-item">
              <h5>Sửa chữa</h5>
              <p className="percentage">{formatPercentage(repairsExpense?.percentage, 2)}%</p>
              <p className="amount">{formatCurrency(repairsExpense?.amount)}</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card total-rev-exp-card">
            <h4>Tổng thu chi (VND)</h4>
            <div className="progress-item">
                <span>Thu</span>
                <div className="progress-bar-container">
                    <div className="progress-bar revenue-bar" style={{width: `${(data.totalRevenue / (data.totalRevenue + data.totalExpense || 1)) * 100}%`}}></div>
                </div>
                <span>{formatCurrency(data.totalRevenue)}</span>
            </div>
            <div className="progress-item">
                <span>Chi</span>
                <div className="progress-bar-container">
                    <div className="progress-bar expense-bar" style={{width: `${(data.totalExpense / (data.totalRevenue + data.totalExpense || 1)) * 100}%`}}></div>
                </div>
                <span>{formatCurrency(data.totalExpense)}</span>
            </div>
        </div>

        <div className="stat-card summary-card">
             <div className="summary-item"><span>Chu kỳ:</span> <span>{data.summary?.periodType}</span></div>
             <div className="summary-item"><span>Thời gian:</span> <span>{data.summary?.timeframe}</span></div>
             {/* Giả sử invoiceCount có thể không tồn tại, hiển thị N/A nếu không có */}
             <div className="summary-item"><span>Số hoá đơn:</span> <span>{data.summary?.invoiceCount !== undefined ? data.summary.invoiceCount : 'N/A'}</span></div>
             <div className="summary-item profit"><span>Lợi nhuận:</span> <span>{formatCurrency(data.summary?.profit)}</span></div>
        </div>
      </div>

      <div className="stats-chart-column">
        <div className="stat-card chart-card">
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueExpenseTab;