// server/repositories/statisticsRepository.js
const pool = require('../config/db'); // Giả sử bạn có file config db tương tự

class StatisticsRepository {

    /**
     * Lấy dữ liệu tổng quan về doanh thu và chi phí trong một khoảng thời gian.
     * @param {string} startDate - Định dạng 'YYYY-MM-DD'
     * @param {string} endDate - Định dạng 'YYYY-MM-DD'
     * @returns {Promise<object>} - { totalRevenue, totalTicketRevenue, totalProductRevenue, totalOperationalCost, totalRepairCost }
     */
    async getRevenueExpenseOverview(startDate, endDate) {
        try {
            // 1. Tổng doanh thu từ hóa đơn
            const [revenueRows] = await pool.query(
                `SELECT 
                    SUM(CASE WHEN hd.TRANGTHAITHANHTOAN = 'Đã thanh toán' THEN hd.TONGTIEN ELSE 0 END) as totalRevenue
                 FROM HOADON hd
                 WHERE hd.NGAYTAOHD BETWEEN ? AND ?`,
                [startDate, endDate]
            );
            const totalRevenue = revenueRows[0]?.totalRevenue || 0;

            // 2. Doanh thu từ vé
            const [ticketRevenueRows] = await pool.query(
                `SELECT SUM(v.GIABAN) as totalTicketRevenue
                 FROM VE v
                 JOIN HOADON hd ON v.MAHOADON = hd.MAHOADON
                 WHERE hd.TRANGTHAITHANHTOAN = 'Đã thanh toán' AND v.TRANGTHAIVE = 'Đã bán'
                   AND hd.NGAYTAOHD BETWEEN ? AND ?`,
                [startDate, endDate]
            );
            const totalTicketRevenue = ticketRevenueRows[0]?.totalTicketRevenue || 0;

            // 3. Doanh thu từ sản phẩm khác
            const [productRevenueRows] = await pool.query(
                `SELECT SUM(ct.THANHTIEN) as totalProductRevenue
                 FROM CHITIETHOADON_SANPHAMKHAC ct
                 JOIN HOADON hd ON ct.MAHOADON = hd.MAHOADON
                 WHERE hd.TRANGTHAITHANHTOAN = 'Đã thanh toán'
                   AND hd.NGAYTAOHD BETWEEN ? AND ?`,
                [startDate, endDate]
            );
            const totalProductRevenue = productRevenueRows[0]?.totalProductRevenue || 0;

            // 4. Chi phí hoạt động từ GIAODICH_NOIBO (ví dụ: PHANLOAI là 'Chi phí vận hành', 'Chi phí nhập hàng')
            // Bạn cần định nghĩa rõ các PHANLOAI nào được tính là chi phí
            const [operationalCostRows] = await pool.query(
                `SELECT SUM(SOTIEN) as totalOperationalCost
                 FROM GIAODICH_NOIBO
                 WHERE PHANLOAI IN ('Chi phí nhập hàng', 'Chi phí vận hành', 'Chi lương') -- Ví dụ
                   AND NGAYGIAODICH BETWEEN ? AND ?`,
                [startDate, endDate]
            );
            const totalOperationalCost = operationalCostRows[0]?.totalOperationalCost || 0;

            // 5. Chi phí sửa chữa thiết bị
            const [repairCostRows] = await pool.query(
                `SELECT SUM(CHIPHI) as totalRepairCost
                 FROM THIETBI_SUACHUA
                 WHERE NGAYSUACHUA BETWEEN ? AND ?`,
                [startDate, endDate]
            );
            const totalRepairCost = repairCostRows[0]?.totalRepairCost || 0;
            
            // (Tùy chọn) Chi phí mua thiết bị mới
            const [equipmentPurchaseCostRows] = await pool.query(
                `SELECT SUM(GIA) as totalEquipmentPurchaseCost
                 FROM THIETBI
                 WHERE NGAYMUA BETWEEN ? AND ?`,
                [startDate, endDate]
            );
            const totalEquipmentPurchaseCost = equipmentPurchaseCostRows[0]?.totalEquipmentPurchaseCost || 0;


            return {
                totalRevenue,
                totalTicketRevenue,
                totalProductRevenue,
                totalOperationalCost, // Chi phí từ giao dịch nội bộ
                totalRepairCost,      // Chi phí sửa chữa
                totalEquipmentPurchaseCost // Chi phí mua thiết bị
            };
        } catch (error) {
            console.error('Error in StatisticsRepository.getRevenueExpenseOverview:', error);
            throw error;
        }
    }

