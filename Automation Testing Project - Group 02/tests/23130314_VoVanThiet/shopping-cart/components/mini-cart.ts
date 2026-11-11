import { expect, type Page } from '@playwright/test';

/** Header mini-cart controls shared by storefront pages. */
export class MiniCart {
  constructor(private readonly page: Page) {}

  get counter() { return this.page.locator('.header-minicart .count, .skip-link.skip-cart .count, [data-cart-count]').first(); }
  async open() {
    const link = this.page.locator('.header-minicart a, .skip-link.skip-cart').first();
    if (await link.count()) await link.click();
    else await this.page.goto('/checkout/cart/');
  }
  async expectCount(count: number) { await expect(this.counter).toContainText(String(count)); }
}
