// src/controllers/equipmentController.js
const EquipmentService = require('../services/equipmentService'); // Đảm bảo tên import đúng

class EquipmentController {
    async getAllEquipment(req, res, next) {
        try {
            const equipmentList = await EquipmentService.getAllEquipment(); // Đổi tên biến
            // console.log('EquipmentController: getAllEquipment response:', equipmentList);
            res.status(200).json(equipmentList); 
        } catch (error) {
            next(error);
        }
    }

    async getEquipmentById(req, res, next) {
        const maThietBi = req.params.id;
        // console.log(`EquipmentController: getEquipmentById called with ID: ${maThietBi}`);
        try {
            const equipment = await EquipmentService.getEquipmentById(maThietBi);
            // Service đã throw lỗi 404 nếu không tìm thấy, nên không cần kiểm tra null ở đây nữa
            // console.log('EquipmentController: getEquipmentById response:', equipment);
            res.status(200).json(equipment);
        } catch (error) {
            // Lỗi từ service (bao gồm cả 404) sẽ được chuyển đến error handler
            next(error); 
        }
    }

    async createEquipment(req, res, next) {
        try {
            // console.log('Create Equipment Request Body:', req.body);
            const newEquipment = await EquipmentService.createEquipment(req.body);
            res.status(201).json(newEquipment); // Trả về thiết bị đã tạo
        } catch (error) {
            next(error);
        }
    }

    // Không cần endpoint riêng để cập nhật trạng thái thiết bị từ client ở đây
    // vì nó sẽ được trigger bởi các hành động khác (báo cáo sự cố, ghi nhận sửa chữa)
}

module.exports = new EquipmentController();