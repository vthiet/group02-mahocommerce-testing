# Shopping cart Playwright suite

## Feature architecture

The suite is organized by business feature. The shopping-cart module is the reference implementation:

```text
tests/
  features/shopping-cart/
    components/       Reusable UI pieces (cart line item, mini cart)
    data/             Environment-backed fixture values and sample addresses
    fixtures/         Playwright fixtures that provide page/component objects
    pages/            Storefront page objects and user actions
    specs/             Cart, checkout, customer, and admin scenarios
    support/           Shopping-cart-specific workflow helpers
  support/             Helpers shared across features (when needed)
```

The feature spec keeps scenario intent and assertions; selectors and page actions belong in page or component objects. Use fixtures to provide those objects to tests. Keep reusable test values in `features/<name>/data`, read secrets from environment variables, and never commit `.env`. Prefer role/label locators where the storefront exposes accessible names; isolate unavoidable theme-specific selectors in the relevant page/component object. Give tests descriptive names, make each test establish its own state, and use `test.skip` with a concrete setup reason for optional configurations. Avoid sharing mutable cart/order state between tests.

Add a new feature under `tests/features/<feature-name>/` using the same `pages`, `components`, `fixtures`, `data`, and `specs` folders as needed. Keep feature-specific behavior in that module; move a helper to `tests/support` only when multiple features use it.

Shopping-cart page objects: `ProductPage` and `CartPage`. Components: `MiniCart` and `CartLineItem`. The fixture in `fixtures/shopping-cart-fixtures.ts` exposes these objects. The sample suite retains the existing CartOrder-01 through CartOrder-25 coverage.

The suite targets the local DDEV storefront by default: `https://maho-26.9.3.ddev.site`. Override it with `MAHO_BASE_URL` when needed. The runner uses Chromium, one worker, and longer navigation limits because the local app can respond slowly.

## Run

From `playwright-automation`:

```powershell
npm run test:cart
```

To run the complete guest checkout scenario, ensure the local store allows guest checkout and has the configured shipping and payment methods enabled. Cases that need customer/admin accounts or an existing order are skipped with a reason unless their environment variables are set.

## Configure customer and admin cases

Use Node 20.12 or newer. Copy `playwright-automation/.env.example` to `playwright-automation/.env` and fill in the local credentials and order IDs you need. The Playwright config loads that file automatically. `.env` is ignored by Git, so do not force-add it or commit real passwords.

```powershell
Copy-Item .env.example .env
npm run test:cart
```

Run those commands from the `playwright-automation` directory. Leave optional values empty to skip their customer/admin scenarios. You can also set environment variables in the terminal; those override values loaded from `.env`.

## Product management suite

The Product & Catalog Management feature is in `tests/features/product-management/`. It uses page objects for admin login, category management, product grids/forms, and storefront catalog interactions. Maho navigation waits for `domcontentloaded` and then waits on the specific page element because the local DDEV site may continue loading optional assets.

Configure `MAHO_ADMIN_USERNAME` and `MAHO_ADMIN_PASSWORD` in the ignored `.env` file to enable admin scenarios. Storefront scenarios that require a known category/product are skipped with a setup reason unless their `PW_PM_*` fixture values are configured. The stock and special-price checks need a disposable storefront SKU plus its product URL; category listing checks need a configured URL and product name. The configurable-product cases also require a compatible configurable attribute and associated variant fixture. Product and category records created by the suite use a unique run ID and are removed in suite cleanup where possible.

From `playwright-automation`, run:

```powershell
npm run test:products
```

Use `npm run test:products:headed` to inspect the browser interactions. See `.env.example` for the optional storefront, image, configurable-product, and grid-filter settings. These scenarios create and delete records; run them only against a disposable local Maho database.

The IDs have different meanings: `PW_REGISTERED_ORDER_ID` and `PW_ADMIN_ORDER_ID` are the human-readable order increment ID shown in the storefront/admin. `PW_ADMIN_ORDER_ENTITY_ID` and `PW_CANCEL_ORDER_ENTITY_ID` are numeric internal order entity IDs used in admin URLs. You can find both values in the local admin order grid or database. Use an order owned by `PW_CUSTOMER_EMAIL` for customer history cases. For case 25, that order must already be shipped and have tracking number `TRACK123456`.

Cases 18–19 need a seeded customer account; case 18 expects a saved billing address, while case 19 creates and saves a shipping address. Case 20 checks the specified order in that customer's history. Case 21 only needs admin credentials and the increment ID. Cases 22–23 mutate the same configured entity ID, so use a disposable, uninvoiced order and run case 22 (invoice) before case 23 (shipment). Case 24 needs a different disposable pending order because it cancels it. These order states are consumed by the tests; create fresh fixtures before rerunning them. `MAHO_ADMIN_PATH` is the admin route prefix, without a trailing slash.

Run only the customer/admin cases with a grep expression, for example:

```powershell
npx playwright test tests/features/shopping-cart/specs/shopping-cart.spec.ts --grep 'CartOrder-18|CartOrder-19|CartOrder-20|CartOrder-21|CartOrder-22|CartOrder-23|CartOrder-24|CartOrder-25'
```

## Optional environment variables

| Variable | Default / purpose |
| --- | --- |
| `MAHO_BASE_URL` | `https://maho-26.9.3.ddev.site` |
| `PW_PRODUCT_URL` | `/default/building-blocks-50-pieces/` |
| `PW_PRODUCT_NAME` | `Building blocks, 50 pieces` |
| `PW_PRODUCT_PRICE` | `45` |
| `PW_CATEGORY_URL` | `/default/kids/` |
| `PW_REDIRECT_TO_CART` | `false`; set to `true` if the store is configured to redirect after add-to-cart |
| `PW_CONTINUE_SHOPPING_URL` | `/default/`; active local cart falls back to the store home page |
| `PW_SHIPPING_LABEL` | `Flat Rate` |
| `PW_SHIPPING_PRICE` | `5` |
| `PW_PAYMENT_LABEL` | `Check / Money order` |
| `PW_CUSTOMER_EMAIL`, `PW_CUSTOMER_PASSWORD` | Seeded customer credentials |
| `PW_REGISTERED_ORDER_ID` | Order increment ID used by customer history cases |
| `MAHO_ADMIN_PATH` | `/admin`; set the installation's actual admin front name |
| `MAHO_ADMIN_USERNAME`, `MAHO_ADMIN_PASSWORD` | Admin login credentials |
| `PW_ADMIN_ORDER_ID` | Order increment ID for admin inspection |
| `PW_ADMIN_ORDER_ENTITY_ID` | Numeric order entity ID for invoice/shipment actions |
| `PW_CANCEL_ORDER_ENTITY_ID` | Separate pending order entity ID for cancellation |

The defaults use a live, in-stock simple product in the local demo catalog. Confirm its price and inventory before a run. To use a dedicated fixture instead, set `PW_PRODUCT_URL`, `PW_PRODUCT_NAME`, and `PW_PRODUCT_PRICE`. Order mutation cases invoice, ship, or cancel orders. Use disposable orders in a local test database. Guest checkout captures its order ID in the Playwright report annotation; admin cases use explicit order IDs because they may be run independently.
