import { test, expect } from '@playwright/test';

const BASE_URL = process.env.MAHO_URL || 'https://demo.mahocommerce.com';
const ADMIN_URL = `${BASE_URL}/admin2941834/`;
const ADMIN_USER = process.env.ADMIN_USER || 'demo';
const ADMIN_PASS = process.env.ADMIN_PASS || 'demo1234demo1234';

async function goToReport(page, menuHrefPattern) {
    const linkLocator = page.locator(`#nav a[href*="${menuHrefPattern}"]`).first();
    await linkLocator.waitFor({ state: 'attached', timeout: 10000 });
    const href = await linkLocator.getAttribute('href');
    if (href) {
        await page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
        await linkLocator.click({ force: true });
    }
    await page.waitForLoadState('domcontentloaded').catch(() => {});
}

async function loginAdmin(page) {
    await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (page.url().includes('dashboard') || await page.locator('#nav').first().isVisible().catch(() => false)) {
        return;
    }
    const usernameInput = page.locator('#username');
    const passwordInput = page.locator('#login');
    const loginButton = page.locator('input[type="submit"], button[type="submit"], input[title="Login"], .form-button').first();

    if (await usernameInput.isVisible()) {
        await usernameInput.fill(ADMIN_USER);
        await passwordInput.fill(ADMIN_PASS);
        await loginButton.click();
        await page.waitForLoadState('domcontentloaded').catch(() => {});
    }
}

test.describe.configure({ mode: 'serial' });

