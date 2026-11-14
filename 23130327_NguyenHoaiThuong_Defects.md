# BÁO CÁO GHI NHẬN VÀ QUẢN LÝ LỖI (DEFECT REPORT)
## ASSIGNMENT 09: DEFECT IDENTIFICATION & REPORTING

* **Môn học:** Kiểm thử phần mềm (Software Testing)
* **Giảng viên hướng dẫn:** ThS. Trần Thị Thanh Nga
* **Hệ thống kiểm thử (SUT):** Maho Commerce v1.9.4.5 (`https://demo.mahocommerce.com`)
* **Nhóm thực hiện:** Group 02
* **Sinh viên thực hiện:** Nguyễn Hoài Thương (MSSV: `23130327`)
* **Trưởng nhóm / Phân công xử lý:** Võ Văn Thiết (MSSV: `23130314`)
* **Ngày lập báo cáo:** 14/11/2026
* **Trạng thái:** 12 Defects thực tế đã được kiểm thử, xác minh và lưu vết minh chứng

---

## 1. BẢNG TỔNG HỢP DEFECT REPORT (CHUẨN FORM MẪU GIẢNG VIÊN)

| Name | Defect ID | Defect Title | Module / Function | Severity | Priority | Reproducibility | Evidence (Screenshot) | Defect Status |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Nguyen Hoai Thuong | **[SalesReports-DEF01]** | Không có validation cảnh báo khi Từ ngày lớn hơn Đến ngày (From Date > To Date) | Sales Reports | **Medium** | **P2** | Always | [`SalesReports-DEF01.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/SalesReports-DEF01.png) | `Open` |
| Nguyen Hoai Thuong | **[SalesReports-DEF02]** | Nút Export không bị vô hiệu hóa khi click, cho phép Spam Click xuất nhiều file trùng lặp | Sales Reports | **Medium** | **P2** | Always | [`SalesReports-DEF02.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/SalesReports-DEF02.png) | `Open` |
| Nguyen Hoai Thuong | **[SalesReports-DEF03]** | Cho phép lọc và truy vấn báo cáo doanh thu ở các mốc ngày trong tương lai (Năm 2030) | Sales Reports | **Low** | **P4** | Always | [`SalesReports-DEF03.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/SalesReports-DEF03.png) | `Open` |
| Nguyen Hoai Thuong | **[SalesReports-DEF04]** | Mở trực tiếp liên kết Admin Report không có Secret Key bị huỷ phiên và đá ra Login không thông báo | Sales Reports | **Medium** | **P3** | Always | [`SalesReports-DEF04.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/SalesReports-DEF04.png) | `Open` |
| Nguyen Hoai Thuong | **[CouponManagement-DEF01]** | Ô nhập mã giảm giá Storefront không tự động cắt khoảng trắng đầu/cuối (Trim whitespace) | Coupon Management | **High** | **P1** | Always | [`CouponManagement-DEF01.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/CouponManagement-DEF01.png) | `Open` |
| Nguyen Hoai Thuong | **[CouponManagement-DEF02]** | Nút Apply Coupon thiếu cơ chế Debounce / Disable chống Spam Click liên tục | Coupon Management | **High** | **P2** | Always | [`CouponManagement-DEF02.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/CouponManagement-DEF02.png) | `Open` |
| Nguyen Hoai Thuong | **[CouponManagement-DEF03]** | Không giới hạn độ dài tối đa (maxlength) trên thẻ input nhập Coupon ngoài Storefront | Coupon Management | **Medium** | **P3** | Always | [`CouponManagement-DEF03.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/CouponManagement-DEF03.png) | `Open` |
| Nguyen Hoai Thuong | **[CouponManagement-DEF04]** | Admin cho phép cấu hình From Date lớn hơn To Date khi tạo quy tắc giảm giá giỏ hàng | Coupon Management | **High** | **P1** | Always | [`CouponManagement-DEF04.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/CouponManagement-DEF04.png) | `Open` |
| Nguyen Hoai Thuong | **[ShoppingCart-DEF01]** | Cập nhật số lượng Qty là số âm hoặc ký tự chữ không hiển thị thông báo lỗi giải thích | Shopping Cart | **Medium** | **P2** | Always | [`ShoppingCart-DEF01.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/ShoppingCart-DEF01.png) | `Open` |
| Nguyen Hoai Thuong | **[ShoppingCart-DEF02]** | Sửa số lượng Qty = 0 tự động xóa sản phẩm khỏi giỏ hàng mà không có hộp thoại xác nhận | Shopping Cart | **Medium** | **P2** | Always | [`ShoppingCart-DEF02.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/ShoppingCart-DEF02.png) | `Open` |
| Nguyen Hoai Thuong | **[ShoppingCart-DEF03]** | Cập nhật số lượng vượt tồn kho báo lỗi nhưng ô input không tự động hoàn tác (revert) số lượng | Shopping Cart | **High** | **P1** | Always | [`ShoppingCart-DEF03.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/ShoppingCart-DEF03.png) | `Open` |
| Nguyen Hoai Thuong | **[ShoppingCart-DEF04]** | Mở 2 Tab thay đổi giỏ hàng gây lệch tổng tiền hiển thị giữa trang giỏ hàng và trang thanh toán | Shopping Cart | **High** | **P1** | Always | [`ShoppingCart-DEF04.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/ShoppingCart-DEF04.png) | `Open` |

