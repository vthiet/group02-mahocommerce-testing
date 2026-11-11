import { test, expect, Page, Locator } from '@playwright/test';

const ADMIN_URL = 'https://demo.mahocommerce.com/admin2941834';
const USERNAME = 'demo';
const PASSWORD = 'demo1234demo1234';

// Custom Helpers
const pageTitle = (page: Page) =>
    page.locator('.content-header').getByRole('heading', { level: 3 }).first();

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

    // Đóng popup thông báo nếu có
    const popupCloseBtn = page.locator('#message-popup-window .message-popup-close');
    try {
        await popupCloseBtn.waitFor({ state: 'visible', timeout: 3000 });
        await popupCloseBtn.click();
    } catch (error) {
        // Bỏ qua nếu không có popup
    }
}

// =====================================================================
// ĐI TỚI TRANG "MANAGE CUSTOMERS"
// =====================================================================
export async function navigateToCustomerGrid(page: Page): Promise<void> {
    try {
        await page.locator('#nav-admin-customer').hover();
        await page.locator('#nav-admin-customer-manage').click({ timeout: 10000 });
    } catch {
        console.log('Không bấm được menu qua UI, dùng URL dự phòng...');
        await page.goto(`${ADMIN_URL}/customer/`, { waitUntil: 'domcontentloaded' });
    }
    await expect(pageTitle(page)).toContainText('Manage Customers', { timeout: 30000 });
}

// Hàm trợ giúp: Đợi lưới AJAX của Magento tải xong (Mờ đi rồi sáng lại)
export async function waitForGridAjaxLoad(page: Page): Promise<void> {
    const loadingMask = page.locator('#loading-mask');
    await expect(loadingMask).toBeVisible({ timeout: 5000 }).catch(() => { });
    await expect(loadingMask).toBeHidden({ timeout: 30000 });
}

