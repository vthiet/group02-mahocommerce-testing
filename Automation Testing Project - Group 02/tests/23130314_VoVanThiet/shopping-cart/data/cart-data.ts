/** Environment-backed fixture data for the local Maho storefront. */
export const cartData = {
  productUrl: process.env.PW_PRODUCT_URL ?? '/default/building-blocks-50-pieces/',
  productName: process.env.PW_PRODUCT_NAME ?? 'Building blocks, 50 pieces',
  expectedPrice: Number(process.env.PW_PRODUCT_PRICE ?? 45),
  categoryUrl: process.env.PW_CATEGORY_URL ?? '/default/kids/',
  redirectToCart: process.env.PW_REDIRECT_TO_CART === 'true',
  continueShoppingUrl: process.env.PW_CONTINUE_SHOPPING_URL ?? '/default/',
  shippingMethodLabel: process.env.PW_SHIPPING_LABEL ?? 'Flat Rate',
  shippingPrice: Number(process.env.PW_SHIPPING_PRICE ?? 5),
  paymentMethodLabel: process.env.PW_PAYMENT_LABEL ?? 'Check / Money order',
  customerEmail: process.env.PW_CUSTOMER_EMAIL,
  customerPassword: process.env.PW_CUSTOMER_PASSWORD,
  adminPath: process.env.MAHO_ADMIN_PATH ?? '/admin',
  adminUsername: process.env.MAHO_ADMIN_USERNAME,
  adminPassword: process.env.MAHO_ADMIN_PASSWORD,
};

export const guestAddress = {
  firstName: 'John', lastName: 'Doe', email: () => `pw-${Date.now()}@example.test`,
  street: '123 Main St', city: 'Los Angeles', postcode: '90001', telephone: '555123456',
  country: 'United States', region: 'California',
};
