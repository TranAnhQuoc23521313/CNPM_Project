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

    async checkProductAvailability(masp, quantityRequested) {
        const product = await productRepository.findById(masp); // Dùng findById bình thường, không FOR UPDATE

        if (!product) {
            return {
                available: false,
                message: "Sản phẩm không tồn tại.",
                reason: "not_found"
            };
        }

        if (product.TRANGTHAISP === 'Ngừng kinh doanh') {
            return {
                available: false,
                message: `Sản phẩm "${product.TENSP}" đã ngừng kinh doanh.`,
                reason: "discontinued",
                currentStock: product.SOLUONG, // Vẫn trả về tồn kho hiện tại
                productStatus: product.TRANGTHAISP
            };
        }
        
        // Nếu yêu cầu số lượng là 0, luôn coi là hợp lệ (dùng để client reset)
        if (quantityRequested === 0) {
             return {
                available: true,
                message: "Số lượng được đặt về 0.",
                currentStock: product.SOLUONG,
                productStatus: product.TRANGTHAISP
            };
        }

        if (product.SOLUONG < quantityRequested) {
            return {
                available: false,
                message: `Sản phẩm "${product.TENSP}" chỉ còn ${product.SOLUONG} sản phẩm. Bạn không thể chọn ${quantityRequested}.`,
                reason: "insufficient_stock",
                currentStock: product.SOLUONG,
                maxAllowed: product.SOLUONG, // Số lượng tối đa có thể chọn
                productStatus: product.TRANGTHAISP
            };
        }

        // Nếu TRANGTHAISP là 'Hết hàng' nhưng SOLUONG > 0 (lỗi dữ liệu), vẫn cho bán nếu quantityRequested <= SOLUONG
        // Nhưng nếu SOLUONG <= 0 thì chắc chắn là hết hàng
        if (product.SOLUONG <= 0 && quantityRequested > 0) {
             return {
                available: false,
                message: `Sản phẩm "${product.TENSP}" đã hết hàng.`,
                reason: "out_of_stock",
                currentStock: 0,
                maxAllowed: 0,
                productStatus: 'Hết hàng' // Cập nhật lại nếu cần
            };
        }

        return { // Hợp lệ
            available: true,
            message: "Sản phẩm có sẵn.",
            currentStock: product.SOLUONG, // Số lượng tồn kho hiện tại của sản phẩm
            productStatus: product.TRANGTHAISP
        };
    }
}
module.exports = new ProductService();