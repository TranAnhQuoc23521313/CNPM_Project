const EquipmentService = require('../services/equipmentService');

class EquipmentController {
    async getAllEquipment(req, res, next) {
        try {
            const equipment = await EquipmentService.getAllEquipment();
            console.log('EquipmentController: getAllEquipment response:', equipment);
            res.status(200).json(equipment); // Trả về mảng thiết bị với status 200
        } catch (error) {
            // Lỗi sẽ được chuyển đến middleware xử lý lỗi chung
            next(error);
        }
    }

    async getEquipmentById(req, res, next) {
        const maThietBi = req.params.id;
        console.log(`EquipmentController: getEquipmentById called with ID: ${maThietBi}`);
        try {
            const equipment = await EquipmentService.getEquipmentById(maThietBi);
            if (!equipment) {
                console.warn(`EquipmentController: No equipment found with ID ${maThietBi}`);
                return res.status(404).json({ message: 'Equipment not found' });
            }
            console.log('EquipmentController: getEquipmentById response:', equipment);
            res.status(200).json(equipment); // Trả về thiết bị với status 200
        } catch (error) {
            next(error); // Chuyển lỗi đến middleware xử lý lỗi chung
        }
    }

    async createEquipment(req, res, next) {
        try {
            console.log('Create Equipment Request Body:', req.body);
            const newEquipment = await EquipmentService.createEquipment(req.body);
            res.status(201).json(newEquipment);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EquipmentController();