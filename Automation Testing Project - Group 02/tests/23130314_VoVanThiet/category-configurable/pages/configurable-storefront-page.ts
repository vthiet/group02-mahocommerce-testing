import { expect, type Locator, type Page } from '@playwright/test';
import { catalogFeatureData as data } from '../data/catalog-feature-data';

export class ConfigurableStorefrontPage {
  constructor(readonly page: Page) {}

  get body(): Locator { return this.page.locator('body'); }
  get options(): Locator { return this.page.locator('select.super-attribute-select'); }
  get addToCart(): Locator { return this.page.locator('#product_addtocart_form button.btn-cart, #product_addtocart_form button[type="submit"]').first(); }
  get productImage(): Locator { return this.page.locator('#image, .product-image-gallery img').first(); }
  get price(): Locator { return this.page.locator('.product-shop .price, .product-info .price, #product-price, .price-box .price').first(); }

  async open(url = data.configurableUrl): Promise<void> {
    if (!url) throw new Error('Set configurableUrl in data/catalog-feature-data.ts to enable configurable product scenarios.');
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(this.body).not.toContainText(/404 not found/i);
  }

  async selectOption(label: string, attributeCode?: string): Promise<Locator> {
    const swatch = this.page.locator(`a.swatch-link[title="${label}"], [data-option-label="${label}"]`).first();
    if (await swatch.isVisible().catch(() => false)) {
      await swatch.click();
      return swatch;
    }
    for (const select of await this.options.all()) {
      if (attributeCode) {
        const labelId = await select.getAttribute('id');
        const associatedLabel = labelId ? this.page.locator(`label[for="${labelId}"]`).innerText().catch(() => '') : Promise.resolve('');
        if (!(await associatedLabel).toLowerCase().includes(attributeCode.toLowerCase())) continue;
      }
      const optionLabels = (await select.locator('option').allTextContents()).map(value => value.trim());
      const matched = optionLabels.find(value => value.toLowerCase() === label.toLowerCase());
      if (matched) {
        await select.selectOption({ label: matched });
        return select;
      }
    }
    throw new Error(`No configurable option control contains label "${label}".`);
  }

  async selectLabels(labels: string[]): Promise<void> {
    for (const label of labels) await this.selectOption(label);
  }

  optionByLabel(label: string): Locator {
    return this.page.locator(`a.swatch-link[title="${label}"], li:has(a.swatch-link[title="${label}"]), option`).filter({ hasText: label }).first();
  }

  async addSelectedToCart(): Promise<void> {
    await expect(this.addToCart).toBeVisible({ timeout: 30_000 });
    await this.addToCart.click();
    await expect(this.body).toContainText(/added to your shopping cart|shopping cart/i, { timeout: 45_000 });
  }

  async visiblePriceNumber(): Promise<number> {
    await expect(this.price).toBeVisible({ timeout: 30_000 });
    return Number((await this.price.innerText()).replace(/[^\d.-]/g, ''));
  }

  async isSelected(control: Locator): Promise<boolean> {
    const checked = await control.getAttribute('aria-checked');
    const pressed = await control.getAttribute('aria-pressed');
    const className = await control.getAttribute('class') ?? '';
    const parentClass = await control.locator('xpath=..').getAttribute('class').catch(() => '');
    return checked === 'true' || pressed === 'true' || /selected|active/i.test(`${className} ${parentClass}`);
  }
}
