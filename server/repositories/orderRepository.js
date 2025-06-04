// server/repositories/orderRepository.js
const pool = require('../config/db');

class OrderRepository {
    async createOrder(orderData, connection) {
        // orderData bao gồm:
        // invoiceInfo: { MAHOADON, MASUATCHIEU, MAKH, MANV, NGAYTAOHD, TONGTIEN, HINHTHUCTHANHTOAN, TRANGTHAITHANHTOAN }
        // ticketsInfo: [{ MAVE, MAHOADON, MASUATCHIEU, MAGHE, MAPHONG, GIASUATCHIEU, GIAGHENOI, GIABAN, TRANGTHAIVE }, ...]
        // productsInfo: [{ MAHOADON, MASP, SOLUONG, GIASP, THANHTIEN }, ...]

        const { invoiceInfo, ticketsInfo, productsInfo } = orderData;

        // 1. Insert vào HOADON (đã có MASUATCHIEU)
        const invoiceSql = `
            INSERT INTO HOADON (MAHOADON, MASUATCHIEU, MAKH, MANV, NGAYTAOHD, TONGTIEN, HINHTHUCTHANHTOAN, TRANGTHAITHANHTOAN)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const invoiceValues = [
            invoiceInfo.MAHOADON,
            invoiceInfo.MASUATCHIEU, // Thêm MASUATCHIEU vào đây
            invoiceInfo.MAKH,
            invoiceInfo.MANV,
            invoiceInfo.NGAYTAOHD,
            invoiceInfo.TONGTIEN,
            invoiceInfo.HINHTHUCTHANHTOAN,
            invoiceInfo.TRANGTHAITHANHTOAN
        ];
        await connection.query(invoiceSql, invoiceValues);
        console.log(`OrderRepository: Inserted HOADON ${invoiceInfo.MAHOADON} for SUATCHIEU ${invoiceInfo.MASUATCHIEU}`);

        // 2. Insert vào VE (nếu có)
        if (ticketsInfo && ticketsInfo.length > 0) {
            const ticketSql = `
                INSERT INTO VE (MAVE, MAHOADON, MASUATCHIEU, MAGHE, MAPHONG, GIASUATCHIEU, GIAGHENOI, GIABAN, TRANGTHAIVE)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            for (const ticket of ticketsInfo) {
                // Đảm bảo ticket.MASUATCHIEU giống với invoiceInfo.MASUATCHIEU (logic này ở Service)
                const ticketValues = [
                    ticket.MAVE,
                    invoiceInfo.MAHOADON,
                    ticket.MASUATCHIEU, // MASUATCHIEU cho từng vé
                    ticket.MAGHE,
                    ticket.MAPHONG,
                    ticket.GIASUATCHIEU, // Giá cơ bản của suất chiếu (lưu tại thời điểm mua)
                    ticket.GIAGHENOI,    // Phụ thu ghế (lưu tại thời điểm mua)
                    ticket.GIABAN,       // Tổng giá vé
                    ticket.TRANGTHAIVE || 'Đã bán'
                ];
                await connection.query(ticketSql, ticketValues);
                console.log(`OrderRepository: Inserted VE ${ticket.MAVE} for HOADON ${invoiceInfo.MAHOADON}`);
            }
        }

