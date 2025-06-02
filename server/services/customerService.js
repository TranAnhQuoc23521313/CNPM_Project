// server/services/customerService.js
const CustomerRepository = require('../repositories/customerRepository');
const generateMaKhachHang = require('../utils/generateMaKhachHang');

class CustomerService {
    async findCustomerByPhone(phoneNumber) {
        try {
            const customer = await CustomerRepository.findByPhone(phoneNumber);
            if (!customer) {
                return null; // Hoặc ném lỗi 404 tùy theo logic mong muốn
            }
            // Chuyển đổi tên cột cho nhất quán với client nếu cần
            return {
                MaKH: customer.MAKH,
                HoTen: customer.HOTEN,
                SoDT: customer.SODT,
                Email: customer.EMAIL,
                NgaySinh: customer.NGAYSINH,
                SoTienDaChi: customer.SOTIENDACHI,
                NgayDKTV: customer.NGAYDKTV
            };
        } catch (error) {
            console.error('Error in CustomerService.findCustomerByPhone:', error);
            throw error;
        }
    }

    async registerCustomer(customerData) {
        // customerData: { HoTen, SoDT, Email, NgaySinh }
        try {
            // 1. Kiểm tra xem SĐT đã tồn tại chưa
            const existingCustomer = await CustomerRepository.findByPhone(customerData.SoDT);
            if (existingCustomer) {
                const error = new Error('Số điện thoại này đã được đăng ký cho một tài khoản thành viên khác.');
                error.statusCode = 409; // Conflict
                throw error;
            }

            // 2. Tạo Mã Khách Hàng mới
            const maKH = await generateMaKhachHang();

            // 3. Tạo khách hàng trong DB
            const newCustomer = await CustomerRepository.create({
                MAKH: maKH,
                HOTEN: customerData.HoTen,
                SODT: customerData.SoDT,
                EMAIL: customerData.Email,
                NGAYSINH: customerData.NgaySinh
            });

            return { // Trả về dữ liệu chuẩn hóa cho client
                MaKH: newCustomer.MAKH,
                HoTen: newCustomer.HOTEN,
                SoDT: newCustomer.SODT,
                Email: newCustomer.EMAIL,
                NgaySinh: newCustomer.NGAYSINH,
                SoTienDaChi: newCustomer.SOTIENDACHI,
                NgayDKTV: newCustomer.NGAYDKTV
            };
        } catch (error) {
            console.error('Error in CustomerService.registerCustomer:', error);
            throw error;
        }
    }

    async getAllCustomers() { // Thêm hàm lấy tất cả
        try {
            const customers = await CustomerRepository.findAll();
            return customers.map(customer => ({
                id: customer.MAKH, // Map sang 'id' cho frontend dễ dùng
                MaKH: customer.MAKH,
                name: customer.HOTEN, // Map sang 'name'
                HoTen: customer.HOTEN,
                SoDT: customer.SODT,
                phone: customer.SODT, // Map sang 'phone'
                Email: customer.EMAIL,
                email: customer.EMAIL, // Map sang 'email'
                NgaySinh: customer.NGAYSINH,
                SoTienDaChi: customer.SOTIENDACHI,
                joinDate: customer.NGAYDKTV, // Map sang 'joinDate'
                NgayDKTV: customer.NGAYDKTV,
                // Hạng thành viên có thể tính toán ở đây hoặc client tự suy ra từ SoTienDaChi
                membershipTier: this._calculateMembershipTier(customer.SOTIENDACHI)
            }));
        } catch (error) {
            console.error('Error in CustomerService.getAllCustomers:', error);
            throw error;
        }
    }

    _calculateMembershipTier(spending) { // Hàm helper (private)
        if (spending >= 5000000) return 'Bạch Kim';
        if (spending >= 2000000) return 'Vàng';
        if (spending >= 500000) return 'Bạc';
        return 'Đồng';
    }

