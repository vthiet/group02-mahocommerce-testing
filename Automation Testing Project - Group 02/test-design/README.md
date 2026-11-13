# Tổng hợp Danh mục Chức năng Kiểm thử (Test Design Features Index)
**Dự án:** Kiểm thử tự động hệ thống Maho Commerce  
**Nhóm thực hiện:** Nhóm 02  
**Thư mục gốc:** `Automation Testing Project - Group 02/test-design/`

Tài liệu này tổng hợp toàn bộ danh mục các chức năng (features), phạm vi kiểm thử (testing scope), phương pháp thiết kế test case (EP, BVA, State Transition, Security, Defect) và các tài liệu đặc tả chi tiết nằm trong từng thư mục con của các thành viên trong Nhóm 02.

---

## 1. Bảng Tổng hợp Phân công Chức năng theo Thành viên

| STT | MSSV | Họ và tên | Thư mục con | Các phân hệ / Chức năng chính đảm nhiệm | Số lượng Test Cases |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 1 | 23130117 | Phan Bá Huy Hoàng | `23130117_PhanBaHuyHoang/` | 1. Quản lý sản phẩm (Product Management - Admin)<br>2. Quản lý khách hàng (Customer Management - Admin)<br>3. Quản lý thẻ quà tặng (Gift Card Management - Admin) | ~69 TCs |
| 2 | 23130238 | Vũ Châu Hoài Phong | `23130238_VuChauHoaiPhong/` | 1. Giỏ hàng, Đặt hàng & Hóa đơn (Cart, Checkout, Order & Invoice)<br>2. Tài khoản, Hồ sơ & Sổ địa chỉ (Profile & Address Book)<br>3. Tìm kiếm & Bộ lọc phân nhánh (Search & Faceted Filters) | 88 TCs (75 Func + 13 Defect) |
| 3 | 23130314 | Võ Văn Thiệt | `23130314_VoVanThiet/` | 1. Category Tree & Configurable Product Variants<br>2. Promotion Rule Engine (Catalog and automatic Cart Rules)<br>3. One-Page Checkout & Order Fulfillment | Test design matrices in the feature documents |
| 4 | 23130327 | Nguyễn Hoài Thương | `23130327_NguyenHoaiThuong/` | 1. Quản lý Mã giảm giá (Coupon & Discount Code System)<br>2. Báo cáo Thống kê Doanh thu (Sales Analytics & Reports)<br>3. Quản lý Giỏ hàng (Shopping Cart Details, BVA & Estimates) | ~70 TCs |
| 5 | 23130397 | Thòng Lý Tiểu Yến | `23130397_ThongLyTieuYen/` | 1. Đăng nhập, Bảo mật & 2FA (Authentication, Security & 2FA)<br>2. Đánh giá & Xếp hạng sản phẩm (Product Reviews & Ratings)<br>3. Danh sách yêu thích & So sánh sản phẩm (Wishlist & Comparison) | 70 TCs (23 Auth + 23 Review + 24 Wishlist) |

---

## 2. Chi tiết Danh mục Chức năng trong từng Thư mục con

### 2.1. Thư mục `23130117_PhanBaHuyHoang/`
* **Người thực hiện:** Phan Bá Huy Hoàng (MSSV: 23130117)
* **Tài liệu nguồn:** `test_design_and_spec.md` (Phiên bản v0.2)
* **Môi trường & Công cụ:** Admin Panel Maho Commerce, Playwright TypeScript.

#### Danh mục chức năng kiểm thử:
1. **Quản lý Sản phẩm (Product Management - Admin Panel):**
   - **Danh sách sản phẩm (Product Grid):** Phân quyền truy cập Admin (Roles & Permissions), hiển thị giao diện bảng lưới (GUI), tìm kiếm theo tên chính xác/tên một phần/từ khóa không tồn tại, tìm kiếm theo SKU, lọc theo trạng thái (Enabled/Disabled) và khoảng giá ($Price_{From} - Price_{To}$), sắp xếp đa cột (Sorting), phân trang (Pagination).
   - **Thêm mới sản phẩm (Add Product):** Kiểm tra bắt buộc nhập trường (Mandatory Fields), kiểm tra định dạng giá (Price: ký tự đặc biệt, số âm, giá bằng 0), thêm mới thành công sản phẩm hợp lệ, hủy thao tác bằng nút Back, thông báo lỗi kiểm tra dữ liệu.
   - **Cập nhật sản phẩm (Update Product):** Cập nhật thông tin chi tiết (đổi giá), thay đổi trạng thái sang Disabled, thao tác hàng loạt (Mass Action: Change Attribute Set sang Electronics).
   - **Xóa sản phẩm (Delete Product):** Xóa 1 sản phẩm có xác nhận qua hộp thoại popup, hủy thao tác xóa (Cancel dialog), xóa hàng loạt sản phẩm bằng Mass Action Delete.
