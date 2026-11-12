import { expect, type Page } from '@playwright/test';
import { productManagementData } from '../data/product-management-data';
import { openSlowPage } from '../support/slow-page';

export class StorefrontCatalogPage {
  constructor(readonly page: Page) {}

  get pageBody() { return this.page.locator('body'); }

  async openConfiguredProduct(): Promise<void> {
    if (!productManagementData.productUrl) throw new Error('Set PW_PM_PRODUCT_URL to run this storefront product scenario.');
    await openSlowPage(this.page, productManagementData.productUrl);
  }

  async openConfiguredCategory(): Promise<void> {
    if (!productManagementData.categoryUrl) throw new Error('Set PW_PM_CATEGORY_URL to run this storefront category scenario.');
    await openSlowPage(this.page, productManagementData.categoryUrl);
  }

  async openConfiguredConfigurable(): Promise<void> {
    if (!productManagementData.configurableProductUrl) throw new Error('Set PW_PM_CONFIGURABLE_PRODUCT_URL to run configurable storefront scenarios.');
    await openSlowPage(this.page, productManagementData.configurableProductUrl);
  }

  async search(query: string): Promise<void> {
    const search = this.page.locator('input[name="q"], #search').first();
    await expect(search).toBeVisible({ timeout: 30_000 });
    await search.fill(query);
    await search.press('Enter');
    await expect(this.page.locator('h1')).toContainText(/search results for/i, { timeout: 60_000 });
  }
}
