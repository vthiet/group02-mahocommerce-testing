import type { Page } from '@playwright/test';
import { productManagementData } from '../data/product-management-data';
import { openSlowPage } from '../support/slow-page';

/**
 * Maho adds a per-session secret key to admin links. Following the rendered
 * menu link keeps that key in the URL and avoids a redirect to the dashboard.
 */
export async function navigateAdminRoute(page: Page, route: string): Promise<void> {
  const routePath = route.split('?')[0].replace(/\/$/, '');
  const routeSuffix = routePath.replace(/^\/?admin\//, '');
  let link = page.locator(`a[href*="/${routeSuffix}/"]`).first();

  if (!(await link.isVisible().catch(() => false))) {
    const catalogMenu = page.getByRole('link', { name: 'Catalog', exact: true });
    if (await catalogMenu.isVisible().catch(() => false)) await catalogMenu.click();
    link = page.locator(`a[href*="/${routeSuffix}/"]`).first();
  }

  await link.waitFor({ state: 'attached', timeout: 30_000 });
  const keyedUrl = await link.getAttribute('href');
  if (!keyedUrl) throw new Error(`Maho admin navigation link has no href for route: ${route}`);
  await openSlowPage(page, keyedUrl);
}

export class AdminSession {
  constructor(private readonly page: Page) {}

  async login(): Promise<void> {
    const loginUrl = new URL(`${productManagementData.adminPath.replace(/\/$/, '')}/`, productManagementData.baseUrl).toString();
    await openSlowPage(this.page, loginUrl);
    const loginForm = this.page.locator('#loginForm');
    if (await loginForm.isVisible().catch(() => false)) {
      if (!productManagementData.adminUsername || !productManagementData.adminPassword) {
        throw new Error('Set MAHO_ADMIN_USERNAME and MAHO_ADMIN_PASSWORD in playwright-automation/.env to run admin scenarios.');
      }
      await this.page.locator('input[name="login[username]"]').fill(productManagementData.adminUsername);
      await this.page.locator('input[name="login[password]"]').fill(productManagementData.adminPassword);
      await loginForm.locator('button[type="submit"], input[type="submit"]').first().click();
      await Promise.race([
        loginForm.waitFor({ state: 'hidden', timeout: 60_000 }),
        this.page.locator('#twofa_verification_code:not([disabled])').waitFor({ state: 'visible', timeout: 60_000 }),
      ]);
      if (await this.page.locator('#twofa_verification_code:not([disabled])').isVisible().catch(() => false)) {
        throw new Error('This suite expects a local admin account without a 2FA challenge. Configure a dedicated local test admin account.');
      }
    }
  }

  async openAdminRoute(route: string): Promise<void> {
    if (await this.page.locator('#loginForm').isVisible().catch(() => false)) {
      await this.login();
    }
    await navigateAdminRoute(this.page, route);
  }
}
