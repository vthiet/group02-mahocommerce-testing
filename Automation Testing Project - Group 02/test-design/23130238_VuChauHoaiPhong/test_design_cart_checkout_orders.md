# Test Design Matrix: Cart, Checkout, Order & Invoice (Maho Commerce)

**Project:** Maho Commerce Automation Testing
**Tool Target:** Playwright (JavaScript)
**Environment:** `https://demo.mahocommerce.com/default/`
**Module:** Shopping Cart, Guest Checkout, Order Placement and Invoice
**Spec:** `tests/23130238_VuChauHoaiPhong/cart-checkout-orders.spec.js`
**Scope:** 30 test cases (26 functional, 4 defect)
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), state-transition and end-to-end testing

---

## 1. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Note / Automation Strategy (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cart, Checkout, Order & Invoice** | **Cart** | Empty state | **Cart_OpenEmpty_01** — Mở giỏ hàng khi chưa có sản phẩm | Functional | Mở URL Cart trong context mới; xác nhận thông báo giỏ rỗng và không có dòng sản phẩm. |
|  |  | Add in-stock product | **Cart_AddProduct_02** — Thêm một sản phẩm còn hàng vào giỏ | E2E | Reset cart của context; tìm sản phẩm còn hàng, chọn biến thể, đợi request Add to Cart hoàn tất; xác nhận sản phẩm và quantity = 1. |
|  |  | Add same product twice | **Cart_AddSameProduct_03** — Thêm cùng sản phẩm hai lần | Functional | Tạo cart sạch; thêm cùng SKU hai lần; xác nhận dòng sản phẩm còn một và quantity được cộng đúng. |
|  |  | Valid quantity update | **Cart_UpdateQtyValid_04** — Cập nhật số lượng sang 2 | Functional | Thêm sản phẩm, đổi quantity thành 2, cập nhật cart; kiểm tra quantity và subtotal. |
|  |  | Zero quantity | **Cart_UpdateQtyZero_05** — Xử lý quantity bằng 0 | Boundary | Đặt quantity = 0 và cập nhật; xác nhận hệ thống xử lý theo UI (loại sản phẩm hoặc validation), không tạo quantity không hợp lệ. |
|  |  | Invalid quantity | **Cart_UpdateQtyInvalid_06** — Nhập chữ, số âm và số thập phân | Validation / EP | Thử lần lượt chữ, số âm và số thập phân; kiểm tra input validation hoặc giá trị được chuẩn hóa, không ghi quantity sai. |
|  |  | Remove one item | **Cart_RemoveItem_07** — Xóa một sản phẩm khỏi giỏ | Functional | Thêm hai sản phẩm; xóa một dòng; chờ dòng đó biến mất và xác nhận sản phẩm còn lại vẫn có trong cart. |
|  |  | Recalculate subtotal | **Cart_SubtotalRecalculate_08** — Tính lại subtotal sau thay đổi quantity | Functional | Thay đổi quantity của sản phẩm; cập nhật cart và so sánh subtotal mới với đơn giá × quantity. |
|  | **Checkout** | Open checkout | **Checkout_Open_09** — Chuyển từ Cart sang Checkout | Functional | Chuẩn bị cart có sản phẩm; chọn Proceed to Checkout; xác nhận trang/step Checkout hiển thị. |
|  |  | Guest flow | **Checkout_GuestFlow_10** — Checkout với khách chưa đăng nhập | E2E / Conditional | Dùng context guest, thêm hàng và mở checkout; xác nhận guest được tiếp tục hoặc được yêu cầu đăng nhập theo UI hiện tại. |
|  |  | Email validation | **Checkout_EmailValidation_11** — Email bắt buộc và định dạng | Validation / EP | Thử email trống và email sai định dạng; submit; xác nhận validation, không tiếp tục tạo đơn. |
|  |  | Required address | **Checkout_AddressRequired_12** — Các trường địa chỉ giao hàng bắt buộc | Validation | Bỏ trống các trường địa chỉ bắt buộc; submit; xác nhận thông báo validation và checkout chưa tiến bước. |
|  |  | Invalid phone | **Checkout_PhoneInvalid_13** — Telephone checkout không hợp lệ | Validation / EP | Thử telephone không hợp lệ; xác nhận client/server validation và không chấp nhận dữ liệu sai. |
|  |  | Valid postal code | **Checkout_PostalValid_14** — Postal Code hợp lệ | Functional | Điền postal code hợp lệ cùng thông tin checkout; xác nhận giá trị được chấp nhận. |
|  |  | Invalid postal code | **Checkout_PostalInvalid_15** — Postal Code sai định dạng | Validation / EP | Nhập postal code sai định dạng; xác nhận validation hoặc không cho hoàn tất địa chỉ. |
|  |  | Shipping method | **Checkout_ShippingMethod_16** — Chọn phương thức giao hàng | Functional / Conditional | Chờ shipping methods tải; chọn phương thức khả dụng; xác nhận lựa chọn được giữ trong checkout. |
|  |  | Payment method | **Checkout_PaymentMethod_17** — Chọn phương thức thanh toán test | Conditional | Kiểm tra danh sách payment method trên demo; chỉ xác nhận lựa chọn test/offline khi phương thức đó khả dụng. |
|  |  | Missing required data | **Checkout_SubmitMissing_18** — Không tạo đơn khi thiếu dữ liệu bắt buộc | Validation | Submit checkout khi thiếu dữ liệu; xác nhận lỗi validation và không phát sinh đơn hàng. |
|  | **Order** | Place valid test order | **Order_PlaceValid_19** — Đặt đơn hàng test bằng payment offline | E2E / Guarded | Chỉ chạy khi payment test/offline khả dụng và `ALLOW_DEMO_ORDER_CREATION=true`; xác nhận order thành công trên storefront. |
|  |  | Display order reference | **Order_ReferenceDisplayed_20** — Mã đơn hiển thị sau khi đặt hàng | E2E / Guarded | Dùng đơn test được phép tạo; kiểm tra confirmation page có order reference. |
|  |  | Unique order number | **Order_NumberUnique_21** — Mã đơn khác nhau giữa hai đơn | E2E / Guarded | Chỉ chạy khi `ALLOW_TWO_DEMO_ORDERS=true`; tạo hai đơn test và so sánh order number. |
|  |  | Prevent double submit | **Order_DoubleSubmit_22** — Chống tạo đơn trùng khi nhấn nhanh | E2E / Guarded | Trên checkout test được phép, submit nhanh hai lần; kiểm tra chỉ có một order được tạo. |
|  |  | Refresh confirmation | **Order_ConfirmationRefresh_23** — Tải lại trang xác nhận | E2E / Guarded | Tạo/chuẩn bị order test; reload confirmation page; xác nhận nội dung/order reference vẫn đúng hoặc UI xử lý an toàn. |
|  |  | Confirmation email | **Order_ConfirmationEmail_24** — Email xác nhận đơn hàng | Integration / Guarded | Đối chiếu order test với QA inbox được cấu hình; không suy luận email đã gửi chỉ từ confirmation page. |
|  |  | Order history | **Order_HistoryVisible_25** — Đơn mới xuất hiện trong lịch sử | E2E / Guarded | Đăng nhập QA account và tìm order test trong My Orders; cần tài khoản/đơn phù hợp. |
|  | **Invoice** | Open invoice | **Invoice_AccessFromOrder_26** — Mở hóa đơn từ chi tiết đơn | E2E / Guarded | Mở order test qua storefront; chọn Invoice; xác nhận invoice page hoặc download chỉ khi link có sẵn. |
|  | **Defect / Integration** | Guest cart merge | **DEF_Order_01** — Giỏ hàng guest được merge khi đăng nhập tài khoản | Defect / E2E | Thêm hàng trong guest context, đăng nhập QA, mở cart; kiểm tra item guest còn trong cart sau đăng nhập. |
|  |  | Extreme quantity | **DEF_Order_02** — Số lượng cực lớn (9999) không gây lỗi server 500 | Defect / BVA | Gửi quantity = 9999; kiểm tra response Add to Cart và storefront không trả lỗi 500; ghi nhận stock/quantity được xử lý. |
|  |  | Coupon state after removal | **DEF_Order_03** — Coupon state nhất quán sau khi xóa sản phẩm khỏi giỏ | Defect / State transition | Áp dụng coupon nếu field/mã khả dụng; xóa item; xác nhận coupon, discount và totals đồng bộ. |
|  |  | Cart/PDP price consistency | **DEF_Order_04** — Giá sản phẩm trong giỏ phải khớp giá trang chi tiết | Defect / Data consistency | Đọc giá trên PDP và cart của cùng sản phẩm/biến thể; so sánh sau khi add vào giỏ. |

---

## 2. Playwright Automation Implementation Guidelines

1. **Cart state:** Mỗi testcase tự chuẩn bị cart trong browser context riêng; không dùng trạng thái của testcase trước.
2. **Add to Cart:** Chờ response `/checkout/cart/add` hoàn tất trước khi mở Cart, sau đó xác nhận sản phẩm thực sự xuất hiện.
3. **Order safety:** Không tạo đơn thật trên demo. Các testcase đặt đơn phải tôn trọng guard `ALLOW_DEMO_ORDER_CREATION` và `ALLOW_TWO_DEMO_ORDERS`.
4. **Credentials:** Lấy tài khoản QA từ `QA_EMAIL` và `QA_PASSWORD`; không ghi credentials vào source hoặc tài liệu.
5. **Conditional outcomes:** Payment, coupon, email, order/invoice chỉ được đánh giá khi điều kiện demo tương ứng có sẵn; ghi `BLOCKED` thay vì đổi thành `PASSED` khi thiếu điều kiện.
