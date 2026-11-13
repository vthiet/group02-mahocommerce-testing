## Cover
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 |
| --- | --- | --- | --- | --- | --- | --- |
| NaN | TEST CASE | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | Project Name | Group02-MahoCommerce-Testing | NaN | NaN | Creator | Phan Bá Huy Hoàng |
| NaN | Project Code | Group02-MahoCommerce-Testing | NaN | NaN | Reviewer/Approver | Võ Văn Thiệt |
| NaN | Document Code | Group02-MahoCommerce-Testing\_TestCase\_V0.1 | NaN | NaN | Issue Date | 2026-10-23 00:00:00 |
| NaN | NaN | NaN | NaN | NaN | Version | 0.2 |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | Record of change | NaN | NaN | NaN | NaN | NaN |
| NaN | Effective Date | Version | Change Item | \*A,D,M | Change description | Reference |
| NaN | 2026-10-23 00:00:00 | 0.1 | NaN | A | Tạo mới Test case List và Test Design cho 3 chức năng quản lý sản phẩm, quản lý thẻ quà tặng và quản lý người dùng. Thêm Test case chi tiết cho chức năng quản lý sản phẩm. | NaN |
| NaN | 2026-10-29 00:00:00 | 0.2 | NaN | M | Thêm các sheet Test case chi tiết cho 2 chức năng quản lý thẻ quà tặng và quản lý người dùng. | NaN |

## Test case List
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | TEST CASE LIST | Unnamed: 4 | Unnamed: 5 |
| --- | --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | Project Name | NaN | Group02-MahoCommerce-Testing | NaN | NaN |
| NaN | Project Code | NaN | Group02-MahoCommerce-Testing | NaN | NaN |
| NaN | Test Environment Setup Description | NaN | <List enviroment requires in this system\n1. Hệ thống: Maho Commerce, được host bởi bên thứ ba (không truy cập được server / database)\n2. URL kiểm thử: Storefront <https://demo.mahocommerce.com/default/>; Admin <https://demo.mahocommerce.com/admin2941834>\n3. Loại môi trường: <Demo>; phiên bản Maho: <26.11.0>\n4. Hệ điều hành: <Windows 11>\n5. Trình duyệt: Chrome <Version 156.0.8078.47>, Edge <Version 155.0.4283.62>;\n6. Tài khoản test: Admin toàn quyền; Customer đăng nhập storefront; \n7. Dữ liệu test: Dữ liệu do <Maho Commerce cung cấp>\n8. Email: 23130117@st.hcmuaf.edu.vn\n9. Giới hạn: không truy cập server và database; không đổi được cấu hình hệ thống\n> | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | No | Function Name | Sheet Name | Description | Pre-Condition |
| NaN | 1 | List Product (Danh sách sản phẩm) | List Product | Kiểm thử màn hình Danh sách sản phẩm (9 test case, ID PROD\_MGT\_Access\_01, View\_01, Search\_01–03, Filter\_01–02, Sort\_01, Paginate\_01): truy cập trang Quản lý sản phẩm với quyền Admin; giao diện trang danh sách; tìm kiếm theo một phần Tên, từ khóa không tồn tại và mã SKU; lọc theo Trạng thái và khoảng giá; sắp xếp theo cột; phân trang. | -Có tài khoản Admin toàn quyền, Staff không có quyền Product và trạng thái chưa đăng nhập (Guest)\n- Có dữ liệu sản phẩm mẫu (≥50 SP, cả Enable và Disable, SKU G-HAND-CREAM-CITRUS, AT-002, SM-01)\n- Danh sách hiển thị 20 sản phẩm / trang |
| NaN | 2 | Add Product (Thêm mới sản phẩm) | Add Product | Kiểm thử chức năng Thêm mới sản phẩm (8 test case, ID PROD\_MGT\_Create\_01–08): bỏ trống các trường bắt buộc; nhập Giá (Price) chứa chữ cái / ký tự đặc biệt, số âm, bằng 0; thêm mới thành công với dữ liệu hợp lệ; hủy thao tác bằng nút Back; giao diện form Thêm mới và hiển thị text thông báo lỗi validation. | - Đăng nhập bằng tài khoản Admin toàn quyền\n- Đã có sản phẩm với SKU tồn tại (dùng cho case trùng SKU)\n- Chuẩn bị file ảnh hợp lệ, sai định dạng và vượt dung lượng cho case upload ảnh |
| NaN | 3 | Update Product (Cập nhật sản phẩm) | Update Product | Kiểm thử chức năng Cập nhật sản phẩm (3 test case, ID PROD\_MGT\_Update\_01–03): chỉnh sửa thông tin sản phẩm (đổi Giá); thay đổi trạng thái sang Disable; Mass Action 'Change Attribute Set' (Electronics) cho 3 sản phẩm. | - Đăng nhập bằng tài khoản Admin toàn quyền\n- Có ít nhất 1 sản phẩm đang Enable và 1 sản phẩm đang Disable |
| NaN | 4 | Delete Product (Xóa sản phẩm) | Delete Product | Kiểm thử chức năng Xóa sản phẩm (3 test case, ID PROD\_MGT\_Delete\_01–03): xóa 1 sản phẩm (bấm OK trên popup xác nhận); hủy xóa (bấm Cancel); xóa nhiều sản phẩm cùng lúc bằng Mass Action Delete. | - Đăng nhập bằng tài khoản Admin toàn quyền\n- Có ít nhất 3 sản phẩm dùng riêng cho test xóa (không ảnh hưởng dữ liệu các sheet khác) |
| NaN | 5 | Danh sách khách hàng | List Customer | Kiểm thử màn hình Manage Customers (10 test case, ID CUST\_MGT\_View\_01–02, Search\_01–03, Filter\_01–02, Sort\_01, Paginate\_01, Mass\_Action\_01): hiển thị bảng và các cột mặc định; dữ liệu truyền sang trang Edit; tìm kiếm theo Email chính xác, một phần Tên, Email không tồn tại (Empty State); lọc theo Country và khoảng ngày Customer Since kèm Reset Filter; sắp xếp theo cột ID; thay đổi số dòng / trang (Items per page); Mass Action gán Customer Group cho 3 khách hàng. | - Đã đăng nhập Admin\n- Có hơn 20 khách hàng thuộc nhiều Group / Country, tên tiếng Việt có dấu, ngày tạo khác nhau |
| NaN | 6 | Thêm mới khách hàng | Add Customer | Kiểm thử form Add New Customer (10 test case, ID CUST\_MGT\_Create\_01–10): bỏ trống trường bắt buộc ở tab Account Information; sai định dạng Email; Password không đủ độ dài tối thiểu; checkbox 'Email Link to Set Password' vô hiệu hóa trường Password; nút Reset form; tab Addresses (bỏ trống trường bắt buộc, thêm 2 địa chỉ với Default Billing / Shipping, địa chỉ US); lưu khách hàng chỉ với Account Info; đăng nhập Storefront bằng tài khoản vừa tạo. | - Đã đăng nhập Admin\n- Có khách hàng email an.nguyen@example.com ở Website A (kiểm tra email trùng)\n- Storefront truy cập được để kiểm tra đăng nhập |
| NaN | 7 | Chỉnh sửa khách hàng | Update Customer | Kiểm thử trang chỉnh sửa khách hàng (7 test case, ID CUST\_MGT\_View\_03, Update\_01–06): giao diện và các nút chức năng trên form Edit; cập nhật First Name / Last Name; xóa trống trường bắt buộc (First Name, Email); sai định dạng Email; đổi Customer Group; đặt mật khẩu mới (xác nhận bằng Current Admin Password); hủy chỉnh sửa bằng nút Back. | - Đã đăng nhập Admin\n- Có khách hàng đã từng đăng nhập storefront, có ≥2 địa chỉ\n- Có khách hàng khác dùng email an.nguyen@example.com |
| NaN | 8 | Xóa & thao tác hàng loạt khách hàng | Delete Customer | Kiểm thử xóa khách hàng từ trang Edit (2 test case, ID CUST\_MGT\_Delete\_01–02): hủy xóa khi bấm Cancel trên hộp thoại xác nhận; xóa thành công khi bấm OK. | - Đã đăng nhập Admin\n- Có ≥3 khách hàng test (một khách chưa có đơn, một khách đã có đơn)\n- Có khách hàng chưa đăng ký newsletter |
| NaN | 9 | Danh sách thẻ quà tặng | List Gift Card | Kiểm thử màn hình Manage Gift Cards (10 test case, ID GIFT\_MGT\_View\_01, Paginate\_01, Search\_01–03, Filter\_01–03, Sort\_01–02): hiển thị bảng lưới và các cột mặc định; đổi Page Size (50 bản ghi / trang); tìm kiếm theo Code chính xác, theo ID và khi mã không tồn tại (No records); lọc theo Status, Website, khoảng thời gian (Created) kèm Reset Filter; sắp xếp theo ID và Balance. | - Đã đăng nhập Admin\n- Có hơn 20 thẻ ở đủ 4 trạng thái Active / Used / Expired / Disabled, Balance khác nhau (20, 50, 100, 200, 300) |
| NaN | 10 | Thêm thẻ quà tặng | Add Gift Card | Kiểm thử form New Gift Card (9 test case, ID GIFT\_MGT\_Create\_01–09): bỏ trống trường bắt buộc (Websites, Amount); Amount không hợp lệ (số âm, chữ và ký tự đặc biệt); sai định dạng Recipient Email / Sender Email; nhập trùng Code (lỗi SQL Unique constraint); để trống Code (tự sinh mã); chọn nhiều Websites; tạo thẻ đầy đủ thông tin tùy chọn; tạo thẻ với Status Disabled. | - Đã đăng nhập Admin\n- Gift Cards đã bật: System > Configuration > Sales > Gift Cards (đã cấu hình Code Length, Code Prefix)\n- Có thẻ Code GIFT2026ABC (kiểm tra Code trùng) |
| NaN | 11 | Chỉnh sửa thẻ quà tặng | Update Gift Card | Kiểm thử trang chỉnh sửa Gift Card (8 test case, ID GIFT\_MGT\_View\_02, Update\_01–07): giao diện và các nút chức năng trên form Edit; cập nhật Recipient Name / Message; bỏ trống trường bắt buộc (Amount, Websites); nhập Amount là chữ và ký tự đặc biệt; Recipient Email sai định dạng; đổi Status sang Disabled; 'Save and Continue Edit' (Admin Comment); hủy chỉnh sửa bằng nút Back. | - Đã đăng nhập Admin\n- Có thẻ Active, Used; thẻ có và không có Recipient Email |
| NaN | 12 | Xóa thẻ quà tặng | Delete Gift Card | Kiểm thử xóa Gift Card từ trang Edit (2 test case, ID GIFT\_MGT\_Delete\_01–02): hủy xóa khi bấm Cancel trên hộp thoại xác nhận; xóa thành công khi bấm OK. | - Đã đăng nhập Admin\n- Có ≥3 thẻ test chưa có giao dịch |

