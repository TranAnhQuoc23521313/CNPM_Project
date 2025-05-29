const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');

router.get('/',EmployeeController.getAllEmployee);
router.get('/:id',EmployeeController.getEmployeeById);
router.post('/',EmployeeController.createEmployee);
router.put('/:id', EmployeeController.updateEmployee);
router.delete('/:id',EmployeeController.deleteEmployee);

module.exports = router;