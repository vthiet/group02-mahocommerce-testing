# Test Design Document: Sales Analytics & Reports (Maho Commerce)

**Project:** Maho Commerce Automation Testing  
**Tester:** Nguyễn Hoài Thương (MSSV: 23130327)  
**Tool Target:** Playwright Test (JavaScript)  
**Environment:** Web Demo (https://demo.mahocommerce.com/)  
**Module:** Sales Analytics & Reports (Periodic Sales, Date Range Filter BVA, Bestsellers, CSV/Excel Export, Performance SLA)  
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Stress & Security Testing

---

## 1. Overview & Strategy

Phân hệ **Báo cáo Thống kê Doanh thu (Sales Analytics & Reports)** cung cấp giải pháp theo dõi và phân tích hiệu quả kinh doanh của hệ thống Maho Commerce trong Admin Panel. Phạm vi kiểm thử bao gồm:

1. **Truy cập & Phân quyền (Access & ACL):** Truy cập trang Báo cáo Doanh thu bằng tài khoản Super Admin (có CSRF Secret Key), kiểm tra cơ chế kiểm soát quyền (ACL) khi tài khoản Staff không có thẩm quyền.
2. **Bố cục & Hiển thị mặc định:** Xác minh hiển thị đầy đủ các thành phần điều khiển (dropdown chu kỳ, ô chọn ngày From/To, nút Show Report, Export).
3. **Biểu đồ theo chu kỳ thời gian:** Kiểm tra kết xuất biểu đồ và bảng dữ liệu theo chu kỳ Ngày (Day), Tháng (Month), Năm (Year); chuyển đổi Metric giữa Amounts và Orders.
4. **Kiểm thử giá trị biên ngày tháng (Date Range BVA):**
   - Biên tối thiểu: 1 ngày duy nhất ($From = To$).
   - Cận biên dưới: 2 ngày liên tiếp.
   - Mốc chuẩn danh định: 1 tháng (30 ngày).
   - Biên tối đa: 365 ngày tròn và vượt biên > 365 ngày.
   - Biên không hợp lệ: Từ ngày sau Đến ngày ($From > To$) và ngày tương lai.
   - Biên năm nhuận (29/02) và khoảng thời gian doanh thu bằng 0đ (0 đơn).
5. **Thống kê sản phẩm bán chạy (Bestsellers):** Kiểm tra danh sách Bestsellers, widget Top 5 Dashboard, phân trang và xử lý đồng hạng số lượng bán.
6. **Trích xuất báo cáo (Export CSV & Excel):** Xuất định dạng Excel (.xml/.xlsx) và CSV (.csv); kiểm tra xuất 0 dòng, 1 dòng, 10.000 dòng, cơ chế UTF-8 và chống spam click nút Export.
7. **Hiệu năng & SLA:** Đo lường thời gian tải Dashboard và Báo cáo lớn đáp ứng cam kết SLA $\le$ 3–5 giây.

---

## 2. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Execution Strategy / Automation Note (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Báo cáo Thống kê Doanh thu (Sales Analytics & Reports)** | 1.1 Truy cập & Phân quyền | Phân quyền truy cập | Kiểm tra truy cập trang Báo cáo Doanh thu với quyền Administrator | Roles & Permission | Happy path |
| **** |  | Bảo mật & ACL | Kiểm tra phân quyền truy cập (ACL) khi tài khoản không có quyền xem báo cáo | Roles & Permission | Security Edge case |
| **** | 1.2 Bố cục & Giao diện | Bố cục thành phần | Kiểm tra bố cục, vị trí và hiển thị đầy đủ các thành phần trang Báo cáo | GUI | Đầy đủ Period, Date, Buttons |
| **** |  | Trạng thái mặc định | Kiểm tra trạng thái hiển thị mặc định khi mới vào trang Báo cáo | GUI | Mặc định Period = Day |
| **** | 1.3 Biểu đồ doanh thu theo thời gian | Chu kỳ Ngày (Day) | Kiểm tra biểu đồ doanh thu theo chu kỳ Ngày (Period = Day) | Function | Lọc 7 ngày |
| **** |  | Chu kỳ Tháng (Month) | Kiểm tra biểu đồ doanh thu theo chu kỳ Tháng (Period = Month) | Function | Lọc 6 tháng |
| **** |  | Chu kỳ Năm (Year) | Kiểm tra biểu đồ doanh thu theo chu kỳ Năm (Period = Year) | Function | Lọc 3 năm |
| **** |  | Chuyển đổi Metric | Kiểm tra chuyển đổi Metric (Amounts / Orders) trên biểu đồ Dashboard | GUI / Interactive | Chuyển đổi tab trực quan |
| **** |  | Bộ chọn nhanh | Kiểm tra tương tác bộ chọn nhanh khoảng thời gian (Select Range) | Function | Last 7 Days |
| **** | 1.4 Bảng giá trị biên (BVA) - Khoảng thời gian lọc | Biên tối thiểu (Min) | [BVA] Kiểm tra lọc khoảng ngày ở biên tối thiểu (From = To, 1 ngày duy nhất) | Boundary Value | Delta days = 1 ngày |
| **** |  | Cận biên dưới (Min+) | [BVA] Kiểm tra lọc khoảng ngày cận biên dưới (2 ngày liên tiếp) | Boundary Value | Delta days = 2 ngày |
| **** |  | Mốc chuẩn (Nominal) | [BVA] Kiểm tra lọc khoảng ngày ở mốc chuẩn (1 tháng - 30 ngày) | Boundary Value | Delta days = 30 ngày |
| **** |  | Biên tối đa (Max) | [BVA] Kiểm tra lọc khoảng ngày ở biên tối đa trong 1 năm (365 ngày tròn) | Boundary Value | Delta days = 365 ngày |
| **** |  | Vượt biên tối đa (Max+) | [BVA] Kiểm tra lọc khoảng ngày vượt biên tối đa (> 365 ngày) | Boundary Value | Delta days = 2 năm |
| **** |  | Biên không hợp lệ (Min-) | [BVA] Kiểm tra nhập ngày không hợp lệ: Từ ngày sau Đến ngày (From > To) | Boundary Value | From > To |
| **** |  | Biên tương lai | [BVA] Kiểm tra chọn ngày kết thúc vượt quá ngày hiện tại (Ngày trong tương lai) | Boundary Value | Năm 2030 |
| **** |  | Biên năm nhuận | [BVA] Kiểm tra khoảng ngày vắt qua ranh giới năm mới và ngày nhuận (29/02) | Boundary Value | 29/02/2024 |
| **** |  | Biên rỗng (Min = 0) | [BVA] Kiểm tra khoảng thời gian không có doanh thu (Doanh thu = 0đ, 0 đơn) | Boundary Value | Năm 2010 không có đơn |
| **** | 1.5 Thống kê sản phẩm bán chạy (Bestsellers) | Danh sách chuyên biệt | Kiểm tra hiển thị danh sách sản phẩm bán chạy (Bestsellers) | Function | Trang Bestsellers |
| **** |  | Dashboard Bestsellers | Kiểm tra bảng Bestsellers trên Dashboard (Top 5 sản phẩm) | GUI / Function | Top 5 sản phẩm |
| **** |  | Làm mới số liệu | Kiểm tra truy cập trang làm mới số liệu (Refresh Statistics) | Function | Refresh dữ liệu đệm |
| **** |  | Tìm kiếm & Lọc | Kiểm tra tìm kiếm và lọc dữ liệu trên danh sách Bestsellers | Function | Search / Filter |
| **** |  | Phân trang | Kiểm tra thanh điều hướng phân trang (Paging) của Bestsellers | GUI / Paging | Pager điều hướng |
| **** | 1.6 Bảng giá trị biên (BVA) - Top sản phẩm & Số lượng | Biên tối thiểu (Min) | [BVA] Kiểm tra hiển thị Top N sản phẩm ở biên tối thiểu (Top 1 Quán quân) | Boundary Value | Rank #1 |
| **** |  | Cấu hình phân trang | [BVA] Kiểm tra hiển thị Top sản phẩm với tùy chọn số dòng trên 1 trang | Boundary Value | Limit = 50 |
| **** |  | Biên loại trừ (Qty = 0) | [BVA] Kiểm tra sản phẩm có số lượng bán bằng 0 (Biên loại trừ) | Boundary Value | Không lọt vào Top |
| **** |  | Biên hợp lệ (Qty = 1) | [BVA] Kiểm tra sản phẩm có số lượng bán bằng 1 (Biên tối thiểu hợp lệ) | Boundary Value | Được xét vào Top |
| **** |  | Đồng hạng (Tie-break) | [BVA] Kiểm tra hiển thị đồng hạng khi các sản phẩm có cùng số lượng bán | Boundary Value | Xếp hạng công bằng |
| **** | 1.7 Xuất báo cáo (Export Reports) | Định dạng Excel | Kiểm tra xuất báo cáo doanh thu định dạng file Excel (.xml / .xlsx) | Function | Excel XML |
| **** |  | Định dạng CSV | Kiểm tra xuất báo cáo doanh thu định dạng file CSV (.csv) | Function | CSV |
| **** |  | Xuất Bestsellers | Kiểm tra xuất danh sách Bestsellers sang CSV/Excel | Function | Xuất file Bestsellers |
| **** | 1.8 Bảng giá trị biên (BVA) - Số lượng bản ghi xuất | Biên rỗng (0 record) | [BVA] Kiểm tra xuất báo cáo khi không có dữ liệu (0 bản ghi / 0 record) | Boundary Value | File rỗng an toàn |
| **** |  | Biên tối thiểu (1 record) | [BVA] Kiểm tra xuất báo cáo khi có 1 bản ghi dữ liệu duy nhất (Biên Min = 1 record) | Boundary Value | Đúng 1 dòng data |
| **** |  | Biên tối đa (10k records) | [BVA] Kiểm tra xuất báo cáo dung lượng lớn chạm ngưỡng cho phép (10,000 dòng) | Boundary Value | Stream 10k dòng |
| **** |  | Giới hạn định dạng | [BVA] Kiểm tra cơ chế giới hạn tải và bảo vệ tài nguyên khi xuất dữ liệu | Security | Định dạng được phép |
| **** |  | Mã hóa UTF-8 | [BVA] Kiểm tra định dạng mã hóa ký tự UTF-8 cho báo cáo xuất CSV | Boundary Value | UTF-8 BOM tiếng Việt |
| **** |  | Chống spam click | Kiểm tra chống spam click vào nút Xuất file (Export) | Robustness | Double click liên tục |
| **** | 1.9 Hiệu năng & Thời gian đáp ứng | Thời gian phản hồi SLA | Kiểm tra thời gian phản hồi khi tải biểu đồ và báo cáo lớn (SLA <= 3 giây) | Performance | Đo thời gian thực tế |

---

## 3. Playwright Automation Guidelines & Best Practices for Sales Reports

1. **CSRF Secret Key Management (`state: 'attached'`):** Menu Admin `#nav` chứa mã secret key động do server sinh theo session. Luôn sử dụng `await locator.waitFor({ state: 'attached' })` để trích xuất `href` chính xác, ngăn chặn việc server redirect về Dashboard.
2. **Async Grid & AJAX Handling:** Maho Commerce sử dụng Prototype AJAX để load lại bảng số liệu khi bấm [Show Report]. Chờ đợi bảng hiển thị bằng `await expect(page.locator('.grid, table').first()).toBeVisible()`.
3. **Handling Demo Reset Notice:** Server demo thường xuyên reset ngắt quãng. Sử dụng vòng lặp trong helper `waitForReset(page)` để tự động chờ và tải lại trang an toàn.
