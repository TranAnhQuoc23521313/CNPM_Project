// src/services/facilityRepair.service.js
const facilityRepairRepository = require('../repositories/facilityRepair.repository');
const facilityIssueRepository = require('../repositories/facilityIssue.repository'); // Để kiểm tra MASUCO
const { generateNewRepairId } = require('../utils/issue_fix_id_Generator');

class FacilityRepairService {
    async recordRepair(repairDetails, userId) {
        // repairDetails từ controller: MASUCO, NGAYSUACHUA, TINHTRANG_SAU_SC, CHIPHI, MOTA, HINHANH_SUACHUA (tên file)
        // userId là MANV của người thực hiện sửa chữa

        // Kiểm tra sự cố (MASUCO) có tồn tại không
        const incidentExists = await facilityIssueRepository.findById(repairDetails.MASUCO);
        if (!incidentExists) {
            throw new Error(`Incident with ID ${repairDetails.MASUCO} not found. Cannot record repair.`);
        }
        // TODO: Kiểm tra xem sự cố có đang ở trạng thái cho phép sửa chữa không (ví dụ: không phải "Đã giải quyết")

        const masuachua = await generateNewRepairId();
        const currentDate = new Date().toISOString().split('T')[0];

        const repairDataToSave = {
            MASUACHUA: masuachua,
            MASUCO: repairDetails.MASUCO,
            MANV: userId, // MANV người sửa
            NGAYSUACHUA: repairDetails.NGAYSUACHUA || currentDate,
            TINHTRANG_SAU_SC: repairDetails.TINHTRANG_SAU_SC,
            CHIPHI: repairDetails.CHIPHI || 0,
            MOTA: repairDetails.MOTA,
            HINHANH_SUACHUA: repairDetails.HINHANH_SUACHUA || null,
        };

        try {
            const createdRepair = await facilityRepairRepository.create(repairDataToSave);
            
            // TODO: Cập nhật TRANGTHAI_SUCO trong bảng THIETBI_SUCO nếu cần
            // Ví dụ: nếu TINHTRANG_SAU_SC là "Đã sửa chữa - Hoạt động tốt"
            // thì cập nhật TRANGTHAI_SUCO của incidentExists thành "Đã giải quyết"
            // await facilityIssueRepository.updateStatus(repairDetails.MASUCO, 'Đã giải quyết');

            return createdRepair;
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