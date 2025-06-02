// server/services/orderService.js
const OrderRepository = require('../repositories/orderRepository');
const CustomerRepository = require('../repositories/customerRepository');
const ProductRepository = require('../repositories/productRepository');
const generateMaHoaDon = require('../utils/generateMaHoaDon');
const generateMultipleMaVe = require('../utils/generateMaVe')
const pool = require('../config/db');


class OrderService {
    /* async createOrder(orderPayload, maNV) {
        // orderPayload từ client:
        // { MaKH?, HinhThucThanhToan?, TongTienHoaDon, GhiChu?, showtimeId (MASUATCHIEU của hóa đơn)
        //   ve: [{ MaGhe, MaPhong, GiaVeCoBan_LucChon, PhuThuGhe_LucChon, GiaBan }], (MaSuatChieu đã có ở cấp độ hóa đơn)
        //   sanPhamKhac: [{ MaSP, SoLuong, GiaBan_LucChon, ThanhTien }]
        // }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const maHoaDon = await generateMaHoaDon();
            const ngayTaoHD = new Date();

            // Lấy MASUATCHIEU của hóa đơn từ payload.
            // Quan trọng: Client phải gửi showtimeId này ở cấp độ hóa đơn.
            const maSuatChieuCuaHoaDon = orderPayload.showtimeId;
            if (!maSuatChieuCuaHoaDon) {
                throw new Error("MASUATCHIEU cho hóa đơn là bắt buộc.");
            }

            const invoiceInfo = {
                MAHOADON: maHoaDon,
                MASUATCHIEU: maSuatChieuCuaHoaDon, // Gán MASUATCHIEU cho hóa đơn
                MAKH: orderPayload.MaKH || null,
                MANV: maNV,
                NGAYTAOHD: ngayTaoHD,
                TONGTIEN: orderPayload.TongTienHoaDon,
                HINHTHUCTHANHTOAN: orderPayload.HinhThucThanhToan || 'Tiền mặt',
                TRANGTHAITHANHTOAN: 'Đã thanh toán'
            };

            const ticketsInfo = [];
            if (orderPayload.ve && orderPayload.ve.length > 0) {
                for (const ticketClientData of orderPayload.ve) {
                    const maVe = await generateMaVe();
                    ticketsInfo.push({
                        MAVE: maVe,
                        // MAHOADON sẽ được repo gán ngầm khi tạo vé
                        MASUATCHIEU: maSuatChieuCuaHoaDon, // Tất cả vé trong hóa đơn này đều thuộc suất chiếu này
                        MAGHE: ticketClientData.MaGhe,
                        MAPHONG: ticketClientData.MaPhong, // Client gửi MaPhong cho từng vé
                        GIASUATCHIEU: ticketClientData.GiaVeCoBan_LucChon,
                        GIAGHENOI: ticketClientData.PhuThuGhe_LucChon,
                        GIABAN: ticketClientData.GiaBan,
                        TRANGTHAIVE: 'Đã bán'
                    });
                }
            }

            const productsInfo = [];
            if (orderPayload.sanPhamKhac && orderPayload.sanPhamKhac.length > 0) {
                for (const product of orderPayload.sanPhamKhac) {
                    productsInfo.push({
                        MASP: product.MaSP,
                        SOLUONG: product.SoLuong,
                        GIASP: product.GiaBan_LucChon,
                        THANHTIEN: product.ThanhTien
                    });
                }
            }

            const fullOrderData = { invoiceInfo, ticketsInfo, productsInfo };
            const createdOrder = await OrderRepository.createOrder(fullOrderData, connection);

            if (invoiceInfo.MAKH && invoiceInfo.TRANGTHAITHANHTOAN === 'Đã thanh toán') {
                await CustomerRepository.updateSpending(invoiceInfo.MAKH, invoiceInfo.TONGTIEN, connection);
                console.log(`OrderService: Updated spending for customer ${invoiceInfo.MAKH}`);
            }

            await connection.commit();
            return { MaHoaDon: createdOrder.MaHoaDon, TongTien: createdOrder.TONGTIEN, NgayTao: createdOrder.NGAYTAOHD };

        } catch (error) {
            await connection.rollback();
            console.error('Error in OrderService.createOrder:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    } */