## TestDesign
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria | Test Type | Note |
| --- | --- | --- | --- | --- | --- |
| 1. Quản lý sản phẩm (Product Management) | 1.1 List Product (Danh sách sản phẩm) | Phân quyền truy cập | Kiểm tra truy cập trang Quản lý sản phẩm với quyền Admin | Roles & Permission | PROD\_MGT\_Access\_01 |
| NaN | NaN | Hiển thị | Kiểm tra giao diện trang Danh sách sản phẩm | GUI | PROD\_MGT\_View\_01 |
| NaN | NaN | Theo Tên | Kiểm tra tìm kiếm sản phẩm theo Tên chính xác | Function | PROD\_MGT\_Search\_01 |
| NaN | NaN | NaN | Kiểm tra tìm kiếm sản phẩm theo từ khóa chứa một phần Tên (Partial search) | Function | PROD\_MGT\_Search\_02 |
| NaN | NaN | NaN | Kiểm tra tìm kiếm với từ khóa không tồn tại | Function | PROD\_MGT\_Search\_03 |
| NaN | NaN | Theo SKU | Kiểm tra tìm kiếm sản phẩm theo mã SKU | Function | PROD\_MGT\_Search\_04 |
| NaN | NaN | Theo Trạng thái | Kiểm tra lọc sản phẩm theo Trạng thái | Function | PROD\_MGT\_Filter\_01 |
| NaN | NaN | Theo khoảng giá | Kiểm tra lọc sản phẩm theo khoảng giá (Price From - To) | Function | PROD\_MGT\_Filter\_02 |
| NaN | NaN | Sorting | Kiểm tra sắp xếp dữ liệu (Sorting) trên các cột | Function | PROD\_MGT\_Sort\_01 |
| NaN | NaN | Paging | Kiểm tra phân trang (Pagination) | Function | PROD\_MGT\_Paginate\_01 |
| NaN | 1.2 Add Product (Thêm mới sản phẩm) | Trường bắt buộc | Kiểm tra lưu sản phẩm khi bỏ trống các trường bắt buộc | Field Validation | PROD\_MGT\_Create\_01 |
| NaN | NaN | Định dạng dữ liệu - Giá (Price) | Kiểm tra nhập Giá (Price) chứa ký tự chữ cái, ký tự đặc biệt | Field Validation | PROD\_MGT\_Create\_02 |
| NaN | NaN | NaN | Kiểm tra nhập Giá (Price) là số âm | Field Validation | PROD\_MGT\_Create\_03 |
| NaN | NaN | NaN | Kiểm tra nhập Giá (Price) bằng 0 | Field Validation | PROD\_MGT\_Create\_04 |
| NaN | NaN | Lưu / hủy thao tác | Kiểm tra thêm mới sản phẩm thành công với dữ liệu hợp lệ | Function | PROD\_MGT\_Create\_06 |
| NaN | NaN | NaN | Kiểm tra hủy bỏ thao tác thêm mới (Back) | Function | PROD\_MGT\_Create\_07 |
| NaN | NaN | Hiển thị | Kiểm tra giao diện trang Thêm mới sản phẩm | GUI | PROD\_MGT\_Create\_08 |
| NaN | NaN | NaN | Kiểm tra hiển thị text thông báo lỗi (Validation error UI) | GUI | PROD\_MGT\_Create\_09 |
| NaN | 1.3 Update Product (Cập nhật sản phẩm) | Chỉnh sửa thông tin | Kiểm tra cập nhật thông tin (Edit) sản phẩm | Function | PROD\_MGT\_Update\_01 |
| NaN | NaN | Thay đổi trạng thái | Kiểm tra thay đổi trạng thái sản phẩm (Disable) | Function | PROD\_MGT\_Update\_02 |
| NaN | NaN | Mass Action | Sử dụng Mass Action để thay đổi Attribute Set của 3 sản phẩm | Function | PROD\_MGT\_Update\_01 |
| NaN | 1.4 Delete Product (Xóa sản phẩm) | Xóa 1 sản phẩm | Kiểm tra xóa 1 sản phẩm | Function | PROD\_MGT\_Delete\_01 |
| NaN | NaN | NaN | Kiểm tra hủy xác nhận khi hệ thống cảnh báo xóa | Function | PROD\_MGT\_Delete\_02 |
| NaN | NaN | Xóa nhiều sản phẩm | Kiểm tra xóa nhiều sản phẩm cùng lúc (Mass/Bulk Action) | Function | PROD\_MGT\_Delete\_03 |
| 2. Quản lý khách hàng (Customer Management) | 2.1 Danh sách khách hàng | Hiển thị | Kiểm tra hiển thị bảng và các cột mặc định | GUI | CUST\_MGT\_View\_01 |
| NaN | NaN | Điều hướng sang trang Edit | Kiểm tra dữ liệu Customer được truyền chính xác khi truy cập trang Edit | Function | CUST\_MGT\_View\_02 |
| NaN | NaN | Tìm kiếm | Tìm kiếm Customer bằng Email chính xác | Function | CUST\_MGT\_Search\_01 |
| NaN | NaN | NaN | Tìm kiếm Customer bằng một phần Tên (Partial Name) | Function | CUST\_MGT\_Search\_02 |
| NaN | NaN | NaN | Kiểm tra thông báo Empty State khi tìm kiếm Email sai | Function | CUST\_MGT\_Search\_03 |
| NaN | NaN | Lọc | Lọc danh sách Customer theo Quốc gia (Country) | Function | CUST\_MGT\_Filter\_01 |
| NaN | NaN | NaN | Lọc theo khoảng ngày (Customer Since) và Reset Filter | Function | CUST\_MGT\_Filter\_02 |
| NaN | NaN | Sorting | Sắp xếp bảng dữ liệu theo chiều tăng/giảm của cột ID | Function | CUST\_MGT\_Sort\_01 |
| NaN | NaN | Paging | Thay đổi số lượng dòng hiển thị qua phân trang | Function | CUST\_MGT\_Paginate\_01 |
| NaN | NaN | Mass Action | Sử dụng Mass Action để gán 3 Customer và quét kiểm tra toàn bộ | Function | CUST\_MGT\_Mass\_Action\_01 |
| NaN | 2.2 Thêm mới khách hàng | Trường bắt buộc | Bỏ trống các trường bắt buộc ở tab Account Info | Field Validation | CUST\_MGT\_Create\_01 |
| NaN | NaN | Định dạng dữ liệu - Email | Nhập sai định dạng trường Email (Validation) | Field Validation | CUST\_MGT\_Create\_02 |
| NaN | NaN | Định dạng dữ liệu - Password | Nhập Password không đủ độ dài tối thiểu (Validation) | Field Validation | CUST\_MGT\_Create\_03 |
| NaN | NaN | Tương tác trên form | Checkbox "Email Link to Set Password" vô hiệu hóa trường Password | GUI | CUST\_MGT\_Create\_04 |
| NaN | NaN | NaN | Hủy bỏ thay đổi nhập liệu bằng nút Reset form | Function | CUST\_MGT\_Create\_05 |
| NaN | NaN | Địa chỉ | Bỏ trống các trường bắt buộc khi thêm Address mới | Field Validation | CUST\_MGT\_Create\_06 |
| NaN | NaN | NaN | Thêm Customer 2 địa chỉ, thiết lập chéo Default Billing / Shipping | Function | CUST\_MGT\_Create\_07 |
| NaN | NaN | NaN | Thêm mới Customer với đầy đủ thông tin + 1 Địa chỉ US | Function | CUST\_MGT\_Create\_08 |
| NaN | NaN | Lưu khách hàng | Thêm mới Customer chỉ với Account Info (Happy Path Rút gọn) | Function | CUST\_MGT\_Create\_09 |
| NaN | NaN | NaN | Đăng nhập Storefront thành công với tài khoản vừa tạo | Function | CUST\_MGT\_Create\_10 |
| NaN | 2.3 Chỉnh sửa khách hàng | Hiển thị | Kiểm tra giao diện và các nút chức năng trên form Edit Customer | GUI | CUST\_MGT\_View\_03 |
| NaN | NaN | Chỉnh sửa thông tin | Cập nhật thành công thông tin cơ bản (First Name, Last Name) hợp lệ | Function | CUST\_MGT\_Update\_01 |
| NaN | NaN | Trường bắt buộc | Xóa trống các trường bắt buộc (First Name, Email) khi đang Edit | Field Validation | CUST\_MGT\_Update\_02 |
| NaN | NaN | Định dạng dữ liệu - Email | Nhập sai định dạng Email khi sửa thông tin Customer | Field Validation | CUST\_MGT\_Update\_03 |
| NaN | NaN | Nhóm khách hàng & mật khẩu | Cập nhật Nhóm khách hàng (Customer Group) | Function | CUST\_MGT\_Update\_04 |
| NaN | NaN | NaN | Đặt mật khẩu mới cho Customer thành công | Function | CUST\_MGT\_Update\_05 |
| NaN | NaN | Hủy thao tác | Hủy bỏ thao tác chỉnh sửa bằng nút Back | Function | CUST\_MGT\_Update\_06 |
| NaN | 2.4 Xóa & thao tác hàng loạt khách hàng | Xóa 1 khách hàng | Hủy bỏ thao tác xóa khi bấm Cancel trên hộp thoại xác nhận | Function | CUST\_MGT\_Delete\_01 |
| NaN | NaN | NaN | Xóa thành công Customer từ trang Edit khi bấm OK | Function | CUST\_MGT\_Delete\_02 |
| 3. Quản lý thẻ quà tặng (Gift Card Management) | 3.1 Danh sách thẻ quà tặng | Hiển thị | Kiểm tra hiển thị bảng lưới (Grid) và các cột mặc định | GUI | GIFT\_MGT\_View\_01 |
| NaN | NaN | Paging | Sử dụng phân trang (Pagination) thông qua số lượng hiển thị (Page Size) | Function | GIFT\_MGT\_Paginate\_01 |
| NaN | NaN | Tìm kiếm | Tìm kiếm Gift Card bằng Code chính xác | Function | GIFT\_MGT\_Search\_01 |
| NaN | NaN | NaN | Tìm kiếm bản ghi bằng ID cụ thể | Function | GIFT\_MGT\_Search\_02 |
| NaN | NaN | NaN | Trạng thái Empty (No records) khi search mã không tồn tại | Function | GIFT\_MGT\_Search\_03 |
| NaN | NaN | Lọc | Lọc danh sách Gift Card theo trạng thái (Status) | Function | GIFT\_MGT\_Filter\_01 |
| NaN | NaN | NaN | Lọc danh sách Gift Card theo Website | Function | GIFT\_MGT\_Filter\_02 |
| NaN | NaN | NaN | Lọc theo khoảng thời gian (Date Range) và tính năng Hủy lọc (Reset Filter) | Function | GIFT\_MGT\_Filter\_03 |
| NaN | NaN | Sorting | Sắp xếp bảng dữ liệu theo ID (Tăng/Giảm dần) | Function | GIFT\_MGT\_Sort\_01 |
| NaN | NaN | NaN | Sắp xếp danh sách theo Balance | Function | GIFT\_MGT\_Sort\_02 |
| NaN | 3.2 Thêm thẻ quà tặng | Trường bắt buộc | Bỏ trống các trường bắt buộc (Websites, Amount) | Field Validation | GIFT\_MGT\_Create\_01 |
| NaN | NaN | Định dạng dữ liệu - Amount | Nhập Amount không hợp lệ (số âm) | Field Validation | GIFT\_MGT\_Create\_02 |
| NaN | NaN | NaN | Nhập Amount không hợp lệ ( ký tự chữ và ký tự đặc biệt) | Field Validation | GIFT\_MGT\_Create\_03 |
| NaN | NaN | Định dạng dữ liệu - Email | Nhập sai định dạng Recipient Email và Sender Email | Field Validation | GIFT\_MGT\_Create\_04 |
| NaN | NaN | Trường duy nhất (Code) | Kiểm tra hệ thống văng ngoại lệ SQL Unique constraint khi nhập trùng mã Gift Card | Field Validation | GIFT\_MGT\_Create\_05 |
| NaN | NaN | Code tự sinh | Tạo Gift Card để trống Code (Tự động sinh mã - Auto-generate) | Function | GIFT\_MGT\_Create\_06 |
| NaN | NaN | Chọn nhiều Websites | Chọn nhiều Websites (Multi-select) cho một Gift Card | Function | GIFT\_MGT\_Create\_07 |
| NaN | NaN | Lưu thẻ quà tặng | Tạo Gift Card đầy đủ thông tin tùy chọn (Happy Path Full Fields) | Function | GIFT\_MGT\_Create\_08 |
| NaN | NaN | NaN | Tạo Gift Card với trạng thái Disabled ngay từ đầu | Function | GIFT\_MGT\_Create\_09 |
| NaN | 3.3 Chỉnh sửa thẻ quà tặng | Hiển thị | Kiểm tra giao diện và các nút chức năng trên form Edit | GUI | GIFT\_MGT\_View\_02 |
| NaN | NaN | Chỉnh sửa thông tin | Cập nhật thành công thông tin Gift Card hợp lệ | Function | GIFT\_MGT\_Update\_01 |
| NaN | NaN | Trường bắt buộc | Bỏ trống các trường bắt buộc ở form Edit | Field Validation | GIFT\_MGT\_Update\_02 |
| NaN | NaN | Định dạng dữ liệu - Amount | Nhập Amount là chữ và ký tự đặc biệt khi cập nhật | Field Validation | GIFT\_MGT\_Update\_03 |
| NaN | NaN | Thay đổi trạng thái | Thay đổi trạng thái Gift Card thành Disabled | Function | GIFT\_MGT\_Update\_04 |
| NaN | NaN | Định dạng dữ liệu - Email | Nhập email không hợp lệ khi sửa thông tin Gift Card | Field Validation | GIFT\_MGT\_Update\_05 |
| NaN | NaN | Lưu & hủy thao tác | Lưu thay đổi và ở lại trang Edit bằng tính năng "Save and Continue Edit" | Function | GIFT\_MGT\_Update\_06 |
| NaN | NaN | NaN | Hủy bỏ chỉnh sửa và quay lại danh sách bằng nút Back | Function | GIFT\_MGT\_Update\_07 |
| NaN | 3.4 Xóa & thao tác hàng loạt thẻ quà tặng | Xóa thẻ quà tặng | Hủy bỏ thao tác xóa khi bấm Cancel trên hộp thoại xác nhận | Function | GIFT\_MGT\_Delete\_01 |
| NaN | NaN | NaN | Xóa thành công Gift Card từ form Edit | Function | GIFT\_MGT\_Delete\_02 |

