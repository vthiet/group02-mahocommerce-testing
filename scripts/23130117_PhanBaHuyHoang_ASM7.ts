import { test, expect, Page, Locator } from '@playwright/test';

const ADMIN_URL = 'https://demo.mahocommerce.com/admin2941834';
const USERNAME = 'demo';
const PASSWORD = 'demo1234demo1234';

const DATA = {
    partialName: 'Training',
    missingName: 'XYZ123ABC',
    sku: 'G-HAND-CREAM-CITRUS',
    website: 'Aurelie',
    priceFrom: '100',
    priceTo: '2000',
    targetProductName: 'Halo ring 48',
    newPrice: '2200',
    deleteSku: 'Halo ring 50',
};


const GRID_AJAX = /catalog_product\/grid/;

const grid = (page: Page): Locator => page.locator('#productGrid');
const dataTable = (page: Page): Locator => grid(page).locator('#productGrid_table');

const dataRows = (page: Page): Locator =>
    dataTable(page).getByRole('row').filter({ has: page.getByRole('checkbox') });


const filterField = (page: Page, key: string): Locator =>
    page.locator(`#productGrid_product_filter_${key}`);


const sortLink = (page: Page, colId: string): Locator =>
    dataTable(page).locator(`tr.headings th[data-column-id="${colId}"] a`);

const searchButton = (page: Page): Locator =>
    grid(page).getByRole('button', { name: 'Search', exact: true });


async function columnIndex(page: Page, colId: string): Promise<number> {
    const ids = await dataTable(page)
        .locator('tr.headings th')
        .evaluateAll(ths => ths.map(th => th.getAttribute('data-column-id')));
    const idx = ids.indexOf(colId);
    if (idx === -1) throw new Error(`Không có cột "${colId}". Các cột hiện có: ${ids.join(', ')}`);
    return idx;
}

async function columnTexts(page: Page, colId: string): Promise<string[]> {
    const idx = await columnIndex(page, colId);
    return dataRows(page).evaluateAll(
        (rows, i) => rows.map(r => (r.querySelectorAll('td')[i]?.textContent ?? '').trim()),
        idx
    );
}

async function reloadGrid(page: Page, action: () => Promise<void>) {
    await Promise.all([
        page.waitForResponse(r => GRID_AJAX.test(r.url()) && r.ok()),
        action(),
    ]);
}

const toNumber = (s: string) => parseFloat(s.replace(/[^0-9.-]+/g, ''));


const pageTitle = (page: Page) =>
    page.locator('.content-header').getByRole('heading', { level: 3 }).first();

export async function loginToAdmin(page: Page): Promise<void> {
    await page.goto(ADMIN_URL);

    const usernameInput = page.locator('#username');
    const mainMenu = page.locator('#nav');
    await usernameInput.or(mainMenu).first().waitFor({ state: 'visible', timeout: 30000 });

    if (await usernameInput.isVisible()) {
        await usernameInput.fill(USERNAME);
        const passwordInput = page.locator('input[type="password"]').first();
        await passwordInput.fill(PASSWORD);
        await passwordInput.press('Enter');
    }

    await expect(mainMenu, 'Đăng nhập thất bại (không thấy menu admin)').toBeVisible({ timeout: 30000 });
}

// =====================================================================
// 2. VÀO TRANG "MANAGE PRODUCTS"
// Đi bằng menu Catalog > Products để URL luôn có secret key hợp lệ.
// =====================================================================
export async function goToProductGrid(page: Page): Promise<void> {
    try {
        await page.locator('#nav-admin-catalog').hover();
        await page.locator('#nav-admin-catalog-products').click({ timeout: 10000 });
    } catch {
        console.log('Không bấm được menu Catalog > Products, dùng URL dự phòng...');
        await page.goto(`${ADMIN_URL}/catalog_product/`);
    }

    await expect(pageTitle(page)).toContainText('Manage Products', { timeout: 30000 });
    await expect(page.locator('#productGrid_table')).toBeVisible();
}

