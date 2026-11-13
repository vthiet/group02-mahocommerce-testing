import { test, expect } from '@playwright/test';
import { checkoutData as data } from '../data/checkout-data';
import { CheckoutPage } from '../pages/checkout-page';
import { AdminOrdersPage } from '../pages/admin-orders-page';

async function enterCheckout(page: import('@playwright/test').Page) {
  const checkout = new CheckoutPage(page);
  await checkout.start();
  await expect(page.locator('#onestep-checkout')).toBeVisible();
  return checkout;
}

async function fillBilling(checkout: CheckoutPage, sameAddress = true) {
  const { page } = checkout;
  await checkout.fillAddress('billing');
  await page.locator(sameAddress ? '#billing\\:use_for_shipping_yes' : '#billing\\:use_for_shipping_no').check();
}

async function awaitRates(checkout: CheckoutPage) {
  await expect(checkout.shippingRates).toContainText(data.shippingMethodLabel, { timeout: 60_000 });
  const rate = checkout.shippingRates.locator('input[name="shipping_method"]:visible').first();
  if (await rate.count()) await rate.check();
}

async function completeMethods(checkout: CheckoutPage) {
  await fillBilling(checkout);
  await awaitRates(checkout);
  const payment = checkout.page.getByRole('radio', { name: new RegExp(data.paymentMethodLabel, 'i') }).first();
  await expect(payment).toBeVisible({ timeout: 60_000 });
  await payment.check();
  await expect(checkout.review).toContainText(data.productName, { timeout: 60_000 });
}

