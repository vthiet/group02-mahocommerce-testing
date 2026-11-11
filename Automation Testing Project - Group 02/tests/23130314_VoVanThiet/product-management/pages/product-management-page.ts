import { expect, type Locator, type Page } from '@playwright/test';
import { adminRoutes } from '../data/product-management-data';
import { navigateAdminRoute } from './admin-session';

export class ProductManagementPage {
  constructor(readonly page: Page) {}

  get grid() { return this.page.locator('#productGrid_table'); }
  get rows(): Locator { return this.grid.locator('tbody tr'); }
  get form() { return this.page.locator('#product_edit_form'); }
  get pageBody() { return this.page.locator('body'); }
  private get searchButton() { return this.page.locator('#productGrid_search, button[title="Search"]').first(); }

  async openGrid(): Promise<void> {
    await navigateAdminRoute(this.page, adminRoutes.products);
    await expect(this.grid).toBeVisible({ timeout: 60_000 });
  }

  async searchSku(sku: string): Promise<Locator> {
    const filter = this.page.locator('#productGrid_filter_sku, input[name*="[sku]"]').first();
    await expect(filter).toBeVisible({ timeout: 30_000 });
    await filter.fill(sku);
    await this.search();
    return this.rows.filter({ hasText: sku });
  }

  async search(): Promise<void> {
    const response = this.page.waitForResponse(res => res.url().includes('catalog_product/grid') && res.status() === 200, { timeout: 60_000 }).catch(() => null);
    await this.searchButton.click();
    await response;
    await expect(this.grid).toBeVisible({ timeout: 60_000 });
  }

  async expectNameSort(direction: 'asc' | 'desc'): Promise<void> {
    const nameColumn = await this.grid.locator('thead th[data-column-id="name"]').evaluate(el => Array.from(el.parentElement!.children).indexOf(el));
    const names = (await this.rows.all()).map(async row => (await row.locator('td').nth(nameColumn).innerText()).trim().toLocaleLowerCase());
    const actual = await Promise.all(names);
    const sorted = [...actual].sort((a, b) => a.localeCompare(b));
    if (direction === 'desc') sorted.reverse();
    expect(actual).toEqual(sorted);
  }

  async openProductBySku(sku: string): Promise<void> {
    const row = await this.searchSku(sku);
    await expect(row).toHaveCount(1, { timeout: 30_000 });
    const editLink = row.first().locator('a').filter({ hasText: /^Edit$/i }).first();
    if (await editLink.count()) await editLink.click();
    else await row.first().click();
    await expect(this.form).toBeVisible({ timeout: 60_000 });
  }

  async beginNewProduct(type = 'simple'): Promise<void> {
    await this.openGrid();
    await this.page.getByRole('button', { name: 'Add Product' }).click();
    await this.page.locator('select[name="set"]').selectOption({ label: 'Default' });
    await this.page.locator('select[name="type"]').selectOption(type);
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(this.form).toBeVisible({ timeout: 60_000 });
  }

  async beginNewConfigurable(attributeLabel: string): Promise<void> {
    await this.openGrid();
    await this.page.getByRole('button', { name: 'Add Product' }).click();
    await this.page.locator('select[name="set"]').selectOption({ label: 'Default' });
    await this.page.locator('select[name="type"]').selectOption('configurable');
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
    const attribute = this.page.getByLabel(attributeLabel, { exact: true });
    await expect(attribute).toBeVisible({ timeout: 60_000 });
    await attribute.check();
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(this.form).toBeVisible({ timeout: 60_000 });
  }

  async saveAttempt(): Promise<void> {
    await this.page.locator('button[title="Save"], button[title="Save Product"]').first().click();
  }

