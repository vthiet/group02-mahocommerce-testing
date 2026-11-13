# Test Design Document: Coupon & Discount Code System (Maho Commerce)

**Project:** Maho Commerce Automation Testing  
**Tester:** Nguyễn Hoài Thương (MSSV: 23130327)  
**Tool Target:** Playwright Test (JavaScript)  
**Environment:** Web Demo (https://demo.mahocommerce.com/)  
**Module:** Coupon & Discount Code System (Admin Shopping Cart Price Rules & Storefront Coupon Application)  
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Security Sanitization & Stress Testing

---

## 1. Overview & Strategy

Phân hệ **Quản lý Mã giảm giá (Coupon / Discount Code System)** đảm bảo chính sách khuyến mại của cửa hàng vận hành chính xác giữa cấu hình Admin và giao diện khách hàng Storefront:

1. **Admin Shopping Cart Price Rules:**
   - Điều hướng và hiển thị danh sách quy tắc trên Admin Grid View (`#promo_quote_grid`).
   - Form tạo mới quy tắc (Add New Rule) và bắt lỗi xác thực các trường bắt buộc (Rule Name, Status, Coupon Type).
   - Cấu hình Specific Coupon Code (`TESTSALE15`), thời hạn hiệu lực (From/To Date) và giới hạn lượt sử dụng (Uses per Coupon, Uses per Customer).
   - Thiết lập nhóm khách hàng áp dụng (Customer Groups) và phương thức chiết khấu (Percentage vs Fixed Amount).
2. **Storefront Coupon Application:**
   - Hiển thị ô nhập mã `#maho-promo-code` và nút [Apply] trong giỏ hàng `/checkout/cart`.
   - Bắt lỗi khi bỏ trống ô nhập hoặc áp dụng mã không tồn tại trên hệ thống.
   - Kiểm tra cắt khoảng trắng đầu cuối (Trim check): Nhập `   DISCOUNT10   ` tự động xử lý hợp lệ.
   - Kiểm tra ký tự đặc biệt và độ dài vượt ngưỡng (>50 ký tự).
   - Bảo mật chống tấn công XSS Script Injection qua ô nhập coupon.
   - Áp dụng thành công mã hợp lệ, hủy áp dụng mã (Cancel Coupon) và chống spam click liên tục vào nút Apply.

---

## 2. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Execution Strategy / Automation Note (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2. Quản lý Mã giảm giá (Coupon System)** | 2.1 Quản trị Admin | Truy cập phân hệ | Coupon_Admin_01: Kiểm tra truy cập trang Quản lý Mã giảm giá (Shopping Cart Price Rules) trong Admin | Roles & Permission | Happy path |
| **** |  | Lưới danh sách | Coupon_Admin_02: Kiểm tra cấu trúc lưới hiển thị danh sách mã giảm giá (Grid view) | GUI / Display | Đầy đủ cột |
| **** |  | Mở form tạo mới | Coupon_Admin_03: Kiểm tra mở form tạo mới quy tắc mã giảm giá (Add New Rule) | Function | Nút Add |
| **** |  | Validation Admin | Coupon_Admin_04: [Validation] Kiểm tra bắt lỗi khi lưu quy tắc mã giảm giá để trống trường bắt buộc | Validation | Bắt lỗi form rỗng |
| **** |  | Cấu hình mã Coupon | Coupon_Admin_05: Kiểm tra cấu hình loại Coupon cụ thể (Specific Coupon) và ô nhập mã Coupon Code | Function | Mã TESTSALE15 |
| **** |  | Tìm kiếm quy tắc | Coupon_Admin_06: Kiểm tra lọc và tìm kiếm quy tắc giảm giá trên Grid Admin | Search / Filter | Lọc theo tên |
| **** | 2.2 Áp dụng tại Giỏ hàng | Giao diện nhập mã | Coupon_Store_01: Storefront - Kiểm tra giao diện ô nhập mã giảm giá và nút Apply trong giỏ hàng | GUI / Display | Ô maho-promo-code |
| **** |  | Mã không tồn tại | Coupon_Store_02: Storefront - [Negative] Áp dụng mã giảm giá không tồn tại trên hệ thống | Negative | Mã INVALID_9999 |
| **** |  | Bỏ trống mã | Coupon_Store_03: Storefront - [Validation] Bấm Apply khi để trống ô nhập mã giảm giá | Validation | Cảnh báo trống |
| **** |  | Cắt khoảng trắng Trim | Coupon_Store_04: Storefront - [BVA] Kiểm tra nhập mã giảm giá chứa khoảng trắng đầu cuối (Trim check) | Boundary Value | Trim space |
| **** |  | Ký tự đặc biệt | Coupon_Store_05: Storefront - [Negative/BVA] Kiểm tra nhập chuỗi ký tự đặc biệt làm mã giảm giá | Boundary Value | Ký tự đặc biệt |
| **** |  | Bảo mật XSS | Coupon_Store_06: Storefront - [Security] Kiểm tra không bị tấn công XSS / Script Injection qua ô nhập Coupon | Security | Chống XSS |

---

## 3. Playwright Automation Guidelines & Best Practices for Coupon Management

1. **Admin Promo Quote Navigation:** Sử dụng `await promoLink.waitFor({ state: 'attached' })` để lấy URL kèm Secret Key hợp lệ khi vào trang Shopping Cart Price Rules.
2. **Storefront Coupon Verification:** Đảm bảo giỏ hàng đã có ít nhất 1 sản phẩm bằng hàm `ensureProductInCart(page)` trước khi kích hoạt các kịch bản kiểm thử ô nhập mã giảm giá.
3. **XSS Security Testing:** Lắng nghe sự kiện `page.on('dialog')` để khẳng định payload `<script>` không bao giờ kích hoạt hộp thoại alert độc hại.
