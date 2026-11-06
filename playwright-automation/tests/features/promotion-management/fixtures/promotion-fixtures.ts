import { test as base } from '@playwright/test';
import { PromotionAdminPage } from '../pages/promotion-admin-page';
import { PromotionStorefrontPage } from '../pages/promotion-storefront-page';

type PromotionFixtures = { promotions: PromotionAdminPage; promoStorefront: PromotionStorefrontPage };

export const test = base.extend<PromotionFixtures>({
  promotions: async ({ page }, use, testInfo) => {
    const admin = new PromotionAdminPage(page);
    if (!process.env.MAHO_ADMIN_USERNAME || !process.env.MAHO_ADMIN_PASSWORD) {
      testInfo.skip(true, 'Set MAHO_ADMIN_USERNAME and MAHO_ADMIN_PASSWORD in playwright-automation/.env.');
    }
    await use(admin);
  },
  promoStorefront: async ({ page }, use) => use(new PromotionStorefrontPage(page)),
});

export { expect } from '@playwright/test';