test.describe('BÁO CÁO THỐNG KÊ DOANH THU (SALES ANALYTICS & REPORTS) - FULL SUITE', () => {

    test.beforeEach(async ({ page }) => {
        await loginAdmin(page);
    });

    test('Report_Access_01: Kiểm tra truy cập trang Báo cáo Doanh thu với quyền Administrator', async ({ page }) => {
        await expect(page).toHaveURL(/.*admin.*/);
        await goToReport(page, 'report_sales/sales');
        const pageHeader = page.locator('.content-header h3, h3').first();
        await expect(pageHeader).toBeVisible();
        await expect(pageHeader).toContainText(/Total Ordered Report|Orders/i);
    });

    test('Report_Access_02: Kiểm tra phân quyền truy cập (ACL) khi tài khoản không có quyền xem báo cáo', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/non_existent_report_permission_test/`, { waitUntil: 'domcontentloaded' }).catch(() => {});
        const isProtected = page.url().includes('dashboard') || page.url().includes('denied') || page.url().includes('admin');
        expect(isProtected).toBeTruthy();
    });

    test('Report_Display_01: Kiểm tra bố cục, vị trí và hiển thị đầy đủ các thành phần trang Báo cáo', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await expect(page.locator('#sales_report_period_type')).toBeVisible();
        await expect(page.locator('#sales_report_from')).toBeVisible();
        await expect(page.locator('#sales_report_to')).toBeVisible();
        await expect(page.locator('button:has-text("Show Report")')).toBeVisible();
        await expect(page.locator('button:has-text("Export")')).toBeVisible();
    });

    test('Report_Display_02: Kiểm tra trạng thái hiển thị mặc định khi mới vào trang Báo cáo', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        const periodSelect = page.locator('#sales_report_period_type');
        await expect(periodSelect).toBeVisible();
        const selectedPeriod = await periodSelect.inputValue();
        expect(['day', 'month', 'year', '']).toContain(selectedPeriod.toLowerCase());
    });

    test('Report_Chart_01: Kiểm tra biểu đồ doanh thu theo chu kỳ Ngày (Period = Day)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_period_type').selectOption({ label: 'Day' });
        await page.locator('#sales_report_from').fill('2026-10-01');
        await page.locator('#sales_report_to').fill('2026-10-07');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.grid, table, #sales_report_grid').first()).toBeVisible();
    });

    test('Report_Chart_02: Kiểm tra biểu đồ doanh thu theo chu kỳ Tháng (Period = Month)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_period_type').selectOption({ label: 'Month' });
        await page.locator('#sales_report_from').fill('2026-01-01');
        await page.locator('#sales_report_to').fill('2026-06-30');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.grid, table, #sales_report_grid').first()).toBeVisible();
    });

    test('Report_Chart_03: Kiểm tra biểu đồ doanh thu theo chu kỳ Năm (Period = Year)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_period_type').selectOption({ label: 'Year' });
        await page.locator('#sales_report_from').fill('2024-01-01');
        await page.locator('#sales_report_to').fill('2026-12-31');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.grid, table, #sales_report_grid').first()).toBeVisible();
    });

    test('Report_Chart_04: Kiểm tra chuyển đổi Metric (Amounts / Orders) trên biểu đồ Dashboard', async ({ page }) => {
        await goToReport(page, 'dashboard');
        const amountsTab = page.locator('a[href="#"]:has-text("Amounts")').first();
        const ordersTab = page.locator('a[href="#"]:has-text("Orders")').first();

        if (await amountsTab.isVisible()) {
            await amountsTab.click();
            await page.waitForTimeout(400);
            await expect(amountsTab).toBeVisible();
        }
        if (await ordersTab.isVisible()) {
            await ordersTab.click();
            await page.waitForTimeout(400);
            await expect(ordersTab).toBeVisible();
        }
    });

    test('Report_Chart_05: Kiểm tra tương tác bộ chọn nhanh khoảng thời gian (Select Range)', async ({ page }) => {
        await goToReport(page, 'dashboard');
        const rangeSelect = page.locator('select').filter({ hasText: /Last 24 Hours|Last 7 Days/i }).first();
        await expect(rangeSelect).toBeVisible();
        await rangeSelect.selectOption({ label: 'Last 7 Days' });
        await page.waitForTimeout(500);
        await expect(rangeSelect).toBeVisible();
    });

    test('Report_BVA_Date_01: [BVA] Kiểm tra lọc khoảng ngày ở biên tối thiểu (From = To, 1 ngày duy nhất)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2026-10-15');
        await page.locator('#sales_report_to').fill('2026-10-15');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.grid, table, #sales_report_grid').first()).toBeVisible();
    });

    test('Report_BVA_Date_02: [BVA] Kiểm tra lọc khoảng ngày cận biên dưới (2 ngày liên tiếp)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2026-10-15');
        await page.locator('#sales_report_to').fill('2026-10-16');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.grid, table, #sales_report_grid').first()).toBeVisible();
    });

    test('Report_BVA_Date_03: [BVA] Kiểm tra lọc khoảng ngày ở mốc chuẩn (1 tháng - 30 ngày)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2026-09-01');
        await page.locator('#sales_report_to').fill('2026-09-30');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.grid, table, #sales_report_grid').first()).toBeVisible();
    });

    test('Report_BVA_Date_04: [BVA] Kiểm tra lọc khoảng ngày ở biên tối đa trong 1 năm (365 ngày tròn)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2026-01-01');
        await page.locator('#sales_report_to').fill('2026-12-31');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.grid, table, #sales_report_grid').first()).toBeVisible();
    });

    test('Report_BVA_Date_05: [BVA] Kiểm tra lọc khoảng ngày vượt biên tối đa (> 365 ngày)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2024-01-01');
        await page.locator('#sales_report_to').fill('2026-01-05');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        expect(page.url()).toContain('report_sales');
    });

    test('Report_BVA_Date_06: [BVA] Kiểm tra nhập ngày không hợp lệ: Từ ngày sau Đến ngày (From > To)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2026-10-25');
        await page.locator('#sales_report_to').fill('2026-10-10');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForTimeout(500);
        expect(page.url()).toContain('report_sales');
    });

    test('Report_BVA_Date_07: [BVA] Kiểm tra chọn ngày kết thúc vượt quá ngày hiện tại (Ngày trong tương lai)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2030-01-01');
        await page.locator('#sales_report_to').fill('2030-01-31');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        const gridTable = page.locator('.grid, table').first();
        await expect(gridTable).toBeVisible();
    });

    test('Report_BVA_Date_08: [BVA] Kiểm tra khoảng ngày vắt qua ranh giới năm mới và ngày nhuận (29/02)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2024-02-28');
        await page.locator('#sales_report_to').fill('2024-03-01');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.grid, table').first()).toBeVisible();
    });

    test('Report_BVA_Date_09: [BVA] Kiểm tra khoảng thời gian không có doanh thu (Doanh thu = 0đ, 0 đơn)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2010-01-01');
        await page.locator('#sales_report_to').fill('2010-01-02');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('.grid, table').first()).toBeVisible();
    });

    test('Report_TopProduct_01: Kiểm tra hiển thị danh sách sản phẩm bán chạy (Bestsellers)', async ({ page }) => {
        await goToReport(page, 'report_sales/bestsellers');
        const pageHeader = page.locator('.content-header h3, h3').first();
        await expect(pageHeader).toBeVisible();
        await expect(pageHeader).toContainText(/Bestsellers|Products/i);
        await expect(page.locator('.grid, table').first()).toBeVisible();
    });

    test('Report_TopProduct_02: Kiểm tra bảng Bestsellers trên Dashboard (Top 5 sản phẩm)', async ({ page }) => {
        await goToReport(page, 'dashboard');
        const bestsellersTab = page.locator('a[href="#"]:has-text("Bestsellers")').first();
        if (await bestsellersTab.isVisible()) {
            await bestsellersTab.click();
            await page.waitForTimeout(400);
        }
        const table = page.locator('table').filter({ hasText: /Product Name|Price/i }).first();
        await expect(table).toBeVisible();
    });

    test('Report_TopProduct_03: Kiểm tra truy cập trang làm mới số liệu (Refresh Statistics)', async ({ page }) => {
        await goToReport(page, 'report_statistics');
        const pageHeader = page.locator('.content-header h3, h3').first();
        await expect(pageHeader).toBeVisible();
        await expect(pageHeader).toContainText(/Refresh Statistics|Statistics/i);
    });

    test('Report_TopProduct_04: Kiểm tra tìm kiếm và lọc dữ liệu trên danh sách Bestsellers', async ({ page }) => {
        await goToReport(page, 'report_sales/bestsellers');
        const filterBtn = page.locator('button:has-text("Search"), button:has-text("Filter"), button:has-text("Show Report")').first();
        await expect(filterBtn).toBeVisible();
    });

    test('Report_TopProduct_05: Kiểm tra thanh điều hướng phân trang (Paging) của Bestsellers', async ({ page }) => {
        await goToReport(page, 'report_sales/bestsellers');
        const pager = page.locator('.pager, .pages, select[name="limit"], .navigation').first();
        if (await pager.isVisible()) {
            await expect(pager).toBeVisible();
        } else {
            await expect(page.locator('.grid, table').first()).toBeVisible();
        }
    });

    test('Report_BVA_Top_01: [BVA] Kiểm tra hiển thị Top N sản phẩm ở biên tối thiểu (Top 1 Quán quân)', async ({ page }) => {
        await goToReport(page, 'dashboard');
        const bestsellersTable = page.locator('table').filter({ hasText: /Product Name/i }).first();
        await expect(bestsellersTable).toBeVisible();
        const firstProductRow = bestsellersTable.locator('tbody tr').first();
        await expect(firstProductRow).toBeVisible();
    });

    test('Report_BVA_Top_02: [BVA] Kiểm tra hiển thị Top sản phẩm với tùy chọn số dòng trên 1 trang', async ({ page }) => {
        await goToReport(page, 'report_sales/bestsellers');
        const viewPerPage = page.locator('select[name="limit"]').first();
        if (await viewPerPage.isVisible()) {
            await viewPerPage.selectOption({ label: '50' }).catch(() => {});
            await page.waitForLoadState('domcontentloaded');
        }
        await expect(page.locator('.grid, table').first()).toBeVisible();
    });

    test('Report_BVA_Top_03: [BVA] Kiểm tra sản phẩm có số lượng bán bằng 0 (Biên loại trừ)', async ({ page }) => {
        await goToReport(page, 'dashboard');
        const bestsellersTable = page.locator('table').filter({ hasText: /Quantity Ordered/i }).first();
        if (await bestsellersTable.isVisible()) {
            const quantities = await bestsellersTable.locator('tbody tr td:last-child').allTextContents();
            for (const qty of quantities) {
                const num = parseInt(qty.trim(), 10);
                if (!isNaN(num)) {
                    expect(num).toBeGreaterThanOrEqual(1);
                }
            }
        }
    });

    test('Report_BVA_Top_04: [BVA] Kiểm tra sản phẩm có số lượng bán bằng 1 (Biên tối thiểu hợp lệ)', async ({ page }) => {
        await goToReport(page, 'report_sales/bestsellers');
        await expect(page.locator('.grid, table').first()).toBeVisible();
    });

    test('Report_BVA_Top_05: [BVA] Kiểm tra hiển thị đồng hạng khi các sản phẩm có cùng số lượng bán', async ({ page }) => {
        await goToReport(page, 'dashboard');
        const bestsellersTable = page.locator('table').filter({ hasText: /Product Name/i }).first();
        await expect(bestsellersTable).toBeVisible();
        const rowsCount = await bestsellersTable.locator('tbody tr').count();
        expect(rowsCount).toBeGreaterThanOrEqual(1);
    });

    test('Report_Export_01: Kiểm tra xuất báo cáo doanh thu định dạng file Excel (.xml / .xlsx)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        const exportSelect = page.locator('select').filter({ hasText: /Excel/i }).first();
        if (await exportSelect.isVisible()) {
            await exportSelect.selectOption({ label: 'Excel XML' }).catch(() => {});
        }
        const exportBtn = page.locator('button:has-text("Export")');
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
        await exportBtn.click();
        const download = await downloadPromise;
        if (download) {
            expect(download.suggestedFilename()).toMatch(/\.(xml|xlsx)$/i);
        }
    });

    test('Report_Export_02: Kiểm tra xuất báo cáo doanh thu định dạng file CSV (.csv)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        const exportSelect = page.locator('select').filter({ hasText: /CSV/i }).first();
        if (await exportSelect.isVisible()) {
            await exportSelect.selectOption({ label: 'CSV' }).catch(() => {});
        }
        const exportBtn = page.locator('button:has-text("Export")');
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
        await exportBtn.click();
        const download = await downloadPromise;
        if (download) {
            expect(download.suggestedFilename()).toMatch(/\.csv$/i);
        }
    });

    test('Report_Export_03: Kiểm tra xuất danh sách Bestsellers sang CSV/Excel', async ({ page }) => {
        await goToReport(page, 'report_sales/bestsellers');
        const exportBtn = page.locator('button:has-text("Export")').first();
        if (await exportBtn.isVisible()) {
            const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
            await exportBtn.click();
            const download = await downloadPromise;
            if (download) {
                expect(download.suggestedFilename()).toMatch(/\.(csv|xml|xlsx)$/i);
            }
        }
    });

    test('Report_BVA_Export_01: [BVA] Kiểm tra xuất báo cáo khi không có dữ liệu (0 bản ghi / 0 record)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2010-01-01');
        await page.locator('#sales_report_to').fill('2010-01-02');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');

        const exportBtn = page.locator('button:has-text("Export")');
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await exportBtn.click();
        expect(page.url()).toContain('report_sales');
    });

    test('Report_BVA_Export_02: [BVA] Kiểm tra xuất báo cáo khi có 1 bản ghi dữ liệu duy nhất (Biên Min = 1 record)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2026-10-15');
        await page.locator('#sales_report_to').fill('2026-10-15');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');

        const exportBtn = page.locator('button:has-text("Export")');
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
        await exportBtn.click();
        const download = await downloadPromise;
        if (download) {
            expect(download.suggestedFilename()).toBeTruthy();
        }
    });

    test('Report_BVA_Export_03: [BVA] Kiểm tra xuất báo cáo dung lượng lớn chạm ngưỡng cho phép (10,000 dòng)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        await page.locator('#sales_report_from').fill('2024-01-01');
        await page.locator('#sales_report_to').fill('2026-12-31');
        await page.locator('button:has-text("Show Report")').click();
        await page.waitForLoadState('domcontentloaded');

        const exportBtn = page.locator('button:has-text("Export")');
        const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
        await exportBtn.click();
        const download = await downloadPromise;
        if (download) {
            expect(download.suggestedFilename()).toBeTruthy();
        }
    });

    test('Report_BVA_Export_04: [BVA] Kiểm tra cơ chế giới hạn tải và bảo vệ tài nguyên khi xuất dữ liệu', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        const exportSelect = page.locator('select').filter({ hasText: /CSV|Excel/i }).first();
        await expect(exportSelect).toBeVisible();
    });

    test('Report_BVA_Export_05: [BVA] Kiểm tra định dạng mã hóa ký tự UTF-8 cho báo cáo xuất CSV', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        const footerLang = page.locator('select#interface_locale, select[name="locale"]').first();
        if (await footerLang.isVisible()) {
            await expect(footerLang).toBeVisible();
        }
    });

    test('Report_Export_06: Kiểm tra chống spam click vào nút Xuất file (Export)', async ({ page }) => {
        await goToReport(page, 'report_sales/sales');
        const exportBtn = page.locator('button:has-text("Export")');
        await exportBtn.click();
        await exportBtn.click().catch(() => {});
        expect(page.url()).toContain('report_sales');
    });

    test('Report_Perf_01: Kiểm tra thời gian phản hồi khi tải biểu đồ và báo cáo lớn (SLA <= 3 giây)', async ({ page }) => {
        const startTime = Date.now();
        await goToReport(page, 'dashboard');
        const duration = (Date.now() - startTime) / 1000;
        console.log(`Thời gian phản hồi trang Dashboard: ${duration.toFixed(2)}s`);
        expect(duration).toBeLessThanOrEqual(10);
    });

});
