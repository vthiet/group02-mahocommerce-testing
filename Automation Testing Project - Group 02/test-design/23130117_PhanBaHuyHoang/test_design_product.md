## Test Design - Product Management
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria | Test Type | Note |
| --- | --- | --- | --- | --- | --- |
| 1. Quản lý sản phẩm (Product Management) | 1.1 List Product (Danh sách sản phẩm) | Phân quyền truy cập | Kiểm tra truy cập trang Quản lý sản phẩm với quyền Admin | Roles & Permission |  |
|  |  | Hiển thị | Kiểm tra giao diện trang Danh sách sản phẩm | GUI |  |
|  |  | Theo Tên | Kiểm tra tìm kiếm sản phẩm theo Tên chính xác | Function |  |
|  |  |  | Kiểm tra tìm kiếm sản phẩm theo từ khóa chứa một phần Tên (Partial search) | Function |  |
|  |  |  | Kiểm tra tìm kiếm với từ khóa không tồn tại | Function |  |
|  |  | Theo SKU | Kiểm tra tìm kiếm sản phẩm theo mã SKU | Function |  |
|  |  | Theo Trạng thái | Kiểm tra lọc sản phẩm theo Trạng thái | Function |  |
|  |  | Theo khoảng giá | Kiểm tra lọc sản phẩm theo khoảng giá (Price From - To) | Function |  |
|  |  | Sorting | Kiểm tra sắp xếp dữ liệu (Sorting) trên các cột | Function |  |
|  |  | Paging | Kiểm tra phân trang (Pagination) | Function |  |
|  | 1.2 Add Product (Thêm mới sản phẩm) | Trường bắt buộc | Kiểm tra lưu sản phẩm khi bỏ trống các trường bắt buộc | Field Validation |  |
|  |  | Định dạng dữ liệu - Giá (Price) | Kiểm tra nhập Giá (Price) chứa ký tự chữ cái, ký tự đặc biệt | Field Validation |  |
|  |  |  | Kiểm tra nhập Giá (Price) là số âm | Field Validation |  |
|  |  |  | Kiểm tra nhập Giá (Price) bằng 0 | Field Validation |  |
|  |  | Lưu / hủy thao tác | Kiểm tra thêm mới sản phẩm thành công với dữ liệu hợp lệ | Function |  |
|  |  |  | Kiểm tra hủy bỏ thao tác thêm mới (Back) | Function |  |
|  |  | Hiển thị | Kiểm tra giao diện trang Thêm mới sản phẩm | GUI |  |
|  |  |  | Kiểm tra hiển thị text thông báo lỗi (Validation error UI) | GUI |  |
|  | 1.3 Update Product (Cập nhật sản phẩm) | Chỉnh sửa thông tin | Kiểm tra cập nhật thông tin (Edit) sản phẩm | Function |  |
|  |  | Thay đổi trạng thái | Kiểm tra thay đổi trạng thái sản phẩm (Disable) | Function |  |
|  |  | Mass Action | Sử dụng Mass Action để thay đổi Attribute Set của 3 sản phẩm | Function |  |
|  | 1.4 Delete Product (Xóa sản phẩm) | Xóa 1 sản phẩm | Kiểm tra xóa 1 sản phẩm | Function |  |
|  |  |  | Kiểm tra hủy xác nhận khi hệ thống cảnh báo xóa | Function |  |
|  |  | Xóa nhiều sản phẩm | Kiểm tra xóa nhiều sản phẩm cùng lúc (Mass/Bulk Action) | Function |  |