2. **Quản lý Khách hàng (Customer Management - Admin Panel):**
   - **Danh sách khách hàng (Customer Grid):** Hiển thị các cột mặc định, truyền dữ liệu chính xác sang form Edit, tìm kiếm khách hàng theo Email chính xác/một phần Tên/Email không tồn tại (Empty State), lọc theo Quốc gia (Country) và khoảng ngày tạo (Customer Since) kèm Reset Filter, sắp xếp cột ID, phân trang thay đổi kích thước trang, thao tác hàng loạt gán Customer Group.
   - **Thêm mới khách hàng (Add Customer):** Bỏ trống trường bắt buộc tab Account Information, định dạng Email không hợp lệ, độ dài mật khẩu tối thiểu, checkbox "Email Link to Set Password" vô hiệu hóa trường mật khẩu, nút Reset form, thêm địa chỉ (bắt buộc, thiết lập chéo Default Billing / Shipping, địa chỉ US), tạo khách hàng thành công và kiểm tra đăng nhập Storefront.
   - **Chỉnh sửa & Xóa khách hàng (Update & Delete Customer):** Cập nhật First/Last Name, xóa trống trường bắt buộc, cập nhật Customer Group, đặt mật khẩu mới với xác nhận của Admin, hủy chỉnh sửa bằng nút Back, hủy xóa (Cancel) và xóa thành công khi nhấn OK.
3. **Quản lý Thẻ Quà tặng (Gift Card Management - Admin Panel):**
   - **Danh sách thẻ quà tặng (Gift Card Grid):** Hiển thị bảng lưới, phân trang Page Size (50 bản ghi), tìm kiếm theo Code chính xác/ID/mã không tồn tại, lọc theo Status/Website/Ngày tạo kèm Reset, sắp xếp theo ID và Balance.
   - **Thêm mới & Cập nhật Thẻ quà tặng:** Bỏ trống trường bắt buộc (Websites, Amount), nhập Amount sai (số âm, ký tự chữ), định dạng Recipient/Sender Email, trùng Code (Unique constraint), tự sinh mã khi để trống Code, chọn nhiều Websites, tạo thẻ với trạng thái Disabled, cập nhật Recipient Name/Message, lưu và tiếp tục sửa (Save and Continue Edit).
   - **Xóa thẻ quà tặng:** Xóa 1 thẻ từ trang Edit và xử lý popup xác nhận.

---

### 2.2. Thư mục `23130238_VuChauHoaiPhong/`
* **Người thực hiện:** Vũ Châu Hoài Phong (MSSV: 23130238)
* **Tài liệu nguồn:**
  - `test_design_cart_checkout_orders.md` & `test_spec_details_cart_checkout_orders.md`
  - `test_design_profile_address.md` & `test_spec_details_profile_address.md`
  - `test_design_search_filters.md` & `test_spec_details_search_filters.md`
* **Phương pháp:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), State-Transition, Security Testing, Defect Analysis.