---

## 2. CHI TIẾT 12 DEFECTS THỰC TẾ (DETAILED DEFECT SPECIFICATIONS)

### [SalesReports-DEF01]: Không có validation cảnh báo khi Từ ngày lớn hơn Đến ngày (From Date > To Date)

* **Module / Function:** `Sales Reports`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **Medium** | **Priority:** **P2** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`SalesReports-DEF01.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/SalesReports-DEF01.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Khi quản trị viên nhập khoảng ngày lọc doanh thu với From Date lớn hơn To Date, hệ thống không hề hiển thị bất kỳ thông báo lỗi nào mà âm thầm tải lại bảng rỗng 0 record, gây hiểu nhầm không có doanh thu. |
| **Preconditions** | Đã đăng nhập tài khoản Admin (/admin2941834/). |
| **Steps to Reproduce** | 1. Vào Reports > Sales > Orders.<br>2. Ô From nhập: 31/12/2026.<br>3. Ô To nhập: 01/01/2026.<br>4. Bấm nút [Show Report]. |
| **Test Data / Input** | From: 31/12/2026<br>To: 01/01/2026 |
| **Expected Result** | Hệ thống phải hiển thị thông báo lỗi validation: 'From Date must be earlier than or equal to To Date' và chặn thực thi truy vấn. |
| **Actual Result** | **Hệ thống không hiển thị thông báo lỗi nào; tự động tải lại bảng trống (0 record).** |

---

### [SalesReports-DEF02]: Nút Export không bị vô hiệu hóa khi click, cho phép Spam Click xuất nhiều file trùng lặp

* **Module / Function:** `Sales Reports`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **Medium** | **Priority:** **P2** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`SalesReports-DEF02.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/SalesReports-DEF02.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Nút Export báo cáo doanh thu không có cơ chế debounce hoặc disabled sau click đầu tiên, khiến người dùng spam click gửi nhiều request làm nghẽn máy chủ và tải nhiều file trùng lặp. |
| **Preconditions** | Đang tại trang Báo cáo Doanh thu có dữ liệu. |
| **Steps to Reproduce** | 1. Tại ô Export, chọn CSV.<br>2. Click liên tục 3-4 lần thật nhanh vào nút [Export]. |
| **Test Data / Input** | Format: CSV<br>Spam click 4 lần liên tiếp |
| **Expected Result** | Nút Export phải chuyển sang trạng thái disabled hoặc hiển thị loading spinner ngay sau click đầu tiên để ngăn spam click. |
| **Actual Result** | **Nút Export vẫn enabled hoàn toàn, trình duyệt gửi nhiều request tải file cùng lúc làm quá tải server và tải về nhiều file orders(1).csv, orders(2).csv.** |

---

### [SalesReports-DEF03]: Cho phép lọc và truy vấn báo cáo doanh thu ở các mốc ngày trong tương lai (Năm 2030)

