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
    } catch (error) {

    }
}

export async function navigateToGiftCardGrid(page: Page): Promise<void> {
    try {
        await page.locator('#nav-admin-sales').hover();
        await page.locator('#nav-admin-sales-giftcard').hover();
        await page.locator('#nav-admin-sales-giftcard-manage').click({ timeout: 10000 });
    } catch {
        console.log('Không bấm được menu Sales > Gift Cards, dùng URL dự phòng...');
        await page.goto(`${ADMIN_URL}/giftcard/`, { waitUntil: 'domcontentloaded' });
    }
    await expect(pageTitle(page)).toContainText('Gift Cards', { timeout: 30000 });
}

export async function openFirstGiftCardEditForm(page: Page): Promise<void> {
    await navigateToGiftCardGrid(page);

    const firstEditLink = page.locator('#giftcardGrid_table tbody tr').first().locator('a', { hasText: 'Edit' });
    await expect(firstEditLink).toBeVisible({ timeout: 10000 });
    await firstEditLink.click();

    await expect(pageTitle(page)).toContainText('Edit Gift Card', { timeout: 30000 });
    await expect(page.locator('#loading-mask')).toBeHidden({ timeout: 30000 });
}

test.describe('Gift Card Management - Update & Delete Flow', () => {

    test.beforeEach(async ({ page }) => {
        await loginToAdmin(page);
    });


    test('GIFT_MGT_View_02: Kiểm tra giao diện và các nút chức năng trên form Edit', async ({ page }) => {
        await openFirstGiftCardEditForm(page);

        await expect(pageTitle(page)).toContainText('Edit Gift Card');
        await expect(page.getByRole('button', { name: 'Back', exact: false })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reset', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: /Delete/i })).toBeVisible();

        const balanceInput = getFieldById(page, 'balance');
        const balanceValue = await balanceInput.inputValue();
        expect(Number(balanceValue)).toBeGreaterThan(0);
    });


    test('GIFT_MGT_Update_01: Cập nhật thành công thông tin Gift Card hợp lệ', async ({ page }) => {
        await openFirstGiftCardEditForm(page);

        const updatedName = `Updated Recipient ${Date.now()}`;
        const recipientInput = getFieldById(page, 'recipient_name');
        await recipientInput.fill(updatedName);

        const messageInput = getFieldById(page, 'message');
        await messageInput.fill('Updated congratulation message!');

        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await expect(page.locator('.success-msg')).toContainText(/The gift card has been saved/i, { timeout: 15000 });
    });

    test('GIFT_MGT_Update_02: Bỏ trống các trường bắt buộc ở form Edit', async ({ page }) => {
        await openFirstGiftCardEditForm(page);

        const balanceInput = getFieldById(page, 'balance');
        await balanceInput.fill('');

        const websiteSelect = getFieldById(page, 'website_ids');
        await websiteSelect.selectOption([]);

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        const balanceError = page.locator('tr').filter({ has: balanceInput }).locator('.validation-advice');
        await expect(balanceError).toBeVisible();
        await expect(balanceError).toContainText(/This is a required field/i);

        const color = await balanceError.evaluate(el => window.getComputedStyle(el).color);
        expect(isRedColor(color)).toBe(true);
    });

    test('GIFT_MGT_Update_03: Nhập Amount là chữ và ký tự đặc biệt khi cập nhật Gift Card', async ({ page }) => {
        await openFirstGiftCardEditForm(page);

        const balanceInput = getFieldById(page, 'balance');
        await balanceInput.fill('abc!@#');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        const balanceError = page.locator('tr').filter({ has: balanceInput }).locator('.validation-advice');
        await expect(balanceError).toBeVisible();
        await expect(balanceError).toContainText(/Please enter a valid number in this field/i);
    });

    test('GIFT_MGT_Update_05: Thay đổi trạng thái Gift Card thành Disabled', async ({ page }) => {
        await openFirstGiftCardEditForm(page);

        await getFieldById(page, 'status').selectOption('disabled');
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(page.locator('.success-msg')).toContainText(/The gift card has been saved/i, { timeout: 15000 });
    });

    test('GIFT_MGT_Update_06: Nhập email không hợp lệ khi sửa thông tin Gift Card', async ({ page }) => {
        await openFirstGiftCardEditForm(page);

        const recipientEmail = getFieldById(page, 'recipient_email');
        await recipientEmail.fill('bad-email-format');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        const emailError = page.locator('tr').filter({ has: recipientEmail }).locator('.validation-advice');
        await expect(emailError).toBeVisible();
        await expect(emailError).toContainText(/Please enter a valid email address/i);
    });

    test('GIFT_MGT_Update_07: Lưu thay đổi và ở lại trang Edit bằng Save and Continue', async ({ page }) => {
        await openFirstGiftCardEditForm(page);

        const adminComment = getFieldById(page, 'comment');
        await adminComment.fill('Checked by Admin audit log');

        const saveAndContinueBtn = page.getByRole('button', { name: /Save and Continue/i });
        await saveAndContinueBtn.click();

        await expect(page.locator('.success-msg')).toContainText(/The gift card has been saved/i, { timeout: 15000 });
        await expect(pageTitle(page)).toContainText('Edit Gift Card');
    });

    test('GIFT_MGT_Update_08: Hủy bỏ chỉnh sửa và quay lại danh sách bằng nút Back', async ({ page }) => {
        await openFirstGiftCardEditForm(page);

        await getFieldById(page, 'recipient_name').fill('Should Not Save');
        await page.getByRole('button', { name: 'Back', exact: false }).click();

        await page.waitForURL(/giftcard\/index/, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await expect(pageTitle(page)).toHaveText('Gift Cards');
    });











    test('GIFT_MGT_Delete_01: Bấm Cancel trên hộp thoại xác nhận xóa Gift Card', async ({ page }) => {
        await openFirstGiftCardEditForm(page);

        const currentCode = await getFieldById(page, 'code').inputValue();

        page.once('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            await dialog.dismiss();
        });

        const deleteBtn = page.getByRole('button', { name: /Delete/i });
        if (await deleteBtn.isVisible()) {
            await deleteBtn.click();
        } else {
            await page.locator('button.delete, button.scalable.delete').click();
        }

        await expect(pageTitle(page)).toContainText('Edit Gift Card');
        await expect(getFieldById(page, 'code')).toHaveValue(currentCode);
    });

    test('GIFT_MGT_Delete_02: Xóa thành công Gift Card từ form Edit', async ({ page }) => {

        await navigateToGiftCardGrid(page);
        await page.getByRole('button', { name: /Add/i }).first().click();
        await getFieldById(page, 'code').fill(`TEMP-DEL-${Date.now()}`);
        await getFieldById(page, 'website_ids').selectOption('1');
        await getFieldById(page, 'balance').fill('10');
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await expect(page.locator('.success-msg')).toContainText(/The gift card has been saved/i);


        const firstEditLink = page.locator('#giftcardGrid_table tbody tr').first().locator('a', { hasText: 'Edit' });
        await firstEditLink.click();

        page.once('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });

        const deleteBtn = page.getByRole('button', { name: /Delete/i }).first();
        if (await deleteBtn.isVisible()) {
            await deleteBtn.click();
        } else {
            await page.locator('button.delete, button.scalable.delete').click();
        }

        await page.waitForURL(/giftcard\/index/, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await expect(page.locator('.success-msg')).toContainText(/The gift card has been deleted/i, { timeout: 15000 });
    });
});