import { test, expect } from '../fixtures/product-management-fixtures';
import type { TestInfo } from '@playwright/test';
import { productManagementData as data } from '../data/product-management-data';
import { openSlowPage } from '../support/slow-page';

async function skipWithout(testInfo: TestInfo, keys: string[]): Promise<void> {
  const missing = keys.filter(key => !process.env[key]);
  if (missing.length) testInfo.skip(true, `Configure ${missing.join(', ')} for this local Maho scenario.`);
}

function storeDateOffset(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: process.env.PW_PM_STORE_TIMEZONE ?? 'UTC',
    month: '2-digit', day: '2-digit', year: 'numeric',
  }).format(date);
}

test.describe('Product and catalog management', () => {
  test.describe.configure({ mode: 'default' });

  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(45_000);
    page.setDefaultNavigationTimeout(60_000);
  });

  test.afterAll(async ({ browser }) => {
    if (!data.adminUsername || !data.adminPassword) return;
    const page = await browser.newPage();
    page.setDefaultTimeout(45_000);
    page.setDefaultNavigationTimeout(60_000);
    try {
      const { AdminSession } = await import('../pages/admin-session');
      const { CategoryManagementPage } = await import('../pages/category-management-page');
      const { ProductManagementPage } = await import('../pages/product-management-page');
      await new AdminSession(page).login();
      const products = new ProductManagementPage(page);
      for (const sku of [data.fixtureSku, data.productSku, data.deleteProductSku, ...data.priceFixtureSkus, `PW-PM-CONFIG-${data.runId}`]) {
        await products.massDeleteSku(sku);
      }
      const categories = new CategoryManagementPage(page);
      await categories.open();
      for (const name of [data.editedSubCategoryName, data.subCategoryName]) {
        const child = categories.tree.getByText(name, { exact: true }).first();
        if (await child.count()) {
          await categories.selectCategory(name);
          await categories.deleteSelected();
        }
      }
      const root = categories.tree.getByText(data.rootCategoryName, { exact: true }).first();
      if (await root.count()) {
        await categories.selectCategory(data.rootCategoryName);
        await categories.deleteSelected();
      }
    } finally {
      await page.close();
    }
  });

  test('ProdCat-01: opens Manage Categories with category tree and detail form', async ({ adminSession, categories }) => {
    void adminSession;
    await categories.open();
    await expect(categories.tree).toContainText(/Default Category/i);
    await expect(categories.form).toBeVisible();
  });

  test.describe('category lifecycle', () => {
    test.describe.configure({ mode: 'serial' });

    test('ProdCat-02: creates a uniquely named root category', async ({ adminSession, categories }) => {
      void adminSession;
      await categories.open();
      await categories.addRoot(data.rootCategoryName);
      await categories.expectCategory(data.rootCategoryName);
    });

    test('ProdCat-03: creates a subcategory under the new root', async ({ adminSession, categories }) => {
      void adminSession;
      await categories.open();
      await categories.addChild(data.rootCategoryName, data.subCategoryName);
      await categories.expectCategory(data.subCategoryName);
    });

    test('ProdCat-04: renames and disables the subcategory', async ({ adminSession, categories, page }, testInfo) => {
      void adminSession;
      await categories.open();
      await categories.selectCategory(data.subCategoryName);
      await categories.renameAndSetActive(data.editedSubCategoryName, false);
      await categories.expectCategory(data.editedSubCategoryName);
      await expect(categories.form.locator('select[name="general[is_active]"]')).toHaveValue('0');

      if (data.categoryUrl) {
        await openSlowPage(page, data.storefrontHomeUrl);
        const navigation = page.locator('nav, #nav, .nav-container').first();
        if (await navigation.count()) await expect(navigation.getByRole('link', { name: data.editedSubCategoryName, exact: true })).toHaveCount(0);
      } else {
        testInfo.annotations.push({ type: 'setup-note', description: 'Set PW_PM_CATEGORY_URL to also check storefront navigation visibility.' });
      }
    });

    test('ProdCat-05: deletes the empty leaf category after confirmation', async ({ adminSession, categories }) => {
      void adminSession;
      await categories.open();
      await categories.selectCategory(data.editedSubCategoryName);
      await categories.deleteSelected();
      await expect(categories.tree.getByText(data.editedSubCategoryName, { exact: true })).toHaveCount(0);
    });
  });

  test('ProdCat-06: displays expected product grid columns and default ID sort', async ({ adminSession, products }) => {
    void adminSession;
    await products.openGrid();
    const headerNames = await products.grid.locator('thead tr.headings th').allTextContents();
    const normalized = headerNames.map(value => value.trim().replace(/\s+/g, ' '));
    for (const expected of ['ID', 'Name', 'Type', 'Attrib. Set Name', 'SKU', 'Price', 'Qty', 'Visibility', 'Status']) {
      expect(normalized.join(' ')).toContain(expected);
    }
    expect(await products.grid.locator('thead th[data-column-id="action"]').count()).toBe(1);
    const idColumn = await products.grid.locator('thead th[data-column-id="entity_id"]').evaluate(el => Array.from(el.parentElement!.children).indexOf(el));
    const ids = await Promise.all((await products.rows.all()).map(async row => Number((await row.locator('td').nth(idColumn).innerText()).trim())));
    if (ids.length > 1) expect(ids).toEqual([...ids].sort((a, b) => b - a));
  });

  test('ProdCat-07: filters the grid by a unique SKU', async ({ adminSession, products }) => {
    void adminSession;
    await products.ensureSimpleProduct(data.fixtureSku, `PW Fixture ${data.runId}`);
    const row = await products.searchSku(data.fixtureSku);
    await expect(row).toHaveCount(1);
    await expect(row.first()).toContainText(data.fixtureSku);
  });

  test('ProdCat-08: filters products to Enabled status', async ({ adminSession, products }) => {
    void adminSession;
    await products.ensureSimpleProduct(data.fixtureSku, `PW Fixture ${data.runId}`);
    await products.ensureSimpleProduct(data.productSku, data.productName);
    await products.openProductBySku(data.fixtureSku);
    await products.setSelectIfPresent('status', '2');
    await products.saveProduct();
    await products.openGrid();
    const statusFilter = products.grid.locator('select[name*="[status]"]').first();
    await expect(statusFilter).toBeVisible();
    await statusFilter.selectOption('1');
    await products.search();
    const columnIndex = await products.grid.locator('thead th[data-column-id="status"]').evaluate(el => Array.from(el.parentElement!.children).indexOf(el));
    for (const row of await products.rows.all()) {
      const statusCell = row.locator('td').nth(columnIndex);
      const statusIcon = statusCell.locator('[title], [class*="grid-icon-value"]').first();
      const statusLabel = await statusIcon.count() ? `${await statusIcon.getAttribute('title') ?? ''} ${await statusIcon.getAttribute('class') ?? ''}` : '';
      const statusText = `${await statusCell.innerText()} ${await statusCell.getAttribute('title') ?? ''} ${statusLabel}`;
      expect(statusText).toMatch(/enabled|status-on|grid-icon-value--on/i);
    }
  });

  test('ProdCat-09: filters the grid by inclusive price range', async ({ adminSession, products }, testInfo) => {
    void adminSession;
    if (!data.gridPriceFilterAvailable) testInfo.skip(true, 'Set PW_PM_PRICE_FILTER_AVAILABLE=true after confirming the local grid exposes From/To price filters.');
    for (const [sku, price] of data.priceFixtureSkus.map((sku, index) => [sku, [9, 10, 25, 50, 51][index]] as const)) {
      await products.ensureSimpleProduct(sku, `PW Price ${price} ${data.runId}`, price.toFixed(2));
    }
    await products.openGrid();
    const from = products.grid.locator('input[name*="[price][from]"], input[name*="[price][0]"]').first();
    const to = products.grid.locator('input[name*="[price][to]"], input[name*="[price][1]"]').first();
    await expect(from).toBeVisible();
    await expect(to).toBeVisible();
    await from.fill('10.00');
    await to.fill('50.00');
    await products.search();
    const priceColumn = await products.grid.locator('thead th[data-column-id="price"]').evaluate(el => Array.from(el.parentElement!.children).indexOf(el));
    for (const row of await products.rows.all()) {
      const raw = await row.locator('td').nth(priceColumn).innerText();
      const price = Number(raw.replace(/[^\d.\-]/g, ''));
      expect(price).toBeGreaterThanOrEqual(10);
      expect(price).toBeLessThanOrEqual(50);
    }
  });

  test('ProdCat-10: sorts product names ascending and descending', async ({ adminSession, products }) => {
    void adminSession;
    await products.ensureSimpleProduct(data.fixtureSku, `PW Fixture ${data.runId}`);
    await products.ensureSimpleProduct(data.productSku, data.productName);
    await products.openGrid();
    const nameHeader = products.grid.locator('thead th[data-column-id="name"]');
    await nameHeader.click();
    await products.expectNameSort('asc');
    await nameHeader.click();
    await products.expectNameSort('desc');
  });

  test('ProdCat-11: blocks a simple product without SKU', async ({ adminSession, products }) => {
    void adminSession;
    await products.beginNewProduct('simple');
    await products.fillProductField('name', `PW Missing SKU ${data.runId}`);
    await products.fillProductField('price', '1.00');
    await products.saveAttempt();
    const sku = products.form.locator('[name="product[sku]"]');
    await expect(sku).toHaveClass(/required-entry/);
    await expect(products.form.locator('.validation-advice').filter({ hasText: /required field/i })).toBeVisible();
  });

  test('ProdCat-12: rejects a duplicate SKU', async ({ adminSession, products }) => {
    void adminSession;
    await products.ensureSimpleProduct(data.fixtureSku, `PW Fixture ${data.runId}`);
    await products.beginNewProduct('simple');
    await products.fillProductField('name', `PW Duplicate ${data.runId}`);
    await products.fillProductField('sku', data.fixtureSku);
    await products.fillProductField('price', '10.00');
    await products.saveAttempt();
    await expect(products.pageBody).toContainText(/sku.*(already|exist)|already.*sku/i, { timeout: 60_000 });
  });

  test('ProdCat-13: creates a valid simple product', async ({ adminSession, products }) => {
    void adminSession;
    await products.createSimpleProduct({ name: data.productName, sku: data.productSku, price: '99.00', qty: '50' });
    await expect(products.pageBody).toContainText('The product has been saved.');
    const row = await products.searchSku(data.productSku);
    await expect(row).toHaveCount(1);
  });

  test('ProdCat-14: edits the simple product name and price', async ({ adminSession, products }) => {
    void adminSession;
    await products.ensureSimpleProduct(data.productSku, data.productName);
    await products.openProductBySku(data.productSku);
    await products.fillProductField('name', data.editedProductName);
    await products.fillProductField('price', '149.00');
    await products.saveProduct();
    const row = await products.searchSku(data.productSku);
    await expect(row).toContainText(data.editedProductName);
    await expect(row).toContainText('149.00');
  });

  test('ProdCat-15: sets quantity to zero and checks storefront stock state', async ({ adminSession, products, page }, testInfo) => {
    void adminSession;
    await skipWithout(testInfo, ['PW_PM_STOREFRONT_PRODUCT_SKU', 'PW_PM_PRODUCT_URL']);
    await products.openProductBySku(data.storefrontSku!);
    await products.page.locator('#product_info_tabs_inventory').click().catch(() => undefined);
    const useConfigStock = products.page.locator('#inventory_use_config_manage_stock');
    if (await useConfigStock.isChecked().catch(() => false)) await useConfigStock.uncheck();
    await products.page.locator('#inventory_manage_stock').selectOption('1').catch(() => undefined);
    await products.page.locator('#inventory_qty').fill('0');
    await products.page.locator('#inventory_stock_availability').selectOption('0');
    await products.saveProduct();
    await openSlowPage(page, data.productUrl!);
    await expect(page.locator('body')).toContainText(/out of stock/i, { timeout: 60_000 });
    const addToCart = page.getByRole('button', { name: /add to cart/i });
    if (await addToCart.count()) await expect(addToCart.first()).toBeDisabled();
  });

  test('ProdCat-16: displays the active special price on the storefront', async ({ adminSession, products, page }, testInfo) => {
    void adminSession;
    await skipWithout(testInfo, ['PW_PM_STOREFRONT_PRODUCT_SKU', 'PW_PM_PRODUCT_URL']);
    await products.openProductBySku(data.storefrontSku!);
    await products.fillProductField('price', '149.00');
    await products.fillProductField('special_price', '99.00');
    await products.fillProductField('special_from_date', storeDateOffset(-1));
    await products.fillProductField('special_to_date', storeDateOffset(1));
    await products.saveProduct();
    await openSlowPage(page, data.productUrl!);
    await expect(page.locator('body')).toContainText(/99\.00/);
    await expect(page.locator('body')).toContainText(/149\.00/);
  });

  test('ProdCat-17: uploads a product gallery image', async ({ adminSession, products }, testInfo) => {
    void adminSession;
    await skipWithout(testInfo, ['PW_PM_IMAGE_PATH']);
    await products.ensureSimpleProduct(data.productSku, data.productName);
    await products.openProductBySku(data.productSku);
    await products.page.getByText('Images', { exact: true }).first().click().catch(() => undefined);
    await products.page.locator('input[type="file"]').first().setInputFiles(data.imagePath!);
    const gallery = products.page.locator('table').filter({ has: products.page.locator('input[type="radio"][name*="types"]') }).last();
    await expect(gallery).toBeVisible({ timeout: 60_000 });
    const imageRow = gallery.locator('tbody tr:not(.template):not([id$="-image-0"])').filter({ has: products.page.locator('input[type="radio"][name*="types"]') }).first();
    await expect(imageRow).toBeVisible({ timeout: 60_000 });
    const headings = await gallery.locator('thead th').allTextContents();
    for (const role of ['Base', 'Small', 'Thumbnail']) {
      const columnIndex = headings.findIndex(value => value.trim().toLowerCase().includes(role.toLowerCase()));
      if (columnIndex >= 0) await imageRow.locator('td').nth(columnIndex).locator('input[type="radio"]').check();
    }
    await products.saveProduct();
    await expect(products.pageBody).toContainText('The product has been saved.');
  });

  test('ProdCat-18: deletes an isolated product through grid mass action', async ({ adminSession, products }) => {
    void adminSession;
    await products.ensureSimpleProduct(data.deleteProductSku, `PW Delete ${data.runId}`);
    await products.massDeleteSku(data.deleteProductSku);
    await expect(await products.searchSku(data.deleteProductSku)).toHaveCount(0);
  });

  test('ProdCat-19: creates a configurable product when a compatible attribute is configured', async ({ adminSession, products }, testInfo) => {
    void adminSession;
    await skipWithout(testInfo, ['PW_PM_CONFIGURABLE_ATTRIBUTE']);
    await products.beginNewConfigurable(process.env.PW_PM_CONFIGURABLE_ATTRIBUTE!);
    await products.fillProductField('name', `PW Configurable ${data.runId}`);
    await products.fillProductField('sku', `PW-PM-CONFIG-${data.runId}`);
    await products.fillProductField('price', '99.00');
    await products.saveProduct();
    await expect(products.pageBody).toContainText('The product has been saved.');
  });

  test('ProdCat-20: associates an existing simple variant to a configurable product', async ({ adminSession, products }, testInfo) => {
    void adminSession;
    await skipWithout(testInfo, ['PW_PM_CONFIGURABLE_SKU', 'PW_PM_VARIANT_SKU']);
    await products.openProductBySku(data.configurableSku!);
    await products.page.getByText('Associated Products', { exact: true }).click();
    const chooser = products.page.locator('#config_super_product');
    const skuFilter = chooser.locator('input[name*="[sku]"]').last();
    if (await skuFilter.count()) {
      await skuFilter.fill(data.variantSku!);
      const response = products.page.waitForResponse(res => res.url().includes('super') && res.status() === 200, { timeout: 60_000 }).catch(() => null);
      await chooser.getByRole('button', { name: 'Search', exact: true }).click();
      await response;
    }
    const variant = chooser.locator('table.data tbody tr').filter({ hasText: data.variantSku! }).first();
    await expect(variant).toBeVisible({ timeout: 60_000 });
    await variant.locator('input[type="checkbox"]').check();
    await products.saveProduct();
    await expect(products.pageBody).toContainText('The product has been saved.');
  });

  test('ProdCat-21: displays a configured product on its storefront category page', async ({ storefront }, testInfo) => {
    await skipWithout(testInfo, ['PW_PM_CATEGORY_URL', 'PW_PM_STOREFRONT_PRODUCT_NAME']);
    await storefront.openConfiguredCategory();
    await expect(storefront.pageBody).toContainText(data.storefrontProductName!, { timeout: 60_000 });
  });

  test('ProdCat-22: opens the product detail page from its category listing', async ({ storefront }, testInfo) => {
    await skipWithout(testInfo, ['PW_PM_CATEGORY_URL', 'PW_PM_STOREFRONT_PRODUCT_NAME']);
    await storefront.openConfiguredCategory();
    await storefront.page.getByRole('link', { name: data.storefrontProductName!, exact: true }).click();
    await expect(storefront.page.locator('h1')).toContainText(data.storefrontProductName!, { timeout: 60_000 });
    await expect(storefront.page.locator('body')).toContainText(/sku/i);
  });

  test('ProdCat-23: adds two units to cart and checks mini-cart count, quantity, and subtotal', async ({ storefront, miniCart, cartPage }, testInfo) => {
    await skipWithout(testInfo, ['PW_PM_PRODUCT_URL']);
    await cartPage.empty();
    await storefront.openConfiguredProduct();
    await storefront.page.locator('#qty, input[name="qty"]').first().fill('2');
    await storefront.page.getByRole('button', { name: /add to cart/i }).first().click();
    await expect(storefront.page.locator('body')).toContainText(/added to your shopping cart|added to cart/i, { timeout: 60_000 });
    await miniCart.expectCount(2);
    await openSlowPage(storefront.page, '/checkout/cart/');
    const row = storefront.page.locator('#shopping-cart-table tbody tr').filter({ has: storefront.page.locator('input[name*="[qty]"]') }).first();
    await expect(row.locator('input[name*="[qty]"]')).toHaveValue('2');
    const subtotalText = await row.locator('.subtotal .price, td.subtotal .price').first().innerText();
    const itemSubtotal = Number(subtotalText.replace(/[^\d.\-]/g, ''));
    expect(itemSubtotal).toBeCloseTo(data.storefrontProductPrice * 2, 2);
  });

  test('ProdCat-24: selects a configured configurable-product swatch', async ({ storefront }, testInfo) => {
    await skipWithout(testInfo, ['PW_PM_CONFIGURABLE_PRODUCT_URL', 'PW_PM_SWATCH_LABEL']);
    await storefront.openConfiguredConfigurable();
    const swatch = storefront.page.locator(`[title="${data.swatchLabel}"], [aria-label="${data.swatchLabel}"], [data-option-label="${data.swatchLabel}"]`)
      .first()
      .or(storefront.page.getByRole('option', { name: new RegExp(data.swatchLabel!, 'i') }).or(storefront.page.getByRole('button', { name: new RegExp(data.swatchLabel!, 'i') })).first());
    await expect(swatch).toBeVisible({ timeout: 30_000 });
    const mainImage = storefront.page.locator('#image, .product-image-gallery img').first();
    const originalImage = await mainImage.getAttribute('src').catch(() => null);
    await swatch.click();
    if (originalImage) await expect.poll(() => mainImage.getAttribute('src'), { timeout: 30_000 }).not.toBe(originalImage);
    const checked = await swatch.getAttribute('aria-checked');
    const pressed = await swatch.getAttribute('aria-pressed');
    const className = await swatch.getAttribute('class') ?? '';
    expect(checked === 'true' || pressed === 'true' || /selected|active/i.test(className)).toBeTruthy();
  });

  test('ProdCat-25: finds the generated product through storefront search', async ({ adminSession, products, storefront }) => {
    void adminSession;
    await products.ensureSimpleProduct(data.productSku, data.productName);
    await storefront.search(data.productName);
    await expect(storefront.pageBody).toContainText(data.productName, { timeout: 60_000 });
  });
});