## List Product
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | ListProduct | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | List Product | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 9 | 0 | 0 | 0 | 0 | 9 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| PROD\_MGT\_Access\_01 | Kiểm tra truy cập trang Quản lý sản phẩm với quyền Admin | Pre-condition: Tài khoản có quyền Admin toàn hệ thống\nStep:\n1. Đăng nhập hệ thống bằng tài khoản Admin\n2. Click vào menu Quản lý sản phẩm | 1. Đăng nhập thành công, chuyển hướng tới Dashboard.\n2. Truy cập thành công, hệ thống hiển thị danh sách sản phẩm. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_View\_01 | Kiểm tra giao diện trang Danh sách sản phẩm | Pre-condition: Đã đăng nhập\nStep:\n1. Truy cập trang danh sách sản phẩm\n2. Quan sát bố cục, các cột, nút bấm, vùng phân trang | 1. Truy cập trang thành công.\n2. Giao diện hiển thị đúng thiết kế. Bảng danh sách có đầy đủ các cột: Checkbox, ID, Ảnh, Tên, SKU, Giá, Số lượng, Trạng thái, Action. Nút Add New Product nằm góc trên bên phải nổi bật. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Search\_01 | Kiểm tra tìm kiếm sản phẩm theo từ khóa chứa một phần Tên (Partial search) | Pre-condition: Có SP 'Quần Khaki', 'Quần Jeans'\nStep:\n1. Nhập 'Quần' vào ô filter\n2. Bấm Search | 1. Text được nhập vào filter.\n2. Danh sách hiển thị tất cả các sản phẩm có chứa chữ 'Quần' (Quần Khaki, Quần Jeans). | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Search\_02 | Kiểm tra tìm kiếm với từ khóa không tồn tại | Pre-condition: Đang ở trang DS\nStep:\n1. Nhập từ khóa rác 'XYZ123ABC' vào tìm kiếm\n2. Bấm Search | 1. Text được nhập vào filter.\n2. Bảng danh sách trống, hiển thị dòng chữ 'We couldn't find any records'. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Search\_03 | Kiểm tra tìm kiếm sản phẩm theo mã SKU | Pre-condition: Có SP SKU 'AT-002'\nStep:\n1. Nhập 'AT-002' vào cột filter SKU\n2. Bấm Search | 1. Text được nhập vào filter.\n2. Chỉ hiển thị đúng 1 dòng dữ liệu của sản phẩm có mã SKU 'AT-002'. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Filter\_01 | Kiểm tra lọc sản phẩm theo Trạng thái | Pre-condition: Hệ thống có cả SP Enable và Disable\nStep:\n1. Click vào cột filter Status\n2. Chọn giá trị filter Status = Disable\n3. Bấm Search | 1. Dropdown trạng thái mở ra.\n2. Trạng thái Disable được chọn.\n3. Danh sách chỉ hiển thị các sản phẩm đang có trạng thái Disable. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Filter\_02 | Kiểm tra lọc sản phẩm theo khoảng giá (Price From - To) | Pre-condition: Có SP giá 50k, 150k, 250k\nStep:\n1. Nhập filter Price From = 100000\n2. Nhập To = 200000\n3. Bấm Search | 1. Giá trị 100000 được nhập.\n2. Giá trị 200000 được nhập.\n3. Bảng danh sách chỉ hiển thị sản phẩm giá trong khoảng 100k - 200k (150k). | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Sort\_01 | Kiểm tra sắp xếp dữ liệu (Sorting) trên các cột | Pre-condition: Đang hiển thị danh sách\nStep:\n1. Click vào tiêu đề cột Price (Giá)\n2. Click vào tiêu đề cột Price (Giá) lần nữa | 1. Danh sách tự động xếp giá từ thấp đến cao (Mũi tên lên).\n2. Danh sách đảo ngược xếp từ cao xuống thấp (Mũi tên xuống). | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Paginate\_01 | Kiểm tra phân trang (Pagination) | Pre-condition: Có tổng cộng 50 SP, hiển thị 20 SP/trang\nStep:\n1. Đang hiển thị danh sách trang 1\n2. Click nút chuyển sang Trang 2 | 1. Đang ở trang 1 với 20 sản phẩm.\n2. Dữ liệu được làm mới để hiển thị 20 sản phẩm tiếp theo. URL hệ thống tự cập nhật thêm param page=2. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |

