# Test Design Document: Promotion Management (Maho Commerce)

**Project:** Maho Commerce Automation Testing  
**Tool Target:** Playwright  
**Module:** Promotions (Catalog Price Rules & Shopping Cart Price Rules)  
**Methodology:** Equivalence Partitioning (EP) & Boundary Value Analysis (BVA)

---

## 1\. Overview & Strategy

Chức năng Quản lý Khuyến mãi (Promotions) trên Maho Commerce bao gồm 2 mảng chính:

1. **Catalog Price Rules (Quy tắc giá danh mục):** Giảm giá trực tiếp trên sản phẩm hiển thị tại Catalog/PDP/PLP.  
2. **Shopping Cart Price Rules (Quy tắc giá giỏ hàng & Coupon):** Giảm giá áp dụng tại Giỏ hàng/Checkout dựa trên điều kiện tổng đơn hàng hoặc Mã giảm giá (Coupon Code).

Để tối ưu hóa số lượng test case tự động hóa bằng Playwright, các test case được thiết kế tuân thủ nguyên tắc: **Mỗi lớp tương đương (Equivalence Class) có cùng kết quả mong đợi chỉ đại diện bằng 1 Test Case.**

---

## 2\. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Execution Strategy / Automation Note (Playwright) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **1\. Promotions & Discounts** | **1.1 Catalog Price Rules** | Displaying & Grid Layout | Verify navigation to Catalog Price Rules grid and default layout displaying columns (Rule Name, Start Date, End Date, Status, Website). | Function | Navigate via Admin Menu \-\> Check grid header visibility. |
|  |  | Filtering | Filter rules by Status \= "Active" and verify grid displays only active rules. | Function | Select dropdown filter \-\> Wait for AJAX response \-\> Assert table rows. |
|  |  | Mandatory Fields | Create a new Catalog Rule without entering mandatory field `Rule Name` \-\> Verify validation error message is shown. | Function | Fill partial form \-\> Click \[Save\] \-\> Assert HTML5 / JS validation error DOM elements. |
|  |  | Date Range Validation | Create Rule with Date Range (Start Date $\leq$ Today $\leq$ End Date) and Apply \-\> Verify discount price reflects on Frontend Product Detail Page (PDP). | End-to-End | Create rule in Admin \-\> Save & Apply \-\> Open PDP in new context \-\> Assert original vs discounted price. |
|  |  | Excluded Date Range | Create Rule with Start Date \> Today (Future rule) \-\> Verify regular price is shown on Frontend PDP. | Function | Create future rule \-\> Save \-\> Open PDP \-\> Assert standard price is displayed. |
|  |  | Discount Calculation Types | Create Rule with "By Percentage" discount (e.g., 20% off) \-\> Apply and check product price calculation logic ($Pric{e}_{new}=Pric{e}_{old}\times 0.8$). | Function | Verify price math logic on PDP/PLP. |
|  |  | Priority & Precedence | Create 2 overlapping rules on the same product; set Rule A (Priority 1, Stop Further Rules \= Yes), Rule B (Priority 2\) \-\> Verify only Rule A applies on PDP. | Function | Test rule precedence engine. |
|  |  | Apply Rules Action | Click \[Save and Apply\] button \-\> Verify system triggers reindex/rule application process successfully. | Function | Assert success alert message: *"The rules have been applied."* |
|  |  | Deleting Rule | Select existing Rule \-\> Click \[Delete\] \-\> Confirm alert \-\> Verify rule disappears from grid. | Function | Handle JS browser dialog (`page.on('dialog')`) \-\> Assert row removed. |
|  | **1.2 Shopping Cart Price Rules** | Displaying & Grid Layout | Verify navigation to Shopping Cart Price Rules grid and display of rule lists. | Function | Check table structure and pagination elements. |
|  |  | Searching | Search Shopping Cart Rule by specific Rule Name \-\> Verify grid filters exact match. | Function | Enter text into grid search input \-\> Press Enter \-\> Assert 1 row returned. |
|  |  | Coupon Application | Create rule with Specific Coupon Code `SUMMER2026` \-\> Apply code at Storefront Cart page \-\> Verify discount is applied to cart subtotal. | End-to-End | Admin setup \-\> Frontend add item to cart \-\> Fill coupon input \-\> Assert success message & updated total. |
|  |  | Invalid Coupon Validation | Apply non-existent coupon code `INVALIDCODE` at Storefront Cart \-\> Verify error message *"Coupon code is not valid."* | Function | Storefront cart \-\> Fill invalid input \-\> Click apply \-\> Assert error banner. |
|  |  | Auto Generation Coupons | Create rule with "Use Auto Generation" \-\> Generate batch of 5 coupon codes \-\> Verify codes are listed in Coupon Codes tab. | Function | Go to Coupon Code tab in Admin \-\> Fill generation options \-\> Click Generate \-\> Assert table populated. |
|  |  | Subtotal Conditions | Set rule condition: Apply discount IF $Cart\ Subtotal \ge \$100$ \-\> Verify cart with \$80 gets NO discount, cart with \$150 GETS discount. | Function | Add products to cart to reach boundary limits (\$80 vs \$150). |
|  |  | Product Category Conditions | Set rule condition based on Category ID \-\> Add 1 item from category and 1 item outside category \-\> Verify discount applies only to matching item. | Function | Verify rule scope filtering logic in cart item breakdown. |
|  |  | Quantity Conditions | Set rule condition: $Total\ Items\ Quantity\geq 3$ \-\> Add 2 items (No discount), increase to 3 items (Discount applies). | Function | Intersect boundary value ($N-1$, $N$). |
|  |  | Customer Usage Limits | Set "Uses per Customer" \= 1 \-\> Customer A uses coupon once successfully \-\> Try to use again in 2nd order \-\> Verify error. | End-to-End | Complete Checkout order 1 \-\> Create order 2 with same account \-\> Assert coupon rejected. |
|  |  | Global Coupon Usage Limits | Set "Uses per Coupon" \= 1 (Global limit) \-\> Customer A uses coupon \-\> Customer B tries to use same coupon \-\> Verify coupon expired message. | End-to-End | Use multi-context in Playwright (`browser.newContext()`) to simulate 2 different users. |
|  |  | Fixed Amount Discount Action | Set Action \= "Fixed amount discount for whole cart" (\$15 off) \-\> Verify Order Total \= Subtotal \- \$15 \+ Tax/Shipping. | Function | Assert calculated totals breakdown in cart summary table. |
|  |  | Free Shipping Action | Set Action \= "Free Shipping for matching items only" \-\> Apply coupon \-\> Verify shipping fee changes to \$0.00. | End-to-End | Check shipping estimate block dynamically recalculates fee to 0\. |
|  |  | Buy X Get Y Action | Set Action \= "Buy 2 Get 1 Free" \-\> Add 3 identical items to cart \-\> Verify 1 item price is discounted 100%. | Function | Calculate item quantity vs subtotal discount balance. |
|  |  | Rule Inactivation | Change Shopping Cart Rule status to "Inactive" \-\> Try to apply coupon code on Storefront \-\> Verify system rejects code. | Function | Toggle switch in Admin \-\> Check frontend behavior. |
|  |  | Stop Further Rules Logic | Combine 2 active Shopping Cart rules; set Rule 1 with "Stop Further Rules Processing \= Yes" \-\> Verify Rule 2 is skipped at Cart. | Function | Verify rule chain execution stops when flag is set. |

---

## 3\. Playwright Automation Guidelines & Best Practices for Maho Commerce

1. **Admin Login Setup (Global Setup):**  
   * Sử dụng `storageState` của Playwright để lưu session đăng nhập Admin (tránh phải thực hiện đăng nhập ở mọi test case).  
2. **Handling Dynamic Async Updates (AJAX):**  
   * Maho Commerce/Magento 1.x phụ thuộc nhiều vào Prototype.js và Prototype AJAX. Cần dùng `page.waitForResponse()` hoặc `page.waitForSelector()` cho các khu vực loading/spinner trước khi thực hiện assertion.  
3. **Multi-context Testing (Dành cho Coupon Limit):**  
   * Dùng `const userA = await browser.newContext();` và `const userB = await browser.newContext();` để mô phỏng hai khách hàng mua hàng đồng thời nhằm kiểm thử hạn ngạch mã giảm giá.  
4. **Calculations Assertion:**  
   * Sử dụng helper function làm tròn số thực để so sánh giá tiền:

```ts
const formatPrice = (priceStr: string) => parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
expect(formatPrice(cartTotal)).toBe(expectedTotal);
```

&nbsp;