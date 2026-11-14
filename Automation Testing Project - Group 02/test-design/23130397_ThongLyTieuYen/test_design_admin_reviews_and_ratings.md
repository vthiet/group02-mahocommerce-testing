# Test Design Document: Admin Reviews & Ratings Management (Maho Commerce)

**Project:** Maho Commerce Automation Testing  
**Tester:** Thòng Lý Tiểu Yến (MSSV: 23130397)  
**Tool Target:** Playwright Test (TypeScript)  
**Environment:** Admin Panel (`https://demo.mahocommerce.com/admin/` hoặc môi trường local `maho/`)  
**Module:** Admin Reviews & Ratings Management (All Reviews Grid, Pending Moderation Queue, Single Review Moderation/Edit, Rating Attributes Management, State Transition, Anti-Stored XSS, CSRF Token Protection)  
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Decision Table, State Transition & Security Testing

---

## 1. Overview & Strategy

Phân hệ **Quản lý Đánh giá & Xếp hạng bên phía Admin (Admin Reviews & Ratings Management)** đóng vai trò trọng yếu trong việc kiểm duyệt chất lượng nội dung đánh giá từ khách hàng, duy trì tính trung thực của phản hồi và cấu hình các tiêu chí xếp hạng sản phẩm trên toàn bộ hệ thống E-Commerce Maho Commerce. Phạm vi kiểm thử chi tiết bao gồm:

1. **All Reviews Grid Interface & Controls:**
   - Truy cập bảng lưới quản lý tất cả bài đánh giá (`Catalog > Reviews and Ratings > Customer Reviews > All Reviews`).
   - Kiểm tra hiển thị đầy đủ các cột dữ liệu: ID, Created At, Status, Title, Nickname, Review text, Type (Customer/Guest/Admin), Product Name, SKU, Action.
   - Lọc dữ liệu theo Trạng thái (Approved, Pending, Not Approved), Loại người tạo (Customer, Guest), và khôi phục bộ lọc qua [Reset Filter].
   - Tìm kiếm theo từ khóa tiêu đề (Title/Summary) và xử lý an toàn trạng thái không tìm thấy bản ghi (Empty State).
   - Sắp xếp tăng dần/giảm dần theo ID, Ngày tạo và phân trang linh hoạt (20, 50, 100 bản ghi/trang).

2. **Pending Reviews Moderation Queue:**
   - Truy cập hàng đợi duyệt nhanh (`Catalog > Reviews and Ratings > Customer Reviews > Pending Reviews`).
   - Xác thực hàng đợi chỉ chứa các bài đánh giá đang ở trạng thái `Pending` được gửi từ Storefront.

3. **Mass Actions Operations:**
   - Phê duyệt hàng loạt nhiều đánh giá cùng lúc (`Change Status > Approved`).
   - Từ chối phê duyệt hàng loạt nhiều đánh giá cùng lúc (`Change Status > Not Approved`).
   - Xóa hàng loạt nhiều đánh giá có hiển thị hộp thoại xác nhận bảo mật JavaScript `confirm()`.

4. **Single Review Moderation & Form Validation:**
   - Mở màn hình chi tiết/chỉnh sửa đánh giá (`Edit Review`).
   - Phê duyệt đánh giá đơn lẻ và điều chỉnh số sao các tiêu chí đánh giá (*Quality*, *Price*, *Value*).
   - Từ chối đánh giá đơn lẻ chuyển trạng thái sang `Not Approved`.
   - Bắt lỗi xác thực dữ liệu bắt buộc (Mandatory Fields Validation) khi xóa trống Summary hoặc nội dung Review.
   - Phân tích giá trị biên (BVA) độ dài tối đa trường Summary (255 ký tự hợp lệ và 256 ký tự vượt ngưỡng).

5. **Security & State Transition Defenses:**
   - Cơ chế bảo mật chống tấn công Stored XSS trong trang quản trị: Dữ liệu chứa mã script độc hại từ khách hàng phải được escape an toàn khi hiển thị trong form Admin.
   - Cơ chế bảo vệ Form Key CSRF Token chống tấn công Cross-Site Request Forgery khi thực hiện lưu dữ liệu.
   - Kiểm thử chuyển đổi trạng thái vòng đời đánh giá (State Transition E2E): `Pending` (ẩn trên Storefront PDP) $\rightarrow$ `Approved` (hiển thị trên Storefront PDP và cập nhật điểm rating trung bình) $\rightarrow$ `Not Approved` (ẩn ngay lập tức khỏi Storefront PDP).