#### Danh mục chức năng kiểm thử:
1. **Giỏ hàng, Đặt hàng & Hóa đơn (Cart, Checkout, Order & Invoice - 30 TCs):**
   - **Shopping Cart:** Mở giỏ hàng rỗng (`Cart_OpenEmpty_01`), thêm sản phẩm còn hàng (`Cart_AddProduct_02`), thêm cùng sản phẩm 2 lần kiểm tra cộng dồn (`Cart_AddSameProduct_03`), cập nhật số lượng hợp lệ (`Cart_UpdateQtyValid_04`), xử lý số lượng bằng 0 (`Cart_UpdateQtyZero_05`), kiểm tra nhập số lượng không hợp lệ (chữ, số âm, số thập phân - `Cart_UpdateQtyInvalid_06`), xóa 1 sản phẩm khỏi giỏ (`Cart_RemoveItem_07`), tính lại Subtotal sau khi sửa số lượng (`Cart_SubtotalRecalculate_08`).
   - **Checkout (Guest Checkout):** Chuyển từ giỏ sang Checkout (`Checkout_Open_09`), quy trình checkout cho khách chưa đăng nhập (`Checkout_GuestFlow_10`), validation email bắt buộc và sai cú pháp (`Checkout_EmailValidation_11`), validation các trường địa chỉ bắt buộc (`Checkout_AddressRequired_12`), kiểm tra số điện thoại không hợp lệ (`Checkout_PhoneInvalid_13`), kiểm tra mã bưu chính hợp lệ và không hợp lệ (`Checkout_PostalValid_14`, `15`), lựa chọn phương thức giao hàng (`Checkout_ShippingMethod_16`), lựa chọn phương thức thanh toán offline (`Checkout_PaymentMethod_17`), chặn submit khi thiếu dữ liệu (`Checkout_SubmitMissing_18`).
   - **Order Lifecycle:** Đặt đơn hàng test bằng phương thức thanh toán offline (`Order_PlaceValid_19`), hiển thị mã đơn hàng tham chiếu (`Order_ReferenceDisplayed_20`), kiểm tra mã đơn là duy nhất (`Order_NumberUnique_21`), chống tạo đơn trùng khi double click nhanh (`Order_DoubleSubmit_22`), tải lại trang xác nhận an toàn (`Order_ConfirmationRefresh_23`), đối chiếu email xác nhận đơn (`Order_ConfirmationEmail_24`), kiểm tra đơn hàng hiển thị trong My Orders history (`Order_HistoryVisible_25`).
   - **Invoice:** Mở hóa đơn từ trang chi tiết đơn hàng Storefront (`Invoice_AccessFromOrder_26`).
   - **Defect & Data Consistency (4 TCs):** Hợp nhất (merge) giỏ hàng của Guest khi đăng nhập tài khoản (`DEF_Order_01`), nhập số lượng cực lớn 9999 không gây lỗi 500 server (`DEF_Order_02`), đồng bộ trạng thái coupon sau khi xóa sản phẩm (`DEF_Order_03`), đối chiếu tính nhất quán giá giữa trang chi tiết (PDP) và Giỏ hàng (`DEF_Order_04`).
2. **Tài khoản, Hồ sơ & Sổ địa chỉ (Profile & Address Book - 29 TCs):**
   - **Authentication:** Mở trang đăng nhập (`Profile_LoginPageOpen_01`), chặn khách vãng lai truy cập Address Book (`Profile_GuestAddressRedirect_02`), đăng nhập bằng thông tin hợp lệ (`Profile_LoginValid_03`), đăng nhập sai mật khẩu (`Profile_LoginInvalid_04`), bỏ trống thông tin đăng nhập (`Profile_LoginEmpty_05`), kiểm tra cú pháp email (`Profile_LoginInvalidEmail_06`), đăng xuất kết thúc phiên làm việc (`Profile_Logout_07`).
   - **Profile Information:** Xem thông tin hồ sơ cá nhân (`Profile_AccountInfoView_08`), cập nhật thông tin hồ sơ hợp lệ (`Profile_AccountInfoEdit_09`), validation các trường hồ sơ bắt buộc (`Profile_AccountInfoRequired_10`).
   - **Address Book:** Mở danh sách sổ địa chỉ (`Address_BookOpen_11`), thêm địa chỉ mới hợp lệ (`Address_AddValid_12`), validation các trường địa chỉ bắt buộc (`Address_AddRequired_13`), kiểm tra số điện thoại hợp lệ và không hợp lệ (`Address_PhoneValid_14`, `15`), kiểm tra mã Zip hợp lệ và không hợp lệ (`Address_ZipValid_16`, `17`), đặt địa chỉ mặc định Billing / Shipping (`Address_SetDefaultBilling_18`, `Address_SetDefaultShipping_19`), chỉnh sửa địa chỉ có sẵn (`Address_EditExisting_20`), xóa địa chỉ có popup xác nhận (`Address_Delete_21`).
   - **Defect & Security (4 TCs):** Chống tấn công XSS Script Injection qua các trường địa chỉ (`DEF_Profile_01`), giữ nguyên session khi chuyển đổi các tab trang cá nhân (`DEF_Profile_02`), thông báo lỗi nhất quán khi tài khoản bị khóa (`DEF_Profile_03`), cập nhật thông tin không làm mất quyền địa chỉ mặc định (`DEF_Profile_04`).
