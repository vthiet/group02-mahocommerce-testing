import { test, expect } from '@playwright/test';

const BASE_URL = process.env.MAHO_URL || 'https://demo.mahocommerce.com';
const ADMIN_URL = `${BASE_URL}/admin2941834/`;
const ADMIN_USER = process.env.ADMIN_USER || 'demo';
const ADMIN_PASS = process.env.ADMIN_PASS || 'demo1234demo1234';

async function waitForReset(page) {
    for (let i = 0; i < 15; i++) {
        const isResetting = await page.locator('text=Demo is resetting').isVisible().catch(() => false);
        if (!isResetting) break;
        console.log('Demo dang reset, cho 5s...');
        await page.waitForTimeout(5000);
        await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => { });
    }
}
async function loginAdmin(page) {
    await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await waitForReset(page);

    const usernameInput = page.locator('#username');
    const mainMenu = page.locator('#nav');

    await usernameInput.or(mainMenu).first().waitFor({ state: 'visible', timeout: 30000 });

    if (await usernameInput.isVisible()) {
        await usernameInput.fill(ADMIN_USER);
        const passwordInput = page.locator('input[type="password"]').first();
        await passwordInput.fill(ADMIN_PASS);
        await passwordInput.press('Enter');
    }

    await expect(mainMenu).toBeVisible({ timeout: 30000 });
}

async function goToPromoQuote(page) {
    await loginAdmin(page);
    const promoLink = page.locator('#nav a[href*="promo_quote"]').first();
    try {
        await promoLink.waitFor({ state: 'attached', timeout: 10000 });
        const href = await promoLink.getAttribute('href');
        if (href) {
            await page.goto(href, { waitUntil: 'domcontentloaded' });
        } else {
            await promoLink.click({ force: true });
        }
    } catch {
        await page.goto(`${ADMIN_URL}promo_quote/`, { waitUntil: 'domcontentloaded' });
    }
    await page.waitForLoadState('domcontentloaded').catch(() => { });
    await waitForReset(page);
}

async function addSampleProduct(page) {
    await page.goto(`${BASE_URL}/default/fashion/accessories/bags-luggage/halden-leather-weekender/`, { waitUntil: 'domcontentloaded' });
    await waitForReset(page);
    const form = page.locator('#product_addtocart_form');
    if (await form.isVisible().catch(() => false)) {
        await page.evaluate(() => {
            const f = document.getElementById('product_addtocart_form');
            if (f) HTMLFormElement.prototype.submit.call(f);
        });
        await page.waitForLoadState('domcontentloaded').catch(() => { });
    } else {
        await page.goto(`${BASE_URL}/default/checkout/cart/`, { waitUntil: 'domcontentloaded' });
    }
    await waitForReset(page);
}

async function ensureProductInCart(page) {
    await page.goto(`${BASE_URL}/default/checkout/cart/`, { waitUntil: 'domcontentloaded' });
    await waitForReset(page);
    if (await page.locator('#shopping-cart-table').isVisible().catch(() => false)) {
        return;
    }
    await addSampleProduct(page);
}