6. **Rating Attributes Management & Enhancements:**
   - Quản lý tiêu chí đánh giá (`Manage Ratings`): Xem danh sách, cấu hình hiển thị tiêu chí trên Store View và thứ tự sắp xếp (*Position*).
   - Ghi nhận lỗi thiếu nhật ký kiểm duyệt (*Review Audit Log / Moderation History* - Defect).
   - Kiểm tra tính năng tự động gửi email thông báo duyệt bài đánh giá cho khách hàng (Skipped).
   - Kiểm tra tính năng xuất danh sách đánh giá ra tệp Excel/CSV (Skipped).

---

## 2. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Execution Strategy / Automation Note (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.0 Admin Reviews & Ratings** | **1.1 All Reviews Grid** | Displaying | **[AdminReview-1]** — Kiểm tra truy cập trang All Reviews Grid với quyền Quản trị viên (Admin) | GUI | Đăng nhập Admin, điều hướng menu `Catalog > Reviews and Ratings > All Reviews`; kiểm tra bảng và tiêu đề cột. |
| **1.0 Admin Reviews & Ratings** | **1.1 All Reviews Grid** | Filter Status | **[AdminReview-2]** — Kiểm tra lọc danh sách đánh giá theo Trạng thái (Pending, Approved, Not Approved) | Function | Chọn Status = Pending; nhấp Filter; xác nhận mọi dòng hiển thị đều có Status là Pending. |
| **1.0 Admin Reviews & Ratings** | **1.1 All Reviews Grid** | Filter Type | **[AdminReview-3]** — Kiểm tra lọc danh sách đánh giá theo Loại người tạo (Customer, Guest) và Reset Filter | Function | Chọn Type = Customer; nhấp Filter; sau đó nhấp [Reset Filter] và xác nhận khôi phục bảng gốc. |
| **1.0 Admin Reviews & Ratings** | **1.1 All Reviews Grid** | Search Title | **[AdminReview-4]** — Kiểm tra tìm kiếm đánh giá theo Từ khóa tiêu đề (Title/Summary) và Nickname | Function | Nhập từ khóa tiêu đề vào filter; nhấp Search; xác nhận danh sách trả về đúng các bản ghi khớp từ khóa. |
| **1.0 Admin Reviews & Ratings** | **1.1 All Reviews Grid** | Empty State | **[AdminReview-5]** — Kiểm tra tìm kiếm đánh giá với từ khóa không tồn tại (Empty State Verification) | Function / Negative | Nhập từ khóa ngẫu nhiên không tồn tại; xác nhận thông báo rỗng an toàn, không gây crash giao diện. |
| **1.0 Admin Reviews & Ratings** | **1.1 All Reviews Grid** | Sorting | **[AdminReview-6]** — Kiểm tra sắp xếp danh sách đánh giá theo ID và Ngày tạo (Sorting Asc/Desc) | Function | Nhấp tiêu đề cột ID; xác nhận đổi chiều tăng dần; nhấp lại xác nhận đổi chiều giảm dần. |
| **1.0 Admin Reviews & Ratings** | **1.1 All Reviews Grid** | Pagination | **[AdminReview-7]** — Kiểm tra phân trang và thay đổi số lượng bản ghi hiển thị (Page Size: 20/50/100) | Function | Chọn View = 50; chuyển sang Page 2; xác nhận bảng hiển thị đúng trang và số lượng dòng tương ứng. |
| **1.0 Admin Reviews & Ratings** | **1.2 Pending Reviews Queue** | Displaying | **[AdminReview-8]** — Kiểm tra truy cập danh sách đánh giá chờ duyệt (Pending Reviews Moderation Queue) | GUI / Function | Vào `Catalog > Reviews and Ratings > Pending Reviews`; xác nhận tất cả bản ghi đều ở trạng thái Pending. |
| **1.0 Admin Reviews & Ratings** | **1.3 Mass Actions** | Mass Approve | **[AdminReview-9]** — Thao tác hàng loạt (Mass Action) - Phê duyệt nhiều đánh giá cùng lúc (Mass Approve) | Function / State Transition | Tick chọn 2 đánh giá Pending; chọn Mass Action Change Status -> Approved; kiểm tra thông báo thành công. |
| **1.0 Admin Reviews & Ratings** | **1.3 Mass Actions** | Mass Reject | **[AdminReview-10]** — Thao tác hàng loạt (Mass Action) - Từ chối phê duyệt nhiều đánh giá cùng lúc (Mass Reject) | Function / State Transition | Tick chọn 2 bản ghi; chọn Change Status -> Not Approved; kiểm tra cập nhật trạng thái Not Approved. |
| **1.0 Admin Reviews & Ratings** | **1.3 Mass Actions** | Mass Delete | **[AdminReview-11]** — Thao tác hàng loạt (Mass Action) - Xóa nhiều đánh giá cùng lúc có xác nhận (Mass Delete) | Function | Tick chọn 2 bản ghi thử nghiệm; chọn Delete; chấp nhận dialog confirm; xác nhận bản ghi bị xóa khỏi grid. |
| **1.0 Admin Reviews & Ratings** | **1.4 Edit & Moderation Detail** | Displaying | **[AdminReview-12]** — Điều hướng đến trang chi tiết/chỉnh sửa đánh giá (Edit Review Page Interface) | GUI | Nhấp [Edit] một bài đánh giá; xác nhận form `#review_edit_form` hiển thị đầy đủ thông tin sản phẩm và tác giả. |
| **1.0 Admin Reviews & Ratings** | **1.4 Edit & Moderation Detail** | Approve & Rate | **[AdminReview-13]** — Phê duyệt đánh giá đơn lẻ và điều chỉnh số sao các tiêu chí (Quality, Price, Value) | Function / State Transition | Tại Edit form, chọn Status = Approved; đổi số sao Quality lên 5 sao; nhấp [Save Review]; xác nhận lưu thành công. |
| **1.0 Admin Reviews & Ratings** | **1.4 Edit & Moderation Detail** | Reject Single | **[AdminReview-14]** — Từ chối phê duyệt một đánh giá đơn lẻ (Reject Single Review - Not Approved) | Function / State Transition | Tại Edit form, chọn Status = Not Approved; nhấp [Save Review]; xác nhận trạng thái lưu mới là Not Approved. |
| **1.0 Admin Reviews & Ratings** | **1.4 Edit & Moderation Detail** | Field Validation | **[AdminReview-15]** — Kiểm tra xác thực (Validation) bỏ trống các trường bắt buộc khi chỉnh sửa đánh giá | Field Validation | Xóa trống Title và Review textarea; nhấp [Save Review]; xác nhận xuất hiện lỗi validation yêu cầu nhập. |
| **1.0 Admin Reviews & Ratings** | **1.4 Edit & Moderation Detail** | Boundary BVA | **[AdminReview-16]** — Kiểm tra giá trị biên độ dài tối đa của trường Tiêu đề đánh giá (Summary BVA Test) | Boundary / BVA | Nhập chuỗi 255 ký tự (Max) và 256 ký tự (Max+1); phát hiện lỗi thiếu thuộc tính maxlength gây SQL truncation. |
| **1.0 Admin Reviews & Ratings** | **1.5 Security & Integrity** | Stored XSS | **[AdminReview-17]** — Kiểm tra bảo mật chống tấn công Stored XSS trong trang quản trị Admin Review | Security | Mở bài đánh giá có payload `<script>`; xác nhận dữ liệu được escape dạng text, script không thực thi. |
| **1.0 Admin Reviews & Ratings** | **1.5 Security & Integrity** | CSRF Form Key | **[AdminReview-18]** — Kiểm tra cơ chế bảo mật Form Key CSRF Token khi thao tác lưu đánh giá | Security | Kiểm tra input ẩn `form_key`; thử nghiệm xóa hoặc làm sai token; xác nhận hệ thống từ chối cập nhật dữ liệu. |
| **1.0 Admin Reviews & Ratings** | **1.6 State Transition & E2E** | Sync Storefront | **[AdminReview-19]** — Kiểm tra chuyển trạng thái vòng đời đánh giá và đồng bộ hiển thị Storefront PDP | State Transition / E2E | Duyệt bài review ở Admin -> kiểm tra hiển thị trên PDP Storefront; đổi sang Not Approved -> kiểm tra bị ẩn tức thì. |
| **1.0 Admin Reviews & Ratings** | **1.7 Export & Reporting** | Export Grid | **[AdminReview-20]** — Kiểm tra tính năng Xuất danh sách đánh giá ra tệp tin Excel/CSV (Export Reviews Grid) | Function | Bỏ qua (Skipped) do tính năng Export danh sách đánh giá yêu cầu cấu hình thêm module mở rộng trên Admin Panel. |
| **1.0 Admin Reviews & Ratings** | **1.8 Defect & Enhancement** | Audit Log Defect | **[AdminReview-21]** — Kiểm tra hiển thị nhật ký kiểm duyệt đánh giá (Review Audit Log / Moderation History) | GUI / Function | Phát hiện lỗi: Giao diện Admin Review thiếu bảng Audit Log ghi nhận tài khoản Admin và mốc thời gian đã duyệt. |
| **1.0 Admin Reviews & Ratings** | **1.8 Defect & Enhancement** | Email Notification | **[AdminReview-22]** — Kiểm tra tính năng tự động gửi email thông báo cho khách khi bài đánh giá được phê duyệt | Function | Bỏ qua (Skipped) do tính năng gửi email thông báo duyệt bài đánh giá yêu cầu tích hợp SMTP Gateway bên thứ ba. |