3. **Tìm kiếm & Bộ lọc phân nhánh (Search & Faceted Filters - 29 TCs):**
   - **Keyword Search:** Tìm kiếm chính xác tên sản phẩm (`Search_Exact_01`), tìm kiếm từ khóa một phần (`Search_Partial_02`), chuẩn hóa cắt khoảng trắng thừa hai đầu (`Search_Trim_03`), giới hạn tối đa độ dài ký tự ô tìm kiếm (`Search_MaxLength_04`), kiểm tra bảo mật chống XSS ô tìm kiếm (`Search_Security_05`), tìm kiếm từ khóa không tồn tại trả về thông báo rỗng (`Search_NoResult_06`).
   - **Faceted & Price Filters:** Lọc khoảng giá hợp lệ $20 - $50 (`Filter_PriceValid_01`), lọc cận biên Min = Max = $30 (`Filter_PriceBoundary_02`), lọc khoảng giá không hợp lệ Min > Max (`Filter_PriceInvalid_03`), chặn giá trị số âm và ký tự chữ (`Filter_PriceNegative_04`), lọc kết hợp Thương hiệu + Danh mục (`Filter_CategoryBrand_05`), lọc đa tiêu chí OR cùng nhóm & AND khác nhóm (`Filter_MultiCategory_06`), nút Clear All hủy toàn bộ bộ lọc (`Filter_ClearAll_07`).
   - **Sorting:** Sắp xếp giá tăng dần Low to High (`Sort_PriceAsc_01`), giảm dần High to Low (`Sort_PriceDesc_02`), sắp xếp theo tên sản phẩm A-Z và Z-A (`Sort_NameAsc_03`, `Sort_NameDesc_04`).
   - **URL State & Pagination:** Phân trang kết quả tìm kiếm (`Search_Pagination_01`), thay đổi số lượng sản phẩm trên trang (`Search_PageSize_02`), lưu trữ và chia sẻ trạng thái bộ lọc qua URL query param (`Search_UrlState_03`), gợi ý từ khóa Autocomplete khi gõ tìm kiếm (`Search_Autocomplete_04`).
   - **Defect & Edge Cases (5 TCs):** Chống reload mất trạng thái bộ lọc (`DEF_Search_01`), tính đúng số lượng sản phẩm hiển thị trên badge facet (`DEF_Search_02`), tìm kiếm ký tự đặc biệt (`DEF_Search_03`), lọc theo danh mục con không làm mất bộ lọc cha (`DEF_Search_04`), kết quả tìm kiếm rỗng không gây crash giao diện (`DEF_Search_05`).

---

### 2.3. Thư mục `23130314_VoVanThiet/`
* **Người thực hiện:** Võ Văn Thiệt (MSSV: 23130314)
* **Tài liệu nguồn:**
  - [`test_design_category_and_configurable_products.md`](23130314_VoVanThiet/test_design_category_and_configurable_products.md)
  - [`test_design_promotion_rule_engine.md`](23130314_VoVanThiet/test_design_promotion_rule_engine.md)
  - [`test_design_one_page_checkout_order_fulfillment.md`](23130314_VoVanThiet/test_design_one_page_checkout_order_fulfillment.md)
  - [`test_spec_details_category_and_configurable_products.md`](23130314_VoVanThiet/test_spec_details_category_and_configurable_products.md)
  - [`test_spec_details_promotion_rule_engine.md`](23130314_VoVanThiet/test_spec_details_promotion_rule_engine.md)
  - [`test_spec_details_one_page_checkout_order_fulfillment.md`](23130314_VoVanThiet/test_spec_details_one_page_checkout_order_fulfillment.md)
  - Mỗi specification chi tiết triển khai các scenario trong ma trận tương ứng; tài liệu cũ được dùng tham khảo về điều kiện local, không phải nguồn phạm vi.
