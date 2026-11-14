# Test Design Document: Product Reviews & Ratings (Maho Commerce)

**Project:** Maho Commerce Automation Testing  
**Tester:** Thòng Lý Tiểu Yến (MSSV: 23130397)  
**Tool Target:** Playwright Test (TypeScript)  
**Environment:** Storefront Web Demo (`https://demo.mahocommerce.com/`)  
**Module:** Product Reviews & Ratings (Review Modal, Star Ratings, Form Validation, Boundaries, Anti-XSS, Anti-Spam, Customer Moderation)  
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Input Sanitization & Security Testing

---

## 1. Overview & Strategy

Chức năng **Đánh giá & Nhận xét sản phẩm (Product Reviews & Ratings)** cung cấp giải pháp tiếp nhận phản hồi từ khách hàng về chất lượng, giá cả và giá trị sản phẩm ngoài Storefront. Phạm vi kiểm thử bao gồm:

1. **Review Form & Modal Interaction:** Mở form đánh giá từ trang chi tiết sản phẩm (PDP) thông qua dialog/modal, kiểm tra hiển thị và đóng form an toàn bằng nút Cancel.
2. **Rating Criteria Matrix:** Lựa chọn độc lập hoặc đồng thời thang điểm từ 1 đến 5 sao cho từng tiêu chí: *Quality*, *Price*, *Value*.
3. **Form Submission & Validation:** Gửi bài đánh giá hợp lệ với đầy đủ sao, biệt danh (Nickname), tóm tắt (Summary) và nội dung chi tiết. Kiểm tra validation bắt buộc khi thiếu sao, thiếu nội dung hoặc bỏ trống toàn bộ form.
4. **Data Boundaries & Special Characters:**
   - Kiểm tra nội dung nhận xét đạt độ dài tối thiểu và giới hạn tối đa trường tóm tắt (Max Length BVA).
   - Kiểm tra hỗ trợ tiếng Việt có dấu (Unicode UTF-8) và ký tự đặc biệt.
5. **Security & Anti-Spam Defenses:**
   - Kiểm tra cơ chế mã hóa/escape ký tự HTML/JavaScript chống tấn công XSS (Cross-Site Scripting).
   - Kiểm tra cơ chế chống gửi nhận xét trùng lặp liên tục (Spam Review / Double Submit Protection).
6. **Customer Integration:** Tự động điền Nickname khi khách hàng đã đăng nhập tài khoản thực hiện đánh giá.
7. **Advanced Enhancements:** Tải ảnh đính kèm và huy hiệu Verified Buyer (Skipped).

---

