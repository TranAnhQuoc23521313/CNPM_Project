// src/services/facilityIssue.service.js
const facilityIssueRepository = require('../repositories/facilityIssue.repository');
const { generateNewIncidentId } = require('../utils/issue_fix_id_Generator');
// const deviceRepository = require('../repositories/device.repository'); // Nếu cần kiểm tra MATHIETBI tồn tại
// const employeeRepository = require('../repositories/employee.repository'); // Nếu cần kiểm tra MANV tồn tại

class FacilityIssueService {
    async reportIssue(issueDetails, userId) { // issueDetails đã chứa HINHANH_SUCO từ controller
        const masuco = await generateNewIncidentId();
        const currentDate = new Date().toISOString().split('T')[0];

        const issueDataToSave = {
            MASUCO: masuco,
            MATHIETBI: issueDetails.MATHIETBI,
            MANV: userId,
            NGAY_BAOCAO: issueDetails.NGAY_BAOCAO || currentDate,
            MOTA: issueDetails.MOTA,
            MUCDO_UUTIEN: issueDetails.MUCDO_UUTIEN,
            HINHANH_SUCO: issueDetails.HINHANH_SUCO, // Đảm bảo HINHANH_SUCO được lấy từ issueDetails
            // TRANGTHAI_SUCO: 'Mới báo cáo' // Nên được thêm vào CSDL với DEFAULT
        };
        console.log('[Service] Dữ liệu sự cố chuẩn bị lưu vào DB:', issueDataToSave);

        try {
            const createdIssue = await facilityIssueRepository.create(issueDataToSave);
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
                // throw new Error(`Facility issue with ID ${masuco} not found.`); // Hoặc trả về null/undefined để controller xử lý
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
            return await facilityIssueRepository.findAllByDeviceId(mathietbi);
        } catch (error) {
            console.error(`Service Error: Could not get issues for device ${mathietbi}.`, error);
            throw new Error('Failed to retrieve facility issues for device.');
        }
    }

    async getAllFacilityIncidents(queryParams = {}) {
        try {
            // Service có thể xử lý logic cho queryParams trước khi truyền vào repository
            // Ví dụ: chuyển đổi tên trường, xác thực giá trị
            // Repository sẽ thực hiện JOIN để lấy thông tin thiết bị, nhân viên
            const incidents = await facilityIssueRepository.findAllIncidents(queryParams);
            // Có thể thực hiện thêm logic nghiệp vụ ở đây nếu cần
            return incidents;
        } catch (error) {
            console.error(`Service Error: Could not get all facility incidents.`, error);
            throw new Error('Không thể lấy danh sách tất cả sự cố cơ sở vật chất.');
        }
    }
}

module.exports = new FacilityIssueService();