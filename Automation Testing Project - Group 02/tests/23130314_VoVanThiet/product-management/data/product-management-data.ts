const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const productManagementData = {
  baseUrl: process.env.MAHO_BASE_URL ?? 'https://maho-26.9.3.ddev.site',
  adminPath: process.env.MAHO_ADMIN_PATH ?? '/admin',
  adminUsername: process.env.MAHO_ADMIN_USERNAME,
  adminPassword: process.env.MAHO_ADMIN_PASSWORD,
  runId,
  rootCategoryName: `PW Root ${runId}`,
  subCategoryName: `PW Sub ${runId}`,
  editedSubCategoryName: `PW Sub Updated ${runId}`,
  fixtureSku: `PW-PM-FIXTURE-${runId}`,
  productSku: `PW-PM-SIMPLE-${runId}`,
  productName: `PW Product ${runId}`,
  editedProductName: `PW Product Updated ${runId}`,
  deleteProductSku: `PW-PM-DELETE-${runId}`,
  priceFixtureSkus: [9, 10, 25, 50, 51].map(price => `PW-PM-PRICE-${price}-${runId}`),
  imagePath: process.env.PW_PM_IMAGE_PATH,
  categoryUrl: process.env.PW_PM_CATEGORY_URL,
  storefrontHomeUrl: process.env.PW_PM_HOME_URL ?? '/',
  storefrontSku: process.env.PW_PM_STOREFRONT_PRODUCT_SKU,
  productUrl: process.env.PW_PM_PRODUCT_URL,
  storefrontProductName: process.env.PW_PM_STOREFRONT_PRODUCT_NAME,
  storefrontProductPrice: Number(process.env.PW_PM_PRODUCT_PRICE ?? 50),
  configurableProductUrl: process.env.PW_PM_CONFIGURABLE_PRODUCT_URL,
  configurableSku: process.env.PW_PM_CONFIGURABLE_SKU,
  variantSku: process.env.PW_PM_VARIANT_SKU,
  swatchLabel: process.env.PW_PM_SWATCH_LABEL ?? 'Blue',
  gridPriceFilterAvailable: process.env.PW_PM_PRICE_FILTER_AVAILABLE === 'true',
};

export const adminRoutes = {
  categories: `${productManagementData.adminPath.replace(/\/$/, '')}/catalog_category/index`,
  products: `${productManagementData.adminPath.replace(/\/$/, '')}/catalog_product/index`,
  newProduct: `${productManagementData.adminPath.replace(/\/$/, '')}/catalog_product/new`,
};