    async createOrder(orderPayload, maNV) {
        const connection = await pool.getConnection();
        let invoiceInfo;
        let productsInfo = [];
        try {
            await connection.beginTransaction();
            await connection.beginTransaction();

            const maHoaDon = await generateMaHoaDon();
            const ngayTaoHD = new Date();

            // Lấy MASUATCHIEU của hóa đơn từ payload.
            // Quan trọng: Client phải gửi showtimeId này ở cấp độ hóa đơn.
            const maSuatChieuCuaHoaDon = orderPayload.showtimeId;
            if (!maSuatChieuCuaHoaDon) {
                throw new Error("MASUATCHIEU cho hóa đơn là bắt buộc.");
            }

            const invoiceInfo = {
                MAHOADON: maHoaDon,
                MASUATCHIEU: maSuatChieuCuaHoaDon, // Gán MASUATCHIEU cho hóa đơn
                MAKH: orderPayload.MaKH || null,
                MANV: maNV,
                NGAYTAOHD: ngayTaoHD,
                TONGTIEN: orderPayload.TongTienHoaDon,
                HINHTHUCTHANHTOAN: orderPayload.HinhThucThanhToan || 'Tiền mặt',
                TRANGTHAITHANHTOAN: 'Đã thanh toán'
            };
            if (!orderPayload.showtimeId) { // Kiểm tra lại cho chắc
                throw new Error("MASUATCHIEU cho hóa đơn là bắt buộc (orderPayload.showtimeId).");
            }


            const ticketsInfo = [];
            if (orderPayload.ve && orderPayload.ve.length > 0) {
                const numberOfTickets = orderPayload.ve.length;
                console.log(`OrderService: Requesting ${numberOfTickets} MAVEs...`);
                // Gọi generateMultipleMaVe MỘT LẦN, truyền connection và số lượng vé cần
                const maVeArray = await generateMultipleMaVe(connection, numberOfTickets);

                if (maVeArray.length !== numberOfTickets) {
                    // Điều này không nên xảy ra nếu generateMultipleMaVe hoạt động đúng
                    throw new Error("Lỗi hệ thống: Không tạo đủ số lượng mã vé yêu cầu.");
                }
                console.log(`OrderService: Batch of MAVEs received:`, JSON.stringify(maVeArray));

                for (let i = 0; i < numberOfTickets; i++) {
                    const ticketClientData = orderPayload.ve[i];
                    const maVe = maVeArray[i]; // Lấy mã từ mảng đã được tạo sẵn
                    console.log(`OrderService: Assigning MAVE ${maVe} to ticket ${i + 1}`);
                    ticketsInfo.push({
                        MAVE: maVe,
                        MASUATCHIEU: invoiceInfo.MASUATCHIEU, // Sử dụng MASUATCHIEU của hóa đơn
                        MAGHE: ticketClientData.MaGhe,
                        MAPHONG: ticketClientData.MaPhong,
                        GIASUATCHIEU: ticketClientData.GiaVeCoBan_LucChon,
                        GIAGHENOI: ticketClientData.PhuThuGhe_LucChon,
                        GIABAN: ticketClientData.GiaBan,
                        TRANGTHAIVE: 'Đã bán'
                    });
                }
                console.log("OrderService: All tickets processed. Final TicketsInfo:", JSON.stringify(ticketsInfo, null, 2));
            }

            //const productsInfo = [];
            /* if (orderPayload.sanPhamKhac && orderPayload.sanPhamKhac.length > 0) {
                for (const product of orderPayload.sanPhamKhac) {
                    productsInfo.push({
                        MASP: product.MaSP,
                        SOLUONG: product.SoLuong,
                        GIASP: product.GiaBan_LucChon,
                        THANHTIEN: product.ThanhTien
                    });
                }
            } */

            // XỬ LÝ SẢN PHẨM KÈM THEO VÀ TỒN KHO
            const productsInfoForDb = [];
            if (orderPayload.sanPhamKhac && orderPayload.sanPhamKhac.length > 0) {
                for (const productClientData of orderPayload.sanPhamKhac) {
                    console.log("OrderService: Processing productClientData FROM PAYLOAD:", JSON.stringify(productClientData, null, 2));
                    const { MaSP, SoLuong, GiaBan_LucChon, ThanhTien } = productClientData;

                    if (!MaSP || SoLuong === undefined || GiaBan_LucChon === undefined || ThanhTien === undefined) {
                        throw new Error(`Dữ liệu sản phẩm ${MaSP || '(không có mã)'} không đầy đủ từ client.`);
                    }
                    if (SoLuong <= 0) {
                        throw new Error(`Số lượng mua sản phẩm ${MaSP} phải lớn hơn 0.`);
                    }

                    // SỬA Ở ĐÂY: Truyền `connection`
                    const productInDb = await ProductRepository.findProductByIdForUpdate(MaSP, connection);

                    if (!productInDb) {
                        throw new Error(`Sản phẩm với mã ${MaSP} không tồn tại.`);
                    }
                    if (productInDb.TRANGTHAISP === 'Hết hàng' || productInDb.TRANGTHAISP === 'Ngừng kinh doanh') {
                        throw new Error(`Sản phẩm "${productInDb.TENSP}" hiện đã ${productInDb.TRANGTHAISP.toLowerCase()}.`);
                    }
                    if (productInDb.SOLUONG < SoLuong) {
                        throw new Error(`Sản phẩm "${productInDb.TENSP}" chỉ còn ${productInDb.SOLUONG} sản phẩm. Không đủ số lượng yêu cầu (${SoLuong}).`);
                    }

                    const newStock = productInDb.SOLUONG - SoLuong;
                    const newStatus = newStock > 0 ? 'Còn hàng' : 'Hết hàng';
                    // SỬA Ở ĐÂY: Truyền `connection`
                    await ProductRepository.updateStockAndStatus(MaSP, newStock, newStatus, connection);

                    productsInfoForDb.push({
                        MASP: MaSP,
                        SOLUONG: SoLuong,
                        GIASP: GiaBan_LucChon,
                        THANHTIEN: ThanhTien
                    });
                }
            }

            const fullOrderData = { invoiceInfo, ticketsInfo, productsInfo: productsInfoForDb };
            const createdOrder = await OrderRepository.createOrder(fullOrderData, connection);

            // ... (cập nhật spending, commit, etc.) ...
            if (invoiceInfo.MAKH && invoiceInfo.TRANGTHAITHANHTOAN === 'Đã thanh toán') {
                await CustomerRepository.updateSpending(invoiceInfo.MAKH, invoiceInfo.TONGTIEN, connection);
            }
            await connection.commit();
            return { MaHoaDon: createdOrder.MaHoaDon, TongTien: createdOrder.TONGTIEN, NgayTao: createdOrder.NGAYTAOHD };

        } catch (error) {
            // ... (rollback, release connection) ...
            console.error('Error in OrderService.createOrder, ROLLING BACK main transaction:', error);
            if (connection) {
                try { await connection.rollback(); } catch (e) { console.error("Rollback error", e); }
            }
            throw error;
        } finally {
            if (connection) {
                try { connection.release(); } catch (e) { console.error("Release error", e); }
            }
        }
    }

