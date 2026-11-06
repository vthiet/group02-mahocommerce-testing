# Shopping cart Playwright suite

The suite targets the local DDEV storefront by default: `https://maho-26.9.3.ddev.site`. Override it with `MAHO_BASE_URL` when needed. The runner uses Chromium, one worker, and longer navigation limits because the local app can respond slowly.

## Run

From `playwright-automation`:

```powershell
npm run test:cart
```

To run the complete guest checkout scenario, ensure the local store allows guest checkout and has the configured shipping and payment methods enabled. Cases that need customer/admin accounts or an existing order are skipped with a reason unless their environment variables are set.

## Optional environment variables

| Variable | Default / purpose |
| --- | --- |
| `MAHO_BASE_URL` | `https://maho-26.9.3.ddev.site` |
| `PW_PRODUCT_URL` | `/default/building-blocks-50-pieces/` |
| `PW_PRODUCT_NAME` | `Building blocks, 50 pieces` |
| `PW_PRODUCT_PRICE` | `45` |
| `PW_CATEGORY_URL` | `/default/kids/` |
| `PW_REDIRECT_TO_CART` | `false`; set to `true` if the store is configured to redirect after add-to-cart |
| `PW_SHIPPING_LABEL` | `Flat Rate - Fixed` |
| `PW_SHIPPING_PRICE` | `5` |
| `PW_PAYMENT_LABEL` | `Check / Money Order` |
| `PW_CUSTOMER_EMAIL`, `PW_CUSTOMER_PASSWORD` | Seeded customer credentials |
| `PW_REGISTERED_ORDER_ID` | Order increment ID used by customer history cases |
| `MAHO_ADMIN_PATH` | `/admin`; set the installation's actual admin front name |
| `MAHO_ADMIN_USERNAME`, `MAHO_ADMIN_PASSWORD` | Admin login credentials |
| `PW_ADMIN_ORDER_ID` | Order increment ID for admin inspection |
| `PW_ADMIN_ORDER_ENTITY_ID` | Numeric order entity ID for invoice/shipment actions |
| `PW_CANCEL_ORDER_ENTITY_ID` | Separate pending order entity ID for cancellation |

The defaults use a live, in-stock simple product in the local demo catalog. Confirm its price and inventory before a run. To use a dedicated fixture instead, set `PW_PRODUCT_URL`, `PW_PRODUCT_NAME`, and `PW_PRODUCT_PRICE`. Order mutation cases invoice, ship, or cancel orders. Use disposable orders in a local test database. Guest checkout captures its order ID in the Playwright report annotation; admin cases use explicit order IDs because they may be run independently.
