// server/services/emailService.js
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Đảm bảo các biến .env được load

let transporter;

// Helper function to format currency (có thể tạo file utils riêng nếu muốn)
const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Register a Handlebars helper for currency formatting
handlebars.registerHelper('formatCurrency', function (value) {
    if (typeof value === 'number') {
        return formatCurrency(value);
    }
    return value; // Return as is if not a number
});
// Register a Handlebars helper for date formatting
handlebars.registerHelper('formatDate', function (dateInput, format = 'dd/MM/yyyy') {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
        return 'N/A'; // Hoặc ''
    }
    if (format === 'dd/MM/yyyy') {
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    if (format === 'HH:mm') {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
});


try {
    if (process.env.EMAIL_SERVICE_PROVIDER === 'gmail') {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // logger: true, // Bật để debug nếu cần
            // debug: true, // Bật để debug nếu cần
        });
    } else { // Cấu hình cho SMTP khác
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || "587", 10),
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // tls: {
            //     rejectUnauthorized: false // Bỏ qua check certificate nếu cần thiết cho server local
            // }
        });
    }

    // Xác thực kết nối SMTP (tùy chọn nhưng hữu ích để debug)
    transporter.verify(function (error, success) {
        if (error) {
            console.error("EmailService: Lỗi kết nối SMTP - ", error);
        } else {
            console.log("EmailService: Kết nối SMTP thành công. Sẵn sàng gửi mail.");
        }
    });

} catch (error) {
    console.error("EmailService: Không thể khởi tạo transporter - ", error);
}


const loadTemplate = (templateName, data) => {
    const filePath = path.join(__dirname, '../views/emails', `${templateName}.hbs`);
    if (!fs.existsSync(filePath)) {
        console.error(`EmailService: Template file not found at ${filePath}`);
        throw new Error(`Template file not found: ${templateName}.hbs`);
    }
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const compiledTemplate = handlebars.compile(source);
    return compiledTemplate(data);
};