test.describe('Customer Management - List, Search, Filter, Sort', () => {

    test.beforeEach(async ({ page }) => {
        await loginToAdmin(page);
        await navigateToCustomerGrid(page);
    });

    // =============================================================
    // 1. VIEW & LIST
    // =============================================================
    test('CUST_MGT_List_01: Kiểm tra hiển thị bảng và các cột mặc định', async ({ page }) => {
        const gridTable = page.locator('#customerGrid_table');
        await expect(gridTable).toBeVisible();

        // Kiểm tra sự tồn tại của các header quan trọng
        const headers = gridTable.locator('thead tr.headings th');
        await expect(headers.locator('text="ID"').first()).toBeVisible();
        await expect(headers.locator('text="Name"').first()).toBeVisible();
        await expect(headers.locator('text="Email"').first()).toBeVisible();
        await expect(headers.locator('text="Country"').first()).toBeVisible();
        await expect(headers.locator('text="Customer Since"').first()).toBeVisible();
    });

    // CUST_MGT_Action_01
    test('CUST_MGT_Action_01: Kiểm tra dữ liệu Customer khi truy cập trang Edit', async ({ page }) => {
        const firstRow = page.locator('#customerGrid_table tbody tr').first();

        // Lấy thông tin Customer từ Grid
        const originalEmail = (await firstRow.locator('td:nth-child(4)').innerText()).trim();
        const editLink = firstRow.locator('a', { hasText: 'Edit' });

        expect(originalEmail).not.toBe('');
        await expect(editLink).toBeVisible();

        // Truy cập trang Edit
        await editLink.click();

        const accountTab = page.locator('#customer_info_tabs_account');
        await accountTab.click();

        // Lấy các trường thông tin
        const firstNameInput = page.locator('input[name="account[firstname]"]');
        const lastNameInput = page.locator('input[name="account[lastname]"]');
        const emailInput = page.locator('input[name="account[email]"]');

        // Kiểm tra các trường hiển thị
        await expect(firstNameInput).toBeVisible();
        await expect(lastNameInput).toBeVisible();
        await expect(emailInput).toBeVisible();

        // Kiểm tra dữ liệu được load chính xác
        await expect(firstNameInput).not.toHaveValue('');
        await expect(lastNameInput).not.toHaveValue('');
        await expect(emailInput).toHaveValue(originalEmail);

        // Kiểm tra trường Email không bị disable
        await expect(emailInput).toBeEditable();
    });

    // =============================================================
    // 2. SEARCH
    // =============================================================
    test('CUST_MGT_Search_01: Tìm kiếm Customer bằng Email chính xác', async ({ page }) => {
        // Lấy email của bản ghi đầu tiên hiện có để tìm kiếm
        const firstRowEmailCell = page.locator('#customerGrid_table tbody tr').first().locator('td:nth-child(4)');
        const searchEmail = (await firstRowEmailCell.innerText()).trim();
        expect(searchEmail).not.toBe('');

        // Nhập email vào ô filter và Enter
        const emailFilterInput = page.locator('#customerGrid_filter_email');
        await emailFilterInput.fill(searchEmail);
        await emailFilterInput.press('Enter');
        await waitForGridAjaxLoad(page);

        // Đảm bảo kết quả trả về đúng email đó
        const resultingEmailCells = page.locator('#customerGrid_table tbody tr td:nth-child(4)');
        const count = await resultingEmailCells.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(resultingEmailCells.nth(i)).toHaveText(searchEmail);
        }
    });

    test('CUST_MGT_Search_02: Tìm kiếm Customer bằng một phần Tên (Partial Name)', async ({ page }) => {
        // Lấy Tên đầu tiên (VD: "John Doe" -> "John")
        const fullName = await page.locator('#customerGrid_table tbody tr').first().locator('td:nth-child(3)').innerText();
        const searchName = fullName.split(/\s+/)[0];

        const nameFilterInput = page.locator('#customerGrid_filter_name');
        await nameFilterInput.fill(searchName);
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await waitForGridAjaxLoad(page);

        // Kiểm tra tất cả dòng kết quả đều chứa từ khóa tên
        const resultingNameCells = page.locator('#customerGrid_table tbody tr td:nth-child(3)');
        const count = await resultingNameCells.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(resultingNameCells.nth(i)).toContainText(searchName, { ignoreCase: true });
        }
    });

    test('CUST_MGT_Search_03: Trạng thái Empty (No records) khi search Email không tồn tại', async ({ page }) => {
        const nonExistentEmail = `not_found_${Date.now()}@domain.com`;

        const emailFilterInput = page.locator('#customerGrid_filter_email');
        await emailFilterInput.fill(nonExistentEmail);
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await waitForGridAjaxLoad(page);

        const emptyCell = page.locator('#customerGrid_table tbody tr td.empty-text');
        await expect(emptyCell).toBeVisible();
        await expect(emptyCell).toContainText(/No records found/i);
    });

    // =============================================================
    // 3. FILTER & RESET
    // =============================================================
    test('CUST_MGT_Filter_01: Lọc danh sách Customer theo Country (Quốc gia)', async ({ page }) => {
        const targetCountry = 'United States';
        const targetValue = 'US'; // Tùy thuộc vào value thực tế của dropdown Magento

        const countrySelect = page.locator('#customerGrid_filter_billing_country_id');
        await countrySelect.selectOption(targetValue);
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await waitForGridAjaxLoad(page);

        const countryCells = page.locator('#customerGrid_table tbody tr td:nth-child(8)');
        const rowCount = await countryCells.count();
        if (rowCount > 0 && !(await page.locator('.empty-text').isVisible())) {
            for (let i = 0; i < rowCount; i++) {
                await expect(countryCells.nth(i)).toContainText(targetCountry);
            }
        }
    });

    test('CUST_MGT_Filter_02: Lọc theo Customer Since (Date Range) và Hủy lọc (Reset Filter)', async ({ page }) => {
        const resetBtn = page.getByRole('button', { name: /Reset Filter/i });
        if (await resetBtn.isVisible()) {
            await resetBtn.click();
            await waitForGridAjaxLoad(page);
        }

        const initialRowCount = await page.locator('#customerGrid_table tbody tr').count();

        const dateFromInput = page.locator('input[name="customer_since[from]"]');
        const dateToInput = page.locator('input[name="customer_since[to]"]');

        await dateFromInput.fill('2023-01-01');
        await dateToInput.fill('2026-12-31');

        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await waitForGridAjaxLoad(page);

        const filteredRowCount = await page.locator('#customerGrid_table tbody tr').count();
        expect(filteredRowCount).toBeGreaterThanOrEqual(1);

        // Bấm Reset Filter để khôi phục
        await resetBtn.click();
        await waitForGridAjaxLoad(page);

        await expect(dateFromInput).toHaveValue('');
        const resetRowCount = await page.locator('#customerGrid_table tbody tr').count();
        expect(resetRowCount).toEqual(initialRowCount);
    });

    // =============================================================
    // 4. SORT
    // =============================================================
    test('CUST_MGT_Sort_01: Sắp xếp bảng dữ liệu theo ID', async ({ page }) => {
        // Selector cột ID của Customer
        const idSortHeader = page.locator('th[data-column-id="entity_id"] a');

        await idSortHeader.click();
        await waitForGridAjaxLoad(page);
        const sortClass1 = await idSortHeader.getAttribute('class');

        await idSortHeader.click();
        await waitForGridAjaxLoad(page);
        const sortClass2 = await idSortHeader.getAttribute('class');

        expect(sortClass1).not.toEqual(sortClass2);
        await expect(idSortHeader).toHaveClass(/sort-arrow/);
    });

    // =============================================================
    // 5. PAGINATION
    // =============================================================
    test('CUST_MGT_Paginate_01: Thay đổi số dòng hiển thị (Items per page)', async ({ page }) => {
        const pageSizeSelect = page.locator('select[name="limit"]').first();

        if (await pageSizeSelect.isVisible()) {
            await pageSizeSelect.selectOption('50');
            await waitForGridAjaxLoad(page);

            const rowCount = await page.locator('#customerGrid_table tbody tr').count();
            expect(rowCount).toBeLessThanOrEqual(50);
        } else {
            console.log('Không đủ data hiển thị thanh Pagination để test');
            test.skip();
        }
    });

    test('CUST_MGT_Action_05: Cập nhật nhóm cho nhiều khách hàng qua Mass Action (Assign Group)', async ({ page }) => {
        const customerRows = page.locator('#customerGrid_table tbody tr').filter({ hasNot: page.locator('.empty-text') });
        const checkboxes = customerRows.locator('.massaction-checkbox');

        test.skip((await checkboxes.count()) < 3, 'Grid không có đủ ít nhất 3 khách hàng để test Mass Action');

        const targetIds: string[] = [];
        for (let i = 0; i < 3; i++) {
            const id = await customerRows.nth(i).locator('td:nth-child(2)').innerText();
            targetIds.push(id.trim());
        }

        for (let i = 0; i < 3; i++) {
            await checkboxes.nth(i).check();
        }

        const massActionSelect = page.locator('#customerGrid_massaction-select');
        await massActionSelect.selectOption('assign_group');


        const targetGroupValue = '2';
        const targetGroupName = 'Wholesale';
        const groupSelect = page.locator('#customerGrid_massaction-form-additional select[name="group"]');

        await expect(groupSelect).toBeVisible();
        await groupSelect.selectOption(targetGroupValue);

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            page.getByRole('button', { name: 'Submit', exact: true }).click()
        ]);

        const successMsg = page.locator('.success-msg');
        await expect(successMsg).toBeVisible();
        await expect(successMsg).toContainText(/Total of \d+ record\(s\) were updated/i);


        for (const id of targetIds) {
            const targetRow = page.locator('#customerGrid_table tbody tr').filter({
                has: page.locator('td:nth-child(2)', { hasText: new RegExp(`^\\s*${id}\\s*$`) })
            }).first();

            const updatedGroupCell = targetRow.locator('td:nth-child(5)');
            await expect(updatedGroupCell).toContainText(targetGroupName);
        }
    });

});