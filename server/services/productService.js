// server/services/productService.js
const productRepository = require('../repositories/productRepository');
const { generateNextProductId } = require('../utils/idProductGenerator'); // Hoặc tên hàm bạn đặt
const fs = require('fs');
const path = require('path');

class ProductService {
    async getAllProducts() {
        try {
            return await productRepository.findAll();
        } catch (error) {
            console.error('Error in ProductService.getAllProducts:', error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }

    async getProductById(masp) {
        const product = await productRepository.findById(masp);
        if (!product) {
            // Service có thể không ném lỗi 404, để controller xử lý
            return null;
        }
        return product;
    }

    async createProduct(productDataFromController) {
        // productDataFromController chứa TENSP, LOAISP, GIASP, SOLUONG, TRANGTHAISP, HINHANHSP (đường dẫn)
        // MASP sẽ được sinh ở đây.
        console.log('ProductService: Attempting to create product with data:', productDataFromController);
        try {
            // 1. Chuẩn bị dữ liệu để kiểm tra trùng lặp (không bao gồm HINHANHSP)
            const detailsToCheck = {
                TENSP: productDataFromController.TENSP,
                LOAISP: productDataFromController.LOAISP,
                GIASP: productDataFromController.GIASP, // Repository sẽ parse
                SOLUONG: productDataFromController.SOLUONG, // Repository sẽ parse
                TRANGTHAISP: productDataFromController.TRANGTHAISP
            };

            const isExactDuplicate = await productRepository.findExactDuplicate(detailsToCheck);
            if (isExactDuplicate) { // findExactDuplicate nên trả về boolean
                const error = new Error('An identical product (based on its details) already exists.');
                error.statusCode = 409; // Conflict
                throw error;
            }

            const newProduct = await productRepository.create(productDataFromController);
            return newProduct;
        } catch (error) {
            console.error('Error in ProductService.createProduct:', error);
            // Xử lý thêm nếu lỗi là do trùng MASP (dù hiếm)
            if (error.message && error.message.toLowerCase().includes('duplicate entry') && error.message.includes(finalProductData?.MASP)) {
                error.statusCode = 409;
            }
            throw error;
        }
    }

    async updateProduct(masp, productDataToUpdate) {
        try {
            return await productRepository.update(masp, productDataToUpdate);
        } catch (error) {
            console.error(`Error in ProductService.updateProduct for ${masp}:`, error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    }

    async deleteProduct(masp) {
        const productToDelete = await productRepository.findById(masp);
        if (!productToDelete) {
            const error = new Error(`Product with MASP '${masp}' not found for deletion.`);
            error.statusCode = 404;
            throw error;
        }

        const affectedRows = await productRepository.delete(masp);
        if (affectedRows > 0) {
            if (productToDelete.HINHANHSP) {
                const imagePathOnServer = path.join(__dirname, '..', 'public', productToDelete.HINHANHSP);
                if (fs.existsSync(imagePathOnServer)) {
                    try { fs.unlinkSync(imagePathOnServer); } catch (e) { console.error("Error deleting product image:", e); }
                }
            }
            return { message: `Product '${masp}' deleted successfully.` };
        }
        throw new Error(`Failed to delete product '${masp}'.`);
    }
}
module.exports = new ProductService();