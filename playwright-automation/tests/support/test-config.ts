import { expect, type Page, type TestInfo } from '@playwright/test';

export const config = {
  productUrl: process.env.PW_PRODUCT_URL ?? '/default/building-blocks-50-pieces/',
  productName: process.env.PW_PRODUCT_NAME ?? 'Building blocks, 50 pieces',
  expectedPrice: Number(process.env.PW_PRODUCT_PRICE ?? 45),
  categoryUrl: process.env.PW_CATEGORY_URL ?? '/default/kids/',
  redirectToCart: process.env.PW_REDIRECT_TO_CART === 'true',
  shippingMethodLabel: process.env.PW_SHIPPING_LABEL ?? 'Flat Rate - Fixed',
  shippingPrice: Number(process.env.PW_SHIPPING_PRICE ?? 5),
  paymentMethodLabel: process.env.PW_PAYMENT_LABEL ?? 'Check / Money Order',
  customerEmail: process.env.PW_CUSTOMER_EMAIL,
  customerPassword: process.env.PW_CUSTOMER_PASSWORD,
  adminPath: process.env.MAHO_ADMIN_PATH ?? '/admin',
  adminUsername: process.env.MAHO_ADMIN_USERNAME,
  adminPassword: process.env.MAHO_ADMIN_PASSWORD,
};

export async function gotoProduct(page: Page): Promise<void> {
  await page.goto(config.productUrl);
  await expect(page.locator('h1')).toContainText(config.productName, { timeout: 30_000 });
}

export async function addProduct(page: Page, quantity = 1, navigate = true): Promise<void> {
  if (navigate) await gotoProduct(page);
  const qty = page.locator('#qty, input[name="qty"]').first();
  if (await qty.isVisible().catch(() => false)) await qty.fill(String(quantity));

  const addButton = page.getByRole('button', { name: /add to cart/i }).first();
  await expect(addButton).toBeVisible();
  await addButton.click();
  await expect(page.locator('body')).toContainText(/added to your shopping cart|added to cart/i, { timeout: 30_000 });
}

export async function openCart(page: Page): Promise<void> {
  await page.goto('/checkout/cart/');
  await expect(page.locator('h1')).toContainText(/shopping cart/i, { timeout: 30_000 });
}

export function cartRows(page: Page) {
  return page.locator('#shopping-cart-table tbody tr').filter({ has: page.locator('input[name*="[qty]"]') });
}

export async function expectEmptyCart(page: Page): Promise<void> {
  await expect(cartRows(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator('body')).toContainText(/shopping cart is empty|you have no items|cart is empty/i);
}

export async function fillVisibleField(page: Page, selectors: string[], value: string): Promise<void> {
  for (const selector of selectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill(value);
      return;
    }
  }
  throw new Error(`Could not find visible form field: ${selectors.join(', ')}`);
}

export async function skipUnlessEnv(testInfo: TestInfo, keys: string[]): Promise<void> {
  const absent = keys.filter((key) => !process.env[key]);
  if (absent.length) testInfo.skip(true, `Set environment variable(s) to enable this scenario: ${absent.join(', ')}`);
}

export async function waitForSlowPage(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('load', { timeout: 60_000 }).catch(() => undefined);
}