        // 3. Insert vào CHITIETHOADON_SANPHAMKHAC (nếu có)
        if (productsInfo && productsInfo.length > 0) {
            const productSql = `
                INSERT INTO CHITIETHOADON_SANPHAMKHAC (MAHOADON, MASP, SOLUONG, GIASP, THANHTIEN)
                VALUES (?, ?, ?, ?, ?)
            `;
            for (const product of productsInfo) {
                const productValues = [
                    invoiceInfo.MAHOADON,
                    product.MASP,
                    product.SOLUONG,
                    product.GIASP,
                    product.THANHTIEN
                ];
                await connection.query(productSql, productValues);
                console.log(`OrderRepository: Inserted CHITIETHOADON_SANPHAMKHAC for HOADON ${invoiceInfo.MAHOADON}, SP ${product.MASP}`);
            }
        }
        console.log(`OrderRepository: Order ${invoiceInfo.MAHOADON} created successfully in DB.`);
        return { MaHoaDon: invoiceInfo.MAHOADON, ...invoiceInfo };
    }

    async getAllOrders(searchTerm, connection = pool) {
        // SQL được đơn giản hóa nhờ HOADON.MASUATCHIEU
        let sql = `
            SELECT
                hd.MAHOADON, hd.NGAYTAOHD, hd.TONGTIEN, hd.TRANGTHAITHANHTOAN, hd.HINHTHUCTHANHTOAN, hd.MANV,
                kh.MAKH, kh.HOTEN AS TENKHACHHANG, kh.SODT AS SODTKHACHHANG,
                p.TENPHIM,      -- Lấy trực tiếp từ JOIN PHIM
                pc.TENPHONG,    -- Lấy trực tiếp từ JOIN PHONGCHIEU
                sc.THOIGIAN AS THOIGIANSUATCHIEU -- Lấy trực tiếp từ JOIN SUATCHIEU
            FROM HOADON hd
            LEFT JOIN KHACHHANG kh ON hd.MAKH = kh.MAKH
            LEFT JOIN SUATCHIEU sc ON hd.MASUATCHIEU = sc.MASUATCHIEU -- Join HOADON với SUATCHIEU
            LEFT JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
            LEFT JOIN PHONGCHIEU pc ON sc.MAPHONG = pc.MAPHONG
            LEFT JOIN NHANVIEN nv ON hd.MANV = nv.MANV -- Thêm join để có thể tìm theo tên nhân viên nếu muốn
        `;
        const params = [];
        if (searchTerm) {
            const likeSearchTerm = `%${searchTerm}%`;
            sql += ` WHERE (hd.MAHOADON LIKE ? OR kh.SODT LIKE ? OR kh.HOTEN LIKE ? OR p.TENPHIM LIKE ?) `;
            params.push(likeSearchTerm, likeSearchTerm, likeSearchTerm, likeSearchTerm);
        }
        /* sql += ` ORDER BY hd.NGAYTAOHD DESC`; */

        try {
            const [rows] = await connection.query(sql, params);
            console.log("SQL ROWS FROM OrderRepository.getAllOrders (JOIN via HOADON.MASUATCHIEU):", JSON.stringify(rows, null, 2));
            return rows;
        } catch (error) {
            console.error('Error in OrderRepository.getAllOrders:', error);
            throw error;
        }
    }

    async findOrderById(maHoaDon, connection = pool) {
        const sql = `
            SELECT
                hd.MAHOADON, hd.MASUATCHIEU AS HOADON_MASUATCHIEU, hd.NGAYTAOHD, hd.TONGTIEN,
                hd.TRANGTHAITHANHTOAN, hd.HINHTHUCTHANHTOAN,
                hd.MANV, hd.MAKH,
                kh.HOTEN AS TENKHACHHANG, kh.SODT AS SODTKHACHHANG, kh.EMAIL AS EMAILKHACHHANG,
                nv.TENNV AS TENNHANVIEN
            FROM HOADON hd
            LEFT JOIN KHACHHANG kh ON hd.MAKH = kh.MAKH
            LEFT JOIN NHANVIEN nv ON hd.MANV = nv.MANV
            WHERE hd.MAHOADON = ?
        `;
        const [orderRows] = await connection.query(sql, [maHoaDon]);
        if (orderRows.length === 0) return null;

        const orderDetails = orderRows[0];

        // Lấy chi tiết vé
        // Quan trọng: VE.GIASUATCHIEU và VE.GIAGHENOI là giá đã lưu lúc bán vé
        const ticketsSql = `
            SELECT DISTINCT
                v.MAVE, v.MASUATCHIEU, v.MAGHE, v.MAPHONG,
                v.GIASUATCHIEU,
                v.GIAGHENOI,
                v.GIABAN,
                v.TRANGTHAIVE,
                sc_ve.THOIGIAN AS THOIGIANSUATCHIEU,
                p_ve.TENPHIM,
                pc_ve.TENPHONG,
                gn.DAYGHE, gn.VITRIGHE, gn.LOAIGHE
            FROM VE v
            JOIN SUATCHIEU sc_ve ON v.MASUATCHIEU = sc_ve.MASUATCHIEU
            JOIN PHIM p_ve ON sc_ve.MAPHIM = p_ve.MAPHIM
            JOIN PHONGCHIEU pc_ve ON v.MAPHONG = pc_ve.MAPHONG
            -- SỬA Ở ĐÂY: gn.MAPHONG phải được so sánh với v.MAPHONG (hoặc pc_ve.MAPHONG)
            JOIN GHENGOI gn ON v.MAGHE = gn.MAGHE AND gn.MAPHONG = v.MAPHONG 
            -- Hoặc: JOIN GHENGOI gn ON v.MAGHE = gn.MAGHE AND gn.MAPHONG = pc_ve.MAPHONG
            WHERE v.MAHOADON = ?
        `;
        /* const ticketsSql = `
        SELECT
            v.MAVE,
            v.MAHOADON,
            v.MASUATCHIEU,
            v.MAGHE,
            v.MAPHONG,
            v.GIASUATCHIEU AS VE_GIASUATCHIEU, -- Giá suất chiếu lưu trong vé
            v.GIAGHENOI AS VE_GIAGHENOI,       -- Phụ thu ghế lưu trong vé
            v.GIABAN AS VE_GIABAN,
            v.TRANGTHAIVE,
            gn.DAYGHE,                         -- Từ GHENGOI
            gn.VITRIGHE,                       -- Từ GHENGOI
            gn.LOAIGHE AS GHENGOI_LOAIGHE,     -- LOAIGHE từ GHENGOI
            gn.GIAGHE AS GHENGOI_GIAGHE        -- GIAGHE (phụ thu) từ GHENGOI
        FROM VE v
        JOIN GHENGOI gn ON v.MAGHE = gn.MAGHE AND v.MAPHONG = gn.MAPHONG
        WHERE MAHOADON = ?
        ` */
        const [tickets] = await connection.query(ticketsSql, [maHoaDon]);
        console.log(`OrderRepository - findOrderById - Number of tickets fetched for ${maHoaDon}: ${tickets.length}`);
        console.log(`OrderRepository - findOrderById - Fetched tickets RAW:`, JSON.stringify(tickets, null, 2));
        // Lấy chi tiết sản phẩm
        const productsSql = `
            SELECT
                ct.MASP, ct.SOLUONG, ct.GIASP AS GIABAN_LUCCHON, ct.THANHTIEN,
                spk.TENSP, spk.LOAISP
            FROM CHITIETHOADON_SANPHAMKHAC ct
            JOIN SANPHAMKHAC spk ON ct.MASP = spk.MASP
            WHERE ct.MAHOADON = ?
        `;
        const [products] = await connection.query(productsSql, [maHoaDon]);

        return {
            ...orderDetails,
            Ve: tickets,
            ChiTietSanPham: products
        };
    }

    async cancelOrder(maHoaDon, connection = pool) {
        const updateInvoiceSql = "UPDATE HOADON SET TRANGTHAITHANHTOAN = 'Đã hủy' WHERE MAHOADON = ? AND TRANGTHAITHANHTOAN != 'Đã hủy'";
        const [invoiceResult] = await connection.query(updateInvoiceSql, [maHoaDon]);

        if (invoiceResult.affectedRows > 0) {
            const updateTicketsSql = "UPDATE VE SET TRANGTHAIVE = 'Đã hủy' WHERE MAHOADON = ?";
            await connection.query(updateTicketsSql, [maHoaDon]);
            console.log(`OrderRepository: Order ${maHoaDon} and its tickets cancelled.`);
            return { success: true, message: "Hóa đơn và vé đã được hủy." };
        } else {
            const [existingInvoice] = await connection.query("SELECT TRANGTHAITHANHTOAN FROM HOADON WHERE MAHOADON = ?", [maHoaDon]);
            if (existingInvoice.length === 0) {
                return { success: false, message: "Không tìm thấy hóa đơn." };
            }
            if (existingInvoice[0].TRANGTHAITHANHTOAN === 'Đã hủy') {
                return { success: false, message: "Hóa đơn này đã được hủy trước đó." };
            }
            return { success: false, message: "Không thể hủy hóa đơn hoặc không có gì thay đổi." };
        }
    }
}

module.exports = new OrderRepository();