## Add Product
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | AddProduct | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | Add Product | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 8 | 0 | 0 | 0 | 0 | 8 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| PROD\_MGT\_Create\_01 | Kiểm tra lưu sản phẩm khi bỏ trống các trường bắt buộc | Pre-condition: Đang ở trang danh sách\nStep:\n1. Mở form Thêm mới\n2. Không nhập bất kỳ dữ liệu nào vào các trường\n3. Click nút Save | 1. Form mở thành công.\n2. Các trường dữ liệu trống.\n3. Không lưu được. Báo lỗi 'This is a required field' ở dưới các trường Tên, SKU, Giá. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Create\_02 | Kiểm tra nhập Giá (Price) chứa ký tự chữ cái, ký tự đặc biệt | Pre-condition: Đang ở form Thêm mới\nStep:\n1. Mở form Thêm mới\n2. Nhập Price là 'abc!@#>' | 1. Form mở thành công.\n2. Trường nhập liệu không cho gõ chữ cái (chặn phím) hoặc báo lỗi 'Vui lòng nhập định dạng số hợp lệ'. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Create\_03 | Kiểm tra nhập Giá (Price) là số âm | Pre-condition: Đang ở form Thêm mới\nStep:\n1. Mở form Thêm mới\n2. Nhập Price là '-50000'\n3. Click Save | 1. Form mở thành công.\n2. Nhập liệu hiển thị '-50000'.\n3. Hệ thống báo lỗi 'Please enter a number 0 or greater…'. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Create\_04 | Kiểm tra nhập Giá (Price) bằng 0 | Pre-condition: Đang ở form Thêm mới\nStep:\n1. Mở form Thêm mới\n2. Nhập Price là '0', hoàn thiện các trường khác\n3. Click Save | 1. Form mở thành công.\n2. Dữ liệu được nhập đầy đủ.\n3. Lưu thành công. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Create\_05 | Kiểm tra thêm mới sản phẩm thành công với dữ liệu hợp lệ | Pre-condition: Đang ở màn hình Thêm mới\nStep:\n1. Mở form Thêm mới\n2. Nhập Tên='Áo sơ mi', SKU='SM-01', Giá=200000, SL=50\n3. Trạng thái = Enable\n4. Click Save | 1. Form mở thành công.\n2. Dữ liệu được điền vào các ô.\n3. Trạng thái được chọn thành công.\n4. Thông báo popup 'Lưu sản phẩm thành công'. Hệ thống chuyển về màn hình danh sách và hiển thị 'Áo sơ mi' lên đầu. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Create\_06 | Kiểm tra hủy bỏ thao tác thêm mới (Back) | Pre-condition: Đang nhập dở form Thêm mới\nStep:\n1. Mở form Thêm mới\n2. Nhập Tên='Quần Jean', SKU='QJ-01'\n3. Bấm nút Back | 1. Form mở thành công.\n2. Text được nhập.\n3. Hệ thống quay về trang danh sách, các dữ liệu nhập dở không được lưu vào DB. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Create\_07 | Kiểm tra giao diện trang Thêm mới sản phẩm | Pre-condition: Đang ở trang danh sách sản phẩm\nStep:\n1. Click nút Add \n2. Quan sát các block thông tin và trường nhập liệu | 1. Chuyển sang màn hình thêm mới sản phẩm.\n2. Hiển thị đầy đủ form chia block rõ ràng (General, Pricing, Image). Nút Save và Cancel nằm ở vị trí dễ thao tác. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Create\_08 | Kiểm tra hiển thị text thông báo lỗi (Validation error UI) | Pre-condition: Ở trang Thêm mới\nStep:\n1. Để trống trường bắt buộc và click Save\n2. Quan sát màu sắc, vị trí text lỗi | 1. Form không được submit, báo lỗi bắt buộc.\n2. Dòng chữ thông báo lỗi màu đỏ, xuất hiện ngay bên dưới viền ô nhập liệu bị thiếu/sai. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |

## Update Product
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | UpdateProduct | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | Update Product | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 3 | 0 | 0 | 0 | 0 | 3 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| PROD\_MGT\_Update\_01 | Kiểm tra cập nhật thông tin (Edit) sản phẩm | Pre-condition: Có sẵn SP 'SM-01'\nStep:\n1. Tại danh sách, click Edit của sản phẩm 'SM-01'\n2. Đổi Giá thành 220000\n3. Click Save | 1. Mở form Edit thành công.\n2. Giá trị mới được điền vào ô Price.\n3. Cập nhật thành công. Tại danh sách, giá sản phẩm hiển thị là 220000. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Update\_02 | Kiểm tra thay đổi trạng thái sản phẩm (Disable) | Pre-condition: SP 'SM-01' đang Enable\nStep:\n1. Edit SP 'SM-01'\n2. Chuyển Toggle Status sang Disable\n3. Click Save | 1. Mở form Edit thành công.\n2. Trạng thái thay đổi sang Disable.\n3. Cập nhật thành công. Sản phẩm bị ẩn ngoài giao diện khách hàng (Frontend) và hiển thị nhãn Disable trong quản trị. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Update\_03 | Sử dụng Mass Action để thay đổi Attribute Set của 3 sản phẩm | 1. Ghi nhận ID của 3 sản phẩm đầu tiên, sau đó tick chọn cả 3 dòng.\n2. Lặp lại thao tác chọn Action "Change Attribute Set" -> "Electronics" -> Bấm Submit.\n3. Dùng vòng lặp tìm lần lượt đúng ID của cả 3 khách hàng trên lưới. | 1. Dòng thông báo hiển thị "3 items selected".\n2. Trang tải lại với thông báo xanh cập nhật thành công 3 bản ghi.\n3. Dữ liệu cột Attribute Set của cả 3 sản phẩm đều được hệ thống chuyển thành "Electronics". | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |

## Delete Product
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | DeleteProduct | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | Delete Product | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 3 | 0 | 0 | 0 | 0 | 3 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| PROD\_MGT\_Delete\_01 | Kiểm tra xóa 1 sản phẩm | Pre-condition: Có sẵn SP 'SM-01'\nStep:\n1. Tại bảng DS, click Delete ở cột Action của SP 'SM-01'\n2. Bấm OK trên popup xác nhận | 1. Hiển thị popup xác nhận xóa (Are you sure?).\n2. Sản phẩm bị xóa khỏi danh sách, hiển thị thông báo xóa thành công. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Delete\_02 | Kiểm tra hủy xác nhận khi hệ thống cảnh báo xóa | Pre-condition: Có sẵn SP trên DS\nStep:\n1. Tại bảng DS, click Delete SP\n2. Bấm Cancel trên popup cảnh báo | 1. Hiển thị popup xác nhận xóa.\n2. Popup cảnh báo biến mất, sản phẩm vẫn giữ nguyên trong danh sách (không bị xóa). | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |
| PROD\_MGT\_Delete\_03 | Kiểm tra xóa nhiều sản phẩm cùng lúc (Mass/Bulk Action) | Pre-condition: Có nhiều SP trong hệ thống\nStep:\n1. Tích chọn checkbox ở đầu 3 SP\n2. Mở dropdown Action tổng, chọn Delete\n3. Bấm Submit/OK | 1. 3 SP được tích chọn.\n2. Dropdown mở và chọn Action Delete.\n3. Cả 3 sản phẩm được xóa thành công cùng lúc, hiển thị thông báo 'Total of 3 record(s) have been deleted.'. | NaN | Passed | 2026-10-30 00:00:00 | NaN | NaN | NaN |

