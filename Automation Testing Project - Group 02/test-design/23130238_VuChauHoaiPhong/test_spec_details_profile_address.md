# Test Specification Details: Profile & Address Book

## 1. Document Information

| Field | Value |
|---|---|
| Project | Maho Commerce Automation Testing |
| Environment | [https://demo.mahocommerce.com/default/](https://demo.mahocommerce.com/default/) |
| Module | Customer Sign In, Profile Information and Address Book |
| Automation Tool | Playwright (JavaScript) |
| Automation Spec | `tests/23130238_VuChauHoaiPhong/profile-address.spec.js` |
| Scope | 29 Test Cases (25 functional cases and 4 defect/security cases) |
| Methodology | Equivalence Partitioning (EP), Boundary Value Analysis (BVA), CRUD, state-transition, authorization and security testing |
| Test execution date in workbook | 2026-11-12 |
| Test case count | 29 |

## 2. Execution Summary

**Recorded result summary:** PASSED: 27 | FAILED: 2.

> Status and Actual Result below are transcribed from the uploaded workbook. They describe the recorded execution dated 2026-11-12; creating this document did not re-run the Playwright tests.

## 3. Playwright Implementation Notes

- Playwright chạy với viewport 1366 × 768, locale en-US, ignoreHTTPSErrors=true; screenshot và video được lưu theo cấu hình only-on-failure/retain-on-failure.
- QA_EMAIL và QA_PASSWORD được đọc từ cấu hình môi trường; không ghi credentials vào Markdown hoặc mã nguồn.
- Profile update dùng giá trị QA tạm thời và cố gắng khôi phục First Name/Last Name ban đầu trong finally block.
- Address test sử dụng token duy nhất sinh bởi asm7xToken để nhận diện bản ghi; các thao tác tạo, sửa, xóa và đặt default đi qua storefront UI.
- Các bài kiểm tra SQL injection/XSS phải quan sát lỗi server, phản chiếu nội dung và hành vi thực thi; dữ liệu profile cần được khôi phục sau test.
- Kết quả Actual Result/Status trong tài liệu được lấy từ workbook ngày 2026-11-12, không phải lần chạy mới do quá trình tạo tài liệu thực hiện.

## 4. Test Specification Details

Mỗi Test Case giữ nguyên ID, mô tả, dependency, procedure, expected output, result, date và note theo workbook. Test Data bổ sung chỉ ghi các giá trị thấy rõ trong procedure hoặc source code đã cung cấp; các giá trị cấu hình động được tham chiếu qua `support.cjs`.

### 1. Profile_LoginPageOpen_01 — Kiểm tra mở trang đăng nhập tài khoản khách hàng

| Field | Specification |
|---|---|
| Test Case ID | `Profile_LoginPageOpen_01` |
| Test Case Description | Kiểm tra mở trang đăng nhập tài khoản khách hàng |
| Inter-test Case Dependence | Không |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Mở storefront bằng trình duyệt
2. Chọn Sign In / My Account trên giao diện storefront

**Expected Results**
1. Trang đăng nhập hiển thị đầy đủ trường email, password và nút đăng nhập
2. Không xuất hiện lỗi trang hoặc nội dung từ khu vực admin

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra điều hướng trang tài khoản.

---

### 2. Profile_GuestAddressRedirect_02 — Kiểm tra khách chưa đăng nhập không truy cập được sổ địa chỉ cá nhân

| Field | Specification |
|---|---|
| Test Case ID | `Profile_GuestAddressRedirect_02` |
| Test Case Description | Kiểm tra khách chưa đăng nhập không truy cập được sổ địa chỉ cá nhân |
| Inter-test Case Dependence | Profile_LoginPageOpen_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Đăng xuất hoặc mở phiên trình duyệt riêng tư
2. Truy cập đường dẫn Address Book của storefront nếu biết từ điều hướng giao diện

**Expected Results**
1. Hệ thống chuyển tới trang đăng nhập hoặc yêu cầu xác thực
2. Không hiển thị dữ liệu địa chỉ của tài khoản khác

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra quyền truy cập trên giao diện storefront.

---

### 3. Profile_LoginValid_03 — Kiểm tra đăng nhập với tài khoản khách hàng hợp lệ

| Field | Specification |
|---|---|
| Test Case ID | `Profile_LoginValid_03` |
| Test Case Description | Kiểm tra đăng nhập với tài khoản khách hàng hợp lệ |
| Inter-test Case Dependence | Profile_LoginPageOpen_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Mở trang Sign In
2. Nhập email và mật khẩu của tài khoản test do nhóm quản lý
3. Nhấn Sign In

**Expected Results**
1. Đăng nhập thành công
2. Trang My Account hoặc trang được cấu hình sau đăng nhập hiển thị
3. Không xuất hiện thông báo sai thông tin đăng nhập

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Cần tài khoản test hợp lệ; không dùng thông tin cá nhân thật.

---

### 4. Profile_LoginInvalid_04 — Kiểm tra đăng nhập với mật khẩu không hợp lệ

| Field | Specification |
|---|---|
| Test Case ID | `Profile_LoginInvalid_04` |
| Test Case Description | Kiểm tra đăng nhập với mật khẩu không hợp lệ |
| Inter-test Case Dependence | Profile_LoginPageOpen_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Email QA nếu đã cấu hình; mật khẩu sai được tạo bằng cách thêm hậu tố -WRONG.

**Test Steps**
1. Mở trang Sign In
2. Nhập email tài khoản test và mật khẩu sai
3. Nhấn Sign In

**Expected Results**
1. Không tạo phiên đăng nhập
2. Hiển thị thông báo đăng nhập thất bại phù hợp
3. Người dùng vẫn ở luồng đăng nhập và không thấy dữ liệu tài khoản

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Phân vùng tương đương: thông tin xác thực sai.

---

### 5. Profile_LoginEmpty_05 — Kiểm tra validation khi bỏ trống email và mật khẩu

| Field | Specification |
|---|---|
| Test Case ID | `Profile_LoginEmpty_05` |
| Test Case Description | Kiểm tra validation khi bỏ trống email và mật khẩu |
| Inter-test Case Dependence | Profile_LoginPageOpen_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Mở trang Sign In
2. Để trống email và password
3. Nhấn Sign In

**Expected Results**
1. Form không được gửi thành công
2. Thông báo hoặc trạng thái required hiển thị cạnh trường bắt buộc
3. Không tạo phiên đăng nhập

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra trường bắt buộc.

---

### 6. Profile_LoginInvalidEmail_06 — Kiểm tra định dạng email không hợp lệ ở form đăng nhập

| Field | Specification |
|---|---|
| Test Case ID | `Profile_LoginInvalidEmail_06` |
| Test Case Description | Kiểm tra định dạng email không hợp lệ ở form đăng nhập |
| Inter-test Case Dependence | Profile_LoginPageOpen_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Email sai định dạng: phong@; password là dữ liệu test.

**Test Steps**
1. Mở trang Sign In
2. Nhập email sai định dạng, ví dụ 'phong@' và nhập password bất kỳ
3. Nhấn Sign In

**Expected Results**
1. Email không hợp lệ bị chặn bởi validation phía giao diện hoặc thông báo lỗi phù hợp
2. Không đăng nhập thành công

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Phân vùng tương đương: email sai định dạng.

---

### 7. Profile_Logout_07 — Kiểm tra đăng xuất khỏi tài khoản khách hàng

| Field | Specification |
|---|---|
| Test Case ID | `Profile_Logout_07` |
| Test Case Description | Kiểm tra đăng xuất khỏi tài khoản khách hàng |
| Inter-test Case Dependence | Profile_LoginValid_03 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Đăng nhập bằng tài khoản test hợp lệ
2. Mở menu tài khoản và chọn Sign Out / Log Out

**Expected Results**
1. Thông báo đăng xuất hoặc trang sau đăng xuất hiển thị
2. Truy cập lại trang account yêu cầu đăng nhập
3. Không còn hiển thị dữ liệu cá nhân trong phiên đã đăng xuất

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Chỉ kiểm tra bằng giao diện storefront.

---

### 8. Profile_AccountInfoView_08 — Kiểm tra xem thông tin hồ sơ cá nhân

| Field | Specification |
|---|---|
| Test Case ID | `Profile_AccountInfoView_08` |
| Test Case Description | Kiểm tra xem thông tin hồ sơ cá nhân |
| Inter-test Case Dependence | Profile_LoginValid_03 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Đăng nhập bằng tài khoản test
2. Mở My Account / Account Information

**Expected Results**
1. Trang hiển thị thông tin hồ sơ thuộc đúng tài khoản đang đăng nhập
2. Thông tin được trình bày đầy đủ và không bị tràn/vỡ bố cục

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra đọc thông tin cá nhân qua UI.

---

### 9. Profile_AccountInfoEdit_09 — Kiểm tra cập nhật hồ sơ với dữ liệu hợp lệ

| Field | Specification |
|---|---|
| Test Case ID | `Profile_AccountInfoEdit_09` |
| Test Case Description | Kiểm tra cập nhật hồ sơ với dữ liệu hợp lệ |
| Inter-test Case Dependence | Profile_AccountInfoView_08 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- First Name dạng QA + timestamp; Last Name dạng ASM7 + timestamp; source khôi phục giá trị cũ sau test.

**Test Steps**
1. Đăng nhập bằng tài khoản test
2. Mở Account Information
3. Thay đổi một trường tên hồ sơ bằng giá trị test hợp lệ
4. Lưu thay đổi và mở lại trang

**Expected Results**
1. Hệ thống thông báo cập nhật thành công
2. Giá trị mới được hiển thị sau khi lưu và tải lại
3. Không làm thay đổi tài khoản khác

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Khôi phục giá trị gốc sau khi hoàn tất nếu cần.

---

### 10. Profile_AccountInfoRequired_10 — Kiểm tra không cho lưu hồ sơ khi bỏ trống trường bắt buộc

| Field | Specification |
|---|---|
| Test Case ID | `Profile_AccountInfoRequired_10` |
| Test Case Description | Kiểm tra không cho lưu hồ sơ khi bỏ trống trường bắt buộc |
| Inter-test Case Dependence | Profile_AccountInfoView_08 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- First Name được để trống để kiểm tra required validation.

**Test Steps**
1. Đăng nhập và mở Account Information
2. Xóa giá trị ở một trường được đánh dấu bắt buộc
3. Nhấn Save

**Expected Results**
1. Form không lưu thành công
2. Trường thiếu dữ liệu được đánh dấu hoặc có thông báo validation
3. Dữ liệu hợp lệ đã lưu trước đó không bị thay bằng giá trị rỗng

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Chọn trường thực sự được đánh dấu required trên trang.

---

### 11. Address_BookOpen_11 — Kiểm tra mở trang Address Book và danh sách địa chỉ

| Field | Specification |
|---|---|
| Test Case ID | `Address_BookOpen_11` |
| Test Case Description | Kiểm tra mở trang Address Book và danh sách địa chỉ |
| Inter-test Case Dependence | Profile_LoginValid_03 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Đăng nhập bằng tài khoản test
2. Mở Address Book trong menu tài khoản

**Expected Results**
1. Trang Address Book hiển thị
2. Địa chỉ mặc định và các địa chỉ bổ sung (nếu có) gắn với tài khoản hiện tại
3. Có thao tác thêm hoặc chỉnh sửa địa chỉ khi tính năng được hiển thị

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Điều kiện: tài khoản storefront đã đăng nhập.

---

### 12. Address_AddValid_12 — Kiểm tra thêm địa chỉ mới với dữ liệu hợp lệ

| Field | Specification |
|---|---|
| Test Case ID | `Address_AddValid_12` |
| Test Case Description | Kiểm tra thêm địa chỉ mới với dữ liệu hợp lệ |
| Inter-test Case Dependence | Address_BookOpen_11 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Địa chỉ dựa trên ASM7X_QA; street được gắn token ADD duy nhất.

**Test Steps**
1. Mở Address Book và chọn Add New Address
2. Nhập họ tên, địa chỉ đường, thành phố, quốc gia/khu vực, postal code và điện thoại hợp lệ theo form
3. Lưu địa chỉ

**Expected Results**
1. Hiển thị thông báo lưu thành công
2. Địa chỉ mới xuất hiện trong danh sách đúng một lần
3. Các trường đã nhập hiển thị chính xác sau khi mở lại

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Dùng dữ liệu test, không dùng địa chỉ riêng của người thật.

---

### 13. Address_AddRequired_13 — Kiểm tra validation khi bỏ trống trường bắt buộc của địa chỉ

| Field | Specification |
|---|---|
| Test Case ID | `Address_AddRequired_13` |
| Test Case Description | Kiểm tra validation khi bỏ trống trường bắt buộc của địa chỉ |
| Inter-test Case Dependence | Address_BookOpen_11 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Mở form thêm địa chỉ
2. Để trống lần lượt một trường được đánh dấu bắt buộc, giữ các trường khác hợp lệ
3. Nhấn Save Address

**Expected Results**
1. Không lưu địa chỉ thiếu dữ liệu
2. Trường bắt buộc được nêu rõ bằng thông báo hoặc trạng thái validation
3. Không tạo bản ghi địa chỉ rỗng trong danh sách

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Lặp lại theo từng trường required nếu muốn kiểm tra độc lập.

---

### 14. Address_PhoneValid_14 — Kiểm tra chấp nhận số điện thoại hợp lệ theo quốc gia đã chọn

| Field | Specification |
|---|---|
| Test Case ID | `Address_PhoneValid_14` |
| Test Case Description | Kiểm tra chấp nhận số điện thoại hợp lệ theo quốc gia đã chọn |
| Inter-test Case Dependence | Address_BookOpen_11 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- ASM7X_QA.phone; street có token PHONE.

**Test Steps**
1. Mở form thêm/sửa địa chỉ
2. Chọn quốc gia cần kiểm tra
3. Nhập số điện thoại test đúng định dạng được chấp nhận
4. Lưu địa chỉ

**Expected Results**
1. Form chấp nhận giá trị điện thoại hợp lệ
2. Địa chỉ được lưu và số điện thoại được hiển thị đúng sau khi mở lại

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Phân vùng tương đương: số điện thoại hợp lệ; dùng số giả lập/test.

---

### 15. Address_PhoneLetters_15 — Kiểm tra xử lý số điện thoại chứa chữ cái

| Field | Specification |
|---|---|
| Test Case ID | `Address_PhoneLetters_15` |
| Test Case Description | Kiểm tra xử lý số điện thoại chứa chữ cái |
| Inter-test Case Dependence | Address_BookOpen_11 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Telephone = 12ABCD34.

**Test Steps**
1. Mở form thêm/sửa địa chỉ
2. Nhập chuỗi gồm chữ cái vào Phone
3. Điền các trường còn lại hợp lệ và lưu

**Expected Results**
1. Nếu trường có validation số điện thoại, dữ liệu không hợp lệ bị chặn với thông báo rõ ràng
2. Không âm thầm lưu giá trị sai định dạng

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Ghi nhận hành vi thực tế nếu storefront cho phép ký tự chữ theo chuẩn quốc gia.

---

### 16. Address_PhoneSymbols_16 — Kiểm tra xử lý số điện thoại chỉ gồm ký tự đặc biệt

| Field | Specification |
|---|---|
| Test Case ID | `Address_PhoneSymbols_16` |
| Test Case Description | Kiểm tra xử lý số điện thoại chỉ gồm ký tự đặc biệt |
| Inter-test Case Dependence | Address_BookOpen_11 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Telephone = !!!@@@.

**Test Steps**
1. Mở form thêm/sửa địa chỉ
2. Nhập chuỗi như '!!!@@@' vào Phone
3. Điền các trường còn lại hợp lệ và lưu

**Expected Results**
1. Giá trị không tạo thành số điện thoại hợp lệ bị chặn hoặc hiển thị lỗi validation
2. Không xảy ra lỗi trang hoặc lỗi JavaScript

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Phân vùng tương đương: dữ liệu điện thoại không hợp lệ.

---

### 17. Address_PhoneBoundary_17 — Kiểm tra giá trị biên độ dài số điện thoại

| Field | Specification |
|---|---|
| Test Case ID | `Address_PhoneBoundary_17` |
| Test Case Description | Kiểm tra giá trị biên độ dài số điện thoại |
| Inter-test Case Dependence | Address_BookOpen_11 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Country = United States; độ dài phone được kiểm tra tại maxlength - 1, maxlength và maxlength + 1 (mặc định maxlength 15 nếu không khai báo).

**Test Steps**
1. Mở form thêm/sửa địa chỉ
2. Thử nhập số điện thoại ngắn hơn giới hạn hiển thị/documented (nếu có)
3. Thử nhập giá trị tại giới hạn và dài hơn giới hạn một ký tự
4. Lưu từng trường hợp với các trường khác hợp lệ

**Expected Results**
1. Giá trị trong giới hạn được xử lý theo quy tắc trang
2. Giá trị vượt giới hạn bị chặn hoặc có thông báo phù hợp
3. Không cắt dữ liệu âm thầm nếu làm sai số điện thoại

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Giá trị biên: min-1, min, max, max+1; xác định giới hạn từ UI/spec trước khi chạy.

---

### 18. Address_PostalValid_18 — Kiểm tra chấp nhận postal code hợp lệ với quốc gia đã chọn

| Field | Specification |
|---|---|
| Test Case ID | `Address_PostalValid_18` |
| Test Case Description | Kiểm tra chấp nhận postal code hợp lệ với quốc gia đã chọn |
| Inter-test Case Dependence | Address_BookOpen_11 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Country = United States; Postal Code = 90210.

**Test Steps**
1. Mở form thêm/sửa địa chỉ
2. Chọn một quốc gia có quy tắc postal code xác định
3. Nhập postal code hợp lệ cho quốc gia đó
4. Lưu địa chỉ

**Expected Results**
1. Form chấp nhận postal code đúng định dạng
2. Giá trị được lưu và hiển thị chính xác

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Chọn test data theo quốc gia; không giả định mọi quốc gia dùng cùng một định dạng.

---

### 19. Address_PostalInvalid_19 — Kiểm tra postal code không hợp lệ với quốc gia đã chọn

| Field | Specification |
|---|---|
| Test Case ID | `Address_PostalInvalid_19` |
| Test Case Description | Kiểm tra postal code không hợp lệ với quốc gia đã chọn |
| Inter-test Case Dependence | Address_BookOpen_11 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Country = United States; Postal Code = ABCDE.

**Test Steps**
1. Mở form thêm/sửa địa chỉ
2. Chọn quốc gia có quy tắc postal code xác định
3. Nhập giá trị sai định dạng theo quốc gia, ví dụ ký tự không được chấp nhận
4. Lưu địa chỉ

**Expected Results**
1. Nếu storefront kiểm tra định dạng postal code, form hiển thị validation và không lưu dữ liệu sai
2. Nếu hệ thống chỉ kiểm tra trường bắt buộc, ghi nhận hành vi thực tế và đối chiếu yêu cầu nghiệp vụ

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Case phụ thuộc quy tắc địa chỉ được cấu hình cho quốc gia.

---

### 20. Address_PostalBoundary_20 — Kiểm tra giá trị biên chiều dài postal code

| Field | Specification |
|---|---|
| Test Case ID | `Address_PostalBoundary_20` |
| Test Case Description | Kiểm tra giá trị biên chiều dài postal code |
| Inter-test Case Dependence | Address_BookOpen_11 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Country = United States; kiểm tra độ dài postal code 4, 5, 9 và 10 ký tự.

**Test Steps**
1. Xác định giới hạn/định dạng postal code theo quốc gia đã chọn
2. Nhập giá trị ngắn hơn một ký tự, giá trị tại biên và dài hơn một ký tự
3. Thử lưu từng trường hợp với dữ liệu còn lại hợp lệ

**Expected Results**
1. Các giá trị hợp lệ được chấp nhận theo quy tắc quốc gia
2. Giá trị ngoài giới hạn bị chặn hoặc hiển thị lỗi phù hợp
3. Không làm hỏng bố cục form

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Giá trị biên: min-1, min, max, max+1; không áp dụng một con số chung cho mọi quốc gia.

---

### 21. Address_DefaultShipping_21 — Kiểm tra thiết lập địa chỉ mặc định giao hàng

| Field | Specification |
|---|---|
| Test Case ID | `Address_DefaultShipping_21` |
| Test Case Description | Kiểm tra thiết lập địa chỉ mặc định giao hàng |
| Inter-test Case Dependence | Address_AddValid_12 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Địa chỉ test có street token SHIP; bật Default Shipping.

**Test Steps**
1. Mở form thêm địa chỉ hoặc sửa một địa chỉ có sẵn
2. Chọn tùy chọn Use as my default shipping address nếu được cung cấp
3. Lưu và mở lại Address Book

**Expected Results**
1. Địa chỉ đã chọn được hiển thị là địa chỉ giao hàng mặc định
2. Trạng thái mặc định vẫn giữ sau khi tải lại trang

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Không cần sử dụng bước thanh toán.

---

### 22. Address_DefaultBilling_22 — Kiểm tra thiết lập địa chỉ mặc định thanh toán

| Field | Specification |
|---|---|
| Test Case ID | `Address_DefaultBilling_22` |
| Test Case Description | Kiểm tra thiết lập địa chỉ mặc định thanh toán |
| Inter-test Case Dependence | Address_AddValid_12 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Địa chỉ test có street token BILL; bật Default Billing.

**Test Steps**
1. Mở form thêm địa chỉ hoặc sửa địa chỉ có sẵn
2. Chọn tùy chọn Use as my default billing address nếu được cung cấp
3. Lưu và mở lại Address Book

**Expected Results**
1. Địa chỉ đã chọn được hiển thị là địa chỉ thanh toán mặc định
2. Không nhầm lẫn trạng thái billing với shipping

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Chỉ kiểm tra những tùy chọn thật sự hiển thị trên storefront.

---

### 23. Address_EditValid_23 — Kiểm tra sửa địa chỉ đã lưu

| Field | Specification |
|---|---|
| Test Case ID | `Address_EditValid_23` |
| Test Case Description | Kiểm tra sửa địa chỉ đã lưu |
| Inter-test Case Dependence | Address_AddValid_12 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Địa chỉ test có token EDIT; cập nhật City thành Los Angeles.

**Test Steps**
1. Mở Address Book
2. Chọn Edit tại một địa chỉ không mặc định do nhóm tạo
3. Thay đổi một trường như City hoặc Street bằng giá trị test hợp lệ
4. Lưu và mở lại danh sách

**Expected Results**
1. Thông báo cập nhật thành công
2. Địa chỉ hiển thị giá trị mới
3. Các trường không chỉnh sửa vẫn giữ nguyên

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Dùng địa chỉ test dễ nhận diện để tránh sửa dữ liệu người khác.

---

### 24. Address_DeleteNonDefault_24 — Kiểm tra xóa địa chỉ bổ sung không phải địa chỉ mặc định

| Field | Specification |
|---|---|
| Test Case ID | `Address_DeleteNonDefault_24` |
| Test Case Description | Kiểm tra xóa địa chỉ bổ sung không phải địa chỉ mặc định |
| Inter-test Case Dependence | Address_AddValid_12 |
| Recorded Status | **FAILED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Địa chỉ bổ sung có token DELETE; sau khi xác minh tồn tại thì xóa địa chỉ này.

**Test Steps**
1. Đảm bảo có địa chỉ bổ sung test không được dùng làm mặc định
2. Chọn Delete đối với địa chỉ đó
3. Xác nhận xóa nếu trang yêu cầu

**Expected Results**
1. Địa chỉ bị xóa khỏi danh sách sau khi xác nhận
2. Các địa chỉ khác vẫn còn nguyên
3. Hiển thị thông báo kết quả nếu giao diện hỗ trợ

**Recorded Actual Result**
> FAILED - DeleteAddress('59') did not remove the non-default address within the 10-second assertion timeout.

**Execution Note**
> Không xóa địa chỉ đang thuộc dữ liệu của người dùng khác.

---

### 25. Address_DeleteDefault_25 — Kiểm tra xử lý khi yêu cầu xóa địa chỉ mặc định

| Field | Specification |
|---|---|
| Test Case ID | `Address_DeleteDefault_25` |
| Test Case Description | Kiểm tra xử lý khi yêu cầu xóa địa chỉ mặc định |
| Inter-test Case Dependence | Address_DefaultShipping_21 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL https://demo.mahocommerce.com/default/; chỉ thao tác trên phần Storefront. Tài khoản test đã được tạo sẵn nếu testcase cần đăng nhập.

**Test Data**
- Địa chỉ test token DEFAULT; thiết lập Default Shipping trước khi thử thao tác xóa.

**Test Steps**
1. Mở Address Book
2. Thực hiện thao tác xóa trên địa chỉ đang là mặc định nếu UI cho phép thao tác này
3. Quan sát cảnh báo/xác nhận và trạng thái sau thao tác

**Expected Results**
1. Hệ thống không để tài khoản rơi vào trạng thái địa chỉ mặc định không hợp lệ; yêu cầu đổi địa chỉ mặc định hoặc từ chối xóa theo quy tắc storefront
2. Địa chỉ không bị xóa âm thầm mà không có xác nhận

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra chuyển trạng thái mặc định; kết quả cụ thể phải đối chiếu hành vi được cấu hình.

---

### 26. DEF_Profile_01 — Kiểm tra nhập chuỗi SQL Injection vào trường First Name (Security / Input Validation)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Profile_01` |
| Test Case Description | Kiểm tra nhập chuỗi SQL Injection vào trường First Name (Security / Input Validation) |
| Inter-test Case Dependence | Profile_LoginPageOpen_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Đăng nhập tài khoản khách hàng QA.

**Test Data**
- First Name payload: ' OR '1'='1; giá trị First Name ban đầu được khôi phục.

**Test Steps**
1. Truy cập trang chỉnh sửa thông tin cá nhân /customer/account/edit/
2. Nhập payload SQL Injection: ' OR '1'='1 vào First Name
3. Nhấn Save
4. Kiểm tra phản hồi hệ thống

**Expected Results**
1. Hệ thống xử lý an toàn, không phát sinh lỗi SQL database (SQL syntax error, 500), dữ liệu được sanitize hoặc escape đúng cách.

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Defect Security: Kiểm tra lỗ hổng SQL Injection tại chức năng cập nhật thông tin người dùng.

---

### 27. DEF_Profile_02 — Kiểm tra tính duy nhất của nhãn Default Shipping Address khi thêm nhiều địa chỉ (Business Logic)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Profile_02` |
| Test Case Description | Kiểm tra tính duy nhất của nhãn Default Shipping Address khi thêm nhiều địa chỉ (Business Logic) |
| Inter-test Case Dependence | Profile_LoginPageOpen_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Đăng nhập tài khoản QA.

**Test Data**
- Tạo hai địa chỉ test lần lượt với token DEF1 và DEF2; cả hai lần đều đặt Default Shipping.

**Test Steps**
1. Thêm địa chỉ mới thứ nhất, tích chọn Default Shipping và lưu
2. Thêm địa chỉ mới thứ hai, tích chọn Default Shipping và lưu
3. Mở Address Book kiểm tra số lượng nhãn Default Shipping

**Expected Results**
1. Chỉ có duy nhất 1 địa chỉ (địa chỉ tạo sau cùng) mang nhãn Default Shipping; địa chỉ trước đó tự động hủy nhãn mặc định.

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Defect Business Logic: Trạng thái Default Shipping bị gán đồng thời cho nhiều địa chỉ gây sai sót khi checkout.

---

### 28. DEF_Profile_03 — Kiểm tra chuỗi Stored XSS trong First Name không bị thực thi (Security / XSS)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Profile_03` |
| Test Case Description | Kiểm tra chuỗi Stored XSS trong First Name không bị thực thi (Security / XSS) |
| Inter-test Case Dependence | Profile_LoginPageOpen_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Đăng nhập tài khoản QA.

**Test Data**
- First Name payload: <img src=x onerror=alert('XSS_DEF03')>; giá trị ban đầu được khôi phục.

**Test Steps**
1. Truy cập form chỉnh sửa tài khoản
2. Nhập payload XSS: <img src=x onerror=alert('XSS_DEF03')> vào First Name
3. Lưu và kiểm tra dialog/alert có bị kích hoạt không

**Expected Results**
1. Hệ thống encode các thẻ HTML đặc biệt (<, >, "), alert không được kích hoạt, không có thẻ <img> raw chèn vào DOM.

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Defect Security: Phòng chống lỗ hổng Stored XSS trong trang quản lý hồ sơ cá nhân.

---

### 29. DEF_Profile_04 — Kiểm tra tính hợp lệ của mã bưu điện US khi chọn quốc gia là Vietnam (Business Logic / Boundary Value)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Profile_04` |
| Test Case Description | Kiểm tra tính hợp lệ của mã bưu điện US khi chọn quốc gia là Vietnam (Business Logic / Boundary Value) |
| Inter-test Case Dependence | Profile_LoginPageOpen_01 |
| Recorded Status | **FAILED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Đăng nhập tài khoản QA.

**Test Data**
- Country = Vietnam; Postal Code = 90210 (mã ZIP mẫu của Hoa Kỳ); street có token MISMATCH.

**Test Steps**
1. Mở form thêm địa chỉ mới
2. Chọn Country là Vietnam
3. Nhập Zip/Postal Code định dạng US (90210)
4. Nhấn Save Address và kiểm tra kết quả validation

**Expected Results**
1. Hệ thống hiển thị cảnh báo lỗi định dạng mã bưu điện không phù hợp với quốc gia Vietnam hoặc từ chối lưu.

**Recorded Actual Result**
> FAILED - ReferenceError: testInfo is not defined while recording the defect annotation.

**Execution Note**
> Defect Validation / Business Logic: Kiểm tra logic ràng buộc giữa quốc gia và định dạng postal code tương ứng.

---

## 5. Status Handling and Traceability

- `PASSED`: testcase được ghi nhận Passed trong workbook.
- `FAILED`: testcase được ghi nhận Failed; không tự đổi trạng thái dù source có assertion hoặc mô tả khác.
- `BLOCKED`: testcase chưa thể hoàn tất do thiếu điều kiện môi trường, payment, dữ liệu QA hoặc điều kiện phụ thuộc.
- `SKIPPED`: testcase được chủ động bỏ qua theo giới hạn môi trường/cấu hình; không tính là Passed.
- Dependency được giữ nguyên theo cột Inter-test case Dependence của workbook; đây là quan hệ được ghi nhận trong test data, không đồng nghĩa Playwright tự động chạy theo thứ tự phụ thuộc.
- Tên sản phẩm, tài khoản, email inbox và giá trị QA động cần được xác minh trong `support.cjs`/environment khi tái thực thi.