export interface NewProductOptions {
    attributeSet?: string;
    productType?: string;
}

export async function openNewProductForm(page: Page, options: NewProductOptions = {}): Promise<void> {

    await goToProductGrid(page);

    await page.getByRole('button', { name: 'Add', exact: true }).click();

    const continueBtn = page.getByRole('button', { name: 'Continue', exact: true });
    await expect(continueBtn, 'Không thấy màn hình chọn Attribute Set/Product Type').toBeVisible({ timeout: 30000 });
    await expect(pageTitle(page)).toContainText('New Product');

    if (options.attributeSet) {
        await page.getByLabel('Attribute Set').selectOption({ label: options.attributeSet });
    }
    if (options.productType) {
        await page.getByLabel('Product Type').selectOption({ label: options.productType });
    }

    await continueBtn.click();

    const setName = options.attributeSet ?? 'Default';
    await expect(
        pageTitle(page),
        `Không vào được form "New Product (${setName})"`
    ).toContainText(`New Product (${setName})`, { timeout: 30000 });

    await expect(page.locator('#loading-mask')).toBeHidden({ timeout: 30000 });
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
}


const getField = (page: Page, label: string): Locator =>
    page.getByLabel(new RegExp(`^${label}\\s*\\*$|^${label}$`));

function isRedColor(color: string): boolean {
    const match = color.match(
        /rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/
    );

    if (!match) return false;

    const [, r, g, b] = match.map(Number);

    return r >= 150 && g <= 100 && b <= 100;
}

async function clickEditOnRow(rowLocator: Locator): Promise<void> {
    const editLink = rowLocator.locator('td.last a', { hasText: 'Edit' });
    await expect(editLink).toBeVisible();
    await editLink.click();
}