## List Customer
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | ListCustomer | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | List Customer | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 0 | 0 | 10 | 0 | 0 | 10 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| CUST\_MGT\_View\_01 | Kiểm tra hiển thị bảng và các cột mặc định | 1. Mở trang quản lý "Manage Customers".\n2. Quan sát bảng dữ liệu danh sách khách hàng. | 1. Hệ thống điều hướng thành công đến trang "Manage Customers".\n2. Bảng dữ liệu hiển thị đầy đủ các cột chuẩn: ID, Name, Email, Country, Customer Since. | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_View\_02 | Kiểm tra dữ liệu Customer được truyền chính xác khi truy cập trang Edit | 1. Đọc và ghi nhớ Email của khách hàng ở dòng đầu tiên.\n2. Click vào link "Edit" trên dòng tương ứng.\n3. Mở tab "Account Information" (nếu chưa mở mặc định).\n4. Kiểm tra các trường dữ liệu trên form. | 1. Ghi nhận được địa chỉ Email hợp lệ.\n2. Chuyển hướng thành công sang trang Edit Customer.\n3. Tab tài khoản hiển thị.\n4. Các trường First Name, Last Name đã được điền sẵn; trường Email chứa đúng địa chỉ Email ở bước 1 và cho phép chỉnh sửa (không bị disable). | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Search\_01 | Tìm kiếm Customer bằng Email chính xác | 1. Đọc Email từ bản ghi đầu tiên.\n2. Nhập Email vào ô lọc của cột "Email".\n3. Nhấn phím Enter. | 1. Hệ thống lấy được từ khóa Email thật.\n2. Ô lọc ghi nhận text vừa nhập.\n3. Dữ liệu tải lại và chỉ hiển thị các dòng chứa chính xác địa chỉ Email đó. | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Search\_02 | Tìm kiếm Customer bằng một phần Tên (Partial Name) | 1. Lấy từ khóa tên đầu tiên của khách hàng dòng 1 (VD: "John" trong "John Doe").\n2. Nhập từ khóa vào ô lọc của cột "Name".\n3. Bấm nút "Search". | 1. Ghi nhận được từ khóa chuỗi hợp lệ.\n2. Ô lọc ghi nhận từ khóa.\n3. Bảng tải lại và hiển thị tất cả các dòng có cột Name chứa từ khóa tìm kiếm (không phân biệt chữ hoa/thường). | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Search\_03 | Kiểm tra thông báo Empty State khi tìm kiếm Email sai | 1. Nhập chuỗi Email không tồn tại (VD: not\_found\_...) vào ô lọc Email.\n2. Bấm nút "Search". | 1. Ô tìm kiếm ghi nhận chuỗi không hợp lệ.\n2. Bảng tải lại, không hiển thị dữ liệu nào và xuất hiện thông báo "No records found". | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Filter\_01 | Lọc danh sách Customer theo Quốc gia (Country) | 1. Tại cột "Country", chọn tùy chọn "US" (United States) trong dropdown.\n2. Bấm nút "Search". | 1. Tùy chọn lọc quốc gia được thiết lập.\n2. Bảng tải lại và toàn bộ các dòng kết quả đều hiển thị "United States" tại cột Country. | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Filter\_02 | Lọc theo khoảng ngày (Customer Since) và Reset Filter | 1. Nhập khoảng ngày 2023-01-01 vào ô From và 2026-12-31 vào ô To của cột "Customer Since".\n2. Bấm nút "Search" để thực thi.\n3. Bấm nút "Reset Filter" trên thanh công cụ. | 1. Các ô input ghi nhận giá trị ngày tháng.\n2. Bảng tải lại, hiển thị dữ liệu của các khách hàng được tạo trong khoảng thời gian đã nhập.\n3. Bảng khôi phục lại toàn bộ dữ liệu ban đầu, đồng thời các ô From/To bị xóa trắng. | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Sort\_01 | Sắp xếp bảng dữ liệu theo chiều tăng/giảm của cột ID | 1. Click vào tiêu đề cột "ID" lần thứ 1.\n2. Click tiếp vào tiêu đề cột "ID" lần thứ 2. | 1. Bảng tải lại, cột ID xuất hiện class báo hiệu sắp xếp (mũi tên chỉ lên hoặc xuống).\n2. Bảng tải lại lần 2, class sắp xếp đổi ngược lại báo hiệu đảo chiều dữ liệu. | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Paginate\_01 | Thay đổi số lượng dòng hiển thị qua phân trang | 1. Tìm dropdown "Items per page".\n2. Chọn giá trị 50. | 1. Dropdown điều khiển hiển thị thành công.\n2. Bảng dữ liệu tự động tải lại và hiển thị danh sách mới với tối đa 50 bản ghi. | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Mass\_Action\_01 | Sử dụng Mass Action để gán 3 Customer và quét kiểm tra toàn bộ | 1. Ghi nhận ID của 3 khách hàng đầu tiên, sau đó tick chọn cả 3 dòng.\n2. Lặp lại thao tác chọn Action "Assign a Customer Group" -> "Wholesale" -> Bấm Submit.\n3. Dùng vòng lặp tìm lần lượt đúng ID của cả 3 khách hàng trên lưới. | 1. Dòng thông báo hiển thị "3 items selected".\n2. Trang tải lại với thông báo xanh cập nhật thành công 3 bản ghi.\n3. Dữ liệu cột Group của TẤT CẢ 3 khách hàng mục tiêu đều được hệ thống chuyển thành "Wholesale". | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |

## Add Customer
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | AddCustomer | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | Add Customer | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 10 | 0 | 0 | 0 | 0 | 10 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| CUST\_MGT\_Create\_01 | Bỏ trống các trường bắt buộc ở tab Account Info | 1. Truy cập form "Add New Customer".\n2. Tại mục "Associate to Website", chọn giá trị rỗng ("-- Please Select --").\n3. Để trống các trường: First Name, Last Name, Email.\n4. Nhấn nút "Save". | 1. Form "New Customer" được mở và hiển thị sẵn tab Account Information.\n2. Dropdown Website không được chọn.\n3. Các trường tên và email không có dữ liệu.\n4. Hệ thống chặn lưu form, xuất hiện lỗi "This is a required field." hoặc "Please select" (chữ màu đỏ) ngay dưới 4 trường tương ứng. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Create\_02 | Nhập sai định dạng trường Email (Validation) | 1. Tại form Account Info, nhập giá trị invalid\_email\_format vào trường "Email".\n2. Nhấn nút "Save". | 1. Trường Email nhận chuỗi text không có ký tự @.\n2. Hệ thống chặn lưu, xuất hiện thông báo lỗi "Please enter a valid email address..." ngay dưới trường Email. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Create\_03 | Nhập Password không đủ độ dài tối thiểu (Validation) | 1. Tại form Account Info, nhập giá trị 1b! vào trường "Password".\n2. Nhấn nút "Save". | 1. Trường Password hiển thị các dấu chấm (ẩn ký tự) tương ứng với 3 ký tự.\n2. Hệ thống chặn lưu, báo lỗi "Please enter more characters or clean leading or trailing spaces" dưới trường Password. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Create\_04 | Checkbox "Email Link to Set Password" vô hiệu hóa trường Password | 1. Kiểm tra trạng thái của trường nhập liệu "Password".\n2. Click tích chọn checkbox "Email Link to Set Password".\n3. Click bỏ tích checkbox trên. | 1. Trường "Password" đang ở trạng thái kích hoạt (cho phép nhập text).\n2. Trường "Password" lập tức chuyển sang trạng thái bị vô hiệu hóa (disabled, không thể nhập liệu).\n3. Trường "Password" chuyển lại thành trạng thái kích hoạt bình thường. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Create\_05 | Hủy bỏ thay đổi nhập liệu bằng nút Reset form | 1. Nhập chuỗi Test Reset Name vào trường First Name.\n2. Nhấn nút "Reset" ở thanh công cụ phía trên cùng bên phải.\n3. Đợi trình duyệt xử lý. | 1. Trường First Name ghi nhận giá trị vừa nhập.\n2. Trình duyệt thực hiện tải lại (reload) trang hiện tại.\n3. Trường First Name bị xóa trắng, form trở về trạng thái mặc định như lúc mới mở. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Create\_06 | Bỏ trống các trường bắt buộc khi thêm Address mới | 1. Nhấn sang tab "Addresses" ở menu trái.\n2. Nhấn nút "Add" để thêm địa chỉ.\n3. Giữ nguyên form địa chỉ trống và nhấn nút "Save". | 1. Giao diện chuyển sang tab quản lý địa chỉ.\n2. Một form nhập địa chỉ mới được render hiển thị trên màn hình.\n3. Hệ thống chặn lưu form, xuất hiện dòng lỗi "This is a required field." hiển thị chính xác bên dưới thẻ nhập liệu City (và các trường bắt buộc khác của địa chỉ này). | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Create\_07 | Thêm Customer 2 địa chỉ, thiết lập chéo Default Billing / Shipping | 1. Nhập đủ thông tin Account hợp lệ (Website, Group, Name, Email, Password).\n2. Chuyển sang tab "Addresses" và nhấn "Add".\n3. Nhập dữ liệu địa chỉ 1 (Ha Noi, VN) và tích chọn radio "Default Billing Address".\n4. Nhấn nút "Add" lần 2.\n5. Nhập dữ liệu địa chỉ 2 (Da Nang, VN) và tích chọn radio "Default Shipping Address".\n6. Nhấn nút "Save". | 1. Các trường thông tin tài khoản nhận dữ liệu thành công.\n2. Form địa chỉ thứ nhất xuất hiện.\n3. Dữ liệu địa chỉ 1 được ghi nhận và set làm mặc định thanh toán.\n4. Form địa chỉ thứ hai xuất hiện bên dưới.\n5. Dữ liệu địa chỉ 2 được ghi nhận và set làm mặc định giao hàng.\n6. Hệ thống chuyển hướng về trang Grid Manage Customers kèm thông báo thành công màu xanh "The customer has been saved". | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Create\_08 | Thêm mới Customer với đầy đủ thông tin + 1 Địa chỉ US | 1. Nhập đủ thông tin Account hợp lệ (Website, Group, Name, Email, Password).\n2. Chuyển sang tab "Addresses" và nhấn "Add".\n3. Nhập dữ liệu địa chỉ US (City: Cupertino, Zip: 95014) và chọn dropdown State/Province là "California".\n4. Nhấn nút "Save". | 1. Các trường thông tin tài khoản nhận dữ liệu thành công.\n2. Form địa chỉ mới hiển thị.\n3. Dữ liệu địa chỉ được ghi nhận (Dropdown state chọn thành công California).\n4. Hệ thống chuyển hướng về trang Grid Manage Customers kèm thông báo "The customer has been saved". | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Create\_09 | Thêm mới Customer chỉ với Account Info (Happy Path Rút gọn) | 1. Tại tab "Account Information", chọn Website và Group hợp lệ.\n2. Nhập đầy đủ First Name, Last Name, Email hợp lệ và Password (>= 7 ký tự).\n3. Nhấn nút "Save" (Bỏ qua tab Address). | 1. Dropdown Website và Group hiển thị giá trị đã chọn.\n2. Các trường text nhận dữ liệu hợp lệ.\n3. Hệ thống tạo tài khoản thành công mà không cần địa chỉ, chuyển về trang Grid Manage Customers kèm thông báo "The customer has been saved". | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Create\_10 | Đăng nhập Storefront thành công với tài khoản vừa tạo | 1. Tại Admin, nhập đủ Account Info hợp lệ (Website, Group, Name, Email, Password) và nhấn Save.\n2. Điều hướng trình duyệt sang URL của trang người dùng Storefront (/default/).\n3. Nhấn vào biểu tượng "Account" trên thanh Header (góc phải).\n4. Tại form "Login", nhập Email và Password vừa tạo ở bước 1 rồi nhấn nút "Login". | 1. Khách hàng được tạo thành công ở Admin kèm thông báo "The customer has been saved".\n2. Trang chủ Storefront hiển thị đầy đủ giao diện (DOM loaded).\n3. Form đăng nhập (tab Login) được mở ra.\n4. Đăng nhập thành công, trình duyệt chuyển hướng người dùng vào khu vực cá nhân "My Dashboard". | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |

