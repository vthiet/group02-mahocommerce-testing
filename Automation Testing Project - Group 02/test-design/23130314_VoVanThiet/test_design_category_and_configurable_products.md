# Test Design Matrix: Category & Configurable Product Catalog (MahoCommerce)

**Project:** MahoCommerce Automation Testing  
**Tool Target:** Playwright (TypeScript)  
**Environment:** Local MahoCommerce project in `maho/`  
**Module:** Admin Category Tree, Configurable Product Variants, Storefront Variant Selection  
**Methodology:** Equivalence Partitioning (EP), Boundary Value Analysis (BVA), State Transition, End-to-End

> Scope deliberately excludes generic product CRUD, product grid search/sorting, simple product validation, and general storefront search; those are covered by other Group 02 assignments. Detailed specs are references for prerequisites and expected local wording, not a required one-to-one case list.

## 1. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Note / Automation Strategy (Playwright) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Catalog Structure & Variant Selection** | **1.1 Category Tree** | Root and nested tree rendering | Verify a category at depth 3 is shown under the correct parent chain in Admin. | Function | Create unique root/child/leaf fixtures; assert tree ancestry by locator containment, not indentation pixels. |
|  |  | Sibling ordering | Create two children with distinct positions and verify storefront/admin ordering follows configured position. | Function | Set position fields in fixture setup; assert rendered labels sequence. |
|  |  | Move category to another parent | Change a leaf category's parent and verify it leaves the old branch and appears under the new branch. | State Transition | Reopen tree after save; assert exactly one occurrence and expected ancestry. |
|  |  | Disable parent branch | Disable a parent that has an active child; verify neither branch is navigable from storefront menus. | End-to-End | Use generated category URL/menu link; distinguish hidden navigation from direct URL behavior. |
|  |  | Re-enable category | Re-enable the same category and verify it returns to the storefront navigation after refresh/index update. | State Transition | Assert Admin active state and storefront presence; no fixed delay. |
|  |  | Delete category with children | Attempt deletion of a non-leaf category and verify the application blocks it or applies the observed documented behavior without orphaning descendants. | Negative | Use disposable tree; assert user-visible result and tree integrity. |
|  |  | Delete category assigned products | Delete a category containing assigned fixtures; verify product records remain and category assignment behavior is consistent. | Function | Confirm product still opens by direct PDP; do not assert database-only outcome. |
|  |  | Category URL key change | Change URL key and verify old/new route behavior follows configured redirect/URL rewrite behavior. | End-to-End | Capture old route before edit; assert new route resolves to target category. |
|  | **1.2 Configurable Attributes & Variants** | Attribute eligibility | Verify only attributes configured for global scope and configurable use are offered in the configurable-product wizard. | Function | Prepare one eligible and one ineligible dropdown attribute; inspect wizard choices. |
|  |  | Missing required variant attribute | Attempt to create configurable parent without selecting a required configurable attribute. | Negative | Assert wizard validation and that no parent is saved. |
|  |  | Variant combination coverage | Create parent with Color × Size variants and verify each valid combination is selectable. | E2E | Use unique fixture variants; select each option combination on PDP. |
|  |  | Incomplete combination | Configure a matrix with one absent Color/Size combination; verify unavailable combination cannot be added to cart. | Negative | Check disabled/unavailable option state and prevent add-to-cart. |
|  |  | Disabled child variant | Disable one associated simple child; verify it is not purchasable through the parent PDP while other children remain selectable. | E2E | Compare enabled and disabled child options in the same fixture. |
|  |  | Out-of-stock child variant | Set one child to zero stock; verify only that selection is unavailable and an in-stock sibling remains purchasable. | E2E | Keep parent enabled and stocked; assert per-variant availability. |
|  |  | Child image switch | Select a variant with a distinct assigned image and verify gallery image changes to the child's image. | E2E | Use visibly distinct fixture images and assert active image URL/alt. |
|  |  | Option surcharge | Select an option with explicit configurable option price and verify displayed price changes by that surcharge. | BVA | Include zero-surcharge sibling as baseline; compare numeric minor units. |
|  |  | Child price is not option surcharge | Set child simple product price differently but no parent option surcharge; verify parent price follows configurable pricing rules, not an assumed child-price substitution. | Function | Assert only after fixture configuration is confirmed in local Maho. |
|  |  | Variant selection persistence | Select variant, change quantity, and verify selected options remain selected before adding to cart. | Function | Assert selected form values after quantity interaction. |
|  |  | Add selected variant | Add a selected Color/Size combination and verify cart line identifies the chosen options. | E2E | Unique configurable SKU; assert cart item options, not just parent title. |
|  |  | Listing swatch availability | Verify listing swatches appear only when enabled for the active store view and product has valid variants. | Configuration | Treat disabled config as a setup skip; assert swatch option changes target PDP selection. |
|  |  | Parent without associated variants | Remove/unlink all variants and verify parent is not presented as purchasable. | Negative | Assert no valid option selection/add-to-cart path. |
|  | **1.3 Category-to-Variant Integration** | Configurable listing assignment | Assign configurable parent to a nested active category and verify one parent card appears in that category listing. | E2E | Ensure parent visibility/indexing; assert no duplicate child cards. |
|  |  | Disabled category direct URL | Open a disabled category URL directly and verify configured storefront response (not listed/redirect/not found) consistently. | Negative | Record local expected behavior before fixing assertion. |
|  |  | Category breadcrumb hierarchy | Navigate nested category → configurable PDP and verify breadcrumb chain represents category ancestry. | E2E | Use menu navigation and assert breadcrumb labels in order. |

## 2. Playwright Automation Guidelines

1. Use unique category names and variant SKUs per run; prepare configurable attributes, product associations, stock, and images through fixture setup. The behavior under test remains a browser interaction.
2. Assert tree relationships through accessible names and parent-child DOM structure. Avoid brittle coordinates and image pixel comparisons.
3. Wait for the saved category/product result or storefront response/indexed content. Do not depend on arbitrary sleeps or sample entity IDs.
4. Keep category lifecycle tests separate from configurable variant tests except the explicit integration rows. Cleanup only records created by the run.
5. Store view, URL suffix, swatch configuration, currency, and stock presentation are installation settings; read them as test configuration and do not hardcode assumptions.
