# Test Design Document: Customer Wishlist Management (Maho Commerce)

**Project:** Maho Commerce Automation Testing  
**Tester:** Thòng Lý Tiểu Yến (MSSV: 23130397)  
**Tool Target:** Playwright Test (TypeScript)  
**Environment:** Storefront Web Demo (`https://demo.mahocommerce.com/`)  
**Module:** Customer Wishlist Management (Guest Auth Guard, Wishlist Item CRUD, Item Comment, Cart Transfer, Email Sharing, Boundary Validation, CSRF Protection)  
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), State Transition & Security Guard Checking

---

## 1. Overview & Strategy

Chức năng **Quản lý Danh sách yêu thích của khách hàng (Customer Wishlist Management)** hỗ trợ khách hàng đã đăng nhập lưu trữ, quản lý các mặt hàng quan tâm để tiện theo dõi giá, mua sắm sau này hoặc chia sẻ danh sách với bạn bè và người thân qua email. Phạm vi kiểm thử bao gồm các luồng chức năng thực tế trên nền tảng Maho Commerce:

1. **Wishlist Access & Authentication Guard:** Khách vãng lai chưa đăng nhập cố gắng truy cập Wishlist sẽ tự động bị chặn và chuyển hướng về trang Đăng nhập (`/customer/account/login/`).
2. **Wishlist Item Management (CRUD):**
   - Đăng nhập tài khoản và thêm sản phẩm vào Wishlist thành công từ trang chi tiết sản phẩm (PDP).
   - Kiểm tra hiển thị đầy đủ thông tin sản phẩm: tên sản phẩm, hình ảnh thumbnail, đơn giá, ô nhập số lượng và các nút chức năng.
   - Cập nhật số lượng sản phẩm (`Update Quantity`) trong Wishlist.
   - Thêm nhận xét / ghi chú riêng cho từng sản phẩm trong Wishlist (`Wishlist Item Comment`).
   - Xóa từng sản phẩm khỏi Wishlist có xác nhận từ hộp thoại trình duyệt (`Remove Confirmation Dialog`).
   - Hiển thị thông báo trạng thái rỗng thân thiện khi Wishlist chưa có sản phẩm (`Empty State Notice`).
3. **Commerce & Navigation Actions:**
   - Chuyển một sản phẩm đơn lẻ từ Wishlist vào Giỏ hàng (`Add to Cart Single Item`).
   - Chuyển toàn bộ sản phẩm từ Wishlist vào Giỏ hàng cùng lúc (`Add All to Cart`).
   - Điều hướng quay lại trang danh mục mua sắm (`Continue Shopping / Back Link`).
   - Truy cập Wishlist từ menu điều hướng tài khoản cá nhân (`My Account -> My Wishlist`).
4. **Wishlist Sharing Flow:**
   - Điều hướng đến giao diện chia sẻ danh sách yêu thích qua Email (`/wishlist/index/share/`).
   - Chia sẻ Wishlist thành công với danh sách nhiều email hợp lệ và nội dung lời nhắn.
   - Kiểm tra validation khi để trống danh sách email nhận chia sẻ.
   - Kiểm tra validation khi nhập email sai định dạng.
5. **Defect, Boundary & Security Testing:**
   - Kiểm tra xác thực giá trị biên của ô nhập số lượng (Qty): phát hiện lỗi thiếu thuộc tính `min="1"` tại Client-side (Defect `DEF_WIS_002`).
   - Kiểm tra giới hạn độ dài biên của trường lời nhắn chia sẻ: phát hiện lỗi thiếu thuộc tính `maxlength="500"` (Defect `DEF_WIS_003`).
   - Kiểm tra hiển thị khi có nhiều sản phẩm trong danh sách (`Multi-item Wishlist`).
   - Kiểm tra cơ chế bảo mật Form Key CSRF Token trong form thao tác Wishlist.
   - Các tính năng nâng cao mở rộng trong tương lai: Đồng bộ Wishlist đa thiết bị qua mạng xã hội (Social Sync - Skipped) và Xuất Wishlist ra tệp PDF/Excel (Export Wishlist - Skipped).

---