const sendOrderConfirmationEmail = async (orderDetails, customerInfo) => {
    if (!transporter) {
        console.error("EmailService: Transporter chưa được khởi tạo. Không thể gửi email.");
        return;
    }

    console.log("EmailService - sendOrderConfirmationEmail - DEBUG: Received customerInfo:", JSON.stringify(customerInfo, null, 2));
    if (customerInfo) {
        console.log("EmailService - sendOrderConfirmationEmail - DEBUG: customerInfo.EMAIL value:", customerInfo.EMAIL); // Hoặc customerInfo.Email tùy thuộc vào case bạn dùng
        console.log("EmailService - sendOrderConfirmationEmail - DEBUG: customerInfo.HOTEN value:", customerInfo.HOTEN);
        //console.log("EmailService - sendOrderConfirmationEmail - DEBUG: typeof customerInfo.EMAIL:", typeof customerInfo.EMAIL);
    }

    if (!customerInfo || !customerInfo.EMAIL) {
        console.log("EmailService: Khách hàng không có email hoặc thông tin không đầy đủ, không gửi mail xác nhận.");
        return;
    }

    // Đảm bảo customerInfo.HoTen có giá trị
    /* const customerNameForEmail = customerInfo.HOTEN || 'Quý khách'; */
    console.log('EmailService - sendOrderConfirmationEmail - DEBUG: orderDetails.NGAYTAOHD value: ', orderDetails.NGAYTAOHD);

    try {
        const templateData = {
            customerName: customerInfo.HOTEN || 'Quý khách',
            cinemaName: process.env.CINEMA_NAME || 'Rạp Phim ABC',
            cinemaHotline: process.env.CINEMA_HOTLINE || '1900 xxxx',
            // cinemaLogoUrl: process.env.CINEMA_LOGO_URL,
            orderId: orderDetails.MAHOADON,
            // orderDate sẽ được format bằng helper
            orderDateRaw: orderDetails.NGAYTAOHD, // Truyền ngày gốc
            movieTitle: orderDetails.Ve && orderDetails.Ve.length > 0 ? orderDetails.Ve[0].TENPHIM : 'N/A',
            // showtimeTime và showtimeDate sẽ được format bằng helper
            showtimeDateTimeRaw: orderDetails.Ve && orderDetails.Ve.length > 0 ? orderDetails.Ve[0].THOIGIANSUATCHIEU : null, // Truyền ngày giờ gốc
            roomName: orderDetails.Ve && orderDetails.Ve.length > 0 ? orderDetails.Ve[0].TENPHONG : 'N/A',
            tickets: orderDetails.Ve ? orderDetails.Ve.map(ticket => ({
                seatLabel: `${ticket.GheNgoi.DAYGHE}${ticket.GheNgoi.VITRIGHE}`,
                seatType: ticket.GheNgoi.LOAIGHE,
                price: ticket.GIABAN, // Truyền giá gốc, helper sẽ format
                priceFormatted: formatCurrency(ticket.GIABAN) // Hoặc format ở đây nếu không dùng helper trong template
            })) : [],
            concessions: orderDetails.ChiTietSanPham ? orderDetails.ChiTietSanPham.map(item => ({
                name: item.SanPhamKhac.TENSANPHAM,
                quantity: item.SOLUONG,
                totalPrice: item.GIABAN_LUCCHON * item.SOLUONG, // Truyền giá gốc
                totalPriceFormatted: formatCurrency(item.GIABAN_LUCCHON * item.SOLUONG)
            })) : [],
            totalAmount: orderDetails.TONGTIEN, // Truyền giá gốc
            totalAmountFormatted: formatCurrency(orderDetails.TONGTIEN),
            currentYear: new Date().getFullYear(),
        };

        const htmlContent = loadTemplate('orderConfirmationTemplate', templateData);

        // Tạo nội dung plain text (nên chi tiết hơn một chút)
        let plainTextContent = `Chào ${templateData.customerName},\n\n`;
        plainTextContent += `Cảm ơn bạn đã đặt vé tại ${templateData.cinemaName}.\n`;
        plainTextContent += `Mã hóa đơn: ${templateData.orderId}\n`;
        plainTextContent += `Ngày đặt: ${new Date(templateData.orderDateRaw).toLocaleDateString('vi-VN')}\n`;
        plainTextContent += `Phim: ${templateData.movieTitle}\n`;
        if (templateData.showtimeDateTimeRaw) {
            plainTextContent += `Suất chiếu: ${new Date(templateData.showtimeDateTimeRaw).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(templateData.showtimeDateTimeRaw).toLocaleDateString('vi-VN')} (Phòng: ${templateData.roomName})\n`;
        }
        plainTextContent += "\nChi Tiết Vé:\n";
        templateData.tickets.forEach(t => {
            plainTextContent += `- Ghế: ${t.seatLabel} (${t.seatType}) - Giá: ${formatCurrency(t.price)}\n`;
        });
        if (templateData.concessions.length > 0) {
            plainTextContent += "\nSản Phẩm Kèm Theo:\n";
            templateData.concessions.forEach(c => {
                plainTextContent += `- ${c.name} (x${c.quantity}) - Thành tiền: ${formatCurrency(c.totalPrice)}\n`;
            });
        }
        plainTextContent += `\nTổng cộng: ${formatCurrency(templateData.totalAmount)}\n\n`;
        plainTextContent += `Vui lòng đến sớm trước giờ chiếu phim khoảng 15-20 phút.\n`;
        plainTextContent += `Hotline hỗ trợ: ${templateData.cinemaHotline}\n\n`;
        plainTextContent += `Trân trọng,\n${templateData.cinemaName}`;


        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: customerInfo.EMAIL, // Email khách hàng
            subject: `[${process.env.CINEMA_NAME}] Xác Nhận Đặt Vé Thành Công - Mã ĐH: ${orderDetails.MAHOADON}`,
            html: htmlContent,
            text: plainTextContent
        };
        //console.log("EmailService - sendOrderConfirmationEmail - DEBUG: mailOptions being sent:", JSON.stringify(mailOptions, null, 2));
        const info = await transporter.sendMail(mailOptions);
        console.log(`EmailService: Order confirmation email sent to ${customerInfo.Email}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error(`EmailService: Error sending order confirmation email to ${customerInfo.Email}:`, error);
        // Không re-throw lỗi để không làm dừng quy trình chính, chỉ log lại
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOrderConfirmationEmail
};