* **Môi trường & Công cụ:** MahoCommerce source trong `maho/`, Admin Panel và Storefront local, Playwright TypeScript.
* **Phương pháp:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Decision Table, State Transition, End-to-End.

#### Danh mục chức năng kiểm thử:
1. **Category Tree & Configurable Product Variants:** Cây danh mục nhiều cấp, thứ tự sibling, chuyển node, trạng thái nhánh, URL key, khả năng xóa node có con/sản phẩm; configurable attribute eligibility, ma trận Color × Size, tổ hợp thiếu, biến thể disabled/out-of-stock, ảnh và surcharge theo option, lựa chọn biến thể và tích hợp PLP/breadcrumb. Không lặp generic product CRUD/grid/filter/search.
2. **Promotion Rule Engine:** Phạm vi website/customer group, cửa sổ ngày, điều kiện product/category, tính phần trăm/fixed discount, biên giảm giá, priority và discard/stop processing, điều kiện subtotal/quantity, mixed-cart category, stacking, Buy X Get Y, free shipping, và tương tác tax. Không lặp coupon administration, validation trường coupon, hay coupon apply/remove flow.
3. **One-Page Checkout & Order Fulfillment:** Điều hướng các bước checkout theo địa chỉ cùng/khác, thiếu shipping rate, chọn/bỏ payment method, quay lại bước trước, refresh/recovery và đối chiếu Order Review; phía Admin kiểm tra đơn, invoice/shipment toàn phần và một phần, chặn vượt số lượng, tracking, chuyển state khi hoàn tất, hủy đơn chưa xử lý và từ chối hủy đơn đã invoice. Không lặp cart CRUD/BVA, login, address book CRUD, email xác nhận, order ID uniqueness hay double-submit.

---

### 2.4. Thư mục `23130327_NguyenHoaiThuong/`
* **Người thực hiện:** Nguyễn Hoài Thương (MSSV: 23130327)
* **Tài liệu nguồn:**
  - `test_design_coupon_management.md` & `test_spec_details_coupon_management.md`
  - `test_design_sales_reports.md` & `test_spec_details_sales_reports.md`
  - `test_design_shopping_cart.md` & `test_spec_details_shopping_cart.md`
* **Phương pháp:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Security Sanitization, Performance & SLA Testing.

#### Danh mục chức năng kiểm thử:
1. **Quản lý Mã giảm giá (Coupon & Discount Code System):**
   - **Quản trị Admin (Shopping Cart Price Rules):** Truy cập phân hệ quản lý mã giảm giá trong Admin (`Coupon_Admin_01`), form tạo mới quy tắc và validation trường bắt buộc (Rule Name, Status, Coupon Type), cấu hình Specific Coupon Code (`TESTSALE15`), cấu hình thời hạn hiệu lực From/To Date, cấu hình giới hạn số lượt dùng (Uses per Coupon, Uses per Customer), cấu hình nhóm khách hàng (Customer Groups) và loại chiết khấu (Percentage vs Fixed Amount).
   - **Áp dụng Mã giảm giá Storefront (Storefront Coupon):** Hiển thị ô nhập mã `#maho-promo-code` và nút Apply tại `/checkout/cart`, bắt lỗi khi bỏ trống ô nhập hoặc nhập mã không tồn tại, kiểm tra cắt khoảng trắng đầu cuối (Trim check: `   DISCOUNT10   `), kiểm tra ký tự đặc biệt và độ dài vượt ngưỡng (>50 ký tự), kiểm tra bảo mật chống tấn công XSS Script Injection qua ô coupon, áp dụng thành công mã coupon hợp lệ, hủy áp dụng mã (Cancel Coupon), chống spam click liên tục nút Apply.
