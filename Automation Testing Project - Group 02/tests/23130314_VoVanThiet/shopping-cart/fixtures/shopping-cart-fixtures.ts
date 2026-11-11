import { test as base } from '@playwright/test';
import { CartPage } from '../pages/cart-page';
import { ProductPage } from '../pages/product-page';
import { MiniCart } from '../components/mini-cart';

type ShoppingCartFixtures = { productPage: ProductPage; cartPage: CartPage; miniCart: MiniCart };

/** Feature fixture exposes ready-to-use page and component objects. */
export const test = base.extend<ShoppingCartFixtures>({
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  miniCart: async ({ page }, use) => use(new MiniCart(page)),
});
export { expect } from '@playwright/test';