* **Module / Function:** `Sales Reports`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **Low** | **Priority:** **P4** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`SalesReports-DEF03.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/SalesReports-DEF03.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Hệ thống cho phép người dùng chọn khoảng thời gian ở tương lai (năm 2030) mà không có ràng buộc To Date <= Current Date, dẫn đến việc gửi query phi lý về cơ sở dữ liệu. |
| **Preconditions** | Đang tại trang Báo cáo Doanh thu. |
| **Steps to Reproduce** | 1. Nhập From = 01/01/2030, To = 31/01/2030.<br>2. Bấm nút [Show Report]. |
| **Test Data / Input** | From: 01/01/2030<br>To: 31/01/2030 |
| **Expected Result** | Hệ thống phải giới hạn ngày tối đa không vượt quá ngày hiện tại (Current Date) hoặc cảnh báo ngày không hợp lệ. |
| **Actual Result** | **Hệ thống vẫn chấp nhận submit form và tải trang bình thường với bảng rỗng không có cảnh báo.** |

---

### [SalesReports-DEF04]: Mở trực tiếp liên kết Admin Report không có Secret Key bị huỷ phiên và đá ra Login không thông báo

* **Module / Function:** `Sales Reports`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **Medium** | **Priority:** **P3** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`SalesReports-DEF04.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/SalesReports-DEF04.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Khi người dùng truy cập trực tiếp route Báo cáo bằng URL không chứa CSRF Secret Key, hệ thống tự động huỷ phiên làm việc và đá ra màn hình Đăng nhập mà không có bất kỳ thông điệp nào giải thích. |
| **Preconditions** | Đã đăng nhập tài khoản Admin. |
| **Steps to Reproduce** | 1. Mở tab mới, gõ URL: /admin2941834/report_sales/sales/ (không chứa param key).<br>2. Nhấn Enter. |
| **Test Data / Input** | URL không chứa param /key/xxxx/ |
| **Expected Result** | Hệ thống nên hiển thị thông báo 'Invalid Secret Key. Please try again' hoặc tự động làm mới key và vào đúng trang báo cáo. |
| **Actual Result** | **Hệ thống âm thầm huỷ phiên và đá người dùng về màn hình Login mà không có thông điệp giải thích.** |

---

### [CouponManagement-DEF01]: Ô nhập mã giảm giá Storefront không tự động cắt khoảng trắng đầu/cuối (Trim whitespace)

* **Module / Function:** `Coupon Management`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **High** | **Priority:** **P1** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`CouponManagement-DEF01.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/CouponManagement-DEF01.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Khi khách hàng copy mã giảm giá vô tình dính khoảng trắng ở đầu hoặc cuối chuỗi, hệ thống không tự động trim mà gửi nguyên chuỗi có dấu cách lên server và từ chối mã hợp lệ. |
| **Preconditions** | Giỏ hàng có sản phẩm mẫu. |
| **Steps to Reproduce** | 1. Vào giỏ hàng /checkout/cart/.<br>2. Tại ô Discount Codes, nhập mã: '   DISCOUNT10   '.<br>3. Bấm nút [Apply]. |
| **Test Data / Input** | Mã coupon: '   DISCOUNT10   ' (có 3 dấu cách trước và sau) |
| **Expected Result** | Hệ thống tự động cắt bỏ khoảng trắng thừa (trim) và xác thực mã theo giá trị gốc 'DISCOUNT10'. |
| **Actual Result** | **Hệ thống giữ nguyên khoảng trắng và báo lỗi: 'Promo code "   DISCOUNT10   " is not valid.'** |

---

### [CouponManagement-DEF02]: Nút Apply Coupon thiếu cơ chế Debounce / Disable chống Spam Click liên tục

* **Module / Function:** `Coupon Management`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **High** | **Priority:** **P2** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`CouponManagement-DEF02.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/CouponManagement-DEF02.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Nút Apply Coupon ngoài giỏ hàng không bị khóa khi đang gửi request, người dùng click liên tục làm phát sinh nhiều request AJAX đồng thời tới server gây xung đột trạng thái session. |
| **Preconditions** | Giỏ hàng có sản phẩm. |
| **Steps to Reproduce** | 1. Nhập mã bất kỳ vào ô Discount Codes.<br>2. Bấm liên tiếp 3-4 lần thật nhanh vào nút [Apply]. |
| **Test Data / Input** | Mã: 'TESTCODE'<br>Spam click 3 lần |
| **Expected Result** | Nút Apply phải bị disabled ngay sau cú click đầu tiên cho đến khi server phản hồi AJAX xong. |
| **Actual Result** | **Nút Apply vẫn click được liên tục, gửi nhiều request AJAX couponPost đồng thời gây chớp nháy giao diện và nguy cơ race condition.** |

---

### [CouponManagement-DEF03]: Không giới hạn độ dài tối đa (maxlength) trên thẻ input nhập Coupon ngoài Storefront

