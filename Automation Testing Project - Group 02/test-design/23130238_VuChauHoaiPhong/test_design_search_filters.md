# Test Design Matrix: Search & Faceted Filters (Maho Commerce)

**Project:** Maho Commerce Automation Testing
**Tool Target:** Playwright (JavaScript)
**Environment:** `https://demo.mahocommerce.com/default/`
**Module:** Storefront Search, Autocomplete, Faceted Filters, Sorting and URL State
**Spec:** `tests/23130238_VuChauHoaiPhong/search-filters.spec.js`
**Scope:** 29 test cases (24 functional/conditional, 5 defect)
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), state-transition and security testing

---

## 1. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Note / Automation Strategy (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Search & Faceted Filters** | **Keyword Search** | Exact product name | **Search_Exact_01** — Tìm đúng tên đầy đủ “Bib shorts” | Functional / E2E | Nhập exact keyword; chờ navigation/response; xác nhận URL hoặc PDP/result đúng sản phẩm. |
|  |  | Partial keyword | **Search_Partial_02** — Tìm theo từ khóa một phần “Shirt” | Functional / EP | Tìm “Shirt”; xác nhận HTTP response thành công và kết quả có tên chứa keyword. |
|  |  | Trim whitespace | **Search_Trim_03** — Tìm được kết quả dù có khoảng trắng thừa “Jacket” | Validation / EP | Nhập keyword có khoảng trắng hai đầu; xác nhận query được chuẩn hóa và có sản phẩm liên quan. |
|  |  | Maximum query length | **Search_MaxLength_04** — Giới hạn tối đa ký tự ô tìm kiếm | Boundary / BVA | Nhập chuỗi 300 ký tự; xác nhận input giới hạn độ dài và request không gây lỗi server. |
|  |  | XSS in search | **Search_Security_05** — Chống XSS ở ô tìm kiếm | Security | Gửi payload XSS; theo dõi dialog và HTML/UI; xác nhận payload không thực thi hoặc được WAF an toàn chặn. |
|  |  | No-result query | **Search_NoResult_06** — Từ khóa không tồn tại “xyznotfound999” | Functional / Negative | Tìm chuỗi không tồn tại; xác nhận thông báo no results, không có product cards và các thành phần trang vẫn tải. |
|  | **Price/Facet Filters** | Valid price range | **Filter_PriceValid_01** — Lọc giá hợp lệ $20–$50 | Functional / BVA | Áp dụng min/max qua UI; xác nhận range hiển thị và mọi sản phẩm nằm trong khoảng giá. |
|  |  | Equal bounds | **Filter_PriceBoundary_02** — Biên Min = Max = $30 | Boundary / BVA | Đặt min=max=30; xác nhận query/filter giữ đúng biên và kết quả (nếu có) đúng giá. |
|  |  | Min greater than max | **Filter_PriceInvalid_03** — Min > Max không trả sản phẩm | Validation / Negative | Đặt min=100, max=10; xác nhận URL/state và danh sách không chứa sản phẩm trái điều kiện. |
|  |  | Negative/text values | **Filter_PriceNegative_04** — Chặn số âm và ký tự chữ | Validation / EP | Nhập giá âm và chữ; xác nhận validation/input không chấp nhận dữ liệu không phải số hợp lệ. |
|  |  | Brand + category | **Filter_CategoryBrand_05** — Lọc kết hợp Thương hiệu + Danh mục | Functional / AND filters | Chọn Voltline và Computing; xác nhận cả hai filter active và kết quả phù hợp. |
|  |  | Multiple facets | **Filter_MultiCategory_06** — Lọc đa tùy chọn (OR cùng nhóm, AND khác nhóm) | Functional / Combination | Chọn nhiều facet theo nhóm; xác nhận URL, active filters và kết quả thể hiện đúng phép kết hợp. |
|  |  | Clear all | **Filter_ClearAll_07** — Nút Clear All hủy toàn bộ điều kiện lọc | Functional / State transition | Áp dụng filter rồi Clear All; xác nhận active filters và filter query được xóa. |
|  | **Sorting** | Price ascending | **Sort_PriceAsc_01** — Giá tăng dần (Low to High) | Functional / Ordering | Chọn sort giá tăng; lấy giá các cards và xác nhận dãy không giảm. |
|  |  | Price descending | **Sort_PriceDesc_02** — Giá giảm dần theo Special Price | Functional / Ordering | Chọn sort giá giảm; xác nhận dãy giá hiển thị không tăng, dùng giá khuyến mãi nếu có. |
|  |  | Default position | **Sort_Popularity_03** — Sắp xếp theo Position (mặc định) | Functional | Chọn Position/default; xác nhận sorter selection và thứ tự theo trạng thái mặc định của storefront. |
|  | **Combined Search/UI/URL** | Search + facet + sort | **Search_Combine_01** — Kết hợp tìm “Jacket” + lọc Fashion + sắp xếp giá tăng | E2E / Combination | Thực hiện keyword, facet và sort trong một flow; xác nhận URL, filter state và thứ tự kết quả. |
|  |  | Restore URL state | **Search_UrlState_02** — Khôi phục bộ lọc khi vào trực tiếp qua URL | Functional / Deep link | Điều hướng trực tiếp URL có query filter; xác nhận active filter và danh sách khôi phục đúng. |
|  |  | Reset pagination on filter | **Search_Pagination_03** — Đang ở Trang 2, chọn bộ lọc mới thì về Trang 1 | State transition / Defect-oriented | Mở trang 2, chọn facet; xác nhận `p` bị xóa/đặt về 1 và nội dung trang đầu hiển thị. |
|  |  | Autocomplete | **Search_UI_04** — Autocomplete / Dropdown gợi ý khi gõ “Shirt” | UI / Async | Gõ keyword; chờ suggest response; xác nhận dropdown, item, ảnh và giá hiển thị. |
|  |  | Product color variant | **Search_UI_05** — Đổi biến thể màu khi xem chi tiết “Harbour stripe tee” | UI / Functional | Mở PDP, chọn swatch/variant; xác nhận thuộc tính hoặc ảnh sản phẩm thay đổi. |
|  |  | Voice search | **Search_Voice_01** — Voice Search | Conditional / Skipped | Cần microphone API; hiện skip trong headless do môi trường không cung cấp microphone. |
|  |  | Synonym search | **Search_Synonym_01** — Synonym Search | Conditional / Untested | Chờ admin cấu hình Search Synonyms; không đánh giá pass khi chưa có cấu hình. |
|  |  | Performance under load | **Search_Perf_01** — Thời gian phản hồi Facet Filter dưới tải 100 req/s | Performance / Blocked | Chỉ chạy trên staging được ủy quyền; không tạo tải 100 req/s trên public demo. |
|  | **Defect / Regression** | Pagination and sort | **DEF_Search_01** — Pagination không reset khi đổi sort ở trang 2 | Defect / State transition | Mở trang 2, đổi sort; xác nhận pagination/query reset phù hợp và danh sách ở trang đúng. |
|  |  | Negative price URL | **DEF_Search_02** — URL param price âm bypass frontend filter | Defect / Security validation | Điều hướng URL có price âm; xác nhận hệ thống không trả kết quả vượt qua validation. |
|  |  | Search + price + sort | **DEF_Search_03** — Kết hợp search+filter giá+sort trả sản phẩm ngoài khoảng giá | Defect / Data consistency | Kết hợp keyword, khoảng giá và sort; kiểm tra từng product price nằm trong range yêu cầu. |
|  |  | Unicode/emoji query | **DEF_Search_04** — Từ khóa Unicode/emoji không gây lỗi server 500 | Defect / Input robustness | Gửi keyword Unicode/emoji; xác nhận không có response/server page 500. |
|  |  | Browser back state | **DEF_Search_05** — Browser Back khôi phục đúng filter state | Defect / Navigation state | Áp dụng filter, điều hướng tiếp rồi Back; xác nhận query và active facets được khôi phục. |

---

## 2. Playwright Automation Implementation Guidelines

1. **Wait for observable state:** Chờ response, URL hoặc locator của kết quả; tránh fixed sleeps cho autocomplete/filter navigation.
2. **Verify every product:** Đọc giá thực tế hiển thị trên card/PDP để kiểm tra range và sorting, không chỉ kiểm tra query string.
3. **URL state:** Dùng `URL`/`searchParams` để kiểm tra filter, sort và pagination; đồng thời xác nhận UI active filters.
4. **Security:** Payloads chỉ gửi qua storefront demo và chỉ xác nhận không thực thi/không gây lỗi server.
5. **Execution constraints:** Voice/Synonym/Performance có điều kiện môi trường riêng; giữ trạng thái `SKIPPED`, `UNTESTED` hoặc `BLOCKED` đến khi điều kiện được cung cấp.
