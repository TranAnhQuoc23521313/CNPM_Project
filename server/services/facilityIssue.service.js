// src/services/facilityIssue.service.js
const facilityIssueRepository = require('../repositories/facilityIssue.repository');
const { generateNewIncidentId } = require('../utils/issue_fix_id_Generator');
const equipmentService = require('./equipmentService'); // IMPORT EquipmentService
const { DEVICE_STATUS } = require('./equipmentService'); // Import hằng số trạng thái

class FacilityIssueService {
    async reportIssue(issueDetails, userId) {
        const masuco = await generateNewIncidentId();
        const currentDate = new Date().toISOString().split('T')[0];

        const issueDataToSave = {
            MASUCO: masuco,
            MATHIETBI: issueDetails.MATHIETBI,
            MANV: userId,
            NGAY_BAOCAO: issueDetails.NGAY_BAOCAO || currentDate,
            MOTA: issueDetails.MOTA,
            MUCDO_UUTIEN: issueDetails.MUCDO_UUTIEN,
            HINHANH_SUCO: issueDetails.HINHANH_SUCO,
            TRANGTHAI_SUCO: 'Chưa giải quyết' // Luôn đặt là "Chưa giải quyết" khi tạo mới
        };
        console.log('[Service-reportIssue] Dữ liệu sự cố chuẩn bị lưu vào DB:', issueDataToSave);

        try {
            const createdIssue = await facilityIssueRepository.create(issueDataToSave);
            // SAU KHI TẠO SỰ CỐ THÀNH CÔNG, CẬP NHẬT TRẠNG THÁI THIẾT BỊ
            if (createdIssue && createdIssue.MATHIETBI) {
                try {
                    await equipmentService.updateDeviceStatus(createdIssue.MATHIETBI, DEVICE_STATUS.BROKEN); // 'Hỏng hóc'
                } catch (deviceStatusError) {
                    // Ghi log lỗi cập nhật trạng thái thiết bị nhưng không làm hỏng việc báo cáo sự cố
                    console.error(`[FacilityIssueService] Lỗi khi cập nhật trạng thái thiết bị ${createdIssue.MATHIETBI} thành "Hỏng hóc":`, deviceStatusError.message);
                    // Bạn có thể quyết định có ném lỗi này ra ngoài không, hoặc chỉ log
                }
            }
            return createdIssue;
        } catch (error) {
            console.error('Service Error: Could not report issue.', error);
            throw new Error('Failed to report facility issue.');
        }
    }

    async getIssueById(masuco) {
        try {
            const issue = await facilityIssueRepository.findById(masuco);
            if (!issue) {
                return null;
            }
            return issue;
        } catch (error) {
            console.error(`Service Error: Could not get issue ${masuco}.`, error);
            throw new Error('Failed to retrieve facility issue.');
        }
    }

    async getIssuesByDevice(mathietbi) {
        try {
            // Repository đã lọc chỉ lấy sự cố "Chưa giải quyết"
            return await facilityIssueRepository.findAllByDeviceId(mathietbi);
        } catch (error) {
            console.error(`Service Error: Could not get issues for device ${mathietbi}.`, error);
            throw new Error('Failed to retrieve facility issues for device.');
        }
    }

    async getAllFacilityIncidents(queryParams = {}) {
        try {
            const incidents = await facilityIssueRepository.findAllIncidents(queryParams);
            return incidents;
        } catch (error) {
            console.error(`Service Error: Could not get all facility incidents.`, error);
            throw new Error('Không thể lấy danh sách tất cả sự cố cơ sở vật chất.');
        }
    }

    // Hàm mới để đánh dấu sự cố đã giải quyết
    async resolveIncident(masuco) {
        try {
            const issue = await facilityIssueRepository.findById(masuco);
            if (!issue) {
                throw new Error(`Sự cố với mã ${masuco} không tồn tại.`);
            }
            if (issue.TRANGTHAI_SUCO === 'Đã giải quyết') {
                // return issue; // Hoặc throw lỗi nhẹ nhàng là đã giải quyết rồi
                console.warn(`Sự cố ${masuco} đã ở trạng thái "Đã giải quyết".`);
                return { MASUCO: masuco, TRANGTHAI_SUCO: 'Đã giải quyết', message: 'Sự cố đã được giải quyết trước đó.' };
            }

            const success = await facilityIssueRepository.updateStatus(masuco, 'Đã giải quyết');
            if (!success) {
                throw new Error('Không thể cập nhật trạng thái sự cố trong repository.');
            }
            return { MASUCO: masuco, TRANGTHAI_SUCO: 'Đã giải quyết' };
        } catch (error) {
            console.error(`Service Error: Could not mark issue ${masuco} as resolved.`, error);
            throw new Error(error.message || 'Lỗi khi đánh dấu sự cố đã giải quyết.');
        }
    }
}

module.exports = new FacilityIssueService();