    async getAllOrders(searchTerm) {
        try {
            const ordersFromRepo = await OrderRepository.getAllOrders(searchTerm);
            // Với SQL mới trong OrderRepository, ordersFromRepo đã có TENPHIM, TENPHONG, THOIGIANSUATCHIEU trực tiếp
            // console.log("ORDERS FROM REPO (OrderService - HOADON.MASUATCHIEU JOIN):", JSON.stringify(ordersFromRepo, null, 2));

            const mappedForClient = ordersFromRepo.map(order => ({
                MAHOADON: order.MAHOADON,
                NGAYTAOHD: order.NGAYTAOHD,
                TONGTIEN: order.TONGTIEN,
                TRANGTHAITHANHTOAN: order.TRANGTHAITHANHTOAN,
                HINHTHUCTHANHTOAN: order.HINHTHUCTHANHTOAN,
                MANV: order.MANV,
                MAKH: order.MAKH,
                KhachHang: {
                    HOTEN: order.TENKHACHHANG,
                    SODT: order.SODTKHACHHANG
                },
                Phim: {
                    TENPHIM: order.TENPHIM || null
                },
                SuatChieu: {
                    PhongChieu: { TENPHONG: order.TENPHONG || null },
                    THOIGIAN: order.THOIGIANSUATCHIEU || null
                }
            }));
            // console.log("MAPPED FOR CLIENT (OrderService - HOADON.MASUATCHIEU JOIN):", JSON.stringify(mappedForClient, null, 2));
            return mappedForClient;
        } catch (error) {
            console.error('Error in OrderService.getAllOrders:', error);
            throw error;
        }
    }

