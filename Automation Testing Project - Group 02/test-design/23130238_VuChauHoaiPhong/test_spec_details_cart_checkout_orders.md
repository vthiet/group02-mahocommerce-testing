# Test Specification Details: Cart, Checkout, Order & Invoice

## 1. Document Information

| Field | Value |
|---|---|
| Project | Maho Commerce Automation Testing |
| Environment | [https://demo.mahocommerce.com/default/](https://demo.mahocommerce.com/default/) |
| Module | Shopping Cart, Guest Checkout, Order Placement and Invoice |
| Automation Tool | Playwright (JavaScript) |
| Automation Spec | `tests/23130238_VuChauHoaiPhong/cart-checkout-orders.spec.js` |
| Scope | 30 Test Cases (26 functional/checkout/order cases and 4 defect cases) |
| Methodology | Equivalence Partitioning (EP), Boundary Value Analysis (BVA), state-transition, integration and end-to-end testing |
| Test execution date in workbook | 2026-11-12 |
| Test case count | 30 |

## 2. Execution Summary

**Recorded result summary:** PASSED: 20 | BLOCKED: 10.

> Status and Actual Result below are transcribed from the uploaded workbook. They describe the recorded execution dated 2026-11-12; creating this document did not re-run the Playwright tests.

## 3. Playwright Implementation Notes

- Playwright chạy với viewport 1366 × 768, locale en-US, ignoreHTTPSErrors=true; screenshot chỉ lưu khi failure và video giữ lại khi failure.
- Cart được chuẩn bị bằng helper trong support.cjs; các testcase cần trạng thái sạch sử dụng asm7xResetCart và kiểm tra kết quả trước khi tiếp tục.
- Sản phẩm kiểm thử được tham chiếu qua ASM7X_PRODUCT_ONE và ASM7X_PRODUCT_TWO; tên/SKU thực tế do cấu hình support.cjs cung cấp.
- Các testcase tạo đơn phải tuân thủ ASM7X_ALLOW_ORDER; tạo hai đơn phải tuân thủ ASM7X_ALLOW_TWO_ORDERS. Chỉ sử dụng payment test/offline khả dụng; không thực hiện thanh toán thật.
- QA credentials, QA inbox và order reference được lấy từ biến môi trường/cấu hình QA; không đưa thông tin bí mật vào tài liệu hoặc source code.
- Khi thiếu payment, inbox, order hoặc điều kiện demo cần thiết, ghi BLOCKED theo kết quả ghi nhận; không chuyển thành PASSED.

## 4. Test Specification Details

Mỗi Test Case giữ nguyên ID, mô tả, dependency, procedure, expected output, result, date và note theo workbook. Test Data bổ sung chỉ ghi các giá trị thấy rõ trong procedure hoặc source code đã cung cấp; các giá trị cấu hình động được tham chiếu qua `support.cjs`.

### 1. Cart_OpenEmpty_01 — Kiểm tra mở giỏ hàng khi chưa có sản phẩm

| Field | Specification |
|---|---|
| Test Case ID | `Cart_OpenEmpty_01` |
| Test Case Description | Kiểm tra mở giỏ hàng khi chưa có sản phẩm |
| Inter-test Case Dependence | Không |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Cart URL: cấu hình ASM7X_CART_URL; phiên trình duyệt sạch hoặc cart được reset.

**Test Steps**
1. Mở storefront trong phiên trình duyệt sạch hoặc xóa các sản phẩm đã thêm
2. Chọn biểu tượng/đường dẫn Cart

**Expected Results**
1. Trang giỏ hàng hiển thị trạng thái rỗng và hướng dẫn tiếp tục mua sắm
2. Không hiển thị tổng tiền hoặc dòng sản phẩm cũ không thuộc phiên hiện tại

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra trạng thái giỏ hàng ban đầu.

---

### 2. Cart_AddProduct_02 — Kiểm tra thêm một sản phẩm còn hàng vào giỏ

| Field | Specification |
|---|---|
| Test Case ID | `Cart_AddProduct_02` |
| Test Case Description | Kiểm tra thêm một sản phẩm còn hàng vào giỏ |
| Inter-test Case Dependence | Cart_OpenEmpty_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- ASM7X_PRODUCT_ONE; quantity = 1; sản phẩm cần còn hàng và chọn đủ biến thể bắt buộc.

**Test Steps**
1. Mở trang chi tiết sản phẩm đang hiển thị In stock
2. Chọn các tùy chọn bắt buộc nếu có
3. Nhấn Add to Cart
4. Mở mini-cart hoặc trang Cart

**Expected Results**
1. Có thông báo thêm vào giỏ thành công
2. Sản phẩm, tùy chọn và giá hiển thị đúng
3. Số lượng giỏ hàng tăng tương ứng

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Chỉ thao tác trên storefront; không truy cập admin/backend.

---

### 3. Cart_AddSameProduct_03 — Kiểm tra thêm cùng một sản phẩm vào giỏ hai lần

| Field | Specification |
|---|---|
| Test Case ID | `Cart_AddSameProduct_03` |
| Test Case Description | Kiểm tra thêm cùng một sản phẩm vào giỏ hai lần |
| Inter-test Case Dependence | Cart_AddProduct_02 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- ASM7X_PRODUCT_ONE; thêm cùng sản phẩm/biến thể hai lần; quantity kỳ vọng tối thiểu 2.

**Test Steps**
1. Thêm sản phẩm test vào giỏ
2. Quay lại sản phẩm và thêm cùng SKU/tùy chọn lần nữa
3. Mở Cart

**Expected Results**
1. Giỏ hàng phản ánh tổng số lượng đúng
2. Sản phẩm cùng SKU/tùy chọn được gộp hoặc tách dòng theo quy tắc storefront
3. Tổng tiền được tính nhất quán

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Thử cùng một biến thể để tránh nhầm với SKU khác.

---

### 4. Cart_UpdateQtyValid_04 — Kiểm tra cập nhật số lượng sản phẩm sang giá trị nguyên dương

| Field | Specification |
|---|---|
| Test Case ID | `Cart_UpdateQtyValid_04` |
| Test Case Description | Kiểm tra cập nhật số lượng sản phẩm sang giá trị nguyên dương |
| Inter-test Case Dependence | Cart_AddProduct_02 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- ASM7X_PRODUCT_ONE; quantity ban đầu 1, cập nhật thành 2.

**Test Steps**
1. Thêm một sản phẩm vào giỏ
2. Tại Cart, đổi Qty thành 2
3. Nhấn Update/Update Cart nếu có

**Expected Results**
1. Số lượng được cập nhật thành 2
2. Subtotal của dòng hàng thay đổi theo đơn giá × số lượng
3. Tổng giỏ hàng được tính lại

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Phân vùng tương đương: số lượng hợp lệ.

---

### 5. Cart_UpdateQtyZero_05 — Kiểm tra xử lý khi đặt số lượng bằng 0

| Field | Specification |
|---|---|
| Test Case ID | `Cart_UpdateQtyZero_05` |
| Test Case Description | Kiểm tra xử lý khi đặt số lượng bằng 0 |
| Inter-test Case Dependence | Cart_AddProduct_02 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- ASM7X_PRODUCT_ONE; quantity = 0.

**Test Steps**
1. Mở Cart có ít nhất một sản phẩm
2. Đổi Qty thành 0
3. Cập nhật giỏ hàng

**Expected Results**
1. Hệ thống xử lý theo quy tắc storefront: xóa dòng hàng hoặc hiển thị validation yêu cầu số lượng dương
2. Tổng tiền và số lượng hiển thị không mâu thuẫn
3. Không lưu số lượng âm hoặc trạng thái sai

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Giá trị biên của số lượng; ghi nhận hành vi cấu hình thực tế.

---

### 6. Cart_UpdateQtyInvalid_06 — Kiểm tra nhập số lượng không hợp lệ (chữ, số âm, số thập phân)

| Field | Specification |
|---|---|
| Test Case ID | `Cart_UpdateQtyInvalid_06` |
| Test Case Description | Kiểm tra nhập số lượng không hợp lệ (chữ, số âm, số thập phân) |
| Inter-test Case Dependence | Cart_AddProduct_02 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Các input lần lượt: abc, -2 và 1.5 theo source; workbook mô tả -1 ở test procedure.

**Test Steps**
1. Mở Cart có một sản phẩm
2. Thử nhập lần lượt 'abc', '-1' và '1.5' vào Qty
3. Thực hiện cập nhật sau mỗi dữ liệu

**Expected Results**
1. Dữ liệu không hợp lệ bị chặn hoặc nhận validation
2. Số lượng sau cập nhật vẫn là giá trị hợp lệ
3. Không phát sinh lỗi trang

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Bảng giá trị tương đương: dữ liệu không phải số nguyên dương.

---

### 7. Cart_RemoveItem_07 — Kiểm tra xóa một sản phẩm khỏi giỏ

| Field | Specification |
|---|---|
| Test Case ID | `Cart_RemoveItem_07` |
| Test Case Description | Kiểm tra xóa một sản phẩm khỏi giỏ |
| Inter-test Case Dependence | Cart_AddProduct_02 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- ASM7X_PRODUCT_ONE và ASM7X_PRODUCT_TWO; quantity mỗi sản phẩm = 1.

**Test Steps**
1. Thêm hai sản phẩm test vào giỏ
2. Chọn Remove/Delete trên một dòng hàng

**Expected Results**
1. Dòng hàng được xóa khỏi Cart
2. Sản phẩm còn lại không bị xóa
3. Subtotal và tổng giỏ hàng được cập nhật

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Sử dụng hai sản phẩm khác nhau để dễ nhận diện.

---

### 8. Cart_SubtotalRecalculate_08 — Kiểm tra tính lại subtotal sau khi thay đổi số lượng

| Field | Specification |
|---|---|
| Test Case ID | `Cart_SubtotalRecalculate_08` |
| Test Case Description | Kiểm tra tính lại subtotal sau khi thay đổi số lượng |
| Inter-test Case Dependence | Cart_UpdateQtyValid_04 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- ASM7X_PRODUCT_ONE; quantity đổi từ 1 lên 2; subtotal so sánh với đơn giá × 2.

**Test Steps**
1. Thêm sản phẩm có giá hiển thị rõ ràng vào Cart
2. Ghi nhận đơn giá và subtotal
3. Đổi số lượng sang một số nguyên dương khác rồi cập nhật

**Expected Results**
1. Subtotal dòng hàng bằng đơn giá × số lượng theo quy tắc làm tròn tiền tệ
2. Các tổng tiền liên quan được cập nhật nhất quán

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Dùng sản phẩm không có tùy chọn tính giá phức tạp nếu có thể.

---

### 9. Checkout_Open_09 — Kiểm tra chuyển từ giỏ hàng sang checkout

| Field | Specification |
|---|---|
| Test Case ID | `Checkout_Open_09` |
| Test Case Description | Kiểm tra chuyển từ giỏ hàng sang checkout |
| Inter-test Case Dependence | Cart_AddProduct_02 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Thêm một sản phẩm vào Cart
2. Chọn Proceed to Checkout

**Expected Results**
1. Trang checkout hiển thị đúng trạng thái giỏ hiện tại
2. Sản phẩm và số tiền không bị mất khi chuyển trang
3. Các phần thông tin giao hàng/thanh toán hiển thị theo cấu hình storefront

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Không hoàn tất đặt hàng ở testcase này.

---

### 10. Checkout_GuestFlow_10 — Kiểm tra luồng checkout đối với khách chưa đăng nhập

| Field | Specification |
|---|---|
| Test Case ID | `Checkout_GuestFlow_10` |
| Test Case Description | Kiểm tra luồng checkout đối với khách chưa đăng nhập |
| Inter-test Case Dependence | Checkout_Open_09 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Mở cửa sổ riêng tư hoặc đăng xuất
2. Thêm sản phẩm vào giỏ
3. Chọn Proceed to Checkout

**Expected Results**
1. Storefront hiển thị luồng checkout cho khách nếu được bật hoặc yêu cầu đăng nhập/tạo tài khoản nếu cấu hình bắt buộc
2. Không hiển thị lỗi 500 hoặc trang trắng
3. Giỏ hàng được giữ lại trong luồng bình thường

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kết quả phải được đối chiếu với quy tắc guest checkout hiện tại của demo.

---

### 11. Checkout_EmailValidation_11 — Kiểm tra email bắt buộc và định dạng email tại checkout

| Field | Specification |
|---|---|
| Test Case ID | `Checkout_EmailValidation_11` |
| Test Case Description | Kiểm tra email bắt buộc và định dạng email tại checkout |
| Inter-test Case Dependence | Checkout_Open_09 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Email trống và invalid-email trong source; email gốc được khôi phục sau kiểm tra.

**Test Steps**
1. Mở checkout
2. Để trống email nếu trường hiển thị bắt buộc và thử tiếp tục
3. Nhập email sai định dạng như 'qa@' rồi tiếp tục

**Expected Results**
1. Không cho tiếp tục với email thiếu/sai định dạng khi validation được áp dụng
2. Thông báo gắn với trường email dễ nhận biết
3. Không tạo đơn hàng khi dữ liệu chưa hợp lệ

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Chỉ dùng email test, không dùng dữ liệu cá nhân thật.

---

### 12. Checkout_AddressRequired_12 — Kiểm tra các trường địa chỉ giao hàng bắt buộc tại checkout

| Field | Specification |
|---|---|
| Test Case ID | `Checkout_AddressRequired_12` |
| Test Case Description | Kiểm tra các trường địa chỉ giao hàng bắt buộc tại checkout |
| Inter-test Case Dependence | Checkout_Open_09 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Mở checkout và chọn nhập địa chỉ mới
2. Bỏ trống lần lượt các trường được đánh dấu bắt buộc
3. Nhấn Continue/Place Order theo bước hiện có

**Expected Results**
1. Checkout không chuyển sang bước tiếp theo hoặc không tạo đơn khi thiếu trường bắt buộc
2. Các trường thiếu dữ liệu được đánh dấu bằng thông báo phù hợp

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Trường bắt buộc phụ thuộc quốc gia và cấu hình storefront.

---

### 13. Checkout_PhoneInvalid_13 — Kiểm tra validation số điện thoại tại checkout

| Field | Specification |
|---|---|
| Test Case ID | `Checkout_PhoneInvalid_13` |
| Test Case Description | Kiểm tra validation số điện thoại tại checkout |
| Inter-test Case Dependence | Checkout_AddressRequired_12 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Source hiện kiểm tra Telephone để trống và required validation; không nhập một chuỗi phone sai định dạng.

**Test Steps**
1. Mở form địa chỉ checkout
2. Nhập chữ hoặc chuỗi ký tự không phải số điện thoại vào Phone
3. Điền trường còn lại hợp lệ và tiếp tục

**Expected Results**
1. Nếu Phone có kiểm tra định dạng, hiển thị lỗi và không cho tiếp tục
2. Không mất dữ liệu hợp lệ đã nhập ở các trường khác

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Dùng phân vùng tương đương số điện thoại hợp lệ/không hợp lệ.

---

### 14. Checkout_PostalValid_14 — Kiểm tra checkout chấp nhận postal code đúng định dạng

| Field | Specification |
|---|---|
| Test Case ID | `Checkout_PostalValid_14` |
| Test Case Description | Kiểm tra checkout chấp nhận postal code đúng định dạng |
| Inter-test Case Dependence | Checkout_AddressRequired_12 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Postal code 90210; source cố chọn United States nếu dropdown có lựa chọn này.

**Test Steps**
1. Mở checkout
2. Chọn quốc gia và nhập postal code hợp lệ theo quốc gia
3. Điền những trường bắt buộc còn lại và tiếp tục

**Expected Results**
1. Postal code hợp lệ được chấp nhận
2. Địa chỉ giao hàng được giữ lại ở bước kế tiếp

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Chọn test data khớp với quốc gia đã chọn.

---

### 15. Checkout_PostalInvalid_15 — Kiểm tra checkout với postal code sai định dạng

| Field | Specification |
|---|---|
| Test Case ID | `Checkout_PostalInvalid_15` |
| Test Case Description | Kiểm tra checkout với postal code sai định dạng |
| Inter-test Case Dependence | Checkout_AddressRequired_12 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Postal code ABCDE; giá trị ban đầu được khôi phục sau kiểm tra.

**Test Steps**
1. Mở checkout
2. Chọn quốc gia có quy tắc postal code xác định
3. Nhập postal code sai định dạng và tiếp tục

**Expected Results**
1. Khi kiểm tra định dạng được bật, trường postal code báo lỗi và checkout không tiếp tục
2. Nếu hệ thống chỉ kiểm tra bắt buộc, ghi nhận đúng hành vi thực tế để đối chiếu yêu cầu

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Không giả định mọi quốc gia có cùng quy tắc postal code.

---

### 16. Checkout_ShippingMethod_16 — Kiểm tra lựa chọn phương thức giao hàng

| Field | Specification |
|---|---|
| Test Case ID | `Checkout_ShippingMethod_16` |
| Test Case Description | Kiểm tra lựa chọn phương thức giao hàng |
| Inter-test Case Dependence | Checkout_AddressRequired_12 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Mở checkout với địa chỉ giao hàng hợp lệ
2. Quan sát danh sách shipping methods
3. Chọn một phương thức có sẵn và tiếp tục

**Expected Results**
1. Các phương thức khả dụng được hiển thị theo địa chỉ
2. Phương thức được chọn thể hiện trạng thái đã chọn
3. Phí giao hàng và tổng tiền cập nhật đúng nếu có phí

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra trạng thái phương thức giao hàng theo địa chỉ test.

---

### 17. Checkout_PaymentMethod_17 — Kiểm tra lựa chọn phương thức thanh toán trên storefront

| Field | Specification |
|---|---|
| Test Case ID | `Checkout_PaymentMethod_17` |
| Test Case Description | Kiểm tra lựa chọn phương thức thanh toán trên storefront |
| Inter-test Case Dependence | Checkout_ShippingMethod_16 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Tiếp tục checkout đến bước Payment
2. Quan sát các phương thức được cung cấp
3. Chọn một phương thức demo/test khả dụng

**Expected Results**
1. Phương thức đã chọn được đánh dấu rõ ràng
2. Không chuyển hướng sang cổng thanh toán ngoài dự kiến
3. Không nhập thông tin thẻ hoặc dữ liệu thanh toán thật

**Recorded Actual Result**
> BLOCKED - Playwright skipped this scenario behind its environment/precondition guard; the console excerpt does not include the specific guard message.

**Execution Note**
> Chỉ chọn phương thức kiểm thử không phát sinh thanh toán thật.

---

### 18. Checkout_SubmitMissing_18 — Kiểm tra không tạo đơn khi checkout thiếu dữ liệu bắt buộc

| Field | Specification |
|---|---|
| Test Case ID | `Checkout_SubmitMissing_18` |
| Test Case Description | Kiểm tra không tạo đơn khi checkout thiếu dữ liệu bắt buộc |
| Inter-test Case Dependence | Checkout_Open_09 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Mở checkout với một sản phẩm trong giỏ
2. Để thiếu ít nhất một trường bắt buộc hoặc chưa chọn phương thức cần thiết
3. Thử tiếp tục/đặt hàng

**Expected Results**
1. Đơn hàng không được tạo
2. Checkout chỉ rõ thông tin cần bổ sung
3. Giỏ hàng vẫn giữ nguyên để người dùng sửa dữ liệu

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Không cố tình gửi request ngoài UI; dùng thao tác trên trang.

---

### 19. Order_PlaceValid_19 — Kiểm tra đặt một đơn hàng test với dữ liệu hợp lệ

| Field | Specification |
|---|---|
| Test Case ID | `Order_PlaceValid_19` |
| Test Case Description | Kiểm tra đặt một đơn hàng test với dữ liệu hợp lệ |
| Inter-test Case Dependence | Checkout_PaymentMethod_17 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Dùng tài khoản và địa chỉ test hoặc guest checkout theo cấu hình
2. Thêm sản phẩm có sẵn hàng vào Cart
3. Hoàn tất các trường checkout
4. Chọn phương thức demo không phát sinh khoản thanh toán thật
5. Xác nhận Place Order một lần

**Expected Results**
1. Trang xác nhận đơn hàng hiển thị sau khi hệ thống nhận đơn
2. Giỏ hàng được chuyển sang trạng thái đã đặt theo quy tắc storefront
3. Không xuất hiện lỗi hoặc thông báo thất bại

**Recorded Actual Result**
> BLOCKED - Playwright skipped this scenario behind its environment/precondition guard; the console excerpt does not include the specific guard message.

**Execution Note**
> Chỉ chạy trên demo được phép thử; dừng nếu chỉ có phương thức thanh toán thật.

---

### 20. Order_ReferenceDisplayed_20 — Kiểm tra mã đơn hàng hiển thị sau khi đặt hàng thành công

| Field | Specification |
|---|---|
| Test Case ID | `Order_ReferenceDisplayed_20` |
| Test Case Description | Kiểm tra mã đơn hàng hiển thị sau khi đặt hàng thành công |
| Inter-test Case Dependence | Order_PlaceValid_19 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Hoàn thành một đơn hàng test thành công
2. Ghi nhận mã/reference hiển thị ở trang xác nhận

**Expected Results**
1. Mã đơn hàng được hiển thị rõ ràng và không rỗng
2. Mã có thể được sao chép/ghi nhận để tra cứu trên giao diện tài khoản

**Recorded Actual Result**
> BLOCKED - Playwright skipped this scenario behind its environment/precondition guard; the console excerpt does not include the specific guard message.

**Execution Note**
> Phụ thuộc đơn hàng test thành công.

---

### 21. Order_NumberUnique_21 — Kiểm tra mã đơn hàng khác nhau giữa hai đơn độc lập

| Field | Specification |
|---|---|
| Test Case ID | `Order_NumberUnique_21` |
| Test Case Description | Kiểm tra mã đơn hàng khác nhau giữa hai đơn độc lập |
| Inter-test Case Dependence | Order_PlaceValid_19 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Hai order test độc lập; chỉ chạy khi ASM7X_ALLOW_TWO_ORDERS được bật.

**Test Steps**
1. Đặt một đơn hàng test thành công và ghi nhận mã A
2. Tạo giỏ hàng mới và đặt đơn test thứ hai hợp lệ
3. Ghi nhận mã B

**Expected Results**
1. Mã A và mã B khác nhau
2. Mỗi mã gắn với đúng trang xác nhận hoặc chi tiết đơn tương ứng

**Recorded Actual Result**
> BLOCKED - Playwright skipped this scenario behind its environment/precondition guard; the console excerpt does not include the specific guard message.

**Execution Note**
> Tạo hai đơn demo chỉ khi chính sách lớp học cho phép; tránh đặt nhiều đơn không cần thiết.

---

### 22. Order_DoubleSubmit_22 — Kiểm tra chống tạo đơn trùng khi nhấn Place Order nhiều lần nhanh

| Field | Specification |
|---|---|
| Test Case ID | `Order_DoubleSubmit_22` |
| Test Case Description | Kiểm tra chống tạo đơn trùng khi nhấn Place Order nhiều lần nhanh |
| Inter-test Case Dependence | Order_PlaceValid_19 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Một sản phẩm ASM7X_PRODUCT_ONE; double-click Place Order; chỉ chạy khi ASM7X_ALLOW_ORDER được bật.

**Test Steps**
1. Chuẩn bị checkout hợp lệ với dữ liệu test
2. Nhấn Place Order một lần; trong khi trang đang xử lý, thử nhấn lại nếu UI cho phép
3. Kiểm tra trang xác nhận và lịch sử đơn hàng

**Expected Results**
1. Một thao tác checkout chỉ tạo một đơn hàng
2. Nút đặt hàng được khóa hoặc hệ thống xử lý chống gửi trùng
3. Không phát sinh hai mã đơn cho cùng một lần xác nhận

**Recorded Actual Result**
> BLOCKED - Playwright skipped this scenario behind its environment/precondition guard; the console excerpt does not include the specific guard message.

**Execution Note**
> Chỉ thực hiện trên demo và kiểm tra qua UI; không dùng công cụ gửi request trực tiếp.

---

### 23. Order_ConfirmationRefresh_23 — Kiểm tra tải lại trang xác nhận không tạo thêm đơn hàng

| Field | Specification |
|---|---|
| Test Case ID | `Order_ConfirmationRefresh_23` |
| Test Case Description | Kiểm tra tải lại trang xác nhận không tạo thêm đơn hàng |
| Inter-test Case Dependence | Order_ReferenceDisplayed_20 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Sau khi đặt đơn thành công, ghi lại mã đơn
2. Tải lại trang xác nhận nếu trình duyệt cho phép
3. Kiểm tra thông báo và mã đơn hiển thị

**Expected Results**
1. Mã đơn/reference vẫn đúng hoặc storefront yêu cầu điều hướng an toàn tới trang xác nhận
2. Không tạo đơn mới chỉ vì refresh
3. Không hiển thị lỗi mất kiểm soát

**Recorded Actual Result**
> BLOCKED - Playwright skipped this scenario behind its environment/precondition guard; the console excerpt does not include the specific guard message.

**Execution Note**
> Nếu hệ thống cảnh báo gửi lại form, không xác nhận lại đơn; quan sát và dừng.

---

### 24. Order_ConfirmationEmail_24 — Kiểm tra email xác nhận đơn hàng gửi tới email test

| Field | Specification |
|---|---|
| Test Case ID | `Order_ConfirmationEmail_24` |
| Test Case Description | Kiểm tra email xác nhận đơn hàng gửi tới email test |
| Inter-test Case Dependence | Order_PlaceValid_19 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- ASM7X_QA_ORDER_NUMBER và ASM7X_QA_INBOX_URL phải được cấu hình.

**Test Steps**
1. Đặt đơn bằng địa chỉ email test có thể truy cập
2. Mở hộp thư test sau khi hoàn tất đặt hàng
3. Tìm email xác nhận tương ứng với mã đơn

**Expected Results**
1. Email xác nhận được nhận trong thời hạn hệ thống quy định
2. Email có mã đơn, thông tin cơ bản và tổng tiền khớp trang xác nhận
3. Nếu không có hộp thư test hoặc email bị tắt ở demo, đánh dấu BLOCKED thay vì kết luận FAIL

**Recorded Actual Result**
> BLOCKED - Playwright skipped this scenario behind its environment/precondition guard; the console excerpt does not include the specific guard message.

**Execution Note**
> Không thể kết luận chỉ bằng giao diện storefront nếu không có quyền truy cập hộp thư test.

---

### 25. Order_HistoryVisible_25 — Kiểm tra đơn hàng mới xuất hiện trong lịch sử mua hàng

| Field | Specification |
|---|---|
| Test Case ID | `Order_HistoryVisible_25` |
| Test Case Description | Kiểm tra đơn hàng mới xuất hiện trong lịch sử mua hàng |
| Inter-test Case Dependence | Order_ReferenceDisplayed_20 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Đặt đơn khi đã đăng nhập tài khoản test
2. Mở My Account > My Orders/Order History
3. Tìm đơn vừa đặt bằng mã đơn hoặc thông tin sản phẩm

**Expected Results**
1. Đơn mới xuất hiện trong lịch sử của đúng tài khoản
2. Mã đơn, ngày đặt và tổng tiền khớp trang xác nhận
3. Không hiển thị đơn của tài khoản khác

**Recorded Actual Result**
> BLOCKED - Playwright skipped this scenario behind its environment/precondition guard; the console excerpt does not include the specific guard message.

**Execution Note**
> Cần đăng nhập bằng cùng tài khoản đã đặt hàng.

---

### 26. Invoice_AccessFromOrder_26 — Kiểm tra xem thông tin hóa đơn từ chi tiết đơn hàng trên storefront

| Field | Specification |
|---|---|
| Test Case ID | `Invoice_AccessFromOrder_26` |
| Test Case Description | Kiểm tra xem thông tin hóa đơn từ chi tiết đơn hàng trên storefront |
| Inter-test Case Dependence | Order_HistoryVisible_25 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Sử dụng sản phẩm có sẵn hàng và dữ liệu test; không dùng phương thức thanh toán thật.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Đăng nhập tài khoản test đã có đơn hàng
2. Mở My Orders và chọn View Order cho đơn test
3. Quan sát phần invoice/document/print invoice nếu được cung cấp

**Expected Results**
1. Nếu hóa đơn đã được tạo và storefront cung cấp liên kết, trang/tệp hóa đơn mở được và thông tin đơn khớp
2. Nếu trạng thái đơn chưa có hóa đơn hoặc demo không cung cấp mục này, ghi BLOCKED/Not Applicable theo bằng chứng giao diện; không truy cập admin/backend

**Recorded Actual Result**
> BLOCKED - Playwright skipped this scenario behind its environment/precondition guard; the console excerpt does not include the specific guard message.

**Execution Note**
> Việc sinh hóa đơn phụ thuộc trạng thái đơn và cấu hình demo; kiểm tra hoàn toàn qua storefront.

---

### 27. DEF_Order_01 — Kiểm tra việc hợp nhất giỏ hàng Guest vào tài khoản sau khi đăng nhập (State Management / Integration)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Order_01` |
| Test Case Description | Kiểm tra việc hợp nhất giỏ hàng Guest vào tài khoản sau khi đăng nhập (State Management / Integration) |
| Inter-test Case Dependence | Không |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Phiên khách (guest) chưa đăng nhập.

**Test Data**
- ASM7X_PRODUCT_TWO trong guest cart; QA_EMAIL và QA_PASSWORD phải được cấu hình để đăng nhập.

**Test Steps**
1. Mở storefront trong session guest, thêm sản phẩm 'Harbour stripe tee' vào giỏ
2. Chuyển sang trang login và đăng nhập bằng tài khoản QA
3. Mở giỏ hàng kiểm tra sản phẩm

**Expected Results**
1. Sản phẩm 'Harbour stripe tee' đã thêm khi là guest phải được merge thành công vào giỏ hàng của tài khoản sau đăng nhập.

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Defect State Management: Dữ liệu giỏ hàng guest bị mất (không merge) sau khi người dùng đăng nhập.

---

### 28. DEF_Order_02 — Kiểm tra thêm sản phẩm vào giỏ với số lượng cực lớn 9999 (Boundary Value / Business Logic)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Order_02` |
| Test Case Description | Kiểm tra thêm sản phẩm vào giỏ với số lượng cực lớn 9999 (Boundary Value / Business Logic) |
| Inter-test Case Dependence | Không |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Storefront hoạt động bình thường, giỏ hàng rỗng.

**Test Data**
- ASM7X_PRODUCT_ONE; quantity cực lớn = 9999.

**Test Steps**
1. Mở trang chi tiết sản phẩm 'Bib shorts'
2. Nhập số lượng 9999 vào ô Qty
3. Nhấn Add to Cart
4. Kiểm tra phản hồi hệ thống

**Expected Results**
1. Hệ thống xử lý an toàn (thông báo vượt quá tồn kho hoặc giới hạn cho phép), không phát sinh lỗi HTTP 500, crash hoặc treo request.

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Defect Boundary Value: Nhập số lượng vượt giới hạn tồn kho để kiểm tra khả năng validation của giỏ hàng.

---

### 29. DEF_Order_03 — Kiểm tra tính lại tổng tiền khi xóa bớt sản phẩm trong giỏ có áp dụng coupon (Business Logic)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Order_03` |
| Test Case Description | Kiểm tra tính lại tổng tiền khi xóa bớt sản phẩm trong giỏ có áp dụng coupon (Business Logic) |
| Inter-test Case Dependence | Cart_OpenEmpty_01 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Đăng nhập tài khoản QA, giỏ hàng có 2 sản phẩm và đã áp mã giảm giá.

**Test Data**
- Hai sản phẩm ASM7X_PRODUCT_ONE và ASM7X_PRODUCT_TWO; coupon code TESTCOUPON2024.

**Test Steps**
1. Thêm 2 sản phẩm vào giỏ và áp dụng coupon
2. Ghi nhận tổng tiền
3. Xóa bớt 1 sản phẩm
4. Kiểm tra tổng tiền sau khi xóa

**Expected Results**
1. Tổng tiền phải được tính toán lại chính xác (giảm tương ứng với sản phẩm đã xóa và cập nhật lại mức giảm coupon).

**Recorded Actual Result**
> BLOCKED - Playwright skipped this scenario behind its environment/precondition guard; the console excerpt does not include the specific guard message.

**Execution Note**
> Defect Business Logic: Coupon vẫn tính trên tổng cũ hoặc tổng tiền không cập nhật lại sau khi xóa item.

---

### 30. DEF_Order_04 — Kiểm tra tính nhất quán giữa đơn giá trên trang chi tiết và trong giỏ hàng (Business Logic / Data Consistency)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Order_04` |
| Test Case Description | Kiểm tra tính nhất quán giữa đơn giá trên trang chi tiết và trong giỏ hàng (Business Logic / Data Consistency) |
| Inter-test Case Dependence | Cart_OpenEmpty_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Storefront hoạt động bình thường, giỏ hàng rỗng.

**Test Data**
- ASM7X_PRODUCT_ONE; đối chiếu đơn giá trên PDP với đơn giá trong Cart.

**Test Steps**
1. Mở trang chi tiết sản phẩm 'Bib shorts', ghi nhận đơn giá hiển thị
2. Thêm vào giỏ hàng
3. Mở trang /checkout/cart/ kiểm tra đơn giá sản phẩm

**Expected Results**
1. Đơn giá của sản phẩm trong giỏ hàng phải trùng khớp hoàn toàn với đơn giá hiển thị trên trang chi tiết sản phẩm.

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Defect Data Consistency: Kiểm tra chênh lệch đơn giá do lỗi làm tròn, thuế hoặc cache giá cũ giữa product page và cart.

---

## 5. Status Handling and Traceability

- `PASSED`: testcase được ghi nhận Passed trong workbook.
- `FAILED`: testcase được ghi nhận Failed; không tự đổi trạng thái dù source có assertion hoặc mô tả khác.
- `BLOCKED`: testcase chưa thể hoàn tất do thiếu điều kiện môi trường, payment, dữ liệu QA hoặc điều kiện phụ thuộc.
- `SKIPPED`: testcase được chủ động bỏ qua theo giới hạn môi trường/cấu hình; không tính là Passed.
- Dependency được giữ nguyên theo cột Inter-test case Dependence của workbook; đây là quan hệ được ghi nhận trong test data, không đồng nghĩa Playwright tự động chạy theo thứ tự phụ thuộc.
- Tên sản phẩm, tài khoản, email inbox và giá trị QA động cần được xác minh trong `support.cjs`/environment khi tái thực thi.
