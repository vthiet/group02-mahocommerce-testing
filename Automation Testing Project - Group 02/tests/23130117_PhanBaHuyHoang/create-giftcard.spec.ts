import { test, expect, Page, Locator } from '@playwright/test';

const ADMIN_URL = 'https://demo.mahocommerce.com/admin2941834';
const USERNAME = 'demo';
const PASSWORD = 'demo1234demo1234';

// Custom Helpers
const pageTitle = (page: Page) =>
    page.locator('.content-header').getByRole('heading', { level: 3 }).first();

const getFieldById = (page: Page, id: string): Locator =>
    page.locator(`#${id}`);

function isRedColor(color: string): boolean {
    const match = color.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/);
    if (!match) return false;
    const [, r, g, b] = match.map(Number);
    return r >= 150 && g <= 100 && b <= 100;
}

export async function loginToAdmin(page: Page): Promise<void> {
    await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded' });

    const usernameInput = page.locator('#username');
    const mainMenu = page.locator('#nav');
    await usernameInput.or(mainMenu).first().waitFor({ state: 'visible', timeout: 30000 });

    if (await usernameInput.isVisible()) {
        await usernameInput.fill(USERNAME);
        const passwordInput = page.locator('input[type="password"]').first();
        await passwordInput.fill(PASSWORD);
        await passwordInput.press('Enter');
    }
    await expect(mainMenu, 'Login Failed').toBeVisible({ timeout: 30000 });

    const popupCloseBtn = page.locator('#message-popup-window .message-popup-close');

    try {

        await popupCloseBtn.waitFor({ state: 'visible', timeout: 3000 });
        await popupCloseBtn.click();
        console.log('Đã tự động đóng popup thông báo.');
    } catch (error) {

    }
}


export async function openNewGiftCardForm(page: Page): Promise<void> {
    try {

        await page.locator('#nav-admin-sales').hover();

        await page.locator('#nav-admin-sales-giftcard').hover();

        await page.locator('#nav-admin-sales-giftcard-manage').click({ timeout: 10000 });

    } catch (error) {
        console.log('Không bấm được menu qua UI, dùng URL dự phòng...', error);
        await page.goto(`${ADMIN_URL}/giftcard/`, { waitUntil: 'domcontentloaded' });
    }

    await expect(pageTitle(page)).toContainText('Gift Cards', { timeout: 30000 });

    await page.getByRole('button', { name: /Add/i }).first().click();

    await expect(pageTitle(page)).toContainText('New Gift Card', { timeout: 30000 });
    await expect(page.locator('#loading-mask')).toBeHidden({ timeout: 30000 });
}

