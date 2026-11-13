import { test, expect } from '../fixtures/promotion-fixtures';
import type { TestInfo } from '@playwright/test';
import { promotionData } from '../data/promotion-data';
import { PromotionStorefrontPage } from '../pages/promotion-storefront-page';

const uniqueName = (prefix: string) => `${prefix}-${promotionData.runId}`;

function skipWithoutProduct(testInfo: TestInfo): void {
  if (promotionData.requiresProduct) testInfo.skip(true, 'Set productUrl in promotion-data.ts to an eligible local simple product URL.');
}

const fixtureKeyToValue: Record<string, unknown> = {
  PW_PROMO_FUTURE_PRODUCT_URL: promotionData.futureProductUrl, PW_PROMO_FUTURE_PRODUCT_PRICE: promotionData.futureProductPrice,
  PW_PROMO_CALC_PRODUCT_URL: promotionData.calcProductUrl, PW_PROMO_CALC_PRODUCT_PRICE: promotionData.calcProductPrice,
  PW_PROMO_PRIORITY_PRODUCT_URL: promotionData.priorityProductUrl, PW_PROMO_PRIORITY_PRODUCT_PRICE: promotionData.priorityProductPrice,
  PW_PROMO_APPLY_PRODUCT_URL: promotionData.applyProductUrl, PW_PROMO_APPLY_PRODUCT_PRICE: promotionData.applyProductPrice,
  PW_PROMO_SUBTOTAL_COUPON: promotionData.subtotalCoupon, PW_PROMO_SUBTOTAL_PRODUCT_99_URL: promotionData.subtotalProduct99Url,
  PW_PROMO_SUBTOTAL_PRODUCT_100_URL: promotionData.subtotalProduct100Url, PW_PROMO_SUBTOTAL_PRODUCT_101_URL: promotionData.subtotalProduct101Url,
  PW_PROMO_CATEGORY_PRODUCT_URL: promotionData.categoryProductUrl, PW_PROMO_NON_CATEGORY_PRODUCT_URL: promotionData.nonCategoryProductUrl,
  PW_PROMO_CATEGORY_COUPON: promotionData.categoryCoupon, PW_PROMO_QUANTITY_COUPON: promotionData.quantityCoupon,
  PW_PROMO_RULES_PRODUCT_URL: promotionData.rulesProductUrl, PW_PROMO_RULES_PRODUCT_PRICE: promotionData.rulesProductPrice,
  PW_PROMO_CUSTOMER_LIMIT_COUPON: promotionData.customerLimitCoupon, PW_PROMO_GLOBAL_LIMIT_COUPON: promotionData.globalLimitCoupon,
  PW_PROMO_FREE_SHIPPING_COUPON: promotionData.freeShippingCoupon,
};

function skipWithoutEnv(testInfo: TestInfo, keys: string[], setup: string): void {
  const missing = keys.filter(key => !(key in fixtureKeyToValue ? fixtureKeyToValue[key] : process.env[key]));
  if (missing.length) testInfo.skip(true, `Configure ${missing.join(', ')} in promotion-data.ts or .env as appropriate. ${setup}`);
}

async function prepareCart(store: import('../pages/promotion-storefront-page').PromotionStorefrontPage, url = promotionData.productUrl!) {
  await store.openProduct(url);
  await store.addProduct();
  await store.openCart();
}

async function applyPreparedCoupon(
  store: import('../pages/promotion-storefront-page').PromotionStorefrontPage,
  testInfo: TestInfo,
  coupon: string | undefined,
  fixtureName: string,
): Promise<void> {
  skipWithoutEnv(testInfo, [fixtureName], 'The coupon must be preconfigured as described in the promotion test specification.');
  skipWithoutProduct(testInfo);
  await prepareCart(store);
  await store.applyCoupon(coupon!);
}

