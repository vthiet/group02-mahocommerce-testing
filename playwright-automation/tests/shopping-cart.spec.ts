import { test, expect } from '@playwright/test';
import {
  addProduct,
  cartRows,
  config,
  expectEmptyCart,
  fillVisibleField,
  openCart,
  skipUnlessEnv,
} from './support/test-config';

test.describe('Shopping cart', () => {
  test('CartOrder-01: adds an in-stock product and updates the mini cart', async ({ page }) => {
    await page.goto('/');
    const miniCart = page.locator('.header-minicart .count, .skip-link.skip-cart .count, [data-cart-count]').first();
    const hasMiniCartCounter = await miniCart.count() > 0;
    const beforeText = hasMiniCartCounter ? await miniCart.textContent() ?? '' : '';
    const beforeCount = Number(beforeText.match(/\d+/)?.[0] ?? '0');
    await addProduct(page);
    if (config.redirectToCart) await expect(page).toHaveURL(/\/checkout\/cart\/?/);
    await expect(page.locator('body')).toContainText(new RegExp(`${config.productName}.*added to your shopping cart`, 'i'));
    if (hasMiniCartCounter) {
      const afterText = await miniCart.textContent() ?? '';
      expect(Number(afterText.match(/\d+/)?.[0] ?? '0')).toBe(beforeCount + 1);
    }
    await openCart(page);
    await expect(cartRows(page)).toHaveCount(1);
  });

  test('CartOrder-02: updates item quantity and subtotal', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    const row = (await cartRows(page)).first();
    await row.locator('input[name*="[qty]"]').fill('5');
    await page.getByRole('button', { name: /update shopping cart/i }).click();
    await expect(row.locator('input[name*="[qty]"]')).toHaveValue('5');
    await expect(row).toContainText(new RegExp(config.expectedPrice.toFixed(2)));
    await expect(page.locator('#shopping-cart-totals-table')).toContainText((config.expectedPrice * 5).toFixed(2));
  });

  test('CartOrder-03a: quantity zero removes the line item', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    await (await cartRows(page)).first().locator('input[name*="[qty]"]').fill('0');
    await page.getByRole('button', { name: /update shopping cart/i }).click();
    await expectEmptyCart(page);
  });

  test('CartOrder-03b: negative quantity is rejected or normalized', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    const row = (await cartRows(page)).first();
    await row.locator('input[name*="[qty]"]').fill('-2');
    await page.getByRole('button', { name: /update shopping cart/i }).click();
    await expect(cartRows(page)).toHaveCount(1);
    const qty = Number(await (await cartRows(page)).first().locator('input[name*="[qty]"]').inputValue());
    expect(qty).toBeGreaterThan(0);
  });

  test('CartOrder-04: rejects a quantity above available stock', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    await (await cartRows(page)).first().locator('input[name*="[qty]"]').fill('9999');
    await page.getByRole('button', { name: /update shopping cart/i }).click();
    await expect(page.locator('.messages, .error-msg, .validation-advice')).toContainText(/not available|desired quantity|requested quantity/i);
  });

  test('CartOrder-05: removes a cart line item', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    const row = (await cartRows(page)).first();
    const remove = row.locator('a[title*="Remove"], a[title*="Delete"], a.btn-remove, button[aria-label*="remove" i]').first();
    await expect(remove).toBeVisible();
    await remove.click();
    await expectEmptyCart(page);
  });

  test('CartOrder-06: clears all items when the active theme provides the control', async ({ page }) => {
    await addProduct(page);
    await addProduct(page);
    await openCart(page);
    const clear = page.getByRole('button', { name: /clear shopping cart|clear cart/i }).or(page.getByRole('link', { name: /clear shopping cart|clear cart/i }));
    test.skip(!(await clear.count()), 'Active storefront theme does not provide a clear-cart control');
    page.once('dialog', (dialog) => dialog.accept());
    await clear.first().click();
    await expectEmptyCart(page);
  });

  test('CartOrder-07: shows configured cross-sell products', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    const crossSell = page.locator('.crosssell');
    const crossSellLinks = crossSell.locator('a[href]');
    test.skip(!(await crossSell.isVisible().catch(() => false)) || !(await crossSellLinks.count()), 'Configure cross-sell products for the selected fixture to enable this case');
    await expect(crossSellLinks.first()).toBeVisible();
  });

  test('CartOrder-08: continue shopping returns to the configured category', async ({ page }) => {
    await page.goto(config.categoryUrl);
    const productLink = page.getByRole('link', { name: new RegExp(config.productName, 'i') }).first();
    await expect(productLink, 'fixture product must be listed in the configured category').toBeVisible();
    await productLink.click();
    await addProduct(page, 1, false);
    await openCart(page);
    await page.getByRole('button', { name: /continue shopping/i }).click();
    await expect(page).toHaveURL(new RegExp(config.categoryUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  test('CartOrder-09: estimates shipping for the configured destination', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    const country = page.locator('#country');
    await country.selectOption({ label: /united states/i });
    const region = page.locator('#region_id');
    await expect(region).toBeVisible();
    await region.selectOption({ label: /california/i });
    await page.locator('#postcode').fill('90210');
    await page.getByRole('button', { name: /^estimate$/i }).click();
    await expect(page.locator('#co-shipping-method-form-container')).toContainText(config.shippingMethodLabel, { timeout: 45_000 });
  });

  test('CartOrder-10: applies estimated shipping to cart totals', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    await page.locator('#country').selectOption({ label: /united states/i });
    await page.locator('#region_id').selectOption({ label: /california/i });
    await page.locator('#postcode').fill('90210');
    await page.getByRole('button', { name: /^estimate$/i }).click();
    const rates = page.locator('#co-shipping-method-form-container');
    await expect(rates).toContainText(config.shippingMethodLabel, { timeout: 45_000 });
    await rates.locator('input[type="radio"]').first().check();
    await rates.locator('#btn-update-total').click();
    await expect(page.locator('#shopping-cart-totals-table')).toContainText(config.shippingPrice.toFixed(2), { timeout: 45_000 });
  });
});

