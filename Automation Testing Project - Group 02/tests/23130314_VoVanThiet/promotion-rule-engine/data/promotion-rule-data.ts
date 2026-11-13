import { promotionData } from '../../promotion-management/data/promotion-data';

/** Optional controlled products/store views for rule evaluation cases. */
export const ruleData = {
  ...promotionData,
  websiteControlUrl: process.env.PW_RULE_OTHER_WEBSITE_PRODUCT_URL,
  groupProductUrl: process.env.PW_RULE_GROUP_PRODUCT_URL,
  targetGroupEmail: process.env.PW_RULE_TARGET_GROUP_EMAIL,
  targetGroupPassword: process.env.PW_RULE_TARGET_GROUP_PASSWORD,
  targetGroupLabel: process.env.PW_RULE_TARGET_GROUP_LABEL,
  attributeMatchUrl: process.env.PW_RULE_ATTRIBUTE_MATCH_URL,
  attributeControlUrl: process.env.PW_RULE_ATTRIBUTE_CONTROL_URL,
  categoryMatchUrl: process.env.PW_RULE_CATEGORY_MATCH_URL,
  categoryControlUrl: process.env.PW_RULE_CATEGORY_CONTROL_URL,
  subtotalBelowUrl: process.env.PW_RULE_SUBTOTAL_BELOW_URL,
  subtotalAtUrl: process.env.PW_RULE_SUBTOTAL_AT_URL,
  subtotalAboveUrl: process.env.PW_RULE_SUBTOTAL_ABOVE_URL,
  quantityRuleUrl: process.env.PW_RULE_QUANTITY_PRODUCT_URL,
  mixedCategoryUrl: process.env.PW_RULE_MIXED_CATEGORY_URL,
  mixedControlUrl: process.env.PW_RULE_MIXED_CONTROL_URL,
  lowValueUrl: process.env.PW_RULE_LOW_VALUE_PRODUCT_URL,
  freeShippingUrl: process.env.PW_RULE_FREE_SHIPPING_PRODUCT_URL,
  taxEnabled: process.env.PW_RULE_TAX_ENABLED === 'true',
  currencyDecimals: Number(process.env.PW_RULE_CURRENCY_DECIMALS ?? 2),
};
