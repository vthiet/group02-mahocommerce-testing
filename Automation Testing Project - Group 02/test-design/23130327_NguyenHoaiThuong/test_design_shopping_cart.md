# Test Design Document: Shopping Cart Management (Maho Commerce)

**Project:** Maho Commerce Automation Testing  
**Tester:** Nguyễn Hoài Thương (MSSV: 23130327)  
**Tool Target:** Playwright Test (JavaScript)  
**Environment:** Web Demo (https://demo.mahocommerce.com/)  
**Module:** Shopping Cart Management (Cart Item Details, Quantity Updates BVA, Totals Calculation, Shipping Estimation, Empty State)  
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Functional & Usability Testing

---

## 1. Overview & Strategy

Phân hệ **Quản lý Giỏ hàng (Shopping Cart Management)** là bước chuyển giao trọng yếu giữa việc duyệt sản phẩm và tiến hành đặt hàng. Phạm vi kiểm thử bao gồm:

1. **Hiển thị Giỏ hàng (Cart Display):** Thêm sản phẩm từ PDP, kiểm tra bố cục bảng giỏ hàng `#shopping-cart-table`, hình ảnh thumbnail và liên kết trỏ ngược về trang chi tiết sản phẩm.
2. **Cập nhật số lượng (Quantity Updates & BVA):**
   - Cập nhật số lượng hợp lệ: Tăng Qty = 2 và mốc biên tối thiểu Qty = 1.
   - Giới hạn tồn kho: Qty vượt quá tồn kho (9999) kích hoạt thông báo lỗi.
   - Ràng buộc giá trị biên & dữ liệu: Qty = 0 (tự động xóa hàng), Qty âm (-1), Qty chuỗi ký tự ('abc') và số thập phân (1.5).
3. **Tính toán tổng tiền (Financial Totals):** Kiểm tra tính đúng đắn của Subtotal và Grand Total trong bảng `#shopping-cart-totals-table`.
4. **Ước tính cước vận chuyển & Thuế (Estimate Shipping and Tax):** Khối tính cước `#shipping-zip-form`, chọn quốc gia, nhập Zip/Postcode và xác thực khi bỏ trống mã bưu chính.
5. **Điều hướng & Xử lý Giỏ rỗng (Cart Actions & Empty State):**
   - Nút [Continue Shopping] và nút [Proceed to Checkout].
   - Xóa từng sản phẩm khỏi giỏ hàng qua biểu tượng Remove Item.
   - Trạng thái giỏ hàng rỗng (Empty State) và hiển thị thông điệp hướng dẫn mua sắm.

---

## 2. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Execution Strategy / Automation Note (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3. Quản lý Giỏ hàng (Shopping Cart)** | 3.1 Thao tác sản phẩm | Thêm vào giỏ | [Positive] Thêm sản phẩm đơn giản vào giỏ hàng thành công | Function | Thêm SP & Banner xanh |
| **** |  | Chi tiết bảng giỏ hàng | [Display] Kiểm tra giao diện và cấu trúc bảng chi tiết giỏ hàng | GUI / Display | Tên, giá, qty, subtotal |
| **** | 3.2 Cập nhật số lượng (BVA) | Tăng số lượng (Nominal) | [Positive] Cập nhật tăng số lượng sản phẩm trong giỏ hàng (Qty = 2) | Function | Nhân đôi subtotal |
| **** |  | Biên tối thiểu hợp lệ (Min) | [BVA] Cập nhật số lượng sản phẩm ở mốc biên tối thiểu hợp lệ (Qty = 1) | Boundary Value | Min Qty = 1 |
| **** |  | Mốc số lượng lớn (Max) | [BVA] Cập nhật số lượng sản phẩm ở mốc lớn hợp lệ (Qty = 5) | Boundary Value | Large Qty = 5 |
| **** | 3.3 Ước tính phí vận chuyển & thuế | Cấu trúc khối ước tính | Kiểm tra khối chức năng Ước tính Phí vận chuyển & Thuế (Estimate Shipping and Tax) | Function | Country, Postcode, Estimate |
| **** |  | Thay đổi Quốc gia | Kiểm tra tương tác chọn quốc gia khác trong bộ tính phí vận chuyển | Interactive | Chọn United States |
| **** | 3.4 Điều hướng & Dọn dẹp giỏ | Nút Tiếp tục mua sắm | Kiểm tra hiển thị và điều hướng của nút Tiếp tục mua sắm (Continue Shopping) | GUI / Navigation | Nút Continue Shopping |
| **** |  | Xóa một sản phẩm | [Positive] Xóa một sản phẩm cụ thể ra khỏi giỏ hàng | Function | Xử lý confirm dialog |
| **** |  | Giỏ hàng rỗng (Empty) | [Positive] Kiểm tra giao diện giỏ hàng khi không có sản phẩm (Empty State) | Function / State | Shopping Cart is Empty |

---

## 3. Playwright Automation Guidelines & Best Practices for Shopping Cart

1. **Reliable Add to Cart Strategy:** Để đảm bảo sản phẩm luôn có trong giỏ hàng, helper `addSampleProduct(page)` submit form trực tiếp trên PDP và chờ sự kiện `domcontentloaded`.
2. **Cart Table Assertions:** Sử dụng selector `#shopping-cart-table` kết hợp với kiểm tra input `input[name*='[qty]']` để xác thực giỏ hàng đã tải hoàn chỉnh trước khi thao tác cập nhật.
3. **Empty State Verification:** Khi xóa hết sản phẩm, kiểm tra nội dung text của trang để xác nhận thông báo Empty State hiển thị đúng chuẩn.
