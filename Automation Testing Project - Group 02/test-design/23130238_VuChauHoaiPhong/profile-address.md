# Test Design Matrix: Profile & Address Book (Maho Commerce)

**Project:** Maho Commerce Automation Testing
**Tool Target:** Playwright (JavaScript)
**Environment:** `https://demo.mahocommerce.com/default/`
**Module:** Customer Sign In, Profile Information and Address Book
**Spec:** `tests/23130238_VuChauHoaiPhong/profile-address.spec.js`
**Scope:** 29 test cases (25 functional, 4 defect)
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), state-transition and security testing

---

## 1. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Note / Automation Strategy (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Profile & Address Book** | **Authentication** | Open login page | **Profile_LoginPageOpen_01** — Mở trang đăng nhập khách hàng | Functional | Mở Sign In; xác nhận email, password, submit button và URL storefront login. |
|  |  | Guest access control | **Profile_GuestAddressRedirect_02** — Guest không truy cập Address Book | Authorization | Dùng context chưa đăng nhập; truy cập Address Book; xác nhận redirect/login prompt và không lộ địa chỉ. |
|  |  | Valid credentials | **Profile_LoginValid_03** — Đăng nhập bằng tài khoản QA hợp lệ | Authentication / Conditional | Dùng `QA_EMAIL`/`QA_PASSWORD`; xác nhận dashboard account. Không hardcode credentials. |
|  |  | Invalid password | **Profile_LoginInvalid_04** — Đăng nhập bằng mật khẩu sai | Authentication / Negative | Dùng email QA và mật khẩu sai; xác nhận lỗi đăng nhập, không vào dashboard. |
|  |  | Empty credentials | **Profile_LoginEmpty_05** — Bỏ trống email và password | Validation | Submit form rỗng; xác nhận trường bắt buộc/validation hiển thị. |
|  |  | Invalid email syntax | **Profile_LoginInvalidEmail_06** — Email sai định dạng | Validation / EP | Nhập email sai định dạng; submit; xác nhận không đăng nhập và có validation phù hợp. |
|  |  | Logout | **Profile_Logout_07** — Đăng xuất tài khoản QA | State transition / Conditional | Đăng nhập QA, chọn Sign Out; xác nhận session kết thúc và account page yêu cầu login. |
|  | **Profile** | View account information | **Profile_AccountInfoView_08** — Xem thông tin hồ sơ cá nhân | Functional / Conditional | Đăng nhập QA; mở Account Information; đối chiếu các trường profile được hiển thị. |
|  |  | Edit profile | **Profile_AccountInfoEdit_09** — Cập nhật hồ sơ hợp lệ | Functional / Conditional | Điền giá trị QA test; lưu; reload profile và xác nhận dữ liệu đã cập nhật. |
|  |  | Required profile fields | **Profile_AccountInfoRequired_10** — Validation trường hồ sơ bắt buộc | Validation / Conditional | Để trống trường bắt buộc rồi Save; xác nhận lỗi và dữ liệu không được lưu sai. |
|  | **Address Book** | Open address book | **Address_BookOpen_11** — Mở Address Book | Functional / Conditional | Đăng nhập QA; mở Address Book; xác nhận trang/danh sách địa chỉ hiển thị. |
|  |  | Add valid address | **Address_AddValid_12** — Thêm địa chỉ hợp lệ | CRUD / Conditional | Điền địa chỉ hợp lệ có token duy nhất; lưu và xác nhận card chứa địa chỉ mới. |
|  |  | Required address fields | **Address_AddRequired_13** — Validation trường địa chỉ bắt buộc | Validation / Conditional | Submit form địa chỉ với trường bắt buộc bỏ trống; xác nhận validation và địa chỉ chưa được tạo. |
|  |  | Valid phone | **Address_PhoneValid_14** — Chấp nhận số điện thoại hợp lệ | Validation / EP | Nhập số điện thoại hợp lệ vào địa chỉ; lưu và xác nhận giá trị được chấp nhận. |
|  |  | Phone contains letters | **Address_PhoneLetters_15** — Phone chứa chữ cái | Validation / EP | Nhập phone có chữ; kiểm tra form chặn, chuẩn hóa hoặc hiển thị lỗi phù hợp. |
|  |  | Phone symbols only | **Address_PhoneSymbols_16** — Phone chỉ gồm ký tự đặc biệt | Validation / EP | Nhập ký tự đặc biệt vào phone; xác nhận không được coi là phone hợp lệ. |
|  |  | Phone boundaries | **Address_PhoneBoundary_17** — Giá trị biên Phone | Validation / BVA | Kiểm tra các giá trị phone tại biên độ dài/định dạng; xác nhận đúng giới hạn UI. |
|  |  | Valid postal code | **Address_PostalValid_18** — Postal Code hợp lệ | Validation / EP | Điền postal code đúng định dạng cho country đã chọn; lưu và xác nhận được chấp nhận. |
|  |  | Invalid postal code | **Address_PostalInvalid_19** — Postal Code sai định dạng | Validation / EP | Điền postal code sai định dạng; xác nhận lỗi hoặc không cho lưu địa chỉ. |
|  |  | Postal boundaries | **Address_PostalBoundary_20** — Giá trị biên Postal Code | Validation / BVA | Thử postal code ngắn/dài tại biên; xác nhận validation theo country và UI. |
|  |  | Default shipping | **Address_DefaultShipping_21** — Đặt địa chỉ giao hàng mặc định | Functional / State transition | Chọn default shipping cho một address; mở lại danh sách và xác nhận trạng thái mặc định được giữ. |
|  |  | Default billing | **Address_DefaultBilling_22** — Đặt địa chỉ thanh toán mặc định | Functional / State transition | Chọn default billing; kiểm tra lại checkbox/badge sau khi lưu và mở lại Address Book. |
|  |  | Edit saved address | **Address_EditValid_23** — Chỉnh sửa địa chỉ đã lưu | CRUD / Conditional | Tạo/tìm address theo token; sửa trường; lưu và xác nhận card thể hiện dữ liệu mới. |
|  |  | Delete non-default address | **Address_DeleteNonDefault_24** — Xóa địa chỉ bổ sung không mặc định | CRUD / Conditional | Xóa address test không mặc định; chờ card biến mất và bảo đảm address khác còn nguyên. |
|  |  | Delete default address | **Address_DeleteDefault_25** — Xử lý xóa địa chỉ mặc định | Functional / Boundary | Thử xóa default address; xác nhận UI chặn hoặc yêu cầu thay địa chỉ mặc định an toàn. |
|  | **Defect / Security** | SQL injection payload | **DEF_Profile_01** — SQL Injection trong First Name không gây lỗi server | Security / Defect | Gửi payload kiểm thử vào First Name; xác nhận không có SQL/server error, khôi phục dữ liệu profile QA sau test. |
|  |  | Single default shipping | **DEF_Profile_02** — Chỉ 1 địa chỉ Default Shipping tồn tại cùng lúc | Defect / Data integrity | Đặt hai địa chỉ test lần lượt làm default; xác nhận chỉ một địa chỉ có default shipping. |
|  |  | XSS payload | **DEF_Profile_03** — XSS payload trong First Name không được thực thi | Security / Defect | Gửi payload vào profile test; theo dõi dialog/DOM; xác nhận script không thực thi và khôi phục dữ liệu. |
|  |  | Country/postal mismatch | **DEF_Profile_04** — Postal code US nhưng country Vietnam phải được validate | Defect / Validation | Chọn Vietnam, nhập postal code US; submit; xác nhận mismatch bị validation hoặc báo lỗi phù hợp. |

---

## 2. Playwright Automation Implementation Guidelines

1. **Account state:** Mỗi testcase đăng nhập theo nhu cầu riêng; không phụ thuộc việc testcase trước giữ session.
2. **Credentials:** `QA_EMAIL` và `QA_PASSWORD` phải được cung cấp trong environment của tiến trình chạy Playwright UI/CLI; không lưu mật khẩu vào tài liệu.
3. **Test data:** Dùng token duy nhất cho address/profile test data để nhận diện chính xác bản ghi cần sửa/xóa.
4. **Cleanup:** Khôi phục tên profile sau security tests và xóa address test nếu có thể; không xóa dữ liệu mặc định của tài khoản.
5. **Conditional outcomes:** Các test cần login phải được ghi nhận `BLOCKED` nếu thiếu credentials hoặc không đăng nhập được, không tính là pass.
