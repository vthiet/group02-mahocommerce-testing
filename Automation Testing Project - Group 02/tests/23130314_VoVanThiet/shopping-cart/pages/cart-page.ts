import { expect, type Locator, type Page } from '@playwright/test';
import { CartLineItem } from '../components/cart-line-item';

export class CartPage {
  constructor(private readonly page: Page) {}
  get rows(): Locator { return this.page.locator('#shopping-cart-table tbody tr').filter({ has: this.page.locator('input[name*="[qty]"]') }); }

  async open() {
    await this.page.goto('/checkout/cart/', { waitUntil: 'domcontentloaded' });
    await expect(this.page.locator('h1')).toContainText(/shopping cart/i, { timeout: 30_000 });
  }
  lineItem(index = 0) { return new CartLineItem(this.rows.nth(index)); }
  async update() { await this.page.getByRole('button', { name: /update shopping cart/i }).click(); }
  async empty(): Promise<void> {
    await this.open();
    while (await this.rows.count()) {
      const row = this.rows.first();
      const remove = row.locator('a[title*="Remove"], a[title*="Delete"], a.btn-remove, button[aria-label*="remove" i]').first();
      if (!(await remove.count())) throw new Error('Cart contains an item but no remove control was found.');
      const priorCount = await this.rows.count();
      this.page.once('dialog', dialog => dialog.accept());
      await remove.click();
      await expect(this.rows).toHaveCount(priorCount - 1, { timeout: 30_000 });
    }
  }
  async expectEmpty() {
    await expect(this.rows).toHaveCount(0, { timeout: 30_000 });
    await expect(this.page.locator('body')).toContainText(/shopping cart is empty|you have no items|cart is empty/i);
  }
}
