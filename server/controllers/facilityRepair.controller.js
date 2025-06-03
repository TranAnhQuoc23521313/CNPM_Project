// src/controllers/facilityRepair.controller.js
const facilityRepairService = require('../services/facilityRepair.service');

class FacilityRepairController {
    async createFacilityRepair(req, res, next) {
        try {
            // Dữ liệu từ req.body: MASUCO, NGAYSUACHUA (tùy chọn), TINHTRANG_SAU_SC, CHIPHI, MOTA
            // const userId = req.user.id; // MANV người sửa
            const userId = req.user?.id || req.user?.employeeId;
            if (!userId) {
                return res.status(401).json({ message: "User not authenticated or MANV not found in token." });
            }

            const repairDetails = { ...req.body }; // Lấy dữ liệu text từ form

            // Thêm log để kiểm tra
            console.log('[Repair Ctrl] Received req.body:', req.body);
            console.log('[Repair Ctrl] Received req.file (from Multer):', req.file); // LOG QUAN TRỌNG

            // XỬ LÝ FILE ẢNH SỬA CHỮA (NẾU CÓ)
            if (req.file) { // req.file sẽ tồn tại nếu Multer xử lý thành công file với fieldname 'HINHANH_SUACHUA_FILE'
                const basePath = '/uploads/facilities/'; // Hoặc thư mục con riêng, ví dụ: /uploads/repairs/
                
                // Lựa chọn 1: Lưu đường dẫn đầy đủ (ví dụ: /uploads/facilities/ten_file_sua_chua.jpg)
                repairDetails.HINHANH_SUACHUA = `${basePath}${req.file.filename}`;
                
                // Lựa chọn 2: Chỉ lưu tên file (ví dụ: ten_file_sua_chua.jpg)
                // repairDetails.HINHANH_SUACHUA = req.file.filename; 
                
                console.log('[Repair Ctrl] File processed. HINHANH_SUACHUA set to:', repairDetails.HINHANH_SUACHUA);
            } else {
                // Nếu không có file được upload, hoặc fieldname không khớp, req.file sẽ là undefined
                // Bạn có thể muốn gán giá trị mặc định hoặc để trống tùy theo schema CSDL
                repairDetails.HINHANH_SUACHUA = null; 
                console.log('[Repair Ctrl] No HINHANH_SUACHUA_FILE uploaded or req.file is undefined. HINHANH_SUACHUA set to null.');
            }

            if (!repairDetails.MASUCO || !repairDetails.TINHTRANG_SAU_SC) {
                return res.status(400).json({ message: "MASUCO and TINHTRANG_SAU_SC are required." });
            }

            const newRepair = await facilityRepairService.recordRepair(repairDetails, userId);
            res.status(201).json({ message: 'Facility repair recorded successfully.', data: newRepair });
        } catch (error) {
            console.error("Controller Error:", error.message);
            res.status(error.message.includes("not found") ? 404 : 500).json({ message: error.message || 'Error recording facility repair.' });
        }
    }

    async getRepair(req, res, next) {
        try {
            const { masuachua } = req.params;
            const repair = await facilityRepairService.getRepairById(masuachua);
            if (!repair) {
                return res.status(404).json({ message: `Facility repair ${masuachua} not found.` });
            }
            res.status(200).json({ data: repair });
        } catch (error) {
            console.error("Controller Error:", error.message);
            res.status(500).json({ message: error.message || 'Error retrieving facility repair.' });
        }
    }
    
    async getIncidentRepairs(req, res, next) {
        try {
            const { masuco } = req.params; // Lấy MASUCO từ URL params
            const repairs = await facilityRepairService.getRepairsByIncident(masuco);
            res.status(200).json({ data: repairs });
        } catch (error) {
            console.error("Controller Error:", error.message);
            res.status(500).json({ message: error.message || 'Error retrieving incident repairs.' });
        }
    }

    async getAllRepairRecords(req, res, next) {
        console.log('[FacilityRepairController] getAllRepairRecords function CALLED.'); // LOG ĐẦU HÀM
        try {
            console.log('[FacilityRepairController] Calling facilityRepairService.getAllFacilityRepairs with query:', req.query);
            const repairRecords = await facilityRepairService.getAllFacilityRepairs(req.query);
            console.log('[FacilityRepairController] facilityRepairService.getAllFacilityRepairs returned:', repairRecords ? repairRecords.length + ' records' : 'null/undefined');
            
            res.status(200).json({
                success: true,
                message: 'Lấy tất cả lịch sử sửa chữa thành công.',
                data: repairRecords,
            });
        } catch (error) {
            console.error("Controller Error - getAllRepairRecords:", error.message, error.stack);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách lịch sử sửa chữa.' 
            });
        }
    }
}

module.exports = new FacilityRepairController();