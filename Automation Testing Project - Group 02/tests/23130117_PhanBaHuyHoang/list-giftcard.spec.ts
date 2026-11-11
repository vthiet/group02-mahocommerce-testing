import { test, expect, Page, Locator } from '@playwright/test';

const ADMIN_URL = 'https://demo.mahocommerce.com/admin2941834';
const USERNAME = 'demo';
const PASSWORD = 'demo1234demo1234';

// Custom Helpers
const pageTitle = (page: Page) =>
    page.locator('.content-header').getByRole('heading', { level: 3 }).first();

const getFieldById = (page: Page, id: string): Locator =>
    page.locator(`#${id}`);

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
// ĐI TỚI TRANG "MANAGE GIFT CARDS"
// =====================================================================
export async function navigateToGiftCardGrid(page: Page): Promise<void> {
    try {
        await page.locator('#nav-admin-sales').hover();
        await page.locator('#nav-admin-sales-giftcard').hover();
        await page.locator('#nav-admin-sales-giftcard-manage').click({ timeout: 10000 });
    } catch {
        console.log('Không bấm được menu qua UI, dùng URL dự phòng...');
        await page.goto(`${ADMIN_URL}/giftcard/`, { waitUntil: 'domcontentloaded' });
    }
    await expect(pageTitle(page)).toContainText('Gift Cards', { timeout: 30000 });
}

// Hàm trợ giúp: Đợi lưới AJAX của Magento tải xong (Mờ đi rồi sáng lại)
export async function waitForGridAjaxLoad(page: Page): Promise<void> {
    const loadingMask = page.locator('#loading-mask');
    // Magento thường hiện #loading-mask khi AJAX filter/sort bắt đầu
    await expect(loadingMask).toBeVisible({ timeout: 5000 }).catch(() => { });
    // Bắt buộc phải đợi nó biến mất (hoàn tất quá trình load)
    await expect(loadingMask).toBeHidden({ timeout: 30000 });
}

