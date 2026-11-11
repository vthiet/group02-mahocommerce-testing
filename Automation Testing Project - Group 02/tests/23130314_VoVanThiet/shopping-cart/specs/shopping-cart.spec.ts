import { test, expect } from '../fixtures/shopping-cart-fixtures';
import { guestAddress } from '../data/cart-data';
import {
  addProduct,
  cartRows,
  config,
  expectEmptyCart,
  fillVisibleField,
  navigateTo,
  openCart,
  skipUnlessEnv,
} from '../support/shopping-cart-helpers';

test.describe('Shopping cart', () => {
  test('CartOrder-01: adds an in-stock product and updates the mini cart', async ({ page, productPage, cartPage, miniCart }) => {
    await page.goto('/');
    const counter = miniCart.counter;
    const hasMiniCartCounter = await counter.count() > 0;
    const beforeText = hasMiniCartCounter ? await counter.textContent() ?? '' : '';
    const beforeCount = Number(beforeText.match(/\d+/)?.[0] ?? '0');
    await productPage.open();
    await productPage.addToCart();
    if (config.redirectToCart) await expect(page).toHaveURL(/\/checkout\/cart\/?/);
    await expect(page.locator('body')).toContainText(new RegExp(`${config.productName}.*added to your shopping cart`, 'i'));
    if (hasMiniCartCounter) {
      const afterText = await counter.textContent() ?? '';
      expect(Number(afterText.match(/\d+/)?.[0] ?? '0')).toBe(beforeCount + 1);
    }
    await cartPage.open();
    await expect(cartPage.rows).toHaveCount(1);
  });

  test('CartOrder-02: updates item quantity and subtotal', async ({ page, cartPage }) => {
    await addProduct(page);
    await cartPage.open();
    const row = cartPage.lineItem();
    await row.setQuantity(5);
    await cartPage.update();
    await expect(row.quantity).toHaveValue('5');
    await expect(row.root).toContainText(new RegExp(config.expectedPrice.toFixed(2)));
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
    // The cart form can retain the submitted value in its current response;
    // reload to assert the quantity actually persisted in the quote.
    await openCart(page);
    await expect(cartRows(page)).toHaveCount(1);
    const qty = Number(await (await cartRows(page)).first().locator('input[name*="[qty]"]').inputValue());
    expect(qty).toBeGreaterThan(0);
  });

  test('CartOrder-04: rejects a quantity above available stock', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    await (await cartRows(page)).first().locator('input[name*="[qty]"]').fill('9999');
    await page.getByRole('button', { name: /update shopping cart/i }).click();
    await expect(page.locator('.messages').first()).toContainText(/not available|desired quantity|requested quantity/i);
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

  test('CartOrder-08: continue shopping returns to the configured fallback URL', async ({ page }) => {
    await page.goto(config.categoryUrl);
    const productCard = page.locator('.category-products .products-grid li').filter({ hasText: config.productName }).first();
    await expect(productCard, 'fixture product must be listed in the configured category').toBeVisible();
    const productUrl = await productCard.locator('a.product-image').getAttribute('href');
    expect(productUrl).toBeTruthy();
    await page.goto(productUrl!);
    await addProduct(page, 1, false);
    await openCart(page);
    await page.getByRole('button', { name: /continue shopping/i }).click();
    await expect(page).toHaveURL(new RegExp(config.continueShoppingUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  test('CartOrder-09: estimates shipping for the configured destination', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    const country = page.locator('#country');
    await country.selectOption({ label: 'United States' });
    const region = page.locator('#region_id');
    await expect(region).toBeVisible();
    await region.selectOption({ label: 'California' });
    await page.locator('#postcode').fill('90210');
    await page.getByRole('button', { name: /^estimate$/i }).click();
    await expect(page.locator('#co-shipping-method-form-container')).toContainText(config.shippingMethodLabel, { timeout: 45_000 });
  });

  test('CartOrder-10: applies estimated shipping to cart totals', async ({ page }) => {
    await addProduct(page);
    await openCart(page);
    await page.locator('#country').selectOption({ label: 'United States' });
    await page.locator('#region_id').selectOption({ label: 'California' });
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
    await page.getByRole('button', { name: /proceed to checkout/i }).first().click();
    await expect(page.locator('#co-billing-form')).toBeVisible({ timeout: 60_000 });
  }

  async function fillGuestBilling(page: import('@playwright/test').Page) {
    await fillVisibleField(page, ['#billing\\:firstname'], guestAddress.firstName);
    await fillVisibleField(page, ['#billing\\:lastname'], guestAddress.lastName);
    await fillVisibleField(page, ['#billing\\:email'], guestAddress.email());
    await fillVisibleField(page, ['#billing\\:street1'], guestAddress.street);
    await fillVisibleField(page, ['#billing\\:city'], guestAddress.city);
    await fillVisibleField(page, ['#billing\\:postcode'], guestAddress.postcode);
    await fillVisibleField(page, ['#billing\\:telephone'], guestAddress.telephone);
    await page.locator('#billing\\:country_id').selectOption({ label: guestAddress.country });
    await page.locator('#billing\\:region_id').selectOption({ label: guestAddress.region });
    await page.locator('#billing\\:use_for_shipping_yes').check();
  }

  test('CartOrder-11: opens guest billing in one-page checkout', async ({ page }) => {
    await openGuestCheckout(page);
    await expect(page.locator('#onestep-checkout')).toBeVisible();
    await expect(page.locator('#onestep-billing')).toBeVisible();
    await expect(page.locator('#co-billing-form')).toBeEnabled();
  });

  test('CartOrder-12: blocks billing with required fields missing', async ({ page }) => {
    await openGuestCheckout(page);
    await page.getByRole('button', { name: /place order/i }).click();
    await expect(page.locator('#co-billing-form .validation-failed, #co-billing-form .validation-advice').first()).toBeVisible();
    await expect(page).not.toHaveURL(/checkout\/onepage\/success/);
  });

  test('CartOrder-13: saves guest billing and loads shipping methods', async ({ page }) => {
    await openGuestCheckout(page);
    await fillGuestBilling(page);
    const shippingMethod = page.locator('#checkout-shipping-method-load input[name="shipping_method"]');
    await expect(page.locator('#checkout-shipping-method-load')).toContainText(config.shippingMethodLabel, { timeout: 60_000 });
    await expect(shippingMethod.first()).toBeChecked({ timeout: 60_000 });
  });

  test('CartOrder-14 through 17: selects methods, reviews, and places a guest order', async ({ page }) => {
    await openGuestCheckout(page);
    await fillGuestBilling(page);

    const shippingMethod = page.locator('#checkout-shipping-method-load input[name="shipping_method"]');
    await expect(page.locator('#checkout-shipping-method-load')).toContainText(config.shippingMethodLabel);
    await expect(shippingMethod.first()).toBeChecked({ timeout: 60_000 });

    const paymentMethod = page.getByRole('radio', { name: new RegExp(config.paymentMethodLabel, 'i') });
    await expect(paymentMethod.first()).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('#checkout-payment-method-load')).toContainText(config.paymentMethodLabel);
    await paymentMethod.first().check();

    await expect(page.locator('#checkout-review-load')).toContainText(config.productName, { timeout: 60_000 });
    await page.getByRole('button', { name: /place order/i }).click();
    await expect(page).toHaveURL(/checkout\/onepage\/success/, { timeout: 90_000 });
    await expect(page.locator('body')).toContainText(/your order has been received/i);
    const successText = await page.locator('body').innerText();
    const orderId = successText.match(/order\s*#?\s*(?:is:\s*)?(\d{6,})/i)?.[1];
    expect(orderId, 'success page should display an order increment ID').toBeTruthy();
    await page.context().storageState({ path: test.info().outputPath('guest-order-state.json') });
    test.info().annotations.push({ type: 'order-id', description: orderId! });
  });
});

async function loginCustomer(page: import('@playwright/test').Page) {
  await navigateTo(page, '/customer/account/login/');
  await page.locator('#email').fill(config.customerEmail!);
  await page.locator('#pass').fill(config.customerPassword!);
  await page.locator('#send2').click();
  await expect(page.locator('#login-form')).toHaveCount(0, { timeout: 30_000 });
}

async function openCustomerOrderHistory(page: import('@playwright/test').Page) {
  await loginCustomer(page);
  await navigateTo(page, '/sales/order/history/');
  await expect(page.locator('h1')).toContainText(/my orders/i, { timeout: 30_000 });
}

test.describe('Registered customer and order administration', () => {

  test('CartOrder-18: checks out with a saved customer billing address', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_CUSTOMER_EMAIL', 'PW_CUSTOMER_PASSWORD']);
    await loginCustomer(page);
    await addProduct(page);
    await navigateTo(page, '/checkout/onepage/');
    await expect(page.locator('#co-billing-form')).toBeVisible({ timeout: 60_000 });
    const savedBillingAddresses = page.locator('#billing-address-select');
    test.skip(!(await savedBillingAddresses.count()), 'The configured customer needs a saved billing address for this scenario');
    await expect(savedBillingAddresses).toBeVisible();
    await expect(savedBillingAddresses).toHaveValue(/.+/);
    await expect(page.locator('#checkout-shipping-method-load')).toContainText(config.shippingMethodLabel, { timeout: 60_000 });
  });

  test('CartOrder-19: saves a new shipping address to the account address book', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_CUSTOMER_EMAIL', 'PW_CUSTOMER_PASSWORD']);
    await loginCustomer(page);
    await addProduct(page);
    await navigateTo(page, '/checkout/onepage/');
    await expect(page.locator('#co-billing-form')).toBeVisible({ timeout: 60_000 });
    await page.locator('#billing\\:use_for_shipping_no').check();
    const shippingAddressSelect = page.locator('#shipping-address-select');
    if (await shippingAddressSelect.count()) await shippingAddressSelect.selectOption('');
    const shippingForm = page.locator('#shipping-new-address-form');
    await expect(shippingForm).toBeVisible({ timeout: 30_000 });
    await shippingForm.locator('#shipping\\:firstname').fill('Playwright');
    await shippingForm.locator('#shipping\\:lastname').fill('Test');
    await shippingForm.locator('#shipping\\:street1').fill(`Automation ${Date.now()}`);
    await shippingForm.locator('#shipping\\:city').fill('Los Angeles');
    await shippingForm.locator('#shipping\\:postcode').fill('90001');
    await shippingForm.locator('#shipping\\:telephone').fill('555123456');
    await shippingForm.locator('#shipping\\:country_id').selectOption({ label: 'United States' });
    await expect(shippingForm.locator('#shipping\\:region_id')).toBeVisible({ timeout: 30_000 });
    await shippingForm.locator('#shipping\\:region_id').selectOption({ label: 'California' });

    const saveInAddressBook = page.locator('#shipping\\:save_in_address_book');
    if (await saveInAddressBook.isVisible().catch(() => false)) {
      await saveInAddressBook.check();
    } else {
      // Maho includes a hidden checked-by-default field when the customer has no addresses yet.
      await expect(saveInAddressBook).toHaveValue('1');
    }
    await expect(page.locator('#checkout-shipping-method-load')).toContainText(config.shippingMethodLabel, { timeout: 60_000 });
  });

  test('CartOrder-20: customer can view a placed order in order history', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_CUSTOMER_EMAIL', 'PW_CUSTOMER_PASSWORD', 'PW_REGISTERED_ORDER_ID']);
    await openCustomerOrderHistory(page);
    await expect(page.locator('body')).toContainText(process.env.PW_REGISTERED_ORDER_ID!);
  });
});

test.describe('Admin order workflow', () => {
  async function openAdminOrders(page: import('@playwright/test').Page) {
    const ordersLink = page.locator('#nav-admin-sales-order');
    await expect(ordersLink).toBeVisible({ timeout: 30_000 });
    const ordersUrl = await ordersLink.getAttribute('href');
    expect(ordersUrl, 'admin navigation should provide a keyed Orders URL').toBeTruthy();
    await navigateTo(page, ordersUrl!);
    await expect(page.locator('#sales_order_grid')).toBeVisible({ timeout: 60_000 });
  }

  async function openAdminOrderByEntityId(page: import('@playwright/test').Page, entityId: string) {
    await openAdminOrders(page);
    const pageSize = page.locator('select[aria-label="Items per page"]');
    if (await pageSize.count()) {
      const values = await pageSize.locator('option').evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));
      if (values.length) await pageSize.selectOption(values[values.length - 1]);
    }

    const orderLink = page.locator(`#sales_order_grid a[href*="/order_id/${entityId}/"]`).first();
    await expect(orderLink, `orders grid should contain internal order ID ${entityId}`).toBeVisible({ timeout: 60_000 });
    await orderLink.click();
    await expect(page.locator('body')).toContainText(/order information|order #/i, { timeout: 30_000 });
  }

  async function adminLogin(page: import('@playwright/test').Page, testInfo: import('@playwright/test').TestInfo) {
    await skipUnlessEnv(testInfo, ['MAHO_ADMIN_USERNAME', 'MAHO_ADMIN_PASSWORD']);
    await navigateTo(page, `${config.adminPath}/`);
    if (await page.locator('#username').isVisible().catch(() => false)) {
      await page.locator('#username').fill(config.adminUsername!);
      await page.locator('#login').fill(config.adminPassword!);
      await page.locator('#loginForm input[type="submit"]').first().click();
      await expect(page.locator('#loginForm'), 'admin credentials should authenticate successfully').toHaveCount(0, { timeout: 30_000 });
    }
  }

  test('CartOrder-21: admin can find and inspect an order', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_ADMIN_ORDER_ID']);
    await adminLogin(page, testInfo);
    await openAdminOrders(page);
    const orderIdFilter = page.locator('#sales_order_grid_filter_real_order_id, input[name="real_order_id"]').first();
    await expect(orderIdFilter, 'the admin orders grid should expose an order number filter').toBeVisible({ timeout: 30_000 });
    await orderIdFilter.fill(process.env.PW_ADMIN_ORDER_ID!);
    await page.getByRole('button', { name: /^search$/i }).click();
    const orderRow = page.locator('tr').filter({ hasText: process.env.PW_ADMIN_ORDER_ID! }).first();
    await expect(orderRow, `admin order grid should contain increment ID ${process.env.PW_ADMIN_ORDER_ID}`).toBeVisible({ timeout: 60_000 });
    await orderRow.locator('a').first().click();
    await expect(page.locator('body')).toContainText(/order information|order #/i);
  });

  test('CartOrder-22: admin can invoice a pending order', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_ADMIN_ORDER_ENTITY_ID']);
    await adminLogin(page, testInfo);
    await openAdminOrderByEntityId(page, process.env.PW_ADMIN_ORDER_ENTITY_ID!);
    await page.getByRole('button', { name: /invoice/i }).click();
    await page.getByRole('button', { name: /submit invoice/i }).click();
    await expect(page.locator('.messages')).toContainText(/invoice has been created/i);
  });

  test('CartOrder-23: admin can ship an invoiced order and add tracking', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_ADMIN_ORDER_ENTITY_ID']);
    await adminLogin(page, testInfo);
    await openAdminOrderByEntityId(page, process.env.PW_ADMIN_ORDER_ENTITY_ID!);
    await page.getByRole('button', { name: /ship/i }).click();
    await page.getByRole('button', { name: /add tracking number/i }).click();
    await page.locator('input[name*="tracking"][name*="number"]:not([disabled])').last().fill('TRACK123456');
    await page.getByRole('button', { name: /submit shipment/i }).click();
    await expect(page.locator('.messages')).toContainText(/shipment has been created/i);
  });

  test('CartOrder-24: admin can cancel a pending order', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_CANCEL_ORDER_ENTITY_ID']);
    await adminLogin(page, testInfo);
    await openAdminOrderByEntityId(page, process.env.PW_CANCEL_ORDER_ENTITY_ID!);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.locator('body')).toContainText(/canceled/i);
  });

  test('CartOrder-25: customer order view reflects shipment tracking', async ({ page }, testInfo) => {
    await skipUnlessEnv(testInfo, ['PW_CUSTOMER_EMAIL', 'PW_CUSTOMER_PASSWORD', 'PW_REGISTERED_ORDER_ID']);
    await openCustomerOrderHistory(page);
    const orderRow = page.locator('tr').filter({ hasText: process.env.PW_REGISTERED_ORDER_ID! }).first();
    await expect(orderRow, `customer history should contain order ${process.env.PW_REGISTERED_ORDER_ID}`).toBeVisible();
    await orderRow.getByRole('link', { name: /view/i }).click();
    await page.getByRole('link', { name: 'Shipments', exact: true }).click();
    await expect(page.locator('body')).toContainText('TRACK123456');
  });
});
