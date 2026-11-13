import { test, expect } from '../../promotion-management/fixtures/promotion-fixtures';
import { ruleData as data } from '../data/promotion-rule-data';
import { promotionData } from '../../promotion-management/data/promotion-data';

const ruleName = (label: string) => `PW-Rule-${label}-${data.runId}`;
const missing = (values: Array<unknown>) => values.some(value => value === undefined || value === null || value === '');

async function setupCatalog(promotions: import('../../promotion-management/pages/promotion-admin-page').PromotionAdminPage, name: string, opts: Omit<Parameters<typeof promotions.createCatalogRule>[0], 'name'> = {}) {
  await promotions.login();
  await promotions.createCatalogRule({ name, ...opts });
}

async function setupAutoCartRule(promotions: import('../../promotion-management/pages/promotion-admin-page').PromotionAdminPage, name: string, opts: Omit<Parameters<typeof promotions.createCartRule>[0], 'name'> = {}) {
  await promotions.login();
  await promotions.createCartRule({ name, couponType: 'none', ...opts });
}

async function openCartWith(store: import('../../promotion-management/pages/promotion-storefront-page').PromotionStorefrontPage, url = data.productUrl) {
  await store.openProduct(url);
  await store.addProduct();
  await store.openCart();
}

test.describe('Promotion rule evaluation', () => {
  test('PromoRule-01: catalog price rule is limited to its website', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.productUrl, data.websiteControlUrl]), 'Configure the same product on two websites and PW_RULE_OTHER_WEBSITE_PRODUCT_URL.');
    const name = ruleName('Website'); let created = false;
    try {
      await setupCatalog(promotions, name, { amount: 20 }); created = true;
      await promoStorefront.openProduct(data.productUrl);
      await promoStorefront.expectPrice(data.productPrice * 0.8);
      await promoStorefront.openProduct(data.websiteControlUrl!);
      await promoStorefront.expectPrice(data.productPrice);
    } finally { if (created) await promotions.deleteRule('catalog', name); }
  });

  test('PromoRule-02: catalog rule is limited to the configured customer group', async ({ promotions, promoStorefront, browser }, info) => {
    info.skip(missing([data.groupProductUrl, data.targetGroupEmail, data.targetGroupPassword, data.targetGroupLabel]), 'Configure a target customer group, account credentials, and PW_RULE_GROUP_PRODUCT_URL.');
    const name = ruleName('Group'); let created = false;
    const customerContext = await browser.newContext(); const customer = await customerContext.newPage();
    try {
      await setupCatalog(promotions, name, { amount: 20, customerGroupLabel: data.targetGroupLabel }); created = true;
      await promoStorefront.openProduct(data.groupProductUrl!); await promoStorefront.expectPrice(data.productPrice);
      await customer.goto('/customer/account/login/'); await customer.locator('#email').fill(data.targetGroupEmail!); await customer.locator('#pass').fill(data.targetGroupPassword!); await customer.locator('#send2').click();
      await customer.goto(data.groupProductUrl!);
      await expect(customer.locator('.price-box .price, .product-info .price').last()).toContainText((data.productPrice * 0.8).toFixed(2));
    } finally { await customerContext.close(); if (created) await promotions.deleteRule('catalog', name); }
  });

  test('PromoRule-03: rule is eligible on its configured start date', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.calcProductUrl, data.calcProductPrice]), 'Configure an isolated catalog product and its baseline price.');
    const name = ruleName('Start-Date'); let created = false;
    const today = new Date(); today.setHours(12, 0, 0, 0);
    try { await setupCatalog(promotions, name, { amount: 10, fromDate: today, toDate: new Date(today.getTime() + 86_400_000) }); created = true;
      await promoStorefront.openProduct(data.calcProductUrl!); await promoStorefront.expectPrice(Number(data.calcProductPrice) * 0.9);
    } finally { if (created) await promotions.deleteRule('catalog', name); }
  });

  test('PromoRule-04: rule is inactive after the configured end boundary', async ({}, info) => {
    info.skip(true, 'Requires a controlled store-clock/date fixture so the inclusive end-date boundary can be tested without waiting or changing host time.');
  });

  test('PromoRule-05: inactive catalog rule leaves baseline price unchanged', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.calcProductUrl, data.calcProductPrice]), 'Configure an isolated catalog product and its baseline price.');
    const name = ruleName('Inactive'); let created = false;
    try { await setupCatalog(promotions, name, { active: false, amount: 30 }); created = true;
      await promoStorefront.openProduct(data.calcProductUrl!); await promoStorefront.expectPrice(Number(data.calcProductPrice));
    } finally { if (created) await promotions.deleteRule('catalog', name); }
  });

  test('PromoRule-06: product attribute condition discounts only matching product', async ({}, info) => {
    info.skip(true, 'Catalog condition-tree UI is not yet modeled; configure positive/negative attribute fixtures before enabling this case.');
  });

  test('PromoRule-07: category condition discounts only assigned product', async ({}, info) => {
    info.skip(true, 'Catalog condition-tree UI is not yet modeled; configure positive/negative category fixtures before enabling this case.');
  });

  test('PromoRule-08: percentage catalog discount uses regular price and currency rounding', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.calcProductUrl, data.calcProductPrice]), 'Configure an isolated catalog product and its baseline price.');
    const name = ruleName('Percent'); let created = false;
    try { await setupCatalog(promotions, name, { amount: 15 }); created = true;
      await promoStorefront.openProduct(data.calcProductUrl!); await promoStorefront.expectPrice(Math.round(Number(data.calcProductPrice) * 0.85 * 100) / 100);
    } finally { if (created) await promotions.deleteRule('catalog', name); }
  });

  test('PromoRule-09: fixed amount catalog action reduces price without going negative', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.calcProductUrl, data.calcProductPrice]), 'Configure an isolated catalog product and its baseline price.');
    const name = ruleName('Fixed'); let created = false; const reduction = 5;
    try { await setupCatalog(promotions, name, { amount: reduction, catalogAction: 'by_fixed' }); created = true;
      await promoStorefront.openProduct(data.calcProductUrl!); await promoStorefront.expectPrice(Number(data.calcProductPrice) - reduction);
    } finally { if (created) await promotions.deleteRule('catalog', name); }
  });

  test('PromoRule-10: zero catalog discount preserves baseline price', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.calcProductUrl, data.calcProductPrice]), 'Configure an isolated catalog product and its baseline price.');
    const name = ruleName('Zero'); let created = false;
    try { await setupCatalog(promotions, name, { amount: 0 }); created = true;
      await promoStorefront.openProduct(data.calcProductUrl!); await promoStorefront.expectPrice(Number(data.calcProductPrice));
    } finally { if (created) await promotions.deleteRule('catalog', name); }
  });

  test('PromoRule-11: maximum catalog discount does not render negative price', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.lowValueUrl]), 'Configure a low-priced product and confirm the maximum discount accepted by local Maho.');
    const name = ruleName('Maximum'); let created = false;
    try { await setupCatalog(promotions, name, { amount: 100 }); created = true;
      await promoStorefront.openProduct(data.lowValueUrl!);
      const displayed = await promoStorefront.page.locator('.price-box .price, .product-info .price, [data-price-amount]').last().innerText();
      const amount = Number(displayed.replace(/[^\d.,-]/g, '').replace(',', ''));
      expect(amount).toBeGreaterThanOrEqual(0);
    } finally { if (created) await promotions.deleteRule('catalog', name); }
  });

  test('PromoRule-12: catalog priority selects the higher-priority discount', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.priorityProductUrl, data.priorityProductPrice]), 'Configure an isolated catalog product and baseline price.');
    const first = ruleName('Priority-1'), second = ruleName('Priority-2'); let a = false, b = false;
    try { await setupCatalog(promotions, first, { amount: 10, priority: 1 }); a = true; await promotions.createCatalogRule({ name: second, amount: 20, priority: 2 }); b = true;
      await promoStorefront.openProduct(data.priorityProductUrl!); await promoStorefront.expectPrice(Number(data.priorityProductPrice) * 0.9);
    } finally { if (b) await promotions.deleteRule('catalog', second); if (a) await promotions.deleteRule('catalog', first); }
  });

  test('PromoRule-13: discard subsequent catalog rules is characterized', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.priorityProductUrl, data.priorityProductPrice]), 'Configure an isolated product to characterize discard-subsequent semantics.');
    const first = ruleName('Discard-1'), second = ruleName('Discard-2'); let a = false, b = false;
    try { await setupCatalog(promotions, first, { amount: 10, priority: 1, stopFurtherRules: true }); a = true; await promotions.createCatalogRule({ name: second, amount: 20, priority: 2 }); b = true;
      await promoStorefront.openProduct(data.priorityProductUrl!); await promoStorefront.expectPrice(Number(data.priorityProductPrice) * 0.9);
    } finally { if (b) await promotions.deleteRule('catalog', second); if (a) await promotions.deleteRule('catalog', first); }
  });

  test('PromoRule-14: editing a catalog rule updates effective price', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.applyProductUrl, data.applyProductPrice]), 'Configure an isolated product for before/after price comparison.');
    const name = ruleName('Edit'); let created = false;
    try { await setupCatalog(promotions, name, { amount: 10 }); created = true; await promoStorefront.openProduct(data.applyProductUrl!); await promoStorefront.expectPrice(Number(data.applyProductPrice) * 0.9);
      await promotions.updateCatalogDiscount(name, 20);
      await promoStorefront.openProduct(data.applyProductUrl!); await promoStorefront.expectPrice(Number(data.applyProductPrice) * 0.8);
    } finally { if (created) await promotions.deleteRule('catalog', name); }
  });

  test('PromoRule-15: deleting catalog rule restores baseline price', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.applyProductUrl, data.applyProductPrice]), 'Configure an isolated product for before/after price comparison.');
    const name = ruleName('Delete'); let created = false;
    try { await setupCatalog(promotions, name, { amount: 10 }); created = true; await promoStorefront.openProduct(data.applyProductUrl!); await promoStorefront.expectPrice(Number(data.applyProductPrice) * 0.9);
      await promotions.deleteRule('catalog', name); created = false; await promoStorefront.openProduct(data.applyProductUrl!); await promoStorefront.expectPrice(Number(data.applyProductPrice));
    } finally { if (created) await promotions.deleteRule('catalog', name); }
  });

  test('PromoRule-16: automatic subtotal condition changes below/at/above threshold', async ({}, info) => {
    info.skip(true, 'Cart condition-tree UI is not yet modeled; this requires three exact-total products and a subtotal condition fixture.');
  });

  test('PromoRule-17: automatic quantity condition becomes eligible at N', async ({}, info) => {
    info.skip(true, 'Cart condition-tree UI is not yet modeled; this requires a quantity threshold condition fixture.');
  });

  test('PromoRule-18: category rule in mixed cart leaves control item unaffected', async ({}, info) => {
    info.skip(true, 'Cart condition-tree UI is not yet modeled; this requires a category condition and matching/control product fixtures.');
  });

  test('PromoRule-19: stop-processing prevents later automatic cart rule', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.rulesProductUrl, data.rulesProductPrice]), 'Configure an isolated cart-rule product and baseline price.');
    const first = ruleName('Auto-Stop'), second = ruleName('Auto-Next'); let a = false, b = false;
    try { await setupAutoCartRule(promotions, first, { action: 'by_percent', amount: 10, priority: 1, stopFurtherRules: true }); a = true;
      await promotions.createCartRule({ name: second, couponType: 'none', action: 'cart_fixed', amount: 5, priority: 2 }); b = true;
      await openCartWith(promoStorefront, data.rulesProductUrl!); await promoStorefront.expectCartDiscount(Number(data.rulesProductPrice) * 0.1);
    } finally { if (b) await promotions.deleteRule('cart', second); if (a) await promotions.deleteRule('cart', first); await promoStorefront.emptyCart(); }
  });

  test('PromoRule-20: compatible automatic cart rules stack when stop is off', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.rulesProductUrl, data.rulesProductPrice]), 'Configure an isolated cart-rule product and baseline price.');
    const first = ruleName('Auto-Stack-1'), second = ruleName('Auto-Stack-2'); let a = false, b = false;
    try { await setupAutoCartRule(promotions, first, { action: 'by_percent', amount: 10, priority: 1 }); a = true;
      await promotions.createCartRule({ name: second, couponType: 'none', action: 'cart_fixed', amount: 5, priority: 2 }); b = true;
      await openCartWith(promoStorefront, data.rulesProductUrl!); await expect(promoStorefront.discountValue).toBeVisible();
      const discount = await promoStorefront.cartDiscountText(); expect(discount).toContain((Number(data.rulesProductPrice) * 0.1 + 5).toFixed(2));
    } finally { if (b) await promotions.deleteRule('cart', second); if (a) await promotions.deleteRule('cart', first); await promoStorefront.emptyCart(); }
  });

  test('PromoRule-21: automatic fixed-cart discount cannot exceed cart merchandise value', async ({ promotions, promoStorefront }, info) => {
    info.skip(missing([data.lowValueUrl]), 'Configure a low-value product for fixed-cart cap boundary.');
    const name = ruleName('Cart-Cap'); let created = false;
    try { await setupAutoCartRule(promotions, name, { action: 'cart_fixed', amount: 1000 }); created = true; await openCartWith(promoStorefront, data.lowValueUrl!);
      const total = await promoStorefront.page.locator('#shopping-cart-totals-table').innerText(); expect(total).not.toMatch(/-\s*\$\s*\d/);
      const discount = await promoStorefront.cartDiscountText(); expect(Number(discount.replace(/[^\d.-]/g, ''))).toBeLessThanOrEqual(0);
    } finally { if (created) await promotions.deleteRule('cart', name); await promoStorefront.emptyCart(); }
  });

  test('PromoRule-22: Buy 2 Get 1 applies only at the three-unit boundary', async ({ promotions, promoStorefront }, info) => {
    info.skip(data.requiresProduct, 'Configure a shippable/in-stock product fixture.');
    const name = ruleName('Buy-2-Get-1'); let created = false;
    try { await setupAutoCartRule(promotions, name, { action: 'buy_x_get_y', amount: 1, discountStep: 2, discountQty: 1 }); created = true;
      await promoStorefront.openProduct(data.productUrl); await promoStorefront.addProduct(2); await promoStorefront.openCart(); await promoStorefront.expectNoCartDiscount(); await promoStorefront.emptyCart();
      await promoStorefront.openProduct(data.productUrl); await promoStorefront.addProduct(3); await promoStorefront.openCart(); await promoStorefront.expectCartDiscount(data.productPrice);
    } finally { if (created) await promotions.deleteRule('cart', name); await promoStorefront.emptyCart(); }
  });

  test('PromoRule-23: automatic free-shipping action zeros eligible shipping', async ({}, info) => {
    info.skip(true, 'Free-shipping configuration uses a separate action control not modeled by the current Admin page object.');
  });

  test('PromoRule-24: rendered subtotal, discount, tax, shipping and grand total reconcile', async ({ promotions, promoStorefront }, info) => {
    info.skip(!data.taxEnabled || missing([data.rulesProductUrl, data.rulesProductPrice]), 'Enable store tax and set PW_RULE_TAX_ENABLED=true with an isolated cart-rule product.');
    const name = ruleName('Tax'); let created = false;
    try { await setupAutoCartRule(promotions, name, { action: 'by_percent', amount: 10 }); created = true; await openCartWith(promoStorefront, data.rulesProductUrl!);
      const rows = await promoStorefront.page.locator('#shopping-cart-totals-table tr').allInnerTexts();
      const readAmount = (pattern: RegExp, required = false): number => {
        const row = rows.find(text => pattern.test(text));
        if (!row) { if (required) throw new Error(`Missing cart total row matching ${pattern}`); return 0; }
        const token = row.match(/-?\s*(?:[$€£]\s*)?\d[\d,]*(?:\.\d{2})?/);
        if (!token) { if (required) throw new Error(`No amount found in cart total row: ${row}`); return 0; }
        return Number(token[0].replace(/[^\d.-]/g, ''));
      };
      const subtotal = readAmount(/subtotal/i, true);
      const discount = readAmount(/discount/i);
      const tax = readAmount(/tax/i);
      const shipping = readAmount(/shipping/i);
      const grand = readAmount(/grand total|order total|^total/i, true);
      expect(grand).toBeGreaterThan(0);
      expect(Math.abs(subtotal + discount + tax + shipping - grand)).toBeLessThanOrEqual(1 / (10 ** data.currencyDecimals));
      const totals = rows.join(' | ');
      info.annotations.push({ type: 'observed-cart-totals', description: totals.replace(/\s+/g, ' ') });
    } finally { if (created) await promotions.deleteRule('cart', name); await promoStorefront.emptyCart(); }
  });
});