  async createSimpleProduct(input: { name: string; sku: string; price?: string; qty?: string; save?: boolean }): Promise<void> {
    await this.beginNewProduct('simple');
    await this.fillProductField('name', input.name);
    if (input.sku) await this.fillProductField('sku', input.sku);
    if (input.price) await this.fillProductField('price', input.price);
    await this.setSelectIfPresent('tax_class_id', '0');
    await this.setSelectIfPresent('status', '1');
    await this.setSelectIfPresent('visibility', '4');
    if (input.qty) {
      await this.page.locator('#product_info_tabs_inventory').click().catch(() => undefined);
      const useConfigStock = this.page.locator('#inventory_use_config_manage_stock');
      if (await useConfigStock.isChecked().catch(() => false)) await useConfigStock.uncheck();
      await this.page.locator('#inventory_manage_stock').selectOption('1').catch(() => undefined);
      await this.page.locator('#inventory_qty').fill(input.qty);
      await this.page.locator('#inventory_stock_availability').selectOption('1').catch(() => undefined);
    }
    if (input.save !== false) await this.saveProduct();
  }

  async ensureSimpleProduct(sku: string, name: string, price = '99.00', qty = '25'): Promise<void> {
    await this.openGrid();
    const row = await this.searchSku(sku);
    if (await row.count()) {
      const editLink = row.first().locator('a').filter({ hasText: /^Edit$/i }).first();
      if (await editLink.count()) await editLink.click();
      else await row.first().click();
      await expect(this.form).toBeVisible({ timeout: 60_000 });
      await this.fillProductField('name', name);
      await this.fillProductField('price', price);
      await this.setSelectIfPresent('status', '1');
      await this.setSelectIfPresent('visibility', '4');
      await this.page.locator('#product_info_tabs_inventory').click().catch(() => undefined);
      const useConfigStock = this.page.locator('#inventory_use_config_manage_stock');
      if (await useConfigStock.isChecked().catch(() => false)) await useConfigStock.uncheck();
      await this.page.locator('#inventory_manage_stock').selectOption('1').catch(() => undefined);
      await this.page.locator('#inventory_qty').fill(qty);
      await this.page.locator('#inventory_stock_availability').selectOption('1').catch(() => undefined);
      await this.saveProduct();
      return;
    }
    await this.createSimpleProduct({ name, sku, price, qty });
  }

  async saveProduct(): Promise<void> {
    await this.page.locator('button[title="Save"], button[title="Save Product"]').first().click();
    await expect(this.page.locator('#messages, .messages').first()).toContainText('The product has been saved.', { timeout: 60_000 });
  }

  async fillProductField(code: string, value: string): Promise<void> {
    const field = this.form.locator(`[name="product[${code}]"]`).first();
    if (await field.count() && !(await field.isVisible().catch(() => false))) {
      const tabId = await field.evaluate(element => {
        let panel: HTMLElement | null = element as HTMLElement;
        while (panel && !panel.id.endsWith('_content')) panel = panel.parentElement;
        return panel?.id.replace(/_content$/, '') ?? '';
      });
      if (tabId) await this.page.locator(`#${tabId}`).click().catch(() => undefined);
    }
    await expect(field).toBeVisible({ timeout: 30_000 });
    await field.fill(value);
  }

  async setSelectIfPresent(code: string, value: string): Promise<void> {
    const field = this.form.locator(`select[name="product[${code}]"]`).first();
    if (await field.count()) await field.selectOption(value).catch(() => undefined);
  }

  async massDeleteSku(sku: string): Promise<void> {
    const row = await this.searchSku(sku);
    if (!(await row.count())) return;
    await expect(row).toHaveCount(1);
    await row.locator('input[type="checkbox"]').check();
    await this.page.locator('[id$="-select"]').filter({ visible: true }).last().selectOption({ label: 'Delete' });
    this.page.once('dialog', async dialog => dialog.accept());
    await this.page.getByRole('button', { name: 'Submit', exact: true }).last().click();
    await expect(this.page.locator('#messages, .messages').first()).toContainText('Total of 1 record(s) have been deleted.', { timeout: 60_000 });
  }
}