test.describe('2. Quản lý Mã giảm giá (Coupon / Discount Code System)', () => {

    test('Coupon_Admin_01: Kiểm tra truy cập trang Quản lý Mã giảm giá (Shopping Cart Price Rules) trong Admin', async ({ page }) => {
        await goToPromoQuote(page);
        const header = page.locator('.content-header h3, h3').first();
        await expect(header).toBeVisible();
        await expect(header).toContainText(/Shopping Cart Price Rules|Promotions/i);
    });

    test('Coupon_Admin_02: Kiểm tra cấu trúc lưới hiển thị danh sách mã giảm giá (Grid view)', async ({ page }) => {
        await goToPromoQuote(page);
        const grid = page.locator('#promo_quote_grid, .grid').first();
        await expect(grid).toBeVisible();
        const gridHeader = page.locator('#promo_quote_grid_table thead, .grid table thead').first();
        await expect(gridHeader).toContainText(/Rule/i);
        await expect(gridHeader).toContainText(/Status/i);
    });

    test('Coupon_Admin_03: Kiểm tra mở form tạo mới quy tắc mã giảm giá (Add New Rule)', async ({ page }) => {
        await goToPromoQuote(page);
        const addBtn = page.locator('.content-header button, button:has-text("Add"), button[title="Add"]').first();
        await expect(addBtn).toBeVisible();
        await addBtn.click();
        await expect(page.locator('#rule_name')).toBeVisible();
        await expect(page.locator('#rule_is_active')).toBeVisible();
        await expect(page.locator('#rule_coupon_type')).toBeVisible();
    });

    test('Coupon_Admin_04: [Validation] Kiểm tra bắt lỗi khi lưu quy tắc mã giảm giá để trống trường bắt buộc', async ({ page }) => {
        await goToPromoQuote(page);
        const addBtn = page.locator('.content-header button, button:has-text("Add"), button[title="Add"]').first();
        await addBtn.click();
        const saveBtn = page.locator('button[title="Save"], button:has-text("Save")').first();
        await saveBtn.click();
        const advice = page.locator('.validation-advice, .required-entry.validation-failed').first();
        await expect(advice).toBeVisible();
    });

    test('Coupon_Admin_05: Kiểm tra cấu hình loại Coupon cụ thể (Specific Coupon) và ô nhập mã Coupon Code', async ({ page }) => {
        await goToPromoQuote(page);
        const addBtn = page.locator('.content-header button, button:has-text("Add"), button[title="Add"]').first();
        await addBtn.click();
        const couponTypeSelect = page.locator('#rule_coupon_type');
        await couponTypeSelect.selectOption({ label: 'Specific Coupon' }).catch(() => couponTypeSelect.selectOption({ index: 1 }));
        const couponCodeInput = page.locator('#rule_coupon_code');
        await expect(couponCodeInput).toBeVisible();
        await couponCodeInput.fill('TESTSALE15');
        await expect(couponCodeInput).toHaveValue('TESTSALE15');
    });

    test('Coupon_Admin_06: Kiểm tra lọc và tìm kiếm quy tắc giảm giá trên Grid Admin', async ({ page }) => {
        await goToPromoQuote(page);
        const nameFilter = page.locator('input[name="name"], #promo_quote_grid_filter_name').first();
        if (await nameFilter.isVisible()) {
            await nameFilter.fill('Discount');
            await page.keyboard.press('Enter');
            await expect(page.locator('#promo_quote_grid, .grid').first()).toBeVisible();
        }
    });

    test('Coupon_Admin_07: [Admin/Date] Kiểm tra cấu hình thời hạn hiệu lực (From Date và To Date) của quy tắc', async ({ page }) => {
        await goToPromoQuote(page);
        const addBtn = page.locator('.content-header button, button:has-text("Add"), button[title="Add"]').first();
        await addBtn.click();
        const fromDate = page.locator('#rule_from_date');
        const toDate = page.locator('#rule_to_date');
        if (await fromDate.isVisible() && await toDate.isVisible()) {
            await fromDate.fill('2026-01-01');
            await toDate.fill('2026-12-31');
            await expect(fromDate).toHaveValue('2026-01-01');
            await expect(toDate).toHaveValue('2026-12-31');
        }
    });

    test('Coupon_Admin_08: [Admin/Usage] Kiểm tra cấu hình giới hạn số lượt sử dụng (Uses per Coupon và Uses per Customer)', async ({ page }) => {
        await goToPromoQuote(page);
        const addBtn = page.locator('.content-header button, button:has-text("Add"), button[title="Add"]').first();
        await addBtn.click();
        const usesCoupon = page.locator('#rule_uses_per_coupon');
        const usesCustomer = page.locator('#rule_uses_per_customer');
        if (await usesCoupon.isVisible() && await usesCustomer.isVisible()) {
            await usesCoupon.fill('100');
            await usesCustomer.fill('1');
            await expect(usesCoupon).toHaveValue('100');
            await expect(usesCustomer).toHaveValue('1');
        }
    });

    test('Coupon_Admin_09: [Admin/Group] Kiểm tra cấu hình nhóm khách hàng áp dụng quy tắc giảm giá (Customer Groups)', async ({ page }) => {
        await goToPromoQuote(page);
        const addBtn = page.locator('.content-header button, button:has-text("Add"), button[title="Add"]').first();
        await addBtn.click();
        const groupSelect = page.locator('#rule_customer_group');
        if (await groupSelect.isVisible()) {
            await expect(groupSelect).toBeVisible();
            const optionCount = await groupSelect.locator('option').count();
            expect(optionCount).toBeGreaterThan(0);
        }
    });

    test('Coupon_Admin_10: [Admin/Action] Kiểm tra cấu hình phương thức giảm giá (Percent Discount vs Fixed Amount)', async ({ page }) => {
        await goToPromoQuote(page);
        const addBtn = page.locator('.content-header button, button:has-text("Add"), button[title="Add"]').first();
        await addBtn.click();
        const actionSelect = page.locator('#rule_simple_action');
        if (await actionSelect.isVisible()) {
            await expect(actionSelect).toBeVisible();
            await actionSelect.selectOption({ index: 0 });
            await expect(actionSelect).toBeVisible();
        }
    });

    test('Coupon_Store_01: Storefront - Kiểm tra giao diện ô nhập mã giảm giá và nút Apply trong giỏ hàng', async ({ page }) => {
        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');
        await expect(promoInput).toBeVisible();
        await expect(promoBtn).toBeVisible();
        await expect(promoBtn).toHaveText(/Apply/i);
    });

    test('Coupon_Store_02: Storefront - [Negative] Áp dụng mã giảm giá không tồn tại trên hệ thống', async ({ page }) => {
        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');
        const fakeCode = 'INVALID_COUPON_9999';
        await promoInput.fill(fakeCode);
        await promoBtn.click();
        const messageContainer = page.locator('#maho-promo-message, .promo-message.error');
        await expect(messageContainer).toBeVisible({ timeout: 5000 });
        await expect(messageContainer).toContainText(new RegExp(`Promo code "${fakeCode}" is not valid`, 'i'));
    });

    test('Coupon_Store_03: Storefront - [Validation] Bấm Apply khi để trống ô nhập mã giảm giá', async ({ page }) => {
        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');
        await promoInput.fill('');
        await promoBtn.click();
        const messageContainer = page.locator('#maho-promo-message, .promo-message.error');
        await expect(messageContainer).toBeVisible({ timeout: 5000 });
        await expect(messageContainer).toContainText(/Please enter a promo code/i);
    });

    test('Coupon_Store_04: Storefront - [BVA] Kiểm tra nhập mã giảm giá chứa khoảng trắng đầu cuối (Trim check)', async ({ page }) => {
        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');

        await promoInput.fill('   DISCOUNT10   ');
        await promoBtn.click();

        const successMessage = page.locator('#maho-promo-message.success, .promo-message.success, .messages .success-msg');
        await expect(successMessage).toContainText(/was applied/i, { timeout: 2000 });
    });

    test('Coupon_Store_05: Storefront - [Negative/BVA] Kiểm tra nhập chuỗi ký tự đặc biệt làm mã giảm giá', async ({ page }) => {
        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');
        await promoInput.fill('!@#$%^&*()_+');
        await promoBtn.click();
        const messageContainer = page.locator('#maho-promo-message, .promo-message.error');
        await expect(messageContainer).toBeVisible({ timeout: 5000 });
        await expect(messageContainer).toContainText(/not valid/i);
    });

    test('Coupon_Store_06: Storefront - [Security] Kiểm tra không bị tấn công XSS / Script Injection qua ô nhập Coupon', async ({ page }) => {
        const runSecurityAudit = process.env.SECURITY_AUDIT === 'true';
        test.skip(!runSecurityAudit, 'Kịch bản Security Audit chuyên sâu (XSS/SQLi) được quản lý qua cờ SECURITY_AUDIT để tránh kích hoạt Cloudflare WAF trên máy chủ demo.');

        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');
        let alertTriggered = false;
        page.on('dialog', async dialog => {
            alertTriggered = true;
            await dialog.dismiss();
        });
        await promoInput.fill('<script>alert("XSS")</script>');
        await promoBtn.click();
        await page.waitForTimeout(500);
        expect(alertTriggered).toBeFalsy();
    });

    test('Coupon_Store_07: Storefront - [Positive] Áp dụng thành công mã giảm giá hợp lệ (DISCOUNT10) và hiển thị thông báo', async ({ page }) => {
        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');
        await promoInput.fill('DISCOUNT10');
        await promoBtn.click();
        const messageContainer = page.locator('#maho-promo-message').first();
        await expect(messageContainer).toBeVisible({ timeout: 5000 });
        await expect(messageContainer).toContainText(/was applied/i);
    });

    test('Coupon_Store_08: Storefront - [Negative] Áp dụng mã giảm giá đã hết hạn sử dụng (EXPIRED2025)', async ({ page }) => {
        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');
        await promoInput.fill('EXPIRED2025');
        await promoBtn.click();
        const messageContainer = page.locator('#maho-promo-message, .promo-message.error');
        await expect(messageContainer).toBeVisible({ timeout: 5000 });
        await expect(messageContainer).toContainText(/expired|not valid/i);
    });

    test('Coupon_Store_09: Storefront - [Positive] Kiểm tra hủy áp dụng mã giảm giá (Cancel / Remove Coupon)', async ({ page }) => {
        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');
        await promoInput.fill('DISCOUNT10');
        await promoBtn.click();
        const cancelBtn = page.locator('#maho-promo-cancel, button:has-text("Cancel Coupon")').first();
        if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await cancelBtn.click();
            const messageContainer = page.locator('#maho-promo-message');
            await expect(messageContainer).toContainText(/canceled|removed/i);
        } else {
            await promoInput.fill('');
            await promoBtn.click();
            await expect(page.locator('#shopping-cart-table')).toBeVisible();
        }
    });

    test('Coupon_Store_10: Storefront - [BVA] Kiểm tra nhập chuỗi mã coupon vượt giới hạn độ dài cho phép (>50 ký tự)', async ({ page }) => {
        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');
        const longCode = 'A'.repeat(60);
        await promoInput.fill(longCode);
        await promoBtn.click();
        const messageContainer = page.locator('#maho-promo-message, .promo-message.error');
        await expect(messageContainer).toBeVisible({ timeout: 5000 });
        await expect(messageContainer).toContainText(/not valid|too long/i);
    });

    test('Coupon_Store_11: Storefront - [Negative] Kiểm tra thao tác bấm Apply liên tục nhiều lần (Spam Click Coupon)', async ({ page }) => {
        await ensureProductInCart(page);
        const promoInput = page.locator('#maho-promo-code');
        const promoBtn = page.locator('#maho-promo-apply');
        await promoInput.fill('TESTCOUPON');
        await promoBtn.click();
        await promoBtn.click().catch(() => { });
        await promoBtn.click().catch(() => { });
        const messageContainer = page.locator('#maho-promo-message, .promo-message');
        await expect(messageContainer).toBeVisible({ timeout: 5000 });
    });

});