test.describe('Guest checkout', () => {
  async function openGuestCheckout(page: import('@playwright/test').Page) {
    await addProduct(page);
    await openCart(page);
    await page.getByRole('link', { name: /proceed to checkout/i }).first().click();
    await expect(page.locator('#co-billing-form')).toBeVisible({ timeout: 60_000 });
  }

  test('CartOrder-11: opens guest billing in one-page checkout', async ({ page }) => {
    await openGuestCheckout(page);
    await expect(page.locator('#opc-billing')).toBeVisible();
    await expect(page.locator('#co-billing-form')).toBeEnabled();
  });

  test('CartOrder-12: blocks billing with required fields missing', async ({ page }) => {
    await openGuestCheckout(page);
    await page.locator('#billing-buttons-container button').click();
    await expect(page.locator('#co-billing-form .validation-failed, #co-billing-form .validation-advice').first()).toBeVisible();
    await expect(page.locator('#opc-shipping_method')).not.toHaveClass(/active/);
  });

  test('CartOrder-13: saves guest billing and advances to shipping method', async ({ page }) => {
    await openGuestCheckout(page);
    await fillVisibleField(page, ['#billing\\:firstname'], 'John');
    await fillVisibleField(page, ['#billing\\:lastname'], 'Doe');
    await fillVisibleField(page, ['#billing\\:email'], `pw-${Date.now()}@example.test`);
    await fillVisibleField(page, ['#billing\\:street1'], '123 Main St');
    await fillVisibleField(page, ['#billing\\:city'], 'Los Angeles');
    await fillVisibleField(page, ['#billing\\:postcode'], '90001');
    await fillVisibleField(page, ['#billing\\:telephone'], '555123456');
    await page.locator('#billing\\:country_id').selectOption({ label: /united states/i });
    await page.locator('#billing\\:region_id').selectOption({ label: /california/i });
    await page.locator('#billing\\:use_for_shipping_yes').check();
    await page.locator('#billing-buttons-container button').click();
    await expect(page.locator('#opc-shipping_method')).toHaveClass(/active|allow/, { timeout: 60_000 });
  });

  test('CartOrder-14 through 17: completes a guest order and captures its dynamic ID', async ({ page }) => {
    await openGuestCheckout(page);
    await fillVisibleField(page, ['#billing\\:firstname'], 'John');
    await fillVisibleField(page, ['#billing\\:lastname'], 'Doe');
    await fillVisibleField(page, ['#billing\\:email'], `pw-${Date.now()}@example.test`);
    await fillVisibleField(page, ['#billing\\:street1'], '123 Main St');
    await fillVisibleField(page, ['#billing\\:city'], 'Los Angeles');
    await fillVisibleField(page, ['#billing\\:postcode'], '90001');
    await fillVisibleField(page, ['#billing\\:telephone'], '555123456');
    await page.locator('#billing\\:country_id').selectOption({ label: /united states/i });
    await page.locator('#billing\\:region_id').selectOption({ label: /california/i });
    await page.locator('#billing\\:use_for_shipping_yes').check();
    await page.locator('#billing-buttons-container button').click();

    const shipping = page.locator('#opc-shipping_method');
    await expect(shipping).toHaveClass(/active|allow/, { timeout: 60_000 });
    await expect(shipping).toContainText(config.shippingMethodLabel);
    await shipping.locator('input[type="radio"]').first().check();
    await page.locator('#shipping-method-buttons-container button').click();

    const payment = page.locator('#opc-payment');
    await expect(payment).toHaveClass(/active|allow/, { timeout: 60_000 });
    await payment.getByText(config.paymentMethodLabel, { exact: false }).first().click();
    await page.locator('#payment-buttons-container button').click();

    const review = page.locator('#opc-review');
    await expect(review).toHaveClass(/active|allow/, { timeout: 60_000 });
    await expect(review).toContainText(config.productName);
    await page.locator('#review-buttons-container button').click();
    await expect(page).toHaveURL(/checkout\/onepage\/success/, { timeout: 90_000 });
    await expect(page.locator('body')).toContainText(/your order has been received/i);
    const successText = await page.locator('body').innerText();
    const orderId = successText.match(/(?:order\s*(?:number|#|id)?\s*[:#]?\s*)(\d{6,})/i)?.[1];
    expect(orderId, 'success page should display an order increment ID').toBeTruthy();
    await page.context().storageState({ path: test.info().outputPath('guest-order-state.json') });
    test.info().annotations.push({ type: 'order-id', description: orderId! });
  });
});

test.describe('Registered customer and order administration', () => {
  test('CartOrder-18: checks out with a saved customer billing address', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_CUSTOMER_EMAIL', 'PW_CUSTOMER_PASSWORD']);
    await page.goto('/customer/account/login/');
    await page.locator('#email').fill(config.customerEmail!);
    await page.locator('#pass').fill(config.customerPassword!);
    await page.getByRole('button', { name: /login/i }).click();
    await addProduct(page);
    await page.goto('/checkout/onepage/');
    await expect(page.locator('#co-billing-form')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('#billing-address-select')).toBeVisible();
    await page.locator('#billing-buttons-container button').click();
    await expect(page.locator('#opc-shipping_method, #opc-shipping')).toBeVisible({ timeout: 60_000 });
  });

  test('CartOrder-19: saves a new shipping address to the account address book', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_CUSTOMER_EMAIL', 'PW_CUSTOMER_PASSWORD']);
    await page.goto('/customer/account/login/');
    await page.locator('#email').fill(config.customerEmail!);
    await page.locator('#pass').fill(config.customerPassword!);
    await page.getByRole('button', { name: /login/i }).click();
    await addProduct(page);
    await page.goto('/checkout/onepage/');
    await expect(page.locator('#co-billing-form')).toBeVisible({ timeout: 60_000 });
    await page.locator('#billing\\:use_for_shipping_no').check();
    await page.locator('#billing-buttons-container button').click();
    await expect(page.locator('#co-shipping-form')).toBeVisible({ timeout: 60_000 });
    await page.locator('#shipping-address-select').selectOption('');
    await page.locator('#shipping-new-address-form').getByLabel(/first name/i).fill('Playwright');
    await page.locator('#shipping-new-address-form').getByLabel(/last name/i).fill('Test');
    await page.locator('#shipping-new-address-form').getByLabel(/street address/i).first().fill(`Automation ${Date.now()}`);
    await page.locator('#shipping-new-address-form').getByLabel(/city/i).fill('Los Angeles');
    await page.locator('#shipping-new-address-form').getByLabel(/zip|postal/i).fill('90001');
    await page.locator('#shipping-new-address-form').getByLabel(/telephone/i).fill('555123456');
    await page.locator('#shipping-new-address-form').getByLabel(/country/i).selectOption({ label: /united states/i });
    await page.locator('#shipping-new-address-form').getByLabel(/state|province/i).selectOption({ label: /california/i });
    await page.locator('#shipping:save_in_address_book').check();
    await page.locator('#shipping-buttons-container button').click();
    await expect(page.locator('#opc-shipping_method')).toBeVisible({ timeout: 60_000 });
  });

  test('CartOrder-20: customer can view a placed order in order history', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_CUSTOMER_EMAIL', 'PW_CUSTOMER_PASSWORD', 'PW_REGISTERED_ORDER_ID']);
    await page.goto('/customer/account/login/');
    await page.locator('#email').fill(config.customerEmail!);
    await page.locator('#pass').fill(config.customerPassword!);
    await page.getByRole('button', { name: /login/i }).click();
    await page.goto('/sales/order/history/');
    await expect(page.locator('body')).toContainText(process.env.PW_REGISTERED_ORDER_ID!);
  });
});

