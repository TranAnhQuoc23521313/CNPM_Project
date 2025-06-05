// server/server.js (hoặc tên file chính của server bạn)

// 1. Import các module cần thiết
require('dotenv').config(); // Để đọc các biến từ file .env
const express = require('express');
const cors = require('cors');
const path = require('path'); // Module 'path' của Node.js để làm việc với đường dẫn file/thư mục

// 2. Import các routes của bạn
const movieRoutes = require('./routes/movieRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes'); // IMPORT ROUTE MỚI
const screenRoutes = require('./routes/screenRoutes');// IMPORT ROUTE MỚI
const productRoutes = require('./routes/productRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const accountRoutes = require('./routes/accountRoutes');
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes'); // Nếu có route cho thiết bị, import ở đây
const transactionhistoryRoutes = require('./routes/transactionhistoryRoutes');

const customerRoutes = require('./routes/customerRoutes'); // << MỚI
const orderRoutes =require('./routes/orderRoutes');         // << MỚI
const seatRoutes = require('./routes/seatRoutes');           // << MỚI
const facilitiesRoutes = require('./routes/facility.routes');
const statisticsRoutes = require('./routes/statisticsRoutes');

// Ví dụ:
// const showtimeRoutes = require('./routes/showtimeRoutes');
// const userRoutes = require('./routes/userRoutes');

// 3. Import module kết nối DB (chủ yếu để đảm bảo nó được khởi tạo và kiểm tra kết nối ban đầu)
const pool = require('./config/db'); // Import pool để kích hoạt kết nối và log

// 4. Khởi tạo ứng dụng Express
const app = express();

// 5. Xác định PORT
const PORT = process.env.PORT || 5000; // Sử dụng PORT từ .env, nếu không có thì mặc định là 5000

// 6. Cấu hình Middlewares
// CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Cho phép client từ URL này
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Các method được phép
    allowedHeaders: ['Content-Type', 'Authorization'], // Các header được phép
    credentials: true // Nếu bạn cần gửi cookie hoặc authorization headers
}));
// Nếu muốn cho phép tất cả các origin (không khuyến khích cho production):
// app.use(cors());

// Middleware để parse JSON request bodies
app.use(express.json());

// Middleware để parse URL-encoded request bodies (thường dùng cho form submissions truyền thống)
app.use(express.urlencoded({ extended: true }));

// Middleware để phục vụ các file tĩnh (static files)
// Các file trong thư mục 'public' sẽ được truy cập trực tiếp từ root URL của server
// Ví dụ: nếu có file server/public/uploads/posters/my-image.jpg
// Client có thể truy cập qua http://localhost:5000/uploads/posters/my-image.jpg
app.use(express.static(path.join(__dirname, 'public')));
// Hoặc cụ thể hơn cho từng thư mục con nếu muốn:
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// Khi đó client sẽ truy cập: http://localhost:5000/uploads/posters/my-image.jpg (nếu thư mục con là posters)

// 7. Định nghĩa các API Routes
// Gắn movieRoutes vào đường dẫn /api/movies
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes); 
app.use('/api/screens', screenRoutes); // Gắn screenRoutes vào đường dẫn /api/screens
app.use('/api/products', productRoutes);
app.use('/api/employees',employeeRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes); // Gắn equipmentRoutes vào đường dẫn /api/equipment
app.use('/api/transactionhistory',transactionhistoryRoutes);

app.use('/api/customers', customerRoutes);     // << MỚI
app.use('/api/orders', orderRoutes);           // << MỚI
app.use('/api/seats', seatRoutes);             // << MỚI
app.use('/api/facilities',facilitiesRoutes);    // << Mới
app.use('/api/statistics', statisticsRoutes);

// Ví dụ gắn các routes khác:
// app.use('/api/showtimes', showtimeRoutes);
// app.use('/api/auth', userRoutes); // Cho đăng nhập, đăng ký

// Route cơ bản để kiểm tra server có hoạt động không (tùy chọn)
app.get('/api', (req, res) => {
    res.json({ message: 'Chào mừng đến với API của CNPM Project!' });
});

// 8. Middleware xử lý lỗi tập trung (nên đặt ở cuối cùng, sau tất cả các routes)
// Middleware này sẽ bắt các lỗi được truyền qua `next(error)` từ các controllers.
app.use((err, req, res, next) => {
    console.error("---------------------------------------");
    console.error("ERROR MIDDLEWARE CAUGHT AN ERROR:");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Route:", req.method, req.originalUrl);
    if (req.body && Object.keys(req.body).length > 0) {
        console.error("Request Body:", JSON.stringify(req.body, null, 2));
    }
    if (req.file) {
        console.error("Uploaded File:", req.file.originalname, "(path:", req.file.path + ")");
    }
    console.error("Error Stack:", err.stack);
    console.error("---------------------------------------");


    const statusCode = err.statusCode || 500; // Mặc định là 500 nếu lỗi không có statusCode
    const message = err.message || 'Đã có lỗi xảy ra trên server.';

    // Trả về response lỗi cho client
    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message: message,
        // Chỉ trả về stack trace trong môi trường development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        // Có thể thêm các trường lỗi cụ thể nếu cần
        ...(err.errors && { errors: err.errors })
    });
}); 

// Middleware xử lý route không tìm thấy (404 Not Found - đặt ngay trước error handler)
/* app.use((req, res, next) => {
    const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error); // Chuyển lỗi này đến middleware xử lý lỗi tập trung
}); */


// 9. Khởi động Server
app.listen(PORT, () => {
    console.log(`Server CNPM_Project đang chạy trên cổng ${PORT}`);
    console.log(`Kết nối với client dự kiến từ: ${process.env.CLIENT_URL || 'http://localhost:5000'}`);
    // Dòng log kiểm tra kết nối DB đã có trong file `server/config/db.js`
    // Nếu muốn, bạn có thể thử một query đơn giản ở đây sau khi server khởi động
    // pool.query('SELECT 1')
    //    .then(() => console.log('Test query to DB successful after server start.'))
    //    .catch(err => console.error('Test query to DB FAILED after server start:', err));
});


