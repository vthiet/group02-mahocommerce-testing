import type { Locator } from '@playwright/test';

/** Component object for a single row in the Maho shopping cart. */
export class CartLineItem {
  constructor(readonly root: Locator) {}

  get quantity() { return this.root.locator('input[name*="[qty]"]'); }
  get removeControl() {
    return this.root.locator('a[title*="Remove"], a[title*="Delete"], a.btn-remove, button[aria-label*="remove" i]').first();
  }
  async setQuantity(quantity: number | string) { await this.quantity.fill(String(quantity)); }
}
