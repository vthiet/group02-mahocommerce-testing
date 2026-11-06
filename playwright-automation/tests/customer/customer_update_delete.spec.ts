import { test, expect, Page, Locator } from '@playwright/test';

const ADMIN_URL = 'https://demo.mahocommerce.com/admin2941834';
const USERNAME = 'demo';
const PASSWORD = 'demo1234demo1234';

// Custom Helpers
const pageTitle = (page: Page) =>
    page.locator('.content-header').getByRole('heading', { level: 3 }).first();

const getAccountField = (page: Page, id: string): Locator =>
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

// =====================================================================
// ĐI TỚI TRANG "MANAGE CUSTOMERS" VÀ MỞ FORM EDIT HÀNG ĐẦU TIÊN
// =====================================================================
export async function navigateToCustomerGrid(page: Page): Promise<void> {
    try {
        await page.locator('#nav-admin-customer').hover();
        await page.locator('#nav-admin-customer-manage').click({ timeout: 10000 });
    } catch {
        console.log('Không bấm được menu Customers, dùng URL dự phòng...');
        await page.goto(`${ADMIN_URL}/customer/`, { waitUntil: 'domcontentloaded' });
    }
    await expect(pageTitle(page)).toContainText('Manage Customers', { timeout: 30000 });
}

