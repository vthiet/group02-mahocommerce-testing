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
        console.log('Đã tự động đóng popup thông báo.');
    } catch (error) {

    }
}

// =====================================================================
// VÀO TRANG "MANAGE CUSTOMERS" VÀ MỞ FORM ADD NEW CUSTOMER
// =====================================================================
export async function goToCustomerGrid(page: Page): Promise<void> {
    try {
        await page.locator('#nav-admin-customer').hover();
        await page.locator('#nav-admin-customer-manage').click({ timeout: 10000 });
    } catch {
        console.log('Không bấm được menu Customers, dùng URL dự phòng...');
        await page.goto(`${ADMIN_URL}/customer/`);
    }

    await expect(pageTitle(page)).toContainText('Manage Customers', { timeout: 30000 });
}

export async function openNewCustomerForm(page: Page): Promise<void> {
    await goToCustomerGrid(page);

    await page.getByRole('button', { name: 'Add', exact: true }).click();

    await expect(pageTitle(page)).toContainText('New Customer', { timeout: 30000 });
    await expect(page.locator('#loading-mask')).toBeHidden({ timeout: 30000 });
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
}

test.describe('Customer Management - Add Customer Flow ', () => {

    test.beforeEach(async ({ page }) => {
        await loginToAdmin(page);
        await openNewCustomerForm(page);
    });

    // CUS_MGT_01: Bỏ trống các trường bắt buộc Account Info
    test('CUS_MGT_01: Bỏ trống các trường bắt buộc ở tab Account Info', async ({ page }) => {
        // Clear value inside Select Website
        const websiteSelect = getAccountField(page, '_accountwebsite_id');
        await websiteSelect.selectOption({ value: '' });

        await getAccountField(page, '_accountfirstname').fill('');
        await getAccountField(page, '_accountlastname').fill('');
        await getAccountField(page, '_accountemail').fill('');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        // Verify Validation Advices
        const requiredIds = ['_accountwebsite_id', '_accountfirstname', '_accountlastname', '_accountemail'];

        for (const fieldId of requiredIds) {
            const field = getAccountField(page, fieldId);
            const errorElement = page.locator('tr').filter({ has: field }).locator('.validation-advice');

            await expect(errorElement).toBeVisible();
            await expect(errorElement).toContainText(/Please select|This is a required field/i);

            const color = await errorElement.evaluate(el => window.getComputedStyle(el).color);
            expect(isRedColor(color)).toBe(true);
        }
    });

    // CUS_MGT_02: Nhập sai định dạng Email
    test('CUS_MGT_02: Nhập sai định dạng trường Email', async ({ page }) => {
        const emailField = getAccountField(page, '_accountemail');
        await emailField.fill('invalid_email_format');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        const emailError = page.locator('tr').filter({ has: emailField }).locator('.validation-advice');
        await expect(emailError).toBeVisible();
        await expect(emailError).toContainText(/Please enter a valid email address/i);
    });

    // CUS_MGT_03: Password quá ngắn (< 7 ký tự)
    test('CUS_MGT_03: Nhập Password không đủ độ dài tối thiểu', async ({ page }) => {
        const passwordField = getAccountField(page, '_accountpassword');
        await passwordField.fill('1b!'); // Requirement is 7 characters

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        const passError = page.locator('tr').filter({ has: passwordField }).locator('.validation-advice');
        await expect(passError).toBeVisible();
        await expect(passError).toContainText(/Please enter more characters or clean leading or trailing spaces/i);
    });

    // CUS_MGT_04: UI Logic - Tương tác Checkbox disable Password
    test('CUS_MGT_04: Checkbox "Email Link to Set Password" disable trường Password', async ({ page }) => {
        const passwordField = getAccountField(page, '_accountpassword');
        const emailLinkCheckbox = page.locator('#account-send-pass');

        // Initially enabled
        await expect(passwordField).toBeEnabled();

        // Check checkbox -> Password field must be disabled
        await emailLinkCheckbox.check();
        await expect(passwordField).toBeDisabled();

        // Uncheck -> Password field enabled back
        await emailLinkCheckbox.uncheck();
        await expect(passwordField).toBeEnabled();
    });

    // CUS_MGT_05: Hủy nhập liệu qua nút Reset
    test('CUS_MGT_05: Hủy bỏ thay đổi bằng nút Reset form', async ({ page }) => {
        const firstNameField = getAccountField(page, '_accountfirstname');
        await firstNameField.fill('Test Reset Name');

        // Click Reset
        await page.getByRole('button', { name: 'Reset', exact: true }).click();

        // Wait for page to reload
        await page.waitForLoadState('networkidle');

        // Assert field is cleared
        await expect(getAccountField(page, '_accountfirstname')).toHaveValue('');
    });

    // CUS_MGT_06: Bỏ trống form Address
    test('CUS_MGT_06: Bỏ trống các trường bắt buộc khi thêm mới Address', async ({ page }) => {
        // Chuyển sang tab Address
        await page.locator('#customer_info_tabs_addresses').click();

        // Nhấn Add Address
        await page.locator('#add_address_button').click();

        // Nhấn Save
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        // Tìm đích danh thẻ div báo lỗi có class validation-advice và id kết thúc bằng chữ "city"
        const cityError = page.locator('.validation-advice[id$="city"]').first();

        // Verify lỗi của field hiển thị chính xác
        await expect(cityError).toBeVisible();
        await expect(cityError).toContainText(/required field/i);
    });

    // CUS_MGT_07: Thêm nhiều địa chỉ và thiết lập Default Billing / Shipping riêng biệt
    test('CUS_MGT_07: Thêm Customer với 2 địa chỉ và set Default Billing/Shipping chéo nhau', async ({ page }) => {
        const uniqueEmail = `multi.address.${Date.now()}@demo.com`;

        // 1. Account Info cơ bản
        await getAccountField(page, '_accountwebsite_id').selectOption('1');
        await getAccountField(page, '_accountgroup_id').selectOption('1');
        await getAccountField(page, '_accountfirstname').fill('Multi');
        await getAccountField(page, '_accountlastname').fill('Address');
        await getAccountField(page, '_accountemail').fill(uniqueEmail);
        await getAccountField(page, '_accountpassword').fill('Demo1234!');

        // 2. Chuyển sang Tab Address
        await page.locator('#customer_info_tabs_addresses').click();

        // --- THÊM ĐỊA CHỈ 1 (Sẽ làm Default Billing) ---
        await page.locator('#add_address_button').click();

        // Đợi Address 1 render ra DOM
        const address1City = page.locator('input[id="_item1city"]');
        await address1City.waitFor({ state: 'visible', timeout: 5000 });

        await address1City.fill('Hanoi');
        await page.locator('input[id="_item1postcode"]').fill('100000');
        await page.locator('input[id="_item1telephone"]').fill('0901111111');
        await page.locator('input[id="_item1street0"]').fill('123 Pho Hue');
        await page.locator('select[id="_item1country_id"]').selectOption('VN');

        // Check radio Default Billing cho Address 1 (Bắt chính xác ID sau khi template clone)
        await page.locator('#address_item_billing_item1').check();


        // --- THÊM ĐỊA CHỈ 2 (Sẽ làm Default Shipping) ---
        await page.locator('#add_address_button').click();

        // Đợi Address 2 render ra DOM
        const address2City = page.locator('input[id="_item2city"]');
        await address2City.waitFor({ state: 'visible', timeout: 5000 });

        await address2City.fill('Da Nang');
        await page.locator('input[id="_item2postcode"]').fill('550000');
        await page.locator('input[id="_item2telephone"]').fill('0902222222');
        await page.locator('input[id="_item2street0"]').fill('456 Tran Phu');
        await page.locator('select[id="_item2country_id"]').selectOption('VN');

        // Check radio Default Shipping cho Address 2
        await page.locator('#address_item_shipping_item2').check();


        // 3. Save và Verify
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await page.waitForURL(/customer\/index/);
        await expect(page.locator('.success-msg')).toContainText(/The customer has been saved/i, { timeout: 15000 });
    });

    // CUS_MGT_08: Thêm mới Customer với đầy đủ thông tin + 1 Địa chỉ
    test('CUS_MGT_08: Thêm mới Customer với đầy đủ thông tin + 1 Địa chỉ', async ({ page }) => {
        const uniqueEmail = `full.customer.${Date.now()}@demo.com`;

        // 1. Nhập thông tin Account Info (Bổ sung Group và Password)
        await getAccountField(page, '_accountwebsite_id').selectOption('1'); // Maho Store
        await getAccountField(page, '_accountgroup_id').selectOption('1'); // General (Trường bắt buộc bị thiếu)

        await getAccountField(page, '_accountfirstname').fill('John');
        await getAccountField(page, '_accountlastname').fill('Doe');
        await getAccountField(page, '_accountemail').fill(uniqueEmail);

        // Mật khẩu bắt buộc (tối thiểu 7 ký tự)
        await getAccountField(page, '_accountpassword').fill('Demo1234!');

        // 2. Chuyển sang Tab Address và nhấn Add
        await page.locator('#customer_info_tabs_addresses').click();
        await page.locator('#add_address_button').click();

        // 3. Nhập Form Address
        const cityInput = page.locator('input[id^="_item"][id$="city"]');
        await cityInput.waitFor({ state: 'visible', timeout: 5000 });
        await cityInput.fill('Cupertino');
        await page.locator('input[id^="_item"][id$="postcode"]').fill('95014');
        await page.locator('input[id^="_item"][id$="telephone"]').fill('0123456789');
        await page.locator('input[id^="_item"][id$="street0"]').fill('1 Apple Park Way');
        await page.locator('select[id^="_item"][id$="region_id"]').selectOption('12');

        // 4. Lưu lại
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await page.waitForURL(/customer\/index/);
        await expect(page.locator('.success-msg')).toContainText(/The customer has been saved/i, { timeout: 15000 });
    });


    // CUS_MGT_09: Tạo Customer (Happy Path - Chỉ Account Info)
    test('CUS_MGT_09: Thêm mới Customer chỉ với Account Info (Happy Path)', async ({ page }) => {
        const uniqueEmail = `mini.customer.${Date.now()}@demo.com`;

        // Nhập đủ các trường bắt buộc của Account Info
        await getAccountField(page, '_accountwebsite_id').selectOption('1');
        await getAccountField(page, '_accountgroup_id').selectOption('1'); // Bổ sung Group

        await getAccountField(page, '_accountfirstname').fill('Jane');
        await getAccountField(page, '_accountlastname').fill('Smith');
        await getAccountField(page, '_accountemail').fill(uniqueEmail);
        await getAccountField(page, '_accountpassword').fill('Demo1234!'); // Bổ sung Password

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(page.locator('.success-msg')).toContainText(/The customer has been saved/i, { timeout: 15000 });
    });



    // CUS_MGT_10: End-to-End Test - Tạo ở Admin và Đăng nhập ở Storefront
    test('CUS_MGT_10: Đăng nhập Storefront thành công với tài khoản vừa tạo', async ({ page }) => {
        const uniqueEmail = `e2e.democustomer@demo.com`;
        const customerPassword = 'abc123!@#';
        const STOREFRONT_URL = 'https://demo.mahocommerce.com/default/';

        // =========================================
        // PHASE 1: TẠO TÀI KHOẢN TRÊN ADMIN
        // =========================================
        await getAccountField(page, '_accountwebsite_id').selectOption('1');
        await getAccountField(page, '_accountgroup_id').selectOption('1');

        await getAccountField(page, '_accountfirstname').fill('Jane');
        await getAccountField(page, '_accountlastname').fill('Smith');
        await getAccountField(page, '_accountemail').fill(uniqueEmail);
        await getAccountField(page, '_accountpassword').fill(customerPassword);

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(page.locator('.success-msg')).toContainText(/The customer has been saved/i, { timeout: 15000 });

        // ==========================================
        // PHASE 2: ĐĂNG NHẬP TRÊN STOREFRONT
        // ==========================================
        // 1. Điều hướng sang trang chủ Storefront
        await page.goto(STOREFRONT_URL, { waitUntil: 'domcontentloaded' });

        // 2. Click vào link Account trên header (Dựa vào class .skip-account)
        await page.locator('a.skip-account').click();

        // Đợi form đăng nhập hiển thị (Tab login được check mặc định)
        const emailInput = page.locator('input#email');
        await emailInput.waitFor({ state: 'visible', timeout: 5000 });

        // 3. Điền thông tin vào form Login
        await emailInput.fill(uniqueEmail);
        await page.locator('input#pass').fill(customerPassword);

        // 4. Bấm nút Login (Dựa vào button#send2)
        await page.locator('button#send2').click();


        // Kiểm tra title của trang Dashboard để xác nhận đã vào trong
        const dashboardTitle = page.getByRole('heading', { level: 1 }).first();
        await expect(dashboardTitle).toContainText(/My Dashboard/i, { timeout: 10000 });
    });

});
