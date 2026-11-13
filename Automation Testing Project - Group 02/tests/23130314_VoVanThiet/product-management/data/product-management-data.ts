const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const productManagementData = {
  baseUrl: "https://maho-26.9.3.ddev.site",
  adminPath: "/admin",
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
  imagePath: "/home/vvt/shared/group02-mahocommerce-testing/Automation Testing Project - Group 02/test-resource/image1.png",
  categoryUrl: "/default/kids/",
  storefrontHomeUrl: "/default/",
  storefrontSku: "K-BLOCKS",
  productUrl: "/default/building-blocks-50-pieces/",
  storefrontProductName: "Building blocks, 50 pieces",
  storefrontProductPrice: 45,
  configurableAttribute: undefined,
  configurableProductUrl: undefined,
  configurableSku: undefined,
  variantSku: undefined,
  swatchLabel: "Blue",
  storeTimezone: "UTC",
  gridPriceFilterAvailable: false,
};

export const adminRoutes = {
  categories: `${productManagementData.adminPath.replace(/\/$/, '')}/catalog_category/index`,
  products: `${productManagementData.adminPath.replace(/\/$/, '')}/catalog_product/index`,
  newProduct: `${productManagementData.adminPath.replace(/\/$/, '')}/catalog_product/new`,
};