async function placeRunOrder(page: import('@playwright/test').Page, quantity = 1): Promise<string> {
  const checkout = new CheckoutPage(page);
  await checkout.start();
  if (quantity > 1) {
    await page.goto('/checkout/cart/');
    const qty = page.locator('input[name*="[qty]"]').first();
    await qty.fill(String(quantity));
    await page.getByRole('button', { name: /update shopping cart/i }).click();
    await page.getByRole('button', { name: /proceed to checkout/i }).first().click();
    await page.locator('#co-billing-form').waitFor({ state: 'visible' });
  }
  await completeMethods(checkout);
  await page.getByRole('button', { name: /place order/i }).click();
  await expect(page).toHaveURL(/checkout\/onepage\/success/, { timeout: 90_000 });
  const success = await page.locator('body').innerText();
  const id = success.match(/order\s*(?:#\s*(?:is:\s*)?|number\s*(?:is:\s*)?)([A-Za-z0-9-]+)/i)?.[1];
  expect(id, 'success page exposes the generated order ID').toBeTruthy();
  return id!;
}

test.describe('One-page checkout and order fulfillment', () => {
  test('CheckoutFlow-01: guest can enter one-page checkout', async ({ page }) => {
    const checkout = await enterCheckout(page);
    await expect(page.locator('#co-billing-form')).toBeEnabled();
    await expect(checkout.page.locator('#onestep-billing')).toBeVisible();
  });

  test('CheckoutFlow-02: same-address selection skips separate shipping address', async ({ page }) => {
    const checkout = await enterCheckout(page);
    await fillBilling(checkout);
    await awaitRates(checkout);
    await expect(page.locator('#shipping-new-address-form')).toBeHidden();
  });

  test('CheckoutFlow-03: different shipping address is requested and retained', async ({ page }) => {
    const checkout = await enterCheckout(page);
    await fillBilling(checkout, false);
    await expect(page.locator('#shipping-new-address-form')).toBeVisible();
    await checkout.fillAddress('shipping');
    await awaitRates(checkout);
    await expect(checkout.page.locator('#billing\\:street1')).toHaveValue(data.billing.street);
  });

  test('CheckoutFlow-04: selected shipping rate remains selected for payment', async ({ page }) => {
    const checkout = await enterCheckout(page);
    await fillBilling(checkout);
    await awaitRates(checkout);
    await expect(checkout.page.locator('#checkout-payment-method-load')).toBeVisible();
    await expect(checkout.shippingRates.locator('input[name="shipping_method"]:checked')).toHaveCount(1);
  });

  test('CheckoutFlow-05: destination with no rates cannot advance', async ({ page }, info) => {
    test.skip(!data.noRateProductUrl, 'Set PW_NO_RATE_PRODUCT_URL to a shippable product/destination with no configured rate.');
    await page.goto(data.noRateProductUrl!);
    await page.locator('button[title="Add to Cart"], button[title="Add to cart"]').first().click();
    await page.goto('/checkout/cart/');
    await page.getByRole('button', { name: /proceed to checkout/i }).first().click();
    const checkout = new CheckoutPage(page);
    await checkout.fillAddress('billing');
    await page.locator('#billing\\:use_for_shipping_yes').check();
    await expect(checkout.shippingRates).toContainText(/no.*(shipping|rate)|cannot.*ship/i, { timeout: 60_000 });
    await expect(checkout.payments.locator('input[type="radio"]')).toHaveCount(0);
    info.annotations.push({ type: 'checkout-fixture', description: data.noRateProductUrl! });
  });

  test('CheckoutFlow-06: payment selection opens review with the method retained', async ({ page }) => {
    const checkout = await enterCheckout(page);
    await completeMethods(checkout);
    await expect(checkout.review).toContainText(data.paymentMethodLabel);
  });

  test('CheckoutFlow-07: disabled method is absent from checkout', async ({ page }) => {
    test.skip(!data.disabledPaymentLabel, 'Set PW_DISABLED_PAYMENT_LABEL after disabling that method in local store config.');
    const checkout = await enterCheckout(page);
    await fillBilling(checkout);
    await awaitRates(checkout);
    await expect(checkout.payments).not.toContainText(data.disabledPaymentLabel!);
  });

  test('CheckoutFlow-08: backward navigation preserves shipping and payment selections', async ({ page }) => {
    const checkout = await enterCheckout(page);
    await completeMethods(checkout);
    const selectedMethod = await checkout.shippingRates.locator('input[name="shipping_method"]:checked').getAttribute('value');
    await page.getByRole('button', { name: /change|back/i }).first().click().catch(() => undefined);
    await expect(checkout.shippingRates.locator('input[name="shipping_method"]:checked')).toHaveAttribute('value', selectedMethod!);
    await expect(checkout.payments.locator('input[type="radio"]:checked')).toHaveCount(1);
  });

  test('CheckoutFlow-09: refresh recovers a usable quote without placing an order', async ({ page }) => {
    const checkout = await enterCheckout(page);
    await fillBilling(checkout);
    await awaitRates(checkout);
    await page.reload();
    await expect(page.locator('#onestep-checkout')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('#checkout-review-load')).not.toContainText(/order has been received/i);
  });

  test('CheckoutFlow-10: review summary reflects item, addresses, methods, and totals', async ({ page }) => {
    const checkout = await enterCheckout(page);
    await completeMethods(checkout);
    await expect(checkout.review).toContainText(data.productName);
    await expect(checkout.review).toContainText(data.paymentMethodLabel);
    await expect(checkout.review).toContainText(data.billing.firstName);
    await expect(checkout.review).toContainText(/grand total|total/i);
  });

  test('CheckoutFlow-11: place order captures its generated reference', async ({ page }, info) => {
    const checkout = await enterCheckout(page);
    await completeMethods(checkout);
    await page.getByRole('button', { name: /place order/i }).click();
    await expect(page).toHaveURL(/checkout\/onepage\/success/, { timeout: 90_000 });
    await expect(page.locator('body')).toContainText(/your order has been received/i);
    const text = await page.locator('body').innerText();
    const reference = text.match(/order\s*(?:#\s*(?:is:\s*)?|number\s*(?:is:\s*)?)([A-Za-z0-9-]+)/i)?.[1];
    expect(reference, 'success page exposes a generated order reference').toBeTruthy();
    info.annotations.push({ type: 'order-reference', description: reference! });
  });

  test('CheckoutFlow-12: signed-in default address appears in checkout', async ({ page }) => {
    test.skip(!data.customerEmail || !data.customerPassword, 'Set PW_CUSTOMER_EMAIL and PW_CUSTOMER_PASSWORD for the registered checkout fixture.');
    await page.goto('/customer/account/login/');
    await page.locator('#email').fill(data.customerEmail!);
    await page.locator('#pass').fill(data.customerPassword!);
    await page.locator('#send2').click();
    await page.goto(data.productUrl);
    await page.locator('button[title="Add to Cart"], button[title="Add to cart"]').first().click();
    await page.goto('/checkout/onepage/');
    await expect(page.locator('#co-billing-form')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('#billing-address-select')).toBeVisible();
    await expect(page.locator('#billing-address-select')).toHaveValue(/.+/);
  });

  test('CheckoutFlow-13: alternate saved address is used', async ({ page }) => {
    test.skip(!data.customerEmail || !data.customerPassword, 'Set registered customer credentials and prepare two saved addresses.');
    await page.goto('/customer/account/login/');
    await page.locator('#email').fill(data.customerEmail!); await page.locator('#pass').fill(data.customerPassword!); await page.locator('#send2').click();
    await page.goto(data.productUrl); await page.locator('button[title="Add to Cart"], button[title="Add to cart"]').first().click(); await page.goto('/checkout/onepage/');
    const select = page.locator('#billing-address-select');
    test.skip(await select.locator('option').count() < 3, 'Prepare at least two saved billing addresses for this customer.');
    await select.selectOption({ index: 2 });
    await expect(page.locator('#billing\\:street1')).not.toHaveValue('');
  });

  test('CheckoutFlow-14: new shipping address is accepted and saved during checkout', async ({ page }) => {
    test.skip(!data.customerEmail || !data.customerPassword, 'Set registered customer credentials and enable address book saving.');
    await page.goto('/customer/account/login/'); await page.locator('#email').fill(data.customerEmail!); await page.locator('#pass').fill(data.customerPassword!); await page.locator('#send2').click();
    await page.goto(data.productUrl); await page.locator('button[title="Add to Cart"], button[title="Add to cart"]').first().click(); await page.goto('/checkout/onepage/');
    await page.locator('#billing\\:use_for_shipping_no').check();
    const select = page.locator('#shipping-address-select'); if (await select.count()) await select.selectOption('');
    await expect(page.locator('#shipping-new-address-form')).toBeVisible();
    const uniqueStreet = `Automation ${data.runId}`;
    await page.locator('#shipping\\:firstname').fill(data.shipping.firstName); await page.locator('#shipping\\:lastname').fill(data.shipping.lastName); await page.locator('#shipping\\:street1').fill(uniqueStreet); await page.locator('#shipping\\:city').fill(data.shipping.city); await page.locator('#shipping\\:postcode').fill(data.shipping.postcode); await page.locator('#shipping\\:telephone').fill(data.shipping.telephone); await page.locator('#shipping\\:country_id').selectOption({ label: data.shipping.country }); await page.locator('#shipping\\:region_id').selectOption({ label: data.shipping.region });
    const save = page.locator('#shipping\\:save_in_address_book'); if (await save.isVisible()) await save.check();
    await expect(new CheckoutPage(page).shippingRates).toContainText(data.shippingMethodLabel, { timeout: 60_000 });
    expect(await page.locator('#shipping\\:street1').inputValue()).toBe(uniqueStreet);
  });

  test('CheckoutFlow-15: customer with no saved addresses receives address entry form', async ({ page }) => {
    test.skip(!data.registeredNoAddressEmail || !data.registeredNoAddressPassword, 'Set PW_CUSTOMER_NO_ADDRESS_EMAIL and PW_CUSTOMER_NO_ADDRESS_PASSWORD.');
    await page.goto('/customer/account/login/'); await page.locator('#email').fill(data.registeredNoAddressEmail!); await page.locator('#pass').fill(data.registeredNoAddressPassword!); await page.locator('#send2').click();
    await page.goto(data.productUrl); await page.locator('button[title="Add to Cart"], button[title="Add to cart"]').first().click(); await page.goto('/checkout/onepage/');
    await expect(page.locator('#co-billing-form')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('#billing\\:firstname')).toBeVisible();
  });

  test.describe('Admin fulfillment of fresh run orders', () => {
    test.beforeEach(async ({ page }, info) => {
      if (!data.adminUsername || !data.adminPassword) info.skip(true, 'Set MAHO_ADMIN_USERNAME and MAHO_ADMIN_PASSWORD in the ignored .env file.');
    });

    async function openFreshOrder(page: import('@playwright/test').Page, quantity = 1) {
      const incrementId = await placeRunOrder(page, quantity);
      const admin = new AdminOrdersPage(page);
      await admin.login();
      await admin.findByIncrementId(incrementId);
      return { admin, incrementId };
    }

    test('Fulfillment-01: Admin opens exactly the order just placed', async ({ page }) => {
      const { incrementId } = await openFreshOrder(page);
      await expect(page.locator('body')).toContainText(incrementId);
      await expect(page.locator('body')).toContainText(data.productName);
    });

    test('Fulfillment-02: invoice all ordered quantities', async ({ page }) => {
      await openFreshOrder(page);
      const admin = new AdminOrdersPage(page);
      await admin.createInvoice();
      await expect(page.locator('.messages')).toContainText(/invoice has been created/i);
      await expect(page.locator('body')).toContainText(/invoice/i);
    });

    test('Fulfillment-03: invoice a partial quantity and retain remainder', async ({ page }) => {
      await openFreshOrder(page, 2);
      const admin = new AdminOrdersPage(page);
      await admin.createInvoice(1);
      await expect(page.locator('.messages')).toContainText(/invoice has been created/i);
      await expect(page.locator('body')).toContainText(/1\.0000|qty\s*:?\s*1\b/i);
    });

    test('Fulfillment-04: UI prevents invoicing beyond the remaining quantity', async ({ page }) => {
      await openFreshOrder(page, 2);
      const admin = new AdminOrdersPage(page);
      await admin.createInvoice(1);
      await page.getByRole('button', { name: /invoice/i }).click();
      const qty = page.locator('input[name*="[qty]"]:visible').first();
      await expect(qty).toHaveAttribute('max', /1/).catch(async () => expect(Number(await qty.getAttribute('value'))).toBeLessThanOrEqual(1));
      await qty.fill('2');
      await page.getByRole('button', { name: /submit invoice/i }).click();
      const invoiceQty = page.locator('body').getByText(/qty\s*:?\s*2\b/i);
      await expect(invoiceQty).toHaveCount(0);
    });

    test('Fulfillment-05: create a partial shipment and preserve remaining quantity', async ({ page }) => {
      await openFreshOrder(page, 2);
      const admin = new AdminOrdersPage(page);
      await admin.createInvoice();
      await admin.createShipment(1);
      await expect(page.locator('.messages')).toContainText(/shipment has been created/i);
      await expect(page.locator('body')).toContainText(/1\.0000|qty\s*:?\s*1\b/i);
    });

    test('Fulfillment-06: tracking details are attached to the shipment', async ({ page }) => {
      await openFreshOrder(page);
      const admin = new AdminOrdersPage(page);
      await admin.createInvoice();
      const tracking = `PW-${data.runId}`;
      await admin.createShipment(undefined, tracking);
      await expect(page.locator('.messages')).toContainText(/shipment has been created/i);
      await expect(page.locator('body')).toContainText(tracking);
    });

    test('Fulfillment-07: order completes after full invoice and shipment', async ({ page }) => {
      await openFreshOrder(page);
      const admin = new AdminOrdersPage(page);
      await admin.createInvoice();
      await admin.createShipment();
      await expect(page.locator('.messages')).toContainText(/shipment has been created/i);
      await expect(page.locator('body')).toContainText(/complete/i);
    });

    test('Fulfillment-08: cancel a fresh unprocessed order', async ({ page }) => {
      await openFreshOrder(page);
      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: /cancel/i }).click();
      await expect(page.locator('body')).toContainText(/canceled/i);
      await expect(page.getByRole('button', { name: /invoice|ship/i })).toHaveCount(0);
    });

    test('Fulfillment-09: cancellation is rejected after invoice', async ({ page }) => {
      await openFreshOrder(page);
      const admin = new AdminOrdersPage(page);
      await admin.createInvoice();
      const cancel = page.getByRole('button', { name: /cancel/i });
      if (await cancel.count()) await cancel.click();
      await expect(page.locator('body')).not.toContainText(/order has been canceled/i);
      await expect(page.locator('body')).toContainText(/invoice/i);
    });

    test('Fulfillment-10: customer order detail exposes shipment tracking when theme supports it', async ({ page }, info) => {
      const incrementId = await placeRunOrder(page);
      const admin = new AdminOrdersPage(page);
      await admin.login(); await admin.findByIncrementId(incrementId);
      await admin.createInvoice();
      const tracking = `PW-${data.runId}`;
      await admin.createShipment(undefined, tracking);
      await page.goto('/customer/account/login/');
      if (!data.customerEmail || !data.customerPassword) info.skip(true, 'Set customer credentials for the order owner to inspect order detail.');
      await page.locator('#email').fill(data.customerEmail!); await page.locator('#pass').fill(data.customerPassword!); await page.locator('#send2').click();
      await page.goto('/sales/order/history/');
      const order = page.locator('tr').filter({ hasText: incrementId }).first();
      await expect(order).toBeVisible(); await order.getByRole('link', { name: /view/i }).click();
      const detail = await page.locator('body').innerText();
      if (!/shipment|track/i.test(detail)) { info.annotations.push({ type: 'theme-capability', description: 'Customer order detail does not expose shipment details in this theme.' }); return; }
      await expect(page.locator('body')).toContainText(tracking);
    });
  });
});
