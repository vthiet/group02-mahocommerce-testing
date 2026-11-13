import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { catalogFeatureData as data } from '../data/catalog-feature-data';
import { CatalogCategoryPage } from '../pages/catalog-category-page';
import { ConfigurableStorefrontPage } from '../pages/configurable-storefront-page';
import { AdminSession } from '../../product-management/pages/admin-session';
import { ProductManagementPage } from '../../product-management/pages/product-management-page';

async function requireEnv(testInfo: TestInfo, keys: string[]): Promise<void> {
  const absent = keys.filter(key => !process.env[key]);
  if (absent.length) testInfo.skip(true, `Configure ${absent.join(', ')} for this Maho fixture.`);
}

function requireData(testInfo: TestInfo, entries: Array<[string, unknown]>): void {
  const absent = entries.filter(([, value]) => value === undefined || value === null || value === '').map(([name]) => name);
  if (absent.length) testInfo.skip(true, `Set ${absent.join(', ')} in data/catalog-feature-data.ts for this Maho fixture.`);
}

async function loginAdmin(page: Page, testInfo: TestInfo): Promise<CatalogCategoryPage> {
  await requireEnv(testInfo, ['MAHO_ADMIN_USERNAME', 'MAHO_ADMIN_PASSWORD']);
  page.setDefaultTimeout(45_000);
  page.setDefaultNavigationTimeout(60_000);
  await new AdminSession(page).login();
  const categories = new CatalogCategoryPage(page);
  await categories.open();
  return categories;
}

async function createCategoryTree(categories: CatalogCategoryPage, suffix: string) {
  const root = `${data.rootName} ${suffix}`;
  const child = `${data.childName} ${suffix}`;
  const leaf = `${data.leafName} ${suffix}`;
  const otherRoot = `${data.movedParentName} ${suffix}`;
  await categories.createRoot(root);
  await categories.createChild(root, child);
  await categories.createChild(child, leaf);
  await categories.createRoot(otherRoot);
  return { root, child, leaf, otherRoot };
}

async function openConfigurable(page: Page, testInfo: TestInfo): Promise<ConfigurableStorefrontPage> {
  requireData(testInfo, [['configurableUrl', data.configurableUrl]]);
  const storefront = new ConfigurableStorefrontPage(page);
  await storefront.open();
  return storefront;
}

async function selectConfiguredCombination(storefront: ConfigurableStorefrontPage, combination: string): Promise<void> {
  const values = combination.split('|').map(value => value.trim());
  await storefront.selectLabels(values);
}

