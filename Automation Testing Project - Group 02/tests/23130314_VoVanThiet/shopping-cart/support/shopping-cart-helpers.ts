import { expect, type Page, type TestInfo } from '@playwright/test';
import { cartData } from '../data/cart-data';
import { ProductPage } from '../pages/product-page';
import { CartPage } from '../pages/cart-page';

/** Backwards-compatible feature helpers; selectors and storefront actions live in page objects. */
export const config = cartData;

export async function navigateTo(page: Page, url: string): Promise<void> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    const aborted = error instanceof Error && error.message.includes('net::ERR_ABORTED');
    if (!aborted || page.url() === 'about:blank') throw error;
    const expectedOrigin = new URL(url, page.url()).origin;
    if (new URL(page.url()).origin !== expectedOrigin) throw error;
    await page.waitForLoadState('domcontentloaded').catch(() => undefined);
  }
}

export async function gotoProduct(page: Page): Promise<void> { await new ProductPage(page).open(); }
export async function addProduct(page: Page, quantity = 1, navigate = true): Promise<void> {
  const product = new ProductPage(page);
  if (navigate) await product.open();
  await product.addToCart(quantity);
}
export async function openCart(page: Page): Promise<void> { await new CartPage(page).open(); }
export function cartRows(page: Page) { return new CartPage(page).rows; }
export async function expectEmptyCart(page: Page): Promise<void> { await new CartPage(page).expectEmpty(); }

export async function fillVisibleField(page: Page, selectors: string[], value: string): Promise<void> {
  for (const selector of selectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible().catch(() => false)) { await field.fill(value); return; }
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

export { expect };
