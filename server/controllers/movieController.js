// server/controllers/movieController.js
const movieService = require('../services/movieService');
const fs = require('fs');
const path = require('path');
const { generateNextMovieId } = require('../utils/idGenerator');
// ...

class MovieController {
    async getAllMovies(req, res, next) {
        try {
            const movies = await movieService.getAllMovies();
            console.log('movieController: getAllMovies response:', movies);
            res.status(200).json(movies); // Trả về mảng phim với status 200
        } catch (error) {
            // Lỗi sẽ được chuyển đến middleware xử lý lỗi chung
            next(error);
        }
    }
    // ... các phương thức khác ...
    async createMovie(req, res, next) {
        try {
            console.log('Create Movie Request Body:', req.body);
            console.log('Create Movie Request File:', req.file);

            let movieData = { ...req.body };

            // BỎ QUA MAPHIM TỪ CLIENT (NẾU CÓ) VÌ SERVER SẼ TỰ SINH
            // Hoặc bạn có thể báo lỗi nếu client cố tình gửi MAPHIM

            // TỰ ĐỘNG SINH MAPHIM MỚI
            movieData.MAPHIM = await generateNextMovieId();
            console.log('Generated MAPHIM:', movieData.MAPHIM);


            if (req.file) {
                movieData.HINHANH = `/uploads/posters/${req.file.filename}`;
            } else {
                movieData.HINHANH = null;
            }

            const newMovie = await movieService.createMovie(movieData);
            res.status(201).json(newMovie);
        } catch (error) {
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                    console.log(`Deleted uploaded file ${req.file.filename} due to error: ${error.message}`);
                } catch (unlinkError) {
                    console.error(`Error deleting uploaded file ${req.file.filename}:`, unlinkError);
                }
            }
            // Kiểm tra xem có phải lỗi trùng MAPHIM không (dù đã cố gắng sinh duy nhất)
            if (error.message && error.message.toLowerCase().includes('duplicate entry') && error.message.includes('MAPHIM')) {
                error.statusCode = 409; // Conflict
                error.message = `Movie ID ${movieData.MAPHIM} already exists. This might be a concurrency issue. Please try again.`;
            }
            next(error);
        }
    }

    async getMovieById(req, res, next) { // Cần thiết nếu EditModal fetch lại dữ liệu
        try {
            const movie = await movieService.getMovieById(req.params.id);
            if (!movie) {
                const error = new Error('Movie not found');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json(movie);
        } catch (error) {
            next(error);
        }
    }

    async updateMovie(req, res, next) {
        const movieId = req.params.id;
        try {
            console.log(`Update Movie Request ID: ${movieId}`);
            console.log('Update Movie Request Body:', req.body);
            console.log('Update Movie Request File:', req.file);

            let movieData = { ...req.body }; // Dữ liệu text từ form

            // Lấy thông tin phim hiện tại để xử lý ảnh cũ
            const existingMovie = await movieService.getMovieById(movieId);
            if (!existingMovie) {
                if (req.file) fs.unlinkSync(req.file.path); // Xóa file mới upload nếu phim không tồn tại
                const error = new Error('Movie not found for update.');
                error.statusCode = 404;
                return next(error);
            }

            let oldImagePath = null;
            if (existingMovie.HINHANH) {
                // Xây dựng đường dẫn tuyệt đối đến file ảnh cũ trên server
                oldImagePath = path.join(__dirname, '../public', existingMovie.HINHANH);
            }

            if (req.file) {
                // Có file ảnh mới được upload
                movieData.HINHANH = `/uploads/posters/${req.file.filename}`;
                // Nếu có ảnh mới và có ảnh cũ, xóa ảnh cũ
                if (oldImagePath && fs.existsSync(oldImagePath)) {
                    try {
                        fs.unlinkSync(oldImagePath);
                        console.log(`Deleted old image: ${oldImagePath}`);
                    } catch (e) {
                        console.error(`Error deleting old image ${oldImagePath}:`, e);
                    }
                }
            } else if (movieData.HINHANH === '') { // Client gửi HINHANH rỗng => muốn xóa ảnh hiện tại
                movieData.HINHANH = null;
                if (oldImagePath && fs.existsSync(oldImagePath)) {
                     try {
                        fs.unlinkSync(oldImagePath);
                        console.log(`Deleted old image (explicitly by client): ${oldImagePath}`);
                    } catch (e) {
                        console.error(`Error deleting old image ${oldImagePath}:`, e);
                    }
                }
            } else {
                // Không có file mới, không có tín hiệu xóa ảnh => giữ lại HINHANH cũ
                // Client nên gửi lại HINHANH cũ nếu không muốn thay đổi
                // Hoặc server có thể không cập nhật field HINHANH nếu không có trong req.body
                // Dòng này đảm bảo nếu client không gửi trường HINHANH (và không có file), HINHANH cũ sẽ được giữ lại
                if (movieData.HINHANH === undefined && existingMovie.HINHANH) {
                     movieData.HINHANH = existingMovie.HINHANH;
                } else if (movieData.HINHANH === undefined && !existingMovie.HINHANH) {
                    movieData.HINHANH = null;
                }
                // Nếu client gửi lại chính xác giá trị HINHANH cũ thì không cần làm gì thêm ở đây
            }

            const updatedMovie = await movieService.updateMovie(movieId, movieData);
            res.status(200).json(updatedMovie);
        } catch (error) {
            if (req.file) { // Xóa file mới upload nếu có lỗi xảy ra sau khi upload
                try {
                    fs.unlinkSync(req.file.path);
                    console.log(`Deleted uploaded file ${req.file.filename} due to error during movie update: ${error.message}`);
                } catch (unlinkError) {
                    console.error(`Error deleting uploaded file ${req.file.filename} after update error:`, unlinkError);
                }
            }
            next(error);
        }
    }

    async deleteMovie(req, res, next) {
        const movieId = req.params.id;
        try {
            console.log(`Delete Movie Request ID: ${movieId}`);

            // Service sẽ xử lý việc tìm phim và xóa file ảnh nếu cần
            const result = await movieService.deleteMovie(movieId);

            res.status(200).json(result); // Trả về thông báo thành công
        } catch (error) {
            // Nếu service ném lỗi với statusCode (ví dụ 404), nó sẽ được dùng
            next(error);
        }
    }
}
module.exports = new MovieController();