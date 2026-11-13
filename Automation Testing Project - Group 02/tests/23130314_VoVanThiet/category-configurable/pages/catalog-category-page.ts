import { expect, type Locator, type Page } from '@playwright/test';
import { catalogFeatureData, categoryAdminRoute } from '../data/catalog-feature-data';
import { navigateAdminRoute } from '../../product-management/pages/admin-session';

export class CatalogCategoryPage {
  constructor(readonly page: Page) {}

  get tree(): Locator { return this.page.locator('#tree-div'); }
  get form(): Locator { return this.page.locator('#category_edit_form'); }
  get body(): Locator { return this.page.locator('body'); }

  async open(): Promise<void> {
    await navigateAdminRoute(this.page, categoryAdminRoute);
    await expect(this.tree).toBeVisible({ timeout: 60_000 });
  }

  async select(name: string): Promise<void> {
    const node = this.tree.getByText(name, { exact: true }).first();
    await expect(node).toBeVisible({ timeout: 30_000 });
    await node.click();
    await expect(this.form).toBeVisible();
    await expect(this.field('name')).toHaveValue(name, { timeout: 30_000 });
  }

  async createRoot(name = catalogFeatureData.rootName): Promise<void> {
    await this.page.locator('#add_root_category_button').click();
    await this.fillNew(name);
  }

  async createChild(parent: string, name: string): Promise<void> {
    await this.select(parent);
    await this.page.locator('#add_subcategory_button').click();
    await this.fillNew(name);
  }

  field(code: string): Locator {
    return this.form.locator(`[name="general[${code}]"]`).first();
  }

  async save(): Promise<void> {
    const save = this.page.getByRole('button', { name: /save category/i }).first();
    await save.click();
    await expect(this.page.locator('#messages, .messages').first()).toContainText(/category has been saved/i, { timeout: 60_000 });
  }

  async setActive(name: string, active: boolean): Promise<void> {
    await this.select(name);
    await this.field('is_active').selectOption(active ? '1' : '0');
    await this.save();
  }

  async setField(name: string, field: string, value: string): Promise<void> {
    await this.select(name);
    const input = this.field(field);
    await expect(input).toBeVisible();
    await input.fill(value);
    await this.save();
  }

  async delete(name: string, accept = true): Promise<void> {
    await this.select(name);
    this.page.once('dialog', dialog => accept ? dialog.accept() : dialog.dismiss());
    await this.page.getByRole('button', { name: /delete category/i }).click();
    if (accept) await expect(this.page.locator('#messages, .messages').first()).toContainText(/category has been deleted/i, { timeout: 60_000 });
  }

  async expectNode(name: string): Promise<void> {
    await expect(this.tree.getByText(name, { exact: true }).first()).toBeVisible({ timeout: 30_000 });
  }

  async expectNoNode(name: string): Promise<void> {
    await expect(this.tree.getByText(name, { exact: true })).toHaveCount(0);
  }

  private async fillNew(name: string): Promise<void> {
    await expect(this.form).toBeVisible({ timeout: 30_000 });
    await this.field('name').fill(name);
    const active = this.field('is_active');
    if (await active.count()) await active.selectOption('1');
    await this.save();
    await this.expectNode(name);
  }
}
