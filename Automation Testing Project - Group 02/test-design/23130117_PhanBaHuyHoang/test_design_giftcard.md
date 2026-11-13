## Test Design - Gift Card Management
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria | Test Type | Note |
| --- | --- | --- | --- | --- | --- |
| 3. Quản lý thẻ quà tặng (Gift Card Management) | 3.1 Danh sách thẻ quà tặng | Hiển thị | Kiểm tra hiển thị bảng lưới (Grid) và các cột mặc định | GUI |  |
|  |  | Paging | Sử dụng phân trang (Pagination) thông qua số lượng hiển thị (Page Size) | Function |  |
|  |  | Tìm kiếm | Tìm kiếm Gift Card bằng Code chính xác | Function |  |
|  |  |  | Tìm kiếm bản ghi bằng ID cụ thể | Function |  |
|  |  |  | Trạng thái Empty (No records) khi search mã không tồn tại | Function |  |
|  |  | Lọc | Lọc danh sách Gift Card theo trạng thái (Status) | Function |  |
|  |  |  | Lọc danh sách Gift Card theo Website | Function |  |
|  |  |  | Lọc theo khoảng thời gian (Date Range) và tính năng Hủy lọc (Reset Filter) | Function |  |
|  |  | Sorting | Sắp xếp bảng dữ liệu theo ID (Tăng/Giảm dần) | Function |  |
|  |  |  | Sắp xếp danh sách theo Balance | Function |  |
|  | 3.2 Thêm thẻ quà tặng | Trường bắt buộc | Bỏ trống các trường bắt buộc (Websites, Amount) | Field Validation |  |
|  |  | Định dạng dữ liệu - Amount | Nhập Amount không hợp lệ (số âm) | Field Validation |  |
|  |  |  | Nhập Amount không hợp lệ ( ký tự chữ và ký tự đặc biệt) | Field Validation |  |
|  |  | Định dạng dữ liệu - Email | Nhập sai định dạng Recipient Email và Sender Email | Field Validation |  |
|  |  | Trường duy nhất (Code) | Kiểm tra hệ thống văng ngoại lệ SQL Unique constraint khi nhập trùng mã Gift Card | Field Validation |  |
|  |  | Code tự sinh | Tạo Gift Card để trống Code (Tự động sinh mã - Auto-generate) | Function |  |
|  |  | Chọn nhiều Websites | Chọn nhiều Websites (Multi-select) cho một Gift Card | Function |  |
|  |  | Lưu thẻ quà tặng | Tạo Gift Card đầy đủ thông tin tùy chọn (Happy Path Full Fields) | Function |  |
|  |  |  | Tạo Gift Card với trạng thái Disabled ngay từ đầu | Function |  |
|  | 3.3 Chỉnh sửa thẻ quà tặng | Hiển thị | Kiểm tra giao diện và các nút chức năng trên form Edit | GUI |  |
|  |  | Chỉnh sửa thông tin | Cập nhật thành công thông tin Gift Card hợp lệ | Function |  |
|  |  | Trường bắt buộc | Bỏ trống các trường bắt buộc ở form Edit | Field Validation |  |
|  |  | Định dạng dữ liệu - Amount | Nhập Amount là chữ và ký tự đặc biệt khi cập nhật | Field Validation |  |
|  |  | Thay đổi trạng thái | Thay đổi trạng thái Gift Card thành Disabled | Function |  |
|  |  | Định dạng dữ liệu - Email | Nhập email không hợp lệ khi sửa thông tin Gift Card | Field Validation |  |
|  |  | Lưu & hủy thao tác | Lưu thay đổi và ở lại trang Edit bằng tính năng "Save and Continue Edit" | Function |  |
|  |  |  | Hủy bỏ chỉnh sửa và quay lại danh sách bằng nút Back | Function |  |
|  | 3.4 Xóa & thao tác hàng loạt thẻ quà tặng | Xóa thẻ quà tặng | Hủy bỏ thao tác xóa khi bấm Cancel trên hộp thoại xác nhận | Function |  |
|  |  |  | Xóa thành công Gift Card từ form Edit | Function |  |
