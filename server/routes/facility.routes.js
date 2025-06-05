// src/routes/facility.routes.js
const express = require('express');
const router = express.Router();
const facilityIssueController = require('../controllers/facilityIssue.controller');
const facilityRepairController = require('../controllers/facilityRepair.controller');
const { verifyToken } = require('../middleware/authMiddleware'); // <<< SỬA Ở ĐÂY
const upload = require('../middleware/uploadMiddlewareFacilities'); // Giả sử tên file là uploadMiddlewareFacilities.js

// === Facility Issue Routes ===
router.post(
    '/issues',
    verifyToken, // Sử dụng verifyToken
    upload.array('HINHANH_SUCO_FILES', 3),
    facilityIssueController.createFacilityIssue
);

router.get(
    '/issues/:masuco',
    verifyToken, // Sử dụng verifyToken
    facilityIssueController.getIssue
);

router.get(
    '/devices/:mathietbi/issues',
    verifyToken, // Sử dụng verifyToken
    facilityIssueController.getDeviceIssues
);

// Lấy TẤT CẢ sự cố cơ sở vật chất
// Client-side function: getAllFacilityIncidentsApi()
// API Endpoint: GET /api/facilities/incidents/all (Hoặc bạn có thể đặt là /issues/all nếu muốn gom chung hơn)
router.get(
    '/incidents/all', // Giữ nguyên endpoint này nếu client đã gọi nó
    // Hoặc nếu bạn muốn gom vào /issues:
    // '/issues/all-incidents', // Đặt tên rõ ràng để không trùng với GET /issues/:masuco
    verifyToken, // Bảo vệ route này nếu cần
    facilityIssueController.getAllIncidents // Hàm này cần được tạo trong facilityIssueController
);

// === Facility Repair Routes ===
router.post(
    '/repairs',
    verifyToken,
    upload.single('HINHANH_SUACHUA_FILE'),
    facilityRepairController.createFacilityRepair
);

// ---- START: THAY ĐỔI THỨ TỰ Ở ĐÂY ----
// ROUTE CỤ THỂ HƠN PHẢI ĐƯỢC ĐỊNH NGHĨA TRƯỚC ROUTE ĐỘNG
router.get(
    '/repairs/history', // Route cụ thể
    verifyToken,
    facilityRepairController.getAllRepairRecords // Hàm này sẽ được gọi đúng
);

// ROUTE ĐỘNG ĐƯỢC ĐỊNH NGHĨA SAU ROUTE CỤ THỂ
router.get(
    '/repairs/:masuachua', // Route động
    verifyToken,
    facilityRepairController.getRepair
);
// ---- END: THAY ĐỔI THỨ TỰ Ở ĐÂY ----

router.get(
    '/issues/:masuco/repairs', // Lấy sửa chữa cho một sự cố cụ thể
    verifyToken,
    facilityRepairController.getIncidentRepairs
);

router.put('/facilities/issues/:masuco/resolve', verifyToken, facilityIssueController.resolveFacilityIncident);

module.exports = router;