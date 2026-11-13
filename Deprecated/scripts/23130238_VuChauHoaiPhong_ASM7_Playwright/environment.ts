/**
 * environment.ts — Cấu hình môi trường kiểm thử ASM7/ASM9
 * Thay thế .env file, cấu hình trong source code để không bị mất khi demo reset.
 */

const QA_CONFIG = {
    email: process.env.QA_EMAIL || 'pvu560016@gmail.com',
    password: process.env.QA_PASSWORD || 'Phong123',
    firstName: process.env.QA_FIRST_NAME || 'QA',
    lastName: process.env.QA_LAST_NAME || 'ASM7',
    phone: process.env.QA_PHONE || '4155550136',
    street: process.env.QA_STREET || '123 Automation Test Street',
    city: process.env.QA_CITY || 'Beverly Hills',
    postcode: process.env.QA_POSTCODE || '90210',
    productOne: process.env.QA_PRODUCT_ONE || 'Bib shorts',
    productTwo: process.env.QA_PRODUCT_TWO || 'Harbour stripe tee',
    allowCartReset: process.env.ALLOW_QA_CART_RESET || 'true',
    allowOrderCreation: process.env.ALLOW_DEMO_ORDER_CREATION || 'false',
    allowTwoOrders: process.env.ALLOW_TWO_DEMO_ORDERS || 'false',
};

// Set into process.env for backwards compatibility
process.env.QA_EMAIL = QA_CONFIG.email;
process.env.QA_PASSWORD = QA_CONFIG.password;
process.env.QA_FIRST_NAME = QA_CONFIG.firstName;
process.env.QA_LAST_NAME = QA_CONFIG.lastName;
process.env.QA_PHONE = QA_CONFIG.phone;
process.env.QA_STREET = QA_CONFIG.street;
process.env.QA_CITY = QA_CONFIG.city;
process.env.QA_POSTCODE = QA_CONFIG.postcode;
process.env.QA_PRODUCT_ONE = QA_CONFIG.productOne;
process.env.QA_PRODUCT_TWO = QA_CONFIG.productTwo;
process.env.ALLOW_QA_CART_RESET = QA_CONFIG.allowCartReset;
process.env.ALLOW_DEMO_ORDER_CREATION = QA_CONFIG.allowOrderCreation;
process.env.ALLOW_TWO_DEMO_ORDERS = QA_CONFIG.allowTwoOrders;

module.exports = { QA_CONFIG };
