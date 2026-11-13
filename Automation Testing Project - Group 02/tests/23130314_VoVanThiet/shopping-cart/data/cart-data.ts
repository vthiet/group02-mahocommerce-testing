/** Local storefront fixtures. Credentials remain in the ignored project .env. */
export const cartData = {
  baseUrl: "https://maho-26.9.3.ddev.site",
  productUrl: "/default/building-blocks-50-pieces/",
  productName: "Building blocks, 50 pieces",
  expectedPrice: 45,
  categoryUrl: "/default/kids/",
  redirectToCart: false,
  continueShoppingUrl: "/default/",
  shippingMethodLabel: "Flat Rate",
  shippingPrice: 5,
  paymentMethodLabel: "Check / Money order",
  customerEmail: process.env.PW_CUSTOMER_EMAIL,
  customerPassword: process.env.PW_CUSTOMER_PASSWORD,
  registeredOrderId: "1000000001",
  adminOrderId: "1000000001",
  adminOrderEntityId: "1",
  cancelOrderEntityId: "1",
  adminPath: "/admin",
  adminUsername: process.env.MAHO_ADMIN_USERNAME,
  adminPassword: process.env.MAHO_ADMIN_PASSWORD,
};

export const guestAddress = {
  firstName: 'John', lastName: 'Doe', email: () => `pw-${Date.now()}@example.test`,
  street: '123 Main St', city: 'Los Angeles', postcode: '90001', telephone: '555123456',
  country: 'United States', region: 'California',
};