2. **Báo cáo Thống kê Doanh thu (Sales Analytics & Reports):**
   - **Truy cập & Phân quyền (Access & ACL):** Truy cập trang Báo cáo Doanh thu bằng tài khoản Super Admin (kèm CSRF Secret Key), kiểm tra cơ chế kiểm soát quyền (ACL) khi tài khoản Staff không có thẩm quyền.
   - **Bố cục & Hiển thị:** Bố cục các thành phần điều khiển (dropdown chu kỳ, ô chọn khoảng ngày From/To, nút Show Report, Export).
   - **Biểu đồ theo chu kỳ thời gian:** Kết xuất biểu đồ và bảng dữ liệu theo chu kỳ Ngày (Day), Tháng (Month), Năm (Year); chuyển đổi qua lại Metric giữa Amounts và Orders.
   - **Kiểm thử giá trị biên ngày tháng (Date Range BVA):** Biên tối thiểu 1 ngày duy nhất ($From = To$), cận biên dưới 2 ngày liên tiếp, mốc chuẩn danh định 1 tháng (30 ngày), biên tối đa 365 ngày tròn và vượt biên > 365 ngày, biên không hợp lệ ($From > To$) và chọn ngày tương lai, biên năm nhuận (29/02), khoảng thời gian doanh thu bằng 0đ (0 đơn hàng).
   - **Thống kê sản phẩm bán chạy (Bestsellers):** Danh sách Bestsellers, widget Top 5 Dashboard, phân trang và xử lý đồng hạng số lượng bán.
   - **Trích xuất báo cáo (Export CSV & Excel):** Xuất định dạng Excel (.xlsx/.xml) và CSV (.csv); kiểm tra xuất 0 dòng, 1 dòng, 10.000 dòng, cơ chế mã hóa UTF-8 và chống spam click nút Export.
   - **Hiệu năng & SLA:** Đo lường thời gian phản hồi của Dashboard và Báo cáo lớn đáp ứng cam kết SLA $\le$ 3–5 giây.
3. **Quản lý Giỏ hàng (Shopping Cart Details, BVA & Estimates):**
   - **Hiển thị giỏ hàng (Cart Display):** Thêm sản phẩm từ PDP, kiểm tra bảng `#shopping-cart-table`, hình ảnh đại diện thumbnail, link trỏ về PDP.
   - **Cập nhật số lượng (Quantity Updates & BVA):** Cập nhật số lượng hợp lệ (Qty = 1, Qty = 2), số lượng vượt tồn kho (Qty = 9999 kích hoạt thông báo lỗi), ràng buộc giá trị biên Qty = 0 (tự động xóa hàng), Qty âm (-1), Qty chuỗi ký tự ('abc') và số thập phân (1.5).
   - **Tính toán tài chính:** Kiểm tra tính chính xác của Subtotal và Grand Total tại `#shopping-cart-totals-table`.
   - **Ước tính cước vận chuyển & thuế:** Khối ước tính `#shipping-zip-form`, chọn quốc gia, nhập Zip/Postcode và xác thực khi bỏ trống mã bưu chính.
   - **Điều hướng & Xử lý Giỏ rỗng:** Nút Continue Shopping, Proceed to Checkout, xóa từng sản phẩm qua icon Remove, trạng thái giỏ rỗng (Empty State) và thông điệp hướng dẫn mua sắm.

---

### 2.5. Thư mục `23130397_ThongLyTieuYen/`
* **Người thực hiện:** Thòng Lý Tiểu Yến (MSSV: 23130397)
* **Tài liệu nguồn:**
  - `test_design_authentication_and_2fa.md` & `test_spec_details_authentication_and_2fa.md`
  - `test_design_product_reviews_and_ratings.md` & `test_spec_details_product_reviews_and_ratings.md`
  - `test_design_wishlist_and_comparison.md` & `test_spec_details_wishlist_and_comparison.md`
* **Phương pháp:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Input Sanitization, Security & Multi-Window Testing.

