// server/services/statisticsService.js
const StatisticsRepository = require('../repositories/statisticsRepository');
const { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, subMonths, subYears } = require('date-fns');

class StatisticsService {

    _getDateRange(period, year, month) {
        let startDate, endDate;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        year = parseInt(year) || currentYear;
        month = parseInt(month) || currentMonth;

        if (period === 'monthly') {
            const date = new Date(year, month - 1, 1);
            startDate = format(startOfMonth(date), 'yyyy-MM-dd');
            endDate = format(endOfMonth(date), 'yyyy-MM-dd');
        } else if (period === 'yearly') {
            const date = new Date(year, 0, 1);
            startDate = format(startOfYear(date), 'yyyy-MM-dd');
            endDate = format(endOfYear(date), 'yyyy-MM-dd');
        } else {
            const now = new Date();
            startDate = format(startOfMonth(now), 'yyyy-MM-dd');
            endDate = format(endOfMonth(now), 'yyyy-MM-dd');
        }
        return { startDate, endDate };
    }

    _getPreviousDateRange(currentStartDate, currentEndDate, period) {
        const startDateObj = parseISO(currentStartDate);
        let prevStartDate, prevEndDate;

        if (period === 'monthly') {
            const prevMonthDate = subMonths(startDateObj, 1);
            prevStartDate = format(startOfMonth(prevMonthDate), 'yyyy-MM-dd');
            prevEndDate = format(endOfMonth(prevMonthDate), 'yyyy-MM-dd');
        } else if (period === 'yearly') {
            const prevYearDate = subYears(startDateObj, 1);
            prevStartDate = format(startOfYear(prevYearDate), 'yyyy-MM-dd');
            prevEndDate = format(endOfYear(prevYearDate), 'yyyy-MM-dd');
        } else {
            return { prevStartDate: null, prevEndDate: null };
        }
        return { prevStartDate, prevEndDate };
    }

    _calculateTrend(currentValue, previousValue) {
        currentValue = parseFloat(currentValue) || 0;
        previousValue = parseFloat(previousValue) || 0;

        if (previousValue === 0) {
            return currentValue > 0 ? Infinity : 0;
        }
        return ((currentValue - previousValue) / previousValue) * 100;
    }

