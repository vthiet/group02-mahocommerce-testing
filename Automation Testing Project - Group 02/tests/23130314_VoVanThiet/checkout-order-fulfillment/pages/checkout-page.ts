import type { Page } from '@playwright/test';
import { checkoutData as data } from '../data/checkout-data';

export class CheckoutPage {
  constructor(readonly page: Page) {}

  async start(): Promise<void> {
    await this.page.goto(data.productUrl);
    await this.page.locator('button[title="Add to Cart"], button[title="Add to cart"]').first().click();
    await this.page.goto('/checkout/cart/');
    await this.page.getByRole('button', { name: /proceed to checkout/i }).first().click();
    await this.page.locator('#co-billing-form').waitFor({ state: 'visible', timeout: 60_000 });
  }

  async fillAddress(kind: 'billing' | 'shipping', address = data[kind]): Promise<void> {
    const prefix = kind;
    const form = this.page.locator(kind === 'billing' ? '#co-billing-form' : '#shipping-new-address-form');
    const set = async (field: string, value: string) => {
      const locator = form.locator(`#${prefix}\\:${field}`);
      if (await locator.isVisible().catch(() => false)) await locator.fill(value);
    };
    await set('firstname', address.firstName);
    await set('lastname', address.lastName);
    if (kind === 'billing') await set('email', data.guestEmail);
    await set('street1', address.street);
    await set('city', address.city);
    await set('postcode', address.postcode);
    await set('telephone', address.telephone);
    const country = form.locator(`#${prefix}\\:country_id`);
    if (await country.isVisible().catch(() => false)) await country.selectOption({ label: address.country });
    const region = form.locator(`#${prefix}\\:region_id`);
    if (await region.isVisible().catch(() => false)) await region.selectOption({ label: address.region });
  }

  get shippingRates() { return this.page.locator('#checkout-shipping-method-load'); }
  get payments() { return this.page.locator('#checkout-payment-method-load'); }
  get review() { return this.page.locator('#checkout-review-load'); }
}
