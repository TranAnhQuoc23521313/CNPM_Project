const EquipmentReposiotry = require('../repositories/equipmentRepository');

class EquipmentService {
    async getAllEquipment() {
        try {
            return await EquipmentReposiotry.findAll();
        } catch (error) {
            console.error('Error in EquipmentService.getAllEquipment:', error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }

    async getEquipmentById(maThietBi) {
        console.log(`EquipmentService: Attempting to get equipment by ID: ${maThietBi}`);
        try {
            const equipment = await EquipmentReposiotry.findById(maThietBi);
            if (!equipment) {
                console.warn(`EquipmentService: Equipment with ID ${maThietBi} not found.`);
                return null; // Hoặc throw lỗi 404 ở đây nếu muốn
            }
            return equipment;
        } catch (error) {
            console.error(`Error in EquipmentService.getEquipmentById for ${maThietBi}:`, error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }

    async createEquipment(equipmentData) {
        try {
            const detailsToCheck = {
                MATHIETBI: equipmentData.MATHIETBI,
                TENTHIETBI: equipmentData.TENTHIETBI,
                LOAITHIETBI: equipmentData.LOAITHIETBI,
                VITRITHIETBI: equipmentData.VITRITHIETBI,
                TRANGTHAI: equipmentData.TRANGTHAI,
                NGAYMUA: equipmentData.NGAYMUA, // Repository sẽ parse
                NGAYHETBAOHANH: equipmentData.NGAYHETBAOHANH, // Repository sẽ parse
                NGAYBAOTRI: equipmentData.NGAYBAOTRI, // Repository sẽ parse
                GIA: equipmentData.GIA // Repository sẽ parse
            };
            const isExactDuplicate = await EquipmentReposiotry.findExactDuplicate(detailsToCheck);
            if (isExactDuplicate) {
                const error = new Error('An identical equipment (based on all provided details) already exists.');
                error.statusCode = 409; // Conflict
                throw error;
            }
            // 2. Nếu không trùng, tiến hành tạo thiết bị
            const newEquipment = await EquipmentReposiotry.create(equipmentData);
            return newEquipment;
        } catch (error) {
            console.error('Error in EquipmentService.createEquipment:', error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }
}

module.exports = new EquipmentService();