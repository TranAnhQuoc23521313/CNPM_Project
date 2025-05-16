# CNPM_Project

---
* Tên đồ án: Quản lý rạp chiếu phim ( dành cho quản lý và nhân viên)

---

Thành viên thực hiện: 

|   Thành viên    | 
|-----------------|
| Trần Anh Quốc   |
| Trần Nhật Quang |
| Nguyễn Văn Quyền|
| Nguyễn Minh Quốc|

---

## Cách push lên github

- Không commit trực tiếp lên main trừ Leader
- Chỉ được commit lên branch 
- Cách đặt tên branch: Tên file ( không cần đuôi file )
- Khi commit cần comment tóm tắt tác dụng của script vừa viết hoặc thông tin thay đổi gì so với trước

---
## Đọc Note.txt trong mỗi folder client / server để hiễu rõ cấu trúc file và mô hình đang sử dụng

---
# Cấu trúc thư mục:

- client/src/pages dùng để chứa các file .jsx và .css của giao diện từng chức năng của từng folder con ( ví dụ: Movies, Showtimes, ... )
- client/src/routes dùng để liên kết các giao diện lại thành một thể
- client/src/service dùng để nhận API từ server

- server/config dùng để thiết lập liên kết database
- server/controller điều kiển các thao tác và gửi yêu cầu cần thực hiện truy vấn đến services
- server/middleware dùng để thực hiện các thao tác liên quan đến lưu trữ / xóa các file ảnh, poster, ... ( cần chứa trên đồ án do database quản lý = link )
- server/repositories dùng để nhận tín hiệu từ server/service để thực hiện truy vấn vào database
- server/routes nhận tính hiệu từ server.js sau đó lựa chọn thao thác phù hợp cho yêu cầu và gửi đến Controller
- server/services nhận yêu cầu từ controller và chuyển tiếp đến Repositories để thực hiện yêu cầu.
- server.js nhận tín hiệu giao tiếp giữa các PORT sau đó truyền tín hiệu cho routes để thực hiện các yêu cầu gửi từ client