## 2. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Execution Strategy / Automation Note (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.0 Product Reviews & Ratings** | **2.1 View Form** | Display | **[ProductReview-1]** — Điều hướng đến trang chi tiết sản phẩm và mở form đánh giá | GUI | Form `#review-form` hiển thị đầy đủ trong modal dialog/tab |
| **2.0 Product Reviews & Ratings** | **2.2 Rating Options** | Display | **[ProductReview-2]** — Kiểm tra hiển thị các mức đánh giá sao (1 đến 5 sao) | GUI | Hiển thị đầy đủ thang điểm sao trên bảng chọn |
| **2.0 Product Reviews & Ratings** | **2.2 Rating Options** | Scale | **[ProductReview-3]** — Kiểm tra chọn các mức sao khác nhau (1 sao, 3 sao, 5 sao) | Function | Cập nhật chính xác radio button được chọn |
| **2.0 Product Reviews & Ratings** | **2.3 Submit Review** | Success | **[ProductReview-4]** — Gửi đánh giá hợp lệ với đầy đủ thông tin (Sao, Nickname, Summary, Nội dung) | Function | Ghi nhận thành công bài đánh giá chờ kiểm duyệt |
| **2.0 Product Reviews & Ratings** | **2.3 Submit Review** | Validation | **[ProductReview-5]** — Kiểm tra cảnh báo khi không chọn số sao nào mà nhấn gửi đánh giá | Function | Báo lỗi `Please select one of each rating` |
| **2.0 Product Reviews & Ratings** | **2.3 Submit Review** | Validation | **[ProductReview-6]** — Kiểm tra xác thực (Validation) khi bỏ trống trường nội dung nhận xét | Function | Báo lỗi bắt buộc nhập trường review text |
| **2.0 Product Reviews & Ratings** | **2.3 Submit Review** | Validation | **[ProductReview-7]** — Kiểm tra xác thực khi bỏ trống toàn bộ form đánh giá | Function | Hiển thị đồng loạt lỗi validation trên các trường bắt buộc |
| **2.0 Product Reviews & Ratings** | **2.3 Submit Review** | Boundary | **[ProductReview-8]** — Kiểm tra độ dài tối thiểu của nội dung nhận xét (Boundary test) | Boundary / BVA | Xử lý văn bản cực ngắn hoặc kiểm tra ngưỡng giới hạn ký tự |
| **2.0 Product Reviews & Ratings** | **2.3 Submit Review** | Unicode | **[ProductReview-9]** — Kiểm tra nhập nội dung nhận xét chứa ký tự đặc biệt và tiếng Việt có dấu | Security | Hệ thống hỗ trợ trọn vẹn bộ mã UTF-8 tiếng Việt |
| **2.0 Product Reviews & Ratings** | **2.4 Form Actions** | Interaction | **[ProductReview-10]** — Kiểm tra chức năng đóng Form/Dialog đánh giá bằng nút Cancel | GUI | Dialog đóng an toàn và trở về trang chi tiết sản phẩm |
| **2.0 Product Reviews & Ratings** | **2.5 Reviews List** | Display | **[ProductReview-11]** — Kiểm tra hiển thị khu vực danh sách bài đánh giá (Customer Reviews) | GUI | Hiển thị danh sách đánh giá của khách hàng trên PDP |
| **2.0 Product Reviews & Ratings** | **2.5 Reviews List** | Moderation | **[ProductReview-12]** — Kiểm tra thông báo kiểm duyệt nhận xét sau khi gửi (Moderation Notice) | Function | Thông báo `Your review has been accepted for moderation.` |
| **2.0 Product Reviews & Ratings** | **2.6 Form Validation** | Validation | **[ProductReview-13]** — Kiểm tra xác thực (Validation) khi để trống trường Biệt danh (Nickname) | Function | Báo lỗi bắt buộc nhập trường Nickname |
| **2.0 Product Reviews & Ratings** | **2.6 Form Validation** | Validation | **[ProductReview-14]** — Kiểm tra xác thực (Validation) khi để trống trường Tóm tắt (Summary) | Function | Báo lỗi bắt buộc nhập trường Summary |
| **2.0 Product Reviews & Ratings** | **2.6 Form Validation** | Boundary | **[ProductReview-15]** — Kiểm tra giới hạn độ dài tối đa của trường Tóm tắt (Max Length Test) | Boundary / BVA | Giới hạn độ dài ô input Summary tối đa 255 ký tự |
| **2.0 Product Reviews & Ratings** | **2.6 Form Validation** | XSS Security | **[ProductReview-16]** — Kiểm tra chống tấn công XSS trong nội dung bài nhận xét | Security | Escape an toàn mã script độc hại trong nội dung |
| **2.0 Product Reviews & Ratings** | **2.7 Rate Limit & UI** | Spam Protection | **[ProductReview-17]** — Kiểm tra cơ chế chống gửi nhận xét trùng lặp liên tục (Double Submit) | Function | Defect: Nút submit không disabled sau khi bấm (thiếu debounce) |
| **2.0 Product Reviews & Ratings** | **2.7 Rate Limit & UI** | Character Count | **[ProductReview-18]** — Kiểm tra hiển thị bộ đếm số lượng ký tự thời gian thực (Character Counter) | GUI | Defect: Form đánh giá thiếu bộ đếm ký tự countdown |
| **2.0 Product Reviews & Ratings** | **2.7 Rate Limit & UI** | Multi Criteria | **[ProductReview-19]** — Kiểm tra đánh giá độc lập từng tiêu chí (Price, Value, Quality) | Function | Các nhóm radio button hoạt động hoàn toàn độc lập |
| **2.0 Product Reviews & Ratings** | **2.7 Rate Limit & UI** | Auto-fill | **[ProductReview-20]** — Kiểm tra tự động điền Nickname từ tài khoản đã đăng nhập | Function | Tự động điền Nickname người dùng đã đăng nhập |
| **2.0 Product Reviews & Ratings** | **2.8 Advanced Features** | Image Upload | **[ProductReview-21]** — Kiểm tra tính năng tải lên hình ảnh đính kèm trong bài đánh giá | Function | Skipped: Chưa kích hoạt module upload ảnh review |
| **2.0 Product Reviews & Ratings** | **2.8 Advanced Features** | Verified Badge | **[ProductReview-22]** — Kiểm tra hiển thị huy hiệu Người mua hàng đã xác thực (Verified Buyer) | GUI | Skipped: Cần cấu hình module mở rộng của bên thứ ba |

---

## 3. Playwright Automation Guidelines & Best Practices for Reviews & Ratings

1. **Reliable Dialog Opening Strategy:**
   - Trang sản phẩm có thanh sticky banner có thể che khuất nút mở review dialog. Sử dụng hàm helper `openReviewForm(page)` kích hoạt trực tiếp modal qua `page.evaluate()` đảm bảo form `#review-form` hiển thị ổn định:
   ```ts
   await page.evaluate(() => {
     const dialog = document.getElementById('review-dialog') as HTMLDialogElement | null;
     if (dialog && !dialog.open && typeof dialog.showModal === 'function') {
       dialog.showModal();
     }
     dialog?.setAttribute('open', '');
   });
   ```
2. **Rating Radio Button Locators:**
   - Thang điểm sao sử dụng bảng radio matrix. Lựa chọn chính xác theo ID phần tử: `#Quality_1`, `#Price_3`, `#Value_5` kèm click tùy chọn `{ force: true }` nếu có overlay trong suốt.
3. **XSS Security Assertion:**
   - Nhập payload `<script>window.__xss_flag=true;</script>` vào nội dung nhận xét. Assert kiểm tra giá trị `window.__xss_flag` là `undefined` và thẻ script hiển thị dưới dạng chuỗi văn bản đã được escape an toàn.
4. **Defect Tracking:**
   - **`[ProductReview-17]` (Failed):** Hệ thống thiếu cơ chế debounce / chặn double submit liên tiếp trên form Storefront.
   - **`[ProductReview-18]` (Failed):** Hệ thống chưa tích hợp bộ đếm ký tự thời gian thực (Character Counter) trên ô textarea.
