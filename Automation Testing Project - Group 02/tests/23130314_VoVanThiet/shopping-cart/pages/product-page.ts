import { expect, type Page } from '@playwright/test';
import { cartData } from '../data/cart-data';

export class ProductPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto(cartData.productUrl, { waitUntil: 'domcontentloaded' });
    await expect(this.page.locator('h1')).toContainText(cartData.productName, { timeout: 30_000 });
  }
  async addToCart(quantity = 1) {
    const qty = this.page.locator('#qty, input[name="qty"]').first();
    if (await qty.isVisible().catch(() => false)) await qty.fill(String(quantity));
    await this.page.getByRole('button', { name: /add to cart/i }).first().click();
    await expect(this.page.locator('body')).toContainText(/added to your shopping cart|added to cart/i, { timeout: 30_000 });
  }
}