test.describe('Promotion Management: Catalog Price Rules', () => {
  test('CatalogRule-01 [Admin]: displays catalog rule grid columns', async ({ promotions }) => {
    await promotions.login();
    await promotions.openGrid('catalog');
    await promotions.expectHeaders(['ID', 'Rule Name', 'Date Start', 'Date Expire', 'Status']);
  });

  test('CatalogRule-02 [Admin]: filters catalog rules by active status', async ({ promotions }) => {
    await promotions.login();
    const activeName = uniqueName('PW-Catalog-Active');
    const inactiveName = uniqueName('PW-Catalog-Inactive');
    let activeCreated = false;
    let inactiveCreated = false;
    try {
      await promotions.createCatalogRule({ name: activeName, active: true });
      activeCreated = true;
      await promotions.createCatalogRule({ name: inactiveName, active: false });
      inactiveCreated = true;
      await promotions.openGrid('catalog');
      await promotions.searchGrid('catalog', 'is_active', '1');
      await expect(promotions.rows.filter({ hasText: activeName })).toHaveCount(1);
      await expect(promotions.rows.filter({ hasText: inactiveName })).toHaveCount(0);
    } finally {
      if (activeCreated) await promotions.deleteRule('catalog', activeName);
      if (inactiveCreated) await promotions.deleteRule('catalog', inactiveName);
    }
  });

  test('CatalogRule-03 [Admin]: validates a missing rule name', async ({ promotions, page }) => {
    await promotions.login();
    await promotions.openNewRule('catalog');
    await page.locator('select[name="is_active"]').selectOption('1');
    await page.getByRole('link', { name: 'Actions', exact: true }).click();
    await page.locator('select[name="simple_action"]').selectOption('by_percent');
    await page.locator('input[name="discount_amount"]').fill('10');
    await page.getByRole('button', { name: /^save$/i }).click();
    await expect(page.locator('#name').locator('xpath=..')).toContainText(/required field/i, { timeout: 30_000 });
    await expect(page.locator('input[name="name"]')).toHaveValue('');
  });

  test('CatalogRule-04 [Admin+Storefront]: applies an in-date percentage rule', async ({ promotions, promoStorefront }, testInfo) => {
    skipWithoutProduct(testInfo);
    await promotions.login();
    const name = uniqueName('PW-Catalog-Active');
    let created = false;
    try {
      await promotions.createCatalogRule({ name, amount: 20 });
      created = true;
      await promotions.openStorefrontProduct(promotionData.productUrl!);
      await promoStorefront.expectPrice(promotionData.productPrice * 0.8);
    } finally {
      if (created) await promotions.deleteRule('catalog', name);
    }
  });

  test('CatalogRule-05 [Admin+Storefront]: future-dated rule does not alter product price', async ({ promotions, promoStorefront }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_FUTURE_PRODUCT_URL', 'PW_PROMO_FUTURE_PRODUCT_PRICE'], 'Provide a product with no other matching catalog rule.');
    const url = promotionData.futureProductUrl!;
    const price = Number(promotionData.futureProductPrice);
    await promotions.login();
    const name = uniqueName('PW-Catalog-Future');
    let created = false;
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() + 1);
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 7);
      await promotions.createCatalogRule({ name, amount: 50, fromDate, toDate });
      created = true;
      await promotions.openStorefrontProduct(url);
      await promoStorefront.expectPrice(price);
    } finally {
      if (created) await promotions.deleteRule('catalog', name);
    }
  });

  test('CatalogRule-06 [Admin+Storefront]: calculates percentage discount from original price', async ({ promotions, promoStorefront }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_CALC_PRODUCT_URL', 'PW_PROMO_CALC_PRODUCT_PRICE'], 'Provide an isolated product without other matching catalog rules.');
    const price = Number(promotionData.calcProductPrice);
    await promotions.login();
    const name = uniqueName('PW-Catalog-Calc');
    let created = false;
    try {
      await promotions.createCatalogRule({ name, amount: 15 });
      created = true;
      await promotions.openStorefrontProduct(promotionData.calcProductUrl!);
      await promoStorefront.expectPrice(price * 0.85);
    } finally {
      if (created) await promotions.deleteRule('catalog', name);
    }
  });

  test('CatalogRule-07 [Admin+Storefront]: honors priority and Stop Further Rules', async ({ promotions, promoStorefront }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_PRIORITY_PRODUCT_URL', 'PW_PROMO_PRIORITY_PRODUCT_PRICE'], 'Provide an isolated product and ensure no other catalog rules apply.');
    const price = Number(promotionData.priorityProductPrice);
    await promotions.login();
    const first = uniqueName('PW-Catalog-Priority-1');
    const second = uniqueName('PW-Catalog-Priority-2');
    let firstCreated = false;
    let secondCreated = false;
    try {
      await promotions.createCatalogRule({ name: first, amount: 10, priority: 1, stopFurtherRules: true });
      firstCreated = true;
      await promotions.createCatalogRule({ name: second, amount: 20, priority: 2 });
      secondCreated = true;
      await promotions.openStorefrontProduct(promotionData.priorityProductUrl!);
      await promoStorefront.expectPrice(price * 0.9);
    } finally {
      if (secondCreated) await promotions.deleteRule('catalog', second);
      if (firstCreated) await promotions.deleteRule('catalog', first);
    }
  });

  test('CatalogRule-08 [Admin+Storefront]: Save and Apply updates rule price', async ({ promotions, promoStorefront }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_APPLY_PRODUCT_URL', 'PW_PROMO_APPLY_PRODUCT_PRICE'], 'Provide an isolated product for a visible before/after price assertion.');
    const price = Number(promotionData.applyProductPrice);
    await promotions.login();
    const name = uniqueName('PW-Catalog-Apply');
    let created = false;
    try {
      await promotions.createCatalogRule({ name, amount: 10 });
      created = true;
      await promotions.openStorefrontProduct(promotionData.applyProductUrl!);
      await promoStorefront.expectPrice(price * 0.9);
    } finally {
      if (created) await promotions.deleteRule('catalog', name);
    }
  });

  test('CatalogRule-09 [Admin]: deletes a disposable catalog rule', async ({ promotions }) => {
    await promotions.login();
    const name = uniqueName('PW-Catalog-Delete');
    await promotions.createCatalogRule({ name });
    await promotions.deleteRule('catalog', name);
    await promotions.openGrid('catalog');
    await expect(promotions.rows.filter({ hasText: name })).toHaveCount(0);
  });
});

