# Test Design Matrix: Shopping Cart & Order Placement (Maho Commerce)

**Project:** Maho Commerce Automation Testing  
**Tool Target:** Playwright (TypeScript/JavaScript)  
**Environment:** Localhost (Maho Commerce with Sample Data)  
**Module:** Shopping Cart & Order Placement (Cart Management, Dynamic Estimates, Checkout Flow, Order Creation & Admin Invoicing)  
**Methodology:** Equivalence Partitioning (EP) & Boundary Value Analysis (BVA)

---

## 1\. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Note / Automation Strategy (Playwright) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **3\. Shopping Cart & Order Placement** | **3.1 Shopping Cart Management** | Add Item to Cart | Check adding an in-stock product to cart from PDP and verify mini-cart update. | End-to-End | Click Add to Cart \-\> Assert mini-cart item counter and subtotal match product price. |
|  |  | Quantity Adjustment (BVA) | Check updating item quantity in Cart page (increase Qty from 1 to 5). | Function | Fill Qty input \-\> Click Update Shopping Cart \-\> Assert recalculated subtotal ($5\times Price$). |
|  |  | Invalid Quantity Input | Check entering invalid quantity ($0$ or negative) in cart and clicking update. | Function | Enter Qty \= 0 \-\> Submit \-\> Assert item removal or dynamic error banner. |
|  |  | Exceed Stock Quantity | Check entering quantity exceeding available stock (e.g., Qty \= 9999). | Function | Enter Qty \= 9999 \-\> Click Update \-\> Assert error message *"The requested quantity is not available"*. |
|  |  | Remove Item from Cart | Check removing an item from Shopping Cart using delete icon/link. | Function | Click remove button \-\> Assert item disappears and empty cart message displayed. |
|  |  | Clear Shopping Cart | Check clearing all items in cart using \[Clear Shopping Cart\] action. | Function | Click Clear Cart button \-\> Confirm alert \-\> Assert cart empty view loaded. |
|  |  | Cross-sell Display | Check displaying cross-sell products block on cart page based on cart contents. | Function | Add specific item \-\> Open cart page \-\> Assert Cross-sell items slider/grid rendered. |
|  |  | Navigation Back | Check \[Continue Shopping\] button redirects user back to last visited category/store page. | Function | Click Continue Shopping \-\> Verify current URL matches previous category/store path. |
|  | **3.2 Shipping & Tax Estimation** | Shipping Estimation | Check calculating shipping estimates by selecting Country, State/Province, and Zip Code. | Function | Select Country & State \-\> Click Estimate \-\> Assert available shipping methods & rates populate. |
|  |  | Shipping Method Selection | Check selecting Flat Rate shipping method and verifying grand total recalculation. | Function | Select Flat Rate radio \-\> Click Update Total \-\> Assert Grand Total \= Subtotal \+ Shipping Fee. |
|  | **3.3 One-Page Checkout (Guest)** | Checkout Initialization | Check proceeding to Checkout as a Guest user from Shopping Cart. | End-to-End | Click Proceed to Checkout \-\> Select "Checkout as Guest" \-\> Assert Billing Address form rendered. |
|  |  | Mandatory Billing Fields | Check validation errors when submitting Guest Billing Address form with missing required fields. | Function | Leave Name/Address empty \-\> Click Continue \-\> Assert validation field highlights. |
|  |  | Valid Billing Address | Check entering valid Guest Billing Address and proceeding to Shipping step. | End-to-End | Fill mandatory billing inputs \-\> Click Continue \-\> Assert Step 2 (Shipping Method) active. |
|  |  | Shipping Method Step | Check selecting shipping option (Fixed vs Table Rate) in Step 2\. | End-to-End | Select radio button \-\> Click Continue \-\> Assert Step 3 (Payment Information) loaded. |
|  |  | Payment Method Step | Check selecting Payment Method (Cash on Delivery / Check Money Order). | End-to-End | Select Cash on Delivery \-\> Click Continue \-\> Assert Step 4 (Order Review) loaded. |
|  |  | Order Review Calculation | Check verifying item breakdown, shipping fee, tax, and Grand Total in Order Review step. | End-to-End | Read summary values from DOM \-\> Assert $GrandTotal=Subtotal+Shipping+Tax-Discount$. |
|  |  | Place Order (Guest E2E) | Check clicking \[Place Order\] button to complete Guest Checkout flow. | End-to-End | Click Place Order \-\> Assert redirected to Success Page \-\> Capture Order ID (e.g., `#100000001`). |
|  | **3.4 Registered User Checkout** | Checkout as Registered User | Check proceeding to checkout using pre-saved address from logged-in customer account. | End-to-End | Login customer context \-\> Proceed to checkout \-\> Select saved address \-\> Continue. |
|  |  | Add New Address | Check adding a new shipping address during checkout flow for logged-in user. | End-to-End | Select "New Address" from dropdown \-\> Fill details \-\> Continue \-\> Verify address saved. |
|  |  | Place Order (Customer E2E) | Check completing order placement as logged-in customer and verifying order history. | End-to-End | Complete order \-\> Navigate to Customer Account \> My Orders \-\> Assert Order ID listed. |
|  | **3.5 Admin Order Management & Processing** | Admin View Order | Check viewing placed order details in Admin Panel (`Sales` \> `Orders`). | Function | Open Admin Orders grid \-\> Search Order ID \-\> Assert Status \= "Pending", items match order. |
|  |  | Generate Invoice | Check creating an Invoice for the pending order from Admin panel. | Function | Open order \-\> Click \[Invoice\] \-\> Submit Invoice \-\> Assert status changes from Pending to Processing. |
|  |  | Generate Shipment | Check creating a Shipment with tracking number for the order. | Function | Open order \-\> Click \[Ship\] \-\> Enter carrier & tracking code \-\> Submit \-\> Assert Status \= Complete. |
|  |  | Cancel Order | Check canceling a Pending order from Admin panel before invoice creation. | Function | Open pending order \-\> Click \[Cancel\] \-\> Confirm alert \-\> Assert order status \= Canceled. |
|  |  | Customer Order View | Check customer receiving order confirmation and status update in Frontend Account area. | End-to-End | Open My Account \> My Orders in customer context \-\> Verify status reflects "Complete" or "Processing". |

---

## 2\. Playwright Automation Guidelines & Best Practices

1. **One-Page Checkout Accordion Handling (Maho/Magento 1.x):**

   - Checkout in Maho Commerce uses an accordion architecture where sections unlock via AJAX calls. Playwright must explicitly wait for animation/AJAX step transitions:

```ts
await page.click('#billing-buttons-container button');
await page.waitForSelector('#opc-shipping_method.active', { state: 'visible' });
```

2. **Capturing & Passing Dynamic Data (Order ID):**

   - Extract the generated Order Increment ID from the success page regex to reuse in Admin validation steps:

```ts
const orderSuccessText = await page.textContent('.main-container');
const orderId = orderSuccessText.match(/#?(\d{9})/)[1];
```

3. **Multi-Role Context Switching:**

   - Use `storefrontContext` to place the order and `adminContext` to verify, invoice, and ship the order within the same test suite execution.