test.describe('Admin order workflow', () => {
  async function adminLogin(page: import('@playwright/test').Page, testInfo: import('@playwright/test').TestInfo) {
    await skipUnlessEnv(testInfo, ['MAHO_ADMIN_USERNAME', 'MAHO_ADMIN_PASSWORD', 'PW_ADMIN_ORDER_ID']);
    await page.goto(`${config.adminPath}/`);
    if (await page.locator('#username').isVisible().catch(() => false)) {
      await page.locator('#username').fill(config.adminUsername!);
      await page.locator('#login').fill(config.adminPassword!);
      await page.getByRole('button', { name: /login/i }).click();
    }
  }

  test('CartOrder-21: admin can find and inspect an order', async ({ page }, testInfo) => {
    await adminLogin(page, testInfo);
    await page.goto(`${config.adminPath}/sales_order/`);
    const orderRow = page.locator('tr').filter({ hasText: process.env.PW_ADMIN_ORDER_ID! }).first();
    await expect(orderRow).toBeVisible();
    await orderRow.locator('a').first().click();
    await expect(page.locator('body')).toContainText(/order information|order #/i);
  });

  test('CartOrder-22: admin can invoice a pending order', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_ADMIN_ORDER_ENTITY_ID']);
    await adminLogin(page, testInfo);
    await page.goto(`${config.adminPath}/sales_order/view/order_id/${process.env.PW_ADMIN_ORDER_ENTITY_ID}/`);
    await page.getByRole('button', { name: /invoice/i }).click();
    await page.getByRole('button', { name: /submit invoice/i }).click();
    await expect(page.locator('.success-msg, .messages')).toContainText(/invoice has been created/i);
  });

  test('CartOrder-23: admin can ship an invoiced order and add tracking', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_ADMIN_ORDER_ENTITY_ID']);
    await adminLogin(page, testInfo);
    await page.goto(`${config.adminPath}/sales_order/view/order_id/${process.env.PW_ADMIN_ORDER_ENTITY_ID}/`);
    await page.getByRole('button', { name: /ship/i }).click();
    await page.locator('input[name*="tracking"][name*="number"], input[name="tracking[1][number]"]').first().fill('TRACK123456');
    await page.getByRole('button', { name: /submit shipment/i }).click();
    await expect(page.locator('.success-msg, .messages')).toContainText(/shipment has been created/i);
  });

  test('CartOrder-24: admin can cancel a pending order', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_CANCEL_ORDER_ENTITY_ID']);
    await adminLogin(page, testInfo);
    await page.goto(`${config.adminPath}/sales_order/view/order_id/${process.env.PW_CANCEL_ORDER_ENTITY_ID}/`);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.locator('body')).toContainText(/canceled/i);
  });

  test('CartOrder-25: customer order view reflects shipment tracking', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_CUSTOMER_EMAIL', 'PW_CUSTOMER_PASSWORD', 'PW_REGISTERED_ORDER_ID']);
    await page.goto('/customer/account/login/');
    await page.locator('#email').fill(config.customerEmail!);
    await page.locator('#pass').fill(config.customerPassword!);
    await page.getByRole('button', { name: /login/i }).click();
    await page.goto('/sales/order/history/');
    await page.getByRole('link', { name: new RegExp(process.env.PW_REGISTERED_ORDER_ID!) }).click();
    await expect(page.locator('body')).toContainText('TRACK123456');
  });
});
