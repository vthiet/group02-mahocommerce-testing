# Test Design Document: Wishlist & Comparison (Maho Commerce)

**Project:** Maho Commerce Automation Testing  
**Tester:** Thòng Lý Tiểu Yến (MSSV: 23130397)  
**Tool Target:** Playwright Test (TypeScript)  
**Environment:** Web Demo (https://demo.mahocommerce.com/)  
**Module:** Wishlist & Product Comparison (Guest Authentication, Wishlist Item CRUD, Compare Window, Compare Table, Add All to Cart, Share Wishlist)  
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), State Transition & Multi-Window Handling

---

## 1. Overview & Strategy

Chức năng **Danh sách yêu thích & So sánh sản phẩm (Wishlist & Comparison)** hỗ trợ khách hàng lưu trữ các mặt hàng quan tâm và đối chiếu thông số kỹ thuật giữa các sản phẩm trước khi đưa ra quyết định mua sắm. Phạm vi kiểm thử bao gồm:

1. **Wishlist Access & Authentication Guard:** Khách vãng lai chưa đăng nhập cố gắng truy cập Wishlist sẽ tự động bị chặn và chuyển hướng về trang Login.
2. **Wishlist Item Management (CRUD):**
   - Đăng nhập và thêm sản phẩm vào Wishlist thành công.
   - Hiển thị đầy đủ thông tin: tên sản phẩm, ảnh đại diện, giá cả.
   - Cập nhật số lượng (Quantity) và tính toán lại bảng.
   - Xóa từng sản phẩm khỏi Wishlist có xác nhận popup.
   - Hiển thị giao diện rỗng khi không còn sản phẩm.
3. **Product Comparison Flow:**
   - Thêm sản phẩm thứ nhất và thứ hai vào danh sách so sánh từ Catalog/PDP.
   - Kiểm tra chống thêm trùng lặp sản phẩm đã có trong danh sách.
   - Mở cửa sổ/popup so sánh chi tiết (`Compare Window`).
   - Kiểm tra cấu trúc bảng đối chiếu thông số sản phẩm (Specs Matrix).
   - Xóa 1 sản phẩm hoặc xóa toàn bộ danh sách (`Clear All Compare`).
4. **Wishlist Commerce Actions:**
   - Chuyển toàn bộ sản phẩm từ Wishlist vào Giỏ hàng (`Add All to Cart`).
   - Chia sẻ danh sách yêu thích qua Email (`Share Wishlist`).
   - Ghi chú nhận xét riêng cho từng mặt hàng trong Wishlist.
   - Liên kết quay lại mua sắm (`Continue Shopping`).
5. **Defect & Boundary Testing:**
   - Kiểm tra giới hạn trần số lượng sản phẩm so sánh (phát hiện lỗi tràn giao diện ngang).
   - Kiểm tra tính năng in ấn bảng đối chiếu so sánh sản phẩm (phát hiện thiếu nút Print).

---