    async getCustomerById(maKH) { // Thêm hàm lấy theo ID
        try {
            const customer = await CustomerRepository.findById(maKH);
            if (!customer) {
                const error = new Error('Không tìm thấy khách hàng.');
                error.statusCode = 404;
                throw error;
            }
            return {
                id: customer.MAKH, MaKH: customer.MAKH,
                name: customer.HOTEN, HoTen: customer.HOTEN,
                SoDT: customer.SODT, phone: customer.SODT,
                Email: customer.EMAIL, email: customer.EMAIL,
                NgaySinh: customer.NGAYSINH,
                SoTienDaChi: customer.SOTIENDACHI,
                joinDate: customer.NGAYDKTV, NgayDKTV: customer.NGAYDKTV,
                membershipTier: this._calculateMembershipTier(customer.SOTIENDACHI)
            };
        } catch (error) {
            console.error(`Error in CustomerService.getCustomerById for ${maKH}:`, error);
            throw error;
        }
    }

    async updateCustomer(maKH, customerDataToUpdate) { // Thêm hàm update
        // customerDataToUpdate: { name, email, phone, joinDate (thực ra là NgaySinh)}
        // Service sẽ chỉ lấy các trường cần thiết để truyền xuống Repo
        try {
            const customer = await CustomerRepository.findById(maKH);
            if (!customer) {
                const error = new Error('Không tìm thấy khách hàng để cập nhật.');
                error.statusCode = 404;
                throw error;
            }

            // Kiểm tra SĐT nếu có thay đổi và SĐT mới đã tồn tại cho KH khác
            if (customerDataToUpdate.phone && customerDataToUpdate.phone !== customer.SODT) {
                const existingByNewPhone = await CustomerRepository.findByPhone(customerDataToUpdate.phone);
                if (existingByNewPhone && existingByNewPhone.MAKH !== maKH) {
                    const error = new Error('Số điện thoại mới đã được sử dụng bởi một khách hàng khác.');
                    error.statusCode = 409;
                    throw error;
                }
            }

            const dataForRepo = {
                HOTEN: customerDataToUpdate.name, // name từ client
                EMAIL: customerDataToUpdate.email, // email từ client
                NGAYSINH: customerDataToUpdate.joinDate, // joinDate từ client thực ra là NgaySinh
                SODT: customerDataToUpdate.phone // phone từ client
            };

            const affectedRows = await CustomerRepository.update(maKH, dataForRepo);
            if (affectedRows === 0) {
                // Có thể không có gì thay đổi, hoặc MAKH không đúng
                 return { success: false, message: "Không có thông tin nào được cập nhật hoặc khách hàng không tồn tại." };
            }
             // Lấy lại thông tin KH sau khi update để trả về (bao gồm hạng TV mới nếu có)
            const updatedCustomer = await this.getCustomerById(maKH);
            return { success: true, message: "Cập nhật thông tin khách hàng thành công.", customer: updatedCustomer };

        } catch (error) {
            console.error(`Error in CustomerService.updateCustomer for ${maKH}:`, error);
            throw error;
        }
    }

    async deleteCustomer(maKH) { // Thêm hàm delete
        try {
            const customer = await CustomerRepository.findById(maKH);
            if (!customer) {
                const error = new Error('Không tìm thấy khách hàng để xóa.');
                error.statusCode = 404;
                throw error;
            }
            const affectedRows = await CustomerRepository.delete(maKH);
            if (affectedRows === 0) {
                // Trường hợp này hiếm nếu đã findById ở trên
                return { success: false, message: "Xóa khách hàng không thành công hoặc khách hàng không tồn tại." };
            }
            return { success: true, message: "Xóa khách hàng thành công." };
        } catch (error) {
            console.error(`Error in CustomerService.deleteCustomer for ${maKH}:`, error);
            throw error;
        }
    }

}

module.exports = new CustomerService();