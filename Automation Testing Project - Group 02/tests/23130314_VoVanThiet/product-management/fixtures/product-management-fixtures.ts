import { test as base } from '@playwright/test';
import { AdminSession } from '../pages/admin-session';
import { CategoryManagementPage } from '../pages/category-management-page';
import { ProductManagementPage } from '../pages/product-management-page';
import { StorefrontCatalogPage } from '../pages/storefront-catalog-page';
import { productManagementData } from '../data/product-management-data';
import { MiniCart } from '../../shopping-cart/components/mini-cart';
import { CartPage } from '../../shopping-cart/pages/cart-page';

type ProductManagementFixtures = {
  adminSession: AdminSession;
  categories: CategoryManagementPage;
  products: ProductManagementPage;
  storefront: StorefrontCatalogPage;
  miniCart: MiniCart;
  cartPage: CartPage;
};

export const test = base.extend<ProductManagementFixtures>({
  adminSession: async ({ page }, use, testInfo) => {
    if (!productManagementData.adminUsername || !productManagementData.adminPassword) {
      testInfo.skip(true, 'Set MAHO_ADMIN_USERNAME and MAHO_ADMIN_PASSWORD in playwright-automation/.env.');
    }
    const session = new AdminSession(page);
    await session.login();
    await use(session);
  },
  categories: async ({ page }, use) => use(new CategoryManagementPage(page)),
  products: async ({ page }, use) => use(new ProductManagementPage(page)),
  storefront: async ({ page }, use) => use(new StorefrontCatalogPage(page)),
  miniCart: async ({ page }, use) => use(new MiniCart(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
});

export { expect } from '@playwright/test';