## 2. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Execution Strategy / Automation Note (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.0 Customer Wishlist** | **3.1 Access & Auth Guard** | Guest Auth | **[Wishlist-1]** — Truy cập Wishlist khi CHƯA đăng nhập -> Yêu cầu xác thực và chuyển hướng đến trang Login | Security / Function | Tự động chuyển đến Login và bảo vệ dữ liệu cá nhân |
| **3.0 Customer Wishlist** | **3.2 Wishlist Item CRUD** | Add Item | **[Wishlist-2]** — Đăng nhập tài khoản và thêm sản phẩm vào Danh sách yêu thích (Add to Wishlist) | Function | Chuyển tới Wishlist và thông báo đã thêm sản phẩm thành công |
| **3.0 Customer Wishlist** | **3.2 Wishlist Item CRUD** | Display Info | **[Wishlist-3]** — Kiểm tra hiển thị thông tin sản phẩm trong trang Wishlist (Tên, Ảnh, Giá) | GUI | Hiển thị đầy đủ tên sản phẩm, hình ảnh thumbnail, đơn giá |
| **3.0 Customer Wishlist** | **3.2 Wishlist Item CRUD** | Update Qty | **[Wishlist-4]** — Cập nhật số lượng sản phẩm trong Wishlist (Update Quantity) | Function | Cập nhật số lượng và tính lại tổng tiền tương ứng |
| **3.0 Customer Wishlist** | **3.2 Wishlist Item CRUD** | Item Comment | **[Wishlist-5]** — Thêm nhận xét / ghi chú cho từng sản phẩm trong Danh sách yêu thích (Wishlist Item Comment) | Function | Lưu nội dung văn bản ghi chú thành công cùng sản phẩm |
| **3.0 Customer Wishlist** | **3.3 Cart Transfer** | Single Add to Cart | **[Wishlist-6]** — Chuyển một sản phẩm đơn lẻ từ Wishlist vào Giỏ hàng (Add to Cart Single Item) | Function | Tiếp nhận lệnh chuyển mặt hàng đơn lẻ sang Shopping Cart |
| **3.0 Customer Wishlist** | **3.3 Cart Transfer** | Add All to Cart | **[Wishlist-7]** — Chuyển toàn bộ sản phẩm từ Wishlist vào Giỏ hàng cùng lúc (Add All to Cart) | Function | Chuyển toàn bộ các sản phẩm sang Shopping Cart thành công |
| **3.0 Customer Wishlist** | **3.4 Wishlist Sharing** | Share Page | **[Wishlist-8]** — Điều hướng đến trang Chia sẻ danh sách yêu thích qua Email (Share Wishlist Page Interface) | GUI | Mở trang form chia sẻ qua email với các trường nhập liệu |
| **3.0 Customer Wishlist** | **3.4 Wishlist Sharing** | Share Success | **[Wishlist-9]** — Chia sẻ Wishlist thành công với danh sách email hợp lệ và lời nhắn (Share Wishlist Success) | Function | Gửi email chia sẻ thành công và hiển thị thông báo hoàn tất |
| **3.0 Customer Wishlist** | **3.4 Wishlist Sharing** | Empty Email | **[Wishlist-10]** — Kiểm tra bắt lỗi validation khi để trống danh sách email trong form Share Wishlist | Validation | Chặn submit và hiển thị lỗi trường bắt buộc |
| **3.0 Customer Wishlist** | **3.4 Wishlist Sharing** | Invalid Email | **[Wishlist-11]** — Kiểm tra bắt lỗi validation khi nhập email sai định dạng trong form Share Wishlist | Validation | Chặn submit và hiển thị lỗi sai định dạng email |
| **3.0 Customer Wishlist** | **3.2 Wishlist Item CRUD** | Remove Item | **[Wishlist-12]** — Xóa 1 sản phẩm khỏi Danh sách yêu thích (Remove Item from Wishlist) | Function | Loại bỏ sản phẩm khỏi bảng danh sách sau khi đồng ý xác nhận |
| **3.0 Customer Wishlist** | **3.2 Wishlist Item CRUD** | Confirm Dialog | **[Wishlist-13]** — Kiểm tra hộp thoại xác nhận khi xóa sản phẩm khỏi Wishlist (Remove Confirmation Dialog) | Function / GUI | Hiển thị hộp thoại JavaScript confirm cảnh báo trước khi xóa |
| **3.0 Customer Wishlist** | **3.2 Wishlist Item CRUD** | Empty State | **[Wishlist-14]** — Kiểm tra thông báo khi Danh sách yêu thích rỗng (Empty State Notice) | GUI | Hiển thị thông báo thân thiện `You have no items in your wishlist.` |
| **3.0 Customer Wishlist** | **3.5 Navigation Flow** | Back Link | **[Wishlist-15]** — Kiểm tra liên kết quay lại trang mua sắm từ trang Wishlist (Back / Continue Shopping Link) | GUI / Navigation | Điều hướng quay trở lại trang chủ hoặc danh mục trước đó |
| **3.0 Customer Wishlist** | **3.5 Navigation Flow** | Account Nav | **[Wishlist-16]** — Truy cập Wishlist từ menu điều hướng tài khoản cá nhân (My Account -> My Wishlist) | Navigation | Nhấp menu bên trái tài khoản chuyển hướng chính xác đến Wishlist |
| **3.0 Customer Wishlist** | **3.6 Boundary & Defect** | Qty Boundary | **[Wishlist-17]** — Kiểm tra xác thực giá trị biên số lượng Qty không được phép âm hoặc bằng 0 trong Wishlist (BVA Boundary Test) | Boundary / Defect | Defect: Ô nhập Qty thiếu thuộc tính min=1 tại Client-side |
| **3.0 Customer Wishlist** | **3.6 Boundary & Defect** | Message Length | **[Wishlist-18]** — Kiểm tra giới hạn độ dài tối đa của lời nhắn chia sẻ Wishlist (Share Wishlist Message Maxlength Test) | Boundary / Defect | Defect: Textarea lời nhắn chia sẻ thiếu thuộc tính maxlength=500 |
| **3.0 Customer Wishlist** | **3.2 Wishlist Item CRUD** | Multi-item | **[Wishlist-19]** — Thêm sản phẩm thứ hai vào Wishlist và kiểm tra hiển thị nhiều mục (Multi-item Wishlist) | GUI / Data | Bảng Wishlist hiển thị đầy đủ nhiều sản phẩm cùng lúc |
| **3.0 Customer Wishlist** | **3.7 Security Check** | CSRF Token | **[Wishlist-20]** — Kiểm tra cơ chế bảo mật Form Key CSRF Token trong các thao tác của Wishlist | Security | Form chứa input ẩn form_key hợp lệ chống tấn công CSRF |
| **3.0 Customer Wishlist** | **3.8 Advanced Extensions**| Social Sync | **[Wishlist-21]** — Kiểm tra đồng bộ Danh sách yêu thích qua mạng xã hội (Social Wishlist Sync) | Function | Skipped: Chưa tích hợp API đồng bộ qua mạng xã hội |
| **3.0 Customer Wishlist** | **3.8 Advanced Extensions**| Export Sheet | **[Wishlist-22]** — Kiểm tra xuất Danh sách yêu thích ra tệp PDF / Excel (Export Wishlist Sheet) | Function | Skipped: Chưa cấu hình module xuất file PDF/Excel |

