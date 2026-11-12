# Test Specification Details: Search & Faceted Filters

## 1. Document Information

| Field | Value |
|---|---|
| Project | Maho Commerce Automation Testing |
| Environment | [https://demo.mahocommerce.com/default/](https://demo.mahocommerce.com/default/) |
| Module | Storefront Search, Autocomplete, Faceted Filters, Sorting and URL State |
| Automation Tool | Playwright (JavaScript) |
| Automation Spec | `tests/23130238_VuChauHoaiPhong/search-filters.spec.js` |
| Scope | 29 Test Cases (24 functional/conditional cases and 5 defect/regression cases) |
| Methodology | Equivalence Partitioning (EP), Boundary Value Analysis (BVA), combination testing, state-transition, UI and security testing |
| Test execution date in workbook | 2026-11-12 |
| Test case count | 29 |

## 2. Execution Summary

**Recorded result summary:** PASSED: 25 | FAILED: 1 | BLOCKED: 1 | SKIPPED: 2.

> Status and Actual Result below are transcribed from the uploaded workbook. They describe the recorded execution dated 2026-11-12; creating this document did not re-run the Playwright tests.

## 3. Playwright Implementation Notes

- Playwright chạy với viewport 1366 × 768, locale en-US và ignoreHTTPSErrors=true; screenshot/video chỉ được giữ theo cấu hình khi failure.
- Tìm kiếm sử dụng các helper openHome, searchBox/typeSearch, pressEnterAndWait, searchFor và getProducts; kiểm tra response, URL và kết quả hiển thị.
- Facet/filter kiểm tra cả URL/query parameters, active filters và giá thực tế trên product cards; không chỉ dựa vào query string.
- Sorting được xác minh bằng dãy giá hoặc thứ tự sản phẩm sau khi chọn sorter và direction.
- Voice Search và Synonym Search được khai báo test.skip trong source; Performance 100 req/s được skip/blocked vì không chạy load test trên public demo.
- Security test chỉ quan sát payload trên storefront, dialog, HTML/response và không thực hiện thao tác ngoài phạm vi kiểm thử được phép.

## 4. Test Specification Details

Mỗi Test Case giữ nguyên ID, mô tả, dependency, procedure, expected output, result, date và note theo workbook. Test Data bổ sung chỉ ghi các giá trị thấy rõ trong procedure hoặc source code đã cung cấp; các giá trị cấu hình động được tham chiếu qua `support.cjs`.

### 1. Search_Exact_01 — Kiểm tra chức năng tìm kiếm sản phẩm khi nhập đúng tên đầy đủ (Shorts)

| Field | Specification |
|---|---|
| Test Case ID | `Search_Exact_01` |
| Test Case Description | Kiểm tra chức năng tìm kiếm sản phẩm khi nhập đúng tên đầy đủ (Shorts) |
| Inter-test Case Dependence | Không |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL [https://demo.mahocommerce.com/default/]

**Test Data**
- Keyword = Bib shorts.

**Test Steps**
1. Mở trang chủ Storefront
2. Click ô tìm kiếm input#search
3. Nhập từ khóa 'Bib shorts'
4. Click nút tìm kiếm hoặc nhấn Enter

**Expected Results**
1. Trang chủ hiển thị bình thường
2. Ô tìm kiếm nhận dữ liệu nhập
3. Chuyển hướng đến trang kết quả /catalogsearch/result/?q=Bib shorts
4. Hiển thị đúng chi tiết sản phẩm Bib shorts.

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Testcase cơ bản cho tính năng tìm kiếm theo từ khóa chính xác.

---

### 2. Search_Partial_02 — Kiểm tra tìm kiếm sản phẩm theo từ khóa một phần (Shirt)

| Field | Specification |
|---|---|
| Test Case ID | `Search_Partial_02` |
| Test Case Description | Kiểm tra tìm kiếm sản phẩm theo từ khóa một phần (Shirt) |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL [https://demo.mahocommerce.com/default/]

**Test Data**
- Keyword = Shirt.

**Test Steps**
1. Mở trang chủ Storefront
2. Click ô tìm kiếm input#search
3. Nhập từ khóa 'Shirt'
4. Nhấn phím Enter

**Expected Results**
1. Trang chủ hiển thị bình thường
2. Ô tìm kiếm nhận dữ liệu nhập
3. Trả về danh sách các sản phẩm chứa từ 'Shirt' (T-Shirt, Casual Shirt...)
4. Response Status Code 200 OK

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra thuật toán tìm kiếm gợi ý / khớp một phần.

---

### 3. Search_Trim_03 — Kiểm tra tự động cắt bỏ khoảng trắng thừa ở đầu/cuối từ khóa tìm kiếm

| Field | Specification |
|---|---|
| Test Case ID | `Search_Trim_03` |
| Test Case Description | Kiểm tra tự động cắt bỏ khoảng trắng thừa ở đầu/cuối từ khóa tìm kiếm |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL [https://demo.mahocommerce.com/default/]

**Test Data**
- Keyword = "   Jacket    "; query kỳ vọng được chuẩn hóa thành jacket.

**Test Steps**
1. Mở trang chủ Storefront
2. Click ô tìm kiếm input#search
3. Nhập chuỗi '   Jacket    '
4. Click nút tìm kiếm

**Expected Results**
1. Trang chủ hiển thị bình thường
2. Chuỗi tìm kiếm tự động trim khoảng trắng
3. URL chỉ nhận param q=Jacket
4. Hiển thị danh sách sản phẩm Jacket

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> URL chứa kí tự khoảng trắng thừa

---

### 4. Search_MaxLength_04 — Kiểm tra giới hạn ký tự tối đa (300 ký tự) trên ô tìm kiếm

| Field | Specification |
|---|---|
| Test Case ID | `Search_MaxLength_04` |
| Test Case Description | Kiểm tra giới hạn ký tự tối đa (300 ký tự) trên ô tìm kiếm |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL [https://demo.mahocommerce.com/default/]

**Test Data**
- Chuỗi tìm kiếm 300 ký tự; source kiểm tra input không vượt quá 50 ký tự.

**Test Steps**
1. Mở trang chủ Storefront
2. Dán chuỗi ngẫu nhiên 300 ký tự vào ô input#search
3. Kiểm tra độ dài thực tế trong khung input
4. Nhấn Enter gửi yêu cầu

**Expected Results**
1. Ô input chỉ nhận tối đa 50 ký tự (cắt 250 ký tự dư)
2. Hệ thống xử lý an toàn, không bị crash hoặc báo lỗi 500 Server Error

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Giá trị biên độ dài chuỗi nhập là 50.

---

### 5. Search_Security_05 — Kiểm tra bảo mật ô tìm kiếm chống tấn công Cross-Site Scripting (XSS)

| Field | Specification |
|---|---|
| Test Case ID | `Search_Security_05` |
| Test Case Description | Kiểm tra bảo mật ô tìm kiếm chống tấn công Cross-Site Scripting (XSS) |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL [https://demo.mahocommerce.com/default/]

**Test Data**
- Payload: <script>alert('XSS_Test')</script>.

**Test Steps**
1. Mở trang chủ Storefront
2. Nhập payload: <script>alert('XSS_Test')</script> vào ô input#search
3. Click nút tìm kiếm

**Expected Results**
1. Trình duyệt không bật alert popup
2. Mã script được escape/sanitize an toàn thành &lt;script&gt;
3. Hiển thị thông báo không tìm thấy kết quả phù hợp

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Bị chặn bởi WAF Cloudflare (Layer 7 Security Rule) khi gửi payload XSS trên URL.

---

### 6. Search_NoResult_06 — Kiểm tra giao diện hiển thị không có kết quả khi tìm từ khóa không tồn tại

| Field | Specification |
|---|---|
| Test Case ID | `Search_NoResult_06` |
| Test Case Description | Kiểm tra giao diện hiển thị không có kết quả khi tìm từ khóa không tồn tại |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL [https://demo.mahocommerce.com/default/]

**Test Data**
- Keyword = xyznotfound999.

**Test Steps**
1. Mở trang chủ Storefront
2. Nhập từ khóa 'xyznotfound999' vào ô input#search
3. Nhấn phím Enter

**Expected Results**
1. Trang web chuyển hướng bình thường
2. Hiển thị khối thông báo tiếng Anh: 'Your search returned no results.'
3. Bố cục trang chủ/header/footer nguyên vẹn, không vỡ UI

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra màn hình Zero State. Trả về trạng thái no results

---

### 7. Filter_PriceValid_01 — Kiểm tra bộ lọc giá khi người dùng nhập khoảng giá hợp lệ ($20 - $50)

| Field | Specification |
|---|---|
| Test Case ID | `Filter_PriceValid_01` |
| Test Case Description | Kiểm tra bộ lọc giá khi người dùng nhập khoảng giá hợp lệ ($20 - $50) |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập URL [https://demo.mahocommerce.com/default/fashion/]

**Test Data**
- Giá từ $20 đến $50; kết quả kiểm tra từng sản phẩm trong range.

**Test Steps**
1. Mở bộ lọc Price ở Sidebar bên trái
2. Nhập Min Price = 20 vào ô input.price-min
3. Nhập Max Price = 50 vào ô input.price-max
4. Click nút Apply(-->)

**Expected Results**
1. Thanh bộ lọc cập nhật trạng thái active $20.00 - $50.00
2. Danh sách sản phẩm tự động làm mới
3. Tất cả sản phẩm hiển thị có giá nằm trong khoảng $20 đến $50

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra chức năng lọc giá cơ bản. Cho ra các sản phẩm có giá từ 20$ - 50$.

---

### 8. Filter_PriceBoundary_02 — Kiểm tra bộ lọc giá tại điểm biên trùng nhau (Min Price = Max Price = $30)

| Field | Specification |
|---|---|
| Test Case ID | `Filter_PriceBoundary_02` |
| Test Case Description | Kiểm tra bộ lọc giá tại điểm biên trùng nhau (Min Price = Max Price = $30) |
| Inter-test Case Dependence | Filter_PriceValid_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập trang danh mục có bộ lọc giá

**Test Data**
- Min = Max = $30.

**Test Steps**
1. Mở bộ lọc Price ở Sidebar
2. Nhập Min Price = 30 và Max Price = 30
3. Click nút Apply(-->)_

**Expected Results**
1. Trả về đúng danh sách các sản phẩm có giá niêm yết đúng $30.00
2. URL đính kèm tham số ?price=30-30

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra điểm biên khoảng giá. Không có sản phẩm hợp lệ. Url trả về

---

### 9. Filter_PriceInvalid_03 — Kiểm tra báo lỗi khi nhập giá tối thiểu lớn hơn giá tối đa (Min > Max)

| Field | Specification |
|---|---|
| Test Case ID | `Filter_PriceInvalid_03` |
| Test Case Description | Kiểm tra báo lỗi khi nhập giá tối thiểu lớn hơn giá tối đa (Min > Max) |
| Inter-test Case Dependence | Filter_PriceValid_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập trang danh mục có bộ lọc giá

**Test Data**
- Min = 100; Max = 10.

**Test Steps**
1. Mở bộ lọc Price ở Sidebar
2. Nhập Min Price = 100 và Max Price = 10
3. Click nút Apply

**Expected Results**
1. Hiển thị thông báo lỗi Inline Validation tiếng Anh dưới ô nhập: 'Please enter a valid price range'
2. Hệ thống chặn không cho gửi request lọc sai logic

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Ghi nhận Bug BUG_VAL_001 do chưa hiển thị thông báo lỗi inline.

---

### 10. Filter_PriceNegative_04 — Kiểm tra ô nhập giá tự động chặn số âm và ký tự chữ

| Field | Specification |
|---|---|
| Test Case ID | `Filter_PriceNegative_04` |
| Test Case Description | Kiểm tra ô nhập giá tự động chặn số âm và ký tự chữ |
| Inter-test Case Dependence | Filter_PriceValid_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập trang danh mục có bộ lọc giá

**Test Data**
- Min Price = -50; Max Price = abc.

**Test Steps**
1. Mở bộ lọc Price ở Sidebar
2. Thử nhập '-50' vào ô Min Price
3. Thử nhập 'abc' vào ô Max Price
4. Click ra ngoài ô nhập (Blur event)

**Expected Results**
1. Ô Min Price tự động xóa dấu âm '-' hoặc quy về 0
2. Ô Max Price không nhận ký tự chữ 'abc'
3. Chỉ chấp nhận các số nguyên dương

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra validation kiểu dữ liệu input giá. Hệ thống vẫn trả về list sản phẩm ban đầu.

---

### 11. Filter_CategoryBrand_05 — Kiểm tra lọc kết hợp 1 Danh mục (Gear) và 1 Thương hiệu (Maho)

| Field | Specification |
|---|---|
| Test Case ID | `Filter_CategoryBrand_05` |
| Test Case Description | Kiểm tra lọc kết hợp 1 Danh mục (Gear) và 1 Thương hiệu (Maho) |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập trang danh mục Storefront

**Test Data**
- Source code chọn Voltline và Computing trên trang electronics; workbook Test Case Procedure là nguồn chi tiết cho dữ liệu/nhãn.

**Test Steps**
1. Trên Sidebar: chọn thương hiệu 'Maison Maho'.
2. Tiếp tục sau đó, chọn danh mục 'man' rồi chọn hai nhãn 'Category:Shirts'&'Material:Cotton'.
3. Kiểm tra các nhãn active và danh sách sản phẩm

**Expected Results**
1. Vùng Active Filters hiển thị 2 nhãn tiếng Anh 'Category:Shirts'&'Material:Cotton'
2. Danh sách hiển thị sản phẩm thuộc danh mục Gear do hãng Maho sản xuất

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra phép lọc giao (AND). Lọc được danh sách sản phẩm theo 2 nhãn đã chọn.

---

### 12. Filter_MultiCategory_06 — Kiểm tra lọc đa tùy chọn (Multi-select) với nhiều Danh mục và Thương hiệu

| Field | Specification |
|---|---|
| Test Case ID | `Filter_MultiCategory_06` |
| Test Case Description | Kiểm tra lọc đa tùy chọn (Multi-select) với nhiều Danh mục và Thương hiệu |
| Inter-test Case Dependence | Filter_CategoryBrand_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập trang danh mục Storefront

**Test Data**
- Source code kiểm tra các facet Voltline và Computing; xác minh URL và kết quả.

**Test Steps**
1. Tick chọn checkbox danh mục 'Electronics'
2. Tick chọn thêm checkbox thương hiệu 'Voltline'
3. Tick chọn checkbox category 'Computing'
4. Kiểm tra URL và danh sách sản phẩm

**Expected Results**
1. URL đính kèm đủ các param ?cat=electronics,brand&cat
2. Hiển thị các sản phẩm thuộc Computing, từ thương hiệu Maho
3. Số đếm Facet Count hiển thị khớp CSDL

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra logic OR cùng nhóm, AND khác nhóm. Hiển thị đúng chức năng của 2 bộ lọc OR và AND

---

### 13. Filter_ClearAll_07 — Kiểm tra nút 'Clear All' để hủy bỏ toàn bộ điều kiện lọc đang chọn

| Field | Specification |
|---|---|
| Test Case ID | `Filter_ClearAll_07` |
| Test Case Description | Kiểm tra nút 'Clear All' để hủy bỏ toàn bộ điều kiện lọc đang chọn |
| Inter-test Case Dependence | Filter_CategoryBrand_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Đang chọn bộ lọc Danh mục 'Fashion' và giá $10 - $50

**Test Data**
- Use the test values explicitly stated in the procedure above. Any account, product, address or environment-specific value is supplied by the QA configuration/helper in `support.cjs`; no credential is reproduced in this document.

**Test Steps**
1. Quan sát vùng bộ lọc active .filter-current
2. Click nút 'Clear All' (a.action.clear)
3. Kiểm tra trang web sau khi làm mới

**Expected Results**
1. Vùng .filter-current biến mất
2. Tất cả checkbox bỏ chọn, các ô nhập giá về rỗng
3. URL quay về trạng thái gốc, hiển thị danh sách sản phẩm mặc định

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra chức năng reset bộ lọc. Hoạt động tốt xóa được nhãn đã chọn

---

### 14. Sort_PriceAsc_01 — Kiểm tra sắp xếp sản phẩm theo Giá tăng dần (Low to High)

| Field | Specification |
|---|---|
| Test Case ID | `Sort_PriceAsc_01` |
| Test Case Description | Kiểm tra sắp xếp sản phẩm theo Giá tăng dần (Low to High) |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Đã search từ khóa 'Shirt' có danh sách sản phẩm

**Test Data**
- Keyword = Shirt; sort = Price; direction = ascending.

**Test Steps**
1. Click dropdown sắp xếp #sorter
2. Chọn tùy chọn 'Price'
3. Click biểu tượng mũi tên đổi hướng sorter-asc
4. Kiểm tra thứ tự giá tiền sản phẩm

**Expected Results**
1. Danh sách sản phẩm load lại
2. Mảng giá trị tiền P thỏa mãn P[i] <= P[i+1] (giá tăng dần từ thấp đến cao)

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra thuật toán sắp xếp giá tăng dần.

---

### 15. Sort_PriceDesc_02 — Kiểm tra sắp xếp sản phẩm theo Giá giảm dần (High to Low) tính trên giá khuyến mãi

| Field | Specification |
|---|---|
| Test Case ID | `Sort_PriceDesc_02` |
| Test Case Description | Kiểm tra sắp xếp sản phẩm theo Giá giảm dần (High to Low) tính trên giá khuyến mãi |
| Inter-test Case Dependence | Sort_PriceAsc_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Đã search từ khóa 'Shirt' có danh sách sản phẩm

**Test Data**
- Keyword = Shirt; sort = Price; direction = descending; so sánh giá hiển thị thực tế.

**Test Steps**
1. Click dropdown sắp xếp #sorter
2. Chọn tùy chọn 'Price'
3. Click biểu tượng mũi tên sorter-desc
4. Kiểm tra mảng giá bán thực tế (Special Price)

**Expected Results**
1. Mảng giá bán thực tế P phải giảm dần P[i] >= P[i+1]
2. Hệ thống so sánh dựa trên Special Price thay vì lấy Regular Price gốc

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Ghi nhận Bug BUG_LOGIC_001 do so sánh sai trên giá gốc. Không thể nhận diện mũi tên để sắp xếp giảm

---

### 16. Sort_Popularity_03 — Kiểm tra sắp xếp sản phẩm theo Độ phổ biến / Vị trí mặc định (Position)

| Field | Specification |
|---|---|
| Test Case ID | `Sort_Popularity_03` |
| Test Case Description | Kiểm tra sắp xếp sản phẩm theo Độ phổ biến / Vị trí mặc định (Position) |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Truy cập trang danh mục sản phẩm

**Test Data**
- Category = Fashion; sort = Position/default.

**Test Steps**
1. Click dropdown sắp xếp #sorter
2. Chọn tùy chọn 'Position'
3. Kiểm tra thứ tự hiển thị các sản phẩm

**Expected Results**
1. Danh sách hiển thị đúng vị trí sắp xếp ưu tiên mặc định do Admin cấu hình

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra tiêu chuẩn sắp xếp mặc định. Đạt điều kiện về sắp

---

### 17. Search_Combine_01 — Kiểm tra kết hợp: Tìm từ khóa + Lọc danh mục + Sắp xếp

| Field | Specification |
|---|---|
| Test Case ID | `Search_Combine_01` |
| Test Case Description | Kiểm tra kết hợp: Tìm từ khóa + Lọc danh mục + Sắp xếp |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Mở trang chủ Storefront

**Test Data**
- Keyword = Jacket; facet = Fashion; sort = Price ascending.

**Test Steps**
1. Search từ khóa 'Jacket'
2. Chọn danh mục Fashion
3. Chọn Sắp xếp theo 'Price: Low to High'

**Expected Results**
1. Kết quả chỉ hiển thị các sản phẩm thỏa mãn đồng thời cả 3 tiêu chí
2. Tên chứa Jacket, thuộc danh mục Fashion, giá tăng dần

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra kịch bản tích hợp đa điều kiện.

---

### 18. Search_UrlState_02 — Kiểm tra khôi phục trạng thái bộ lọc khi truy cập trực tiếp qua đường dẫn URL

| Field | Specification |
|---|---|
| Test Case ID | `Search_UrlState_02` |
| Test Case Description | Kiểm tra khôi phục trạng thái bộ lọc khi truy cập trực tiếp qua đường dẫn URL |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Mở cửa sổ trình duyệt mới

**Test Data**
- Direct URL: /fashion/?price=10-50.

**Test Steps**
1. Dán URL: https://demo.mahocommerce.com/default/fashion/?price=10-50
2. Nhấn Enter để truy cập
3. Kiểm tra giao diện ô search và thanh bộ lọc

**Expected Results**
1. Hệ thống ự động chọn danh mục Fashion
2. Vùng Active Filter hiển thị nhãn lọc giá $10.00 - $50.00 được bật sẵn

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra duy trì trạng thái URL State. Trạng thái được duy trùy với nhãn giá đã nhập trước đó

---

### 19. Search_Pagination_03 — Kiểm tra tự động chuyển về Trang 1 khi chọn bộ lọc mới lúc đang ở Trang 2

| Field | Specification |
|---|---|
| Test Case ID | `Search_Pagination_03` |
| Test Case Description | Kiểm tra tự động chuyển về Trang 1 khi chọn bộ lọc mới lúc đang ở Trang 2 |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Đang ở Trang 2 của danh mục 'Fashion' (?p=2)

**Test Data**
- Direct URL /fashion/?p=2; sau đó chọn facet Man/Men.

**Test Steps**
1. Click chọn bộ lọc nhãn 'Man' trên sidebar
2. Quan sát URL và thanh phân trang

**Expected Results**
1. URL tự động cập nhật xóa tham số p=2 hoặc quy về p=1
2. Thanh phân trang hiển thị active ở Trang 1

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra cơ chế Reset Pagination. Sau khi chọn nhãn từ bộ lọc, danh mục Fashion đang ở trang 2 trở về trang 1.

---

### 20. Search_UI_04 — Kiểm tra giao diện Autocomplete / Dropdown gợi ý tìm kiếm

| Field | Specification |
|---|---|
| Test Case ID | `Search_UI_04` |
| Test Case Description | Kiểm tra giao diện Autocomplete / Dropdown gợi ý tìm kiếm |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Mở trang chủ Storefont

**Test Data**
- Keyword = Shirt; autocomplete endpoint /catalogsearch/ajax/suggest/; kiểm tra dropdown, ảnh và giá.

**Test Steps**
1. Gõ từ khóa 'Shirt' vào ô #search
2. Không nhấn Enter, quan sát dropdown hiển thị

**Expected Results**
1. Dropdown hiển thị danh sách gợi ý đúng từ khóa, có ảnh thumbnail, tên sản phẩm và giá tiền hiển thị đúng UI

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Kiểm tra True-Test giao diện Autocomplete popup trên Storefront.

---

### 21. Search_UI_05 — Kiểm tra việc thay đổi biến thể khi search chi tiết của 1 sản phẩm

| Field | Specification |
|---|---|
| Test Case ID | `Search_UI_05` |
| Test Case Description | Kiểm tra việc thay đổi biến thể khi search chi tiết của 1 sản phẩm |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Mở trang chủ Storefont.

**Test Data**
- Product = Harbour stripe tee; chọn một màu/variant khác và xác minh snapshot thay đổi.

**Test Steps**
1. Search sản phẩm 'Harbour stripe tee'
2. Click tìm kiếm hoặc nhấn Enter truy cập chi tiết sản phẩm
3. Tiến hành đổi biến thể của áo sang màu khác

**Expected Results**
1. Màu áo tự thay đổi theo màu biến thể đã chọn

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Ảo chuyển từ sản phẩm gốc màu xanh sang đỏ như đã chọn.

---

### 22. Search_Voice_01 — Tìm kiếm sản phẩm bằng giọng nói (Voice Search) kết hợp bộ lọc

| Field | Specification |
|---|---|
| Test Case ID | `Search_Voice_01` |
| Test Case Description | Tìm kiếm sản phẩm bằng giọng nói (Voice Search) kết hợp bộ lọc |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **SKIPPED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Mở trang chủ Storefront trên trình duyệt hỗ trợ Micro

**Test Data**
- Voice Search cần microphone API; source khai báo test.skip cho headless browser.

**Test Steps**
1. Click chọn icon Micro trên thanh tìm kiếm #search
2. Nói từ khóa 'Jacket'
3. Quan sát từ khóa tự điền và hệ thống trả kết quả

**Expected Results**
1. Hệ thống chuyển âm thanh thành từ khóa 'Jacket', tự điền vào ô #search và trả về đúng danh sách sản phẩm

**Recorded Actual Result**
> SKIPPED - Headless browser does not support the microphone API required by this scenario.

**Execution Note**
> Tạm thời Bỏ qua (Skipped) do trình duyệt Testim/Headless Automation không hỗ trợ Micro API.

---

### 23. Search_Synonym_01 — Kiểm tra tìm kiếm theo từ đồng nghĩa (Synonym Search) kết hợp bộ lọc giá

| Field | Specification |
|---|---|
| Test Case ID | `Search_Synonym_01` |
| Test Case Description | Kiểm tra tìm kiếm theo từ đồng nghĩa (Synonym Search) kết hợp bộ lọc giá |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **SKIPPED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Đã đăng nhập tài khoản Customer

**Test Data**
- Synonym Search cần cấu hình Search Synonyms từ admin; source khai báo test.skip.

**Test Steps**
1. Nhập từ đồng nghĩa 'Coat' (thay cho 'Jacket') vào ô #search
2. Nhấn Enter để tìm kiếm
3. Lọc tiếp theo khoảng giá $10 - $50

**Expected Results**
1. Hệ thống nhận diện từ đồng nghĩa 'Coat' và trả về các sản phẩm 'Jacket' có mức giá từ $10.00 - $49.99

**Recorded Actual Result**
> SKIPPED - Waiting for Search Synonyms to be configured by the administrator.

**Execution Note**
> Chưa kiểm thử (Untested) - Chờ Backend Admin hoàn tất cấu hình từ đồng nghĩa (Search Synonyms).

---

### 24. Search_Perf_01 — Kiểm tra thời gian phản hồi API Facet Filter dưới tải 100 req/s

| Field | Specification |
|---|---|
| Test Case ID | `Search_Perf_01` |
| Test Case Description | Kiểm tra thời gian phản hồi API Facet Filter dưới tải 100 req/s |
| Inter-test Case Dependence | Search_Exact_01 |
| Recorded Status | **BLOCKED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Khởi chạy tool test tải CLI

**Test Data**
- Target load = 100 requests/second; chỉ chạy trên staging được ủy quyền, không chạy trên public demo.

**Test Steps**
1. Gửi đồng thời 100 HTTP GET Requests/s tới API Facet Filter
2. Đo Response Time trung bình

**Expected Results**
1. Response Time < 1500ms
2. Tỷ lệ thành công HTTP 200 OK đạt 100%

**Recorded Actual Result**
> BLOCKED - Load test at 100 req/s requires authorized staging; it is not run against the public demo.

**Execution Note**
> Bị Blocked do Rate-limit của server Demo công cộng.

---

### 25. DEF_Search_01 — Kiểm tra chuyển đổi sắp xếp khi phân trang ở trang 2 (State Management)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Search_01` |
| Test Case Description | Kiểm tra chuyển đổi sắp xếp khi phân trang ở trang 2 (State Management) |
| Inter-test Case Dependence | Không |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Mở storefront danh mục Fashion có nhiều trang (URL: /fashion/?p=2).

**Test Data**
- Direct URL /fashion/?p=2; đổi sort sang Price; kiểm tra tham số p.

**Test Steps**
1. Truy cập /fashion/?p=2
2. Chọn sort theo Price trong dropdown sorter
3. Kiểm tra tham số URL p sau khi đổi sort

**Expected Results**
1. Hệ thống phải reset phân trang về trang 1 (p=1 hoặc không có param p) để đảm bảo tính nhất quán của kết quả sắp xếp mới.

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Defect State Management: Nếu không reset trang, người dùng xem trang 2 của danh sách mới dễ bị bỏ sót kết quả đầu.

---

### 26. DEF_Search_02 — Kiểm tra truyền giá trị khoảng giá âm qua URL parameter (Input Validation / Boundary Value)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Search_02` |
| Test Case Description | Kiểm tra truyền giá trị khoảng giá âm qua URL parameter (Input Validation / Boundary Value) |
| Inter-test Case Dependence | Không |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Storefront hoạt động bình thường.

**Test Data**
- Direct URL /fashion/?price=-100-50.

**Test Steps**
1. Truy cập trực tiếp URL /fashion/?price=-100-50
2. Kiểm tra phản hồi của hệ thống và danh sách sản phẩm hiển thị

**Expected Results**
1. Hệ thống phải validate và từ chối tham số giá âm (trả về lỗi 400 hoặc không hiển thị sản phẩm với giá không hợp lệ).

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Defect Input Validation: Bypass frontend filter để truyền giá âm trực tiếp qua query string.

---

### 27. DEF_Search_03 — Kiểm tra kết hợp tìm kiếm từ khóa + bộ lọc giá + sắp xếp (Business Logic / Integration)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Search_03` |
| Test Case Description | Kiểm tra kết hợp tìm kiếm từ khóa + bộ lọc giá + sắp xếp (Business Logic / Integration) |
| Inter-test Case Dependence | Không |
| Recorded Status | **FAILED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Storefront hoạt động bình thường.

**Test Data**
- Keyword = Shirt; price range = $20–$50; sort = Price ascending.

**Test Steps**
1. Tìm kiếm từ khóa 'Shirt'
2. Áp dụng filter giá $20-$50
3. Chọn sắp xếp theo Price ascending
4. Kiểm tra giá của toàn bộ sản phẩm hiển thị

**Expected Results**
1. Tất cả sản phẩm trả về trong danh sách kết quả phải có giá nằm trong khoảng từ $20 đến $50 và được xếp tăng dần.

**Recorded Actual Result**
> FAILED - 9 products outside the $20-$50 range remained after search, price filter, and sort.

**Execution Note**
> Defect Business Logic / Integration: Kết hợp nhiều tiêu chí filter dễ dẫn đến sản phẩm ngoài khoảng giá lọt vào kết quả.

---

### 28. DEF_Search_04 — Kiểm tra tìm kiếm với chuỗi ký tự Unicode đặc biệt và emoji (Input Validation)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Search_04` |
| Test Case Description | Kiểm tra tìm kiếm với chuỗi ký tự Unicode đặc biệt và emoji (Input Validation) |
| Inter-test Case Dependence | Không |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Storefront hoạt động bình thường.

**Test Data**
- Payloads: áéíóú, 日本語, 🛍️👗 (the source currently uses 🛍️👗), Ñoño.

**Test Steps**
1. Mở trang chủ storefront
2. Nhập lần lượt các chuỗi Unicode ('áéíóú', '日本語', '👕👗', 'Ñoño') vào ô search
3. Nhấn Enter và kiểm tra HTTP status/mã lỗi

**Expected Results**
1. Server xử lý bình thường, trả về trang kết quả (hoặc thông báo không tìm thấy), không phát sinh lỗi HTTP 500 hoặc Crash.

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Defect Input Validation: Kiểm tra khả năng xử lý UTF-8 đa byte và emoji của backend search query.

---

### 29. DEF_Search_05 — Kiểm tra trạng thái bộ lọc khi sử dụng nút Back của trình duyệt (State Management)

| Field | Specification |
|---|---|
| Test Case ID | `DEF_Search_05` |
| Test Case Description | Kiểm tra trạng thái bộ lọc khi sử dụng nút Back của trình duyệt (State Management) |
| Inter-test Case Dependence | Không |
| Recorded Status | **PASSED** |
| Test Date | 2026-11-12 |

**Preconditions**
- Storefront hoạt động bình thường.

**Test Data**
- Bắt đầu tại /fashion/?price=20-50; điều hướng sang /electronics/ rồi dùng Browser Back.

**Test Steps**
1. Truy cập /fashion/?price=20-50
2. Điều hướng sang trang /electronics/
3. Nhấn nút Back trên trình duyệt
4. Kiểm tra URL và trạng thái bộ lọc

**Expected Results**
1. Trình duyệt quay lại trang /fashion/ với đầy đủ tham số price=20-50 và danh sách sản phẩm vẫn áp dụng đúng bộ lọc.

**Recorded Actual Result**
> PASSED - Playwright completed this testcase in the attached Chromium run.

**Execution Note**
> Defect State Management: Kiểm tra tính toàn vẹn trạng thái bộ lọc khi người dùng duyệt lịch sử browser history.

---

## 5. Status Handling and Traceability

- `PASSED`: testcase được ghi nhận Passed trong workbook.
- `FAILED`: testcase được ghi nhận Failed; không tự đổi trạng thái dù source có assertion hoặc mô tả khác.
- `BLOCKED`: testcase chưa thể hoàn tất do thiếu điều kiện môi trường, payment, dữ liệu QA hoặc điều kiện phụ thuộc.
- `SKIPPED`: testcase được chủ động bỏ qua theo giới hạn môi trường/cấu hình; không tính là Passed.
- Dependency được giữ nguyên theo cột Inter-test case Dependence của workbook; đây là quan hệ được ghi nhận trong test data, không đồng nghĩa Playwright tự động chạy theo thứ tự phụ thuộc.
- Tên sản phẩm, tài khoản, email inbox và giá trị QA động cần được xác minh trong `support.cjs`/environment khi tái thực thi.