    async getRevenueExpenseData(period, year, month) {
        const { startDate, endDate } = this._getDateRange(period, year, month);
        const { prevStartDate, prevEndDate } = this._getPreviousDateRange(startDate, endDate, period);

        try {
            // 1. Fetch dữ liệu tổng quan cho kỳ hiện tại và kỳ trước
            const overviewCurrent = await StatisticsRepository.getRevenueExpenseOverview(startDate, endDate);
            const invoiceCountCurrent = await StatisticsRepository.getInvoiceCount(startDate, endDate);

            let overviewPrevious = { totalRevenue: 0, totalTicketRevenue: 0, totalProductRevenue: 0, totalOperationalCost: 0, totalRepairCost: 0, totalEquipmentPurchaseCost: 0 };
            if (prevStartDate && prevEndDate) {
                overviewPrevious = await StatisticsRepository.getRevenueExpenseOverview(prevStartDate, prevEndDate);
            }

            // 2. Tính toán các giá trị tổng từ overview
            const totalRevenueCurrent = parseFloat(overviewCurrent.totalRevenue) || 0;
            const totalTicketRevenueCurrent = parseFloat(overviewCurrent.totalTicketRevenue) || 0;
            const totalProductRevenueCurrent = parseFloat(overviewCurrent.totalProductRevenue) || 0;
            
            // CHI PHÍ KỲ HIỆN TẠI
            const totalOperationalCostCurrent = parseFloat(overviewCurrent.totalOperationalCost) || 0; // Chi phí từ GIAODICH_NOIBO
            const totalRepairCostCurrent = parseFloat(overviewCurrent.totalRepairCost) || 0;           // Chi phí sửa chữa
            const totalEquipmentPurchaseCostCurrent = parseFloat(overviewCurrent.totalEquipmentPurchaseCost) || 0; // Chi phí mua thiết bị mới
            
            // Tổng chi phí kỳ hiện tại
            const totalExpenseCurrent = totalOperationalCostCurrent + totalRepairCostCurrent + totalEquipmentPurchaseCostCurrent;

            // CHI PHÍ KỲ TRƯỚC (để tính trend)
            const totalOperationalCostPrevious = parseFloat(overviewPrevious.totalOperationalCost) || 0;
            const totalRepairCostPrevious = parseFloat(overviewPrevious.totalRepairCost) || 0;
            const totalEquipmentPurchaseCostPrevious = parseFloat(overviewPrevious.totalEquipmentPurchaseCost) || 0;
            
            // Trend cho doanh thu
            const ticketRevenueTrend = this._calculateTrend(totalTicketRevenueCurrent, parseFloat(overviewPrevious.totalTicketRevenue) || 0);
            const productRevenueTrend = this._calculateTrend(totalProductRevenueCurrent, parseFloat(overviewPrevious.totalProductRevenue) || 0);

            // Trend cho chi phí
            const equipmentPurchaseCostTrend = this._calculateTrend(totalEquipmentPurchaseCostCurrent, totalEquipmentPurchaseCostPrevious);
            const repairCostTrend = this._calculateTrend(totalRepairCostCurrent, totalRepairCostPrevious);
            const operationalCostTrend = this._calculateTrend(totalOperationalCostCurrent, totalOperationalCostPrevious);


            // 3. Fetch và xử lý dữ liệu trend hàng ngày/hàng tháng (dailyTrend)
            // ... (Phần này giữ nguyên như phiên bản hoàn chỉnh trước, đảm bảo labels, revenueTrendData, expenseTrendData được tính đúng)
            const dailyRevenueRaw = await StatisticsRepository.getDailyRevenueTrend(startDate, endDate);
            const dailyExpenseRaw = await StatisticsRepository.getDailyExpenseTrend(startDate, endDate); // Nhớ rằng dailyExpenseRaw chứa {operational, repair, purchase}

            let labels;
            const revenueTrendData = [];
            const expenseTrendData = []; // Tổng chi phí cho biểu đồ

            if (period === 'monthly') {
                const intervalDays = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
                labels = intervalDays.map(day => format(day, 'd'));
                
                const tempRevenueMap = new Map();
                dailyRevenueRaw.forEach(item => { /* ... xử lý item.date và push vào tempRevenueMap ... */ 
                    let dateObject;
                    if (typeof item.date === 'string') dateObject = parseISO(item.date);
                    else if (item.date instanceof Date) dateObject = item.date;
                    else return;
                    tempRevenueMap.set(format(dateObject, 'd'), parseFloat(item.dailyRevenue) || 0);
                });
                labels.forEach(label => revenueTrendData.push(tempRevenueMap.get(label) || 0));

                const tempExpenseMap = new Map();
                const processExpenseItemsForChart = (items) => { // Gộp tất cả chi phí cho biểu đồ
                    items.forEach(item => {
                        let dateObject;
                        if (typeof item.date === 'string') dateObject = parseISO(item.date);
                        else if (item.date instanceof Date) dateObject = item.date;
                        else return;
                        const dayLabel = format(dateObject, 'd');
                        tempExpenseMap.set(dayLabel, (tempExpenseMap.get(dayLabel) || 0) + (parseFloat(item.dailyExpense) || 0));
                    });
                };
                processExpenseItemsForChart(dailyExpenseRaw.operational);
                processExpenseItemsForChart(dailyExpenseRaw.repair);
                processExpenseItemsForChart(dailyExpenseRaw.purchase); // Chi phí mua thiết bị cũng góp vào tổng chi trên biểu đồ
                labels.forEach(label => expenseTrendData.push(tempExpenseMap.get(label) || 0));

            } else if (period === 'yearly') {
                labels = Array.from({ length: 12 }, (_, i) => format(new Date(year, i, 1), 'MMM'));
                const monthlyRevenue = new Array(12).fill(0);
                const monthlyExpense = new Array(12).fill(0); // Tổng chi phí hàng tháng

                dailyRevenueRaw.forEach(item => { /* ... */ 
                    let dateObject;
                    if (typeof item.date === 'string') dateObject = parseISO(item.date);
                    else if (item.date instanceof Date) dateObject = item.date;
                    else return;
                    monthlyRevenue[dateObject.getMonth()] += (parseFloat(item.dailyRevenue) || 0);
                });
                revenueTrendData.push(...monthlyRevenue);

                const processExpenseItemsYearlyForChart = (items) => {
                    items.forEach(item => {
                        let dateObject;
                        if (typeof item.date === 'string') dateObject = parseISO(item.date);
                        else if (item.date instanceof Date) dateObject = item.date;
                        else return;
                        monthlyExpense[dateObject.getMonth()] += (parseFloat(item.dailyExpense) || 0);
                    });
                };
                processExpenseItemsYearlyForChart(dailyExpenseRaw.operational);
                processExpenseItemsYearlyForChart(dailyExpenseRaw.repair);
                processExpenseItemsYearlyForChart(dailyExpenseRaw.purchase);
                expenseTrendData.push(...monthlyExpense);
            }


            // 4. Chuẩn bị dữ liệu trả về
            const timeframeDisplay = period === 'monthly' ? `Tháng ${month}/${year}` : `Năm ${year}`;
            const periodTypeDisplay = period === 'monthly' ? 'Theo tháng' : 'Theo năm';

            return {
                revenueBreakdown: {
                    tickets: {
                        percentage: totalRevenueCurrent > 0 ? (totalTicketRevenueCurrent / totalRevenueCurrent * 100) : 0,
                        amount: totalTicketRevenueCurrent,
                        trend: ticketRevenueTrend
                    },
                    products: {
                        percentage: totalRevenueCurrent > 0 ? (totalProductRevenueCurrent / totalRevenueCurrent * 100) : 0,
                        amount: totalProductRevenueCurrent,
                        trend: productRevenueTrend
                    }
                },
                expenseBreakdown: {
                    // Mục 1: Chi phí THIẾT BỊ (mua mới)
                    equipmentPurchase: {
                        percentage: totalExpenseCurrent > 0 ? (totalEquipmentPurchaseCostCurrent / totalExpenseCurrent * 100) : 0,
                        amount: totalEquipmentPurchaseCostCurrent,
                        trend: equipmentPurchaseCostTrend
                    },
                    // Mục 2: Chi phí SỬA CHỮA
                    repairs: {
                        percentage: totalExpenseCurrent > 0 ? (totalRepairCostCurrent / totalExpenseCurrent * 100) : 0,
                        amount: totalRepairCostCurrent,
                        trend: repairCostTrend
                    },
                    // (Tùy chọn) Mục 3: Chi phí VẬN HÀNH (từ GIAODICH_NOIBO)
                    // Nếu bạn muốn hiển thị riêng, bỏ comment đoạn này
                    /* 
                    operational: {
                        percentage: totalExpenseCurrent > 0 ? (totalOperationalCostCurrent / totalExpenseCurrent * 100) : 0,
                        amount: totalOperationalCostCurrent,
                        trend: operationalCostTrend
                    }
                    */
                },
                totalRevenue: totalRevenueCurrent,
                totalExpense: totalExpenseCurrent, // Đã bao gồm cả chi phí mua thiết bị
                summary: {
                    periodType: periodTypeDisplay,
                    timeframe: timeframeDisplay,
                    invoiceCount: invoiceCountCurrent,
                    profit: totalRevenueCurrent - totalExpenseCurrent,
                },
                dailyTrend: { 
                    labels: labels,
                    revenue: revenueTrendData,
                    expense: expenseTrendData // expenseTrendData này là tổng chi phí
                }
            };

        } catch (error) {
            console.error('Error in StatisticsService.getRevenueExpenseData:', error);
            throw error;
        }
    }