## Update Customer
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | UpdateCustomer | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | Update Customer | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 0 | 0 | 7 | 0 | 0 | 7 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| CUST\_MGT\_View\_03 | Kiểm tra giao diện và các nút chức năng trên form Edit Customer | 1. Tại lưới danh sách, click link "Edit" ở dòng khách hàng đầu tiên.\n2. Quan sát thanh công cụ trên cùng và các trường dữ liệu ở tab Account Information. | 1. Trang chỉnh sửa thông tin khách hàng được mở ra thành công.\n2. Hiển thị đầy đủ các nút chức năng: Back, Reset, Save, Delete. Các trường dữ liệu bắt buộc (First Name, Email) đã được điền sẵn thông tin hiện tại của khách hàng. | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Update\_01 | Cập nhật thành công thông tin cơ bản (First Name, Last Name) hợp lệ | 1. Tại trang Edit, xóa nội dung cũ và nhập tên mới vào trường "First Name".\n2. Xóa nội dung cũ và nhập tên mới vào trường "Last Name".\n3. Bấm nút "Save" trên thanh công cụ. | 1. Trường First Name nhận giá trị mới.\n2. Trường Last Name nhận giá trị mới.\n3. Hệ thống lưu thành công, tự động chuyển hướng về trang lưới danh sách kèm thông báo xanh "The customer has been saved". | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Update\_02 | Xóa trống các trường bắt buộc (First Name, Email) khi đang Edit | 1. Tại trang Edit, xóa trắng toàn bộ dữ liệu ở trường "First Name".\n2. Xóa trắng toàn bộ dữ liệu ở trường "Email".\n3. Bấm nút "Save". | 1. Trường First Name bị để trống.\n2. Trường Email bị để trống.\n3. Hệ thống chặn thao tác lưu, xuất hiện cảnh báo lỗi màu đỏ "This is a required field" ngay bên dưới hai trường tương ứng. | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Update\_03 | Nhập sai định dạng Email khi sửa thông tin Customer | 1. Tại trang Edit, thay đổi trường "Email" thành một chuỗi sai định dạng (ví dụ không có ký tự @).\n2. Bấm nút "Save". | 1. Trường Email hiển thị chuỗi dữ liệu sai chuẩn.\n2. Hệ thống chặn lưu, xuất hiện thông báo lỗi "Please enter a valid email address" bên dưới trường Email. | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Update\_04 | Cập nhật Nhóm khách hàng (Customer Group) | 1. Tại trang Edit, click mở dropdown trường "Group".\n2. Chọn một nhóm khách hàng khác với nhóm hiện tại.\n3. Bấm nút "Save". | 1. Dropdown sổ ra danh sách các nhóm hiện có.\n2. Ghi nhận tùy chọn nhóm mới được chọn.\n3. Hệ thống lưu thành công, chuyển hướng về lưới danh sách kèm thông báo "The customer has been saved". | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Update\_05 | Đặt mật khẩu mới cho Customer thành công | 1. Tại trang Edit, nhập một mật khẩu mới (đạt chuẩn độ dài) vào trường "New Password".\n2. Nhập mật khẩu hiện hành của tài khoản quản trị (Admin) vào ô xác nhận "Current Admin Password".\n3. Bấm nút "Save". | 1. Mật khẩu mới được nhập thành công (ẩn ký tự).\n2. Mật khẩu quản trị được nhập thành công.\n3. Hệ thống đổi mật khẩu và lưu thành công, chuyển về lưới danh sách kèm thông báo "The customer has been saved". | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Update\_06 | Hủy bỏ thao tác chỉnh sửa bằng nút Back | 1. Tại trang Edit, cố tình thay đổi dữ liệu bất kỳ (VD: đổi tên First Name).\n2. Bấm nút "Back" trên thanh công cụ. | 1. Dữ liệu trên form được thay đổi.\n2. Hệ thống bỏ qua mọi thay đổi (không lưu vào Database) và lập tức điều hướng quay lại trang lưới danh sách. | NaN | Untested | 2026-11-03 00:00:00 | NaN | NaN | NaN |

## Delete Customer
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | DeleteCustomer | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | Delete Customer | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 2 | 0 | 0 | 0 | 0 | 2 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| CUST\_MGT\_Delete\_01 | Hủy bỏ thao tác xóa khi bấm Cancel trên hộp thoại xác nhận | 1. Tại trang Edit, bấm nút "Delete" ở góc trên thanh công cụ.\n2. Khi trình duyệt hiển thị hộp thoại cảnh báo xác nhận (Confirm dialog), bấm nút "Cancel" (hoặc Dismiss). | 1. Hộp thoại xác nhận của trình duyệt xuất hiện yêu cầu xác nhận hành động xóa.\n2. Hộp thoại đóng lại, hệ thống hủy lệnh xóa, người dùng vẫn ở lại trang Edit và dữ liệu khách hàng không bị ảnh hưởng. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| CUST\_MGT\_Delete\_02 | Xóa thành công Customer từ trang Edit khi bấm OK | 1. Khởi tạo một khách hàng tạm (dữ liệu rác) và truy cập vào trang Edit của khách hàng đó.\n2. Bấm nút "Delete".\n3. Khi hộp thoại xác nhận xuất hiện, bấm "OK" (hoặc Accept) để đồng ý. | 1. Form chỉnh sửa khách hàng tạm được mở ra.\n2. Hộp thoại xác nhận xuất hiện.\n3. Hệ thống tiến hành xóa bỏ khách hàng khỏi cơ sở dữ liệu, chuyển hướng về trang lưới và hiển thị thông báo "The customer has been deleted". | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |

