import { expect, type Locator, type Page } from '@playwright/test';
import { AdminSession } from '../../product-management/pages/admin-session';
import { openSlowPage } from '../../product-management/support/slow-page';
import { promotionData, promotionRoutes } from '../data/promotion-data';

export type PromotionKind = 'catalog' | 'cart';
export type CartAction = 'by_percent' | 'by_fixed' | 'cart_fixed' | 'buy_x_get_y' | 'free_shipping';

export type RuleInput = {
  name: string;
  active?: boolean;
  coupon?: string;
  couponType?: 'specific' | 'none' | 'auto';
  action?: CartAction;
  amount?: number;
  priority?: number;
  stopFurtherRules?: boolean;
  catalogAction?: 'by_percent' | 'by_fixed';
  websiteLabel?: string;
  customerGroupLabel?: string;
  usesPerCoupon?: number;
  usesPerCustomer?: number;
  discountStep?: number;
  discountQty?: number;
  fromDate?: Date;
  toDate?: Date;
};

export class PromotionAdminPage {
  private readonly session: AdminSession;

  constructor(private readonly page: Page) {
    this.session = new AdminSession(page);
  }

  get grid(): Locator { return this.page.locator('#promo_catalog_grid_table, #promo_quote_grid_table').first(); }
  get rows(): Locator { return this.grid.locator('tbody tr'); }
  get form(): Locator { return this.page.locator('#edit_form'); }
  get messages(): Locator { return this.page.locator('#messages, .messages').first(); }

  async login(): Promise<void> {
    await this.session.login();
  }

  async openGrid(kind: PromotionKind): Promise<void> {
    await this.session.openAdminRoute(kind === 'catalog' ? promotionRoutes.catalog : promotionRoutes.cartRules);
    await expect(this.grid).toBeVisible({ timeout: 60_000 });
  }

  async expectHeaders(headers: string[]): Promise<void> {
    const heading = this.grid.locator('thead');
    await expect(heading).toBeVisible({ timeout: 30_000 });
    for (const text of headers) await expect(heading).toContainText(text);
  }

  async searchGrid(kind: PromotionKind, filter: string, value: string): Promise<void> {
    const input = this.page.locator(`#${kind === 'catalog' ? 'promo_catalog_grid' : 'promo_quote_grid'}_filter_${filter}, input[name*="[${filter}]"]`).first();
    await expect(input).toBeVisible({ timeout: 30_000 });
    if (await input.evaluate(element => element.tagName.toLowerCase()) === 'select') await input.selectOption(value);
    else await input.fill(value);
    const search = this.page.locator(`#${kind === 'catalog' ? 'promo_catalog_grid' : 'promo_quote_grid'}_search, button[title="Search"]`).first();
    const response = this.page.waitForResponse(response => response.url().includes(kind === 'catalog' ? 'promo_catalog/grid' : 'promo_quote/grid') && response.status() === 200, { timeout: 60_000 }).catch(() => null);
    await search.click();
    await response;
    await expect(this.grid).toBeVisible({ timeout: 60_000 });
  }

  async openNewRule(kind: PromotionKind): Promise<void> {
    await this.openGrid(kind);
    await this.page.getByRole('button', { name: /add new rule/i }).click();
    await expect(this.form).toBeVisible({ timeout: 60_000 });
  }

  async createCatalogRule(input: RuleInput, saveAndApply = true): Promise<void> {
    await this.openNewRule('catalog');
    await this.fillRuleBase(input.name, input.active ?? true, input.fromDate, input.toDate, input.websiteLabel, input.customerGroupLabel);
    const priority = this.page.locator('input[name="sort_order"]');
    if (await priority.count()) await priority.fill(String(input.priority ?? 1));
    await this.openTab('Actions');
    await this.page.locator('select[name="simple_action"]').first().selectOption(input.catalogAction ?? 'by_percent');
    await this.page.locator('input[name="discount_amount"]').first().fill(String(input.amount ?? 10));
    await this.page.locator('select[name="stop_rules_processing"]').first().selectOption(input.stopFurtherRules ? '1' : '0');
    const button = saveAndApply ? this.page.getByRole('button', { name: /save and apply/i }) : this.page.getByRole('button', { name: /^save$/i });
    await button.click();
    await expect(this.messages).toContainText(saveAndApply ? 'The rules have been applied.' : 'The rule has been saved.', { timeout: 60_000 });
  }

