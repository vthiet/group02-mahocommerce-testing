# Test Design Matrix: Product & Catalog Management (Maho Commerce)

**Project:** Maho Commerce Automation Testing

**Tool Target:** Playwright (TypeScript/JavaScript)

**Environment:** Localhost (Maho Commerce with Sample Data)

**Module:** Product & Catalog Management (Categories, Products Grid, Simple Products, Stock & Inventory, Frontend Display)

**Methodology:** Equivalence Partitioning (EP) & Boundary Value Analysis (BVA)

---

## 1\. Test Matrix / Test Design Table

| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Test Criteria (Test Case Description) | Test Type | Note / Automation Strategy (Playwright) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **2\. Product & Catalog Management** | **2.1 Categories Management** | Displaying Tree | Check navigation to Manage Categories screen and verify tree structure layout rendering. | Function | Admin menu click \-\> Assert root node & child category tree loaded. |
|  |  | Add Root Category | Check adding a new Root Category with valid fields and Enabled status. | Function | Click Add Root Category \-\> Fill name & status \-\> Click Save \-\> Assert tree updated. |
|  |  | Add Sub-Category | Check adding a Sub-Category under an existing parent category node. | Function | Select parent node \-\> Click Add Sub-category \-\> Save \-\> Verify hierarchy tree. |
|  |  | Edit Category | Check editing Category Name and changing status to Disabled. | Function | Select category node \-\> Modify Name & Status \-\> Save \-\> Verify update in tree & PDP. |
|  |  | Delete Category | Check deleting an empty leaf category and handling confirmation popup dialog. | Function | Click Delete Category \-\> Handle browser confirm (`page.on('dialog')`) \-\> Assert node removed. |
|  | **2.2 Products Grid & Search** | Displaying Grid | Check displaying Manage Products grid with standard default columns (ID, Name, Type, SKU, Price, Qty, Status). | Function | Navigate to Catalog \-\> Manage Products \-\> Assert header column selectors. |
|  |  | Filter by SKU | Check filtering products grid by exact SKU value. | Function | Enter SKU filter \-\> Click Search \-\> Assert grid displays exactly 1 matching row. |
|  |  | Filter by Status | Check filtering products by Status \= "Enabled". | Function | Select Status dropdown \-\> Click Search \-\> Assert all returned rows are Enabled. |
|  |  | Filter by Price Range | Check filtering products by Price range ($Min=10$, $Max=50$). | Function | Fill Min & Max Price input \-\> Search \-\> Assert product prices fall within range ($10\leq P\leq 50$). |
|  |  | Sorting by Name | Check sorting product grid by Name column (Ascending and Descending). | Function | Click column header "Name" twice \-\> Assert row sequence sorting order. |
|  | **2.3 Simple Product Management** | Mandatory Fields | Check validation when creating Simple Product without required field `SKU`. | Function | Leave SKU empty \-\> Submit \-\> Assert validation error message displayed. |
|  |  | Duplicate SKU Validation | Check creating a Simple Product with an already existing SKU. | Function | Enter duplicate SKU \-\> Submit \-\> Assert error message "Product with SKU already exists". |
|  |  | Create Simple Product | Check creating a new valid Simple Product (Name, SKU, Price, Tax Class, Inventory Qty). | Function | Fill General, Prices, and Inventory tabs \-\> Save \-\> Assert success message & item in grid. |
|  |  | Edit Product Details | Check opening existing product, modifying Name and Price, and saving changes. | Function | Open product \-\> Change price \-\> Save \-\> Verify updated value on grid and detail screen. |
|  |  | Inventory Stock Status (BVA) | Check setting Product Qty \= 0 and Stock Availability \= "Out of Stock". | Function | Set Qty \= 0 & Out of Stock \-\> Save \-\> Open Storefront PDP \-\> Assert "Out of Stock" badge. |
|  |  | Special Price Date Range | Check setting Special Price with active start/end date range. | Function | Set Special Price \+ Date range \-\> Save \-\> Open Storefront PDP \-\> Assert discounted price shown. |
|  |  | Image Upload | Check uploading a valid product image file (PNG/JPG) to product gallery. | Function | Use `page.setInputFiles()` \-\> Save \-\> Verify thumbnail image rendered on Admin & PDP. |
|  |  | Delete Product | Check deleting a product from grid list using Mass Action or single action. | Function | Select checkbox \-\> Action: Delete \-\> Confirm alert \-\> Assert row removed from database grid. |
|  | **2.4 Configurable Products & Options** | Create Configurable | Check creating a Configurable Product using attribute set (e.g., Color/Size). | Function | Select Configurable type \-\> Select attribute set \-\> Complete basic product attributes. |
|  |  | Associate Variants | Check associating existing Simple Products as variants to Configurable Product. | Function | Open Associated Products tab \-\> Select simple items \-\> Save \-\> Assert options configured. |
|  | **2.5 Storefront Display & E2E Interaction** | Category Page Listing | Check displaying created/enabled products on Storefront Category Listing page (PLP). | End-to-End | Navigate to Storefront category \-\> Assert product card, title, image, and price match DB. |
|  |  | Product Detail Page (PDP) | Check opening Product Detail Page and verifying description, SKU, stock status, and price. | End-to-End | Click product card \-\> Verify PDP DOM components loaded properly. |
|  |  | Add Product to Cart | Check selecting product quantity and clicking \[Add to Cart\] button on PDP. | End-to-End | Input quantity \-\> Click Add to Cart \-\> Assert cart block counter updated & success banner shown. |
|  |  | Configurable Swatches Switch | Check selecting variant swatches (Color: Red, Size: M) on Configurable PDP. | End-to-End | Click attribute options \-\> Assert dynamic price update and main image change. |
|  |  | Frontend Search Bar | Check searching for a product by keyword via Storefront top search bar. | End-to-End | Type keyword into search input \-\> Submit \-\> Verify search results page contains target item. |

---

## 2\. Playwright Automation Implementation Guidelines

1. **Handling Admin Navigation & Async Grids:**  
   - Maho Commerce relies on Prototype.js AJAX for grid filtering. Always wait for grid response after applying filters:

```ts
await Promise.all([
  page.waitForResponse(res => res.url().includes('grid') && res.status() === 200),
  page.click('button[title="Search"]')
]);
```

2. **Uploading Product Files:**  
   - Use Playwright's native `setInputFiles` method:

```ts
await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-product.jpg');
```

3. **Storefront vs Admin Contexts:**  
   - Keep Admin logged in session in one context (`adminContext`) and use a clean browser context (`storefrontContext`) to verify customer-facing behavior.