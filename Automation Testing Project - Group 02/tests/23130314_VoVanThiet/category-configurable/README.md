# Category & Configurable Product Playwright Suite

Run from `Automation Testing Project - Group 02/`:

```bash
npx playwright test tests/23130314_VoVanThiet/category-configurable/specs/category-configurable.spec.ts
```

The suite uses the local Maho Admin session and shared product-management page objects. Category tree cases create run-scoped categories and clean them up afterward. Configurable-product cases use a prepared configurable parent and variant matrix.

## Configuration

Keep only account identifiers and credentials in the ignored project `.env`:

- `MAHO_ADMIN_USERNAME` and `MAHO_ADMIN_PASSWORD` for Admin scenarios
- `PW_CUSTOMER_EMAIL` and `PW_CUSTOMER_PASSWORD` for customer checkout scenarios

Set non-sensitive store-specific fixture values in [`data/catalog-feature-data.ts`](data/catalog-feature-data.ts). This includes storefront URLs, category and product names, variant labels, expected prices, and feature flags. Scenarios that need an unset optional fixture are skipped with the relevant field name.

Use disposable categories/products for scenarios that edit or delete pre-existing fixtures. The cleanup hook only removes categories created by the current run.