test.describe('Promotion Management: Shopping Cart Price Rules', () => {
  test('CartRule-01 [Admin]: displays cart rule grid columns', async ({ promotions }) => {
    await promotions.login();
    await promotions.openGrid('cart');
    await promotions.expectHeaders(['ID', 'Rule Name', 'Coupon Code', 'Date Start', 'Date Expire', 'Status', 'Times Used', 'Priority']);
  });

  test('CartRule-02 [Admin]: searches a cart rule by exact name', async ({ promotions }) => {
    await promotions.login();
    const name = uniqueName('PW-Cart-Search');
    let created = false;
    try {
      await promotions.createCartRule({ name, coupon: uniqueName('PW-SEARCH-CODE') });
      created = true;
      await promotions.openGrid('cart');
      await promotions.searchGrid('cart', 'name', name);
      await expect(promotions.rows.filter({ hasText: name })).toHaveCount(1);
    } finally {
      if (created) await promotions.deleteRule('cart', name);
    }
  });

  test('CartRule-03 [Admin+Storefront]: applies a valid fixed coupon', async ({ promotions, promoStorefront, page }, testInfo) => {
    skipWithoutProduct(testInfo);
    await promotions.login();
    const name = uniqueName('PW-Cart-Apply');
    const code = uniqueName('PW-SAVE10');
    let created = false;
    try {
      await promotions.createCartRule({ name, coupon: code, action: 'cart_fixed', amount: 10 });
      created = true;
      await prepareCart(promoStorefront);
      await promoStorefront.applyCoupon(code);
      await expect(page.locator('#messages, .messages').first()).toContainText(`Coupon code "${code}" was applied.`, { timeout: 30_000 });
      await expect(promoStorefront.discountValue).toContainText('10.00');
    } finally {
      if (created) await promotions.deleteRule('cart', name);
      await promoStorefront.emptyCart();
    }
  });

  test('CartRule-04 [Storefront]: rejects an invalid coupon without changing totals', async ({ promoStorefront, page }, testInfo) => {
    skipWithoutProduct(testInfo);
    await prepareCart(promoStorefront);
    const before = await page.locator('#shopping-cart-totals-table').innerText();
    await promoStorefront.applyCoupon(promotionData.invalidCouponCode);
    await expect(page.locator('#messages, .messages').first()).toContainText(`Promo code "${promotionData.invalidCouponCode}" is not valid.`);
    const after = await page.locator('#shopping-cart-totals-table').innerText();
    expect(after).toBe(before);
    await promoStorefront.emptyCart();
  });

  test('CartRule-05 [Admin]: generates a batch of unique coupon codes', async ({ promotions }) => {
    await promotions.login();
    const name = uniqueName('PW-Cart-Auto');
    let created = false;
    try {
      await promotions.createCartRule({ name, couponType: 'auto' });
      created = true;
      await promotions.openRuleByName('cart', name);
      await promotions.generateCoupons(5, 8);
    } finally {
      if (created) await promotions.deleteRule('cart', name);
    }
  });

  test('CartRule-06 [Storefront]: checks subtotal threshold below, at, and above $100', async ({ promoStorefront, page }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_SUBTOTAL_COUPON', 'PW_PROMO_SUBTOTAL_PRODUCT_99_URL', 'PW_PROMO_SUBTOTAL_PRODUCT_100_URL', 'PW_PROMO_SUBTOTAL_PRODUCT_101_URL'], 'Provision a subtotal threshold coupon and products with those exact totals.');
    const cases = [
      { url: promotionData.subtotalProduct99Url!, expectedDiscount: 0 },
      { url: promotionData.subtotalProduct100Url!, expectedDiscount: 10 },
      { url: promotionData.subtotalProduct101Url!, expectedDiscount: 10.1 },
    ];
    for (const boundary of cases) {
      await promoStorefront.openProduct(boundary.url);
      await promoStorefront.addProduct();
      await promoStorefront.openCart();
      await promoStorefront.applyCoupon(promotionData.subtotalCoupon!);
      const banner = page.locator('#messages, .messages').first();
      if (boundary.expectedDiscount) {
        await expect(banner).toContainText(/was applied/i);
        await promoStorefront.expectCartDiscount(boundary.expectedDiscount);
      } else {
        await promoStorefront.expectNoCartDiscount();
      }
      await promoStorefront.emptyCart();
    }
  });

  test('CartRule-07 [Storefront]: limits category discount to matching items', async ({ promoStorefront }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_CATEGORY_PRODUCT_URL', 'PW_PROMO_NON_CATEGORY_PRODUCT_URL', 'PW_PROMO_CATEGORY_COUPON'], 'Provision distinct category product fixtures and an active 20% category rule.');
    await promoStorefront.openProduct(promotionData.categoryProductUrl!);
    await promoStorefront.addProduct();
    await promoStorefront.openProduct(promotionData.nonCategoryProductUrl!);
    await promoStorefront.addProduct();
    await promoStorefront.openCart();
    await promoStorefront.applyCoupon(promotionData.categoryCoupon!);
    await promoStorefront.expectCartDiscount(10);
    await promoStorefront.emptyCart();
  });

  test('CartRule-08 [Storefront]: checks quantity condition at 2 and 3 units', async ({ promoStorefront, page }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_QUANTITY_COUPON'], 'Provision an active quantity-threshold coupon and a product fixture.');
    skipWithoutProduct(testInfo);
    await promoStorefront.openProduct(promotionData.productUrl!);
    await promoStorefront.addProduct(2);
    await promoStorefront.openCart();
    await expect(promoStorefront.discountValue).toHaveCount(0);
    await promoStorefront.cartRows.first().locator('input[name*="[qty]"]').fill('3');
    await page.getByRole('button', { name: /update shopping cart/i }).click();
    await promoStorefront.expectCartDiscount(15);
    await promoStorefront.emptyCart();
  });

  test('CartRule-09 [Storefront]: enforces uses per customer at order placement', async ({ promoStorefront, page }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_CUSTOMER_LIMIT_COUPON', 'PW_CUSTOMER_EMAIL', 'PW_CUSTOMER_PASSWORD'], 'Provide a checkout-ready customer and an active rule with Uses per Customer = 1.');
    skipWithoutProduct(testInfo);
    await promoStorefront.loginCustomer(promotionData.customerLimitEmail!, promotionData.customerLimitPassword!);
    await promoStorefront.openProduct(promotionData.productUrl!);
    await promoStorefront.addProduct();
    await promoStorefront.openCart();
    await promoStorefront.applyCoupon(promotionData.customerLimitCoupon!);
    const firstOrder = await promoStorefront.placeOrder();
    expect(firstOrder.succeeded, firstOrder.message).toBe(true);

    await promoStorefront.openProduct(promotionData.productUrl!);
    await promoStorefront.addProduct();
    await promoStorefront.openCart();
    await promoStorefront.applyCoupon(promotionData.customerLimitCoupon!);
    const secondOrder = await promoStorefront.placeOrder();
    expect(secondOrder.succeeded).toBe(false);
    expect(secondOrder.message).toContain('This order has a discount that you used the maximum number of times.');
  });

  test('CartRule-10 [Storefront]: enforces global coupon use across customers', async ({ promoStorefront, browser }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_GLOBAL_LIMIT_COUPON', 'PW_CUSTOMER_EMAIL', 'PW_CUSTOMER_PASSWORD', 'PW_PROMO_CUSTOMER2_EMAIL', 'PW_PROMO_CUSTOMER2_PASSWORD'], 'Provide two checkout-ready customers and an active coupon with Uses per Coupon = 1.');
    skipWithoutProduct(testInfo);
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondStore = new PromotionStorefrontPage(secondPage);
    try {
      await promoStorefront.loginCustomer(process.env.PW_CUSTOMER_EMAIL!, process.env.PW_CUSTOMER_PASSWORD!);
      await promoStorefront.openProduct(promotionData.productUrl!);
      await promoStorefront.addProduct();
      await promoStorefront.openCart();
      await promoStorefront.applyCoupon(promotionData.globalLimitCoupon!);
      const firstOrder = await promoStorefront.placeOrder();
      expect(firstOrder.succeeded, firstOrder.message).toBe(true);

      await secondStore.loginCustomer(promotionData.customer2Email!, promotionData.customer2Password!);
      await secondStore.openProduct(promotionData.productUrl!);
      await secondStore.addProduct();
      await secondStore.openCart();
      await secondStore.applyCoupon(promotionData.globalLimitCoupon!);
      const secondOrder = await secondStore.placeOrder();
      expect(secondOrder.succeeded).toBe(false);
      expect(secondOrder.message).toContain(`Coupon code "${promotionData.globalLimitCoupon}" reached its maximum number of uses.`);
    } finally {
      await secondContext.close();
    }
  });

  test('CartRule-11 [Admin+Storefront]: applies fixed whole-cart discount', async ({ promotions, promoStorefront }, testInfo) => {
    skipWithoutProduct(testInfo);
    await promotions.login();
    const name = uniqueName('PW-Cart-Fixed');
    const code = uniqueName('PW-FIXED15');
    let created = false;
    try {
      await promotions.createCartRule({ name, coupon: code, action: 'cart_fixed', amount: 15 });
      created = true;
      await prepareCart(testInfo.page, promoStorefront);
      await promoStorefront.applyCoupon(code);
      await expect(promoStorefront.discountValue).toContainText('15.00');
    } finally {
      if (created) await promotions.deleteRule('cart', name);
      await promoStorefront.emptyCart();
    }
  });

  test('CartRule-12 [Storefront]: grants free shipping to matching items', async ({ promoStorefront }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_FREE_SHIPPING_COUPON', 'PW_PROMO_CATEGORY_PRODUCT_URL', 'PW_PROMO_NON_CATEGORY_PRODUCT_URL'], 'Configure a per-item shipping method and a matching-items-only free-shipping coupon.');
    test.skip(true, 'A shipment-level flat rate cannot expose the per-item shipping difference required by this case.');
  });

  test('CartRule-13 [Admin+Storefront]: applies automatic Buy 2 Get 1 Free', async ({ promotions, promoStorefront }, testInfo) => {
    skipWithoutProduct(testInfo);
    await promotions.login();
    const name = uniqueName('PW-Buy-2-Get-1');
    let created = false;
    try {
      await promotions.createCartRule({ name, couponType: 'none', action: 'buy_x_get_y', amount: 1, discountStep: 2, discountQty: 1 });
      created = true;
      await promoStorefront.openProduct(promotionData.productUrl!);
      await promoStorefront.addProduct(3);
      await promoStorefront.openCart();
      await promoStorefront.expectCartDiscount(promotionData.productPrice);
    } finally {
      if (created) await promotions.deleteRule('cart', name);
      await promoStorefront.emptyCart();
    }
  });

  test('CartRule-14 [Admin+Storefront]: rejects a code from an inactive rule', async ({ promotions, promoStorefront }, testInfo) => {
    skipWithoutProduct(testInfo);
    await promotions.login();
    const name = uniqueName('PW-Cart-Inactive');
    const code = uniqueName('PW-INACTIVE');
    let created = false;
    try {
      await promotions.createCartRule({ name, coupon: code, active: false });
      created = true;
      await prepareCart(testInfo.page, promoStorefront);
      await promoStorefront.applyCoupon(code);
      await expect(testInfo.page.locator('#messages, .messages').first()).toContainText(`Promo code "${code}" is not valid.`);
    } finally {
      if (created) await promotions.deleteRule('cart', name);
      await promoStorefront.emptyCart();
    }
  });

  test('CartRule-15 [Admin+Storefront]: stops processing after the first automatic rule', async ({ promotions, promoStorefront }, testInfo) => {
    skipWithoutEnv(testInfo, ['PW_PROMO_RULES_PRODUCT_URL', 'PW_PROMO_RULES_PRODUCT_PRICE'], 'Configure the local store for automatic No Coupon rules and provide an isolated product.');
    const name1 = uniqueName('PW-Auto-Stop');
    const name2 = uniqueName('PW-Auto-Next');
    let firstCreated = false;
    let secondCreated = false;
    await promotions.login();
    try {
      await promotions.createCartRule({ name: name1, couponType: 'none', action: 'by_percent', amount: 10, priority: 1, stopFurtherRules: true });
      firstCreated = true;
      await promotions.createCartRule({ name: name2, couponType: 'none', action: 'cart_fixed', amount: 5, priority: 2 });
      secondCreated = true;
      await promoStorefront.openProduct(promotionData.rulesProductUrl!);
      await promoStorefront.addProduct();
      await promoStorefront.openCart();
      await expect(promoStorefront.discountValue).toContainText('10.00');
      await expect(promoStorefront.discountValue).not.toContainText('15.00');
    } finally {
      if (secondCreated) await promotions.deleteRule('cart', name2);
      if (firstCreated) await promotions.deleteRule('cart', name1);
      await promoStorefront.emptyCart();
    }
  });
});
