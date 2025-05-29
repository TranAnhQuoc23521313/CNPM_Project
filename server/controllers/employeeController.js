const EmployeeService = require('../services/employeeService');
const { GenerateNextEmployeeId } = require('../utils/idEmployeeGenerator');

class EmployeeController {
    async getAllEmployee(req,res,next) {
        try {
            const employees = await EmployeeService.getAllEmployee();
            res.status(200).json(employees);
        } catch (error) {
            next(error);
        }
    }

    async getEmployeeById(req,res,next) {
        try {
            const employee = await EmployeeService.getEmployeeById(req.params.id);
            res.status(200).json(employee);
        } catch (error) {
            next(error);
        }
    }

    async createEmployee(req, res, next) {
        try {
            console.log('Create employee Request Body:', req.body);
            console.log('Create employee Request File:', req.file);

            const employeeData = { ...req.body };

            employeeData.MANV = await GenerateNextEmployeeId();
            console.log('Generated employee ID:', employeeData.MANV);

            const newEmployee = await EmployeeService.createEmployee(employeeData);
            res.status(201).json(newEmployee);

        } catch (error) {
            if (error.message && error.message.toLowerCase().includes('duplicate entry') && error.message.includes('MANV')) {
                error.statusCode = 409; // Conflict
                error.message = `employee ID ${employeeData.MASP} already exists. This might be a concurrency issue. Please try again.`;
            }
            next(error);
        }
    }

    async updateEmployee(req, res, next) {
        try {
            const employeeId = req.params.id;
            const updateData = req.body; // Sẽ chứa TENNV, VITRI, ..., và có thể MATKHAU_MOI
            
            console.log(`EmployeeController: Updating employee ${employeeId} with data:`, updateData);

            const updatedEmployee = await EmployeeService.updateEmployeeAndOptionalPassword(employeeId, updateData);
            res.status(200).json(updatedEmployee);
        } catch (error) {
            next(error);
        }
    }

    async deleteEmployee(req, res, next) {
        try {
            const employeeId = req.params.id;
            console.log(`EmployeeController: Request to delete employee ${employeeId}`);

            const result = await EmployeeService.deleteEmployeeAndAssociatedAccount(employeeId);
            // result là { success: true, message: "..." }
            res.status(200).json(result);
            // Hoặc nếu bạn muốn tuân theo chuẩn REST hơn cho DELETE thành công không có nội dung:
            // res.status(204).send();
        } catch (error) {
            next(error); // Global error handler sẽ bắt và gửi response lỗi
        }
    }
}
module.exports = new EmployeeController();