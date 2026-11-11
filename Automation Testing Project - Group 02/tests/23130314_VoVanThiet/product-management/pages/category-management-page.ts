import { expect, type Page } from '@playwright/test';
import { adminRoutes } from '../data/product-management-data';
import { navigateAdminRoute } from './admin-session';

export class CategoryManagementPage {
  constructor(private readonly page: Page) {}

  get tree() { return this.page.locator('#tree-div'); }
  get form() { return this.page.locator('#category_edit_form'); }

  async open(): Promise<void> {
    await navigateAdminRoute(this.page, adminRoutes.categories);
    await expect(this.tree).toBeVisible({ timeout: 60_000 });
  }

  async selectCategory(name: string): Promise<void> {
    const node = this.tree.getByText(name, { exact: true }).first();
    await expect(node).toBeVisible({ timeout: 30_000 });
    await node.click();
    await expect(this.form).toBeVisible();
    await expect(this.form.locator('input[name="form_key"]')).toBeAttached();
    await expect(this.form.locator('input[name="general[name]"], input[id$="_name"]').first()).toHaveValue(name, { timeout: 30_000 });
  }

  async addRoot(name: string): Promise<void> {
    await this.page.locator('#add_root_category_button').click();
    await this.fillCategory(name, true);
  }

  async addChild(parentName: string, name: string): Promise<void> {
    await this.selectCategory(parentName);
    await this.page.locator('#add_subcategory_button').click();
    await this.fillCategory(name, true);
  }

  async renameAndSetActive(name: string, active: boolean): Promise<void> {
    await this.form.locator('input[name="general[name]"], input[id$="_name"]').first().fill(name);
    const activeSelect = this.form.locator('select[name="general[is_active]"], select[id$="_is_active"]').first();
    await activeSelect.selectOption(active ? '1' : '0');
    await this.page.getByRole('button', { name: 'Save Category' }).click();
    await expect(this.page.locator('#messages, .messages').first()).toContainText('The category has been saved.', { timeout: 60_000 });
  }

  async deleteSelected(): Promise<void> {
    this.page.once('dialog', async dialog => dialog.accept());
    await this.page.getByRole('button', { name: 'Delete Category' }).click();
    await expect(this.page.locator('#messages, .messages').first()).toContainText('The category has been deleted.', { timeout: 60_000 });
  }

  async expectCategory(name: string): Promise<void> {
    await expect(this.tree.getByText(name, { exact: true }).first()).toBeVisible({ timeout: 30_000 });
  }

  private async fillCategory(name: string, active: boolean): Promise<void> {
    await expect(this.form).toBeVisible({ timeout: 30_000 });
    const nameInput = this.form.locator('input[name="general[name]"], input[id$="_name"]').first();
    await expect(nameInput).toBeVisible({ timeout: 30_000 });
    await expect(nameInput).toHaveValue('', { timeout: 30_000 });
    await nameInput.fill(name);
    const activeSelect = this.form.locator('select[name="general[is_active]"], select[id$="_is_active"]').first();
    if (await activeSelect.count()) await activeSelect.selectOption(active ? '1' : '0');
    await this.page.getByRole('button', { name: 'Save Category' }).click();
    await expect(this.page.locator('#messages, .messages').first()).toContainText('The category has been saved.', { timeout: 60_000 });
    await this.expectCategory(name);
  }
}