## 2. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Execution Strategy / Automation Note (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.0 Wishlist & Comparison** | **3.1 Wishlist Management** | Guest Auth | Truy cập Wishlist khi CHƯA đăng nhập -> Yêu cầu xác thực và chuyển sang Login | Function | Tự động chuyển đến Login và yêu cầu đăng nhập |
| **3.0 Wishlist & Comparison** | **3.1 Wishlist Management** | Logged-in Add | Đăng nhập tài khoản và thêm sản phẩm vào Danh sách yêu thích (Wishlist) | Function | Chuyển tới Wishlist và thông báo thành công |
| **3.0 Wishlist & Comparison** | **3.1 Wishlist Management** | Display Info | Kiểm tra hiển thị thông tin sản phẩm trong trang Wishlist (Tên, Ảnh, Giá) | GUI | Hiển thị đầy đủ tên, hình ảnh, đơn giá |
| **3.0 Wishlist & Comparison** | **3.1 Wishlist Management** | Update Qty | Kiểm tra cập nhật số lượng sản phẩm trong Wishlist | Function | Cập nhật số lượng và tính lại tổng tiền |
| **3.0 Wishlist & Comparison** | **3.1 Wishlist Management** | Remove Item | Xóa 1 sản phẩm khỏi Danh sách yêu thích (Wishlist) | Function | Loại bỏ sản phẩm khỏi bảng danh sách |
| **3.0 Wishlist & Comparison** | **3.1 Wishlist Management** | Empty State | Kiểm tra thông báo khi Wishlist rỗng | GUI | Hiển thị thông báo You have no items in wishlist |
| **3.0 Wishlist & Comparison** | **3.2 Product Comparison** | Add Item 1 | Thêm sản phẩm thứ nhất vào danh sách so sánh (Add to Compare) | Function | Hiển thị thông báo và cập nhật sidebar Compare |
| **3.0 Wishlist & Comparison** | **3.2 Product Comparison** | Add Item 2 | Thêm sản phẩm thứ hai vào danh sách so sánh | Function | Cập nhật hiển thị cả 2 sản phẩm |
| **3.0 Wishlist & Comparison** | **3.2 Product Comparison** | Duplicate Check | Thêm sản phẩm đã có sẵn vào danh sách so sánh (Tránh trùng lặp) | Function | Tránh trùng lặp sản phẩm trong danh sách |
| **3.0 Wishlist & Comparison** | **3.2 Product Comparison** | Compare Window | Mở giao diện So sánh sản phẩm chi tiết (Compare Window/Page) | GUI | Mở popup/trang bảng so sánh chi tiết |
| **3.0 Wishlist & Comparison** | **3.2 Product Comparison** | Specs Table | Kiểm tra bảng đối chiếu thông số sản phẩm trong trang so sánh | GUI | Bảng đối chiếu thông số rõ ràng, đầy đủ |
| **3.0 Wishlist & Comparison** | **3.2 Product Comparison** | Remove Item | Xóa 1 sản phẩm khỏi Danh sách so sánh | Function | Giảm số lượng sản phẩm và cập nhật giao diện |
| **3.0 Wishlist & Comparison** | **3.2 Product Comparison** | Clear All | Xóa toàn bộ sản phẩm khỏi Danh sách so sánh (Clear All Compare) | Function | Làm trống danh sách so sánh |
| **3.0 Wishlist & Comparison** | **3.2 Product Comparison** | Empty State | Kiểm tra thông báo khi danh sách so sánh rỗng | GUI | Hiển thị thông báo You have no items to compare |
| **3.0 Wishlist & Comparison** | **3.3 Wishlist Actions** | Add All to Cart | Kiểm tra chức năng chuyển toàn bộ sản phẩm từ Wishlist vào Giỏ hàng | Function | Chuyển toàn bộ SP vào Shopping Cart |
| **3.0 Wishlist & Comparison** | **3.3 Wishlist Actions** | Share Wishlist | Kiểm tra chức năng chia sẻ Danh sách yêu thích qua Email (Share Wishlist) | Function | Mở trang form chia sẻ qua email |
| **3.0 Wishlist & Comparison** | **3.4 Compare Defect** | Max Limit | Kiểm tra giới hạn số lượng sản phẩm tối đa trong Danh sách so sánh | Function | Defect: Không giới hạn trần gây tràn ngang bảng đối chiếu |
| **3.0 Wishlist & Comparison** | **3.4 Compare Defect** | Print Action | Kiểm tra chức năng in ấn bảng đối chiếu so sánh sản phẩm (Print this page) | GUI | Defect: Giao diện so sánh thiếu nút in ấn bảng đối chiếu |
| **3.0 Wishlist & Comparison** | **3.5 Extra Interactions** | Item Comment | Kiểm tra thêm nhận xét / ghi chú cho từng sản phẩm trong Wishlist | Function | Lưu ghi chú cùng sản phẩm trong Wishlist |
| **3.0 Wishlist & Comparison** | **3.5 Extra Interactions** | Continue Shopping | Kiểm tra liên kết quay lại trang mua sắm từ trang Wishlist | GUI | Điều hướng về danh mục/trang chủ |
| **3.0 Wishlist & Comparison** | **3.6 Advanced Sync** | Social Sync | Kiểm tra đồng bộ Danh sách yêu thích nhiều thiết bị qua Social Account | Function | Skipped: Chưa tích hợp API social sync |
| **3.0 Wishlist & Comparison** | **3.6 Advanced Sync** | Export Compare | Kiểm tra xuất Danh sách so sánh ra tệp PDF / Excel | Function | Skipped: Chưa cấu hình module xuất file PDF/Excel |

---

## 3. Playwright Automation Guidelines & Best Practices for Wishlist & Comparison

1. **Handling Browser Confirmation Dialogs:**
   - Các thao tác xóa sản phẩm khỏi Wishlist hoặc xóa toàn bộ danh sách so sánh (`Clear All`) kích hoạt popup JavaScript `confirm()`. Thiết lập handler tự động chấp nhận dialog trước khi click:
   ```ts
   page.once('dialog', async dialog => {
     expect(dialog.message()).toContain('Are you sure');
     await dialog.accept();
   });
   await page.locator('a.btn-remove').click();
   ```
2. **Popup Window & Multi-Page Context Handling:**
   - Nút Compare trên sidebar thường mở cửa sổ popup mới qua JavaScript `popWin()`. Sử dụng `context.waitForEvent('page')` để bắt và chuyển đổi ngữ cảnh điều khiển:
   ```ts
   const [comparePopup] = await Promise.all([
     context.waitForEvent('page'),
     page.locator('button.btn-compare').click(),
   ]);
   await comparePopup.waitForLoadState('domcontentloaded');
   await expect(comparePopup.locator('#product_comparison')).toBeVisible();
   ```
3. **Defect Assertions:**
   - `WISH_COMP_17`: Khẳng định giao diện bị lỗi hiển thị khi thêm quá nhiều sản phẩm so sánh mà không có giới hạn trần (Test case Failed - Defect).
   - `WISH_COMP_18`: Khẳng định sự thiếu vắng của nút in ấn (`window.print`) trên giao diện so sánh chi tiết.
