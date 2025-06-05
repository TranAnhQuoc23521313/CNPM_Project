// server/services/orderService.js
const OrderRepository = require('../repositories/orderRepository');
const CustomerRepository = require('../repositories/customerRepository');
const ProductRepository = require('../repositories/productRepository');
const generateMaHoaDon = require('../utils/generateMaHoaDon');
const generateMultipleMaVe = require('../utils/generateMaVe')
const EmailService = require('./emailService'); // THÊM IMPORT NÀY
const pool = require('../config/db');
const qrcode = require('qrcode');


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
        let customerForEmail = null;
        // Biến createdOrder sẽ giữ thông tin đơn hàng sau khi được tạo trong DB
        let createdOrder;

        try {
            await connection.beginTransaction(); // CHỈ MỘT LẦN

            const maHoaDon = await generateMaHoaDon();
            const ngayTaoHD = new Date();

            const maSuatChieuCuaHoaDon = orderPayload.showtimeId;
            if (!maSuatChieuCuaHoaDon) {
                throw new Error("MASUATCHIEU cho hóa đơn là bắt buộc.");
            }

            const invoiceInfo = {
                MAHOADON: maHoaDon,
                MASUATCHIEU: maSuatChieuCuaHoaDon,
                MAKH: orderPayload.MaKH || null,
                MANV: maNV,
                NGAYTAOHD: ngayTaoHD,
                TONGTIEN: orderPayload.TongTienHoaDon,
                HINHTHUCTHANHTOAN: orderPayload.HinhThucThanhToan || 'Tiền mặt',
                TRANGTHAITHANHTOAN: 'Đã thanh toán'
            };

            const ticketsInfo = [];
            if (orderPayload.ve && orderPayload.ve.length > 0) {
                const numberOfTickets = orderPayload.ve.length;
                const maVeArray = await generateMultipleMaVe(connection, numberOfTickets);
                if (maVeArray.length !== numberOfTickets) {
                    throw new Error("Lỗi hệ thống: Không tạo đủ số lượng mã vé yêu cầu.");
                }
                for (let i = 0; i < numberOfTickets; i++) {
                    const ticketClientData = orderPayload.ve[i];
                    ticketsInfo.push({
                        MAVE: maVeArray[i], MASUATCHIEU: invoiceInfo.MASUATCHIEU,
                        MAGHE: ticketClientData.MaGhe, MAPHONG: ticketClientData.MaPhong,
                        GIASUATCHIEU: ticketClientData.GiaVeCoBan_LucChon,
                        GIAGHENOI: ticketClientData.PhuThuGhe_LucChon,
                        GIABAN: ticketClientData.GiaBan, TRANGTHAIVE: 'Đã bán'
                    });
                }
            }

            const productsInfoForDb = [];
            if (orderPayload.sanPhamKhac && orderPayload.sanPhamKhac.length > 0) {
                for (const productClientData of orderPayload.sanPhamKhac) {
                    const { MaSP, SoLuong, GiaBan_LucChon, ThanhTien } = productClientData;
                    if (!MaSP || SoLuong === undefined || GiaBan_LucChon === undefined || ThanhTien === undefined) {
                        throw new Error(`Dữ liệu sản phẩm ${MaSP || '(không có mã)'} không đầy đủ từ client.`);
                    }
                    if (SoLuong <= 0) {
                        console.warn(`OrderService: Sản phẩm ${MaSP} có số lượng ${SoLuong}, sẽ được bỏ qua.`);
                        continue; // Bỏ qua sản phẩm nếu số lượng là 0 hoặc âm
                    }
                    const productInDb = await ProductRepository.findProductByIdForUpdate(MaSP, connection);
                    if (!productInDb) throw new Error(`Sản phẩm với mã ${MaSP} không tồn tại.`);
                    if (productInDb.TRANGTHAISP === 'Ngừng kinh doanh') {
                        throw new Error(`Sản phẩm "${productInDb.TENSP}" đã ngừng kinh doanh.`);
                    }
                    if (productInDb.TRANGTHAISP === 'Hết hàng' || productInDb.SOLUONG < SoLuong) {
                        throw new Error(`Sản phẩm "${productInDb.TENSP}" không đủ số lượng (còn ${productInDb.SOLUONG}, yêu cầu ${SoLuong}).`);
                    }
                    const newStock = productInDb.SOLUONG - SoLuong;
                    const newStatus = newStock > 0 ? 'Còn hàng' : 'Hết hàng';
                    await ProductRepository.updateStockAndStatus(MaSP, newStock, newStatus, connection);
                    productsInfoForDb.push({ MASP: MaSP, SOLUONG: SoLuong, GIASP: GiaBan_LucChon, THANHTIEN: ThanhTien });
                }
            }

            const fullOrderData = { invoiceInfo, ticketsInfo, productsInfo: productsInfoForDb };
            createdOrder = await OrderRepository.createOrder(fullOrderData, connection); // Gán cho biến createdOrder

            if (invoiceInfo.MAKH && invoiceInfo.TRANGTHAITHANHTOAN === 'Đã thanh toán') {
                await CustomerRepository.updateSpending(invoiceInfo.MAKH, invoiceInfo.TONGTIEN, connection);
                customerForEmail = await CustomerRepository.findById(invoiceInfo.MAKH, connection);
            }

            await connection.commit();
            console.log('OrderService: CustomerForEmail: ', customerForEmail);
            console.log('OrderService: CustomerForEmail.EMAIL:', customerForEmail.EMAIL);
            // GỬI EMAIL SAU KHI COMMIT THÀNH CÔNG
            if (customerForEmail && customerForEmail.EMAIL) {
                const detailedOrderForEmail = await this.getOrderById(createdOrder.MaHoaDon);
                console.log("OrderService: customerForEmail for email:", JSON.stringify(customerForEmail, null, 2)); // DEBUG
                console.log("OrderService: detailedOrderForEmail for email:", JSON.stringify(detailedOrderForEmail, null, 2)); // DEBUG
                if (detailedOrderForEmail) {
                    EmailService.sendOrderConfirmationEmail(detailedOrderForEmail, customerForEmail)
                        .then(emailResult => {
                            if (emailResult && emailResult.success) {
                                console.log(`OrderService: Email xác nhận đơn hàng ${createdOrder.MaHoaDon} đã được yêu cầu gửi thành công. ID: ${emailResult.messageId}`);
                            } else {
                                console.warn(`OrderService: Gửi email xác nhận cho đơn hàng ${createdOrder.MaHoaDon} thất bại. Lỗi (nếu có): ${emailResult?.error}`);
                            }
                        })
                        .catch(emailError => {
                            console.error(`OrderService: Lỗi không mong muốn khi cố gắng gửi email cho đơn hàng ${createdOrder.MaHoaDon}:`, emailError);
                        });
                } else {
                    console.warn(`OrderService: Không thể lấy chi tiết đơn hàng ${createdOrder.MaHoaDon} để gửi email.`);
                }
            } else if (invoiceInfo.MAKH) {
                console.log(`OrderService: Khách hàng ${invoiceInfo.MAKH} không có email hoặc không tìm thấy thông tin để gửi mail xác nhận.`);
            }

            return { MaHoaDon: createdOrder.maHoaDon, TongTien: createdOrder.TONGTIEN, NgayTao: createdOrder.NGAYTAOHD };

        } catch (error) {
            console.error('Error in OrderService.createOrder, ROLLING BACK transaction:', error);
            if (connection) {
                try { await connection.rollback(); } catch (e) { console.error("Rollback error", e); }
            }
            throw error;
        } finally {
            if (connection) {
                try { connection.release(); } catch (e) { console.error("Release connection error", e); }
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

    async getTicketsForPrinting(maHoaDon) {
        const connection = await pool.getConnection(); // Hoặc lấy connection theo cách của bạn
        try {
            console.log(`OrderService: Fetching tickets for printing for order ${maHoaDon}`);

            // *** KHOANG CODE CHỜ YÊU CẦU TỪ TÔI (OrderService.getTicketsForPrinting - Lấy dữ liệu vé) ***
            // Yêu cầu 1: Cần một phương thức trong OrderRepository để lấy tất cả vé
            //            và các thông tin liên quan cho một mã hóa đơn.
            //            Ví dụ: OrderRepository.findTicketsByOrderIdWithDetails(maHoaDon, connection)
            //
            // Dữ liệu mỗi vé cần bao gồm (ví dụ):
            // - MAVE (Mã vé - có thể dùng để tạo mã vạch/QR code)
            // - TENPHIM (Tên phim)
            // - THOIGIANSUATCHIEU (Ngày giờ suất chiếu)
            // - TENPHONG (Tên phòng chiếu)
            // - DAYGHE, VITRIGHE (Thông tin ghế)
            // - LOAIGHE (Loại ghế)
            // - GIABAN (Giá vé - có thể hiển thị hoặc không tùy thiết kế vé)
            // - MAHOADON (Mã hóa đơn - để tham chiếu)
            // - Tên rạp (Lấy từ .env hoặc cấu hình)
            // - Địa chỉ rạp (Nếu có)
            // - Logo rạp (URL nếu có)
            // - Các thông tin quy định (ví dụ: vé không hoàn trả, đến sớm, v.v.)

            const ticketsDataFromRepo = await OrderRepository.findTicketsByOrderIdWithDetails(maHoaDon, connection);

            if (!ticketsDataFromRepo || ticketsDataFromRepo.length === 0) {
                // Trước khi trả về mảng rỗng, kiểm tra xem hóa đơn có thực sự tồn tại không
                // để phân biệt giữa "không có vé" và "không có hóa đơn".
                // Tuy nhiên, Controller đã có bước kiểm tra này, nên ở đây có thể chỉ cần trả về những gì repo trả.
                console.log(`OrderService: No tickets found in repository for order ${maHoaDon}`);
                return []; // Trả về mảng rỗng nếu không có vé
            }

            const formattedTickets = await Promise.all(ticketsDataFromRepo.map(async (ticket) => {
                let qrCodeDataUrl = null;
                if (ticket.MAVE) {
                    try {
                        qrCodeDataUrl = await qrcode.toDataURL(String(ticket.MAVE), {
                            errorCorrectionLevel: 'M',
                            margin: 2,
                            width: 200, // Kích thước QR code (pixel), client có thể scale lại nếu cần
                            color: {
                                dark: "#000000",  // Màu của các ô QR
                                light: "#FFFFFF" // Màu nền QR
                            }
                        });
                    } catch (qrError) {
                        console.error(`[OrderService] Lỗi tạo QR code cho vé ${ticket.MAVE}:`, qrError);
                    }
                }

                // Lấy các thông tin cố định từ biến môi trường hoặc default
                const tenRap = process.env.CINEMA_NAME || "Rạp Phim XYZ";
                const diaChiRap = process.env.CINEMA_ADDRESS || "123 Đường ABC, Quận 1, TP.HCM";
                const hotlineRap = process.env.CINEMA_HOTLINE || "1900 1234";
                const logoRapUrl = process.env.CINEMA_LOGO_FOR_TICKET_URL; // Ví dụ: URL logo cho vé

                return {
                    maVe: ticket.MAVE,
                    tenPhim: ticket.TENPHIM,
                    thoiGianSuatChieu: ticket.THOIGIANSUATCHIEU ? new Date(ticket.THOIGIANSUATCHIEU) : null,
                    phongChieu: ticket.TENPHONG,
                    dayGhe: ticket.DAYGHE,
                    viTriGhe: ticket.VITRIGHE,
                    loaiGhe: ticket.LOAIGHE,
                    giaVeDaLuu: parseFloat(ticket.GIABAN) || 0,
                    maHoaDon: ticket.MAHOADON,
                    qrCodeDataUrl: qrCodeDataUrl, // Data URL của QR code
                    tenRap: tenRap,
                    diaChiRap: diaChiRap,
                    hotlineRap: hotlineRap,
                    logoRapUrl: logoRapUrl, // Có thể là null nếu không có trong .env
                    quyDinh: [
                        "Vé chỉ có giá trị cho suất chiếu đã chọn.",
                        "Vui lòng đến sớm 15 phút trước giờ chiếu.",
                        "Vé đã mua không được hoàn trả hoặc quy đổi."
                        // Thêm các quy định khác nếu cần
                    ]
                };
            }));

            console.log(`OrderService: Successfully fetched and formatted ${formattedTickets.length} tickets for order ${maHoaDon}`);
            return formattedTickets; // Trả về mảng các đối tượng vé đã được format

        } catch (error) {
            console.error(`Error in OrderService.getTicketsForPrinting for order ${maHoaDon}:`, error);
            throw error; // Ném lỗi để controller xử lý
        } finally {
            if (connection) {
                try { connection.release(); } catch (e) { console.error("Release connection error", e); }
            }
        }
    }

}

module.exports = new OrderService();