test.describe('Gift Card Management - Create Flow', () => {

    test.beforeEach(async ({ page }) => {
        await loginToAdmin(page);
        await openNewGiftCardForm(page);
    });


    test('GIFT_MGT_Create_01: Bỏ trống các trường bắt buộc (Websites, Amount)', async ({ page }) => {
        const websiteSelect = getFieldById(page, 'website_ids');
        await websiteSelect.selectOption([]);

        const balanceInput = getFieldById(page, 'balance');
        await balanceInput.fill('');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        const websiteError = page.locator('tr').filter({ has: websiteSelect }).locator('.validation-advice');
        const balanceError = page.locator('tr').filter({ has: balanceInput }).locator('.validation-advice');

        await expect(websiteError).toBeVisible();
        await expect(websiteError).toContainText(/This is a required field/i);

        await expect(balanceError).toBeVisible();
        await expect(balanceError).toContainText(/This is a required field/i);

        const color = await balanceError.evaluate(el => window.getComputedStyle(el).color);
        expect(isRedColor(color)).toBe(true);
    });

    // GIFT_MGT_Create_02
    test('GIFT_MGT_Create_02: Nhập Amount không hợp lệ , (amount là số âm)', async ({ page }) => {
        await getFieldById(page, 'website_ids').selectOption('1');
        const balanceInput = getFieldById(page, 'balance');


        await balanceInput.fill('-50');
        await page.getByRole('button', { name: 'Save', exact: true }).click();


        const greaterThanZeroError = page.locator('#advice-validate-greater-than-zero-balance');
        await expect(greaterThanZeroError).toBeVisible();
        await expect(greaterThanZeroError).toContainText(/Please enter a number greater than 0/i);

    });


    test('GIFT_MGT_Create_03: Nhập Amount không hợp lệ (amount là chữ và kí tự đặc biệt)', async ({ page }) => {
        await getFieldById(page, 'website_ids').selectOption('1');
        const balanceInput = getFieldById(page, 'balance');

        // Test 2: Nhập chữ (abc) -> Kích hoạt lỗi phải là số
        await balanceInput.fill('abc!@#');
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        // Bắt đích danh ID thông báo lỗi định dạng số
        const numberError = page.locator('#advice-validate-number-balance');
        await expect(numberError).toBeVisible();
        await expect(numberError).toContainText(/Please enter a valid number in this field/i);
    });


    test('GIFT_MGT_Create_04: Nhập sai định dạng Recipient Email và Sender Email', async ({ page }) => {
        await getFieldById(page, 'website_ids').selectOption('1');
        await getFieldById(page, 'balance').fill('100');

        const recipientEmail = getFieldById(page, 'recipient_email');
        const senderEmail = getFieldById(page, 'sender_email');

        await recipientEmail.fill('invalid_recipient');
        await senderEmail.fill('invalid_sender');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        const recipientError = page.locator('tr').filter({ has: recipientEmail }).locator('.validation-advice');
        const senderError = page.locator('tr').filter({ has: senderEmail }).locator('.validation-advice');

        await expect(recipientError).toBeVisible();
        await expect(recipientError).toContainText(/Please enter a valid email address/i);

        await expect(senderError).toBeVisible();
        await expect(senderError).toContainText(/Please enter a valid email address/i);
    });


    test('GIFT_MGT_Create_05: Hệ thống hiển thị lỗi khi nhập trùng mã Gift Card đã tồn tại', async ({ page }) => {
        const duplicateCode = `DUPLICATE-${Date.now()}`;


        await getFieldById(page, 'code').fill(duplicateCode);
        await getFieldById(page, 'website_ids').selectOption('1');
        await getFieldById(page, 'balance').fill('100');

        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await expect(page.locator('.success-msg')).toContainText(/The gift card has been saved/i, { timeout: 15000 });


        await page.locator('#nav-admin-sales').hover();
        await page.locator('#nav-admin-sales-giftcard').hover();
        await page.locator('#nav-admin-sales-giftcard-manage').click();
        await page.getByRole('button', { name: /Add/i }).first().click();


        await getFieldById(page, 'code').fill(duplicateCode);
        await getFieldById(page, 'website_ids').selectOption('1');
        await getFieldById(page, 'balance').fill('200');
        await page.getByRole('button', { name: 'Save', exact: true }).click();




        const errorBody = page.locator('body');
        await expect(errorBody).toContainText(/Integrity constraint violation.*UNIQUE constraint failed: giftcard\.code/i, { timeout: 10000 });
    });


    test('GIFT_MGT_Create_06: Tạo Gift Card để trống Code (Auto-generate)', async ({ page }) => {
        await getFieldById(page, 'code').fill(''); // Leave empty
        await getFieldById(page, 'website_ids').selectOption('1');
        await getFieldById(page, 'balance').fill('50');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(page.locator('.success-msg')).toContainText(/The gift card has been saved/i, { timeout: 15000 });
    });

    test('GIFT_MGT_Create_07: Chọn nhiều Websites (Multi-select) cho một Gift Card', async ({ page }) => {
        // Truyền mảng các value ID để chọn nhiều opt ở Multi-Select
        await getFieldById(page, 'website_ids').selectOption(['1', '2', '3']);
        await getFieldById(page, 'balance').fill('200');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(page.locator('.success-msg')).toContainText(/The gift card has been saved/i, { timeout: 15000 });
    });


    test('GIFT_MGT_Create_08: Tạo Gift Card đẩy đủ thông tin tùy chọn (Happy Path Full Fields)', async ({ page }) => {
        await getFieldById(page, 'code').fill(`FULL-${Date.now()}`);
        await getFieldById(page, 'status').selectOption('active');
        await getFieldById(page, 'website_ids').selectOption('1');
        await getFieldById(page, 'balance').fill('300');

        await getFieldById(page, 'expires_at').fill('2026-12-12');

        await getFieldById(page, 'recipient_name').fill('Alice');
        await getFieldById(page, 'recipient_email').fill('alice@demo.com');
        await getFieldById(page, 'sender_name').fill('Bob Admin');
        await getFieldById(page, 'sender_email').fill('admin@demo.com');

        await getFieldById(page, 'message').fill('Happy Birthday!');
        await getFieldById(page, 'comment').fill('Created via Automation Tool');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(page.locator('.success-msg')).toContainText(/The gift card has been saved/i, { timeout: 15000 });
    });


    test('GIFT_MGT_Create_09: Tạo Gift Card với trạng thái Disabled ngay từ đầu', async ({ page }) => {
        await getFieldById(page, 'code').fill(`DIS-${Date.now()}`);
        await getFieldById(page, 'status').selectOption('disabled'); // Set disabled
        await getFieldById(page, 'website_ids').selectOption('1');
        await getFieldById(page, 'balance').fill('10');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(page.locator('.success-msg')).toContainText(/The gift card has been saved/i, { timeout: 15000 });
    });
});