test.describe('Gift Card Management - List, Search, Filter, Sort', () => {

    test.beforeEach(async ({ page }) => {
        await loginToAdmin(page);
        await navigateToGiftCardGrid(page);
    });


    test('GIFT_MGT_View_01: Kiểm tra hiển thị bảng lưới (Grid) và các cột mặc định', async ({ page }) => {
        const gridTable = page.locator('#giftcardGrid_table');
        await expect(gridTable).toBeVisible();

        // Kiểm tra sự tồn tại của các header quan trọng
        const headers = gridTable.locator('thead tr.headings th');
        await expect(headers.locator('text="ID"')).toBeVisible();
        await expect(headers.locator('text="Code"')).toBeVisible();
        await expect(headers.locator('text="Status"')).toBeVisible();
        await expect(headers.locator('text="Websites"')).toBeVisible();
        await expect(headers.locator('text="Balance"')).toBeVisible();
        await expect(headers.locator('text="Expires"')).toBeVisible();
    });

    test('GIFT_MGT_Paginate_01: Sử dụng phân trang khi có nhiều dữ liệu (Pagination)', async ({ page }) => {
        const pageSizeSelect = page.locator('select[name="limit"]').first();

        if (await pageSizeSelect.isVisible()) {
            await pageSizeSelect.selectOption('50');
            await waitForGridAjaxLoad(page);

            const rowCount = await page.locator('#giftcardGrid_table tbody tr').count();
            expect(rowCount).toBeLessThanOrEqual(50);
        } else {
            console.log('Không đủ data hiển thị thanh Pagination để test');
            test.skip();
        }
    });


    test('GIFT_MGT_Search_01: Tìm kiếm Gift Card bằng Code chính xác', async ({ page }) => {
        // Lấy code của bản ghi đầu tiên hiện có để đem đi search
        const firstRowCodeCell = page.locator('#giftcardGrid_table tbody tr').first().locator('td:nth-child(3)');
        const searchCode = (await firstRowCodeCell.innerText()).trim();
        expect(searchCode).not.toBe('');

        const codeFilterInput = page.locator('#giftcardGrid_filter_code');
        await codeFilterInput.fill(searchCode);
        await codeFilterInput.press('Enter');

        await waitForGridAjaxLoad(page);

        const resultingCodeCells = page.locator('#giftcardGrid_table tbody tr td:nth-child(3)');
        const count = await resultingCodeCells.count();

        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(resultingCodeCells.nth(i)).toHaveText(searchCode);
        }
    });

    test('GIFT_MGT_Search_02: Tìm kiếm bản ghi bằng ID cụ thể', async ({ page }) => {
        // Tìm số ID của dòng đầu tiên
        const firstRowIdCell = page.locator('#giftcardGrid_table tbody tr').first().locator('td.a-right').first();
        const searchId = (await firstRowIdCell.innerText()).trim();
        expect(searchId).not.toBe('');

        const idFilterInput = page.locator('#giftcardGrid_filter_giftcard_id');
        await idFilterInput.fill(searchId);
        await idFilterInput.press('Enter');

        await waitForGridAjaxLoad(page);

        const resultRows = page.locator('#giftcardGrid_table tbody tr');
        await expect(resultRows).toHaveCount(1);

        const resultingIdCell = resultRows.first().locator('td').nth(1);
        await expect(resultingIdCell).toHaveText(searchId);
    });

    test('GIFT_MGT_Search_03: Trạng thái Empty (No records) khi search mã không tồn tại', async ({ page }) => {
        const nonExistentCode = `NOT-FOUND-${Date.now()}`;

        const codeFilterInput = page.locator('#giftcardGrid_filter_code');
        await codeFilterInput.fill(nonExistentCode);
        await page.getByRole('button', { name: 'Search', exact: true }).click();

        await waitForGridAjaxLoad(page);

        const emptyCell = page.locator('#giftcardGrid_table tbody tr td.empty-text');
        await expect(emptyCell).toBeVisible();
        await expect(emptyCell).toContainText(/No records found/i);
    });

    test('GIFT_MGT_Filter_01: Lọc danh sách Gift Card theo trạng thái (Status)', async ({ page }) => {
        const targetStatus = 'Active';
        const targetValue = 'active';

        const statusSelect = page.locator('#giftcardGrid_filter_status');
        await statusSelect.selectOption(targetValue);

        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await waitForGridAjaxLoad(page);

        const statusCells = page.locator('#giftcardGrid_table tbody tr td:nth-child(4)');
        const rowCount = await statusCells.count();

        if (rowCount > 0 && !(await page.locator('.empty-text').isVisible())) {
            for (let i = 0; i < rowCount; i++) {
                await expect(statusCells.nth(i)).toHaveText(targetStatus);
            }
        }
    });

    test('GIFT_MGT_Filter_02: Lọc danh sách Gift Card theo Website', async ({ page }) => {
        const websiteSelect = page.locator('#giftcardGrid_filter_website_ids');
        await websiteSelect.selectOption('1');

        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await waitForGridAjaxLoad(page);

        const websiteCells = page.locator('#giftcardGrid_table tbody tr td:nth-child(5)');
        const rowCount = await websiteCells.count();

        if (rowCount > 0 && !(await page.locator('.empty-text').isVisible())) {
            for (let i = 0; i < rowCount; i++) {
                await expect(websiteCells.nth(i)).toContainText('Maho Store');
            }
        }
    });

    test('GIFT_MGT_Filter_03: Lọc theo khoảng thời gian (Date Range) và tính năng Hủy lọc (Reset Filter)', async ({ page }) => {
        const resetBtn = page.getByRole('button', { name: /Reset Filter/i });


        if (await resetBtn.isVisible()) {
            await resetBtn.click();
            await waitForGridAjaxLoad(page);
        }


        const initialRowCount = await page.locator('#giftcardGrid_table tbody tr').count();

        const dateFromInput = page.locator('input[name="created_at[from]"]');
        const dateToInput = page.locator('input[name="created_at[to]"]');

        await dateFromInput.fill('2026-01-01');
        await dateToInput.fill('2026-12-31');


        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await waitForGridAjaxLoad(page);


        const filteredRowCount = await page.locator('#giftcardGrid_table tbody tr').count();
        expect(filteredRowCount).toBeGreaterThanOrEqual(1);

        await resetBtn.click();
        await waitForGridAjaxLoad(page);


        await expect(dateFromInput).toHaveValue('');
        await expect(dateToInput).toHaveValue('');

        const resetRowCount = await page.locator('#giftcardGrid_table tbody tr').count();


        expect(resetRowCount).toEqual(initialRowCount);
    });


    test('GIFT_MGT_Sort_01: Sắp xếp bảng dữ liệu theo ID', async ({ page }) => {

        const idSortHeader = page.locator('th[data-column-id="giftcard_id"] a');

        await idSortHeader.click();
        await waitForGridAjaxLoad(page);

        const sortClass1 = await idSortHeader.getAttribute('class');

        await idSortHeader.click();
        await waitForGridAjaxLoad(page);

        const sortClass2 = await idSortHeader.getAttribute('class');

        expect(sortClass1).not.toEqual(sortClass2);
    });


    test('GIFT_MGT_Sort_02: Sắp xếp danh sách theo Balance', async ({ page }) => {
        const balanceSortHeader = page.locator('th[data-column-id="balance"] a');

        await balanceSortHeader.click();
        await waitForGridAjaxLoad(page);

        await expect(balanceSortHeader).toHaveClass(/sort-arrow/);
    });

});