    async getOrderById(maHoaDon) {
        const connection = await pool.getConnection();
        try {
            const orderDetailsFromRepo = await OrderRepository.findOrderById(maHoaDon, connection);
            if (!orderDetailsFromRepo) {
                const error = new Error('Không tìm thấy hóa đơn.');
                error.statusCode = 404;
                throw error;
            }

            // orderDetailsFromRepo.Ve bây giờ đã có các cột GIASUATCHIEU và GIAGHENOI từ bảng VE
            return {
                MAHOADON: orderDetailsFromRepo.MAHOADON,
                MASUATCHIEU: orderDetailsFromRepo.HOADON_MASUATCHIEU, // MASUATCHIEU của hóa đơn
                NGAYTAOHD: orderDetailsFromRepo.NGAYTAOHD,
                TONGTIEN: orderDetailsFromRepo.TONGTIEN,
                TRANGTHAITHANHTOAN: orderDetailsFromRepo.TRANGTHAITHANHTOAN,
                HINHTHUCTHANHTOAN: orderDetailsFromRepo.HINHTHUCTHANHTOAN,
                MANV: orderDetailsFromRepo.MANV,
                MAKH: orderDetailsFromRepo.MAKH,
                KhachHang: {
                    HOTEN: orderDetailsFromRepo.TENKHACHHANG,
                    SODT: orderDetailsFromRepo.SODTKHACHHANG,
                    EMAIL: orderDetailsFromRepo.EMAILKHACHHANG,
                },
                NhanVien: {
                    TENNV: orderDetailsFromRepo.TENNHANVIEN
                },
                Ve: orderDetailsFromRepo.Ve.map(v_repo => ({ // v_repo là một vé từ repository
                    MAVE: v_repo.MAVE,
                    MASUATCHIEU: v_repo.MASUATCHIEU, // MASUATCHIEU của vé này
                    MAGHE: v_repo.MAGHE,
                    MAPHONG: v_repo.MAPHONG,
                    baseShowtimePrice: v_repo.GIASUATCHIEU, // Giá cơ bản suất chiếu (lấy từ VE.GIASUATCHIEU)
                    seatSurcharge: v_repo.GIAGHENOI,       // Phụ thu ghế (lấy từ VE.GIAGHENOI)
                    GIABAN: v_repo.GIABAN,                 // Tổng giá vé (lấy từ VE.GIABAN)
                    TRANGTHAIVE: v_repo.TRANGTHAIVE,
                    THOIGIANSUATCHIEU: v_repo.THOIGIANSUATCHIEU, // Thời gian của suất chiếu này (từ JOIN)
                    TENPHIM: v_repo.TENPHIM,                     // Tên phim của suất chiếu này (từ JOIN)
                    TENPHONG: v_repo.TENPHONG,                   // Tên phòng của vé này (từ JOIN)
                    GheNgoi: {
                        DAYGHE: v_repo.DAYGHE,
                        VITRIGHE: v_repo.VITRIGHE,
                        LOAIGHE: v_repo.LOAIGHE
                    }
                })),
                ChiTietSanPham: orderDetailsFromRepo.ChiTietSanPham.map(sp_repo => ({
                    MASP: sp_repo.MASP,
                    SOLUONG: sp_repo.SOLUONG,
                    GIABAN_LUCCHON: sp_repo.GIABAN_LUCCHON,
                    THANHTIEN: sp_repo.THANHTIEN,
                    SanPhamKhac: {
                        TENSANPHAM: sp_repo.TENSP,
                        LOAISP: sp_repo.LOAISP
                    }
                }))
            };
        } catch (error) {
            console.error(`Error in OrderService.getOrderById for ${maHoaDon}:`, error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async cancelOrder(maHoaDon, maNVThucHienHuy) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Bước 1: Lấy chi tiết đơn hàng TRƯỚC khi thực hiện bất kỳ hành động hủy nào
            // Điều này cần thiết để biết những sản phẩm nào cần hoàn kho và khách hàng nào cần cập nhật chi tiêu
            const orderDetails = await OrderRepository.findOrderById(maHoaDon, connection);

            if (!orderDetails) {
                // Nếu không tìm thấy hóa đơn, rollback và trả về lỗi
                await connection.rollback();
                return { success: false, message: `Không tìm thấy hóa đơn với mã ${maHoaDon} để hủy.` };
            }

            // Kiểm tra xem hóa đơn đã bị hủy chưa (phòng trường hợp findOrderById không check trạng thái này)
            // Hoặc OrderRepository.cancelOrder đã xử lý việc này rồi thì không cần.
            // Nếu OrderRepository.cancelOrder trả về success:false nếu đã hủy, thì logic này có thể không cần.
            if (orderDetails.TRANGTHAITHANHTOAN === 'Đã hủy') {
                await connection.rollback();
                return { success: false, message: `Hóa đơn ${maHoaDon} đã được hủy trước đó.` };
            }

            // Bước 2: Thực hiện hủy hóa đơn và vé trong repository
            const repoCancelResult = await OrderRepository.cancelOrder(maHoaDon, connection);

            if (repoCancelResult.success) {
                // Bước 3: Nếu hủy thành công trong repo, tiến hành hoàn kho sản phẩm (nếu có)
                if (orderDetails.ChiTietSanPham && orderDetails.ChiTietSanPham.length > 0) {
                    console.log(`OrderService: Restocking products for cancelled order ${maHoaDon}`);
                    for (const item of orderDetails.ChiTietSanPham) {
                        const productInDb = await ProductRepository.findProductByIdForUpdate(item.MASP, connection);
                        if (productInDb) {
                            const newStock = productInDb.SOLUONG + item.SOLUONG; // Cộng trả lại số lượng
                            let newStatus = productInDb.TRANGTHAISP; // Mặc định giữ nguyên trạng thái
                            // Chỉ cập nhật trạng thái thành 'Còn hàng' nếu nó không phải 'Ngừng kinh doanh'
                            if (productInDb.TRANGTHAISP !== 'Ngừng kinh doanh' && newStock > 0) {
                                newStatus = 'Còn hàng';
                            } else if (newStock <= 0 && productInDb.TRANGTHAISP !== 'Ngừng kinh doanh') {
                                newStatus = 'Hết hàng';
                            }
                            await ProductRepository.updateStockAndStatus(item.MASP, newStock, newStatus, connection);
                            console.log(`OrderService: Product ${item.MASP} stock updated to ${newStock}, status to ${newStatus}`);
                        } else {
                             console.warn(`OrderService.cancelOrder: Product ${item.MASP} not found to restock for order ${maHoaDon}.`);
                        }
                    }
                }

                // Bước 4: Cập nhật (giảm) số tiền đã chi tiêu của khách hàng (nếu có)
                // Đảm bảo rằng hóa đơn thực sự đã được hủy (TRANGTHAITHANHTOAN là 'Đã hủy' sau khi repoCancelResult.success)
                // orderDetails.TRANGTHAITHANHTOAN ở đây là trạng thái TRƯỚC KHI hủy.
                // Chúng ta tin tưởng repoCancelResult.success nghĩa là trạng thái đã là 'Đã hủy'.
                if (orderDetails.MAKH && orderDetails.TONGTIEN > 0) {
                    await CustomerRepository.updateSpending(orderDetails.MAKH, -orderDetails.TONGTIEN, connection); // Trừ đi tổng tiền
                    console.log(`OrderService: Reduced spending for customer ${orderDetails.MAKH} by ${orderDetails.TONGTIEN} due to cancellation of order ${maHoaDon}.`);
                }

                await connection.commit();
                console.log(`OrderService: Order ${maHoaDon} cancelled successfully, transaction committed.`);
                return repoCancelResult; // Trả về kết quả từ repository
            } else {
                // Nếu repoCancelResult.success là false (ví dụ: hóa đơn không tìm thấy trong repo, hoặc đã hủy)
                await connection.rollback();
                console.log(`OrderService: OrderRepository.cancelOrder for ${maHoaDon} failed or no changes. Rolling back. Message: ${repoCancelResult.message}`);
                return repoCancelResult; // Trả về kết quả từ repository (chứa message lỗi)
            }
        } catch (error) {
            console.error(`Error in OrderService.cancelOrder for ${maHoaDon}:`, error); // Log lỗi đầy đủ
            if (connection) { // Đảm bảo connection tồn tại trước khi rollback
                try { await connection.rollback(); } catch (e) { console.error("Rollback error in catch block", e); }
            }
            throw error; // Ném lỗi ra để controller xử lý
        } finally {
            if (connection) {
                try { connection.release(); } catch (e) { console.error("Release connection error", e); }
            }
        }
    }
}

module.exports = new OrderService();