## List Gift Card
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | ListGiftCard | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | List Gift Card | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 10 | 0 | 0 | 0 | 0 | 10 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| GIFT\_MGT\_View\_01 | Kiểm tra hiển thị bảng lưới (Grid) và các cột mặc định | 1. Đăng nhập vào trang Admin.\n2. Truy cập menu Sales > Gift Cards > Manage Gift Cards.\n3. Quan sát bảng dữ liệu danh sách. | 1. Hệ thống điều hướng thành công đến trang quản lý.\n2. Bảng dữ liệu hiển thị, bao gồm đầy đủ các cột chuẩn: ID, Code, Status, Websites, Balance, và Expires. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Paginate\_01 | Sử dụng phân trang (Pagination) thông qua số lượng hiển thị (Page Size) | 1. Kiểm tra sự tồn tại của selectbox Page Size (View limit).\n2. Thay đổi giá trị hiển thị từ mặc định sang 50 bản ghi/trang.\n3. Đợi bảng dữ liệu tải lại. | 1. Bảng ghi nhận sự thay đổi tùy chọn kích thước trang.\n2. Lưới dữ liệu tải lại.\n3. Số lượng bản ghi hiển thị trên bảng không vượt quá 50 dòng. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Search\_01 | Tìm kiếm Gift Card bằng Code chính xác | 1. Lấy mã Code của bản ghi đầu tiên trên lưới.\n2. Điền mã Code vừa lấy vào ô tìm kiếm ở cột Code .\n3. Nhấn phím Enter để kích hoạt tìm kiếm. | 1. Hệ thống ghi nhận mã tìm kiếm hợp lệ.\n2. Bảng lưới mờ đi và tải lại thành công.\n3. Bảng trả về các kết quả mà cột Code chứa chính xác mã đã tìm kiếm. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Search\_02 | Tìm kiếm bản ghi bằng ID cụ thể | 1. Lấy số ID của bản ghi đầu tiên trên lưới.\n2. Điền số ID đó vào ô tìm kiếm ở cột ID.\n3. Nhấn phím Enter để thực thi lọc. | 1. Dữ liệu ID được ghi nhận vào ô tìm kiếm.\n2. Bảng lưới tải lại thành công.\n3. Bảng trả về duy nhất 1 dòng kết quả có cột ID khớp chính xác với ID đã nhập. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Search\_03 | Trạng thái Empty (No records) khi search mã không tồn tại | 1. Sinh một chuỗi code ngẫu nhiên  (VD: NOT-FOUND-<timestamp>).\n2. Điền mã vừa sinh vào ô lọc cột Code.\n3. Nhấn nút Search và chờ bảng lưới phản hồi. | 1. Ô input ghi nhận chuỗi không tồn tại.\n2. Code vừa sinh được điền vào ô lọc.\n3. Bảng không hiển thị bản ghi nào và xuất hiện thông báo "No records found" . | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Filter\_01 | Lọc danh sách Gift Card theo trạng thái (Status) | 1. Tại ô lọc của cột Status, chọn tùy chọn Active.\n2. Nhấn nút Search trên thanh công cụ của bảng. | 1. Trạng thái "Active" được chọn thành công trên giao diện.\n2. Tất cả các dòng kết quả (nếu có) đều hiển thị trạng thái "Active" ở cột Status. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Filter\_02 | Lọc danh sách Gift Card theo Website | 1. Tại ô lọc của cột Websites, chọn tùy chọn Maho Store.\n2. Nhấn nút Search trên thanh công cụ của bảng. | 1. Tùy chọn website được ghi nhận.\n2. Tất cả các dòng kết quả (nếu có) đều chứa văn bản "Maho Store" tại cột Websites. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Filter\_03 | Lọc theo khoảng thời gian (Date Range) và tính năng Hủy lọc (Reset Filter) | 1. Nhấn nút Reset Filter (nếu hiển thị) và lưu lại tổng số dòng nguyên bản của bảng.\n2. Nhập 2026-01-01 vào ô From và 2026-12-31 vào ô To của cột Created.\n3. Nhấn nút Search và kiểm tra kết quả.\n4. Nhấn nút Reset Filter một lần nữa.\n5. Kiểm tra trạng thái của các ô nhập ngày và tổng số dòng trên bảng. | 1. Bảng được khôi phục về trạng thái không bộ lọc (ghi nhận số dòng ban đầu).\n2. Kết quả lọc: Bảng tải lại thành công và trả về số dòng lớn hơn hoặc bằng 1.\n3. Kết quả hủy lọc: Bảng tải lại thành công.\n4. Các ô nhập From và To bị xóa trắng, và tổng số lượng dòng khôi phục lại khớp hoàn toàn với số lượng dòng nguyên bản. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Sort\_01 | Sắp xếp bảng dữ liệu theo ID (Tăng/Giảm dần) | 1. Click vào tiêu đề cột ID lần thứ nhất.\n2. Click vào tiêu đề cột ID lần thứ hai.\n3. Chờ bảng dữ liệu tải lại và đối chiếu với class icon trước đó. | 1. Lần click đầu tiên: Bảng được sắp xếp theo một chiều (biểu thị qua class mũi tên lên/xuống).\n2. Lần click thứ hai: Bảng đảo ngược chiều sắp xếp.\n3. Giao diện thay đổi class icon mũi tên thể hiện rõ 2 chiều sắp xếp (Ascending/Descending) khác biệt nhau. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Sort\_02 | Sắp xếp danh sách theo Balance | 1. Click vào tiêu đề cột Balance trên bảng lưới.\n2. Chờ bảng dữ liệu tải lại. | 1. Tiêu đề cột Balance nhận sự kiện click.\n2. Bảng dữ liệu được sắp xếp lại, và tiêu đề cột Balance hiển thị icon mũi tên sắp xếp (sort-arrow). | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |

## Add Gift Card
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | AddGiftCard | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | Add Gift Card | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 9 | 0 | 0 | 0 | 0 | 9 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| GIFT\_MGT\_Create\_01 | Bỏ trống các trường bắt buộc (Websites, Amount) | 1. Mở form "New Gift Card".\n2. Bỏ chọn toàn bộ các tùy chọn tại trường "Websites" (truyền mảng rỗng).\n3. Để trống trường "Amount" (balance).\n4. Nhấn nút "Save". | 1. Form "New Gift Card" được mở và hiển thị sẵn các trường nhập liệu.\n2. Không có Website nào được chọn.\n3. Trường Amount không chứa giá trị.\n4. Hệ thống chặn lưu form, hiển thị thông báo lỗi màu đỏ "This is a required field." ngay bên dưới trường Websites và Amount. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Create\_02 | Nhập Amount không hợp lệ (số âm) | 1. Chọn giá trị "Maho Store" tại trường "Websites".\n2. Nhập giá trị -50 vào trường "Amount".\n3. Nhấn nút "Save".\n | 1. Website được chọn thành công.\n2. Trường Amount nhận giá trị âm -50.\n3. Hệ thống chặn lưu, xuất hiện thông báo lỗi "Please enter a number greater than 0 in this field" do vi phạm điều kiện giá trị dương.\n | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Create\_03 | Nhập Amount không hợp lệ ( ký tự chữ và ký tự đặc biệt) | 1. Chọn giá trị "Maho Store" tại trường "Websites".\n2. Nhập giá trị ""abc!@# vào trường "Amount".\n3. Nhấn nút "Save".\n | 1. Website được chọn thành công.\n2. Trường Amount nhận chuỗi ký tự chữ abc.\n3. Hệ thống chặn lưu, xuất hiện thông báo lỗi "Please enter a valid number in this field" do sai kiểu dữ liệu số. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Create\_04 | Nhập sai định dạng Recipient Email và Sender Email | 1. Chọn Website và nhập Amount hợp lệ (100).\n2. Nhập chuỗi không đúng định dạng invalid\_recipient vào trường "Recipient Email".\n3. Nhập chuỗi không đúng định dạng invalid\_sender vào trường "Sender Email".\n4. Nhấn nút "Save". | 1. Thông tin cơ bản nhận dữ liệu hợp lệ.\n2. Trường Recipient Email nhận chuỗi text thường.\n3. Trường Sender Email nhận chuỗi text thường.\n4. Hệ thống chặn lưu form, hiển thị thông báo lỗi "Please enter a valid email address..." ngay bên dưới cả hai trường email này. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Create\_05 | Kiểm tra hệ thống văng ngoại lệ SQL Unique constraint khi nhập trùng mã Gift Card | 1. Tạo Gift Card lần 1: Nhập custom code DUPLICATE-<timestamp>, chọn Website, nhập Amount (100) và bấm "Save".\n2. Mở lại form New Gift Card thông qua menu Sales > Gift Cards > Manage Gift Cards.\n3. Tạo Gift Card lần 2: Nhập lại chính xác đoạn mã DUPLICATE-<timestamp> cũ, chọn Website và nhập Amount (200).\n4. Bấm nút "Save" lần 2. | 1. Lưu lần 1 thành công, chuyển hướng về lưới Grid kèm thông báo xanh "The gift card has been saved".\n2. Form tạo mới được mở lại thành công.\n3. Khung nhập Code nhận lại chuỗi mã trùng lặp.\n4. Hệ thống chặn lại ở tầng Database, hiển thị lỗi ngoại lệ hệ thống chứa chuỗi Integrity constraint violation... UNIQUE constraint failed: giftcard.code. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Create\_06 | Tạo Gift Card để trống Code (Tự động sinh mã - Auto-generate) | 1. Để trống hoàn toàn trường "Code".\n2. Chọn Website "Maho Store" (value="1").\n3. Nhập Amount là 50.\n4. Nhấn nút "Save". | 1. Trường Code để trống không nhập giá trị.\n2. Website được chọn.\n3. Amount ghi nhận hợp lệ.\n4. Hệ thống tự động sinh mã, lưu thành công và chuyển hướng về trang Grid kèm thông báo xanh "The gift card has been saved". | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Create\_07 | Chọn nhiều Websites (Multi-select) cho một Gift Card | 1. Tại trường "Websites", thực hiện chọn đồng thời 3 giá trị ['1', '2', '3'] (Maho Store, Maison Maho, Voltline).\n2. Nhập Amount là 200.\n3. Nhấn nút "Save". | 1. Hộp thoại multi-select ghi nhận đồng thời 3 website được bôi đen.\n2. Amount ghi nhận hợp lệ.\n3. Hệ thống lưu thành công, hiển thị thông báo xanh "The gift card has been saved" trên trang Grid. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Create\_08 | Tạo Gift Card đầy đủ thông tin tùy chọn (Happy Path Full Fields) | 1. Nhập Code tùy chỉnh, chọn Status là "Active", chọn Website và nhập Amount (300).\n2. Nhập ngày hết hạn 2026-12-12 vào trường "Expires At".\n3. Nhập đầy đủ Tên & Email người nhận (Alice, alice@demo.com) và người gửi (Bob Admin, admin@demo.com).\n4. Nhập nội dung tin nhắn và ghi chú quản trị.\n5. Nhấn nút "Save". | 1. Các thông tin cơ bản nhận dữ liệu chuẩn xác.\n2. Ngày hết hạn được ghi nhận theo định dạng năm-tháng-ngày.\n3. Các trường thông tin người gửi/nhận nhận dữ liệu email hợp lệ không báo lỗi.\n4. Nội dung tin nhắn và ghi chú được ghi nhận.\n5. Hệ thống lưu thành công, hiển thị thông báo xanh "The gift card has been saved". | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Create\_09 | Tạo Gift Card với trạng thái Disabled ngay từ đầu | 1. Chọn trạng thái "Disabled" tại dropdown "Status".\n2. Chọn Website và nhập Amount (10).\n3. Nhập Code tùy chỉnh và nhấn nút "Save". | 1. Trạng thái Disabled được chọn trên giao diện.\n2. Các thông tin bắt buộc điền đầy đủ.\n3. Hệ thống lưu thành công, chuyển hướng về trang Grid kèm thông báo xanh "The gift card has been saved" (Gift card ở trạng thái vô hiệu hóa). | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |

