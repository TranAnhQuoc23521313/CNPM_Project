// server/controllers/customerController.js
const CustomerService = require('../services/customerService');

class CustomerController {
    async findCustomerByPhone(req, res, next) {
        try {
            const phoneNumber = req.params.phone;
            if (!phoneNumber) {
                return res.status(400).json({ message: "Số điện thoại là bắt buộc." });
            }
            const customer = await CustomerService.findCustomerByPhone(phoneNumber);
            if (!customer) {
                // Quan trọng: Client dựa vào null để biết không tìm thấy
                return res.status(200).json(null); // Trả về null với status 200
            }
            res.status(200).json(customer);
        } catch (error) {
            console.error("CustomerController.findCustomerByPhone error:", error);
            next(error);
        }
    }

    async registerCustomer(req, res, next) {
        try {
            const { HoTen, SoDT, Email, NgaySinh } = req.body;
            if (!HoTen || !SoDT) {
                return res.status(400).json({ message: "Họ tên và Số điện thoại là bắt buộc để đăng ký." });
            }

            // Validate SĐT (ví dụ cơ bản)
            if (!/^\d{10,11}$/.test(SoDT)) {
                 return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
            }

            const customerData = { HoTen, SoDT, Email, NgaySinh };
            const newCustomer = await CustomerService.registerCustomer(customerData);
            res.status(201).json(newCustomer);
        } catch (error) {
            console.error("CustomerController.registerCustomer error:", error);
            // Nếu service đã set statusCode, nó sẽ được middleware lỗi chung sử dụng
            next(error);
        }
    }

     async getAllCustomers(req, res, next) { // Thêm hàm lấy tất cả
        try {
            const customers = await CustomerService.getAllCustomers();
            res.status(200).json(customers);
        } catch (error) {
            console.error("CustomerController.getAllCustomers error:", error);
            next(error);
        }
    }

    async getCustomerById(req, res, next) { // Thêm hàm lấy theo ID
        try {
            const maKH = req.params.id; // Giả sử route là /:id
            const customer = await CustomerService.getCustomerById(maKH);
            res.status(200).json(customer);
        } catch (error) {
            console.error("CustomerController.getCustomerById error:", error);
            next(error); // Service sẽ set statusCode 404 nếu không tìm thấy
        }
    }

    async updateCustomer(req, res, next) { // Thêm hàm update
        try {
            const maKH = req.params.id; // Giả sử route là /:id
            // Client sẽ gửi: name, email, phone, joinDate (là NgaySinh)
            const { name, email, phone, joinDate } = req.body;
            
            if (!name && !email && !phone && !joinDate) {
                 return res.status(400).json({ message: "Không có thông tin nào được cung cấp để cập nhật." });
            }
            if (phone && !/^\d{10,11}$/.test(phone)) {
                 return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
            }

            const customerDataToUpdate = { name, email, phone, joinDate };
            const result = await CustomerService.updateCustomer(maKH, customerDataToUpdate);
            
            if (!result.success) {
                // Service có thể đã đặt statusCode (ví dụ 404 nếu không tìm thấy KH)
                // Nếu không, mặc định là 400 hoặc 500 tùy theo lỗi
                return res.status(result.statusCode || 400).json({ message: result.message });
            }
            res.status(200).json(result); // Trả về { success: true, message: "...", customer: updatedCustomer }
        } catch (error) {
            console.error("CustomerController.updateCustomer error:", error);
            next(error);
        }
    }

    async deleteCustomer(req, res, next) { // Thêm hàm delete
        try {
            const maKH = req.params.id; // Giả sử route là /:id
            const result = await CustomerService.deleteCustomer(maKH);
             if (!result.success) {
                return res.status(result.statusCode || 400).json({ message: result.message });
            }
            res.status(200).json(result); // Trả về { success: true, message: "..." }
        } catch (error) {
            console.error("CustomerController.deleteCustomer error:", error);
            // Nếu service ném lỗi với statusCode, middleware sẽ xử lý
            // Nếu là lỗi constraint từ DB, service có thể đã xử lý hoặc ném lỗi chung
            next(error);
        }
    }
}

module.exports = new CustomerController();