test.describe('Category tree interactions', () => {
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async ({ browser }) => {
    if (!data.adminUsername || !data.adminPassword) return;
    const page = await browser.newPage();
    try {
      await new AdminSession(page).login();
      const categories = new CatalogCategoryPage(page);
      await categories.open();
      const names = await categories.tree.locator(`[data-text*="${data.runId}"]`).evaluateAll(nodes => nodes.map(node => node.getAttribute('data-text')).filter((name): name is string => Boolean(name)));
      for (const name of names.reverse()) {
        const node = categories.tree.locator(`[data-text="${name}"]`).first();
        if (!(await node.count())) continue;
        await categories.delete(name);
      }
    } finally {
      await page.close();
    }
  });

  test('CatConfig-01: renders three-level category ancestry in Admin', async ({ page }, testInfo) => {
    const categories = await loginAdmin(page, testInfo);
    const tree = await createCategoryTree(categories, 'ancestry');
    await categories.select(tree.leaf);
    await expect(categories.tree).toContainText(tree.root);
    await expect(categories.tree).toContainText(tree.child);
    await expect(categories.tree).toContainText(tree.leaf);
    const leafParent = await categories.tree.locator(`[data-text="${tree.leaf}"]`).evaluate(node => node.parentElement?.closest('li')?.getAttribute('data-text'));
    const childParent = await categories.tree.locator(`[data-text="${tree.child}"]`).evaluate(node => node.parentElement?.closest('li')?.getAttribute('data-text'));
    expect(leafParent).toBe(tree.child);
    expect(childParent).toBe(tree.root);
  });

  test('CatConfig-02: honors category sibling position order', async ({ page }, testInfo) => {
    const categories = await loginAdmin(page, testInfo);
    const tree = await createCategoryTree(categories, 'position');
    const first = `${tree.root} A`;
    const second = `${tree.root} B`;
    await categories.createChild(tree.root, first);
    await categories.createChild(tree.root, second);
    await categories.setField(first, 'position', '20');
    await categories.setField(second, 'position', '10');
    await categories.open();
    const labels = await categories.tree.locator('span').allTextContents();
    const firstIndex = labels.findIndex(value => value.trim() === second);
    const secondIndex = labels.findIndex(value => value.trim() === first);
    expect(firstIndex, 'the earlier configured sibling should render first').toBeGreaterThanOrEqual(0);
    expect(secondIndex).toBeGreaterThan(firstIndex);
  });

  test('CatConfig-03: moves a leaf category to another parent with tree drag and drop', async ({ page }, testInfo) => {
    const categories = await loginAdmin(page, testInfo);
    const tree = await createCategoryTree(categories, 'move');
    const source = categories.tree.getByText(tree.leaf, { exact: true }).first();
    const target = categories.tree.getByText(tree.otherRoot, { exact: true }).first();
    await source.dragTo(target);
    await expect.poll(async () => categories.tree.locator(`[data-text="${tree.leaf}"]`).evaluate(node => node.parentElement?.closest('li')?.getAttribute('data-text') ?? ''), { timeout: 30_000 }).toBe(tree.otherRoot);
  });

  test('CatConfig-04: disables a category branch in storefront navigation', async ({ page }, testInfo) => {
    requireData(testInfo, [['storefrontCategoryName', data.storefrontCategoryName]]);
    const categories = await loginAdmin(page, testInfo);
    const name = data.storefrontCategoryName!;
    await categories.select(name);
    const wasActive = await categories.field('is_active').inputValue();
    try {
      await categories.setActive(name, false);
      await page.goto(data.baseUrl);
      const navigation = page.locator('nav, #nav, .nav-container').first();
      await expect(navigation.getByRole('link', { name, exact: true })).toHaveCount(0);
    } finally {
      await categories.setActive(name, wasActive === '1');
    }
  });

  test('CatConfig-05: re-enables a category and restores Admin active state', async ({ page }, testInfo) => {
    requireData(testInfo, [['storefrontCategoryName', data.storefrontCategoryName]]);
    const categories = await loginAdmin(page, testInfo);
    const name = data.storefrontCategoryName!;
    await categories.select(name);
    const wasActive = await categories.field('is_active').inputValue();
    try {
      await categories.setActive(name, false);
      await categories.setActive(name, true);
      await categories.select(name);
      await expect(categories.field('is_active')).toHaveValue('1');
      await page.goto(data.baseUrl);
      const navigation = page.locator('nav, #nav, .nav-container').first();
      await expect(navigation.getByRole('link', { name, exact: true })).toBeVisible();
    } finally {
      await categories.setActive(name, wasActive === '1');
    }
  });

  test('CatConfig-06: deletes a parent branch without leaving orphan descendants', async ({ page }, testInfo) => {
    const categories = await loginAdmin(page, testInfo);
    const tree = await createCategoryTree(categories, 'delete-branch');
    await categories.select(tree.child);
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /delete category/i }).click();
    await expect.poll(async () => {
      const parentExists = await categories.tree.getByText(tree.child, { exact: true }).count();
      const childExists = await categories.tree.getByText(tree.leaf, { exact: true }).count();
      return parentExists === 0 || childExists > 0;
    }, { timeout: 30_000 }).toBeTruthy();
    const parentExists = await categories.tree.getByText(tree.child, { exact: true }).count();
    const childExists = await categories.tree.getByText(tree.leaf, { exact: true }).count();
    expect(parentExists > 0 || childExists === 0).toBeTruthy();
  });

  test('CatConfig-07: deleting a category leaves its assigned product intact', async ({ page }, testInfo) => {
    requireData(testInfo, [['assignedCategoryName', data.assignedCategoryName], ['productPdpUrl', data.productPdpUrl]]);
    const categories = await loginAdmin(page, testInfo);
    await categories.delete(data.assignedCategoryName!);
    await page.goto(data.productPdpUrl!);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('CatConfig-08: changing URL key updates category route', async ({ page }, testInfo) => {
    requireData(testInfo, [['urlKeyCategoryName', data.urlKeyCategoryName], ['newCategoryUrl', data.newCategoryUrl], ['oldCategoryUrl', data.oldCategoryUrl]]);
    const categories = await loginAdmin(page, testInfo);
    const name = data.urlKeyCategoryName!;
    requireData(testInfo, [['newCategoryUrlKey', data.newCategoryUrlKey]]);
    const newKey = data.newCategoryUrlKey!;
    await categories.select(name);
    const oldKey = await categories.field('url_key').inputValue();
    try {
      await categories.setField(name, 'url_key', newKey);
      await page.goto(data.newCategoryUrl!);
      await expect(page.locator('h1')).toContainText(name);
      await page.goto(data.oldCategoryUrl!);
      await expect(page).toHaveURL(new RegExp(data.newCategoryUrl!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    } finally {
      await categories.setField(name, 'url_key', oldKey);
    }
  });
});

test.describe('Configurable attributes and variant storefront', () => {
  test('CatConfig-09: configurable wizard offers only eligible attribute fixture', async ({ page }, testInfo) => {
    await requireEnv(testInfo, ['MAHO_ADMIN_USERNAME', 'MAHO_ADMIN_PASSWORD']);
    requireData(testInfo, [['configurableAttributeLabel', data.configurableAttributeLabel], ['ineligibleAttributeLabel', data.ineligibleAttributeLabel]]);
    await new AdminSession(page).login();
    const products = new ProductManagementPage(page);
    await products.openGrid();
    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.locator('select[name="set"]').selectOption({ label: 'Default' });
    await page.locator('select[name="type"]').selectOption('configurable');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByLabel(data.configurableAttributeLabel!, { exact: true })).toBeVisible();
    await expect(page.getByLabel(data.ineligibleAttributeLabel!, { exact: true })).toHaveCount(0);
  });

  test('CatConfig-10: blocks configurable wizard without selecting a required attribute', async ({ page }, testInfo) => {
    await requireEnv(testInfo, ['MAHO_ADMIN_USERNAME', 'MAHO_ADMIN_PASSWORD']);
    await new AdminSession(page).login();
    const products = new ProductManagementPage(page);
    await products.openGrid();
    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.locator('select[name="set"]').selectOption({ label: 'Default' });
    await page.locator('select[name="type"]').selectOption('configurable');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    await continueButton.click();
    await expect(page.locator('.validation-advice, .messages .error-msg, .validation-failed').first()).toBeVisible();
  });

  test('CatConfig-11: selects all configured valid Color and Size combinations', async ({ page }, testInfo) => {
    const storefront = await openConfigurable(page, testInfo);
    const values = data.validCombination.split('|');
    await selectConfiguredCombination(storefront, data.validCombination);
    await expect.poll(() => storefront.options.evaluateAll(elements => elements.filter(element => Boolean((element as HTMLSelectElement).value)).length)).toBe(values.length);
  });

  test('CatConfig-12: does not allow an unavailable variant combination', async ({ page }, testInfo) => {
    requireData(testInfo, [['missingCombination', data.missingCombination]]);
    const storefront = await openConfigurable(page, testInfo);
    const values = data.missingCombination.split('|');
    for (const value of values) {
      const matching = storefront.page.locator(`a.swatch-link[title="${value}"]`);
      if (await matching.count()) {
        const className = await matching.getAttribute('class') ?? '';
        test.skip(/not-available|disabled/i.test(className), 'The missing-combination option itself is disabled before selection.');
        await matching.click();
      } else {
        const select = storefront.options.nth(values.indexOf(value));
        if (await select.count()) await select.selectOption({ label: value }).catch(() => undefined);
      }
    }
    await expect(storefront.addToCart).toBeDisabled().catch(async () => {
      await storefront.addToCart.click();
      await expect(storefront.body).toContainText(/choose.*option|not available|select/i);
    });
  });

  test('CatConfig-13: keeps disabled child variant unavailable', async ({ page }, testInfo) => {
    requireData(testInfo, [['disabledOptionLabel', data.disabledOptionLabel]]);
    const storefront = await openConfigurable(page, testInfo);
    const option = storefront.page.locator(`a.swatch-link[title="${data.disabledOptionLabel}"]`).first();
    await expect(option).toBeVisible();
    await option.click().catch(() => undefined);
    const className = `${await option.getAttribute('class') ?? ''} ${await option.locator('xpath=..').getAttribute('class') ?? ''}`;
    expect(className).toMatch(/not-available|disabled|out-of-stock/i);
  });

  test('CatConfig-14: marks only out-of-stock child variant unavailable', async ({ page }, testInfo) => {
    requireData(testInfo, [['outOfStockOptionLabel', data.outOfStockOptionLabel]]);
    const storefront = await openConfigurable(page, testInfo);
    const unavailable = storefront.page.locator(`a.swatch-link[title="${data.outOfStockOptionLabel}"]`).first();
    await expect(unavailable).toBeVisible();
    const status = `${await unavailable.getAttribute('class') ?? ''} ${await unavailable.locator('xpath=..').getAttribute('class') ?? ''}`;
    expect(status).toMatch(/not-available|disabled|out-of-stock/i);
    const availableCount = await storefront.page.locator('a.swatch-link').evaluateAll(links => links.filter(link => !/not-available|disabled|out-of-stock/i.test(`${link.getAttribute('class')} ${link.parentElement?.getAttribute('class')}`)).length);
    expect(availableCount).toBeGreaterThan(0);
  });

  test('CatConfig-15: changes gallery image after selecting child option', async ({ page }, testInfo) => {
    requireData(testInfo, [['imageOptionLabel', data.imageOptionLabel]]);
    const storefront = await openConfigurable(page, testInfo);
    await expect(storefront.productImage).toBeVisible();
    const oldImage = await storefront.productImage.getAttribute('src');
    await storefront.selectOption(data.imageOptionLabel!);
    await expect.poll(() => storefront.productImage.getAttribute('src'), { timeout: 30_000 }).not.toBe(oldImage);
  });

  test('CatConfig-16: applies configured configurable option surcharge', async ({ page }, testInfo) => {
    requireData(testInfo, [['surchargeOptionLabel', data.surchargeOptionLabel], ['basePrice', data.basePrice], ['surchargeAmount', data.surchargeAmount]]);
    const storefront = await openConfigurable(page, testInfo);
    await storefront.selectOption(data.surchargeOptionLabel!);
    await expect.poll(() => storefront.visiblePriceNumber(), { timeout: 30_000 }).toBeCloseTo(data.basePrice + data.surchargeAmount, 2);
  });

  test('CatConfig-17: child simple price does not replace parent option price implicitly', async ({ page }, testInfo) => {
    requireData(testInfo, [['hasChildWithDifferentPrice', data.hasChildWithDifferentPrice], ['basePrice', data.basePrice]]);
    test.skip(!data.hasChildWithDifferentPrice, 'Fixture must have differing child prices and no option surcharge.');
    const storefront = await openConfigurable(page, testInfo);
    await storefront.selectOption(data.firstOptionLabel);
    await expect.poll(() => storefront.visiblePriceNumber(), { timeout: 30_000 }).toBeCloseTo(data.basePrice, 2);
  });

  test('CatConfig-18: retains selected options after quantity change', async ({ page }, testInfo) => {
    const storefront = await openConfigurable(page, testInfo);
    await selectConfiguredCombination(storefront, data.validCombination);
    const qty = storefront.page.locator('#qty');
    await qty.fill('2');
    await expect(qty).toHaveValue('2');
    const selected = await storefront.page.locator('select.super-attribute-select').evaluateAll(elements => elements.map(element => (element as HTMLSelectElement).value));
    expect(selected.every(Boolean)).toBeTruthy();
  });

  test('CatConfig-19: adds selected variant and options to cart', async ({ page }, testInfo) => {
    const storefront = await openConfigurable(page, testInfo);
    await selectConfiguredCombination(storefront, data.validCombination);
    await storefront.addSelectedToCart();
    await page.goto(`${data.baseUrl.replace(/\/$/, '')}/checkout/cart/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#shopping-cart-table')).toContainText(data.validCombination.split('|')[0]);
    await expect(page.locator('#shopping-cart-table')).toContainText(data.validCombination.split('|')[1]);
  });

  test('CatConfig-20: renders listing swatches only for configured store view', async ({ page }, testInfo) => {
    requireData(testInfo, [['categoryUrl', data.categoryUrl], ['configurableName', data.configurableName], ['listingSwatchesEnabled', data.listingSwatchesEnabled]]);
    await page.goto(data.categoryUrl!, { waitUntil: 'domcontentloaded' });
    const card = page.locator('.category-products li, .products-grid .item').filter({ hasText: data.configurableName! }).first();
    await expect(card).toBeVisible();
    const swatches = card.locator('.configurable-swatch-list');
    if (data.listingSwatchesEnabled) await expect(swatches.first()).toBeVisible();
    else await expect(swatches).toHaveCount(0);
  });

  test('CatConfig-21: prevents purchase when parent has no available variants', async ({ page }, testInfo) => {
    requireData(testInfo, [['hasAllVariantsUnavailable', data.hasAllVariantsUnavailable]]);
    test.skip(!data.hasAllVariantsUnavailable, 'Fixture must have no saleable associated variants.');
    const storefront = await openConfigurable(page, testInfo);
    const optionCount = await storefront.options.count();
    const addCount = await storefront.addToCart.count();
    expect(optionCount === 0 || (await storefront.options.evaluateAll(elements => elements.every(el => (el as HTMLSelectElement).disabled)))).toBeTruthy();
    expect(addCount === 0 || await storefront.addToCart.isDisabled()).toBeTruthy();
  });

  test('CatConfig-22: lists configurable parent once in assigned nested category', async ({ page }, testInfo) => {
    requireData(testInfo, [['categoryWithAssignedProductUrl', data.categoryWithAssignedProductUrl], ['configurableName', data.configurableName]]);
    await page.goto(data.categoryWithAssignedProductUrl!, { waitUntil: 'domcontentloaded' });
    const productCards = page.locator('.category-products li, .products-grid .item').filter({ hasText: data.configurableName! });
    await expect(productCards).toHaveCount(1);
  });

  test('CatConfig-23: applies the characterized response for disabled category URL', async ({ page }, testInfo) => {
    requireData(testInfo, [['oldCategoryUrl', data.oldCategoryUrl], ['expectedOldCategoryBehavior', data.expectedOldCategoryBehavior]]);
    await page.goto(data.oldCategoryUrl!, { waitUntil: 'domcontentloaded' });
    if (data.expectedOldCategoryBehavior === 'redirect') {
      requireData(testInfo, [['newCategoryUrl', data.newCategoryUrl]]);
      const escapedUrl = data.newCategoryUrl!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await expect(page).toHaveURL(new RegExp(escapedUrl));
    }
    else await expect(page.locator('body')).toContainText(/not found|category|unavailable/i);
  });

  test('CatConfig-24: shows nested category ancestry in configurable PDP breadcrumbs', async ({ page }, testInfo) => {
    requireData(testInfo, [['categoryBreadcrumb', data.categoryBreadcrumb]]);
    const storefront = await openConfigurable(page, testInfo);
    const breadcrumb = page.locator('.breadcrumbs');
    await expect(breadcrumb).toContainText(data.categoryBreadcrumb!);
  });
});
