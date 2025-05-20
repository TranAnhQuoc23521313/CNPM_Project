// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { uploadProductImage } = require('../middleware/uploadProductImage'); // Middleware upload mới

router.get('/', productController.getAllProducts);
router.post('/', uploadProductImage.single('HINHANHSP_FILE'), productController.createProduct); // 'HINHANHSP_FILE' là tên field client gửi
router.get('/:id', productController.getProductById);
router.put('/:id', uploadProductImage.single('HINHANHSP_FILE'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;