#### Danh mục chức năng kiểm thử:
1. **Đăng nhập, Bảo mật & 2FA (Authentication, Security & 2FA - 23 TCs):**
   - **Xác thực & Bắt lỗi form:** Đăng nhập thành công với tài khoản hợp lệ, từ chối khi nhập sai mật khẩu hoặc tài khoản chưa đăng ký, validation khi bỏ trống trường bắt buộc, email sai cú pháp, xử lý email không phân biệt chữ hoa/thường (case-insensitivity), mật khẩu chứa khoảng trắng đầu/cuối (trimming).
   - **Khôi phục mật khẩu (Forgot Password):** Gửi email khôi phục mật khẩu, validation form quên mật khẩu.
   - **Bảo mật & Phòng thủ hệ thống:** Bảo mật Form Key CSRF Token chống tấn công CSRF, che giấu mật khẩu (`type="password"`), chống tấn công SQL Injection trên form xác thực, chính sách giới hạn số lần đăng nhập sai (Account Lockout / Rate Limiting chống Brute Force).
   - **Quản lý phiên (Session Management):** Cơ chế hủy session an toàn khi đăng xuất (Sign Out), vô hiệu hóa nút Back của trình duyệt ngăn chặn truy cập lịch sử sau khi đăng xuất.
   - **Xác thực 2 yếu tố (2FA):** Cơ chế xác thực hai yếu tố qua ứng dụng Authenticator (TOTP) và tin nhắn SMS (ghi nhận trạng thái Skipped trên môi trường Demo).
2. **Đánh giá & Xếp hạng Sản phẩm (Product Reviews & Ratings - 23 TCs):**
   - **Form đánh giá & Modal:** Điều hướng đến trang chi tiết sản phẩm (PDP) và mở form đánh giá qua modal/dialog `#review-form`, đóng form an toàn bằng nút Cancel.
   - **Tiêu chí đánh giá sao (Star Ratings):** Lựa chọn độc lập hoặc đồng thời thang điểm từ 1 đến 5 sao cho từng tiêu chí (*Quality*, *Price*, *Value*).
   - **Gửi nhận xét & Validation:** Gửi bài đánh giá hợp lệ (Nickname, Summary, Review text), bắt lỗi validation khi thiếu sao, thiếu nội dung chi tiết hoặc bỏ trống toàn bộ form.
   - **Giới hạn dữ liệu & Ký tự:** Nội dung nhận xét đạt độ dài tối thiểu, giới hạn tối đa trường tiêu đề Summary (Max Length), hỗ trợ tiếng Việt có dấu (Unicode UTF-8) và ký tự đặc biệt.
   - **Bảo mật & Chống Spam:** Mã hóa/escape ký tự HTML/JavaScript chống tấn công XSS, cơ chế chống gửi nhận xét trùng lặp liên tục (Double submit / Spam Review Protection).
   - **Tích hợp tài khoản khách hàng:** Tự động điền Nickname khi khách hàng đã đăng nhập tài khoản thực hiện đánh giá.
3. **Danh sách yêu thích & So sánh Sản phẩm (Wishlist & Comparison - 24 TCs):**
   - **Kiểm soát quyền truy cập Wishlist:** Khách vãng lai (Guest) chưa đăng nhập cố gắng vào Wishlist sẽ bị chặn và chuyển hướng về trang Login.
   - **Quản lý Wishlist (CRUD):** Đăng nhập và thêm sản phẩm vào Wishlist thành công, hiển thị đầy đủ thông tin (tên, ảnh, giá), cập nhật số lượng (Quantity) và tính lại bảng, xóa từng sản phẩm khỏi Wishlist có xác nhận popup, giao diện rỗng khi không còn sản phẩm.
   - **Quy trình So sánh Sản phẩm (Product Comparison):** Thêm sản phẩm thứ nhất và thứ hai vào danh sách so sánh từ Catalog/PDP, chống thêm trùng lặp sản phẩm đã có, mở cửa sổ popup so sánh chi tiết (`Compare Window`), kiểm tra cấu trúc bảng đối chiếu thông số sản phẩm (Specs Matrix), xóa 1 sản phẩm khỏi bảng so sánh, xóa toàn bộ danh sách so sánh (`Clear All Compare`).
   - **Tác vụ thương mại:** Chuyển toàn bộ sản phẩm từ Wishlist vào Giỏ hàng (`Add All to Cart`), chia sẻ danh sách yêu thích qua Email (`Share Wishlist`), ghi chú nhận xét riêng cho từng mặt hàng trong Wishlist, liên kết quay lại mua sắm (`Continue Shopping`).
   - **Defect & Kiểm thử biên:** Giới hạn trần số lượng sản phẩm so sánh (phát hiện lỗi tràn giao diện ngang - Horizontal Overflow).