---

## 3. Playwright Automation Guidelines & Best Practices for Wishlist Management

1. **Handling Browser Confirmation Dialogs:**
   - Thao tác xóa sản phẩm khỏi Wishlist kích hoạt popup JavaScript `confirm()`. Thiết lập handler tự động xử lý dialog trước khi kích hoạt sự kiện click:
   ```ts
   page.once('dialog', async dialog => {
     expect(dialog.message()).toContain('Are you sure');
     await dialog.accept();
   });
   await page.locator('a.btn-remove').click();
   ```
2. **Form Interaction & Asynchronous Navigation:**
   - Sau khi cập nhật số lượng hoặc chuyển sản phẩm vào giỏ, chờ trang xử lý tải lại hoặc điều hướng tới Shopping Cart:
   ```ts
   await page.locator('button[title*="Add All to Cart"]').click();
   await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});
   expect(page.url()).toContain('/checkout/cart');
   ```
3. **Defect Assertions (BVA Boundary Checks):**
   - **`[Wishlist-17]` (Failed - Defect DEF_WIS_002):** Kiểm tra ô nhập số lượng sản phẩm có thuộc tính `min="1"` để chặn người dùng nhập số lượng $\le 0$ ngay tại trình duyệt. Khẳng định `expect(minAttr).toBe('1')` phát hiện lỗi khi thẻ input thiếu thuộc tính.
   - **`[Wishlist-18]` (Failed - Defect DEF_WIS_003):** Kiểm tra textarea lời nhắn chia sẻ có thuộc tính `maxlength="500"` để chặn nhập chuỗi quá dài. Khẳng định `expect(maxlength).toBe('500')` phát hiện lỗi khi thuộc tính bị bỏ sót.
