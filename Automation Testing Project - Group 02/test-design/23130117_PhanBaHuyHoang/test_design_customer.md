## Test Design - Customer Management
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria | Test Type | Note |
| --- | --- | --- | --- | --- | --- |
| 2. Quản lý khách hàng (Customer Management) | 2.1 Danh sách khách hàng | Hiển thị | Kiểm tra hiển thị bảng và các cột mặc định | GUI |  |
|  |  | Điều hướng sang trang Edit | Kiểm tra dữ liệu Customer được truyền chính xác khi truy cập trang Edit | Function |  |
|  |  | Tìm kiếm | Tìm kiếm Customer bằng Email chính xác | Function |  |
|  |  |  | Tìm kiếm Customer bằng một phần Tên (Partial Name) | Function |  |
|  |  |  | Kiểm tra thông báo Empty State khi tìm kiếm Email sai | Function |  |
|  |  | Lọc | Lọc danh sách Customer theo Quốc gia (Country) | Function |  |
|  |  |  | Lọc theo khoảng ngày (Customer Since) và Reset Filter | Function |  |
|  |  | Sorting | Sắp xếp bảng dữ liệu theo chiều tăng/giảm của cột ID | Function |  |
|  |  | Paging | Thay đổi số lượng dòng hiển thị qua phân trang | Function |  |
|  |  | Mass Action | Sử dụng Mass Action để gán 3 Customer và quét kiểm tra toàn bộ | Function |  |
|  | 2.2 Thêm mới khách hàng | Trường bắt buộc | Bỏ trống các trường bắt buộc ở tab Account Info | Field Validation |  |
|  |  | Định dạng dữ liệu - Email | Nhập sai định dạng trường Email (Validation) | Field Validation |  |
|  |  | Định dạng dữ liệu - Password | Nhập Password không đủ độ dài tối thiểu (Validation) | Field Validation |  |
|  |  | Tương tác trên form | Checkbox "Email Link to Set Password" vô hiệu hóa trường Password | GUI |  |
|  |  |  | Hủy bỏ thay đổi nhập liệu bằng nút Reset form | Function |  |
|  |  | Địa chỉ | Bỏ trống các trường bắt buộc khi thêm Address mới | Field Validation |  |
|  |  |  | Thêm Customer 2 địa chỉ, thiết lập chéo Default Billing / Shipping | Function |  |
|  |  |  | Thêm mới Customer với đầy đủ thông tin + 1 Địa chỉ US | Function |  |
|  |  | Lưu khách hàng | Thêm mới Customer chỉ với Account Info (Happy Path Rút gọn) | Function |  |
|  |  |  | Đăng nhập Storefront thành công với tài khoản vừa tạo | Function |  |
|  | 2.3 Chỉnh sửa khách hàng | Hiển thị | Kiểm tra giao diện và các nút chức năng trên form Edit Customer | GUI |  |
|  |  | Chỉnh sửa thông tin | Cập nhật thành công thông tin cơ bản (First Name, Last Name) hợp lệ | Function |  |
|  |  | Trường bắt buộc | Xóa trống các trường bắt buộc (First Name, Email) khi đang Edit | Field Validation |  |
|  |  | Định dạng dữ liệu - Email | Nhập sai định dạng Email khi sửa thông tin Customer | Field Validation |  |
|  |  | Nhóm khách hàng & mật khẩu | Cập nhật Nhóm khách hàng (Customer Group) | Function |  |
|  |  |  | Đặt mật khẩu mới cho Customer thành công | Function |  |
|  |  | Hủy thao tác | Hủy bỏ thao tác chỉnh sửa bằng nút Back | Function |  |
|  | 2.4 Xóa & thao tác hàng loạt khách hàng | Xóa 1 khách hàng | Hủy bỏ thao tác xóa khi bấm Cancel trên hộp thoại xác nhận | Function |  |
|  |  |  | Xóa thành công Customer từ trang Edit khi bấm OK | Function |  |