  async createCartRule(input: RuleInput): Promise<void> {
    await this.openNewRule('cart');
    await this.fillRuleBase(input.name, input.active ?? true, input.fromDate, input.toDate, input.websiteLabel, input.customerGroupLabel);
    const couponType = input.couponType ?? 'specific';
    const typeValue = couponType === 'none' ? '1' : couponType === 'auto' ? '3' : '2';
    await this.page.locator('select[name="coupon_type"]').selectOption(typeValue);
    if (couponType === 'specific') await this.page.locator('input[name="coupon_code"]').fill(input.coupon ?? promotionData.couponCode);
    if (couponType === 'auto') await this.page.locator('input[name="use_auto_generation"]').check();
    await this.page.locator('input[name="uses_per_coupon"]').fill(String(input.usesPerCoupon ?? 0));
    await this.page.locator('input[name="uses_per_customer"]').fill(String(input.usesPerCustomer ?? 0));
    await this.page.locator('input[name="sort_order"]').fill(String(input.priority ?? 1));
    await this.openTab('Actions');
    await this.page.locator('select[name="simple_action"]').selectOption(input.action ?? 'cart_fixed');
    await this.page.locator('input[name="discount_amount"]').fill(String(input.amount ?? 10));
    if (input.discountStep !== undefined) await this.page.locator('input[name="discount_step"]').fill(String(input.discountStep));
    if (input.discountQty !== undefined) await this.page.locator('input[name="discount_qty"]').fill(String(input.discountQty));
    await this.page.locator('select[name="stop_rules_processing"]').selectOption(input.stopFurtherRules ? '1' : '0');
    await this.page.getByRole('button', { name: /^save$/i }).first().click();
    await expect(this.messages).toContainText('The rule has been saved.', { timeout: 60_000 });
  }

  async openRuleByName(kind: PromotionKind, name: string): Promise<void> {
    await this.openGrid(kind);
    const row = this.rows.filter({ hasText: name }).first();
    await expect(row).toBeVisible({ timeout: 30_000 });
    await row.click();
    await expect(this.form).toBeVisible({ timeout: 60_000 });
  }

  async updateCatalogDiscount(name: string, amount: number): Promise<void> {
    await this.openRuleByName('catalog', name);
    await this.openTab('Actions');
    await this.page.locator('input[name="discount_amount"]').fill(String(amount));
    await this.page.getByRole('button', { name: /save and apply/i }).click();
    await expect(this.messages).toContainText('The rules have been applied.', { timeout: 60_000 });
  }

  async deleteRule(kind: PromotionKind, name: string): Promise<void> {
    await this.openRuleByName(kind, name);
    this.page.once('dialog', dialog => dialog.accept());
    await this.page.getByRole('button', { name: /^delete$/i }).click();
    await expect(this.messages).toContainText(kind === 'catalog' ? 'The rule has been deleted.' : /deleted/i, { timeout: 60_000 });
  }

  async generateCoupons(quantity: number, length: number): Promise<void> {
    await this.openTab('Manage Coupon Codes');
    await this.page.locator('input[name="qty"]').fill(String(quantity));
    await this.page.locator('input[name="length"]').fill(String(length));
    await this.page.locator('select[name="format"]').selectOption({ label: /alphanumeric/i });
    const couponRows = this.page.locator('#promo_quote_edit_tabs_coupons_content table tbody tr').filter({ has: this.page.locator('input[name*="code"]') });
    const previous = await couponRows.count();
    await this.page.getByRole('button', { name: /^generate$/i }).click();
    await expect(couponRows).toHaveCount(previous + quantity, { timeout: 60_000 });
    const codes = await couponRows.locator('input[name*="code"]').evaluateAll(inputs => inputs.map(input => (input as HTMLInputElement).value));
    expect(new Set(codes).size).toBe(codes.length);
    for (const row of await couponRows.all()) await expect(row).toContainText(/\b0\b/);
  }

  private async fillRuleBase(name: string, active: boolean, fromDate?: Date, toDate?: Date, websiteLabel = promotionData.websiteLabel, customerGroupLabel = promotionData.customerGroupLabel): Promise<void> {
    await this.page.locator('input[name="name"]').fill(name);
    await this.page.locator('select[name="is_active"]').selectOption(active ? '1' : '0');
    await this.selectOptionIfPresent('select[name="website_ids[]"]', websiteLabel);
    await this.selectOptionIfPresent('select[name="customer_group_ids[]"]', customerGroupLabel);
    await this.fillDate('from_date', this.formatDate(fromDate ?? this.dateOffset(-1)));
    await this.fillDate('to_date', this.formatDate(toDate ?? this.dateOffset(1)));
  }

  private dateOffset(offset: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString(promotionData.dateFormat);
  }

  private async fillDate(name: 'from_date' | 'to_date', value: string): Promise<void> {
    const field = this.page.locator(`input[name="${name}"]`).first();
    if (!(await field.count())) return;
    await field.fill(value);
  }

  private async selectOptionIfPresent(selector: string, label: string): Promise<void> {
    const select = this.page.locator(selector).first();
    if (!(await select.count())) return;
    const option = select.locator('option').filter({ hasText: label }).first();
    if (!(await option.count())) throw new Error(`Admin rule form has no option matching "${label}".`);
    await select.selectOption(await option.getAttribute('value') ?? '');
  }

  private async openTab(name: string): Promise<void> {
    const tab = this.page.getByRole('link', { name, exact: true }).first();
    if (await tab.count()) await tab.click();
    await this.page.locator('#edit_form').waitFor({ state: 'visible', timeout: 30_000 });
  }

  async openStorefrontProduct(url: string): Promise<void> {
    await openSlowPage(this.page, new URL(url, promotionData.baseUrl).toString());
  }
}