* **Module / Function:** `Coupon Management`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **Medium** | **Priority:** **P3** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`CouponManagement-DEF03.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/CouponManagement-DEF03.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Thẻ input nhập mã giảm giá ngoài Storefront không khai báo thuộc tính maxlength, cho phép paste chuỗi văn bản cực lớn gây lãng phí tài nguyên và tiềm ẩn lỗ hổng DoS. |
| **Preconditions** | Giỏ hàng có sản phẩm. |
| **Steps to Reproduce** | 1. Inspect phần tử ô nhập mã giảm giá.<br>2. Kiểm tra thuộc tính của thẻ input #coupon_code hoặc #maho-promo-code. |
| **Test Data / Input** | Chuỗi ký tự dài > 500 ký tự |
| **Expected Result** | Thẻ input phải có thuộc tính maxlength='50' để giới hạn độ dài hợp lệ của một mã giảm giá. |
| **Actual Result** | **Thẻ input hoàn toàn không có thuộc tính maxlength, cho phép người dùng nhập hoặc paste hàng ngàn ký tự.** |

---

### [CouponManagement-DEF04]: Admin cho phép cấu hình From Date lớn hơn To Date khi tạo quy tắc giảm giá giỏ hàng

* **Module / Function:** `Coupon Management`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **High** | **Priority:** **P1** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`CouponManagement-DEF04.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/CouponManagement-DEF04.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Trong form Add New Rule của Shopping Cart Price Rules, hệ thống cho phép lưu quy tắc có From Date lớn hơn To Date mà không validate chặn ở form, tạo ra quy tắc hỏng trong cơ sở dữ liệu. |
| **Preconditions** | Đã đăng nhập Admin. |
| **Steps to Reproduce** | 1. Vào Promotions > Shopping Cart Price Rules > Add New Rule.<br>2. Điền Rule Name, Coupon Code.<br>3. Chọn From Date: 31/12/2026, To Date: 01/01/2026.<br>4. Bấm [Save]. |
| **Test Data / Input** | From Date: 31/12/2026<br>To Date: 01/01/2026 |
| **Expected Result** | Form phải validate và báo lỗi 'To Date must be greater than or equal to From Date', không cho phép lưu form. |
| **Actual Result** | **Form lưu thành công và hiển thị thông báo 'The rule has been saved.', tạo ra quy tắc bị nghịch đảo ngày hiệu lực.** |

---

### [ShoppingCart-DEF01]: Cập nhật số lượng Qty là số âm hoặc ký tự chữ không hiển thị thông báo lỗi giải thích

* **Module / Function:** `Shopping Cart`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **Medium** | **Priority:** **P2** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`ShoppingCart-DEF01.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/ShoppingCart-DEF01.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Khi người dùng nhập số lượng âm (Qty = -1) hoặc ký tự chữ (Qty = abc) rồi bấm Update Shopping Cart, hệ thống tự động quay về số lượng cũ mà không hề có bất kỳ câu thông báo lỗi giải thích nào. |
| **Preconditions** | Giỏ hàng có 1 sản phẩm với Qty = 1. |
| **Steps to Reproduce** | 1. Tại ô số lượng (Qty), nhập: -1 (hoặc 'abc').<br>2. Bấm nút [Update Shopping Cart]. |
| **Test Data / Input** | Qty = -1 hoặc Qty = 'abc' |
| **Expected Result** | Hệ thống phải hiển thị thông báo lỗi màu đỏ rõ ràng: 'Please enter a valid quantity greater than 0'. |
| **Actual Result** | **Trang web tải lại trong im lặng, số lượng tự reset về 1 mà không có thông báo lỗi giải thích.** |

---

### [ShoppingCart-DEF02]: Sửa số lượng Qty = 0 tự động xóa sản phẩm khỏi giỏ hàng mà không có hộp thoại xác nhận

* **Module / Function:** `Shopping Cart`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **Medium** | **Priority:** **P2** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`ShoppingCart-DEF02.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/ShoppingCart-DEF02.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Khi người dùng sửa số lượng sản phẩm về 0 và bấm Update, hệ thống xóa ngay sản phẩm mà không có hộp thoại confirm, dễ gây mất sản phẩm nếu người dùng lỡ tay bấm nhầm phím 0. |
| **Preconditions** | Giỏ hàng có sản phẩm. |
| **Steps to Reproduce** | 1. Sửa ô Qty từ 1 thành 0.<br>2. Bấm [Update Shopping Cart]. |
| **Test Data / Input** | Qty = 0 |
| **Expected Result** | Hệ thống nên hiển thị popup xác nhận: 'Are you sure you want to remove this item from your cart?' trước khi xóa. |
| **Actual Result** | **Hệ thống tự động xóa sản phẩm và đưa giỏ hàng về trạng thái rỗng mà không có bất kỳ bước xác nhận nào.** |

