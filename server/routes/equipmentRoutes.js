const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');

router.get('/', equipmentController.getAllEquipment); // Endpoint để lấy tất cả thiết bị
router.post('/', equipmentController.createEquipment); // Endpoint để tạo thiết bị mới
router.get('/:id', equipmentController.getEquipmentById); // Endpoint để lấy thiết bị theo ID

module.exports = router;