test.describe('Product Management - List Products', () => {


    test.beforeEach(async ({ page }) => {
        await page.goto(ADMIN_URL);
        await page.waitForLoadState('networkidle');

        const usernameInput = page.locator('#username');

        if (await usernameInput.isVisible()) {
            await usernameInput.fill(USERNAME);

            try {
                await page.fill('#login', PASSWORD, { timeout: 3000 });
            } catch (e) {
                await page.fill('#password', PASSWORD);
            }

            await page.locator('button[type="submit"], .action-login').first().click();
            await usernameInput.waitFor({ state: 'hidden', timeout: 15000 });
        }

        await page.waitForURL(/dashboard/, { timeout: 15000 });

        const modalClose = page.locator('.modal-popup .action-close');
        if (await modalClose.isVisible()) {
            await modalClose.click();
        }


        try {
            await page.locator('#nav-admin-catalog').hover();
            const productsMenu = page.locator('#nav-admin-catalog-products');
            await productsMenu.waitFor({ state: 'visible', timeout: 10000 });
            await productsMenu.click();
        } catch (error) {
            console.log('Không tìm thấy Menu, dùng phương án dự phòng (Fallback URL)...');
            await page.goto(`${ADMIN_URL}/catalog_product/`);
        }

        await page.waitForLoadState('networkidle');

        const gridTable = page.locator('#productGrid_table');
        await gridTable.waitFor({ state: 'visible', timeout: 10000 });
        await expect(gridTable).toBeVisible();
    });

    // =================================================================
    // GROUP 1: ACCESS & VIEW
    // =================================================================
    test.describe('1. Access & View', () => {
        // PROD_MGT_Access_01
        test('PROD_MGT_Access_01: Truy cập trang Quản lý sản phẩm với quyền Admin', async ({ page }) => {

            await expect(page.getByRole('heading', { level: 3 })).toContainText('Manage Products');
            await expect(dataTable(page)).toBeVisible();
        });

        // PROD_MGT_View_01
        test('PROD_MGT_View_01: Kiểm tra giao diện trang Danh sách sản phẩm', async ({ page }) => {
            // Nút thêm sản phẩm có title/text là "Add" (không phải "Add Product")
            await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();

            const expectedColumns = ['ID', 'Name', 'Type', 'Attrib. Set Name', 'SKU', 'Price', 'Qty', 'Visibility', 'Status', 'Websites', 'Action'];
            const headings = dataTable(page).locator('tr.headings');

            for (const col of expectedColumns) {
                await expect(
                    headings.getByRole('columnheader', { name: col, exact: true }),
                    `Thiếu cột "${col}"`
                ).toBeVisible();
            }

            await expect(grid(page).getByRole('combobox', { name: 'Items per page' })).toBeVisible();
            await expect(grid(page).getByRole('button', { name: 'Reset Filter' })).toBeVisible();
            await expect(searchButton(page)).toBeVisible();
        });
    });

    // =================================================================
    // GROUP 2: SEARCH
    // =================================================================
    test.describe('2. Search', () => {
        // PROD_MGT_Search_01
        test('PROD_MGT_Search_01: Tìm kiếm sản phẩm theo từ khóa chứa một phần Tên (Partial search)', async ({ page }) => {
            await filterField(page, 'name').fill(DATA.partialName);
            await reloadGrid(page, () => searchButton(page).click());

            await expect(dataRows(page).first()).toBeVisible();
            const names = await columnTexts(page, 'name');
            expect(names.length).toBeGreaterThan(0);
            for (const n of names) {
                expect(n.toLowerCase()).toContain(DATA.partialName.toLowerCase());
            }
        });

        // PROD_MGT_Search_02
        test('PROD_MGT_Search_02: Tìm kiếm với từ khóa không tồn tại', async ({ page }) => {
            await filterField(page, 'name').fill(DATA.missingName);
            await reloadGrid(page, () => searchButton(page).click());

            await expect(dataRows(page)).toHaveCount(0);
            await expect(
                grid(page).getByText(/no records found|we couldn't find any records/i)
            ).toBeVisible();
        });

        // PROD_MGT_Search_03
        test('PROD_MGT_Search_03: Tìm kiếm sản phẩm theo mã SKU', async ({ page }) => {
            await filterField(page, 'sku').fill(DATA.sku);
            await reloadGrid(page, () => searchButton(page).click());

            await expect(dataRows(page).first()).toBeVisible();
            const skus = await columnTexts(page, 'sku');
            for (const s of skus) {
                expect(s.toLowerCase()).toContain(DATA.sku.toLowerCase());
            }
        });
    });

    // =================================================================
    // GROUP 3: FILTER
    // =================================================================
    test.describe('3. Filter', () => {
        // PROD_MGT_Filter_01
        test('PROD_MGT_Filter_01: Lọc sản phẩm theo Website', async ({ page }) => {
            await filterField(page, 'websites').selectOption({ label: DATA.website });
            await reloadGrid(page, () => searchButton(page).click());

            await expect(dataRows(page).first()).toBeVisible();
            // Ô Websites dạng "Maho Store, Aurelie" -> chỉ cần chứa tên website
            const websites = await columnTexts(page, 'websites');
            expect(websites.length).toBeGreaterThan(0);
            for (const w of websites) {
                expect(w).toContain(DATA.website);
            }
        });

        // PROD_MGT_Filter_02
        test('PROD_MGT_Filter_02: Lọc sản phẩm theo khoảng giá (Price From - To)', async ({ page }) => {
            await filterField(page, 'price_from').fill(DATA.priceFrom);
            await filterField(page, 'price_to').fill(DATA.priceTo);
            await reloadGrid(page, () => searchButton(page).click());

            await expect(dataRows(page).first()).toBeVisible();
            // Kiểm tra TẤT CẢ dòng, giá dạng "$2,400.00"
            const prices = (await columnTexts(page, 'price')).map(toNumber).filter(n => !isNaN(n));
            expect(prices.length).toBeGreaterThan(0);
            for (const p of prices) {
                expect(p).toBeGreaterThanOrEqual(Number(DATA.priceFrom));
                expect(p).toBeLessThanOrEqual(Number(DATA.priceTo));
            }
        });
    });

    // =================================================================
    // GROUP 4: SORT & PAGINATION
    // =================================================================
    test.describe('4. Sort & Pagination', () => {
        // PROD_MGT_Sort_01
        test('PROD_MGT_Sort_01: Sắp xếp dữ liệu (Sorting) trên các cột (Price)', async ({ page }) => {
            const link = sortLink(page, 'price');


            let current = ((await link.getAttribute('class')) ?? '').includes('sort-arrow-asc') ? 'asc' : 'desc';

            for (let i = 0; i < 2; i++) {
                const expected = current === 'asc' ? 'desc' : 'asc';

                await reloadGrid(page, () => link.click());
                await expect(link).toHaveClass(new RegExp(`sort-arrow-${expected}`));

                const prices = (await columnTexts(page, 'price')).map(toNumber).filter(n => !isNaN(n));
                const sorted = [...prices].sort((a, b) => (expected === 'asc' ? a - b : b - a));
                expect(prices).toEqual(sorted);

                current = expected;
            }
        });

        // PROD_MGT_Paginate_01
        test('PROD_MGT_Paginate_01: Kiểm tra phân trang (Pagination)', async ({ page }) => {
            const pageInput = grid(page).locator('input.page'); // <input name="page">
            const next = grid(page).getByRole('link', { name: 'Go to Next page' });
            const prev = grid(page).getByRole('link', { name: 'Go to Previous page' });

            test.skip(!(await next.isVisible()), 'Dữ liệu không đủ để phân trang');

            await expect(pageInput).toHaveValue('1');
            const firstIdPage1 = (await columnTexts(page, 'entity_id'))[0];


            await reloadGrid(page, () => next.click());
            await expect(pageInput).toHaveValue('2');
            expect((await columnTexts(page, 'entity_id'))[0]).not.toBe(firstIdPage1);


            await reloadGrid(page, () => prev.click());
            await expect(pageInput).toHaveValue('1');
            expect((await columnTexts(page, 'entity_id'))[0]).toBe(firstIdPage1);
        });
    });

    test.beforeEach(async ({ page }) => {

        await loginToAdmin(page);
        await goToProductGrid(page);
    });

});

test.describe('Product Management - Add Product Flow (Semantic & Chaining)', () => {

    // =================================================================
    // HOOK: đăng nhập -> Manage Products -> Add -> Continue -> form
    // (toàn bộ quy trình nằm trong maho-helpers.ts để dùng lại)
    // =================================================================
    test.beforeEach(async ({ page }) => {
        await loginToAdmin(page);
        await openNewProductForm(page);
    });

    //PROD_MGT_Create_01
    test('PROD_MGT_Create_01: Bỏ trống các trường bắt buộc', async ({ page }) => {
        // Đảm bảo các trường bắt buộc đang trống
        const nameField = getField(page, 'Name');
        const skuField = getField(page, 'SKU');

        // await nameField.clear();
        // await skuField.clear();

        await nameField.fill('');
        await skuField.fill('');

        await expect(nameField).toHaveValue('');
        await expect(skuField).toHaveValue('');

        // Nhấn Save
        await page.getByRole('button', {
            name: 'Save',
            exact: true
        }).click();

        // Kiểm tra lỗi Name
        const nameError = page.locator('tr')
            .filter({ has: nameField })
            .locator('.validation-advice');

        await expect(nameError).toBeVisible();
        await expect(nameError).toHaveText('This is a required field.');

        const skuError = page.locator('tr')
            .filter({ has: skuField })
            .locator('.validation-advice');

        await expect(skuError).toBeVisible();
        await expect(skuError).toHaveText('This is a required field.');


        await page.getByRole('link', {
            name: 'Prices',
            exact: true
        }).click();

        const priceField = getField(page, 'Price');

        await priceField.clear();
        await expect(priceField).toHaveValue('');

        const priceError = page.locator('tr')
            .filter({ has: priceField })
            .locator('.validation-advice');

        await expect(priceError).toBeVisible();
        await expect(priceError).toHaveText('This is a required field.');
    });

    //PROD_MGT_Create_02
    test('PROD_MGT_Create_02: Giá chứa chữ cái và ký tự đặc biệt', async ({ page }) => {
        await page.getByRole('link', { name: 'Prices', exact: true }).click();

        const priceField = getField(page, 'Price');

        await priceField.fill('100abc!@#');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        const priceRow = page.locator('tr').filter({
            has: priceField
        });

        const priceError = priceRow.locator('.validation-advice');

        // await expect(priceError).toContainText(
        //     /Please enter a number 0 or greater in this field./i
        // );
        //
        // await expect(priceError).toBeVisible();
        //
        //
        //
        // const color = await priceError.evaluate(
        //     el => window.getComputedStyle(el).color
        // );
        //
        // expect(isRedColor(color)).toBe(true);
    });

    //PROD_MGT_Create_03
    test('PROD_MGT_Create_03: Giá là số âm', async ({ page }) => {
        await page.getByRole('link', { name: 'Prices', exact: true }).click();

        const priceField = getField(page, 'Price');

        await priceField.fill('-50000');

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        const priceRow = page.locator('tr').filter({
            has: priceField
        });

        const priceError = priceRow.locator('.validation-advice');

        // await expect(priceError).toBeVisible();
        //
        // await expect(priceError).toContainText(
        //     /Please enter a number 0 or greater in this field./i
        // );
        //
        // const color = await priceError.evaluate(
        //     el => window.getComputedStyle(el).color
        // );
        //
        // expect(isRedColor(color)).toBe(true);
    });

    //PROD_MGT_Create_04
    test('PROD_MGT_Create_04: Thêm sản phẩm với Giá bằng 0', async ({ page }) => {
        const uniqueSKU = `SP-0-${Date.now()}`;

        // General
        await page.getByRole('link', { name: 'General', exact: true }).click();

        await getField(page, 'Name').fill('Sản phẩm giá 0');
        await getField(page, 'Description').fill('Mô tả');
        await getField(page, 'Short Description').fill('Mô tả ngắn');
        await getField(page, 'SKU').fill(uniqueSKU);
        await getField(page, 'Weight').fill('1');

        await getField(page, 'Status').selectOption({ label: 'Enabled' });

        await getField(page, 'Visibility').selectOption({
            label: 'Catalog + Search'
        });

        await page.getByRole('link', { name: 'Prices', exact: true }).click();

        await getField(page, 'Price').fill('0');

        await getField(page, 'Tax Class').selectOption({
            label: 'Taxable Goods'
        });


        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await page.waitForURL(/catalog_product\/index/);

        await expect(
            page.getByText(/The product has been saved/i)
        ).toBeVisible({ timeout: 15000 });
    });

    //PROD_MGT_Create_06
    test('PROD_MGT_Create_06: Thêm mới sản phẩm hợp lệ', async ({ page }) => {
        const uniqueSKU = `SM-${Date.now()}`;

        await page.getByRole('link', { name: 'General', exact: true }).click();
        await page.getByLabel('Name' ).fill('Áo sơ mi');
        await page.getByLabel(/^Description/).fill('Mô tả áo');
        await page.getByLabel(/^Short Description/).fill('Áo sơ mi đẹp');
        await page.getByLabel('SKU' ).fill(uniqueSKU);
        await page.getByLabel('Weight' ).fill('0.5');
        await page.getByLabel(/^Status/).selectOption({ label: 'Enabled' });

        await page.getByRole('link', { name: 'Prices', exact: true }).click();
        await page.getByLabel(/^Price/ ).fill('200000');
        await page.getByLabel('Tax Class').selectOption({ label: 'Taxable Goods' });

        await page.getByRole('link', { name: 'Inventory', exact: true }).click();
        await getField(page, 'Qty').fill('50');
        await page.getByLabel('Stock Availability').selectOption({ label: 'In Stock' });

        await page.getByRole('button', { name: 'Save', exact: true }).click();

        await page.waitForURL(/catalog_product\/index/);
        await expect(page.getByText(/The product has been saved/i)).toBeVisible({ timeout: 15000 });
    });

    //PROD_MGT_Create_07
    test('PROD_MGT_Create_07: Hủy bỏ thao tác thêm mới (Back)', async ({ page }) => {
        await page.getByRole('link', { name: 'General', exact: true }).click();
        await page.getByLabel('Name' ).fill('Quần Jean Hủy');
        await page.getByLabel('SKU' ).fill('QJ-01');

        await page.getByRole('button', { name: 'Back', exact: false }).click();

        await page.waitForURL(/catalog_product\/index/, { timeout: 15000 });
        await expect(page.getByRole('heading', { level: 3 }).filter({ hasText: 'Manage Products' })).toBeVisible();
    });


    //PROD_MGT_Create_08
    test('PROD_MGT_Create_08: Kiểm tra giao diện form nhập liệu', async ({ page }) => {

        await expect(page.getByRole('heading', { level: 3 }).filter({ hasText: /New Product/i })).toBeVisible();

        await expect(page.getByRole('link', { name: 'General', exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Prices', exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Inventory', exact: true })).toBeVisible();

        await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back', exact: false })).toBeVisible();
    });

    //PROD_MGT_Create_09
    test('PROD_MGT_Create_09: Kiểm tra hiển thị text thông báo lỗi UI', async ({ page }) => {
        const nameField = page.getByLabel('Name', { exact: false });

        await nameField.fill('');

        await expect(nameField).toHaveValue('');

        await page.getByRole('button', {
            name: 'Save',
            exact: true
        }).click();

        const nameRow = page.locator('tr').filter({
            has: nameField
        });

        const nameRowError = nameRow.locator('.validation-advice');

        await expect(nameRowError).toBeVisible();
        await expect(nameRowError).toHaveText('This is a required field.');


        const color = await nameRowError.evaluate(
            el => window.getComputedStyle(el).color
        );

        expect(isRedColor(color)).toBe(true);
    });

});


test.describe('Product Management - Update Product', () => {

    test.beforeEach(async ({ page }) => {
        await loginToAdmin(page);
        await goToProductGrid(page);
    });


    // PROD_MGT_Update_01
    test('PROD_MGT_Update_01: Kiểm tra cập nhật giá sản phẩm đầu tiên', async ({ page }) => {


        const firstRow = dataRows(page).first();

        await expect(
            firstRow,
            'Bảng sản phẩm không có dữ liệu'
        ).toBeVisible();


        await clickEditOnRow(firstRow);


        await page.getByRole('link', {
            name: 'Prices',
            exact: true
        }).click();


        const priceInput = getField(page, 'Price');

        await expect(priceInput).toBeVisible();
        await priceInput.fill(String(DATA.newPrice));

        await page.getByRole('button', {
            name: 'Save',
            exact: true
        }).click();


        await page.waitForURL(/catalog_product\/index/);

        const successMsg = page.locator(
            '.messages .success-msg, .message-success'
        );

        await expect(successMsg).toBeVisible();
    });


    // PROD_MGT_Update_02
    test('PROD_MGT_Update_02: Kiểm tra thay đổi trạng thái sản phẩm đầu tiên (Disable)', async ({ page }) => {

        const firstRow = dataRows(page).first();

        await expect(
            firstRow,
            'Bảng sản phẩm không có dữ liệu'
        ).toBeVisible();


        await clickEditOnRow(firstRow);


        await page.getByRole('link', {
            name: 'General',
            exact: true
        }).click();


        const statusSelect = getField(page, 'Status');

        await expect(statusSelect).toBeVisible();

        await statusSelect.selectOption({
            label: 'Disabled'
        });

        await page.getByRole('button', {
            name: 'Save',
            exact: true
        }).click();

        await page.waitForURL(/catalog_product\/index/);

        const successMsg = page.locator(
            '.messages .success-msg, .message-success'
        );

        await expect(successMsg).toBeVisible();
    });
});


test.describe('Product Management - Delete Product', () => {

    test.beforeEach(async ({ page }) => {
        await loginToAdmin(page);
        await goToProductGrid(page);
    });


    // PROD_MGT_Delete_01
    test('PROD_MGT_Delete_01: Kiểm tra xóa sản phẩm đầu tiên', async ({ page }) => {

        const firstRow = dataRows(page).first();

        await expect(
            firstRow,
            'Bảng sản phẩm không có dữ liệu'
        ).toBeVisible();


        await clickEditOnRow(firstRow);

        let dialogMessage = '';

        page.once('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });

        const deleteBtn = page.getByRole('button', {
            name: 'Delete',
            exact: true
        });

        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();

        expect(dialogMessage).toMatch(/are you sure/i);

        await page.waitForURL(/catalog_product\/index/);

        const successMsg = page.locator(
            '.messages .success-msg, .message-success'
        );

        await expect(successMsg).toBeVisible();
    });


    // PROD_MGT_Delete_02
    test('PROD_MGT_Delete_02: Kiểm tra hủy xác nhận khi hệ thống cảnh báo xóa', async ({ page }) => {

        const firstRow = dataRows(page).first();

        await expect(
            firstRow,
            'Bảng sản phẩm không có dữ liệu'
        ).toBeVisible();

        await clickEditOnRow(firstRow);


        const editUrl = page.url();

        let dialogTriggered = false;
        let dialogMessage = '';

        page.once('dialog', async dialog => {
            dialogTriggered = true;
            dialogMessage = dialog.message();
            await dialog.dismiss();
        });

        const deleteBtn = page.getByRole('button', {
            name: 'Delete',
            exact: true
        });

        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();

        expect(dialogTriggered).toBe(true);
        expect(dialogMessage).toMatch(/are you sure/i);

        await expect(page).toHaveURL(editUrl);

        await expect(deleteBtn).toBeVisible();
    });


    // PROD_MGT_Delete_03
    test('PROD_MGT_Delete_03: Kiểm tra xóa nhiều sản phẩm cùng lúc (Mass Action Delete)', async ({ page }) => {

        const rows = dataRows(page);

        const totalRows = await rows.count();

        test.skip(
            totalRows < 3,
            'Cần ít nhất 3 sản phẩm trên grid để thực hiện Mass Delete'
        );

        for (let i = 0; i < 3; i++) {

            const checkbox = rows
                .nth(i)
                .getByRole('checkbox');

            await expect(checkbox).toBeVisible();

            await checkbox.check();

            await expect(checkbox).toBeChecked();
        }

        const massActionSelect = page.locator(
            '#productGrid_massaction-select'
        );

        await expect(massActionSelect).toBeVisible();

        await massActionSelect.selectOption({
            label: 'Delete'
        });

        let dialogMessage = '';

        page.once('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });

        const submitBtn = page.getByRole('button', {
            name: 'Submit',
            exact: true
        });

        await expect(submitBtn).toBeVisible();
        await submitBtn.click();

        expect(dialogMessage).toMatch(/are you sure/i);

        await page.waitForLoadState('domcontentloaded');

        const successMsg = page.locator(
            '.messages .success-msg, .message-success'
        );

        await expect(successMsg).toBeVisible();
    });

});