    async getRankingData(period, year, month) {
        const { startDate, endDate } = this._getDateRange(period, year, month);
        const timeframeDisplay = period === 'monthly' ? `Tháng ${month}/${year}` : `Năm ${year}`;
        const periodTypeDisplay = period === 'monthly' ? 'Theo tháng' : 'Theo năm';

        try {
            const topCustomersRaw = await StatisticsRepository.getTopSpendingCustomers(startDate, endDate, 5);
            const topStaffRaw = await StatisticsRepository.getTopContributingStaff(startDate, endDate, 5);
            const segments = await StatisticsRepository.getCustomerSegments(startDate, endDate, 5000000);

            const topSpendingCustomers = topCustomersRaw.map((cust, index) => {
                let birthDateFormatted = 'N/A', joinDateFormatted = 'N/A';
                if (cust.NGAYSINH) {
                    const dateObj = (typeof cust.NGAYSINH === 'string') ? parseISO(cust.NGAYSINH) : cust.NGAYSINH;
                    if (dateObj instanceof Date && !isNaN(dateObj)) birthDateFormatted = format(dateObj, 'dd/MM/yyyy');
                }
                if (cust.NGAYDKTV) {
                    const dateObj = (typeof cust.NGAYDKTV === 'string') ? parseISO(cust.NGAYDKTV) : cust.NGAYDKTV;
                    if (dateObj instanceof Date && !isNaN(dateObj)) joinDateFormatted = format(dateObj, 'dd/MM/yyyy');
                }
                return {
                    stt: index + 1, name: cust.HOTEN, phone: cust.SODT, email: cust.EMAIL,
                    birthDate: birthDateFormatted, joinDate: joinDateFormatted,
                    amount: parseFloat(cust.totalAmountSpent) || 0
                };
            });

            const topContributingStaff = topStaffRaw.map((staff, index) => ({
                stt: index + 1, id: staff.MANV, name: staff.TENNV,
                revenue: parseFloat(staff.totalRevenueGenerated) || 0
            }));

            let staffPerformanceChartLabels = [];
            let staffPerformanceChartData = [];
            const topNStaffForChart = 3;
            if (topStaffRaw.length > 0) {
                 topStaffRaw.slice(0, topNStaffForChart).forEach(staff => {
                    staffPerformanceChartLabels.push(`${staff.TENNV} (${staff.MANV})`);
                    staffPerformanceChartData.push(parseFloat(staff.totalRevenueGenerated) || 0);
                });
                if (topStaffRaw.length > topNStaffForChart) {
                    const otherStaffRevenue = topStaffRaw.slice(topNStaffForChart)
                                              .reduce((sum, staff) => sum + (parseFloat(staff.totalRevenueGenerated) || 0), 0);
                    if (otherStaffRevenue > 0) {
                        staffPerformanceChartLabels.push('Các NV khác');
                        staffPerformanceChartData.push(otherStaffRevenue);
                    }
                }
            }

            return {
                topSpendingCustomers,
                topContributingStaff,
                customerSegments: {
                    new: segments.newCustomers,
                    returning: segments.returningCustomers,
                    vip: segments.vipCustomers
                },
                topStaffPerformance: {
                    labels: staffPerformanceChartLabels,
                    data: staffPerformanceChartData
                },
                filter: { periodType: periodTypeDisplay, timeframe: timeframeDisplay }
            };
        } catch (error) {
            console.error('Error in StatisticsService.getRankingData:', error);
            throw error;
        }
    }

