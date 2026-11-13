# Test Design Document: Authentication & 2FA (Maho Commerce)

**Project:** Maho Commerce Automation Testing  
**Tester:** Thòng Lý Tiểu Yến (MSSV: 23130397)  
**Tool Target:** Playwright Test (TypeScript)  
**Environment:** Web Demo (https://demo.mahocommerce.com/)  
**Module:** Authentication & Security (Login, Validation, Forgot Password, Security & CSRF, Session, Brute Force, SQLi, 2FA)  
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Security Testing & Defect Analysis

---

## 1. Overview & Strategy

Chức năng **Đăng nhập & Xác thực bảo mật (Authentication & 2FA)** trên hệ thống Maho Commerce đóng vai trò kiểm soát truy cập và bảo vệ dữ liệu người dùng. Phạm vi kiểm thử bao gồm các luồng chính:

1. **Authentication & Validation:** Đăng nhập thành công với tài khoản hợp lệ, từ chối khi nhập sai mật khẩu hoặc tài khoản chưa đăng ký. Kiểm tra validation khi để trống các trường hoặc sai cú pháp email.
2. **Account Recovery (Forgot Password):** Gửi email khôi phục mật khẩu và kiểm tra validation form quên mật khẩu.
3. **Security Defenses & Integrity:**
   - Bảo mật Form Key CSRF Token chống tấn công Cross-Site Request Forgery.
   - Che giấu mật khẩu (type="password").
   - Chống tấn công SQL Injection trên form xác thực.
   - Kiểm tra chính sách giới hạn số lần đăng nhập sai (Account Lockout / Rate Limiting chống Brute Force).
4. **Session Management:** Cơ chế hủy session an toàn khi đăng xuất, vô hiệu hóa nút Back và ngăn chặn truy cập lịch sử.
5. **Two-Factor Authentication (2FA):** Cơ chế xác thực hai yếu tố qua ứng dụng Authenticator (TOTP) và tin nhắn SMS (ghi nhận trạng thái Skipped trên môi trường Demo).

**Chiến lược phân hoạch tương đương (Equivalence Partitioning) & Giá trị biên (BVA):**
- Mật khẩu: Phân chia lớp mật khẩu chuẩn, mật khẩu sai, mật khẩu chứa khoảng trắng đầu/cuối (trimming), và kiểm tra độ phức tạp.
- Email: Lớp email hợp lệ, email sai định dạng, email chữ in hoa (Case-insensitivity).
- Mỗi lớp tương đương đại diện bằng một test case tự động hóa duy nhất để tối ưu thời gian thực thi của test runner.

---

## 2. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Execution Strategy / Automation Note (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.0 Authentication & 2FA** | **1.1 Login & Authentication** | Success | Kiểm tra đăng nhập thành công với tài khoản và mật khẩu hợp lệ | Function | Tài khoản customer@example.com |
| **1.0 Authentication & 2FA** | **1.1 Login & Authentication** | Not success | Kiểm tra đăng nhập thất bại khi nhập sai mật khẩu | Function | Cảnh báo Invalid login or password |
| **1.0 Authentication & 2FA** | **1.1 Login & Authentication** |  | Kiểm tra đăng nhập thất bại khi nhập Email chưa từng đăng ký | Function | Hệ thống từ chối đăng nhập |
| **1.0 Authentication & 2FA** | **1.1 Login & Authentication** | Validation | Kiểm tra xác thực form khi bỏ trống cả Email và Mật khẩu | Function | Báo lỗi This is a required field |
| **1.0 Authentication & 2FA** | **1.1 Login & Authentication** |  | Kiểm tra xác thực form khi chỉ nhập Email và để trống Mật khẩu | Function | Báo lỗi bắt buộc nhập Password |
| **1.0 Authentication & 2FA** | **1.1 Login & Authentication** |  | Kiểm tra xác thực form khi chỉ nhập Mật khẩu và để trống Email | Function | Báo lỗi bắt buộc nhập Email |
| **1.0 Authentication & 2FA** | **1.1 Login & Authentication** |  | Kiểm tra xác thực định dạng Email không hợp lệ (sai cú pháp) | Function | Cảnh báo Please enter a valid email address |
| **1.0 Authentication & 2FA** | **1.1 Login & Authentication** | GUI Option | Kiểm tra trạng thái và tương tác với tùy chọn "Remember Me" | GUI | Cho phép check/uncheck bình thường |
| **1.0 Authentication & 2FA** | **1.2 Forgot Password** | Reset | Kiểm tra chức năng Khôi phục/Quên mật khẩu với email hợp lệ | Function | Gửi liên kết khôi phục tới email |
| **1.0 Authentication & 2FA** | **1.2 Forgot Password** | Validation | Kiểm tra xác thực form Quên mật khẩu khi để trống Email | Function | Hiển thị cảnh báo bắt buộc nhập |
| **1.0 Authentication & 2FA** | **1.2 Forgot Password** |  | Kiểm tra xác thực form Quên mật khẩu khi nhập Email sai định dạng | Function | Cảnh báo định dạng email không hợp lệ |
| **1.0 Authentication & 2FA** | **1.3 Security & CSRF** | Security | Kiểm tra cơ chế bảo mật Form Key CSRF Token chống giả mạo | Security | Token CSRF ngẫu nhiên trong thẻ input |
| **1.0 Authentication & 2FA** | **1.3 Security & CSRF** | Security | Kiểm tra cơ chế che giấu ký tự mật khẩu (type="password") | Security | Mật khẩu hiển thị dạng ký tự chấm tròn |
| **1.0 Authentication & 2FA** | **1.4 Logout & Session** | Session | Kiểm tra chức năng Đăng xuất an toàn (Safe Log Out) khỏi hệ thống | Security | Hủy cookie session đăng nhập |
| **1.0 Authentication & 2FA** | **1.4 Logout & Session** | Session | Kiểm tra cơ chế hủy phiên và bảo mật lịch sử sau khi đăng xuất | Security | Chặn nút Back và chuyển hướng trang Login |
| **1.0 Authentication & 2FA** | **1.5 Boundary & Security** | Boundary | Kiểm tra mật khẩu có khoảng trắng thừa ở đầu/cuối (Trimming) | Security | Bảo mật không trim mật khẩu |
| **1.0 Authentication & 2FA** | **1.5 Boundary & Security** | Brute Force | Kiểm tra chính sách khóa tài khoản khi nhập sai liên tiếp (Account Lockout) | Security | Defect: Maho Demo thiếu rate limit chống Brute Force |
| **1.0 Authentication & 2FA** | **1.5 Boundary & Security** | Password Policy | Kiểm tra hiển thị hướng dẫn chính sách mật khẩu (Password Complexity Hint) | GUI | Defect: Thiếu nhãn hướng dẫn mật khẩu tối thiểu |
| **1.0 Authentication & 2FA** | **1.5 Boundary & Security** | Case Sensitivity | Kiểm tra đăng nhập thành công khi nhập Email chứa ký tự in hoa | Function | Chuẩn hóa email không phân biệt chữ hoa/thường |
| **1.0 Authentication & 2FA** | **1.5 Boundary & Security** | SQL Injection | Kiểm tra bảo mật form đăng nhập chống tấn công SQL Injection | Security | Prepared Statements sanitize an toàn |
| **1.0 Authentication & 2FA** | **1.6 Two-Factor Auth** | 2FA TOTP | Kiểm tra xác thực hai yếu tố qua ứng dụng Authenticator (2FA TOTP) | Security | Skipped: Chưa bật module 2FA TOTP |
| **1.0 Authentication & 2FA** | **1.6 Two-Factor Auth** | 2FA SMS | Kiểm tra xác thực hai yếu tố gửi mã OTP qua tin nhắn SMS | Security | Skipped: Cần cổng SMS Gateway và thiết bị |

---

## 3. Playwright Automation Guidelines & Best Practices for Authentication

1. **Session & Cookie Isolation:**
   - Mỗi test case được khởi chạy trong context sạch với `context.clearCookies()` trong hook `test.beforeEach` để ngăn ngừa session tồn dư giữa các ca kiểm thử.
2. **Form Key CSRF Verification:**
   - Tương tác trực tiếp với input ẩn `input[name="form_key"]`, xác thực giá trị chuỗi ngẫu nhiên được sinh ra bởi Maho Commerce core trước khi submit form.
3. **Form Validation Assertion:**
   - Lắng nghe các phần tử thông báo lỗi động của Prototype.js: `.validation-advice`, `#advice-required-entry-email`, `#advice-required-entry-pass` với timeout tường minh.
4. **Security & Session Invalidation:**
   - Sau khi thực hiện Logout, điều hướng ngược lại bằng `page.goBack()` hoặc truy cập trực tiếp URL trang bảo vệ `/customer/account` để khẳng định hệ thống tự động redirect về trang Login.
5. **Defect Tracking:**
   - Ca kiểm thử `AUTH_2FA_17` (Khóa tài khoản chống Brute Force) và `AUTH_2FA_18` (Gợi ý chính sách mật khẩu) được thiết kế để phát hiện và bắt lỗi thực tế của hệ thống Maho Commerce Demo (Failed - Defect).
