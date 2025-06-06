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

# Sơ đồ kiến trúc của ứng dụng

### Sơ đồ Kiến trúc Hệ thống - CNPM Project

```mermaid
graph TD
    %% ----- Actors (Người dùng) -----
    user("👨‍💻<br>Staff")
    admin("👑<br>Admin")

    %% ----- External Systems (Hệ thống bên ngoài) -----
    email_service["✉️<br>Dịch vụ Email<br>(Nodemailer, SendGrid...)"]

    %% ----- Your System Boundary (Hộp chứa hệ thống của bạn) -----
    subgraph "Hệ thống CNPM Project"
        direction LR

        %% ----- Containers (Các thành phần chính của bạn) -----
        webapp["<b>Web Application (Client)</b><br><i>Công nghệ: React.js, Tailwind CSS</i><br>Giao diện người dùng chạy trên trình duyệt."]
        
        api["<b>Backend API (Server)</b><br><i>Công nghệ: Node.js, Express.js</i><br>Xử lý logic, nghiệp vụ, xác thực và quản lý dữ liệu."]
        
        db[("<b>Database</b><br><i>(Cần xác nhận: MySql)</i><br>Lưu trữ dữ liệu ứng dụng.")]

    end

    %% ----- Connections (Các luồng tương tác) -----
    
    %% User -> Frontend
    user -- "Sử dụng trình duyệt (HTTPS)" --> webapp
    admin -- "Sử dụng trình duyệt (HTTPS)" --> webapp

    %% Frontend -> Backend
    webapp -- "Gọi API (REST/GraphQL, JSON)" --> api

    %% Backend -> Other Services
    api -- "Đọc/Ghi dữ liệu (SQL/NoSQL)" --> db
    api -- "Gửi email (SMTP/API)" --> email_service



graph TD
    %% ----- Actors (Người dùng với các vai trò khác nhau) -----
    admin("👑<br>Quản trị viên")
    staff("👩‍💼<br>Nhân viên")

    subgraph "Máy tính của người dùng"
        browser["🌐<br>Trình duyệt Web"]
    end
    
    %% ----- CLIENT (Chạy trên trình duyệt) -----
    subgraph "CLIENT<br>(Code trong thư mục /client)"
        style CLIENT fill:#D2E9FF,stroke:#333,stroke-width:2px
        
        subgraph "React Application"
            direction LR
            
            client_router["<b>Routing</b><br><i>(react-router-dom)</i><br>Điều hướng giữa các trang Login, Admin, Staff"]
            client_views["<b>Views / Pages</b><br><i>(src/admin, src/staff)</i><br>Các trang quản lý, chứa logic nghiệp vụ phía client"]
            client_components["<b>UI Components</b><br>Các thành phần giao diện tái sử dụng"]
            client_services["<b>API Services</b><br><i>(services)</i><br>Gọi API đến Server"]
        end
    end
    
    %% ----- SERVER (Chạy trên máy chủ) -----
    subgraph "SERVER<br>(Code trong thư mục /server)"
        style SERVER fill:#E2D2FF,stroke:#333,stroke-width:2px

        subgraph "Node.js API Server"
            direction TB
            
            server_routes["<b>Routes</b><br>Định nghĩa các endpoint API"]
            server_middlewares["<b>Middlewares</b><br>Xác thực token, xử lý lỗi"]
            server_controllers["<b>Controllers</b><br>Nhận request, gọi services"]
            server_services["<b>Services</b><br>Thực thi logic nghiệp vụ chính"]
            server_repositories["<b>Repositories</b><br>Trừu tượng hóa truy vấn CSDL"]
        end

        database[("<b>Database</b><br><i>(MongoDB, PostgreSQL)</i>")]
    end

    %% ----- Define Relationships -----
    admin -- "Sử dụng" --> browser
    staff -- "Sử dụng" --> browser

    browser -- "Tải và chạy" --> client_router
    client_router -- "Render" --> client_views
    client_views -- "Sử dụng" --> client_components
    client_views -- "Gọi hàm" --> client_services
    
    client_services -- "<b>Gửi HTTP Request</b>" --> server_routes
    
    server_routes --> server_middlewares
    server_middlewares --> server_controllers
    server_controllers --> server_services
    server_services --> server_repositories
    server_repositories -- "Đọc/Ghi dữ liệu" --> database