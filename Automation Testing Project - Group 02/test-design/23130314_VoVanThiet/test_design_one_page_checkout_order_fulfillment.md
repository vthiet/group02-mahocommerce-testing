# Test Design Matrix: One-Page Checkout & Order Fulfillment (MahoCommerce)

**Project:** MahoCommerce Automation Testing  
**Tool Target:** Playwright (TypeScript)  
**Environment:** Local MahoCommerce project in `maho/`  
**Module:** One-Page Checkout Step Transitions, Order Review, Admin Invoice/Shipment/Cancel  
**Methodology:** State Transition, Decision Table, End-to-End, Boundary Value Analysis

> Scope is the one-page checkout orchestration and Admin order fulfillment lifecycle. Generic cart CRUD/quantity BVA, login/account management, checkout field validation, order-number uniqueness/double-submit, and coupon behavior are assigned elsewhere and are intentionally excluded.

## 1. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Note / Automation Strategy (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2. One-Page Checkout & Fulfillment** | **2.1 Guest Checkout Flow** | Checkout entry | Verify a guest with a shippable cart enters the configured one-page checkout and sees the active first step. | E2E | Do not assume a separate guest/account-choice screen; assert visible local step. |
|  |  | Same billing/shipping address | Submit billing with “ship to this address” and verify shipping-address step is skipped when the configured flow supports it. | State Transition | Assert next active step semantically; do not hardcode number/order of accordion panels. |
|  |  | Different shipping address | Choose a different shipping address and verify checkout opens the shipping-address step before shipping method. | State Transition | Use distinct billing/shipping fixture values and compare review summary. |
|  |  | Shipping method transition | Select an available shipping method and verify the next payment step becomes active. | State Transition | Wait for checkout request completion plus visible active step. |
|  |  | No available shipping rate | Use destination/product with no matching carrier rate and verify checkout cannot proceed to payment/review. | Negative | Assert a visible explanation and no order submission path. |
|  |  | Payment method transition | Select an enabled offline method and verify order review becomes available with selected method retained. | State Transition | Restrict to a deterministic local payment method; assert summary selection. |
|  |  | Payment method unavailable | Disable the configured method and verify it is absent and cannot be submitted from checkout. | Negative | Fresh context/cart; test environment must support toggling method. |
|  |  | Backward step navigation | Return from payment to shipping and verify prior address/method selections persist or reset according to actual flow. | State Transition | Characterize once on local Maho, then encode a single expected result. |
|  |  | Refresh during checkout | Reload after shipping selection and verify checkout recovers valid quote/step state without duplicating an order. | Defect / Recovery | Capture current step; assert no order exists until explicit place-order action. |
|  |  | Order review content | Verify item options, quantities, billing/shipping address, shipping method, payment method, and totals agree with prior selections. | E2E | Compare structured visible fields; totals include configured tax/discount/shipping components. |
|  |  | Place order from review | Submit once from review and verify success page exposes a generated order reference. | E2E | Capture increment ID dynamically; no assumed numeric length or sequence. |
|  | **2.2 Registered Checkout Differences** | Saved default address | Verify saved billing/shipping address is preselected for a signed-in customer with default addresses. | E2E | Seed account/address fixture; avoid testing authentication itself. |
|  |  | Select alternate saved address | Switch to a non-default address and verify review uses the selected address. | Function | Compare address summary with the selected address record. |
|  |  | Add address during checkout | Add a new shipping address and verify it is used for the order and persisted when “save to address book” is enabled. | E2E | Check persistence in address book only as checkout side effect; avoid broad address CRUD. |
|  |  | No saved address | Start signed-in checkout without saved addresses and verify required address entry path is available. | Negative / Recovery | Ensure checkout does not dead-end or silently substitute unrelated data. |
|  | **2.3 Admin Order Fulfillment** | Find placed order | Search Admin Sales > Orders using captured increment ID and verify order/customer/items match checkout. | E2E | Use Admin page object/session; filter by exact run-created ID. |
|  |  | Create full invoice | Invoice all ordered quantities and verify invoice document lists correct items, quantities, and totals. | Function | Assert invoice record/detail; order state advances to processing as applicable. |
|  |  | Partial invoice | Invoice less than ordered quantity and verify remaining invoice quantity is still available. | BVA / State Transition | Use quantity 2; invoice 1; assert remaining quantity 1. |
|  |  | Prevent over-invoicing | Attempt to invoice more than remaining quantity and verify UI blocks the excess. | Negative / BVA | Exercise remaining quantity boundary; assert no excess invoice item. |
|  |  | Partial shipment | Ship fewer than invoiced/ordered units and verify remaining shippable quantity is retained. | BVA / State Transition | Use multi-unit order; assert shipment item quantity and remaining amount. |
|  |  | Add shipment tracking | Add carrier and tracking number; verify tracking is attached to shipment detail. | Function | Assert exact run-generated tracking value in Admin shipment details. |
|  |  | Full fulfillment completion | Invoice and ship all eligible quantities; verify order reaches completed state only after required quantities are fulfilled. | State Transition | Assert state/status separately; do not infer completion from shipment creation alone. |
|  |  | Cancel unprocessed order | Cancel a separate uninvoiced order and verify canceled state and unavailable invoice/ship actions. | State Transition | Dedicated order; handle confirmation dialog only if present. |
|  |  | Reject cancel after invoice | Attempt cancellation after invoice creation and verify the action is unavailable or rejected according to local Maho behavior. | Negative | Characterize actual state/action contract; never mutate a shared lifecycle fixture. |
|  |  | Customer shipment visibility | Open customer order detail and verify shipment/tracking information is visible when exposed by active theme. | E2E | Theme-dependent: classify unavailable UI as unsupported for this theme, not failed fulfillment. |

## 2. Playwright Automation Guidelines

1. Keep one fresh browser context/cart and one unique order per lifecycle test. Use captured order increment IDs to join storefront and Admin steps.
2. Model checkout as observable transitions: selected/active step, saved quote details, then visible next step. Do not depend on fixed accordion count, exact selectors from another theme, or fixed sleeps.
3. Use totals rendered in the review as the assertion source; account for configured currency, tax, discount, and shipping. Compare monetary values in minor units.
4. Use a multi-quantity physical fixture for partial invoice/shipment boundaries. Keep invoice, shipment, cancellation, and completion scenarios independent so retries do not inherit state.
5. Separate order state from display status. Confirm local state/status mapping before asserting a label such as “Processing” or “Complete”.
6. Admin invoice/shipment and customer tracking controls vary by permissions/configuration/theme; verify availability during setup and report missing prerequisites clearly.
