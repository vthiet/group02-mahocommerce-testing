## Sheet1
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria | Test Type | Note |
| --- | --- | --- | --- | --- | --- |
| 1. Quản lý sản phẩm (Product Management) | 1.1 List Product (Danh sách sản phẩm) | Phân quyền truy cập | Kiểm tra truy cập trang Quản lý sản phẩm với quyền Admin | Roles & Permission |   |
|   |   | Hiển thị | Kiểm tra giao diện trang Danh sách sản phẩm | GUI |   |
|   |   | Theo Tên | Kiểm tra tìm kiếm sản phẩm theo Tên chính xác | Function |   |
|   |   |   | Kiểm tra tìm kiếm sản phẩm theo từ khóa chứa một phần Tên (Partial search) | Function |   |
|   |   |   | Kiểm tra tìm kiếm với từ khóa không tồn tại | Function |   |
|   |   | Theo SKU | Kiểm tra tìm kiếm sản phẩm theo mã SKU | Function |   |
|   |   | Theo Trạng thái | Kiểm tra lọc sản phẩm theo Trạng thái | Function |   |
|   |   | Theo khoảng giá | Kiểm tra lọc sản phẩm theo khoảng giá (Price From - To) | Function |   |
|   |   | Sorting | Kiểm tra sắp xếp dữ liệu (Sorting) trên các cột | Function |   |
|   |   | Paging | Kiểm tra phân trang (Pagination) | Function |   |
|   | 1.2 Add Product (Thêm mới sản phẩm) | Trường bắt buộc | Kiểm tra lưu sản phẩm khi bỏ trống các trường bắt buộc | Field Validation |   |
|   |   | Định dạng dữ liệu - Giá (Price) | Kiểm tra nhập Giá (Price) chứa ký tự chữ cái, ký tự đặc biệt | Field Validation |   |
|   |   |   | Kiểm tra nhập Giá (Price) là số âm | Field Validation |   |
|   |   |   | Kiểm tra nhập Giá (Price) bằng 0 | Field Validation |   |
|   |   | Lưu / hủy thao tác | Kiểm tra thêm mới sản phẩm thành công với dữ liệu hợp lệ | Function |   |
|   |   |   | Kiểm tra hủy bỏ thao tác thêm mới (Back) | Function |   |
|   |   | Hiển thị | Kiểm tra giao diện trang Thêm mới sản phẩm | GUI |   |
|   |   |   | Kiểm tra hiển thị text thông báo lỗi (Validation error UI) | GUI |   |
|   | 1.3 Update Product (Cập nhật sản phẩm) | Chỉnh sửa thông tin | Kiểm tra cập nhật thông tin (Edit) sản phẩm | Function |   |
|   |   | Thay đổi trạng thái | Kiểm tra thay đổi trạng thái sản phẩm (Disable) | Function |   |
|   |   | Mass Action | Sử dụng Mass Action để thay đổi Attribute Set của 3 sản phẩm | Function |   |
|   | 1.4 Delete Product (Xóa sản phẩm) | Xóa 1 sản phẩm | Kiểm tra xóa 1 sản phẩm | Function |   |
|   |   |   | Kiểm tra hủy xác nhận khi hệ thống cảnh báo xóa | Function |   |
|   |   | Xóa nhiều sản phẩm | Kiểm tra xóa nhiều sản phẩm cùng lúc (Mass/Bulk Action) | Function |   |
| 2. Quản lý khách hàng (Customer Management) | 2.1 Danh sách khách hàng | Hiển thị | Kiểm tra hiển thị bảng và các cột mặc định | GUI |   |
|   |   | Điều hướng sang trang Edit | Kiểm tra dữ liệu Customer được truyền chính xác khi truy cập trang Edit | Function |   |
|   |   | Tìm kiếm | Tìm kiếm Customer bằng Email chính xác | Function |   |
|   |   |   | Tìm kiếm Customer bằng một phần Tên (Partial Name) | Function |   |
|   |   |   | Kiểm tra thông báo Empty State khi tìm kiếm Email sai | Function |   |
|   |   | Lọc | Lọc danh sách Customer theo Quốc gia (Country) | Function |   |
|   |   |   | Lọc theo khoảng ngày (Customer Since) và Reset Filter | Function |   |
|   |   | Sorting | Sắp xếp bảng dữ liệu theo chiều tăng/giảm của cột ID | Function |   |
|   |   | Paging | Thay đổi số lượng dòng hiển thị qua phân trang | Function |   |
|   |   | Mass Action | Sử dụng Mass Action để gán 3 Customer và quét kiểm tra toàn bộ | Function |   |
|   | 2.2 Thêm mới khách hàng | Trường bắt buộc | Bỏ trống các trường bắt buộc ở tab Account Info | Field Validation |   |
|   |   | Định dạng dữ liệu - Email | Nhập sai định dạng trường Email (Validation) | Field Validation |   |
|   |   | Định dạng dữ liệu - Password | Nhập Password không đủ độ dài tối thiểu (Validation) | Field Validation |   |
|   |   | Tương tác trên form | Checkbox "Email Link to Set Password" vô hiệu hóa trường Password | GUI |   |
|   |   |   | Hủy bỏ thay đổi nhập liệu bằng nút Reset form | Function |   |
|   |   | Địa chỉ | Bỏ trống các trường bắt buộc khi thêm Address mới | Field Validation |   |
|   |   |   | Thêm Customer 2 địa chỉ, thiết lập chéo Default Billing / Shipping | Function |   |
|   |   |   | Thêm mới Customer với đầy đủ thông tin + 1 Địa chỉ US | Function |   |
|   |   | Lưu khách hàng | Thêm mới Customer chỉ với Account Info (Happy Path Rút gọn) | Function |   |
|   |   |   | Đăng nhập Storefront thành công với tài khoản vừa tạo | Function |   |
|   | 2.3 Chỉnh sửa khách hàng | Hiển thị | Kiểm tra giao diện và các nút chức năng trên form Edit Customer | GUI |   |
|   |   | Chỉnh sửa thông tin | Cập nhật thành công thông tin cơ bản (First Name, Last Name) hợp lệ | Function |   |
|   |   | Trường bắt buộc | Xóa trống các trường bắt buộc (First Name, Email) khi đang Edit | Field Validation |   |
|   |   | Định dạng dữ liệu - Email | Nhập sai định dạng Email khi sửa thông tin Customer | Field Validation |   |
|   |   | Nhóm khách hàng & mật khẩu | Cập nhật Nhóm khách hàng (Customer Group) | Function |   |
|   |   |   | Đặt mật khẩu mới cho Customer thành công | Function |   |
|   |   | Hủy thao tác | Hủy bỏ thao tác chỉnh sửa bằng nút Back | Function |   |
|   | 2.4 Xóa & thao tác hàng loạt khách hàng | Xóa 1 khách hàng | Hủy bỏ thao tác xóa khi bấm Cancel trên hộp thoại xác nhận | Function |   |
|   |   |   | Xóa thành công Customer từ trang Edit khi bấm OK | Function |   |
| 3. Quản lý thẻ quà tặng (Gift Card Management) | 3.1 Danh sách thẻ quà tặng | Hiển thị | Kiểm tra hiển thị bảng lưới (Grid) và các cột mặc định | GUI |   |
|   |   | Paging | Sử dụng phân trang (Pagination) thông qua số lượng hiển thị (Page Size) | Function |   |
|   |   | Tìm kiếm | Tìm kiếm Gift Card bằng Code chính xác | Function |   |
|   |   |   | Tìm kiếm bản ghi bằng ID cụ thể | Function |   |
|   |   |   | Trạng thái Empty (No records) khi search mã không tồn tại | Function |   |
|   |   | Lọc | Lọc danh sách Gift Card theo trạng thái (Status) | Function |   |
|   |   |   | Lọc danh sách Gift Card theo Website | Function |   |
|   |   |   | Lọc theo khoảng thời gian (Date Range) và tính năng Hủy lọc (Reset Filter) | Function |   |
|   |   | Sorting | Sắp xếp bảng dữ liệu theo ID (Tăng/Giảm dần) | Function |   |
|   |   |   | Sắp xếp danh sách theo Balance | Function |   |
|   | 3.2 Thêm thẻ quà tặng | Trường bắt buộc | Bỏ trống các trường bắt buộc (Websites, Amount) | Field Validation |   |
|   |   | Định dạng dữ liệu - Amount | Nhập Amount không hợp lệ (số âm) | Field Validation |   |
|   |   |   | Nhập Amount không hợp lệ ( ký tự chữ và ký tự đặc biệt) | Field Validation |   |
|   |   | Định dạng dữ liệu - Email | Nhập sai định dạng Recipient Email và Sender Email | Field Validation |   |
|   |   | Trường duy nhất (Code) | Kiểm tra hệ thống văng ngoại lệ SQL Unique constraint khi nhập trùng mã Gift Card | Field Validation |   |
|   |   | Code tự sinh | Tạo Gift Card để trống Code (Tự động sinh mã - Auto-generate) | Function |   |
|   |   | Chọn nhiều Websites | Chọn nhiều Websites (Multi-select) cho một Gift Card | Function |   |
|   |   | Lưu thẻ quà tặng | Tạo Gift Card đầy đủ thông tin tùy chọn (Happy Path Full Fields) | Function |   |
|   |   |   | Tạo Gift Card với trạng thái Disabled ngay từ đầu | Function |   |
|   | 3.3 Chỉnh sửa thẻ quà tặng | Hiển thị | Kiểm tra giao diện và các nút chức năng trên form Edit | GUI |   |
|   |   | Chỉnh sửa thông tin | Cập nhật thành công thông tin Gift Card hợp lệ | Function |   |
|   |   | Trường bắt buộc | Bỏ trống các trường bắt buộc ở form Edit | Field Validation |   |
|   |   | Định dạng dữ liệu - Amount | Nhập Amount là chữ và ký tự đặc biệt khi cập nhật | Field Validation |   |
|   |   | Thay đổi trạng thái | Thay đổi trạng thái Gift Card thành Disabled | Function |   |
|   |   | Định dạng dữ liệu - Email | Nhập email không hợp lệ khi sửa thông tin Gift Card | Field Validation |   |
|   |   | Lưu & hủy thao tác | Lưu thay đổi và ở lại trang Edit bằng tính năng "Save and Continue Edit" | Function |   |
|   |   |   | Hủy bỏ chỉnh sửa và quay lại danh sách bằng nút Back | Function |   |
|   | 3.4 Xóa & thao tác hàng loạt thẻ quà tặng | Xóa thẻ quà tặng | Hủy bỏ thao tác xóa khi bấm Cancel trên hộp thoại xác nhận | Function |   |
|   |   |   | Xóa thành công Gift Card từ form Edit | Function |   |