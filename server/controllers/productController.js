// server/controllers/productController.js
const productService = require('../services/productService');
const fs = require('fs'); // Để xóa file nếu có lỗi
const path = require('path');
const { generateNextProductId } = require('../utils/idProductGenerator'); // Giả sử bạn có hàm này để sinh mã sản phẩm mới

class ProductController {
    async getAllProducts(req, res, next) {
        try {
            const products = await productService.getAllProducts();
            res.status(200).json(products);
        } catch (error) { next(error); }
    }

    async getProductById(req, res, next) {
        try {
            const product = await productService.getProductById(req.params.id);
            if (!product) {
                const err = new Error('Product not found.'); err.statusCode = 404; return next(err);
            }
            res.status(200).json(product);
        } catch (error) { next(error); }
    }

    async createProduct(req, res, next) {
        try {
            console.log('Create Product Request Body:', req.body);
            console.log('Create Product Request File:', req.file);
            const productData = { ...req.body };

            productData.MASP = await generateNextProductId(); // Tạo mã sản phẩm mới
            console.log('Generated Product ID:', productData.MASP);

            if (req.file) {
                productData.HINHANHSP = `/uploads/products/${req.file.filename}`; // Đường dẫn đến ảnh
            } else {
                productData.HINHANHSP = null; // Hoặc có thể để trống nếu không có ảnh
                console.log('ProductController - No file uploaded or req.file is invalid, HINHANHSP set to null.');
            }

            const newProduct = await productService.createProduct(productData);
            res.status(201).json(newProduct);
        } catch (error) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path); // Xóa file nếu có lỗi
                    console.log(`Deleted uploaded file ${req.file.filename} due to error: ${error.message}`);
                } catch (unlinkError) {
                    console.error(`Error deleting uploaded file ${req.file.filename}:`, unlinkError);
                }
            }
            if (error.message && error.message.toLowerCase().includes('duplicate entry') && error.message.includes('MASP')) {
                error.statusCode = 409; // Conflict
                error.message = `Product ID ${productData.MASP} already exists. This might be a concurrency issue. Please try again.`;
            }
            next(error);
        }
    }

    async updateProduct(req, res, next) {
        const productId = req.params.id;
        try {
            console.log(`Update Product Request ID: ${productId}`);
            console.log('Update Product Request Body:', req.body);
            console.log('Update Product Request File:', req.file);

            let productData = { ...req.body }; // Dữ liệu text từ form

            // Lấy thông tin sản phẩm hiện tại để xử lý ảnh cũ
            const existingProduct = await productService.getProductById(productId);
            if (!existingProduct) {
                if (req.file) fs.unlinkSync(req.file.path); // Xóa file mới upload nếu sản phẩm không tồn tại
                const err = new Error('Product not found.'); err.statusCode = 404; return next(err);
            }

            let oldImagePath = null;
            if (existingProduct.HINHANHSP) {
                oldImagePath = path.join(__dirname, '../public', existingProduct.HINHANHSP);
            }
            if (req.file) {
                // Có file ảnh mới được upload
                productData.HINHANHSP = `/uploads/products/${req.file.filename}`;
                if (oldImagePath && fs.existsSync(oldImagePath)) {
                    // Xóa ảnh cũ nếu có
                    try {
                        fs.unlinkSync(oldImagePath);
                        console.log(`Deleted old image: ${oldImagePath}`);
                    } catch (unlinkError) {
                        console.error(`Error deleting old image ${oldImagePath}:`, unlinkError);
                    }
                }
            } else if (productData.HINHANHSP === '') {
                {
                    productData.HINHANHSP = null; // Nếu không có ảnh mới và không có ảnh cũ, set về null
                    if (oldImagePath && fs.existsSync(oldImagePath)) {
                        try {
                            fs.unlinkSync(oldImagePath);
                            console.log(`Deleted old image (explicitly by client): ${oldImagePath}`);
                        } catch (e) {
                            console.error(`Error deleting old image ${oldImagePath}:`, e);
                        }
                    }
                }
            } else {
                if (productData.HINHANHSP == undefined && existingProduct.HINHANHSP) {
                    productData.HINHANHSP = existingProduct.HINHANHSP; // Giữ nguyên ảnh cũ nếu không có ảnh mới
                }
                else if (productData.HINHANHSP == undefined && !existingProduct.HINHANHSP) {
                    productData.HINHANHSP = null; // Nếu không có ảnh mới và không có ảnh cũ, set về null
                }
            }
            const updatedProduct = await productService.updateProduct(productId, productData);
            res.status(200).json(updatedProduct);
        } catch (error) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path); // Xóa file nếu có lỗi
                    console.log(`Deleted uploaded file ${req.file.filename} due to error: ${error.message}`);
                } catch (unlinkError) {
                    console.error(`Error deleting uploaded file ${req.file.filename}:`, unlinkError);
                }
            }
            next(error);
        }
    }

    async deleteProduct(req, res, next) {
        const productId = req.params.id;
        try {
            console.log(`Delete Product Request ID: ${productId}`);

            const result = await productService.deleteProduct(productId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async checkProductStock(req, res, next) {
        try {
            const { masp } = req.params;
            const quantityRequested = parseInt(req.query.quantityRequested, 10);

            if (isNaN(quantityRequested) || quantityRequested < 0) { // Cho phép quantityRequested = 0 để reset
                return res.status(400).json({ message: "Số lượng yêu cầu không hợp lệ." });
            }
            // Gọi service để kiểm tra
            const result = await productService.checkProductAvailability(masp, quantityRequested);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
module.exports = new ProductController();