    async getTrendsData(period, year, month) {
        const { startDate, endDate } = this._getDateRange(period, year, month);
        const timeframeDisplay = period === 'monthly' ? `Tháng ${month}/${year}` : `Năm ${year}`;
        const periodTypeDisplay = period === 'monthly' ? 'Theo tháng' : 'Theo năm';

        try {
            const topMoviesRaw = await StatisticsRepository.getTopMoviesByRevenue(startDate, endDate, 5);
            const topProductsRaw = await StatisticsRepository.getTopProductsByRevenue(startDate, endDate, 5);

            const topMoviesRevenue = topMoviesRaw.map((movie, index) => ({
                stt: index + 1, title: movie.TENPHIM,
                revenue: parseFloat(movie.totalRevenue) || 0,
                tickets: parseInt(movie.totalTicketsSold) || 0
            }));

            const topProductsRevenue = topProductsRaw.map((product, index) => ({
                stt: index + 1, name: product.TENSP,
                revenue: parseFloat(product.totalRevenue) || 0,
                quantity: parseInt(product.totalQuantitySold) || 0
            }));

            return {
                topMoviesRevenue,
                topProductsRevenue,
                filter: { periodType: periodTypeDisplay, timeframe: timeframeDisplay }
            };
        } catch (error) {
            console.error('Error in StatisticsService.getTrendsData:', error);
            throw error;
        }
    }
}

module.exports = new StatisticsService();