---

## 3. Playwright Automation Guidelines & Best Practices for Admin Reviews & Ratings

1. **Admin Authentication & Session Reusability:**
   - Thực hiện đăng nhập Admin một lần thông qua `storageState` hoặc đăng nhập trước trong `beforeAll()` để tối ưu hóa thời gian thực thi:
   ```ts
   await page.goto('/admin/');
   await page.locator('#username').fill(process.env.ADMIN_USER || 'admin');
   await page.locator('#login').fill(process.env.ADMIN_PASS || 'admin123');
   await page.locator('button.btn-login, input[type="submit"]').click();
   await page.waitForURL('**/admin/dashboard/**');
   ```
2. **Handling Mass Actions in Maho Admin Grids:**
   - Dropdown Mass Action của Magento/Maho kích hoạt dynamically. Cần chọn hành động trong select `#reviewGrid_massaction-select`, sau đó chờ select con `#visibility` hoặc `#status` xuất hiện trước khi nhấn Submit:
   ```ts
   await page.locator('#reviewGrid_massaction-select').selectOption({ label: 'Change Status' });
   await page.locator('#status').waitFor({ state: 'visible' });
   await page.locator('#status').selectOption({ label: 'Approved' });
   await page.locator('button:has-text("Submit")').click();
   ```