## Update Gift Card
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | UpdateGiftCard | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | Update Gift Card | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 8 | 0 | 0 | 0 | 0 | 8 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| GIFT\_MGT\_View\_02 | Kiểm tra giao diện và các nút chức năng trên form Edit | 1. Mở trang Edit của một Gift Card đang hoạt động.\n2. Quan sát tiêu đề trang và thanh công cụ chức năng.\n3. Kiểm tra trường giá trị Amount (Balance) được tải lên từ Database. | 1. Trang Edit tải hoàn tất.\n2. Tiêu đề hiển thị chuẩn xác "Edit Gift Card" và có đầy đủ 4 nút chức năng: Back, Reset, Save, Delete.\n3. Trường Amount hiển thị giá trị số học lớn hơn 0 (dữ liệu được lấy thành công từ DB). | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Update\_01 | Cập nhật thành công thông tin Gift Card hợp lệ | 1. Mở form Edit của một Gift Card đầu tiên trên lưới.\n2. Nhập thông tin mới hợp lệ vào trường "Recipient Name" và "Message".\n3. Nhấn nút "Save". | 1. Trang "Edit Gift Card" được mở và hiển thị dữ liệu hiện tại.\n2. Các trường tương ứng ghi nhận text mới.\n3. Hệ thống lưu thay đổi thành công, chuyển hướng về trang Grid kèm thông báo xanh "The gift card has been saved". | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Update\_02 | Bỏ trống các trường bắt buộc ở form Edit | 1. Mở form Edit của một Gift Card.\n2. Xóa rỗng dữ liệu trong trường "Amount" (Balance).\n3. Bỏ chọn tất cả các tùy chọn trong danh sách "Websites".\n4. Nhấn nút "Save". | 1. Trang Edit hiển thị dữ liệu gốc.\n2. Trường Amount bị bỏ trống.\n3. Không có Website nào được chọn.\n4. Hệ thống chặn lưu, hiển thị thông báo lỗi (chữ màu đỏ) "This is a required field." ngay bên dưới trường Amount. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Update\_03 | Nhập Amount là chữ và ký tự đặc biệt khi cập nhật | 1. Tại trang Edit Gift Card, nhập chuỗi abc!@# vào trường "Amount".\n2. Nhấn nút "Save". | 1. Trường Amount ghi nhận chuỗi ký tự chữ và đặc biệt.\n2. Hệ thống chặn lưu, hiển thị thông báo lỗi định dạng "Please enter a valid number in this field" bên dưới trường dữ liệu. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Update\_04 | Thay đổi trạng thái Gift Card thành Disabled | 1. Tại dropdown "Status" trên trang Edit, chọn giá trị "Disabled".\n2. Nhấn nút "Save". | 1. Trạng thái "Disabled" được chọn trên giao diện.\n2. Hệ thống cập nhật thành công, điều hướng về trang Grid kèm thông báo xanh "The gift card has been saved". | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Update\_05 | Nhập email không hợp lệ khi sửa thông tin Gift Card | 1. Tại trang Edit Gift Card, nhập chuỗi bad-email-format vào trường "Recipient Email".\n2. Nhấn nút "Save". | 1. Trường Email nhận dữ liệu sai định dạng.\n2. Hệ thống chặn lưu, lập tức hiển thị thông báo lỗi "Please enter a valid email address" bên dưới ô nhập liệu. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Update\_06 | Lưu thay đổi và ở lại trang Edit bằng tính năng "Save and Continue Edit" | 1. Nhập một nội dung bất kỳ vào trường "Admin Comment".\n2. Nhấn nút "Save and Continue Edit" ở thanh công cụ phía trên. | 1. Nội dung comment được ghi nhận.\n2. Hệ thống lưu thành công kèm thông báo xanh "The gift card has been saved", nhưng KHÔNG chuyển hướng về trang Grid mà vẫn giữ nguyên ở màn hình "Edit Gift Card" hiện tại. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Update\_07 | Hủy bỏ chỉnh sửa và quay lại danh sách bằng nút Back | 1. Nhập một giá trị mới (VD: Should Not Save) vào trường "Recipient Name".\n2. Nhấn nút "Back" trên thanh công cụ. | 1. Giao diện ghi nhận chuỗi nhập liệu mới.\n2. Hệ thống không thực hiện lưu trữ, điều hướng trình duyệt quay thẳng về trang danh sách ("Gift Cards") một cách an toàn. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |

## Delete Gift Card
| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 | Unnamed: 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Module Code | DeleteGiftCard | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Passed |
| Test requirement | Delete Gift Card | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Failed |
| Tester | Phan Bá Huy Hoàng | NaN | NaN | NaN | NaN | NaN | NaN | NaN | Blocked |
| Passed | Failed | Untested | Blocked | Skipped | Number of Test cases | NaN | NaN | NaN | Untested |
| 2 | 0 | 0 | 0 | 0 | 2 | NaN | NaN | NaN | Skipped |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Test Case Description | Test Case Procedure | Expected Output | Inter-test case Dependence | Result | Test date | Note | NaN | NaN |
| GIFT\_MGT\_Delete\_01 | Hủy bỏ thao tác xóa khi bấm Cancel trên hộp thoại xác nhận | 1. Tại trang Edit Gift Card, nhấn nút "Delete".\n2. Trình duyệt hiển thị hộp thoại cảnh báo (Confirm dialog), click chọn "Cancel" (Dismiss). | 1. Hộp thoại xác nhận yêu cầu xóa xuất hiện ngay sau khi click.\n2. Lệnh xóa bị hủy bỏ, hệ thống giữ nguyên người dùng ở màn hình "Edit Gift Card" và mã thẻ (Code) vẫn tồn tại nguyên vẹn. | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |
| GIFT\_MGT\_Delete\_02 | Xóa thành công Gift Card từ form Edit | 1. Tạo một bản ghi mới và mở trang Edit của bản ghi đó.\n2. Nhấn nút "Delete".\n3. Trên hộp thoại cảnh báo của trình duyệt, click chọn "OK" (Accept). | 1. Bản ghi được tạo và mở thành công.\n2. Hộp thoại xác nhận xóa xuất hiện.\n3. Hệ thống thực thi xóa thành công bản ghi khỏi Database, chuyển hướng người dùng về trang Grid kèm thông báo xanh "The gift card has been deleted". | NaN | Passed | 2026-11-03 00:00:00 | NaN | NaN | NaN |

## Test Report
| Unnamed: 0 | TEST REPORT | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 | Unnamed: 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | Project Name | Group02-MahoCommerce-Testing | NaN | Creator | NaN | Phan Bá Huy Hoàng | NaN | NaN |
| NaN | Project Code | Group02-MahoCommerce-Testing | NaN | Reviewer/Approver | NaN | Võ Văn Thiệt | NaN | NaN |
| NaN | Document Code | Group02-MahoCommerce-Testing\_Test Report\_v0.1 | NaN | Issue Date | NaN | 2026-10-23 00:00:00 | <Date when this test report is created> | NaN |
| NaN | Notes | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | No | Module code | Pass | Fail | Untested | Blocked | Skipped | Number of  test cases |
| NaN | 1 | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | 2 | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | 3 | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | Sub total | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | Test coverage | NaN | NaN | % | NaN | NaN | NaN |
| NaN | NaN | Test successful coverage | NaN | NaN | % | NaN | NaN | NaN |