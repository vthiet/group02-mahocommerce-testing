import type { Page } from '@playwright/test';
import { checkoutData as data } from '../data/checkout-data';

export class AdminOrdersPage {
  constructor(private readonly page: Page) {}

  async login(): Promise<void> {
    await this.page.goto(`${data.adminPath}/`);
    const form = this.page.locator('#loginForm');
    if (await form.isVisible()) {
      if (!data.adminUsername || !data.adminPassword) throw new Error('Set MAHO_ADMIN_USERNAME and MAHO_ADMIN_PASSWORD in the ignored .env file.');
      await this.page.locator('input[name="login[username]"]').fill(data.adminUsername);
      await this.page.locator('input[name="login[password]"]').fill(data.adminPassword);
      await form.locator('button[type="submit"], input[type="submit"]').first().click();
      await form.waitFor({ state: 'hidden', timeout: 60_000 });
    }
  }

  async findByIncrementId(incrementId: string): Promise<void> {
    const sales = this.page.locator('#nav-admin-sales');
    if (await sales.count()) await sales.click();
    const ordersLink = this.page.locator('#nav-admin-sales-order');
    await ordersLink.waitFor({ state: 'visible', timeout: 30_000 });
    const href = await ordersLink.getAttribute('href');
    if (!href) throw new Error('Admin Sales menu has no Orders link.');
    await this.page.goto(href);
    const grid = this.page.locator('#sales_order_grid');
    await grid.waitFor({ state: 'visible', timeout: 60_000 });
    const filter = this.page.locator('#sales_order_grid_filter_real_order_id, input[name="real_order_id"]').first();
    await filter.fill(incrementId);
    await this.page.getByRole('button', { name: /^search$/i }).click();
    const row = this.page.locator('#sales_order_grid tr').filter({ hasText: incrementId }).first();
    await row.waitFor({ state: 'visible', timeout: 60_000 });
    await row.locator('a').first().click();
    await this.page.locator('body').getByText(/order information|order #/i).first().waitFor({ state: 'visible' });
  }

  async createInvoice(quantity?: number): Promise<void> {
    await this.page.getByRole('button', { name: /invoice/i }).click();
    const qty = this.page.locator('input[name*="[qty]"]:visible');
    if (quantity !== undefined && await qty.count()) await qty.first().fill(String(quantity));
    await this.page.getByRole('button', { name: /submit invoice/i }).click();
  }

  async createShipment(quantity?: number, tracking?: string): Promise<void> {
    await this.page.getByRole('button', { name: /ship/i }).click();
    const qty = this.page.locator('input[name*="[qty]"]:visible');
    if (quantity !== undefined && await qty.count()) await qty.first().fill(String(quantity));
    if (tracking) {
      await this.page.getByRole('button', { name: /add tracking number/i }).click();
      const number = this.page.locator('input[name*="tracking"][name*="number"]:visible').last();
      await number.fill(tracking);
    }
    await this.page.getByRole('button', { name: /submit shipment/i }).click();
  }
}