export async function openFirstCustomerEditForm(page: Page): Promise<void> {
    await navigateToCustomerGrid(page);

    // Mở link Edit ở dòng đầu tiên trên lưới Customer
    const firstEditLink = page.locator('#customerGrid_table tbody tr').first().locator('a', { hasText: 'Edit' });
    await expect(firstEditLink).toBeVisible({ timeout: 10000 });
    await firstEditLink.click();

    // Verify đã vào trang Edit Customer thành công
    await page.waitForURL(/customer\/edit/, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await expect(page.locator('#loading-mask')).toBeHidden({ timeout: 30000 });

    // 3. Click chuyển sang tab Account Information ở thanh sidebar
    const accountTab = page.locator('#customer_info_tabs_account');
    await accountTab.click();
}

test.describe('Customer Management - Update & Delete Flow', () => {

    test.beforeEach(async ({ page }) => {
        await loginToAdmin(page);
    });

    test('CUST_MGT_View_03: Kiểm tra giao diện và các nút chức năng trên form Edit Customer', async ({ page }) => {
        await openFirstCustomerEditForm(page);

        await expect(page.getByRole('button', { name: 'Back', exact: false })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reset', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();

        await expect(page.getByRole('button', { name: /Delete/i })).toBeVisible();

        await expect(getAccountField(page, '_accountfirstname')).not.toHaveValue('');
        await expect(getAccountField(page, '_accountemail')).not.toHaveValue('');
    });

    test('CUST_MGT_Update_01: Cập nhật thành công First Name và Last Name hợp lệ', async ({ page }) => {
        await openFirstCustomerEditForm(page);

        const updatedFirstName = `QAFirst${Date.now()}`;
        const updatedLastName = `QALast${Date.now()}`;

        await getAccountField(page, '_accountfirstname').fill(updatedFirstName);
        await getAccountField(page, '_accountlastname').fill(updatedLastName);

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(page.locator('.success-msg')).toContainText(/The customer has been saved/i, { timeout: 15000 });
    });


    test('CUST_MGT_Update_02: Bỏ trống các trường bắt buộc (First Name, Email) khi Edit', async ({ page }) => {
        await openFirstCustomerEditForm(page);

        const firstNameInput = getAccountField(page, '_accountfirstname');
        const emailInput = getAccountField(page, '_accountemail');

        await firstNameInput.fill('');
        await emailInput.fill('');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        // Verify Validation Advices
        const firstNameError = page.locator('tr').filter({ has: firstNameInput }).locator('.validation-advice').last();
        const emailError = page.locator('tr').filter({ has: emailInput }).locator('.validation-advice').last();

        await expect(firstNameError).toBeVisible();
        await expect(firstNameError).toContainText(/This is a required field/i);

        await expect(emailError).toBeVisible();
        await expect(emailError).toContainText(/This is a required field/i);

        const color = await firstNameError.evaluate(el => window.getComputedStyle(el).color);
        expect(isRedColor(color)).toBe(true);
    });


    test('CUST_MGT_Update_03: Nhập sai định dạng Email khi sửa thông tin Customer', async ({ page }) => {
        await openFirstCustomerEditForm(page);

        const emailInput = getAccountField(page, '_accountemail');
        await emailInput.fill('invalid_email_format');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        const emailError = page.locator('tr').filter({ has: emailInput }).locator('.validation-advice').last();
        await expect(emailError).toBeVisible();
        await expect(emailError).toContainText(/Please enter a valid email address/i);
    });


    test('CUST_MGT_Update_04: Cập nhật Nhóm khách hàng (Customer Group)', async ({ page }) => {
        await openFirstCustomerEditForm(page);

        const groupSelect = getAccountField(page, '_accountgroup_id');
        // Chọn option thứ 2 trong dropdown Group (ví dụ: General hoặc Wholesale)
        await groupSelect.selectOption({ index: 1 });

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(page.locator('.success-msg')).toContainText(/The customer has been saved/i, { timeout: 15000 });
    });


    test('CUST_MGT_Update_05: Đặt mật khẩu mới cho Customer thành công', async ({ page }) => {
        await openFirstCustomerEditForm(page);

        const passwordInput = getAccountField(page, '_accountnew_password');
        await passwordInput.fill('NewPassword123!');

        const confirmInput = getAccountField(page, '_accountcurrent_password');
        await confirmInput.fill('demo1234demo1234');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(page.locator('.success-msg')).toContainText(/The customer has been saved/i, { timeout: 15000 });
    });


    test('CUST_MGT_Update_07: Hủy chỉnh sửa bằng nút Back', async ({ page }) => {
        await openFirstCustomerEditForm(page);

        await getAccountField(page, '_accountfirstname').fill('CancelledName');

        await page.getByRole('button', { name: 'Back', exact: false }).click();

        await page.waitForURL(/customer\/index/, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await expect(pageTitle(page)).toContainText('Manage Customers');
    });


    test('CUST_MGT_Delete_01: Hủy bỏ thao tác xóa khi bấm Cancel trên popup xác nhận', async ({ page }) => {
        await openFirstCustomerEditForm(page);

        const currentEmail = await getAccountField(page, '_accountemail').inputValue();

        // Lắng nghe Dialog và bấm Cancel (Dismiss)
        page.once('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            await dialog.dismiss();
        });

        await page.getByRole('button', { name: /Delete/i }).click();

        // Verify vẫn ở lại trang Edit và dữ liệu không bị xóa
        await expect(page).toHaveURL(/customer\/edit/);
        await expect(getAccountField(page, '_accountemail')).toHaveValue(currentEmail);
    });


    test('CUST_MGT_Delete_02: Xóa thành công Customer từ trang Edit khi bấm OK', async ({ page }) => {
        // 1. Tạo mới 1 Customer rác để đem đi xóa an toàn
        await navigateToCustomerGrid(page);
        await page.getByRole('button', { name: /Add/i }).click();

        const tempEmail = `temp.del.${Date.now()}@demo.com`;
        await getAccountField(page, '_accountwebsite_id').selectOption('1');
        await getAccountField(page, '_accountgroup_id').selectOption('1');
        await getAccountField(page, '_accountfirstname').fill('Temp');
        await getAccountField(page, '_accountlastname').fill('Delete');
        await getAccountField(page, '_accountemail').fill(tempEmail);
        await getAccountField(page, '_accountpassword').fill('Demo1234!');
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await expect(page.locator('.success-msg')).toContainText(/The customer has been saved/i);

        // 2. Mở lại bản ghi vừa tạo
        const firstEditLink = page.locator('#customerGrid_table tbody tr').first().locator('a', { hasText: 'Edit' });
        await firstEditLink.click();

        // 3. Lắng nghe Dialog và bấm OK (Accept)
        page.once('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });

        // 4. Click Delete
        await page.getByRole('button', { name: /Delete/i }).click();

        // 5. Verify chuyển về trang Grid và xuất hiện thông báo đã xóa thành công
        await page.waitForURL(/customer\/index/, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await expect(page.locator('.success-msg')).toContainText(/The customer has been deleted/i, { timeout: 15000 });
    });
});