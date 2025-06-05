// src/services/facilityRepair.service.js
const facilityRepairRepository = require('../repositories/facilityRepair.repository');
//const facilityIssueRepository = require('../repositories/facilityIssue.repository'); // Để kiểm tra MASUCO
const facilityIssueService = require('./facilityIssue.service');
const { generateNewRepairId } = require('../utils/issue_fix_id_Generator');
const equipmentService = require('./equipmentService'); // IMPORT EquipmentService
const { DEVICE_STATUS } = require('./equipmentService'); // Import hằng số trạng thái

class FacilityRepairService {
    async recordRepair(repairDetails, userId) {
        // repairDetails: MASUCO, NGAYSUACHUA, TINHTRANG_SAU_SC, CHIPHI, MOTA, HINHANH_SUACHUA
        // userId: MANV người sửa

        const incidentExists = await facilityIssueService.getIssueById(repairDetails.MASUCO);
        if (!incidentExists) {
            throw new Error(`Sự cố với mã ${repairDetails.MASUCO} không tồn tại. Không thể ghi nhận sửa chữa.`);
        }
        if (incidentExists.TRANGTHAI_SUCO === 'Đã giải quyết') {
            throw new Error(`Sự cố ${repairDetails.MASUCO} đã được giải quyết trước đó. Không thể ghi nhận sửa chữa mới cho sự cố đã giải quyết.`);
        }

        const masuachua = await generateNewRepairId(); // Tạo mã sửa chữa mới
        const currentDate = new Date().toISOString().split('T')[0];

        const repairDataToSave = {
            MASUACHUA: masuachua,
            MASUCO: repairDetails.MASUCO,
            MANV: userId,
            NGAYSUACHUA: repairDetails.NGAYSUACHUA || currentDate,
            TINHTRANG_SAU_SC: repairDetails.TINHTRANG_SAU_SC,
            CHIPHI: repairDetails.CHIPHI === '' || repairDetails.CHIPHI === null || repairDetails.CHIPHI === undefined ? null : Number(repairDetails.CHIPHI),
            MOTA: repairDetails.MOTA,
            HINHANH_SUACHUA: repairDetails.HINHANH_SUACHUA || null,
        };

        try {
            const createdRepair = await facilityRepairRepository.create(repairDataToSave);

            // Sau khi ghi nhận sửa chữa thành công, cập nhật TRANGTHAI_SUCO của sự cố thành "Đã giải quyết"
            // Và chỉ làm điều này nếu tình trạng sau sửa chữa là tích cực
            if (createdRepair) {
                // 1. Cập nhật TRANGTHAI_SUCO của sự cố thành "Đã giải quyết"
                // (Chỉ khi tình trạng sau sửa chữa là các trạng thái kết thúc)
                const repairConcludesIncident = [
                    'Đã sửa chữa - Hoạt động tốt',
                    'Không thể sửa chữa - Đề xuất thay thế'
                    // Thêm các tình trạng khác nếu nó đồng nghĩa với việc sự cố đã kết thúc
                ].includes(repairDetails.TINHTRANG_SAU_SC);

                if (repairConcludesIncident) {
                    try {
                        await facilityIssueService.resolveIncident(repairDetails.MASUCO);
                        console.log(`[RepairService] Sự cố ${repairDetails.MASUCO} đã được cập nhật thành "Đã giải quyết".`);

                        // 2. CẬP NHẬT TRẠNG THÁI THIẾT BỊ thành "Đang hoạt động"
                        // (Chỉ khi tình trạng sau sửa chữa là "Hoạt động tốt")
                        if (repairDetails.TINHTRANG_SAU_SC === 'Đã sửa chữa - Hoạt động tốt' && incidentExists.MATHIETBI) {
                            try {
                                await equipmentService.updateDeviceStatus(incidentExists.MATHIETBI, DEVICE_STATUS.ACTIVE); // 'Đang hoạt động'
                            } catch (deviceStatusError) {
                                console.error(`[RepairService] Lỗi khi cập nhật trạng thái thiết bị ${incidentExists.MATHIETBI} thành "Đang hoạt động":`, deviceStatusError.message);
                            }
                        } else if (repairDetails.TINHTRANG_SAU_SC === 'Không thể sửa chữa - Đề xuất thay thế' && incidentExists.MATHIETBI) {
                            // Nếu không thể sửa, thiết bị vẫn là "Hỏng hóc" hoặc một trạng thái khác tùy logic
                            // await equipmentService.updateDeviceStatus(incidentExists.MATHIETBI, DEVICE_STATUS.BROKEN); 
                            // hoặc một trạng thái như "Cần thay thế" nếu bạn có
                        }

                    } catch (resolveError) {
                        console.error(`[RepairService] Lỗi khi cập nhật trạng thái sự cố ${repairDetails.MASUCO}:`, resolveError.message);
                    }
                }
            }
            return createdRepair; // Trả về bản ghi sửa chữa đã tạo
        } catch (error) {
            console.error('Service Error: Could not record repair.', error);
            throw new Error('Failed to record facility repair.');
        }
    }

    async getRepairById(masuachua) {
        try {
            const repair = await facilityRepairRepository.findById(masuachua);
            if (!repair) return null;
            return repair;
        } catch (error) {
            console.error(`Service Error: Could not get repair ${masuachua}.`, error);
            throw new Error('Failed to retrieve facility repair.');
        }
    }

    async getRepairsByIncident(masuco) {
        try {
            return await facilityRepairRepository.findAllByIncidentId(masuco);
        } catch (error) {
            console.error(`Service Error: Could not get repairs for incident ${masuco}.`, error);
            throw new Error('Failed to retrieve facility repairs for incident.');
        }
    }

    // HÀM MỚI
    async getAllFacilityRepairs(queryParams = {}) {
        try {
            // Repository sẽ thực hiện JOIN để lấy thông tin sự cố, thiết bị, nhân viên
            const repairs = await facilityRepairRepository.findAllRepairs(queryParams);
            return repairs;
        } catch (error) {
            console.error(`Service Error: Could not get all facility repairs.`, error);
            throw new Error('Không thể lấy danh sách tất cả lịch sử sửa chữa.');
        }
    }
}

module.exports = new FacilityRepairService();