3. **Handling Confirmation Popup on Deletion:**
   - Khi xóa bài đánh giá đơn lẻ hoặc xóa hàng loạt, hệ thống kích hoạt hộp thoại `window.confirm`. Lắng nghe sự kiện trước khi click:
   ```ts
   page.once('dialog', async dialog => {
     expect(dialog.message()).toContain('Are you sure');
     await dialog.accept();
   });
   await page.locator('button:has-text("Delete Review")').click();
   ```
4. **Stored XSS Prevention Assertion:**
   - Đảm bảo thẻ script độc hại không kích hoạt trong ngữ cảnh Admin bằng cách kiểm tra:
   ```ts
   const xssExecuted = await page.evaluate(() => (window as any).__admin_xss);
   expect(xssExecuted).toBeUndefined();
   ```
5. **Defect Tracking:**
   - **`[AdminReview-16]` (Failed):** Ô input Summary trong Admin Edit Review thiếu thuộc tính `maxlength="255"`, cho phép nhập chuỗi quá 255 ký tự dẫn đến lỗi Data truncated / 500 error từ database.
   - **`[AdminReview-21]` (Failed):** Giao diện quản trị Admin Review mặc định thiếu khu vực Audit Log / Moderation History ghi nhận lịch sử tài khoản Admin thực hiện phê duyệt/chỉnh sửa đánh giá.

