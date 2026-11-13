import { cartData } from '../../shopping-cart/data/cart-data';

const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Run-scoped checkout fixtures. Product and account values point to the local seeded store. */
export const checkoutData = {
  ...cartData,
  runId,
  guestEmail: `pw-checkout-${runId}@example.test`,
  billing: { firstName: 'Checkout', lastName: 'Automation', street: '123 Main St', city: 'Los Angeles', postcode: '90001', telephone: '555123456', country: 'United States', region: 'California' },
  shipping: { firstName: 'Shipping', lastName: 'Automation', street: '456 Oak Ave', city: 'Los Angeles', postcode: '90002', telephone: '555123457', country: 'United States', region: 'California' },
  // Optional capabilities are intentionally unset until a dedicated local fixture is prepared.
  noRateProductUrl: process.env.PW_NO_RATE_PRODUCT_URL,
  disabledPaymentLabel: process.env.PW_DISABLED_PAYMENT_LABEL,
  registeredNoAddressEmail: process.env.PW_CUSTOMER_NO_ADDRESS_EMAIL,
  registeredNoAddressPassword: process.env.PW_CUSTOMER_NO_ADDRESS_PASSWORD,
};
