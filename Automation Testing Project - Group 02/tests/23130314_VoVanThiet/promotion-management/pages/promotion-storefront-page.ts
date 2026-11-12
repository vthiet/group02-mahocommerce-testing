import { expect, type Locator, type Page } from '@playwright/test';
import { openSlowPage } from '../../product-management/support/slow-page';
import { promotionData } from '../data/promotion-data';
import { cartData } from '../../shopping-cart/data/cart-data';

export class PromotionStorefrontPage {
  constructor(private readonly page: Page) {}

  get cartRows(): Locator { return this.page.locator('#shopping-cart-table tbody tr').filter({ has: this.page.locator('input[name*="[qty]"]') }); }
  get promoCodeInput(): Locator { return this.page.locator('#maho-promo-code, input[name="coupon_code"], input[name="coupon"] ').first(); }
  get discountValue(): Locator { return this.page.locator('#shopping-cart-totals-table tr, .totals tr').filter({ hasText: /discount/i }).last(); }
  get subtotalValue(): Locator { return this.page.locator('#shopping-cart-totals-table tr, .totals tr').filter({ hasText: /subtotal/i }).last(); }

  async openProduct(url: string): Promise<void> {
    await openSlowPage(this.page, new URL(url, promotionData.baseUrl).toString());
    await expect(this.page.locator('h1')).toBeVisible({ timeout: 60_000 });
  }

  async addProduct(quantity = 1): Promise<void> {
    const qty = this.page.locator('#qty, input[name="qty"]').first();
    if (await qty.isVisible().catch(() => false)) await qty.fill(String(quantity));
    await this.page.getByRole('button', { name: /add to cart/i }).first().click();
    await expect(this.page.locator('#messages, .messages, [role="alert"]').first()).toContainText(/added to (your )?shopping cart|added to cart/i, { timeout: 60_000 });
  }

  async openCart(): Promise<void> {
    await openSlowPage(this.page, new URL(promotionData.cartUrl, promotionData.baseUrl).toString());
    await expect(this.page.locator('h1')).toContainText(/shopping cart/i, { timeout: 60_000 });
  }

  async applyCoupon(code: string): Promise<void> {
    await expect(this.promoCodeInput).toBeVisible({ timeout: 30_000 });
    await this.promoCodeInput.fill(code);
    const submit = this.page.getByRole('button', { name: /apply coupon|apply promo/i }).first();
    await submit.click();
    await expect(this.page.locator('#messages, .messages, [role="alert"]').first()).toBeVisible({ timeout: 60_000 });
  }

  async loginCustomer(email: string, password: string): Promise<void> {
    await openSlowPage(this.page, new URL('/customer/account/login/', promotionData.baseUrl).toString());
    await this.page.locator('#email').fill(email);
    await this.page.locator('#pass').fill(password);
    await this.page.locator('#send2').click();
    await expect(this.page.locator('#login-form')).toHaveCount(0, { timeout: 60_000 });
  }

  async placeOrder(): Promise<{ succeeded: boolean; message: string }> {
    await openSlowPage(this.page, new URL('/checkout/onepage/', promotionData.baseUrl).toString());
    await expect(this.page.locator('#onestep-checkout')).toBeVisible({ timeout: 60_000 });
    await expect(this.page.locator('#checkout-shipping-method-load')).toContainText(cartData.shippingMethodLabel, { timeout: 60_000 });
    const shipping = this.page.locator('#checkout-shipping-method-load input[name="shipping_method"]');
    if (!(await shipping.first().isChecked().catch(() => false))) await shipping.first().check();
    const payment = this.page.getByRole('radio', { name: new RegExp(cartData.paymentMethodLabel, 'i') }).first();
    await expect(payment).toBeVisible({ timeout: 60_000 });
    if (!(await payment.isChecked().catch(() => false))) await payment.check();
    await expect(this.page.locator('#checkout-review-load')).toBeVisible({ timeout: 60_000 });
    await this.page.getByRole('button', { name: /place order/i }).click();

    const success = this.page.waitForURL(/checkout\/onepage\/success/, { timeout: 90_000 }).then(() => true).catch(() => false);
    const error = this.page.locator('#messages .error-msg, .messages .error-msg, #onestep-checkout .validation-advice').first()
      .waitFor({ state: 'visible', timeout: 90_000 }).then(() => false).catch(() => false);
    const succeeded = await Promise.race([success, error]);
    return { succeeded, message: (await this.page.locator('body').innerText()).slice(-2500) };
  }

  async expectPrice(amount: number): Promise<void> {
    await expect(this.page.locator('.price-box .price, .product-info .price, [data-price-amount]').last()).toContainText(new RegExp(amount.toFixed(2).replace('.', '\\.'), 'i'), { timeout: 60_000 });
  }

  async cartDiscountText(): Promise<string> {
    await expect(this.discountValue).toBeVisible({ timeout: 30_000 });
    return (await this.discountValue.innerText()).replace(/\s+/g, ' ').trim();
  }

  async expectCartDiscount(amount: number): Promise<void> {
    const formatted = amount.toFixed(2).replace('.', '\\.');
    await expect(this.discountValue).toContainText(new RegExp(`-${formatted}|${formatted}`, 'i'), { timeout: 60_000 });
  }

  async expectNoCartDiscount(): Promise<void> {
    await expect(this.page.locator('#shopping-cart-totals-table tr, .totals tr').filter({ hasText: /discount/i })).toHaveCount(0, { timeout: 30_000 });
  }

  async emptyCart(): Promise<void> {
    await this.openCart();
    while (await this.cartRows.count()) {
      const row = this.cartRows.first();
      const remove = row.locator('a[title*="Remove"], a[title*="Delete"], a.btn-remove, button[aria-label*="remove" i]').first();
      if (!(await remove.count())) throw new Error('Promotion test cart has an item but no remove control was found.');
      const oldCount = await this.cartRows.count();
      await remove.click();
      await expect(this.cartRows).toHaveCount(oldCount - 1, { timeout: 60_000 });
    }
  }
}
