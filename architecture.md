---
title: Biểu đồ Thành phần - Nghiệp vụ Tổng hợp Thống kê
---
```mermaid
graph TD
    
    component "Giao diện Báo cáo (UI)" as UI
    
    node "Thành phần Nghiệp vụ" {
        component "StatisticsComponent" as Stats {
            port " " as p_stats_in
        }
        component "OrderComponent" as Order
        component "CustomerComponent" as Customer
        component "MovieComponent" as Movie
        component "ProductComponent" as Product
        component "EmployeeComponent" as Employee
        component "FacilityRepairComponent" as Repair
    }
    
    node "Lớp Dữ liệu" {
      component "<<Database>>" as DB
    }
    
    UI --> p_stats_in
    p_stats_in -- [IBaoCaoThongKe]Stats
    
    Stats --[dashed]--> Order : Yêu cầu dữ liệu hóa đơn
    Stats --[dashed]--> Customer : Yêu cầu dữ liệu khách hàng
    Stats --[dashed]--> Movie : Yêu cầu dữ liệu phim
    Stats --[dashed]--> Product : Yêu cầu dữ liệu sản phẩm
    Stats --[dashed]--> Employee : Yêu cầu dữ liệu nhân viên
    Stats --[dashed]--> Repair : Yêu cầu dữ liệu chi phí sửa chữa
    
    Stats --[dashed]--> DB : Truy vấn phức hợp (JOIN, GROUP BY)