---

### [ShoppingCart-DEF03]: Cập nhật số lượng vượt tồn kho báo lỗi nhưng ô input không tự động hoàn tác (revert) số lượng

* **Module / Function:** `Shopping Cart`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **High** | **Priority:** **P1** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`ShoppingCart-DEF03.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/ShoppingCart-DEF03.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Khi người dùng cập nhật số lượng vượt quá tồn kho (Qty = 9999), hệ thống hiển thị thông báo lỗi nhưng giá trị trong ô input vẫn giữ nguyên con số 9999 sai lệch. |
| **Preconditions** | Giỏ hàng có sản phẩm có tồn kho hữu hạn. |
| **Steps to Reproduce** | 1. Nhập Qty = 9999.<br>2. Bấm nút [Update Shopping Cart]. |
| **Test Data / Input** | Qty = 9999 |
| **Expected Result** | Hệ thống báo lỗi và tự động hoàn tác giá trị hiển thị trên ô input về số lượng hợp lệ gần nhất (Qty = 1). |
| **Actual Result** | **Hệ thống báo lỗi 'The requested quantity is not available' nhưng ô input vẫn giữ nguyên số 9999, gây hiểu nhầm về số lượng thực tế trong giỏ.** |

---

### [ShoppingCart-DEF04]: Mở 2 Tab thay đổi giỏ hàng gây lệch tổng tiền hiển thị giữa trang giỏ hàng và trang thanh toán

* **Module / Function:** `Shopping Cart`
* **Reported By:** Nguyen Hoai Thuong | **Status:** `Open`
* **Severity:** **High** | **Priority:** **P1** | **Reproducibility:** `Always`
* **Minh chứng (Evidence):** [`ShoppingCart-DEF04.png`](../../Envidence%20-%20Group%2002/23130327_NguyenHoaiThuong/ShoppingCart-DEF04.png)

| Thuộc tính | Chi tiết mô tả |
| :--- | :--- |
| **Defect Description** | Người dùng mở 2 tab cùng xem giỏ hàng. Tab 1 tăng số lượng và cập nhật tiền. Tab 2 vẫn hiển thị giá cũ và bấm Checkout -> Gây lệch số tiền hiển thị giữa Tab 2 và trang thanh toán. |
| **Preconditions** | Giỏ hàng có sản phẩm. |
| **Steps to Reproduce** | 1. Mở 2 tab cùng xem giỏ hàng.<br>2. Tab 1: tăng số lượng lên 3 và bấm Update.<br>3. Tab 2: giữ nguyên hiển thị Qty cũ và bấm Proceed to Checkout. |
| **Test Data / Input** | Thao tác trên 2 tab song song |
| **Expected Result** | Khi bấm Checkout ở Tab 2, hệ thống phải phát hiện phiên giỏ hàng đã thay đổi và thông báo người dùng xem lại giỏ trước khi chuyển trang. |
| **Actual Result** | **Trang Checkout mở ra với số tiền mới của Tab 1 mà không cảnh báo cho người dùng đang ở Tab 2.** |

---

## 3. THỐNG KÊ VÀ PHÂN BỐ LỖI (DEFECT METRICS)

### Phân bố theo Phân hệ chức năng
* **Sales Reports:** 4 Defects (33.3%)
* **Coupon Management:** 4 Defects (33.3%)
* **Shopping Cart:** 4 Defects (33.3%)
* **Tổng cộng:** **12 Defects thực tế** (Vượt yêu cầu $\ge 10$ defects của Assignment 09)

### Phân bố theo Mức độ nghiêm trọng (Severity)
* **High / Major:** 4 Defects (Chiếm 33.3% - Tác động lớn đến luồng mua sắm & doanh thu)
* **Medium:** 7 Defects (Chiếm 58.3% - Lỗi validation, thiếu confirm dialog, spam click)
* **Low:** 1 Defect (Chiếm 8.4% - Lọc dữ liệu năm tương lai)

### Kịch bản tự động hóa xác minh (Automation Script)
Toàn bộ 12 lỗi trên đều đã được viết kịch bản tự động hóa bằng **Playwright TypeScript** tại:
* [`Automation Testing Project - Group 02/tests/23130327_NguyenHoaiThuong/defects-verification.spec.ts`](./tests/23130327_NguyenHoaiThuong/defects-verification.spec.ts)
* Lệnh chạy tự động:
  ```bash
  npx playwright test tests/23130327_NguyenHoaiThuong/defects-verification.spec.ts --project=chromium
  ```