    /**
     * Lấy dữ liệu doanh thu hàng ngày trong một khoảng thời gian.
     * @param {string} startDate - Định dạng 'YYYY-MM-DD'
     * @param {string} endDate - Định dạng 'YYYY-MM-DD'
     * @returns {Promise<Array<object>>} - [{ date, revenue, expense }, ...]
     */
    async getDailyRevenueTrend(startDate, endDate) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    DATE(hd.NGAYTAOHD) as date, 
                    SUM(hd.TONGTIEN) as dailyRevenue
                 FROM HOADON hd
                 WHERE hd.TRANGTHAITHANHTOAN = 'Đã thanh toán'
                   AND hd.NGAYTAOHD BETWEEN ? AND ?
                 GROUP BY DATE(hd.NGAYTAOHD)
                 ORDER BY date ASC`,
                [startDate, endDate]
            );
            return rows;
        } catch (error) {
            console.error('Error in StatisticsRepository.getDailyRevenueTrend:', error);
            throw error;
        }
    }

    async getDailyExpenseTrend(startDate, endDate) {
         try {
            // Chi phí từ giao dịch nội bộ
            const [opCosts] = await pool.query(
                `SELECT 
                    DATE(NGAYGIAODICH) as date, 
                    SUM(SOTIEN) as dailyExpense
                 FROM GIAODICH_NOIBO
                 WHERE PHANLOAI IN ('Chi phí nhập hàng', 'Chi phí vận hành', 'Chi lương') -- Cần định nghĩa các loại chi phí
                   AND NGAYGIAODICH BETWEEN ? AND ?
                 GROUP BY DATE(NGAYGIAODICH)
                 ORDER BY date ASC`,
                [startDate, endDate]
            );

            // Chi phí từ sửa chữa thiết bị
            const [repairCosts] = await pool.query(
                `SELECT 
                    DATE(NGAYSUACHUA) as date, 
                    SUM(CHIPHI) as dailyExpense
                 FROM THIETBI_SUACHUA
                 WHERE NGAYSUACHUA BETWEEN ? AND ?
                 GROUP BY DATE(NGAYSUACHUA)
                 ORDER BY date ASC`,
                [startDate, endDate]
            );
            
            // Chi phí mua thiết bị
            const [purchaseCosts] = await pool.query(
                `SELECT
                    DATE(NGAYMUA) as date,
                    SUM(GIA) as dailyExpense
                 FROM THIETBI
                 WHERE NGAYMUA BETWEEN ? AND ?
                 GROUP BY DATE(NGAYMUA)
                 ORDER BY date ASC`,
                [startDate, endDate]
            );

            // Gộp các kết quả lại (cần xử lý ở service để cộng dồn theo ngày)
            return { operational: opCosts, repair: repairCosts, purchase: purchaseCosts };
        } catch (error) {
            console.error('Error in StatisticsRepository.getDailyExpenseTrend:', error);
            throw error;
        }
    }


    /**
     * Lấy top N khách hàng chi tiêu nhiều nhất.
     * @param {string} startDate - Định dạng 'YYYY-MM-DD'
     * @param {string} endDate - Định dạng 'YYYY-MM-DD'
     * @param {number} limit - Số lượng khách hàng cần lấy
     * @returns {Promise<Array<object>>}
     */
    async getTopSpendingCustomers(startDate, endDate, limit = 5) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    kh.MAKH, kh.HOTEN, kh.SODT, kh.EMAIL, kh.NGAYSINH, kh.NGAYDKTV,
                    SUM(hd.TONGTIEN) as totalAmountSpent
                 FROM KHACHHANG kh
                 JOIN HOADON hd ON kh.MAKH = hd.MAKH
                 WHERE hd.TRANGTHAITHANHTOAN = 'Đã thanh toán'
                   AND hd.NGAYTAOHD BETWEEN ? AND ?
                 GROUP BY kh.MAKH, kh.HOTEN, kh.SODT, kh.EMAIL, kh.NGAYSINH, kh.NGAYDKTV
                 ORDER BY totalAmountSpent DESC
                 LIMIT ?`,
                [startDate, endDate, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error in StatisticsRepository.getTopSpendingCustomers:', error);
            throw error;
        }
    }

    /**
     * Đếm số lượng khách hàng mới, cũ, VIP (đơn giản hóa dựa trên tổng chi tiêu)
     * @param {string} startDate - Định dạng 'YYYY-MM-DD' của kỳ báo cáo
     * @param {string} endDate - Định dạng 'YYYY-MM-DD' của kỳ báo cáo
     * @param {number} vipThreshold - Ngưỡng chi tiêu để thành VIP (ví dụ: 5000000)
     * @returns {Promise<object>} - { newCustomers, returningCustomers, vipCustomers }
     */
    async getCustomerSegments(startDate, endDate, vipThreshold = 5000000) {
        try {
            // Khách hàng có giao dịch trong kỳ này
            const [activeCustomersInPeriod] = await pool.query(
                `SELECT DISTINCT
                    kh.MAKH,
                    kh.NGAYDKTV,
                    kh.SOTIENDACHI 
                 FROM KHACHHANG kh
                 JOIN HOADON hd ON kh.MAKH = hd.MAKH
                 WHERE hd.TRANGTHAITHANHTOAN = 'Đã thanh toán'
                   AND hd.NGAYTAOHD BETWEEN ? AND ?`,
                [startDate, endDate]
            );

            let newCustomers = 0;
            let returningCustomers = 0; // Khách hàng cũ có giao dịch trong kỳ
            let vipCustomers = 0;       // VIP có giao dịch trong kỳ

            activeCustomersInPeriod.forEach(cust => {
                // Nếu ngày đăng ký trong kỳ => Khách hàng mới (trong kỳ này)
                if (cust.NGAYDKTV >= new Date(startDate) && cust.NGAYDKTV <= new Date(endDate)) {
                    newCustomers++;
                } else {
                // Nếu ngày đăng ký trước kỳ và có giao dịch trong kỳ => Khách hàng cũ quay lại
                    returningCustomers++;
                }
                // Đếm VIP dựa trên tổng chi tiêu từ trước đến nay (SOTIENDACHI)
                // của những khách hàng có giao dịch trong kỳ
                if (cust.SOTIENDACHI >= vipThreshold) {
                    vipCustomers++;
                }
            });
            
            // Cách khác để tính VIP:
            // const [vipCountRows] = await pool.query(
            //     `SELECT COUNT(DISTINCT kh.MAKH) as vipCustomerCount
            //      FROM KHACHHANG kh
            //      JOIN HOADON hd ON kh.MAKH = hd.MAKH
            //      WHERE hd.TRANGTHAITHANHTOAN = 'Đã thanh toán'
            //        AND hd.NGAYTAOHD BETWEEN ? AND ?
            //        AND kh.SOTIENDACHI >= ?`,
            //     [startDate, endDate, vipThreshold]
            // );
            // const vipCustomers = vipCountRows[0]?.vipCustomerCount || 0;


            return { newCustomers, returningCustomers, vipCustomers };
        } catch (error) {
            console.error('Error in StatisticsRepository.getCustomerSegments:', error);
            throw error;
        }
    }


    /**
     * Lấy top N nhân viên đóng góp doanh thu nhiều nhất.
     * @param {string} startDate - Định dạng 'YYYY-MM-DD'
     * @param {string} endDate - Định dạng 'YYYY-MM-DD'
     * @param {number} limit - Số lượng nhân viên cần lấy
     * @returns {Promise<Array<object>>}
     */
    async getTopContributingStaff(startDate, endDate, limit = 5) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    nv.MANV, nv.TENNV,
                    SUM(hd.TONGTIEN) as totalRevenueGenerated
                 FROM NHANVIEN nv
                 JOIN HOADON hd ON nv.MANV = hd.MANV
                 WHERE hd.TRANGTHAITHANHTOAN = 'Đã thanh toán'
                   AND hd.NGAYTAOHD BETWEEN ? AND ?
                 GROUP BY nv.MANV, nv.TENNV
                 ORDER BY totalRevenueGenerated DESC
                 LIMIT ?`,
                [startDate, endDate, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error in StatisticsRepository.getTopContributingStaff:', error);
            throw error;
        }
    }

    /**
     * Lấy top N phim có doanh thu cao nhất.
     * @param {string} startDate - Định dạng 'YYYY-MM-DD'
     * @param {string} endDate - Định dạng 'YYYY-MM-DD'
     * @param {number} limit - Số lượng phim cần lấy
     * @returns {Promise<Array<object>>}
     */
    async getTopMoviesByRevenue(startDate, endDate, limit = 5) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    p.MAPHIM, p.TENPHIM,
                    SUM(v.GIABAN) as totalRevenue,
                    COUNT(v.MAVE) as totalTicketsSold
                 FROM PHIM p
                 JOIN SUATCHIEU sc ON p.MAPHIM = sc.MAPHIM
                 JOIN VE v ON sc.MASUATCHIEU = v.MASUATCHIEU
                 JOIN HOADON hd ON v.MAHOADON = hd.MAHOADON
                 WHERE hd.TRANGTHAITHANHTOAN = 'Đã thanh toán' AND v.TRANGTHAIVE = 'Đã bán'
                   AND hd.NGAYTAOHD BETWEEN ? AND ?
                 GROUP BY p.MAPHIM, p.TENPHIM
                 ORDER BY totalRevenue DESC
                 LIMIT ?`,
                [startDate, endDate, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error in StatisticsRepository.getTopMoviesByRevenue:', error);
            throw error;
        }
    }

    /**
     * Lấy top N sản phẩm khác có doanh thu cao nhất.
     * @param {string} startDate - Định dạng 'YYYY-MM-DD'
     * @param {string} endDate - Định dạng 'YYYY-MM-DD'
     * @param {number} limit - Số lượng sản phẩm cần lấy
     * @returns {Promise<Array<object>>}
     */
    async getTopProductsByRevenue(startDate, endDate, limit = 5) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    spk.MASP, spk.TENSP,
                    SUM(ct.THANHTIEN) as totalRevenue,
                    SUM(ct.SOLUONG) as totalQuantitySold
                 FROM SANPHAMKHAC spk
                 JOIN CHITIETHOADON_SANPHAMKHAC ct ON spk.MASP = ct.MASP
                 JOIN HOADON hd ON ct.MAHOADON = hd.MAHOADON
                 WHERE hd.TRANGTHAITHANHTOAN = 'Đã thanh toán'
                   AND hd.NGAYTAOHD BETWEEN ? AND ?
                 GROUP BY spk.MASP, spk.TENSP
                 ORDER BY totalRevenue DESC
                 LIMIT ?`,
                [startDate, endDate, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error in StatisticsRepository.getTopProductsByRevenue:', error);
            throw error;
        }
    }

    async getInvoiceCount(startDate, endDate) {
        try {
            const [rows] = await pool.query(
                `SELECT COUNT(MAHOADON) as invoiceCount
                 FROM HOADON
                 WHERE TRANGTHAITHANHTOAN = 'Đã thanh toán'
                   AND NGAYTAOHD BETWEEN ? AND ?`,
                [startDate, endDate]
            );
            return rows[0]?.invoiceCount || 0;
        } catch (error) {
            console.error('Error in StatisticsRepository.getInvoiceCount:', error);
            throw error;
        }
    }
}

module.exports = new StatisticsRepository();