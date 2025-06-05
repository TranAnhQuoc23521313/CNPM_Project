// server/controllers/orderController.js
const OrderService = require('../services/orderService');

class OrderController {
    async createOrder(req, res, next) {
        try {
            // Giả sử MaNV được lấy từ middleware xác thực và gán vào req.user.manv
            const maNV = req.user?.id;
            console.log("OrderController: Received raw req.body:", JSON.stringify(req.body, null, 2)); // <<< THÊM LOG NÀY
            console.log("OrderController: Extracted maNV from token:", maNV);
            //const maNV = req.body.MaNV_TEMP || 'NV00000001'; // TẠM THỜI - SẼ THAY BẰNG AUTH
            if (!maNV) {
                return res.status(401).json({ message: "Không xác định được nhân viên thực hiện." });
            }

            const orderPayload = req.body;
            // Validate payload
            if (!orderPayload.ve || !Array.isArray(orderPayload.ve) || orderPayload.ve.length === 0) {
                if (!orderPayload.sanPhamKhac || !Array.isArray(orderPayload.sanPhamKhac) || orderPayload.sanPhamKhac.length === 0) {
                    return res.status(400).json({ message: "Đơn hàng phải có ít nhất một vé hoặc một sản phẩm." });
                }
            }
            if (orderPayload.TongTienHoaDon === undefined || orderPayload.TongTienHoaDon < 0) {
                return res.status(400).json({ message: "Tổng tiền hóa đơn không hợp lệ." });
            }

            const result = await OrderService.createOrder(orderPayload, maNV);
            res.status(201).json(result); // Trả về { MaHoaDon, TongTien, NgayTao }
        } catch (error) {
            console.error("OrderController.createOrder error:", error);
            next(error);
        }
    }

    async getAllOrders(req, res, next) {
        try {
            const searchTerm = req.query.searchTerm || '';
            const orders = await OrderService.getAllOrders(searchTerm);
            res.status(200).json(orders);
        } catch (error) {
            console.error("OrderController.getAllOrders error:", error);
            next(error);
        }
    }

    async getOrderById(req, res, next) {
        try {
            const maHoaDon = req.params.id;
            const orderDetails = await OrderService.getOrderById(maHoaDon);
            res.status(200).json(orderDetails);
        } catch (error) {
            console.error(`OrderController.getOrderById for ${req.params.id} error:`, error);
            next(error);
        }
    }

    async cancelOrder(req, res, next) {
        try {
            const maHoaDon = req.params.id;
            const maNVThucHienHuy = req.user?.id; // Lấy từ auth
            //const maNVThucHienHuy = 'NV00000001'; // TẠM THỜI

            if (!maNVThucHienHuy) {
                 return res.status(401).json({ message: "Không xác định được nhân viên thực hiện hủy." });
            }

            const result = await OrderService.cancelOrder(maHoaDon, maNVThucHienHuy);
            if (result.success) {
                res.status(200).json(result);
            } else {
                // Ví dụ: Hóa đơn không tìm thấy hoặc đã hủy trước đó
                const statusCode = result.message.includes("Không tìm thấy") ? 404 : 400;
                res.status(statusCode).json(result);
            }
        } catch (error) {
            console.error(`OrderController.cancelOrder for ${req.params.id} error:`, error);
            next(error);
        }
    }

    async getTicketsForPrintingController(req, res, next) {
        try {
            const maHoaDon = req.params.orderId;
            // const maNV = req.user?.id; // Nếu cần log ai yêu cầu in

            if (!maHoaDon) {
                return res.status(400).json({ message: "Mã hóa đơn là bắt buộc." });
            }

            console.log(`OrderController: Request to get tickets for printing for order ${maHoaDon}`);

            const ticketPrintData = await OrderService.getTicketsForPrinting(maHoaDon);

            if (!ticketPrintData || ticketPrintData.length === 0) {
                // Kiểm tra xem hóa đơn có tồn tại nhưng không có vé, hay hóa đơn không tồn tại
                // Dựa vào logic của OrderService.getTicketsForPrinting
                // Ví dụ: nếu OrderService trả về null khi hóa đơn không tồn tại
                const orderExists = await OrderService.getOrderById(maHoaDon); // Kiểm tra lại hóa đơn
                if (!orderExists) {
                    return res.status(404).json({ message: `Không tìm thấy hóa đơn với mã ${maHoaDon}.` });
                }
                // Hóa đơn tồn tại nhưng không có vé (ví dụ: chỉ mua sản phẩm)
                return res.status(404).json({ message: `Không tìm thấy vé nào cho hóa đơn ${maHoaDon} hoặc hóa đơn này không có vé.` });
            }

            res.status(200).json(ticketPrintData);
        } catch (error) {
            console.error(`OrderController.getTicketsForPrintingController for order ${req.params.orderId} error:`, error);
            next(error);
        }
    }

}

module.exports = new OrderController();