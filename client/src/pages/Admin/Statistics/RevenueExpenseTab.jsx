import React from 'react';
import { Line } from 'react-chartjs-2';

// Component này nhận data và hàm formatCurrency từ Statistics.jsx
function RevenueExpenseTab({ data, formatCurrency }) {
  if (!data) return <div className="loading-indicator">Đang tải dữ liệu tổng thu chi...</div>;

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

  return (
    <div className="stats-content-grid">
      <div className="stats-cards-column">
        <div className="stat-card revenue-card">
          <div className="card-header">
            <h4>Thu: 
                <span className="trend-positive">{data.revenueBreakdown.tickets.trend?.toFixed(2)}%</span> & 
                <span className="trend-positive">{data.revenueBreakdown.products.trend?.toFixed(2)}%</span>
            </h4>
          </div>
          <div className="card-body breakdown-container">
            <div className="breakdown-item">
              <h5>Vé</h5>
              <p className="percentage">{data.revenueBreakdown.tickets.percentage}%</p>
              <p className="amount">{formatCurrency(data.revenueBreakdown.tickets.amount)}</p>
            </div>
            <div className="breakdown-item">
              <h5>Sản phẩm</h5>
              <p className="percentage">{data.revenueBreakdown.products.percentage}%</p>
              <p className="amount">{formatCurrency(data.revenueBreakdown.products.amount)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card expense-card">
          <div className="card-header">
            <h4>Chi: <span className="trend-negative">{data.expenseBreakdown.products.trend?.toFixed(2)}%</span></h4>
          </div>
          <div className="card-body breakdown-container">
            <div className="breakdown-item">
              <h5>Sản phẩm</h5>
              <p className="percentage">{data.expenseBreakdown.products.percentage}%</p>
              <p className="amount">{formatCurrency(data.expenseBreakdown.products.amount)}</p>
            </div>
            <div className="breakdown-item">
              <h5>Sửa chữa</h5>
              <p className="percentage">{data.expenseBreakdown.repairs.percentage}%</p>
              <p className="amount">{formatCurrency(data.expenseBreakdown.repairs.amount)}</p>
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
             <div className="summary-item"><span>Chu kỳ:</span> <span>{data.summary.periodType}</span></div>
             <div className="summary-item"><span>Thời gian:</span> <span>{data.summary.timeframe}</span></div>
             <div className="summary-item"><span>Số hoá đơn:</span> <span>{data.summary.invoiceCount}</span></div>
             <div className="summary-item profit"><span>Lợi nhuận:</span> <span>{formatCurrency(data.summary.profit)}</span></div>
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