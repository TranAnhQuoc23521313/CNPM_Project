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
- server/middleware dùng để thực hiện các thao tác liên quan đến lưu trữ / xóa các file ảnh, poster khi được đóng gói bằng FormData ở client, đồng thời phân luồng api theo hoạt động của các user dựa trên token đăng nhập của tài khoản
- server/repositories dùng để nhận tín hiệu từ server/service để thực hiện truy vấn vào database
- server/routes nhận tính hiệu từ server.js sau đó lựa chọn thao thác phù hợp cho yêu cầu và gửi đến Controller
- server/services nhận yêu cầu từ controller và chuyển tiếp đến Repositories để thực hiện yêu cầu.
- server.js nhận tín hiệu giao tiếp giữa các PORT sau đó truyền tín hiệu cho routes để thực hiện các yêu cầu gửi từ client

## 15. Phân chia vai trò công việc

| **Công việc**                          | **Trần Anh Quốc**<br>23521313 | **Trần Nhật Quang**<br>23521292 | **Nguyễn Văn Quyền**<br>23521329 | **Nguyễn Minh Quốc**<br>23521304 |
|----------------------------------------|:------------------------------:|:-------------------------------:|:--------------------------------:|:--------------------------------:|
| Khảo sát hiện trạng                   | x                              | x                               |                                  | x                               |
| Xác định yêu cầu                      | x                              | x                               | x                                | x                               |
| Thiết kế sơ đồ luồng dữ liệu         | x                              |                                 | x                                | x                               |
| Thiết kế kiến trúc hệ thống          | x                              |                                 | x                                |                                 |
| Vẽ mô tả Use Case                    | x                              | x                               | x                                |                                 |
| Vẽ các sơ đồ về hệ thống             | x                              | x                               | x                                |                                 |
| Thiết kế cơ sở dữ liệu               | x                              | x                               | x                                |                                 |
| Thiết kế giao diện                   | x                              |                                 |                                  | x                               |
| Thiết kế API                         |                                |                                 | x                                | x                               |
| Kiểm thử ứng dụng                    |                                | x                               | x                                | x                               |
| Các bài tập nhóm trong quá trình học | x                              | x                               |                                  | x                               |
| **Mức độ đóng góp cho đồ án**        | **30**                         | **30**                          | **20**                           | **20**                          |

---

### 📌 Lưu ý:
- Bảng phân công thể hiện sự tham gia của các thành viên trong từng công việc được liệt kê.
- Mức độ đánh giá đóng góp cho đồ án được tính dựa trên **khối lượng công việc** của mỗi cá nhân được giao, khối lượng các công việc đó là không giống nhau nên dù làm cùng, ít hay nhiều hơn nhưng **mức độ vẫn có thể sẽ khác nhau**.
- **Báo cáo do tất cả các thành viên cùng viết**.

---

### ✅ Nhận xét:
- Các thành viên dù vẫn có vài công việc vẫn còn **chậm tiến độ**, nhưng nhìn chung vẫn đảm bảo được tiến độ chung của đồ án.
- Các thành viên **hỗ trợ lẫn nhau** trong suốt quá trình thực hiện.
- **Thường xuyên tổ chức họp**, trao đổi online hoặc trực tiếp với nhau đạt hiệu suất tốt.
- **Mọi người đóng góp nhiều ý kiến**, giúp cải thiện chất lượng đồ án.
