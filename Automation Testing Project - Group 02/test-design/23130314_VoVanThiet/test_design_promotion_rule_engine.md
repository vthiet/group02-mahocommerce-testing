# Test Design Matrix: Promotion Rule Engine (MahoCommerce)

**Project:** MahoCommerce Automation Testing  
**Tool Target:** Playwright (TypeScript)  
**Environment:** Local MahoCommerce project in `maho/`  
**Module:** Catalog Price Rule Evaluation and Automatic Cart Rule Evaluation  
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Decision Table, State Transition, End-to-End

> Scope focuses on rule evaluation and precedence. Coupon creation, coupon field validation, coupon input trimming/security, and generic coupon apply/remove flows belong to the Group 02 Coupon feature and are not duplicated here.

## 1. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Note / Automation Strategy (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3. Promotion Rule Evaluation** | **3.1 Catalog Price Rule Eligibility** | Website scope match | Verify active rule changes price on assigned website but does not change price on a website outside its scope. | E2E | Use same fixture product assigned to two websites/store views; compare rendered prices. |
|  |  | Customer group scope | Verify rule applies to targeted customer group and not to a non-target group. | E2E | Use guest vs logged-in customer contexts configured for distinct groups. |
|  |  | Active date lower boundary | Verify rule is eligible on its configured start date in store timezone. | BVA | Freeze/setup date safely; assert localized storefront amount. |
|  |  | Active date upper boundary | Verify rule is eligible through configured end date and inactive after it. | BVA | Test boundary dates independently; avoid dependence on wall-clock rollover. |
|  |  | Inactive rule | Verify disabled catalog rule has no effect even when product/customer/date conditions match. | Negative | Compare baseline price to post-disable price after rule application/indexing. |
|  |  | Product condition match | Rule condition for attribute A changes only fixture products matching A. | Decision Table | One matching and one nonmatching product; assert both PDP prices. |
|  |  | Category condition match | Category-scoped rule affects assigned product and excludes a similar unassigned product. | E2E | Seed explicit category/product assignments; avoid sample category IDs. |
|  | **3.2 Catalog Price Calculation & Precedence** | Percentage discount calculation | Verify percentage action yields expected effective price from regular price. | BVA | Choose price divisible to avoid fractional ambiguity; assert currency-rounded amount. |
|  |  | Fixed amount discount | Verify fixed amount action reduces eligible price by configured amount, subject to rule semantics. | Function | Include a price greater than discount; assert displayed regular/special pricing. |
|  |  | Discount lower boundary | Configure discount zero and verify effective price remains baseline. | BVA | Confirm zero is accepted by local rule form before asserting. |
|  |  | Discount upper boundary | Configure maximum supported discount and verify price does not become negative. | BVA | Determine accepted maximum from form/engine; keep expected behavior specific to Maho. |
|  |  | Rule priority | Apply two eligible rules with distinct discounts and verify lower numeric priority wins according to local Maho ordering. | Decision Table | Isolate product and customer group; confirm actual ordering before locking expected amount. |
|  |  | Discard subsequent catalog rules | With first rule's discard flag enabled, verify whether lower-priority eligible rule is skipped. | Decision Table | This is a capability-confirmation case; expected result must be confirmed on installed Maho version. |
|  |  | Reapply after rule edit | Change discount amount and apply/reindex; verify storefront updates from old to new effective price. | State Transition | Assert eventual UI value with bounded polling, not fixed sleep. |
|  |  | Rule deletion | Delete a rule and verify the product returns to the baseline price after rule/index refresh. | State Transition | Unique test rule; do not assert only that Admin row disappeared. |
|  | **3.3 Automatic Cart Rule Conditions** | Subtotal threshold below/at/above | Verify automatic discount behavior at threshold − smallest currency unit, exactly threshold, and threshold + smallest unit. | BVA | Use products that produce exact totals; assert discount amount for each isolated cart. |
|  |  | Item quantity threshold | Verify eligibility at quantity N−1 and N for a quantity-based condition. | BVA | Change only quantity; assert UI discount appears at expected boundary. |
|  |  | Category eligibility in mixed cart | Verify matching item receives rule treatment while nonmatching line remains unchanged. | Decision Table | Assert line-level discount allocation where exposed; otherwise compare controlled cart totals. |
|  |  | Stop processing rules | Apply two automatic rules with distinct effects; verify later rule is skipped when earlier matching rule has stop-processing enabled. | Decision Table | Separate unique rules, explicit priority, clean cart; verify actual engine behavior locally. |
|  |  | Rule stacking without stop | Apply two compatible rules and verify cumulative result follows configured priority/action semantics. | Decision Table | Keep expected amount calculable; do not infer stacking from another platform. |
|  | **3.4 Cart Rule Actions** | Whole-cart fixed discount cap | Verify fixed discount does not exceed eligible cart amount for a cart below the configured discount. | BVA | Use low-priced eligible item; confirm no negative line/grand total. |
|  |  | Buy X Get Y quantity boundary | For Buy 2 Get 1, verify 2 units earn no free unit and 3 units earn exactly one. | BVA | Use automatic rule and one eligible SKU; inspect line discount/total. |
|  |  | Free-shipping action | Verify eligible rule sets shipping to zero for a supported shipping method and leaves merchandise subtotal unchanged. | E2E | Configure deterministic physical item and rate; do not assume per-item waiver semantics. |
|  |  | Discount with tax | Verify cart discount and tax totals are consistent with configured tax calculation mode. | Function | Parameterize expected tax behavior from store setup; compare rendered component totals. |

## 2. Playwright Automation Guidelines

1. Build rules and products as run-scoped fixtures; set website, customer groups, dates, conditions, action, priority, and status explicitly. Clean up rules and carts after each test.
2. For each eligibility rule, use a positive and negative control in the same configuration. For threshold rules, cover below/at/above values using the smallest supported currency unit.
3. Use storefront price and cart total components as the oracle. Admin success notifications and database rows do not prove rule evaluation.
4. Refresh/reindex through supported local setup before storefront assertions. Poll for the expected rendered amount with a bounded timeout.
5. Rule priority, discard/stop behavior, tax interaction, and free-shipping granularity must be characterized against Maho 26.9.3 in `maho/`; do not assume Magento behavior without confirmation.
