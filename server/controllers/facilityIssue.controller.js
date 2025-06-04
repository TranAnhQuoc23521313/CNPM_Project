// src/controllers/facilityIssue.controller.js
const facilityIssueService = require('../services/facilityIssue.service');
// const uploadMiddleware = require('../middlewares/upload.middleware'); // Nếu có xử lý upload file

class FacilityIssueController {
    async createFacilityIssue(req, res, next) {
        try {
            const userId = req.user?.id || req.user?.employeeId;
            if (!userId) {
                return res.status(401).json({ message: "User not authenticated or MANV not found in token." });
            }

            const issueDetails = { ...req.body }; // Lấy các trường text từ form
            console.log('[Controller] req.body:', req.body); // Log để xem req.body
            console.log('[Controller] req.files:', req.files); // Log để xem req.files có gì

            // Xử lý file đã upload
            if (req.files && req.files.length > 0) {
                const basePath = '/uploads/facilities/'; // Đường dẫn cơ sở mà client có thể truy cập

                // Tạo một mảng các đường dẫn đầy đủ, sau đó nối lại nếu cần
                const filePaths = req.files.map(file => {
                    // file.filename là tên file đã được Multer lưu, ví dụ: "HINHANH_SUCO_FILES-timestamp-random.jpg"
                    return `${basePath}${file.filename}`;
                });

                // Nối các đường dẫn thành một chuỗi nếu cột CSDL của bạn lưu chuỗi
                // Hoặc giữ nguyên mảng nếu cột CSDL của bạn là JSON/ARRAY
                issueDetails.HINHANH_SUCO = filePaths.join(','); // Ví dụ: "/uploads/facilities/file1.jpg,/uploads/facilities/file2.jpg"

                console.log('[Controller] Đã xử lý req.files. HINHANH_SUCO (đường dẫn) được gán là:', issueDetails.HINHANH_SUCO);
            } else {
                issueDetails.HINHANH_SUCO = null;
                console.log('[Controller] Không có file được upload hoặc req.files rỗng. HINHANH_SUCO được gán là null.');
            }

            // Kiểm tra lại giá trị của issueDetails.HINHANH_SUCO ngay trước khi gọi service
            console.log('[Controller] issueDetails ngay trước khi gọi service:', issueDetails);

            if (!issueDetails.MATHIETBI || !issueDetails.MOTA) {
                return res.status(400).json({ message: "MATHIETBI and MOTA are required." });
            }

            const newIssue = await facilityIssueService.reportIssue(issueDetails, userId);

            res.status(201).json({
                message: 'Facility issue reported successfully.',
                data: newIssue,
            });

        } catch (error) {
            console.error("Controller Error:", error.message, error.stack);
            res.status(error.message.includes("not found") ? 404 : 500).json({ message: error.message || 'Error reporting facility issue.' });
        }
    }


    async getIssue(req, res, next) {
        try {
            const { masuco } = req.params;
            const issue = await facilityIssueService.getIssueById(masuco);
            if (!issue) {
                return res.status(404).json({ message: `Facility issue ${masuco} not found.` });
            }
            res.status(200).json({ data: issue });
        } catch (error) {
            console.error("Controller Error:", error.message);
            res.status(500).json({ message: error.message || 'Error retrieving facility issue.' });
        }
    }

    async getDeviceIssues(req, res, next) {
        try {
            const { mathietbi } = req.params; // Lấy MATHIETBI từ URL params
            const issues = await facilityIssueService.getIssuesByDevice(mathietbi);
            res.status(200).json({ data: issues });
        } catch (error) {
            console.error("Controller Error:", error.message);
            res.status(500).json({ message: error.message || 'Error retrieving device issues.' });
        }
    }

    // HÀM MỚI
    async getAllIncidents(req, res, next) {
        try {
            // req.query có thể chứa các tham số lọc/phân trang từ client
            // Ví dụ: const { status, page, limit, sortBy, search } = req.query;
            // Truyền các tham số này vào service nếu service hỗ trợ
            const incidents = await facilityIssueService.getAllFacilityIncidents(req.query);
            res.status(200).json({
                success: true, // Thêm trường success cho nhất quán
                message: 'Lấy tất cả sự cố thành công.',
                data: incidents,
                // total: ... // Nếu có phân trang, trả về tổng số bản ghi
            });
        } catch (error) {
            console.error("Controller Error - getAllIncidents:", error.message, error.stack);
            // next(error); // Hoặc sử dụng error handling middleware chung
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách tất cả sự cố.'
            });
        }
    }

    async resolveFacilityIncident(req, res, next) {
        try {
            const { masuco } = req.params;
            if (!masuco) {
                return res.status(400).json({ success: false, message: "Mã sự cố là bắt buộc." });
            }

            const result = await facilityIssueService.resolveIncident(masuco);

            res.status(200).json({
                success: true,
                message: result.message || `Sự cố ${masuco} đã được đánh dấu là "Đã giải quyết".`,
                data: result,
            });

        } catch (error) {
            console.error("Controller Error - resolveFacilityIncident:", error.message, error.stack);
            const statusCode = error.message.toLowerCase().includes("không tồn tại") ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Lỗi khi đánh dấu sự cố đã giải quyết.'
            });
        }
    }
}

module.exports = new FacilityIssueController();