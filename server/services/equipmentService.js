// src/services/equipmentService.js
const EquipmentRepository = require('../repositories/equipmentRepository'); // Sửa lỗi chính tả

// Định nghĩa các hằng số trạng thái thiết bị
const DEVICE_STATUS = {
    ACTIVE: 'Đang hoạt động',
    MAINTENANCE_NEEDED: 'Cần bảo trì',
    REPAIRING: 'Đang sửa chữa',
    BROKEN: 'Hỏng hóc',
    UNUSED: 'Không sử dụng',
    UNKNOWN: 'Không rõ' // Trạng thái mặc định nếu cần
};
Object.freeze(DEVICE_STATUS); // Ngăn không cho thay đổi đối tượng này


class EquipmentService {
    async getAllEquipment() {
        try {
            return await EquipmentRepository.findAll();
        } catch (error) {
            console.error('Error in EquipmentService.getAllEquipment:', error);
            throw error;
        }
    }

    async getEquipmentById(maThietBi) {
        // console.log(`EquipmentService: Attempting to get equipment by ID: ${maThietBi}`);
        try {
            const equipment = await EquipmentRepository.findById(maThietBi); // Sử dụng hàm findById đã thêm
            if (!equipment) {
                console.warn(`EquipmentService: Equipment with ID ${maThietBi} not found.`);
                // Có thể ném lỗi 404 ở đây nếu muốn controller xử lý rõ ràng hơn
                const error = new Error(`Thiết bị với mã ${maThietBi} không tìm thấy.`);
                error.statusCode = 404;
                throw error;
            }
            return equipment;
        } catch (error) {
            console.error(`Error in EquipmentService.getEquipmentById for ${maThietBi}:`, error);
            throw error;
        }
    }

    async createEquipment(equipmentData) {
        try {
            // Kiểm tra trùng lặp dựa trên MATHIETBI trước
            const existingById = await EquipmentRepository.findById(equipmentData.MATHIETBI);
            if (existingById) {
                const error = new Error(`Thiết bị với mã ${equipmentData.MATHIETBI} đã tồn tại.`);
                error.statusCode = 409; // Conflict
                throw error;
            }

            // Kiểm tra trùng lặp dựa trên các chi tiết khác (tùy chọn)
            // const detailsToCheck = { ...equipmentData }; // Bỏ MATHIETBI ra nếu đã kiểm tra ở trên
            // const isExactDuplicate = await EquipmentRepository.findExactDuplicate(detailsToCheck);
            // if (isExactDuplicate) {
            //     const error = new Error('Một thiết bị giống hệt (dựa trên các chi tiết khác) đã tồn tại.');
            //     error.statusCode = 409; // Conflict
            //     throw error;
            // }
            
            const newEquipment = await EquipmentRepository.create(equipmentData);
            return newEquipment;
        } catch (error) {
            console.error('Error in EquipmentService.createEquipment:', error);
            // Nếu lỗi không có statusCode, gán mặc định là 500
            if (!error.statusCode) {
                error.statusCode = 500; 
            }
            throw error;
        }
    }

    // THÊM HÀM MỚI
    async updateDeviceStatus(mathietbi, newStatus) {
        try {
            const device = await EquipmentRepository.findById(mathietbi);
            if (!device) {
                const error = new Error(`Thiết bị với mã ${mathietbi} không tồn tại, không thể cập nhật trạng thái.`);
                error.statusCode = 404;
                throw error;
            }

            // Kiểm tra xem newStatus có phải là một trạng thái hợp lệ không
            if (!Object.values(DEVICE_STATUS).includes(newStatus)) {
                 console.warn(`[EquipmentService] Trạng thái thiết bị không hợp lệ được yêu cầu: '${newStatus}' cho MATHIETBI: ${mathietbi}. Bỏ qua cập nhật.`);
                 // Hoặc ném lỗi nếu muốn chặt chẽ:
                 // const error = new Error(`Trạng thái thiết bị '${newStatus}' không hợp lệ.`);
                 // error.statusCode = 400; // Bad Request
                 // throw error;
                 return device; // Trả về thiết bị hiện tại nếu không muốn thay đổi khi trạng thái không hợp lệ
            }

            const success = await EquipmentRepository.updateStatus(mathietbi, newStatus);
            if (!success) {
                throw new Error('Không thể cập nhật trạng thái thiết bị trong repository.');
            }
            console.log(`[EquipmentService] Trạng thái của thiết bị ${mathietbi} đã được cập nhật thành: ${newStatus}`);
            // Trả về thiết bị đã được cập nhật (hoặc chỉ thông tin cần thiết)
            return await EquipmentRepository.findById(mathietbi); 
        } catch (error) {
            console.error(`Service Error: Could not update status for equipment ${mathietbi}.`, error);
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            throw error;
        }
    }
}

// Xuất cả class và hằng số DEVICE_STATUS
const equipmentServiceInstance = new EquipmentService();
equipmentServiceInstance.DEVICE_STATUS = DEVICE_STATUS; 
module.exports = equipmentServiceInstance;