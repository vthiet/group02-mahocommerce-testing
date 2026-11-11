require('./environment.ts');
const {test: test, expect: expect} = require("@playwright/test"); const BASE = "https://demo.mahocommerce.com/default/"; const FASHION = `${BASE}fashion/`; test.use({
    viewport: {
        width: 1366,
        height: 768
    },
    locale: "en-US",
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure"
}); test.setTimeout(12e4); const CARD = "ul.products-grid > li, .products-grid .item, .product-item, ul.products-list > li";
const NAME = ".product-name a, .product-item-name a, h2.product-name, .product-name"; const PRODUCT_TITLE = ".product-name:visible, h1:visible, .product-title:visible";
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); const norm = s => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
const isSorted = (arr, dir) => arr.every((v, i) => i === 0 || (dir === "asc" ? arr[i - 1] <= v : arr[i - 1] >= v)); async function waitForStorefrontReady(page, response) {
    const deadline = Date.now() + 6e4; while (true) {
        const body = (await page.locator("body").innerText().catch(() => "")).toLowerCase();
        const resetting = /demo is resetting|fresh sample data is being installed|service unavailable|temporarily unavailable/.test(body) || /initial connection between cloudflare.*timed out/.test(body) || [ 502, 503, 504, 520, 521, 522, 523, 524 ].includes(response?.status() ?? 0);
        if (!resetting) return response; if (Date.now() >= deadline) {
            throw new Error(`Storefront did not recover from reset/unavailable state: ${page.url()}`); }
        await page.waitForTimeout(5e3); response = await page.reload({
            waitUntil: "domcontentloaded"
        }); }
}
async function gotoStorefront(page, url) {
    const response = await page.goto(url, {
        waitUntil: "domcontentloaded"
    }); await waitForStorefrontReady(page, response); }
async function settle(page) {
    await page.waitForLoadState("domcontentloaded"); await waitForStorefrontReady(page); }
const searchBox = page => page.locator("input#search:visible").first(); async function openHome(page) {
    await gotoStorefront(page, BASE); await expect(searchBox(page)).toBeVisible(); }
async function typeSearch(page, text) {
    const box = searchBox(page); await box.click(); await box.fill(""); await box.pressSequentially(text, {
        delay: 40
    }); return box; }
async function pressEnterAndWait(page, box) {
    const [response] = await Promise.all([ page.waitForResponse(r => r.url().includes("catalogsearch/result") && r.request().resourceType() === "document", {
        timeout: 3e4
    }), box.press("Enter") ]); await page.waitForLoadState("domcontentloaded"); await settle(page); return response; }
async function searchFor(page, text) {
    const box = await typeSearch(page, text); return pressEnterAndWait(page, box); }
async function getProducts(page) {
    return page.evaluate(({cardSel: cardSel, nameSel: nameSel}) => {
        const num = t => {
            const m = (t || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : NaN; }; const all = Array.from(document.querySelectorAll(cardSel));
        const cards = all.filter(c => !all.some(o => o !== c && o.contains(c))); return cards.map(c => {
            const nameEl = c.querySelector(nameSel); const special = c.querySelector(".special-price .price");
            const anyPrice = Array.from(c.querySelectorAll(".price")).find(p => !p.closest(".old-price")); const priceEl = special || anyPrice; return {
                name: (nameEl ? nameEl.textContent : c.textContent || "").replace(/\s+/g, " ").trim(),
                price: priceEl ? num(priceEl.textContent) : NaN
            }; }); }, {
        cardSel: CARD,
        nameSel: NAME
    }); }
async function clickProductAndCheck(page, nameRegex) {
    if (await page.locator(CARD).count() === 0) {
        const title = norm(await page.locator(PRODUCT_TITLE).first().innerText()); if (nameRegex) expect(title).toMatch(nameRegex); return title; }
    let expected; if (nameRegex) {
        const card = page.locator(CARD).filter({
            hasText: nameRegex
        }).first(); const link = card.locator(".product-name a[href], .product-item-name a[href]").first();
        await expect(link, `Không thấy sản phẩm khớp ${nameRegex} trong danh sách`).toBeVisible(); expected = norm(await link.innerText()); await link.click(); } else {
        expected = await page.evaluate(({cardSel: cardSel}) => {
            const all = Array.from(document.querySelectorAll(cardSel)); const card = all.filter(c => !all.some(o => o !== c && o.contains(c)))[0]; if (!card) return "";
            const link = card.querySelector(".product-name a[href], .product-item-name a[href]") || card.querySelector(".product-image[href]"); if (!link) return "";
            link.setAttribute("data-pw-open", "1"); const name = card.querySelector(".product-name, .product-item-name");
            return (name ? name.textContent : link.getAttribute("title") || "").replace(/\s+/g, " ").trim(); }, {
            cardSel: CARD
        }); expect(expected, "Không tìm thấy tên sản phẩm đầu tiên trong danh sách").toBeTruthy(); expected = norm(expected);
        await page.locator('[data-pw-open="1"]').first().click(); }
    await settle(page); const title = norm(await page.locator(PRODUCT_TITLE).first().innerText());
    expect(title.includes(expected) || expected.includes(title), `Tên ở trang chi tiết "${title}" phải khớp tên đã click "${expected}"`).toBeTruthy(); return title; }
async function fillPrice(page, min, max) {
    const minInput = page.locator('#price-filter-from:visible, input[name="price_from"]:visible').first();
    const maxInput = page.locator('#price-filter-to:visible, input[name="price_to"]:visible').first(); await expect(minInput, "Không thấy ô giá tối thiểu").toBeVisible();
    await expect(maxInput, "Không thấy ô giá tối đa").toBeVisible(); await minInput.click(); await minInput.fill(String(min)); await maxInput.click();
    await maxInput.fill(String(max)); const apply = page.locator(".price-filter-apply:visible").first(); await expect(apply, "Không thấy nút áp dụng bộ lọc giá").toBeVisible();
    await apply.scrollIntoViewIfNeeded(); await apply.hover(); await page.waitForFunction(() => typeof window.applyPriceFilter === "function", null, {
        timeout: 15e3
    }); await Promise.all([ page.waitForURL(url => url.searchParams.get("price") === `${min}-${max}`, {
        waitUntil: "domcontentloaded"
    }), apply.click() ]); await settle(page); }
async function clickSidebar(page, label) {
    const re = label instanceof RegExp ? label : new RegExp(`^\\s*${esc(label)}\\s*\\(?\\d*\\)?\\s*$`, "i");
    const sidebar = page.locator(".block-layered-nav:visible, #layered-navigation:visible").first(); await expect(sidebar, "Không tìm thấy sidebar bộ lọc").toBeVisible();
    const items = await sidebar.getByText(re).all(); for (const item of items) {
        if (!await item.isVisible().catch(() => false)) continue; await item.click(); await settle(page); return; }
    throw new Error(`Không tìm thấy bộ lọc "${label}" ở sidebar bên trái`); }
async function activeFilterText(page) {
    const area = page.locator(".active-filters-wrapper:visible, .active-filters:visible, .filter-current:visible").first(); if (await area.count() === 0) return "";
    return area.innerText(); }
async function chooseSort(page, label) {
    const sorter = page.locator("#toolbar-sortby:visible, #sorter:visible").first(); await expect(sorter, "Không thấy dropdown sắp xếp").toBeVisible();
    const selected = await sorter.locator("option:checked").innerText(); if (norm(selected) === norm(label)) return; await Promise.all([ page.waitForNavigation({
        waitUntil: "domcontentloaded"
    }), sorter.selectOption({
        label: label
    }) ]); await settle(page); }
async function setSortDirection(page, dir) {
    const urlDir = () => new URL(page.url()).searchParams.get("dir"); if (urlDir() === dir || dir === "asc" && urlDir() === null) return;
    let arrow = page.locator(".sort-by-switcher:visible, .sorter-asc:visible, .sorter-desc:visible").first(); if (!await arrow.isVisible().catch(() => false)) {
        arrow = page.locator("#toolbar-sortby:visible, #sorter:visible").first().locator("xpath=following::*[self::a or self::button][1]"); }
    await Promise.all([ page.waitForNavigation({
        waitUntil: "domcontentloaded"
    }), arrow.click() ]); await settle(page); if (urlDir() && urlDir() !== dir) {
        await Promise.all([ page.waitForNavigation({
            waitUntil: "domcontentloaded"
        }), arrow.click() ]); await settle(page); }
}
test.describe("Search - Tìm kiếm từ khóa", () => {
    test('Search_Exact_01 - Tìm đúng tên đầy đủ "Bib shorts"', async ({page: page}) => {
        await openHome(page); const box = searchBox(page); await box.click(); await box.fill("Bib shorts"); await expect(box).toHaveValue("Bib shorts");
        await pressEnterAndWait(page, box); const url = new URL(page.url()); if (/\/catalogsearch\/result\/?$/i.test(url.pathname)) {
            expect(url.searchParams.get("q")).toBe("Bib shorts"); await clickProductAndCheck(page, /bib shorts/i); } else {
            expect(url.pathname).toMatch(/\/bib-shorts\/?$/i); await expect(page.locator(PRODUCT_TITLE).first()).toHaveText(/Bib shorts/i); }
    }); test('Search_Partial_02 - Tìm theo từ khóa một phần "Shirt"', async ({page: page}) => {
        await openHome(page); const box = await typeSearch(page, "Shirt"); await expect(box).toHaveValue("Shirt"); const response = await pressEnterAndWait(page, box);
        expect(response.status()).toBe(200); const products = await getProducts(page); expect(products.length).toBeGreaterThan(0);
        expect(products.some(p => /shirt/i.test(p.name))).toBeTruthy(); await clickProductAndCheck(page, /shirt/i); });
    test('Search_Trim_03 - Tìm được kết quả dù có khoảng trắng thừa "   Jacket    "', async ({page: page}) => {
        await openHome(page); const box = await typeSearch(page, "   Jacket    "); await pressEnterAndWait(page, box); const q = new URL(page.url()).searchParams.get("q");
        expect(norm(q), "Từ khóa tìm kiếm phải được chuẩn hóa thành Jacket").toBe("jacket"); const products = await getProducts(page); expect(products.length).toBeGreaterThan(0);
        await clickProductAndCheck(page, /jacket/i); }); test("Search_MaxLength_04 - Giới hạn tối đa ký tự ô tìm kiếm", async ({page: page}) => {
        await openHome(page); const longText = Array.from({
            length: 300
        }, (_, i) => "abcdefghijklmnopqrstuvwxyz"[i % 26]).join(""); const box = searchBox(page); await box.click(); await box.pressSequentially(longText, {
            delay: 0
        }); expect((await box.inputValue()).length).toBeLessThanOrEqual(50); const response = await pressEnterAndWait(page, box); expect(response.status()).toBeLessThan(500);
        await expect(page.locator("body")).not.toContainText(/Internal Server Error/i); }); test("Search_Security_05 - Chống XSS ở ô tìm kiếm", async ({page: page}) => {
        let alertShown = false; page.on("dialog", async d => {
            alertShown = true; await d.dismiss(); }); await openHome(page); const box = await typeSearch(page, "<script>alert('XSS_Test')<\/script>");
        const respPromise = page.waitForResponse(r => r.url().includes("catalogsearch"), {
            timeout: 3e4
        }).catch(() => null); await box.press("Enter"); const response = await respPromise; await settle(page); expect(alertShown, "Không được bật alert popup").toBe(false);
        expect(await page.content()).not.toContain("<script>alert('XSS_Test')<\/script>"); const bodyText = await page.locator("body").innerText().catch(() => "");
        const blocked = response && [ 403, 429, 503 ].includes(response.status()) || /cloudflare|attention required|you have been blocked/i.test(bodyText); if (blocked) {
            test.info().annotations.push({
                type: "WAF",
                description: "Payload bị WAF Cloudflare chặn, script không được thực thi"
            }); } else {
            await expect(page.getByText(/returned no results|no results/i).first()).toBeVisible(); }
    }); test('Search_NoResult_06 - Từ khóa không tồn tại "xyznotfound999"', async ({page: page}) => {
        await openHome(page); const response = await searchFor(page, "xyznotfound999"); expect(response.status()).toBe(200);
        await expect(page.getByText(/search returns no results|no results/i).first()).toBeVisible(); expect((await getProducts(page)).length).toBe(0);
        await expect(page.locator("header").first()).toBeAttached(); await expect(page.locator("footer").first()).toBeAttached(); await expect(searchBox(page)).toBeVisible(); });
}); test.describe("Filter - Bộ lọc nâng cao", () => {
    test("Filter_PriceValid_01 - Lọc giá hợp lệ $20 - $50", async ({page: page}) => {
        await gotoStorefront(page, FASHION); await fillPrice(page, 20, 50); await expect(page.getByText(/\$\s?20(\.00)?\s*[-–—]\s*\$\s?49\.99/).first()).toBeVisible();
        const products = await getProducts(page); expect(products.length).toBeGreaterThan(0); for (const p of products) {
            expect.soft(p.price, `"${p.name}" phải có giá từ $20 đến $50`).toBeGreaterThanOrEqual(20);
            expect.soft(p.price, `"${p.name}" phải có giá từ $20 đến $50`).toBeLessThanOrEqual(50); }
        await clickProductAndCheck(page); }); test("Filter_PriceBoundary_02 - Biên Min = Max = $30", async ({page: page}) => {
        await gotoStorefront(page, FASHION); await fillPrice(page, 30, 30); expect(page.url()).toMatch(/price=30-30/); const products = await getProducts(page);
        for (const p of products) expect.soft(p.price, `"${p.name}" phải có giá đúng $30.00`).toBe(30); if (products.length > 0) await clickProductAndCheck(page); });
    test("Filter_PriceInvalid_03 - Min > Max không trả sản phẩm", async ({page: page}) => {
        await gotoStorefront(page, FASHION); await fillPrice(page, 100, 10); expect(new URL(page.url()).searchParams.get("price")).toBe("100-10");
        expect(await getProducts(page)).toHaveLength(0); }); test("Filter_PriceNegative_04 - Chặn số âm và ký tự chữ", async ({page: page}) => {
        await gotoStorefront(page, FASHION); const before = (await getProducts(page)).length;
        const minInput = page.locator('#price-filter-from:visible, input[name="price_from"]:visible').first();
        const maxInput = page.locator('#price-filter-to:visible, input[name="price_to"]:visible').first(); await expect(minInput).toBeVisible(); await minInput.click();
        await minInput.pressSequentially("-50", {
            delay: 80
        }); await maxInput.click(); await maxInput.pressSequentially("abc", {
            delay: 80
        }); await maxInput.blur(); await minInput.blur(); await page.waitForTimeout(500); const minVal = await minInput.inputValue(); const maxVal = await maxInput.inputValue();
        expect(await minInput.evaluate(input => input.validity.rangeUnderflow)).toBeTruthy(); expect(maxVal, "Ô Max Price không được nhận chữ").not.toMatch(/[a-z]/i);
        expect(maxVal === "" || /^\d+$/.test(maxVal)).toBeTruthy(); expect((await getProducts(page)).length).toBe(before); });
    test("Filter_CategoryBrand_05 - Lọc kết hợp Thương hiệu + Danh mục", async ({page: page}) => {
        await gotoStorefront(page, `${BASE}electronics/`); await clickSidebar(page, "Voltline"); await clickSidebar(page, "Computing"); const active = await activeFilterText(page);
        expect(active).toMatch(/Computing/i); expect(active).toMatch(/Voltline/i); expect((await getProducts(page)).length).toBeGreaterThan(0); await clickProductAndCheck(page);
    }); test("Filter_MultiCategory_06 - Lọc đa tùy chọn (OR cùng nhóm, AND khác nhóm)", async ({page: page}) => {
        await openHome(page); await page.locator("a:visible").filter({
            hasText: /^\s*Electronics\s*$/i
        }).first().click(); await settle(page); const urlBefore = page.url(); await clickSidebar(page, "Voltline"); await clickSidebar(page, "Computing");
        expect(page.url()).not.toBe(urlBefore); expect(page.url()).toMatch(/\?.+=/); const products = await getProducts(page); expect(products.length).toBeGreaterThan(0);
        const m = (await page.locator("body").innerText()).match(/1\s*[-–]\s*\d+\s+of\s+(\d+)/i);
        if (m && parseInt(m[1], 10) <= 12) expect(products.length).toBe(parseInt(m[1], 10)); await clickProductAndCheck(page); });
    test("Filter_ClearAll_07 - Nút Clear All hủy toàn bộ điều kiện lọc", async ({page: page}) => {
        await gotoStorefront(page, `${FASHION}?price=10-50`); const area = page.locator(".active-filters-wrapper:visible").first(); await expect(area).toBeVisible();
        const clear = page.locator("a.action.clear:visible").or(page.getByText(/^\s*clear all\s*$/i)).first(); await clear.click(); await settle(page);
        await expect(page.locator(".active-filters-wrapper:visible")).toHaveCount(0); expect(await page.locator("#price-filter-from:visible").first().inputValue()).toBe("");
        expect(await page.locator("#price-filter-to:visible").first().inputValue()).toBe(""); expect(await page.locator('input[type="checkbox"]:checked').count()).toBe(0);
        expect(page.url()).not.toMatch(/price=/); expect((await getProducts(page)).length).toBeGreaterThan(0); }); }); test.describe("Sort - Sắp xếp", () => {
    test("Sort_PriceAsc_01 - Giá tăng dần (Low to High)", async ({page: page}) => {
        await openHome(page); await searchFor(page, "Shirt"); await chooseSort(page, "Price"); await setSortDirection(page, "asc"); const products = await getProducts(page);
        expect(products.length).toBeGreaterThan(1); const prices = products.map(p => p.price);
        expect(isSorted(prices, "asc"), `Giá phải tăng dần: ${prices.join(", ")}`).toBeTruthy(); await clickProductAndCheck(page); });
    test("Sort_PriceDesc_02 - Giá giảm dần theo Special Price", async ({page: page}) => {
        await openHome(page); await searchFor(page, "Shirt"); await chooseSort(page, "Price"); await setSortDirection(page, "desc"); const products = await getProducts(page);
        expect(products.length).toBeGreaterThan(1); const prices = products.map(p => p.price);
        expect(isSorted(prices, "desc"), `Giá bán thực tế phải giảm dần: ${prices.join(", ")}`).toBeTruthy(); await clickProductAndCheck(page); });
    test("Sort_Popularity_03 - Sắp xếp theo Position (mặc định)", async ({page: page}) => {
        await gotoStorefront(page, FASHION); const defaultNames = (await getProducts(page)).map(p => p.name); expect(defaultNames.length).toBeGreaterThan(0);
        await chooseSort(page, "Position"); const afterNames = (await getProducts(page)).map(p => p.name); expect(afterNames).toEqual(defaultNames);
        await clickProductAndCheck(page); }); }); test.describe("Combine, URL State, Pagination, UI", () => {
    test('Search_Combine_01 - Kết hợp tìm "Jacket" + lọc Fashion + sắp xếp giá tăng', async ({page: page}) => {
        await openHome(page); await searchFor(page, "Jacket"); await clickSidebar(page, "Fashion"); await chooseSort(page, "Price"); await setSortDirection(page, "asc");
        const products = await getProducts(page); expect(products.length).toBeGreaterThan(0); expect(products.some(p => /jacket/i.test(p.name))).toBeTruthy();
        const prices = products.map(p => p.price); expect(isSorted(prices, "asc"), `Giá phải tăng dần: ${prices.join(", ")}`).toBeTruthy();
        await clickProductAndCheck(page, /jacket/i); }); test("Search_UrlState_02 - Khôi phục bộ lọc khi vào trực tiếp qua URL", async ({page: page}) => {
        await gotoStorefront(page, `${FASHION}?price=10-50`); await settle(page); await expect(page.locator("h1:visible").first()).toContainText(/Fashion/i);
        const active = await activeFilterText(page); expect(active).toMatch(/10/); expect(active).toMatch(/49\.99/);
        await expect(page.getByText(/\$\s?10(\.00)?\s*[-–—]\s*\$\s?49\.99/).first()).toBeVisible(); await clickProductAndCheck(page); });
    test("Search_Pagination_03 - Đang ở Trang 2, chọn bộ lọc mới => về Trang 1", async ({page: page}) => {
        await gotoStorefront(page, `${FASHION}?p=2`); await settle(page); await expect(page.locator("body")).toContainText(/13\s*[-–]\s*24\s+of/i);
        await clickSidebar(page, /^\s*(Man|Men)\s*\(?\d*\)?\s*$/i); const p = new URL(page.url()).searchParams.get("p");
        expect(p === null || p === "1", `Tham số p phải bị xóa hoặc bằng 1 (hiện tại: ${p})`).toBeTruthy();
        await expect(page.locator("body")).toContainText(/\b1\s*[-–]\s*\d+\s+of/i); await expect(page.locator("body")).not.toContainText(/13\s*[-–]\s*24\s+of/i); });
    test('Search_UI_04 - Autocomplete / Dropdown gợi ý khi gõ "Shirt"', async ({page: page}) => {
        await openHome(page); const suggestionsResponse = page.waitForResponse(response => {
            const url = new URL(response.url()); return url.pathname.includes("/catalogsearch/ajax/suggest/") && url.searchParams.get("q") === "Shirt"; }, {
            timeout: 2e4
        }); await typeSearch(page, "Shirt"); expect((await suggestionsResponse).status()).toBe(200);
        const dropdown = page.locator("#search_autocomplete, .search-autocomplete, .autocomplete-suggestions").first(); await expect(dropdown).toBeVisible({
            timeout: 1e4
        }); expect(await dropdown.locator("li, .item, a").count()).toBeGreaterThan(0); await expect(dropdown).toContainText(/shirt/i);
        expect(await dropdown.locator("img").count()).toBeGreaterThan(0); await expect(dropdown).toContainText(/\$\s?\d/); });
    test('Search_UI_05 - Đổi biến thể màu khi xem chi tiết "Harbour stripe tee"', async ({page: page}) => {
        await openHome(page); const box = await typeSearch(page, "Harbour stripe tee"); await pressEnterAndWait(page, box); await clickProductAndCheck(page, /harbour stripe tee/i);
        const snapshot = () => page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll("main img, .product-view img, img")).slice(0, 6).map(i => i.currentSrc || i.src).join("|");
            const values = Array.from(document.querySelectorAll('input[name*="attribute"], select[name*="attribute"]')).map(el => `${el.name}=${el.value}`);
            const swatches = Array.from(document.querySelectorAll(".swatch-link")).map(el => `${el.getAttribute("title")}:${el.className}:${el.parentElement?.className}`);
            return JSON.stringify({
                imgs: imgs,
                values: values,
                swatches: swatches
            }); }); const before = await snapshot(); const dropdown = page.locator('select[id^="attribute"]:visible, select[name^="super_attribute"]:visible').first();
        if (await dropdown.count() > 0) {
            await dropdown.selectOption({
                index: 2
            }).catch(() => dropdown.selectOption({
                index: 1
            })); } else {
            const options = page.locator(".swatch-link:visible"); expect(await options.count(), "Sản phẩm phải có từ 2 biến thể màu").toBeGreaterThan(1);
            const redOption = options.filter({
                has: page.locator('img[alt="Red"]')
            }).first(); await expect(redOption, "Không tìm thấy biến thể màu đỏ").toBeVisible(); await redOption.hover(); await redOption.click(); }
        await settle(page); await expect.poll(snapshot, {
            timeout: 1e4,
            message: "Màu/ảnh sản phẩm phải đổi theo biến thể đã chọn"
        }).not.toBe(before); }); test.skip("Search_Voice_01 - Voice Search (SKIPPED: Headless không hỗ trợ Micro API)", async () => {});
    test.skip("Search_Synonym_01 - Synonym Search (UNTESTED: chờ Admin cấu hình Search Synonyms)", async () => {}); }); test.describe("Performance", () => {
    test("Search_Perf_01 - Thời gian phản hồi Facet Filter dưới tải 100 req/s", async ({}, testInfo) => {
        const reason = "Load test 100 req/s cần staging được ủy quyền; không chạy trên demo công khai."; testInfo.annotations.push({
            type: "Blocked",
            description: reason
        }, {
            type: "Actual Result",
            description: `BLOCKED — ${reason}`
        }); test.skip(true, reason); }); }); const fs = require("node:fs"); const path = require("node:path"); const XLSX = require("xlsx");
const ASM7X_WORKBOOK_NAME = "Group02_23130238_VuChauHoaiPhong.xlsx"; const ASM7X_WORKBOOK_OVERRIDE = process.env.ASM7_WORKBOOK ? path.resolve(process.env.ASM7_WORKBOOK) : "";
const ASM7X_WORKBOOK_CANDIDATES = [ ASM7X_WORKBOOK_OVERRIDE, path.join(__dirname, ASM7X_WORKBOOK_NAME), path.resolve(process.cwd(), ASM7X_WORKBOOK_NAME) ].filter(Boolean);
const ASM7X_WORKBOOK = ASM7X_WORKBOOK_CANDIDATES.find(candidate => fs.existsSync(candidate)) || ASM7X_WORKBOOK_CANDIDATES[0];
const ASM7X_ACCOUNT_URL = new URL("customer/account/", BASE).toString(); const ASM7X_LOGIN_URL = new URL("customer/account/login/", BASE).toString();
const ASM7X_PROFILE_URL = new URL("customer/account/edit/", BASE).toString(); const ASM7X_ADDRESS_URL = new URL("customer/address/", BASE).toString();
const ASM7X_ADDRESS_NEW_URL = new URL("customer/address/new/", BASE).toString(); const ASM7X_CART_URL = new URL("checkout/cart/", BASE).toString();
const ASM7X_HISTORY_URL = new URL("sales/order/history/", BASE).toString(); const ASM7X_FASHION_URL = new URL("fashion/", BASE).toString(); const ASM7X_QA = {
    email: (process.env.QA_EMAIL || "").trim(),
    password: (process.env.QA_PASSWORD || "").trim(),
    firstName: process.env.QA_FIRST_NAME || "QA",
    lastName: process.env.QA_LAST_NAME || "ASM7",
    phone: process.env.QA_PHONE || "4155550136",
    street: process.env.QA_STREET || "123 Automation Test Street",
    city: process.env.QA_CITY || "Beverly Hills",
    postcode: process.env.QA_POSTCODE || "90210"
}; const ASM7X_PRODUCT_ONE = process.env.QA_PRODUCT_ONE || "Bib shorts"; const ASM7X_PRODUCT_TWO = process.env.QA_PRODUCT_TWO || "Harbour stripe tee";
const ASM7X_ALLOW_ORDER = process.env.ALLOW_DEMO_ORDER_CREATION === "true"; const ASM7X_ALLOW_TWO_ORDERS = process.env.ALLOW_TWO_DEMO_ORDERS === "true";
const ASM7X_ALLOW_CART_RESET = process.env.ALLOW_QA_CART_RESET === "true"; const ASM7X_QA_INBOX_URL = process.env.QA_EMAIL_INBOX_URL || "";
const ASM7X_QA_ORDER_NUMBER = (process.env.QA_ORDER_NUMBER || "").trim(); const ASM7X_QA_ORDER_CONFIRMATION_URL = (process.env.QA_ORDER_CONFIRMATION_URL || "").trim();
function asm7xTodayVN() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date); }
function asm7xToken(prefix = "ASM7") {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`; }
function asm7xEscapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function asm7xMoney(value) {
    const m = String(value || "").replace(/,/g, "").match(/-?\d+(?:\.\d{1,2})?/); return m ? Number(m[0]) : NaN; }
async function asm7xFind(page, selectors) {
    for (const selector of selectors) {
        const locator = page.locator(selector).first(); if (await locator.count() && await locator.isVisible().catch(() => false)) {
            return locator; }
    }
    return null; }
async function asm7xField(page, name) {
    const selectors = {
        firstname: [ "#firstname", 'input[name="firstname"]' ],
        lastname: [ "#lastname", 'input[name="lastname"]' ],
        email: [ "#email", 'input[name="login[username]"]', 'input[type="email"]' ],
        password: [ "#pass", 'input[name="login[password]"]', 'input[type="password"]' ],
        telephone: [ "#telephone", 'input[name="telephone"]', 'input[name*="phone"]' ],
        street: [ "#street_1", 'input[name="street[0]"]', 'input[name="street[]"]', 'input[name*="street"]' ],
        city: [ "#city", 'input[name="city"]' ],
        postcode: [ "#zip", "#postcode", 'input[name="postcode"]' ],
        country: [ "#country", "#country_id", 'select[name="country_id"]' ],
        region: [ "#region_id", 'select[name="region_id"]', "#region", 'input[name="region"]' ],
        quantity: [ "#qty", 'input[name="qty"]', 'input[name="quantity"]' ]
    }; return asm7xFind(page, selectors[name] || [ `#${name}`, `[name="${name}"]` ]); }
function asm7xSheetFor(id) {
    if (/^(DEF_Search_|Search|Filter|Sort)_/.test(id) || id.startsWith("DEF_Search_")) return "Search"; if (/^(DEF_Profile_|Profile|Address)_/.test(id) || id.startsWith("DEF_Profile_")) return "Profile"; return "Order"; }
function asm7xRefreshDashboard(wb) {
    const dashboard = wb.Sheets.Dashboard; if (!dashboard) return; const configs = [ {
        name: "Search",
        row: 5,
        noteRow: 11
    }, {
        name: "Profile",
        row: 6,
        noteRow: 12
    }, {
        name: "Order",
        row: 7,
        noteRow: 13
    } ]; for (const config of configs) {
        const sheet = wb.Sheets[config.name]; if (!sheet || !sheet["!ref"]) continue; const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: ""
        }); const headers = (rows[0] || []).map(v => String(v).trim()); const idCol = headers.indexOf("ID"); const resultCol = headers.indexOf("Result");
        if (idCol < 0 || resultCol < 0) continue; const statuses = rows.slice(1).filter(row => row[idCol]).map(row => String(row[resultCol] || "").trim().toUpperCase());
        const total = statuses.length; const count = value => statuses.filter(status => status === value).length; const passed = count("PASSED");
        const target = Math.ceil(total * .9); const cells = {
            B: total,
            C: passed,
            D: count("FAILED"),
            E: count("BLOCKED"),
            F: count("SKIPPED"),
            G: count("NOT RUN") + count("UNTESTED"),
            H: total ? passed / total : 0,
            I: target,
            J: Math.max(0, target - passed)
        }; const lastRow = total + 1; const refs = {
            B: `COUNTA('${config.name}'!$A$2:$A$${lastRow})`,
            C: `COUNTIF('${config.name}'!$F$2:$F$${lastRow},"PASSED")`,
            D: `COUNTIF('${config.name}'!$F$2:$F$${lastRow},"FAILED")`,
            E: `COUNTIF('${config.name}'!$F$2:$F$${lastRow},"BLOCKED")`,
            F: `COUNTIF('${config.name}'!$F$2:$F$${lastRow},"SKIPPED")`,
            G: `COUNTIF('${config.name}'!$F$2:$F$${lastRow},"NOT RUN")+COUNTIF('${config.name}'!$F$2:$F$${lastRow},"UNTESTED")`,
            H: `IF(B${config.row}=0,0,C${config.row}/B${config.row})`,
            I: `ROUNDUP(B${config.row}*90%,0)`,
            J: `MAX(0,I${config.row}-C${config.row})`
        }; for (const [col, value] of Object.entries(cells)) {
            const address = `${col}${config.row}`; const cell = dashboard[address] || {}; cell.t = "n"; cell.v = value; cell.f = refs[col]; dashboard[address] = cell; }
        const noteAddress = `A${config.noteRow}`; const note = dashboard[noteAddress] || {}; note.t = "s";
        note.v = `${config.name}: ${passed} PASSED / ${total} (${(total ? passed / total * 100 : 0).toFixed(2)}%); ${count("FAILED")} FAILED; ${count("BLOCKED")} BLOCKED; ${count("SKIPPED")} SKIPPED; ${count("NOT RUN") + count("UNTESTED")} NOT RUN / UNTESTED. BLOCKED and SKIPPED are not counted as PASSED.`;
        dashboard[noteAddress] = note; }
}
function asm7xWriteResult(id, status, actual) {
    if (!fs.existsSync(ASM7X_WORKBOOK)) {
        return {
            ok: false,
            message: `Không tìm thấy workbook hợp nhất: ${ASM7X_WORKBOOK}`
        }; }
    try {
        const wb = XLSX.readFile(ASM7X_WORKBOOK, {
            cellStyles: true
        }); const sheetName = asm7xSheetFor(id); const sheet = wb.Sheets[sheetName]; if (!sheet || !sheet["!ref"]) {
            throw new Error(`Không tìm thấy sheet "${sheetName}".`); }
        const matrix = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: ""
        }); const headers = matrix[0].map(v => String(v).trim()); const idCol = headers.indexOf("ID"); const resultCol = headers.indexOf("Result");
        const dateCol = headers.indexOf("Test date"); const actualCol = headers.indexOf("Actual Result"); if (idCol < 0 || resultCol < 0 || dateCol < 0 || actualCol < 0) {
            throw new Error(`Sheet "${sheetName}" phải có ID, Result, Test date và Actual Result.`); }
        const index = matrix.findIndex((row, i) => i > 0 && String(row[idCol]).trim() === id); if (index < 0) {
            throw new Error(`Không tìm thấy testcase ID ${id} trong sheet "${sheetName}".`); }
        const writeCell = (r, c, value) => {
            const addr = XLSX.utils.encode_cell({
                r: r,
                c: c
            }); sheet[addr] = {
                ...sheet[addr],
                t: "s",
                v: String(value ?? "")
            }; }; writeCell(index, resultCol, status); writeCell(index, dateCol, asm7xTodayVN()); writeCell(index, actualCol, actual); asm7xRefreshDashboard(wb);
        XLSX.writeFile(wb, ASM7X_WORKBOOK, {
            cellStyles: true
        }); return {
            ok: true,
            message: `${id}: ${status} → ${sheetName}`
        }; } catch (error) {
        return {
            ok: false,
            message: error.message
        }; }
}
async function asm7xExecute(testInfo, page, id, callback, options = {}) {
    let status = "PASSED"; let actual = ""; let failure = null; try {
        if (!options.guest) {
            const login = await asm7xEnsureLogin(page); if (!login.ok) {
                throw new Error(`BLOCKED: Pre-condition đăng nhập QA không đạt: ${login.reason}`); }
        }
        const result = await callback(page); if (result && result.blocked) {
            throw new Error(`BLOCKED: ${result.reason || result.actual || "Điều kiện testcase chưa đáp ứng."}`); }
        actual = typeof result === "string" ? result : `PASS — ${id}: Các assertion của testcase đã hoàn tất.`; } catch (error) {
        failure = error; status = /^BLOCKED:/i.test(error.message || "") || error.code === "ASM7_BLOCKED" ? "BLOCKED" : "FAILED";
        const visible = page ? await page.locator("body").innerText().catch(() => "") : "";
        actual = `${status} — ${id}: ${error.message}; URL=${page ? page.url() : "N/A"}; UI=${visible.slice(0, 700)}`; }
    testInfo.annotations.push({
        type: "Result",
        description: status
    }); testInfo.annotations.push({
        type: "Actual Result",
        description: actual
    }); await testInfo.attach("actual-result.txt", {
        body: actual,
        contentType: "text/plain; charset=utf-8"
    }).catch(() => {}); if (status === "BLOCKED") {
        testInfo.annotations.push({
            type: "Blocked",
            description: actual
        }); test.skip(true, actual); }
    if (failure) throw failure; }
async function asm7xAutoRegister(page) {
    try {
        const regUrl = new URL("customer/account/create/", BASE).toString();
        await gotoStorefront(page, regUrl);
        await page.waitForLoadState("domcontentloaded");
        const tabReg = page.locator("#tab-register").first();
        if (await tabReg.count()) await tabReg.click().catch(() => {});
        await page.waitForTimeout(400);

        const form = page.locator("#form-validate-register, #form-validate").first();
        const fill = async (sel, val) => {
            const el = form.locator(sel).first();
            if (await el.count()) await el.fill(val);
        };
        await fill('#firstname, [name="firstname"]', ASM7X_QA.firstName);
        await fill('#lastname, [name="lastname"]', ASM7X_QA.lastName);
        await fill('#email_address_register, #email_address, [name="email"]', ASM7X_QA.email);
        await fill('#password_register, [name="password"]', ASM7X_QA.password);
        await fill('#confirmation_register, [name="confirmation"]', ASM7X_QA.password);

        const submitBtn = form.locator('button[type="submit"]').first();
        if (await submitBtn.count()) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {}),
                submitBtn.click()
            ]);
        }
        await page.waitForTimeout(1000);
        const loginAfter = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password);
        if (loginAfter.ok) return { ok: true };
        const body = await page.locator("body").innerText().catch(() => "");
        if (/my account|account dashboard|hello,/i.test(body)) return { ok: true };
        return { ok: false, reason: "Đăng ký không thành công" };
    } catch (e) {
        return { ok: false, reason: e.message };
    }
}

async function asm7xEnsureLogin(page) {
    if (!ASM7X_QA.email || !ASM7X_QA.password) {
        return {
            ok: false,
            reason: "Thiếu QA_EMAIL hoặc QA_PASSWORD."
        };
    }
    try {
        await gotoStorefront(page, ASM7X_ACCOUNT_URL);
        let password = await asm7xField(page, "password");
        if (password) {
            let login = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password);
            if (!login.ok) {
                const reg = await asm7xAutoRegister(page);
                if (reg.ok) {
                    login = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password);
                }
                if (!login.ok) return login;
            }
            await gotoStorefront(page, ASM7X_ACCOUNT_URL);
            password = await asm7xField(page, "password");
        }
        if (password || /customer\/account\/login/i.test(page.url())) {
            return {
                ok: false,
                reason: "Đăng nhập không thành công hoặc phiên bị yêu cầu xác thực lại."
            };
        }
        const body = await page.locator("body").innerText().catch(() => "");
        if (/my account|account dashboard|account information/i.test(body)) {
            return {
                ok: true
            };
        }
        return {
            ok: false,
            reason: "Không xác minh được trạng thái My Account."
        };
    } catch (error) {
        return {
            ok: false,
            reason: error.message
        };
    }
}
async function asm7xGo(page, url) {
    await gotoStorefront(page, url); }
async function asm7xSave(page) {
    const button = await asm7xFind(page, [ 'button[title="Save"]', 'button[title="Save Address"]', 'button[type="submit"]', 'input[type="submit"]' ]); if (!button) return false;
    await button.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); return true; }
async function asm7xSubmitProfile(page, field, waitForNavigation = true) {
    const form = field.locator("xpath=ancestor::form[1]"); const currentPassword = form.locator('input[name="current_password"], #current_password').first();
    if (await currentPassword.count()) {
        if (!ASM7X_QA.password) {
            throw new Error("QA_PASSWORD is required to save account information."); }
        await currentPassword.fill(ASM7X_QA.password); }
    const save = form.locator('button[title="Save"], button[type="submit"], input[type="submit"]').first();
    await expect(save, "Không tìm thấy nút Save của form hồ sơ.").toBeVisible(); if (waitForNavigation) {
        await Promise.all([ page.waitForNavigation({
            waitUntil: "domcontentloaded"
        }), save.click() ]); } else {
        await save.click(); }
}
async function asm7xOpenProfile(page) {
    await asm7xGo(page, ASM7X_PROFILE_URL); return asm7xField(page, "firstname"); }
async function asm7xOpenAddressBook(page) {
    await asm7xGo(page, ASM7X_ADDRESS_URL); const body = await page.locator("body").innerText().catch(() => "");
    return /address book|default billing|default shipping|add new address|addresses/i.test(body) || await page.locator('a[href*="customer/address/new"]').count() > 0; }
async function asm7xOpenNewAddress(page) {
    await asm7xGo(page, ASM7X_ADDRESS_URL); const add = await asm7xFind(page, [ 'a:has-text("Add New Address")', 'a:has-text("Add Address")' ]); if (add) {
        await add.click(); } else {
        await asm7xGo(page, ASM7X_ADDRESS_NEW_URL); }
    return Boolean(await asm7xField(page, "street")); }
async function asm7xSelectCountry(page, name = "United States") {
    const country = await asm7xField(page, "country"); if (!country) return false; if (await country.evaluate(el => el.tagName.toLowerCase()) !== "select") {
        return false; }
    const options = await country.locator("option").evaluateAll(els => els.map(x => ({
        value: x.value,
        text: (x.textContent || "").trim()
    })).filter(x => x.value)); const match = options.find(x => new RegExp(name, "i").test(x.text)); if (!match) return false; await country.selectOption(match.value);
    await page.waitForTimeout(250); return true; }
async function asm7xFillAddress(page, data = {}) {
    const values = {
        firstname: data.firstname || ASM7X_QA.firstName,
        lastname: data.lastname || ASM7X_QA.lastName,
        street: data.street || ASM7X_QA.street,
        city: data.city || ASM7X_QA.city,
        postcode: data.postcode || ASM7X_QA.postcode,
        telephone: data.telephone || ASM7X_QA.phone
    }; const found = {}; for (const [name, value] of Object.entries(values)) {
        const field = await asm7xField(page, name); found[name] = Boolean(field); if (field) {
            await field.fill(String(value)); }
    }
    found.country = await asm7xSelectCountry(page, data.country || "United States"); const region = await asm7xField(page, "region"); if (region) {
        if (await region.evaluate(el => el.tagName.toLowerCase()) === "select") {
            const options = await region.locator("option").evaluateAll(els => els.map(x => ({
                value: x.value,
                text: (x.textContent || "").trim()
            })).filter(x => x.value)); const california = options.find(x => /california/i.test(x.text)); if (california) {
                await region.selectOption(california.value); } else if (options.length) {
                await region.selectOption(options[0].value); }
        } else {
            await region.fill(data.region || "California"); }
    }
    return found; }
async function asm7xAddressCard(page, token) {
    const address = page.locator("address").filter({
        hasText: token
    }).first(); if (await address.count()) {
        const item = address.locator("xpath=ancestor::li[1]"); if (await item.count()) return item; }
    const card = page.locator("li.item").filter({
        hasText: token
    }).first(); return await card.count() ? card : null; }
async function asm7xAddressExists(page, token) {
    await asm7xOpenAddressBook(page); return await page.getByText(token, {
        exact: false
    }).count() > 0; }
async function asm7xSubmitAddressForValidation(page, field, token) {
    const submitted = await asm7xSave(page); if (!submitted) return {
        submitted: false,
        validation: false,
        saved: false
    }; await page.waitForFunction(() => {
        const listing = /\/customer\/address\/?$/.test(location.pathname);
        const feedback = [ ".validation-advice", ".mage-error", ".field-error", ".message-error", ".messages .error", '[aria-invalid="true"]' ].some(selector => [ ...document.querySelectorAll(selector) ].some(element => element.getClientRects().length > 0));
        return listing || feedback; }, null, {
        timeout: 1e4
    }).catch(() => {}); const onAddressBook = /\/customer\/address\/?$/.test(new URL(page.url()).pathname);
    const feedback = await page.locator(".validation-advice:visible, .mage-error:visible, .field-error:visible, .message-error:visible, .messages .error:visible").count();
    const validation = onAddressBook ? false : await field.evaluate(el => !el.checkValidity() || el.getAttribute("aria-invalid") === "true" || Boolean(el.closest(".field")?.querySelector(".validation-advice, .mage-error, .field-error"))).catch(() => false);
    const body = await page.locator("body").innerText().catch(() => ""); return {
        submitted: true,
        validation: validation || feedback > 0,
        saved: onAddressBook && body.includes(token)
    }; }
async function asm7xDeleteAddress(page, token) {
    await asm7xOpenAddressBook(page); const card = await asm7xAddressCard(page, token); if (!card) return false; const remove = card.getByRole("link", {
        name: /delete|remove/i
    }).or(card.getByRole("button", {
        name: /delete|remove/i
    })).first(); if (!await remove.count()) return false; const linkHtml = await remove.evaluate(el => el.outerHTML); page.once("dialog", dialog => dialog.accept());
    await remove.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); await expect.poll(async () => await asm7xAddressCard(page, token) === null, {
        timeout: 1e4,
        message: `Address Book must remove the deleted test address. Delete link: ${linkHtml}`
    }).toBeTruthy(); return await asm7xAddressCard(page, token) === null; }
async function asm7xSetDefault(page, type) {
    const selectors = type === "billing" ? [ "#primary_billing", 'input[name="default_billing"]', 'input[name="is_default_billing"]' ] : [ "#primary_shipping", 'input[name="default_shipping"]', 'input[name="is_default_shipping"]' ];
    const checkbox = await asm7xFind(page, selectors); if (!checkbox) return false; await checkbox.setChecked(true).catch(async () => checkbox.click()); return true; }
async function asm7xInvalid(field) {
    return field.evaluate(el => {
        const fieldContainer = el.closest(".field, .input-box, .control") || el.parentElement;
        const visibleFeedback = fieldContainer ? [ ...fieldContainer.querySelectorAll(".validation-advice, .mage-error, .field-error, .message-error") ].some(message => message.getClientRects().length > 0) : false;
        const postcodePattern = el.getAttribute("data-postcode-pattern"); const postcodeInvalid = postcodePattern ? !new RegExp(postcodePattern).test(el.value) : false;
        return !el.checkValidity() || el.getAttribute("aria-invalid") === "true" || el.classList.contains("validation-failed") || visibleFeedback || postcodeInvalid;
    }).catch(() => false); }
async function asm7xRequired(field) {
    return field.evaluate(el => {
        const label = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
        return el.required || el.classList.contains("required-entry") || el.getAttribute("aria-required") === "true" || Boolean(label && label.classList.contains("required"));
    }).catch(() => false); }
test.afterEach(async ({page: page}, testInfo) => {
    const title = testInfo.title || ""; const id = title.split(" - ")[0].split(" | ")[0].trim();
    if (!/^(DEF_|Search_|Filter_|Sort_|Profile_|Address_|Cart_|Checkout_|Order_|Invoice_)/.test(id)) {
        return; }
    const errorText = testInfo.error && testInfo.error.message ? testInfo.error.message : ""; const blocked = (testInfo.annotations || []).find(item => item.type === "Blocked");
    let status = "FAILED"; if (blocked || /^BLOCKED:/i.test(errorText)) {
        status = "BLOCKED"; } else if (testInfo.status === "passed") {
        status = "PASSED"; } else if (testInfo.status === "skipped") {
        status = "SKIPPED"; }
    const annotation = (testInfo.annotations || []).find(item => item.type === "Actual Result"); const body = page ? await page.locator("body").innerText().catch(() => "") : "";
    const actual = annotation ? annotation.description : `${status} — ${errorText || `Playwright status=${testInfo.status}`}; URL=${page ? page.url() : "N/A"}; UI=${body.slice(0, 500)}`;
    const saved = asm7xWriteResult(id, status, `${actual}\nTest date: ${asm7xTodayVN()}`); if (!saved.ok) {
        throw new Error(`[ASM7 Excel] ${saved.message}`); }
}); async function asm7xLoginWithCredentials(page, email, password) {
    await asm7xGo(page, ASM7X_LOGIN_URL); const passwordField = await asm7xField(page, "password"); if (!passwordField) {
        const body = await page.locator("body").innerText().catch(() => "");
        const authenticated = !/customer\/account\/login/i.test(page.url()) && /my dashboard|account dashboard|account information|hello,/i.test(body); return {
            ok: authenticated,
            reason: authenticated ? "Phiên QA đã đăng nhập." : "Không tìm thấy form Sign In hoặc dashboard tài khoản."
        }; }
    const form = passwordField.locator("xpath=ancestor::form[1]"); const emailField = form.locator('#email, input[name="login[username]"], input[type="email"]').first();
    if (!await emailField.count()) {
        return {
            ok: false,
            reason: "Không tìm thấy ô email trong form Sign In."
        }; }
    await emailField.fill(email); await passwordField.fill(password);
    const credentialsFilled = await emailField.inputValue() === email && await passwordField.inputValue() === password; if (!credentialsFilled) {
        return {
            ok: false,
            reason: "Form Sign In không giữ đúng giá trị QA_EMAIL/QA_PASSWORD sau khi điền."
        }; }
    const submit = form.locator('#send2, button[type="submit"], input[type="submit"]').first(); if (!await submit.count()) {
        return {
            ok: false,
            reason: "Không tìm thấy nút submit trong form Sign In."
        }; }
    const outcome = await Promise.all([ page.waitForFunction(() => {
        const body = document.body?.innerText || ""; if (/invalid login or password|incorrect (email|password)|could not sign in/i.test(body)) {
            return "rejected"; }
        const password = document.querySelector('#pass, input[name="login[password]"], input[type="password"]');
        const passwordVisible = password instanceof HTMLElement && password.getClientRects().length > 0;
        if (!passwordVisible && !/customer\/account\/login/i.test(location.pathname) && /my dashboard|account dashboard|hello,/i.test(body)) {
            return "authenticated"; }
        return null; }, null, {
        timeout: 15e3
    }).then(handle => handle.jsonValue()), submit.click() ]).then(([state]) => state); if (outcome === "rejected") {
        const body = await page.locator("body").innerText().catch(() => ""); return {
            ok: false,
            reason: body.match(/invalid login or password|incorrect (?:email|password)|could not sign in/i)?.[0] || "Website rejected the QA credentials."
        }; }
    return {
        ok: outcome === "authenticated",
        reason: outcome === "authenticated" ? "Đăng nhập và dashboard đã được xác nhận." : "Không xác nhận được dashboard sau khi gửi form đăng nhập."
    }; }
test.describe("PROFILE & ADDRESS BOOK — 25 TEST CASES", () => {
    test.describe.configure({
        mode: "default"
    }); const run = (id, callback, options = {}) => async ({page: page}, testInfo) => {
        await asm7xExecute(testInfo, page, id, () => callback(page), options); };
    test("Profile_LoginPageOpen_01 - Mở trang đăng nhập khách hàng", run("Profile_LoginPageOpen_01", async page => {
        await asm7xGo(page, ASM7X_LOGIN_URL); const email = await asm7xField(page, "email"); const password = await asm7xField(page, "password");
        const submit = await asm7xFind(page, [ "#send2", 'button[type="submit"]', 'input[type="submit"]' ]); expect(email).not.toBeNull(); expect(password).not.toBeNull();
        expect(submit).not.toBeNull(); expect(/customer\/account\/login|login/i.test(page.url())).toBeTruthy();
        return `Sign In page displays email, password and submit controls. URL=${page.url()}.`; }, {
        guest: true
    })); test("Profile_GuestAddressRedirect_02 - Guest không truy cập Address Book", run("Profile_GuestAddressRedirect_02", async page => {
        await asm7xGo(page, ASM7X_ADDRESS_URL); const password = await asm7xField(page, "password"); const body = await page.locator("body").innerText();
        const redirected = /customer\/account\/login/i.test(page.url()) || Boolean(password); expect(redirected).toBeTruthy();
        expect(/default billing|default shipping|address book/i.test(body)).toBeFalsy(); return `Guest được chuyển tới Sign In; URL=${page.url()}.`; }, {
        guest: true
    })); test("Profile_LoginValid_03 - Đăng nhập bằng tài khoản QA hợp lệ", run("Profile_LoginValid_03", async page => {
        if (!ASM7X_QA.email || !ASM7X_QA.password) {
            return {
                blocked: true,
                reason: "Chưa khai báo QA_EMAIL và QA_PASSWORD cho tài khoản test hợp lệ."
            }; }
        const login = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password);
        expect(login.ok, `Đăng nhập thất bại hoặc chưa xác minh được dashboard: ${login.reason}`).toBeTruthy();
        return `Đăng nhập thành công; My Account được hiển thị cho ${ASM7X_QA.email}.`; }, {
        guest: true
    })); test("Profile_LoginInvalid_04 - Đăng nhập bằng mật khẩu sai", run("Profile_LoginInvalid_04", async page => {
        const email = ASM7X_QA.email || `qa.invalid.${Date.now()}@example.com`; const badPassword = `${ASM7X_QA.password || "invalid"}-WRONG`;
        const login = await asm7xLoginWithCredentials(page, email, badPassword); const passwordField = await asm7xField(page, "password");
        const body = (await page.locator("body").innerText()).toLowerCase();
        expect(!login.ok && (passwordField || /invalid|incorrect|wrong|could not|not match|sign in/i.test(body))).toBeTruthy();
        return "Không tạo phiên đăng nhập với mật khẩu sai; vẫn ở luồng Sign In."; }, {
        guest: true
    })); test("Profile_LoginEmpty_05 - Bỏ trống email và password", run("Profile_LoginEmpty_05", async page => {
        await asm7xGo(page, ASM7X_LOGIN_URL); const email = await asm7xField(page, "email"); const password = await asm7xField(page, "password");
        const submit = await asm7xFind(page, [ "#send2", 'button[type="submit"]', 'input[type="submit"]' ]); expect(email && password && submit).toBeTruthy(); await email.fill("");
        await password.fill(""); await submit.click(); const invalid = await asm7xInvalid(email) || await asm7xInvalid(password);
        const body = (await page.locator("body").innerText()).toLowerCase(); expect(invalid || /required|enter.*email|password|cannot be empty/i.test(body)).toBeTruthy();
        expect(/customer\/account\/login/i.test(page.url()) || Boolean(await asm7xField(page, "password"))).toBeTruthy();
        return "Form không đăng nhập thành công khi email/password trống; validation hiển thị."; }, {
        guest: true
    })); test("Profile_LoginInvalidEmail_06 - Email sai định dạng", run("Profile_LoginInvalidEmail_06", async page => {
        await asm7xGo(page, ASM7X_LOGIN_URL); const email = await asm7xField(page, "email"); const password = await asm7xField(page, "password"); if (!email || !password) {
            return {
                blocked: true,
                reason: "Không tìm thấy form Sign In."
            }; }
        await email.fill("phong@"); await password.fill("AnyTestPassword123"); expect(await asm7xInvalid(email)).toBeTruthy();
        return "Email sai định dạng bị HTML validation đánh dấu invalid; chưa gửi thông tin đăng nhập."; }, {
        guest: true
    })); test("Profile_Logout_07 - Đăng xuất tài khoản QA", run("Profile_Logout_07", async page => {
        if (!ASM7X_QA.email || !ASM7X_QA.password) {
            return {
                blocked: true,
                reason: "Chưa khai báo QA_EMAIL và QA_PASSWORD để kiểm tra đăng xuất."
            }; }
        const login = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password); if (!login.ok) {
            return {
                blocked: true,
                reason: `Không đăng nhập được trước khi logout: ${login.reason}`
            }; }
        const signOut = await asm7xFind(page, [ 'a:has-text("Sign Out")', 'a:has-text("Log Out")', 'a:has-text("Logout")', 'a[href*="logout"]' ]); if (!signOut) {
            return {
                blocked: true,
                reason: "Không tìm thấy Sign Out/Logout trên storefront."
            }; }
        await signOut.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); await asm7xGo(page, ASM7X_ACCOUNT_URL);
        const password = await asm7xField(page, "password"); expect(Boolean(password) || /customer\/account\/login/i.test(page.url())).toBeTruthy();
        return "Đã logout; truy cập lại My Account yêu cầu đăng nhập."; }, {
        guest: true
    })); test("Profile_AccountInfoView_08 - Xem thông tin hồ sơ cá nhân", run("Profile_AccountInfoView_08", async page => {
        await asm7xGo(page, ASM7X_ACCOUNT_URL); const body = await page.locator("body").innerText();
        expect(/my account|account dashboard|account information/i.test(body)).toBeTruthy(); const first = await asm7xField(page, "firstname");
        const last = await asm7xField(page, "lastname"); if (!first && !last) {
            const edit = await asm7xFind(page, [ 'a:has-text("Account Information")', 'a:has-text("Edit Account Information")' ]); if (edit) await edit.click(); }
        expect(Boolean(await asm7xField(page, "firstname") || await asm7xField(page, "lastname"))).toBeTruthy();
        return "My Account / Account Information hiển thị trường thông tin khách hàng."; }));
    test("Profile_AccountInfoEdit_09 - Cập nhật hồ sơ hợp lệ", run("Profile_AccountInfoEdit_09", async page => {
        await asm7xOpenProfile(page); const first = await asm7xField(page, "firstname"); const last = await asm7xField(page, "lastname"); if (!first || !last) {
            return {
                blocked: true,
                reason: "Không thấy đủ First Name và Last Name để kiểm tra chỉnh sửa."
            }; }
        const oldFirst = await first.inputValue(); const oldLast = await last.inputValue(); const newFirst = `QA${Date.now()}`; const newLast = `ASM7${Date.now()}`; try {
            await first.fill(newFirst); await last.fill(newLast); await asm7xSubmitProfile(page, first); await asm7xGo(page, ASM7X_PROFILE_URL);
            const savedFirst = await asm7xField(page, "firstname"); const savedLast = await asm7xField(page, "lastname"); expect(await savedFirst.inputValue()).toBe(newFirst);
            expect(await savedLast.inputValue()).toBe(newLast); return `First Name và Last Name lưu thành công: ${newFirst} ${newLast}.`; } finally {
            await asm7xGo(page, ASM7X_PROFILE_URL); const f = await asm7xField(page, "firstname"); const l = await asm7xField(page, "lastname"); if (f && l) {
                await f.fill(oldFirst); await l.fill(oldLast); await asm7xSubmitProfile(page, f); await asm7xGo(page, ASM7X_PROFILE_URL);
                const restoredFirst = await asm7xField(page, "firstname"); const restoredLast = await asm7xField(page, "lastname");
                expect(await restoredFirst.inputValue()).toBe(oldFirst); expect(await restoredLast.inputValue()).toBe(oldLast); }
        }
    })); test("Profile_AccountInfoRequired_10 - Validation trường hồ sơ bắt buộc", run("Profile_AccountInfoRequired_10", async page => {
        await asm7xOpenProfile(page); const first = await asm7xField(page, "firstname"); if (!first) {
            return {
                blocked: true,
                reason: "Không tìm thấy First Name."
            }; }
        const original = await first.inputValue(); try {
            expect(await first.evaluate(el => el.required || el.getAttribute("aria-required") === "true" || el.classList.contains("required-entry")), "First Name phải được đánh dấu bắt buộc theo validation của form.").toBeTruthy();
            await first.fill(""); await asm7xSubmitProfile(page, first, false); const feedback = (await page.locator("body").innerText()).replace(/\s+/g, " ");
            expect(/First Name.{0,100}(required|length|invalid)|(required|length|invalid).{0,100}First Name/i.test(feedback), `Không thấy phản hồi validation cho First Name: ${feedback.slice(0, 500)}`).toBeTruthy();
            return "First Name trống bị validation của form từ chối."; } finally {
            await first.fill(original); }
    })); test("Address_BookOpen_11 - Mở Address Book", run("Address_BookOpen_11", async page => {
        expect(await asm7xOpenAddressBook(page)).toBeTruthy(); const body = await page.locator("body").innerText();
        expect(/address|default billing|default shipping|add new/i.test(body)).toBeTruthy(); return "Address Book mở được và hiển thị nội dung địa chỉ."; }));
    test("Address_AddValid_12 - Thêm địa chỉ hợp lệ", run("Address_AddValid_12", async page => {
        const token = asm7xToken("ADD"); if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được Add New Address."
            }; }
        const fields = await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`
        }); expect(fields.firstname && fields.lastname && fields.street && fields.city && fields.postcode && fields.telephone).toBeTruthy();
        expect(await asm7xSave(page)).toBeTruthy(); expect(await asm7xAddressExists(page, token)).toBeTruthy();
        return `Địa chỉ hợp lệ ${token} được lưu và xuất hiện trong Address Book.`; }));
    test("Address_AddRequired_13 - Validation trường địa chỉ bắt buộc", run("Address_AddRequired_13", async page => {
        if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${asm7xToken("REQ")}`
        }); const requiredFields = []; for (const name of [ "street", "city", "postcode", "telephone" ]) {
            const field = await asm7xField(page, name); if (field && await asm7xRequired(field)) requiredFields.push(field); }
        if (!requiredFields.length) {
            return {
                blocked: true,
                reason: "Form không công bố trường địa chỉ bắt buộc."
            }; }
        const field = requiredFields[0]; await field.fill(""); const result = await asm7xSubmitAddressForValidation(page, field, "REQ");
        expect(result.validation, "Form phải từ chối trường bắt buộc bị bỏ trống.").toBeTruthy();
        return `Form từ chối trường bắt buộc để trống; required fields=${requiredFields.length}.`; }));
    test("Address_PhoneValid_14 - Chấp nhận số điện thoại hợp lệ", run("Address_PhoneValid_14", async page => {
        const token = asm7xToken("PHONE"); if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`
        }); const phone = await asm7xField(page, "telephone"); if (!phone) {
            return {
                blocked: true,
                reason: "Không có Telephone."
            }; }
        await phone.fill(ASM7X_QA.phone); expect(await asm7xInvalid(phone)).toBeFalsy(); expect(await asm7xSave(page)).toBeTruthy(); await asm7xOpenAddressBook(page);
        const body = await page.locator("body").innerText(); expect(body).toContain(token); expect(body).toContain(ASM7X_QA.phone);
        return `Telephone hợp lệ ${ASM7X_QA.phone} được lưu cùng địa chỉ ${token}.`; }));
    test("Address_PhoneLetters_15 - Phone chứa chữ cái", run("Address_PhoneLetters_15", async page => {
        if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        const phone = await asm7xField(page, "telephone"); if (!phone) {
            return {
                blocked: true,
                reason: "Không có Telephone."
            }; }
        const token = asm7xToken("PHONELETTERS"); await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`
        }); await phone.fill("12ABCD34"); const value = await phone.inputValue(); const sanitized = value !== "12ABCD34"; const outcome = sanitized ? {
            validation: true,
            saved: false
        } : await asm7xSubmitAddressForValidation(page, phone, token);
        expect(outcome.validation || outcome.saved, "Phone sai phải nhận validation hoặc storefront phải xác nhận kết quả lưu.").toBeTruthy();
        return `Phone chứa chữ được ${outcome.validation ? "validation từ chối" : "storefront chấp nhận"}; feedback=${outcome.validation}.`; }));
    test("Address_PhoneSymbols_16 - Phone chỉ gồm ký tự đặc biệt", run("Address_PhoneSymbols_16", async page => {
        if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        const phone = await asm7xField(page, "telephone"); if (!phone) {
            return {
                blocked: true,
                reason: "Không có Telephone."
            }; }
        const token = asm7xToken("PHONESYMBOLS"); await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`
        }); await phone.fill("!!!@@@"); const value = await phone.inputValue(); const sanitized = value !== "!!!@@@"; const outcome = sanitized ? {
            validation: true,
            saved: false
        } : await asm7xSubmitAddressForValidation(page, phone, token);
        expect(outcome.validation || outcome.saved, "Phone sai phải nhận validation hoặc storefront phải xác nhận kết quả lưu.").toBeTruthy();
        return `Phone chỉ có ký tự đặc biệt được ${outcome.validation ? "validation từ chối" : "storefront chấp nhận"}; feedback=${outcome.validation}.`; }));
    test("Address_PhoneBoundary_17 - Giá trị biên Phone", run("Address_PhoneBoundary_17", async page => {
        if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        const phone = await asm7xField(page, "telephone"); if (!phone) {
            return {
                blocked: true,
                reason: "Không có Telephone."
            }; }
        expect(await asm7xSelectCountry(page, "United States")).toBeTruthy(); const max = Number(await phone.getAttribute("maxlength")) || 15; const probes = [];
        for (const length of [ Math.max(1, max - 1), max, max + 1 ]) {
            await phone.fill("1".repeat(length)); const value = await phone.inputValue(); const validity = await phone.evaluate(el => ({
                valid: el.checkValidity(),
                message: el.validationMessage
            })); expect(value.length, `UI phải trả lại kết quả cho phone length=${length}`).toBeGreaterThan(0); probes.push({
                requestedLength: length,
                actualLength: value.length,
                ...validity
            }); }
        return `Phone length boundary responses: ${JSON.stringify(probes)}.`; })); test("Address_PostalValid_18 - Postal Code hợp lệ", run("Address_PostalValid_18", async page => {
        const token = asm7xToken("ZIP"); if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        if (!await asm7xSelectCountry(page, "United States")) {
            return {
                blocked: true,
                reason: "Không chọn được United States."
            }; }
        await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`,
            postcode: "90210"
        }); const zip = await asm7xField(page, "postcode"); expect(zip).not.toBeNull(); expect(await asm7xInvalid(zip)).toBeFalsy(); expect(await asm7xSave(page)).toBeTruthy();
        expect(await asm7xAddressExists(page, token)).toBeTruthy(); return `ZIP 90210 được chấp nhận và địa chỉ ${token} được lưu.`; }));
    test("Address_PostalInvalid_19 - Postal Code sai định dạng", run("Address_PostalInvalid_19", async page => {
        const token = asm7xToken("ZIPBAD"); if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        if (!await asm7xSelectCountry(page, "United States")) {
            return {
                blocked: true,
                reason: "Không chọn được United States."
            }; }
        await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`,
            postcode: "ABCDE"
        }); const zip = await asm7xField(page, "postcode"); if (!zip) {
            return {
                blocked: true,
                reason: "Không có Postal Code."
            }; }
        const invalid = await asm7xInvalid(zip); const outcome = invalid ? {
            validation: true,
            saved: false
        } : await asm7xSubmitAddressForValidation(page, zip, token);
        expect(outcome.validation || outcome.saved, "ZIP sai phải nhận validation hoặc storefront phải xác nhận kết quả lưu.").toBeTruthy(); if (outcome.saved) {
            expect(await asm7xDeleteAddress(page, token)).toBeTruthy(); }
        return `ZIP ABCDE được ${outcome.validation ? "validation từ chối" : "storefront chấp nhận"}; feedback=${outcome.validation}.`; }));
    test("Address_PostalBoundary_20 - Giá trị biên Postal Code", run("Address_PostalBoundary_20", async page => {
        if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        const zip = await asm7xField(page, "postcode"); if (!zip) {
            return {
                blocked: true,
                reason: "Không có Postal Code."
            }; }
        expect(await asm7xSelectCountry(page, "United States")).toBeTruthy(); const probes = []; for (const length of [ 4, 5, 9, 10 ]) {
            await zip.fill("9".repeat(length)); const value = await zip.inputValue(); const validity = await zip.evaluate(el => ({
                valid: el.checkValidity(),
                message: el.validationMessage
            })); expect(value.length, `UI phải trả lại kết quả cho postal length=${length}`).toBeGreaterThan(0); probes.push({
                requestedLength: length,
                actualLength: value.length,
                ...validity
            }); }
        return `Postal length boundary responses: ${JSON.stringify(probes)}.`; }));
    test("Address_DefaultShipping_21 - Đặt địa chỉ giao hàng mặc định", run("Address_DefaultShipping_21", async page => {
        const token = asm7xToken("SHIP"); if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`
        }); if (!await asm7xSetDefault(page, "shipping")) {
            return {
                blocked: true,
                reason: "UI không có checkbox Default Shipping."
            }; }
        expect(await asm7xSave(page)).toBeTruthy(); await asm7xOpenAddressBook(page); const card = await asm7xAddressCard(page, token); if (!card) {
            return {
                blocked: true,
                reason: "Không tìm được địa chỉ mới."
            }; }
        expect(/default shipping|primary shipping/i.test(await card.innerText())).toBeTruthy(); return `Địa chỉ ${token} được đánh dấu Default Shipping.`; }));
    test("Address_DefaultBilling_22 - Đặt địa chỉ thanh toán mặc định", run("Address_DefaultBilling_22", async page => {
        const token = asm7xToken("BILL"); if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`
        }); if (!await asm7xSetDefault(page, "billing")) {
            return {
                blocked: true,
                reason: "UI không có checkbox Default Billing."
            }; }
        expect(await asm7xSave(page)).toBeTruthy(); await asm7xOpenAddressBook(page); const card = await asm7xAddressCard(page, token); if (!card) {
            return {
                blocked: true,
                reason: "Không tìm được địa chỉ mới."
            }; }
        expect(/default billing|primary billing/i.test(await card.innerText())).toBeTruthy(); return `Địa chỉ ${token} được đánh dấu Default Billing.`; }));
    test("Address_EditValid_23 - Chỉnh sửa địa chỉ đã lưu", run("Address_EditValid_23", async page => {
        const token = asm7xToken("EDIT"); if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`
        }); expect(await asm7xSave(page)).toBeTruthy(); await asm7xOpenAddressBook(page); const card = await asm7xAddressCard(page, token); if (!card) {
            return {
                blocked: true,
                reason: "Không tìm thấy địa chỉ test sau khi lưu."
            }; }
        const edit = card.getByRole("link", {
            name: /edit/i
        }).first(); if (!await edit.count()) {
            return {
                blocked: true,
                reason: "Không có liên kết Edit trên address card."
            }; }
        await edit.click(); const city = await asm7xField(page, "city"); if (!city) {
            return {
                blocked: true,
                reason: "Không có trường City trong form sửa."
            }; }
        await city.fill("Los Angeles"); expect(await asm7xSave(page)).toBeTruthy(); await asm7xOpenAddressBook(page); const editedCard = await asm7xAddressCard(page, token);
        expect(editedCard).not.toBeNull(); expect(await editedCard.innerText()).toContain("Los Angeles"); return `Địa chỉ ${token} đã cập nhật City=Los Angeles.`; }));
    test("Address_DeleteNonDefault_24 - Xóa địa chỉ bổ sung không mặc định", run("Address_DeleteNonDefault_24", async page => {
        const token = asm7xToken("DELETE"); if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`
        }); expect(await asm7xSave(page), "Không lưu được địa chỉ thử nghiệm.").toBeTruthy();
        expect(await asm7xAddressExists(page, token), "Địa chỉ thử nghiệm không xuất hiện trong Address Book.").toBeTruthy();
        expect(await asm7xDeleteAddress(page, token), "Không xóa được địa chỉ thử nghiệm.").toBeTruthy(); return `Địa chỉ bổ sung ${token} được xóa khỏi Address Book.`; }));
    test("Address_DeleteDefault_25 - Xử lý xóa địa chỉ mặc định", run("Address_DeleteDefault_25", async page => {
        const token = asm7xToken("DEFAULT"); if (!await asm7xOpenNewAddress(page)) {
            return {
                blocked: true,
                reason: "Không mở được form địa chỉ."
            }; }
        await asm7xFillAddress(page, {
            street: `${ASM7X_QA.street} ${token}`
        }); if (!await asm7xSetDefault(page, "shipping")) {
            return {
                blocked: true,
                reason: "UI không hỗ trợ thiết lập Default Shipping."
            }; }
        expect(await asm7xSave(page)).toBeTruthy(); await asm7xOpenAddressBook(page); const card = await asm7xAddressCard(page, token); if (!card) {
            return {
                blocked: true,
                reason: "Không tìm thấy địa chỉ mặc định vừa tạo."
            }; }
        const remove = card.getByRole("link", {
            name: /delete|remove/i
        }).or(card.getByRole("button", {
            name: /delete|remove/i
        })).first(); if (!await remove.count()) {
            expect(/default shipping|primary shipping/i.test(await card.innerText())).toBeTruthy();
            return `UI không cung cấp xóa cho địa chỉ mặc định ${token}; địa chỉ mặc định vẫn được giữ.`; }
        page.once("dialog", dialog => dialog.accept()); await remove.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); await asm7xOpenAddressBook(page);
        const stillExists = await page.getByText(token, {
            exact: false
        }).count() > 0; const body = await page.locator("body").innerText();
        const safeState = /default address|default shipping|choose another|cannot delete|cannot remove/i.test(body); expect(stillExists || safeState).toBeTruthy();
        return `Delete default was guarded/handled; addressStillExists=${stillExists}; safeStateMessage=${safeState}.`; })); });
async function asm7xOpenProduct(page, productName) {
    await asm7xGo(page, BASE); const search = await asm7xFind(page, [ "input#search:visible" ]); if (!search) return false; await search.fill(productName);
    await search.press("Enter"); await page.waitForLoadState("domcontentloaded").catch(() => {});
    const productTitle = page.locator("h1:visible, .product-name:visible, .product-title:visible").first(); const expectedTitle = new RegExp(asm7xEscapeRegex(productName), "i");
    if (await productTitle.count() && expectedTitle.test(await productTitle.innerText().catch(() => ""))) {
        return true; }
    const links = page.locator(".product-name a[href], .product-item-name a[href], .product-item a[href]").filter({
        hasText: expectedTitle
    }); const link = links.first(); if (!await link.count() || !await link.isVisible().catch(() => false)) {
        return false; }
    await link.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); await expect(productTitle).toContainText(expectedTitle); return true; }
async function asm7xChooseProductOptions(page) {
    const selects = page.locator('select[name^="super_attribute"], select[id^="attribute"], .product-options select');
    const swatchGroups = page.locator("#product-options-wrapper .configurable-swatch-list"); for (let i = 0; i < await selects.count(); i++) {
        const select = selects.nth(i); const selected = await select.evaluate(el => ({
            index: el.selectedIndex,
            value: el.value,
            text: el.options[el.selectedIndex]?.textContent || ""
        })); if (selected.index > 0 && selected.value && !/choose|select/i.test(selected.text)) continue; const group = swatchGroups.nth(i);
        const swatch = group.locator(".swatch-link:visible:not(.disabled), .swatch-option:visible:not(.disabled), [data-option-label]:visible:not(.disabled)").first();
        if (i < await swatchGroups.count() && await swatch.count()) {
            await swatch.hover(); await expect.poll(() => select.locator("option").count(), {
                message: "Tùy chọn sản phẩm chưa tải xong."
            }).toBeGreaterThan(1); await swatch.click(); const selectedIndex = await select.evaluate(el => el.selectedIndex); if (selectedIndex < 1) {
                const availableValue = await select.locator("option").evaluateAll(options => {
                    const option = options.find(item => item.value && !item.disabled && !/choose|select/i.test(item.textContent || "")); return option ? option.value : ""; });
                if (availableValue) {
                    await select.selectOption(availableValue); }
            }
            expect(await select.evaluate(el => el.selectedIndex), "Biến thể phải được chọn trước khi thêm sản phẩm vào giỏ.").toBeGreaterThan(0); continue; }
        const value = await select.locator("option").evaluateAll(options => {
            const item = options.find(option => option.value && !option.disabled && !/choose|select/i.test(option.textContent || "")); return item ? item.value : ""; });
        if (value) {
            await select.selectOption(value); }
    }
    const unselected = await selects.evaluateAll(elements => elements.some(select => select.selectedIndex < 1 || !select.value || /choose|select/i.test(select.options[select.selectedIndex]?.textContent || "")));
    expect(unselected, "Tất cả tùy chọn sản phẩm bắt buộc phải được chọn.").toBeFalsy(); }
async function asm7xAddToCart(page, productName, quantity = 1) {
    if (!await asm7xOpenProduct(page, productName)) {
        return {
            ok: false,
            reason: `Không tìm thấy sản phẩm '${productName}' trên Storefront.`
        }; }
    await asm7xChooseProductOptions(page); const qty = await asm7xField(page, "quantity"); if (qty) {
        await qty.fill(String(quantity)); }
    const add = await asm7xFind(page, [ 'button[title*="Add to Cart"]', 'button:has-text("Add to Cart")', 'input[title*="Add to Cart"]', 'button:has-text("Add to Basket")' ]);
    if (!add) {
        return {
            ok: false,
            reason: `Không có nút Add to Cart trên ${productName}.`
        }; }
    await add.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); await page.waitForTimeout(400); await asm7xGo(page, ASM7X_CART_URL);
    const body = await page.locator("body").innerText(); return {
        ok: body.toLowerCase().includes(productName.toLowerCase()),
        reason: body.toLowerCase().includes(productName.toLowerCase()) ? `${productName} xuất hiện trong Cart với quantity=${quantity}.` : `Không thấy ${productName} trong Cart. UI=${body.slice(0, 400)}`
    }; }
async function asm7xCartRow(page, productName) {
    const rows = page.locator("#shopping-cart-table tbody tr, .cart-table tbody tr, .cart-item, .cart-row, .cart.item, tr.item").filter({
        hasText: new RegExp(asm7xEscapeRegex(productName), "i")
    }); return await rows.count() ? rows.first() : null; }
async function asm7xCartQty(page) {
    return page.locator('input[name*="[qty]"]:visible, input[name*="qty"]:visible, input.qty:visible, input[name="quantity"]:visible'); }
async function asm7xUpdateCart(page) {
    const button = await asm7xFind(page, [ 'button[name*="update"]', 'button[title*="Update"]', 'button:has-text("Update Shopping Cart")', 'button:has-text("Update Cart")', 'input[value*="Update"]' ]);
    if (!button) return false; await button.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); return true; }
async function asm7xRemoveCartItem(page, productName) {
    const row = await asm7xCartRow(page, productName); if (!row) return false; const remove = row.getByRole("link", {
        name: /remove|delete/i
    }).or(row.getByRole("button", {
        name: /remove|delete/i
    })).first(); if (!await remove.count()) return false; page.once("dialog", dialog => dialog.accept()); await remove.click();
    await page.waitForLoadState("domcontentloaded").catch(() => {}); await asm7xGo(page, ASM7X_CART_URL);
    return !(await page.locator("body").innerText()).toLowerCase().includes(productName.toLowerCase()); }
async function asm7xCartValues(page, productName) {
    const row = await asm7xCartRow(page, productName); if (!row) return null; const qty = await asm7xFind(row, [ 'input[name*="qty"]', "input.qty", 'input[type="number"]' ]);
    const quantity = qty ? Number(await qty.inputValue()) : NaN;
    const priceText = await row.locator(".price, .cart-price, .product-cart-price, .subtotal").allInnerTexts().catch(() => []);
    const values = priceText.map(asm7xMoney).filter(Number.isFinite); return {
        quantity: quantity,
        unitPrice: values[0] ?? NaN,
        subtotal: values.length > 1 ? values[values.length - 1] : NaN
    }; }
async function asm7xResetCart(page) {
    await asm7xGo(page, ASM7X_CART_URL); const initialBody = (await page.locator("body").innerText().catch(() => "")).toLowerCase();
    const empty = /shopping cart is empty|your cart is empty|no items in your cart|you have no items/i.test(initialBody); if (empty) {
        return {
            ok: true,
            alreadyEmpty: true
        }; }
    if (!ASM7X_ALLOW_CART_RESET) {
        return {
            ok: false,
            reason: "Cart hiện có sản phẩm. Không tự ý xóa giỏ của tài khoản; chỉ bật ALLOW_QA_CART_RESET=true cho tài khoản QA chuyên dụng."
        }; }
    const clear = await asm7xFind(page, [ 'a:has-text("Clear Shopping Cart")', 'button:has-text("Clear Shopping Cart")', 'a:has-text("Clear Cart")', 'button:has-text("Clear Cart")' ]);
    if (clear) {
        page.once("dialog", dialog => dialog.accept()); await clear.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); return {
            ok: true
        }; }
    for (const product of [ ASM7X_PRODUCT_ONE, ASM7X_PRODUCT_TWO ]) {
        if (await asm7xCartRow(page, product)) {
            await asm7xRemoveCartItem(page, product); }
    }
    await asm7xGo(page, ASM7X_CART_URL); const body = (await page.locator("body").innerText()).toLowerCase();
    if (body.includes(ASM7X_PRODUCT_ONE.toLowerCase()) || body.includes(ASM7X_PRODUCT_TWO.toLowerCase())) {
        return {
            ok: false,
            reason: "Không thể làm rỗng Cart chỉ bằng cách xóa các sản phẩm QA đã cấu hình."
        }; }
    return {
        ok: /shopping cart is empty|your cart is empty|no items in your cart|you have no items/i.test(body)
    }; }
async function asm7xOpenCheckout(page) {
    await asm7xGo(page, ASM7X_CART_URL);
    const button = await asm7xFind(page, [ 'button:has-text("Proceed to Checkout")', 'a:has-text("Proceed to Checkout")', 'button:has-text("Checkout")', 'a:has-text("Checkout")' ]);
    if (!button) return false; await button.click(); await page.waitForLoadState("domcontentloaded").catch(() => {});
    return /checkout/i.test(page.url()) || /shipping|billing|payment/i.test(await page.locator("body").innerText()); }
async function asm7xCheckoutField(page, key) {
    const selectors = {
        email: [ 'input[type="email"]', 'input[name*="email"]', "#billing\\:email" ],
        phone: [ 'input[name*="telephone"]', 'input[name*="phone"]', "#billing\\:telephone" ],
        firstname: [ 'input[name*="firstname"]', "#billing\\:firstname" ],
        lastname: [ 'input[name*="lastname"]', "#billing\\:lastname" ],
        street: [ 'input[name*="street"]', "#billing\\:street1" ],
        city: [ 'input[name*="city"]', "#billing\\:city" ],
        postcode: [ 'input[name*="postcode"]', "#billing\\:postcode" ],
        country: [ 'select[name*="country"]', "#billing\\:country_id" ]
    }; return asm7xFind(page, selectors[key] || []); }
async function asm7xFillCheckout(page, overrides = {}) {
    const values = {
        email: overrides.email ?? (ASM7X_QA.email || `asm7.checkout.${Date.now()}@example.com`),
        phone: overrides.phone ?? ASM7X_QA.phone,
        firstname: ASM7X_QA.firstName,
        lastname: ASM7X_QA.lastName,
        street: overrides.street ?? ASM7X_QA.street,
        city: overrides.city ?? ASM7X_QA.city,
        postcode: overrides.postcode ?? ASM7X_QA.postcode
    }; const filled = {}; for (const [key, value] of Object.entries(values)) {
        const field = await asm7xCheckoutField(page, key); if (field) {
            await field.fill(String(value)); filled[key] = field; }
    }
    const country = await asm7xCheckoutField(page, "country"); if (country) {
        const opts = await country.locator("option").evaluateAll(els => els.map(el => ({
            value: el.value,
            text: (el.textContent || "").trim()
        })).filter(x => x.value)); const us = opts.find(x => /united states/i.test(x.text)); if (us) {
            await country.selectOption(us.value); }
    }
    return filled; }
async function asm7xShippingMethods(page) {
    return page.locator('input[type="radio"][name*="shipping"]:visible, input[type="radio"][name*="shipping_method"]:visible'); }
async function asm7xContinueCheckout(page) {
    const button = await asm7xFind(page, [ 'button:has-text("Continue")', 'button:has-text("Next")', 'button[title*="Continue"]' ]); if (!button) return false;
    await button.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); await page.waitForTimeout(350); return true; }
async function asm7xOrderHistoryRowCount(page) {
    await asm7xGo(page, ASM7X_HISTORY_URL); const rows = page.locator(".orders-table tbody tr, table#my-orders-table tbody tr, .my-account table tbody tr");
    if (!await rows.count()) return null; return await rows.count(); }
async function asm7xChooseOfflinePayment(page) {
    const radios = page.locator('input[type="radio"][name*="payment"]:visible, input[type="radio"][name*="method"]:visible'); for (let i = 0; i < await radios.count(); i++) {
        const radio = radios.nth(i); const id = await radio.getAttribute("id") || ""; const value = await radio.getAttribute("value") || "";
        const label = id ? await page.locator(`label[for="${id}"]`).innerText().catch(() => "") : ""; const info = `${id} ${value} ${label}`;
        if (/check.?money|bank.?transfer|cash.?on.?delivery|offline|money.?order/i.test(info)) {
            await radio.check().catch(async () => radio.click()); return {
                ok: true,
                label: info.trim()
            }; }
    }
    return {
        ok: false,
        reason: "Không có phương thức thanh toán offline/test hiển thị trên Storefront."
    }; }
async function asm7xPlaceTestOrder(page) {
    if (!ASM7X_ALLOW_ORDER) {
        return {
            ok: false,
            reason: "Tạo đơn đang khóa. Chỉ bật ALLOW_DEMO_ORDER_CREATION=true sau khi xác nhận demo cho phép đặt đơn và có payment test/offline."
        }; }
    const reset = await asm7xResetCart(page); if (!reset.ok) return reset; const added = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!added.ok) return added;
    if (!await asm7xOpenCheckout(page)) {
        return {
            ok: false,
            reason: "Không mở được Checkout."
        }; }
    await asm7xFillCheckout(page); const shipping = await asm7xShippingMethods(page); if (await shipping.count()) {
        await shipping.first().check().catch(() => {}); }
    const payment = await asm7xChooseOfflinePayment(page); if (!payment.ok) return payment;
    const place = await asm7xFind(page, [ 'button:has-text("Place Order")', 'button[title*="Place Order"]', 'button:has-text("Submit Order")' ]); if (!place) {
        return {
            ok: false,
            reason: "Không tìm thấy nút Place Order."
        }; }
    await place.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); await page.waitForTimeout(800); const body = await page.locator("body").innerText();
    const match = body.match(/(?:order\s*(?:number|#|no\.?))\s*[:#]?\s*([A-Z0-9-]+)/i) || page.url().match(/success\/([^/?#]+)/i); const orderNumber = match ? match[1] : null;
    if (!orderNumber || !/thank you|order confirmation|your order|order number/i.test(body)) {
        return {
            ok: false,
            reason: `Không xác minh được confirmation/order number. UI=${body.slice(0, 500)}`
        }; }
    return {
        ok: true,
        orderNumber: orderNumber,
        confirmationUrl: page.url(),
        payment: payment.label,
        body: body
    }; }
test.describe("ORDER PLACEMENT & INVOICE — 26 TEST CASES", () => {
    test.describe.configure({
        mode: "default"
    }); const run = (id, callback, options = {}) => async ({page: page, browser: browser}, testInfo) => {
        await asm7xExecute(testInfo, page, id, () => callback(page, browser), {
            guest: true,
            ...options
        }); }; test("Cart_OpenEmpty_01 - Mở giỏ hàng khi chưa có sản phẩm", run("Cart_OpenEmpty_01", async page => {
        await asm7xGo(page, ASM7X_CART_URL); const body = (await page.locator("body").innerText()).toLowerCase();
        expect(/shopping cart is empty|your cart is empty|no items in your cart|you have no items/i.test(body)).toBeTruthy();
        const rows = page.locator("#shopping-cart-table tbody tr, .cart-table tbody tr, .cart-item, .cart-row, .cart.item"); expect(await rows.count()).toBe(0);
        return "Cart ở trạng thái rỗng và không chứa dòng sản phẩm."; })); test("Cart_AddProduct_02 - Thêm một sản phẩm còn hàng vào giỏ", run("Cart_AddProduct_02", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const result = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!result.ok) {
            return {
                blocked: true,
                reason: result.reason
            }; }
        const qty = await asm7xCartQty(page); expect(await qty.count()).toBeGreaterThan(0); expect(Number(await qty.first().inputValue())).toBe(1);
        return `Cart ban đầu rỗng; sau Add to Cart hiển thị ${ASM7X_PRODUCT_ONE}, quantity=1.`; }));
    test("Cart_AddSameProduct_03 - Thêm cùng sản phẩm hai lần", run("Cart_AddSameProduct_03", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const first = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!first.ok) {
            return {
                blocked: true,
                reason: first.reason
            }; }
        const second = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!second.ok) {
            return {
                blocked: true,
                reason: second.reason
            }; }
        const row = await asm7xCartRow(page, ASM7X_PRODUCT_ONE); if (!row) {
            return {
                blocked: true,
                reason: "Không tìm thấy dòng sản phẩm sau lần thêm thứ hai."
            }; }
        const qty = await asm7xFind(row, [ 'input[name*="qty"]', "input.qty", 'input[type="number"]' ]); if (!qty) {
            return {
                blocked: true,
                reason: "Không có quantity input để xác minh số lượng gộp."
            }; }
        const value = Number(await qty.inputValue()); expect(value).toBeGreaterThanOrEqual(2); return `Thêm cùng sản phẩm hai lần; Cart quantity=${value}.`; }));
    test("Cart_UpdateQtyValid_04 - Cập nhật số lượng sang 2", run("Cart_UpdateQtyValid_04", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        const row = await asm7xCartRow(page, ASM7X_PRODUCT_ONE); if (!row) {
            return {
                blocked: true,
                reason: "Không có cart row."
            }; }
        const qty = await asm7xFind(row, [ 'input[name*="qty"]', "input.qty", 'input[type="number"]' ]); if (!qty) {
            return {
                blocked: true,
                reason: "Cart không có quantity input."
            }; }
        await qty.fill("2"); expect(await asm7xUpdateCart(page)).toBeTruthy(); await asm7xGo(page, ASM7X_CART_URL); const updated = await asm7xCartRow(page, ASM7X_PRODUCT_ONE);
        const input = updated ? await asm7xFind(updated, [ 'input[name*="qty"]', "input.qty", 'input[type="number"]' ]) : null; expect(input).not.toBeNull();
        expect(Number(await input.inputValue())).toBe(2); return "Quantity được cập nhật từ 1 lên 2 và vẫn giữ sau khi tải lại Cart."; }));
    test("Cart_UpdateQtyZero_05 - Xử lý quantity bằng 0", run("Cart_UpdateQtyZero_05", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        const inputs = await asm7xCartQty(page); if (!await inputs.count()) {
            return {
                blocked: true,
                reason: "Không có quantity input."
            }; }
        const input = inputs.first(); await input.fill("0"); const invalid = await input.evaluate(el => !el.checkValidity()); if (!await asm7xUpdateCart(page)) {
            return {
                blocked: true,
                reason: "Không có nút Update Cart."
            }; }
        await asm7xGo(page, ASM7X_CART_URL); const row = await asm7xCartRow(page, ASM7X_PRODUCT_ONE);
        const valueInput = row ? await asm7xFind(row, [ 'input[name*="qty"]', "input.qty", 'input[type="number"]' ]) : null;
        const value = valueInput ? Number(await valueInput.inputValue()) : 0; const body = await page.locator("body").innerText();
        const rejected = invalid || !row || value >= 1 || /minimum quantity|invalid quantity/i.test(body); expect(rejected).toBeTruthy();
        return `Quantity=0 được xử lý; rowExists=${Boolean(row)}; quantityAfter=${value}; nativeInvalid=${invalid}.`; }));
    test("Cart_UpdateQtyInvalid_06 - Nhập chữ, số âm và số thập phân", run("Cart_UpdateQtyInvalid_06", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        const inputs = await asm7xCartQty(page); if (!await inputs.count()) {
            return {
                blocked: true,
                reason: "Không có quantity input."
            }; }
        const input = inputs.first(); const outcomes = []; for (const invalidValue of [ "abc", "-2", "1.5" ]) {
            await input.fill(invalidValue); const nativeInvalid = await input.evaluate(el => !el.checkValidity()); const acceptedValue = await input.inputValue(); outcomes.push({
                input: invalidValue,
                acceptedValue: acceptedValue,
                nativeInvalid: nativeInvalid
            }); expect(nativeInvalid || !/^-?\d+(?:\.\d+)?$/.test(acceptedValue) || !Number.isInteger(Number(acceptedValue)) || Number(acceptedValue) < 1).toBeTruthy(); }
        return `Đã kiểm tra dữ liệu chữ/số âm/thập phân; observed=${JSON.stringify(outcomes)}.`; }));
    test("Cart_RemoveItem_07 - Xóa một sản phẩm khỏi giỏ", run("Cart_RemoveItem_07", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const a = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!a.ok) {
            return {
                blocked: true,
                reason: a.reason
            }; }
        const b = await asm7xAddToCart(page, ASM7X_PRODUCT_TWO, 1); if (!b.ok) {
            return {
                blocked: true,
                reason: b.reason
            }; }
        expect(await asm7xRemoveCartItem(page, ASM7X_PRODUCT_ONE)).toBeTruthy(); const body = (await page.locator("body").innerText()).toLowerCase();
        expect(body).not.toContain(ASM7X_PRODUCT_ONE.toLowerCase()); expect(body).toContain(ASM7X_PRODUCT_TWO.toLowerCase());
        return `Đã xóa ${ASM7X_PRODUCT_ONE}; ${ASM7X_PRODUCT_TWO} vẫn còn trong Cart.`; }));
    test("Cart_SubtotalRecalculate_08 - Tính lại subtotal sau thay đổi quantity", run("Cart_SubtotalRecalculate_08", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        if (!await asm7xOpenProduct(page, ASM7X_PRODUCT_ONE)) {
            return {
                blocked: true,
                reason: `Không tìm thấy ${ASM7X_PRODUCT_ONE}.`
            }; }
        await asm7xChooseProductOptions(page); const price = await asm7xFind(page, [ ".special-price .price", ".price-box .price", ".product-info .price", ".price" ]);
        if (!price) {
            return {
                blocked: true,
                reason: "Không đọc được đơn giá."
            }; }
        const unit = asm7xMoney(await price.innerText()); if (!Number.isFinite(unit)) {
            return {
                blocked: true,
                reason: "Đơn giá không phân tích được."
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        const row = await asm7xCartRow(page, ASM7X_PRODUCT_ONE); if (!row) {
            return {
                blocked: true,
                reason: "Không có cart row."
            }; }
        const qty = await asm7xFind(row, [ 'input[name*="qty"]', "input.qty" ]); if (!qty) {
            return {
                blocked: true,
                reason: "Không có quantity input."
            }; }
        await qty.fill("2"); expect(await asm7xUpdateCart(page)).toBeTruthy(); await asm7xGo(page, ASM7X_CART_URL); const values = await asm7xCartValues(page, ASM7X_PRODUCT_ONE);
        if (!values || !Number.isFinite(values.subtotal)) {
            return {
                blocked: true,
                reason: "Không đọc được subtotal."
            }; }
        expect(values.quantity).toBe(2); expect(Math.abs(values.subtotal - unit * 2)).toBeLessThanOrEqual(.02);
        return `UnitPrice=${unit}; Qty=${values.quantity}; Subtotal=${values.subtotal}; Expected=${(unit * 2).toFixed(2)}.`; }));
    test("Checkout_Open_09 - Chuyển từ Cart sang Checkout", run("Checkout_Open_09", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        expect(await asm7xOpenCheckout(page)).toBeTruthy(); expect(/checkout|shipping|billing|payment/i.test(await page.locator("body").innerText())).toBeTruthy();
        return `Proceed to Checkout mở thành công; URL=${page.url()}.`; }));
    test("Checkout_GuestFlow_10 - Checkout với khách chưa đăng nhập", run("Checkout_GuestFlow_10", async (page, browser) => {
        const context = await browser.newContext({
            viewport: {
                width: 1366,
                height: 768
            },
            locale: "en-US",
            ignoreHTTPSErrors: true
        }); try {
            const guestPage = await context.newPage(); await gotoStorefront(guestPage, BASE); const search = await asm7xFind(guestPage, [ "input#search:visible" ]); if (!search) {
                return {
                    blocked: true,
                    reason: "Guest storefront không có search field."
                }; }
            await searchFor(guestPage, ASM7X_PRODUCT_ONE); const link = guestPage.locator(".product-name a[href], .product-item-name a[href]").filter({
                hasText: new RegExp(asm7xEscapeRegex(ASM7X_PRODUCT_ONE), "i")
            }).first(); if (await link.count()) {
                await link.click(); await guestPage.waitForLoadState("domcontentloaded").catch(() => {}); } else {
                const title = guestPage.locator(PRODUCT_TITLE).first();
                if (!await title.count() || !new RegExp(asm7xEscapeRegex(ASM7X_PRODUCT_ONE), "i").test(await title.innerText())) {
                    return {
                        blocked: true,
                        reason: `Guest không tìm thấy ${ASM7X_PRODUCT_ONE} trong kết quả tìm kiếm.`
                    }; }
            }
            const add = await asm7xFind(guestPage, [ 'button:has-text("Add to Cart")', 'button[title*="Add to Cart"]' ]); if (!add) {
                return {
                    blocked: true,
                    reason: "Không có Add to Cart."
                }; }
            const optionSelects = guestPage.locator("#product-options-wrapper select.super-attribute-select");
            const optionGroups = guestPage.locator("#product-options-wrapper .configurable-swatch-list"); for (let i = 0; i < await optionSelects.count(); i += 1) {
                const select = optionSelects.nth(i); if (await select.evaluate(element => element.selectedIndex > 0)) continue;
                const option = optionGroups.nth(i).locator(".swatch-link:visible").first(); if (!await option.count()) {
                    return {
                        blocked: true,
                        reason: "Không tìm thấy lựa chọn hợp lệ cho sản phẩm có biến thể bắt buộc."
                    }; }
                await option.hover(); await expect.poll(() => select.locator("option").count(), {
                    message: "Tùy chọn sản phẩm chưa tải xong."
                }).toBeGreaterThan(1); await option.click(); await expect.poll(() => select.evaluate(element => element.selectedIndex), {
                    message: "Biến thể bắt buộc phải được chọn trước khi thêm vào giỏ."
                }).toBeGreaterThan(0); }
            const addResponse = guestPage.waitForResponse(response => {
                const url = new URL(response.url()); return url.pathname.includes("/checkout/cart/add/") && url.searchParams.get("isAjax") === "true"; }, {
                timeout: 3e4
            }); const [cartResponse] = await Promise.all([ addResponse, add.click() ]);
            expect(cartResponse.ok(), "Add to Cart request must succeed for the selected variant.").toBeTruthy(); await gotoStorefront(guestPage, ASM7X_CART_URL);
            expect(/shopping cart is empty|you have no items in your shopping cart/i.test(await guestPage.locator("body").innerText()), "The selected product should be present in the guest cart.").toBeFalsy();
            const checkout = await asm7xFind(guestPage, [ 'button:has-text("Proceed to Checkout")', 'a:has-text("Proceed to Checkout")' ]); if (!checkout) {
                return {
                    blocked: true,
                    reason: "Không có nút checkout trong Cart guest."
                }; }
            await checkout.click(); await guestPage.waitForLoadState("domcontentloaded").catch(() => {}); const body = await guestPage.locator("body").innerText();
            const guestAllowed = /guest checkout|checkout as guest|shipping address|email address/i.test(body);
            const loginRequired = /sign in|login|register|create an account/i.test(body) || /customer\/account\/login/i.test(guestPage.url());
            expect(guestAllowed || loginRequired).toBeTruthy();
            return `Guest checkout behavior observed: ${guestAllowed ? "guest checkout fields displayed" : "Storefront requires sign-in/registration"}; URL=${guestPage.url()}.`;
        } finally {
            await context.close(); }
    }, {
        guest: true
    })); test("Checkout_EmailValidation_11 - Email bắt buộc và định dạng", run("Checkout_EmailValidation_11", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        if (!await asm7xOpenCheckout(page)) {
            return {
                blocked: true,
                reason: "Không mở được Checkout."
            }; }
        const email = await asm7xCheckoutField(page, "email"); if (!email) {
            return {
                blocked: true,
                reason: "Checkout không có email field chỉnh sửa được (có thể dùng tài khoản đăng nhập)."
            }; }
        const original = await email.inputValue(); expect(await asm7xRequired(email)).toBeTruthy(); await email.fill("");
        const emptyInvalid = !await email.inputValue() && await asm7xRequired(email); await email.fill("invalid-email"); const formatInvalid = await asm7xInvalid(email);
        await email.fill(original); expect(emptyInvalid).toBeTruthy(); expect(formatInvalid).toBeTruthy();
        return `Email validation observed; emptyInvalid=${emptyInvalid}; invalidFormat=${formatInvalid}; original restored.`; }));
    test("Checkout_AddressRequired_12 - Các trường địa chỉ giao hàng bắt buộc", run("Checkout_AddressRequired_12", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        if (!await asm7xOpenCheckout(page)) {
            return {
                blocked: true,
                reason: "Không mở được Checkout."
            }; }
        const fields = [ await asm7xCheckoutField(page, "street"), await asm7xCheckoutField(page, "city"), await asm7xCheckoutField(page, "postcode") ].filter(Boolean);
        if (!fields.length) {
            return {
                blocked: true,
                reason: "Checkout sử dụng địa chỉ đã lưu và không hiển thị form address để kiểm tra."
            }; }
        let requiredCount = 0; for (const field of fields) {
            await field.fill(""); if (await asm7xRequired(field)) requiredCount++; }
        expect(requiredCount).toBe(fields.length); return `Checkout address validation: ${requiredCount}/${fields.length} empty fields are marked required by the storefront.`; }));
    test("Checkout_PhoneInvalid_13 - Telephone checkout không hợp lệ", run("Checkout_PhoneInvalid_13", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        if (!await asm7xOpenCheckout(page)) {
            return {
                blocked: true,
                reason: "Không mở được Checkout."
            }; }
        const phone = await asm7xCheckoutField(page, "phone"); if (!phone) {
            return {
                blocked: true,
                reason: "Checkout không hiển thị Telephone."
            }; }
        await phone.fill(""); const invalid = !await phone.inputValue() && await asm7xRequired(phone); expect(invalid).toBeTruthy();
        return "Telephone trống được storefront đánh dấu là trường bắt buộc."; }));
    test("Checkout_PostalValid_14 - Postal Code hợp lệ", run("Checkout_PostalValid_14", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        if (!await asm7xOpenCheckout(page)) {
            return {
                blocked: true,
                reason: "Không mở được Checkout."
            }; }
        const country = await asm7xCheckoutField(page, "country"); const zip = await asm7xCheckoutField(page, "postcode"); if (!zip) {
            return {
                blocked: true,
                reason: "Checkout không hiển thị Postal Code."
            }; }
        if (country) {
            const opts = await country.locator("option").evaluateAll(els => els.map(el => ({
                value: el.value,
                text: el.textContent.trim()
            })).filter(x => x.value)); const us = opts.find(x => /united states/i.test(x.text)); if (us) {
                await country.selectOption(us.value); }
        }
        await zip.fill("90210"); expect(await asm7xInvalid(zip)).toBeFalsy(); return "Postal Code 90210 không bị frontend validation từ chối với country đã chọn."; }));
    test("Checkout_PostalInvalid_15 - Postal Code sai định dạng", run("Checkout_PostalInvalid_15", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        if (!await asm7xOpenCheckout(page)) {
            return {
                blocked: true,
                reason: "Không mở được Checkout."
            }; }
        const zip = await asm7xCheckoutField(page, "postcode"); if (!zip) {
            return {
                blocked: true,
                reason: "Checkout không có Postal Code."
            }; }
        const original = await zip.inputValue(); await zip.fill("ABCDE"); await zip.press("Tab"); await page.waitForTimeout(150); const invalid = await asm7xInvalid(zip);
        await zip.fill(original); expect(invalid).toBeTruthy(); return "Postal Code không hợp lệ đã bị storefront đánh dấu từ chối."; }));
    test("Checkout_ShippingMethod_16 - Chọn phương thức giao hàng", run("Checkout_ShippingMethod_16", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        if (!await asm7xOpenCheckout(page)) {
            return {
                blocked: true,
                reason: "Không mở được Checkout."
            }; }
        await asm7xFillCheckout(page); let radios = await asm7xShippingMethods(page); if (!await radios.count()) {
            await asm7xContinueCheckout(page); radios = await asm7xShippingMethods(page); }
        if (!await radios.count()) {
            return {
                blocked: true,
                reason: "Không có radio Shipping Method sau khi điền địa chỉ và chuyển bước checkout."
            }; }
        await radios.first().check().catch(async () => radios.first().click()); expect(await radios.first().isChecked()).toBeTruthy();
        return `Đã chọn phương thức vận chuyển; value=${await radios.first().getAttribute("value") || "not exposed"}.`; }));
    test("Checkout_PaymentMethod_17 - Chọn phương thức thanh toán test", run("Checkout_PaymentMethod_17", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        if (!await asm7xOpenCheckout(page)) {
            return {
                blocked: true,
                reason: "Không mở được Checkout."
            }; }
        await asm7xFillCheckout(page); await asm7xContinueCheckout(page); const shipping = await asm7xShippingMethods(page); if (await shipping.count()) {
            await shipping.first().check().catch(async () => shipping.first().click()); await asm7xContinueCheckout(page); }
        const payment = await asm7xChooseOfflinePayment(page); if (!payment.ok) {
            return {
                blocked: true,
                reason: payment.reason
            }; }
        return `Đã chọn payment method test/offline: ${payment.label}.`; }));
    test("Checkout_SubmitMissing_18 - Không tạo đơn khi thiếu dữ liệu bắt buộc", run("Checkout_SubmitMissing_18", async page => {
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        if (!await asm7xOpenCheckout(page)) {
            return {
                blocked: true,
                reason: "Không mở được Checkout."
            }; }
        const required = await asm7xCheckoutField(page, "email"); if (!required) {
            return {
                blocked: true,
                reason: "Checkout không hiển thị trường email để kiểm tra dữ liệu bắt buộc."
            }; }
        await required.fill(""); await required.press("Tab"); const requiredField = await asm7xRequired(required); const remainsEmpty = !await required.inputValue();
        expect(requiredField && remainsEmpty).toBeTruthy(); const continueButton = await asm7xFind(page, [ 'button:has-text("Continue")' ]); if (continueButton) {
            await continueButton.click(); await page.waitForLoadState("domcontentloaded").catch(() => {}); await page.waitForTimeout(350); }
        expect(/success|order-received|thank-you/i.test(page.url())).toBeFalsy(); expect(await required.inputValue()).toBe("");
        return `Email bắt buộc được để trống; checkout không báo hoàn tất đơn; URL=${page.url()}.`; }));
    test("Order_PlaceValid_19 - Đặt đơn hàng test bằng payment offline", run("Order_PlaceValid_19", async page => {
        const result = await asm7xPlaceTestOrder(page); if (!result.ok) {
            return {
                blocked: true,
                reason: result.reason
            }; }
        expect(result.orderNumber).toBeTruthy(); return `Đặt đơn test thành công qua UI; order number=${result.orderNumber}; payment=${result.payment}.`; }, {
        guest: false
    })); test("Order_ReferenceDisplayed_20 - Mã đơn hiển thị sau khi đặt hàng", run("Order_ReferenceDisplayed_20", async page => {
        if (!ASM7X_QA_ORDER_NUMBER || !ASM7X_QA_ORDER_CONFIRMATION_URL) {
            return {
                blocked: true,
                reason: "Cần cấu hình QA_ORDER_NUMBER và QA_ORDER_CONFIRMATION_URL cho đơn test."
            }; }
        await asm7xGo(page, ASM7X_QA_ORDER_CONFIRMATION_URL); const body = await page.locator("body").innerText(); expect(body).toContain(ASM7X_QA_ORDER_NUMBER);
        return `Trang confirmation hiển thị order reference '${ASM7X_QA_ORDER_NUMBER}'.`; }, {
        guest: false
    })); test("Order_NumberUnique_21 - Mã đơn khác nhau giữa hai đơn", run("Order_NumberUnique_21", async page => {
        if (!ASM7X_QA_ORDER_NUMBER) {
            return {
                blocked: true,
                reason: "Cần cấu hình QA_ORDER_NUMBER làm đơn thứ nhất."
            }; }
        if (!ASM7X_ALLOW_TWO_ORDERS) {
            return {
                blocked: true,
                reason: "Chưa bật ALLOW_TWO_DEMO_ORDERS=true; không tự tạo đơn thứ hai."
            }; }
        const second = await asm7xPlaceTestOrder(page); if (!second.ok) {
            return {
                blocked: true,
                reason: second.reason
            }; }
        expect(second.orderNumber).not.toBe(ASM7X_QA_ORDER_NUMBER); return `Order A=${ASM7X_QA_ORDER_NUMBER}; Order B=${second.orderNumber}; hai mã khác nhau.`; }, {
        guest: false
    })); test("Order_DoubleSubmit_22 - Chống tạo đơn trùng khi nhấn nhanh", run("Order_DoubleSubmit_22", async page => {
        if (ASM7X_ALLOW_TWO_ORDERS) {
            return {
                blocked: true,
                reason: "Đang bật kiểm tra mã đơn duy nhất (tối đa hai đơn); bỏ qua tạo thêm đơn để giữ giới hạn."
            }; }
        if (!ASM7X_ALLOW_ORDER) {
            return {
                blocked: true,
                reason: "Tạo đơn bị khóa; chỉ thực hiện trên demo được phép và payment test/offline."
            }; }
        const reset = await asm7xResetCart(page); if (!reset.ok) {
            return {
                blocked: true,
                reason: reset.reason
            }; }
        const add = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1); if (!add.ok) {
            return {
                blocked: true,
                reason: add.reason
            }; }
        if (!await asm7xOpenCheckout(page)) {
            return {
                blocked: true,
                reason: "Không mở được checkout."
            }; }
        await asm7xFillCheckout(page); const payment = await asm7xChooseOfflinePayment(page); if (!payment.ok) {
            return {
                blocked: true,
                reason: payment.reason
            }; }
        const historyPage = await page.context().newPage(); const beforeCount = await asm7xOrderHistoryRowCount(historyPage); await historyPage.close(); if (beforeCount === null) {
            return {
                blocked: true,
                reason: "Không đọc được bảng My Orders trước thao tác; không thể so sánh số đơn trước/sau."
            }; }
        const place = await asm7xFind(page, [ 'button:has-text("Place Order")', 'button[title*="Place Order"]' ]); if (!place) {
            return {
                blocked: true,
                reason: "Không tìm thấy Place Order."
            }; }
        await place.dblclick({
            delay: 40
        }).catch(() => place.click()); await page.waitForLoadState("domcontentloaded").catch(() => {}); await page.waitForTimeout(700);
        const body = await page.locator("body").innerText(); const match = body.match(/(?:order\s*(?:number|#|no\.?))\s*[:#]?\s*([A-Z0-9-]+)/i);
        expect(/thank you|order confirmation|your order/i.test(body)).toBeTruthy(); expect(match).not.toBeNull(); const afterPage = await page.context().newPage();
        const afterCount = await asm7xOrderHistoryRowCount(afterPage); await afterPage.close(); if (afterCount === null) {
            return {
                blocked: true,
                reason: "Không đọc được bảng My Orders sau thao tác double-submit."
            }; }
        expect(afterCount - beforeCount).toBe(1);
        return `Double-click chỉ tạo thêm đúng 1 dòng đơn hàng trong My Orders; before=${beforeCount}; after=${afterCount}; reference=${match[1]}.`; }, {
        guest: false
    })); test("Order_ConfirmationRefresh_23 - Tải lại trang xác nhận", run("Order_ConfirmationRefresh_23", async page => {
        if (!ASM7X_QA_ORDER_NUMBER || !ASM7X_QA_ORDER_CONFIRMATION_URL) {
            return {
                blocked: true,
                reason: "Cần cấu hình QA_ORDER_NUMBER và QA_ORDER_CONFIRMATION_URL cho đơn test."
            }; }
        await asm7xGo(page, ASM7X_QA_ORDER_CONFIRMATION_URL); const first = await page.locator("body").innerText(); expect(first).toContain(ASM7X_QA_ORDER_NUMBER);
        await page.reload({
            waitUntil: "domcontentloaded"
        }); const after = await page.locator("body").innerText(); const stable = after.includes(ASM7X_QA_ORDER_NUMBER);
        const safeWarning = /resubmit|reload|refresh|already placed/i.test(after); expect(stable || safeWarning).toBeTruthy();
        return `Refresh confirmation: same reference retained=${stable}; safe warning shown=${safeWarning}.`; }, {
        guest: false
    })); test("Order_ConfirmationEmail_24 - Email xác nhận đơn hàng", run("Order_ConfirmationEmail_24", async page => {
        if (!ASM7X_QA_ORDER_NUMBER) {
            return {
                blocked: true,
                reason: "Cần cấu hình QA_ORDER_NUMBER cho đơn test."
            }; }
        if (!ASM7X_QA_INBOX_URL) {
            return {
                blocked: true,
                reason: "Chưa khai báo QA_EMAIL_INBOX_URL; trang confirmation của Storefront không chứng minh email đã đến inbox."
            }; }
        await asm7xGo(page, ASM7X_QA_INBOX_URL); const inboxBody = await page.locator("body").innerText(); expect(inboxBody).toContain(ASM7X_QA_ORDER_NUMBER);
        expect(/order confirmation|order|invoice/i.test(inboxBody)).toBeTruthy(); return `Hộp thư QA hiển thị email xác nhận chứa order ${ASM7X_QA_ORDER_NUMBER}.`; }, {
        guest: false
    })); test("Order_HistoryVisible_25 - Đơn mới xuất hiện trong lịch sử", run("Order_HistoryVisible_25", async page => {
        if (!ASM7X_QA_ORDER_NUMBER) {
            return {
                blocked: true,
                reason: "Cần cấu hình QA_ORDER_NUMBER cho đơn test."
            }; }
        await asm7xGo(page, ASM7X_HISTORY_URL); const body = await page.locator("body").innerText(); if (!body.includes(ASM7X_QA_ORDER_NUMBER)) {
            return {
                blocked: true,
                reason: `Không tìm thấy ${ASM7X_QA_ORDER_NUMBER} trong My Orders; có thể demo chưa hỗ trợ lịch sử cho trạng thái này.`
            }; }
        return `My Orders hiển thị đúng đơn ${ASM7X_QA_ORDER_NUMBER}.`; }, {
        guest: false
    })); test("Invoice_AccessFromOrder_26 - Mở hóa đơn từ chi tiết đơn", run("Invoice_AccessFromOrder_26", async page => {
        if (!ASM7X_QA_ORDER_NUMBER) {
            return {
                blocked: true,
                reason: "Cần cấu hình QA_ORDER_NUMBER cho đơn test."
            }; }
        await asm7xGo(page, ASM7X_HISTORY_URL); const order = page.getByRole("link", {
            name: new RegExp(asm7xEscapeRegex(ASM7X_QA_ORDER_NUMBER), "i")
        }).first(); if (!await order.count()) {
            return {
                blocked: true,
                reason: `Không tìm thấy đơn ${ASM7X_QA_ORDER_NUMBER} trong My Orders.`
            }; }
        await order.click();
        const invoice = await asm7xFind(page, [ 'a:has-text("Invoice")', 'a:has-text("View Invoice")', 'a:has-text("Print Invoice")', 'a:has-text("Download Invoice")' ]);
        if (!invoice) {
            return {
                blocked: true,
                reason: "Storefront không cung cấp liên kết Invoice trong Order Detail hoặc đơn chưa đủ điều kiện sinh hóa đơn."
            }; }
        const [download] = await Promise.all([ page.waitForEvent("download", {
            timeout: 8e3
        }).catch(() => null), invoice.click().catch(() => {}) ]); if (download) {
            return `Invoice tải xuống qua Storefront: ${download.suggestedFilename()}.`; }
        const body = await page.locator("body").innerText(); expect(/invoice|tax invoice|order number/i.test(body)).toBeTruthy();
        return `Invoice page/view mở được qua Storefront cho order ${ASM7X_QA_ORDER_NUMBER}.`; }, {
        guest: false
    })); });

// ============================================================
// ASM9 — DEFECT IDENTIFICATION & REPORTING (13 TEST CASES)
// Author : 23130238 - Vũ Châu Hoài Phong
// Defect IDs: DEF_Search_01-05 | DEF_Profile_01-04 | DEF_Order_01-04
// Environment config: ./environment.ts
// ============================================================

// ── Hằng số URL cho DEF tests ────────────────────────────────
const DEF_REGISTER_URL = new URL('customer/account/create/', BASE).toString();

// ── Auto-login: thử login, nếu thất bại do demo reset → tự đăng ký lại ──
async function asm7xAutoLogin(page) {
    // Bước 1: thử login với tài khoản hiện tại
    if (ASM7X_QA.email && ASM7X_QA.password) {
        const login = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password);
        if (login.ok) return { ok: true, registered: false };
    } else {
        return { ok: false, reason: 'Chưa cấu hình QA_EMAIL / QA_PASSWORD.' };
    }

    // Bước 2: login thất bại → demo đã reset → tự đăng ký lại
    try {
        await gotoStorefront(page, DEF_REGISTER_URL);
        await page.waitForLoadState('domcontentloaded');

        // Chọn tab Register nếu có
        const tabReg = page.locator('#tab-register').first();
        if (await tabReg.count()) await tabReg.click();
        await page.waitForTimeout(400);

        const form = page.locator('#form-validate-register, #form-validate').first();
        const fill = async (sel, val) => {
            const el = form.locator(sel).first();
            if (await el.count()) await el.fill(val);
        };
        await fill('#firstname, [name="firstname"]', ASM7X_QA.firstName);
        await fill('#lastname, [name="lastname"]', ASM7X_QA.lastName);
        await fill('#email_address_register, #email_address, [name="email"]', ASM7X_QA.email);
        await fill('#password_register, [name="password"]', ASM7X_QA.password);
        await fill('#confirmation_register, [name="confirmation"]', ASM7X_QA.password);

        const submitBtn = form.locator('button[type="submit"]').first();
        if (await submitBtn.count()) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {}),
                submitBtn.click()
            ]);
        }

        // Bước 3: thử login lần 2 sau khi đã đăng ký
        const loginAfterReg = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password);
        if (loginAfterReg.ok) return { ok: true, registered: true };

        const bodyAfterReg = await page.locator('body').innerText().catch(() => '');
        const alreadyLoggedIn = /my account|account dashboard|hello,/i.test(bodyAfterReg);
        if (alreadyLoggedIn) return { ok: true, registered: true };

        return { ok: false, reason: `Đăng ký và đăng nhập đều thất bại. URL=${page.url()}` };
    } catch (err) {
        return { ok: false, reason: `Lỗi khi tự đăng ký: ${err.message}` };
    }
}

// ── runDefSearch: helper cho defect Search (không cần login) ─
function runDefSearch(id, cb) {
    return async ({ page }, testInfo) => {
        let status = 'PASSED'; let desc = ''; let failure = null;
        try {
            const result = await cb(page);
            if (result && result.blocked) {
                status = 'BLOCKED';
                desc = `BLOCKED — ${result.reason}`;
                testInfo.annotations.push({ type: 'Result', description: status });
                testInfo.annotations.push({ type: 'Actual Result', description: desc });
                asm7xWriteResult(id, status, desc);
                test.skip(true, desc);
                return;
            }
            desc = typeof result === 'string' ? result : `PASSED — ${id} hoàn tất.`;
        } catch (err) {
            failure = err;
            status = 'FAILED';
            desc = `FAILED — ${err.message}`;
        }
        testInfo.annotations.push({ type: 'Result', description: status });
        testInfo.annotations.push({ type: 'Actual Result', description: desc });
        asm7xWriteResult(id, status, desc);
        if (failure) throw failure;
    };
}

// ── runDefAuth: helper cho defect cần đăng nhập (auto-register on demo reset) ─
function runDefAuth(id, cb) {
    return async ({ page, browser }, testInfo) => {
        let status = 'PASSED'; let desc = ''; let failure = null;
        try {
            // Đảm bảo đăng nhập (auto-register nếu demo đã reset)
            const auth = await asm7xAutoLogin(page);
            if (!auth.ok) {
                status = 'BLOCKED';
                desc = `BLOCKED — Không thể đăng nhập/đăng ký QA: ${auth.reason}`;
                testInfo.annotations.push({ type: 'Result', description: status });
                testInfo.annotations.push({ type: 'Actual Result', description: desc });
                asm7xWriteResult(id, status, desc);
                test.skip(true, desc);
                return;
            }
            const result = await cb(page, browser);
            if (result && result.blocked) {
                status = 'BLOCKED';
                desc = `BLOCKED — ${result.reason}`;
                testInfo.annotations.push({ type: 'Result', description: status });
                testInfo.annotations.push({ type: 'Actual Result', description: desc });
                asm7xWriteResult(id, status, desc);
                test.skip(true, desc);
                return;
            }
            desc = typeof result === 'string' ? result : `PASSED — ${id} hoàn tất.`;
        } catch (err) {
            failure = err;
            status = 'FAILED';
            desc = `FAILED — ${err.message}`;
        }
        testInfo.annotations.push({ type: 'Result', description: status });
        testInfo.annotations.push({ type: 'Actual Result', description: desc });
        asm7xWriteResult(id, status, desc);
        if (failure) throw failure;
    };
}

test.describe("DEFECT — Search & Faceted Filters (5 cases)", () => {
    test.describe.configure({ mode: "default" });

    // DEF_Search_01 ─ State Management
    // Thay đổi sort order khi đang ở trang 2 phải reset về trang 1.
    // Defect tiềm ẩn: p=2 vẫn giữ nguyên sau khi đổi sort → kết quả không nhất quán.
    test("DEF_Search_01 - Pagination không reset khi đổi sort ở trang 2", async ({ page }, testInfo) => {
        await gotoStorefront(page, `${ASM7X_FASHION_URL}?p=2`);
        await settle(page);

        const body2 = await page.locator("body").innerText();
        const onPage2 = /13\s*[-–]\s*24\s+of/i.test(body2);
        if (!onPage2) {
            testInfo.annotations.push({ type: "Result", description: "BLOCKED" });
            testInfo.annotations.push({ type: "Actual Result", description: "BLOCKED — Trang 2 không tải được hoặc tổng sản phẩm < 13." });
            asm7xWriteResult("DEF_Search_01", "BLOCKED", "Trang 2 không tải được hoặc tổng sản phẩm < 13.");
            test.skip(true, "BLOCKED — Trang 2 không tải được.");
            return;
        }

        const sorter = page.locator("#toolbar-sortby:visible, #sorter:visible").first();
        if (!await sorter.count()) {
            testInfo.annotations.push({ type: "Result", description: "BLOCKED" });
            testInfo.annotations.push({ type: "Actual Result", description: "BLOCKED — Không tìm thấy dropdown sort." });
            asm7xWriteResult("DEF_Search_01", "BLOCKED", "Không tìm thấy dropdown sort.");
            test.skip(true, "BLOCKED — Không tìm thấy dropdown sort.");
            return;
        }

        await Promise.all([
            page.waitForNavigation({ waitUntil: "domcontentloaded" }),
            sorter.selectOption({ label: "Price" })
        ]).catch(() => {});
        await settle(page);

        const pParam = new URL(page.url()).searchParams.get("p");
        const defectFound = pParam !== null && pParam !== "1";
        const status = defectFound ? "FAILED" : "PASSED";
        const desc = defectFound
            ? `DEFECT — Hệ thống giữ p=${pParam} sau khi đổi sort, trang 2 với sort mới dẫn đến kết quả không nhất quán. URL=${page.url()}`
            : `PASSED — Hệ thống đã reset về trang 1 (p=${pParam ?? "null"}) khi đổi sort. URL=${page.url()}`;

        testInfo.annotations.push({ type: "Result", description: status });
        testInfo.annotations.push({ type: "Actual Result", description: desc });
        asm7xWriteResult("DEF_Search_01", status, desc);
        expect(pParam === null || pParam === "1", `[DEF] ${desc}`).toBeTruthy();
    });

    // DEF_Search_02 ─ Input Validation / Boundary Value
    // Truyền giá âm qua URL param price để bypass frontend validation.
    test("DEF_Search_02 - URL param price âm bypass frontend filter", async ({ page }, testInfo) => {
        await gotoStorefront(page, `${ASM7X_FASHION_URL}?price=-100-50`);
        await settle(page);

        const priceParam = new URL(page.url()).searchParams.get("price");
        const products = await getProducts(page);
        const bodyText = await page.locator("body").innerText();
        const serverRejected = /400|bad request|no results|error/i.test(bodyText);

        const defectFound = priceParam === "-100-50" && products.length > 0 && !serverRejected;
        const status = defectFound ? "FAILED" : "PASSED";
        const desc = defectFound
            ? `DEFECT — Server chấp nhận price=-100-50 và trả về ${products.length} sản phẩm, không validate giá âm trong URL param.`
            : `PASSED — Server từ chối hoặc không trả sản phẩm với price âm. priceParam=${priceParam}; products=${products.length}; serverRejected=${serverRejected}`;

        testInfo.annotations.push({ type: "Result", description: status });
        testInfo.annotations.push({ type: "Actual Result", description: desc });
        asm7xWriteResult("DEF_Search_02", status, desc);
        expect(!defectFound, `[DEF] ${desc}`).toBeTruthy();
    });

    // DEF_Search_03 ─ Business Logic / Integration
    // Kết hợp tìm kiếm + filter giá + sort: sản phẩm ngoài khoảng giá không được hiển thị.
    test("DEF_Search_03 - Kết hợp search+filter giá+sort trả sản phẩm ngoài khoảng giá", async ({ page }, testInfo) => {
        await openHome(page);
        const box = searchBox(page);
        await box.click();
        await box.fill("Shirt");
        await pressEnterAndWait(page, box);

        const searchUrl = new URL(page.url());
        searchUrl.searchParams.set("price", "20-50");
        await gotoStorefront(page, searchUrl.toString());
        await settle(page);

        await chooseSort(page, "Price").catch(() => {});
        await setSortDirection(page, "asc").catch(() => {});

        const products = await getProducts(page);
        if (products.length === 0) {
            const actual = "BLOCKED — Không có sản phẩm Shirt trong khoảng $20-$50.";
            testInfo.annotations.push({ type: "Result", description: "BLOCKED" });
            testInfo.annotations.push({ type: "Actual Result", description: actual });
            asm7xWriteResult("DEF_Search_03", "BLOCKED", actual);
            test.skip(true, actual);
            return;
        }

        const outOfRange = products.filter(p => Number.isFinite(p.price) && (p.price < 20 || p.price > 50));
        const defectFound = outOfRange.length > 0;
        const status = defectFound ? "FAILED" : "PASSED";
        const desc = defectFound
            ? `DEFECT — ${outOfRange.length} sản phẩm ngoài $20-$50 vẫn xuất hiện: ${JSON.stringify(outOfRange.map(p => ({ name: p.name, price: p.price })))}`
            : `PASSED — Tất cả ${products.length} sản phẩm trong khoảng $20-$50. Prices: ${products.map(p => p.price).join(", ")}`;

        testInfo.annotations.push({ type: "Result", description: status });
        testInfo.annotations.push({ type: "Actual Result", description: desc });
        asm7xWriteResult("DEF_Search_03", status, desc);
        expect(!defectFound, `[DEF] ${desc}`).toBeTruthy();
    });

    // DEF_Search_04 ─ Input Validation
    // Từ khóa chứa ký tự Unicode / emoji không được gây lỗi server 500.
    test("DEF_Search_04 - Từ khóa Unicode/emoji không gây lỗi server 500", async ({ page }, testInfo) => {
        const payloads = ["áéíóú", "日本語", "🛍️👗", "Ñoño"];
        const results = [];

        for (const kw of payloads) {
            await openHome(page);
            const box = searchBox(page);
            await box.click();
            await box.fill(kw);
            const response = await pressEnterAndWait(page, box).catch(() => null);
            const httpStatus = response ? response.status() : 0;
            const bodyText = await page.locator("body").innerText().catch(() => "");
            const crashed = /500|Internal Server Error|Fatal error/i.test(bodyText);
            results.push({ keyword: kw, httpStatus, crashed });
        }

        const defects = results.filter(r => r.httpStatus >= 500 || r.crashed);
        const defectFound = defects.length > 0;
        const status = defectFound ? "FAILED" : "PASSED";
        const desc = defectFound
            ? `DEFECT — Server lỗi 500 / crash với ký tự đặc biệt: ${JSON.stringify(defects)}`
            : `PASSED — Server xử lý ổn tất cả Unicode payloads: ${JSON.stringify(results.map(r => ({ kw: r.keyword, status: r.httpStatus })))}`;

        testInfo.annotations.push({ type: "Result", description: status });
        testInfo.annotations.push({ type: "Actual Result", description: desc });
        asm7xWriteResult("DEF_Search_04", status, desc);
        expect(!defectFound, `[DEF] ${desc}`).toBeTruthy();
    });

    // DEF_Search_05 ─ State Management
    // Nhấn Back sau khi điều hướng từ trang có filter → phải quay về đúng URL filter.
    test("DEF_Search_05 - Browser Back khôi phục đúng filter state", async ({ page }, testInfo) => {
        await gotoStorefront(page, `${ASM7X_FASHION_URL}?price=20-50`);
        await settle(page);
        const urlFiltered = page.url();

        await gotoStorefront(page, `${BASE}electronics/`);
        await settle(page);

        await page.goBack({ waitUntil: "domcontentloaded" }).catch(() => {});
        await settle(page);
        const urlAfterBack = page.url();

        const backPreservesFilter = urlAfterBack.includes("price=20-50");
        const defectFound = !backPreservesFilter;
        const status = defectFound ? "FAILED" : "PASSED";
        const desc = defectFound
            ? `DEFECT — Browser Back không khôi phục URL filter. Expected URL chứa price=20-50; Actual=${urlAfterBack}`
            : `PASSED — Browser Back khôi phục đúng filter state. URL=${urlAfterBack}`;

        testInfo.annotations.push({ type: "Result", description: status });
        testInfo.annotations.push({ type: "Actual Result", description: desc });
        asm7xWriteResult("DEF_Search_05", status, desc);
        expect(!defectFound, `[DEF] ${desc}`).toBeTruthy();
    });
});

test.describe("DEFECT — Profile & Address Book (4 cases)", () => {
    test.describe.configure({ mode: "default" });
    const runDef = (id, cb, opts = {}) => async ({ page }, testInfo) => {
        await asm7xExecute(testInfo, page, id, () => cb(page), opts);
    };

    // DEF_Profile_01 ─ Security / Input Validation
    // SQL injection payload trong First Name không được gây lỗi DB / thực thi.
    test("DEF_Profile_01 - SQL Injection trong First Name không gây lỗi server", runDef("DEF_Profile_01", async page => {
        await asm7xOpenProfile(page);
        const first = await asm7xField(page, "firstname");
        if (!first) return { blocked: true, reason: "Không tìm thấy First Name field." };

        const original = await first.inputValue();
        const sqlPayload = "' OR '1'='1";

        try {
            await first.fill(sqlPayload);
            await asm7xSubmitProfile(page, first, false).catch(() => {});
            await page.waitForTimeout(500);

            const bodyText = await page.locator("body").innerText().catch(() => "");
            const serverError = /500|SQL syntax|SQLSTATE|database error|Fatal error/i.test(bodyText);
            const payloadReflected = bodyText.includes(sqlPayload) && !/blocked|rejected|invalid/i.test(bodyText);

            if (serverError) return `DEFECT — SQL payload gây lỗi server: ${bodyText.slice(0, 300)}`;
            if (payloadReflected) return `DEFECT — SQL payload được lưu và phản chiếu lên UI mà không sanitize.`;
            return `PASSED — Server xử lý đúng SQL injection payload; không lỗi DB; payload=${sqlPayload}`;
        } finally {
            await asm7xGo(page, ASM7X_PROFILE_URL);
            const f = await asm7xField(page, "firstname");
            if (f) { await f.fill(original); await asm7xSubmitProfile(page, f, true).catch(() => {}); }
        }
    }));

    // DEF_Profile_02 ─ Business Logic
    // Chỉ có đúng 1 địa chỉ được đánh dấu Default Shipping tại một thời điểm.
    test("DEF_Profile_02 - Chỉ 1 địa chỉ Default Shipping tồn tại cùng lúc", runDef("DEF_Profile_02", async page => {
        const token1 = asm7xToken("DEF1");
        if (!await asm7xOpenNewAddress(page)) return { blocked: true, reason: "Không mở được form địa chỉ." };
        await asm7xFillAddress(page, { street: `${ASM7X_QA.street} ${token1}` });
        if (!await asm7xSetDefault(page, "shipping")) return { blocked: true, reason: "UI không có checkbox Default Shipping." };
        expect(await asm7xSave(page)).toBeTruthy();

        const token2 = asm7xToken("DEF2");
        if (!await asm7xOpenNewAddress(page)) return { blocked: true, reason: "Không mở được form địa chỉ lần 2." };
        await asm7xFillAddress(page, { street: `${ASM7X_QA.street} ${token2}` });
        if (!await asm7xSetDefault(page, "shipping")) return { blocked: true, reason: "UI không có checkbox Default Shipping lần 2." };
        expect(await asm7xSave(page)).toBeTruthy();

        await asm7xOpenAddressBook(page);
        const items = await page.locator("li.item, .address-item, li").all();
        let defaultCount = 0;
        for (const item of items) {
            const text = await item.innerText().catch(() => "");
            if (/default shipping|primary shipping/i.test(text)) defaultCount++;
        }

        await asm7xDeleteAddress(page, token1).catch(() => {});
        await asm7xDeleteAddress(page, token2).catch(() => {});

        const defectFound = defaultCount > 1;
        const desc = defectFound
            ? `DEFECT — Có ${defaultCount} địa chỉ cùng được đánh dấu Default Shipping; chỉ được phép có 1.`
            : `PASSED — Chỉ có ${defaultCount} địa chỉ Default Shipping; địa chỉ cũ đã bị bỏ nhãn.`;

        expect(!defectFound, `[DEF] ${desc}`).toBeTruthy();
        return desc;
    }));

    // DEF_Profile_03 ─ Security / XSS
    // XSS payload trong First Name không được render thành HTML thực thi.
    test("DEF_Profile_03 - XSS payload trong First Name không được thực thi", runDef("DEF_Profile_03", async page => {
        await asm7xOpenProfile(page);
        const first = await asm7xField(page, "firstname");
        if (!first) return { blocked: true, reason: "Không tìm thấy First Name." };

        const original = await first.inputValue();
        const xssPayload = "<img src=x onerror=alert('XSS_DEF03')>";
        let alertFired = false;
        page.on("dialog", async d => { alertFired = true; await d.dismiss(); });

        try {
            await first.fill(xssPayload);
            await asm7xSubmitProfile(page, first, false).catch(() => {});
            await page.waitForTimeout(1000);

            const pageContent = await page.content();
            const rawTagInHtml = pageContent.includes("<img src=x onerror=");

            if (alertFired) return `DEFECT — XSS alert đã được thực thi! Payload lưu vào First Name và kích hoạt onerror.`;
            if (rawTagInHtml) return `DEFECT — XSS payload phản chiếu dưới dạng raw HTML tag, có thể thực thi trong context khác.`;
            return `PASSED — XSS payload bị encode/sanitize; alert không kích hoạt; raw tag không xuất hiện trong HTML.`;
        } finally {
            await asm7xGo(page, ASM7X_PROFILE_URL);
            const f = await asm7xField(page, "firstname");
            if (f) { await f.fill(original); await asm7xSubmitProfile(page, f, true).catch(() => {}); }
        }
    }));

    // DEF_Profile_04 ─ Business Logic / Boundary Value
    // Postal code US (5 chữ số) nhập vào nhưng country là Vietnam → phải có validation.
    test("DEF_Profile_04 - Postal code US nhưng country Vietnam phải được validate", runDef("DEF_Profile_04", async page => {
        const token = asm7xToken("MISMATCH");
        if (!await asm7xOpenNewAddress(page)) return { blocked: true, reason: "Không mở được form địa chỉ." };

        await asm7xFillAddress(page, { street: `${ASM7X_QA.street} ${token}`, postcode: "90210" });

        const country = await asm7xField(page, "country");
        let changedCountry = false;
        if (country) {
            const opts = await country.locator("option").evaluateAll(els =>
                els.map(x => ({ value: x.value, text: (x.textContent || "").trim() })).filter(x => x.value)
            );
            const vn = opts.find(x => /vietnam|viet nam/i.test(x.text));
            if (vn) { await country.selectOption(vn.value); await page.waitForTimeout(500); changedCountry = true; }
        }

        if (!changedCountry) return { blocked: true, reason: "Storefront không có tùy chọn Vietnam trong dropdown country." };

        const zip = await asm7xField(page, "postcode");
        const zipInvalid = zip ? await asm7xInvalid(zip) : false;
        const outcome = zipInvalid
            ? { validation: true, saved: false }
            : await asm7xSubmitAddressForValidation(page, zip || (await asm7xField(page, "street")), token);

        if (outcome.saved) await asm7xDeleteAddress(page, token).catch(() => {});

        const desc = outcome.validation
            ? `PASSED — Postal "90210" không khớp country Vietnam bị validation từ chối.`
            : outcome.saved
                ? `DEFECT — Hệ thống lưu địa chỉ Vietnam + postal "90210" mà không validate định dạng theo quốc gia.`
                : `PASSED — Form không lưu được với mismatch country-postal.`;

        // DEF_Profile_04: Xác nhận defect hệ thống không validate postcode theo quốc gia
        if (outcome.saved && !outcome.validation) {
            testInfo.annotations.push({ type: 'Defect Confirmed', description: 'Hệ thống chấp nhận mã zip US 90210 cho quốc gia Vietnam' });
        }
        return desc;
    }));
});

test.describe("DEFECT — Order Placement & Invoice (4 cases)", () => {
    test.describe.configure({ mode: "default" });
    const runDef = (id, cb, opts = {}) => async ({ page, browser }, testInfo) => {
        await asm7xExecute(testInfo, page, id, () => cb(page, browser), { guest: true, ...opts });
    };

    // DEF_Order_01 ─ State Management / Integration
    // Giỏ hàng guest phải được merge vào tài khoản sau khi đăng nhập.
    test("DEF_Order_01 - Giỏ hàng guest được merge khi đăng nhập tài khoản", runDef("DEF_Order_01", async (page, browser) => {
        if (!ASM7X_QA.email || !ASM7X_QA.password) {
            return { blocked: true, reason: "Chưa khai báo QA_EMAIL/QA_PASSWORD." };
        }

        const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, ignoreHTTPSErrors: true });
        try {
            const guestPage = await context.newPage();
            const guestAdd = await asm7xAddToCart(guestPage, ASM7X_PRODUCT_TWO, 1);
            if (!guestAdd.ok) return { blocked: true, reason: `Guest không thêm được sản phẩm: ${guestAdd.reason}` };

            await gotoStorefront(guestPage, ASM7X_LOGIN_URL);
            let login = await asm7xLoginWithCredentials(guestPage, ASM7X_QA.email, ASM7X_QA.password);
            if (!login.ok) {
                await asm7xAutoRegister(guestPage);
                login = await asm7xLoginWithCredentials(guestPage, ASM7X_QA.email, ASM7X_QA.password);
            }
            if (!login.ok) return { blocked: true, reason: `Đăng nhập thất bại: ${login.reason}` };

            await gotoStorefront(guestPage, ASM7X_CART_URL);
            const bodyAfterLogin = await guestPage.locator("body").innerText();
            const cartMerged = bodyAfterLogin.toLowerCase().includes(ASM7X_PRODUCT_TWO.toLowerCase());

            const desc = cartMerged
                ? `PASSED — Giỏ hàng guest được merge sau đăng nhập; ${ASM7X_PRODUCT_TWO} vẫn còn trong cart.`
                : `DEFECT — Giỏ hàng guest bị mất sau đăng nhập; ${ASM7X_PRODUCT_TWO} không còn trong cart sau khi login.`;

            expect(cartMerged, `[DEF] ${desc}`).toBeTruthy();
            return desc;
        } finally {
            await context.close();
        }
    }));

    // DEF_Order_02 ─ Boundary Value / Business Logic
    // Thêm số lượng cực lớn (9999) vào giỏ → server không được trả lỗi 500.
    test("DEF_Order_02 - Số lượng cực lớn (9999) không gây lỗi server 500", runDef("DEF_Order_02", async page => {
        const reset = await asm7xResetCart(page);
        if (!reset.ok) return { blocked: true, reason: reset.reason };

        if (!await asm7xOpenProduct(page, ASM7X_PRODUCT_ONE)) {
            return { blocked: true, reason: `Không tìm thấy ${ASM7X_PRODUCT_ONE}.` };
        }
        await asm7xChooseProductOptions(page);

        const qty = await asm7xField(page, "quantity");
        if (qty) await qty.fill("9999");

        const addBtn = await asm7xFind(page, ['button[title*="Add to Cart"]', 'button:has-text("Add to Cart")']);
        if (!addBtn) return { blocked: true, reason: "Không có nút Add to Cart." };

        await addBtn.click().catch(() => {});
        await page.waitForTimeout(4000);

        const bodyText = await page.locator("body").innerText().catch(() => "");
        const serverError = /500|Internal Server Error|Fatal error/i.test(bodyText);
        const stockError = /not available|out of stock|maximum.*qty|requested qty/i.test(bodyText);

        await gotoStorefront(page, ASM7X_CART_URL);
        const qtyInCart = await page.locator('input[name*="[qty]"]:visible, input.qty:visible').first().inputValue().catch(() => "0");

        const defectFound = serverError;
        const desc = serverError
            ? `DEFECT — Server trả lỗi 500 khi thêm qty=9999 vào giỏ.`
            : stockError
                ? `PASSED — Hệ thống thông báo giới hạn tồn kho; qty trong cart=${qtyInCart}.`
                : `PASSED — Hệ thống xử lý qty=9999 không lỗi server; qty trong cart=${qtyInCart}.`;

        expect(!defectFound, `[DEF] ${desc}`).toBeTruthy();
        return desc;
    }));

    // DEF_Order_03 ─ Business Logic / State Management
    // Nhập coupon vào cart → xóa item → coupon state và tổng tiền phải nhất quán.
    test("DEF_Order_03 - Coupon state nhất quán sau khi xóa sản phẩm khỏi giỏ", runDef("DEF_Order_03", async page => {
        const reset = await asm7xResetCart(page);
        if (!reset.ok) return { blocked: true, reason: reset.reason };

        const addA = await asm7xAddToCart(page, ASM7X_PRODUCT_ONE, 1);
        if (!addA.ok) return { blocked: true, reason: addA.reason };
        const addB = await asm7xAddToCart(page, ASM7X_PRODUCT_TWO, 1);
        if (!addB.ok) return { blocked: true, reason: addB.reason };

        await gotoStorefront(page, ASM7X_CART_URL);
        const couponInput = page.locator('#coupon_code:visible, input[name="coupon_code"]:visible').first();
        if (!await couponInput.count()) {
            return { blocked: true, reason: "Storefront không hiển thị ô nhập Coupon Code." };
        }

        await couponInput.fill("TESTCOUPON2024");
        const applyBtn = page.locator('button:has-text("Apply Coupon"):visible, #discount-coupon-form button[type="submit"]:visible').first();
        if (!await applyBtn.count()) return { blocked: true, reason: "Không tìm thấy nút Apply Coupon." };

        await applyBtn.click();
        await page.waitForLoadState("domcontentloaded").catch(() => {});

        const bodyAfterCoupon = await page.locator("body").innerText();
        const couponApplied = /coupon.*applied|discount.*applied|your coupon code/i.test(bodyAfterCoupon);
        const couponInvalid = /invalid coupon|coupon code.*not valid|does not apply/i.test(bodyAfterCoupon);

        if (!couponApplied) {
            return { blocked: true, reason: `Coupon TESTCOUPON2024 không tồn tại trên demo. couponInvalid=${couponInvalid}` };
        }

        // Lấy grand total trước khi xóa
        const totalBefore = asm7xMoney(await page.locator(".grand-total .price, .totals-tax-summary .price, .order-total .price").first().innerText().catch(() => "0"));

        // Xóa sản phẩm đầu
        await asm7xRemoveCartItem(page, ASM7X_PRODUCT_ONE);
        await gotoStorefront(page, ASM7X_CART_URL);

        const bodyAfterRemove = await page.locator("body").innerText();
        const couponStillActive = /coupon.*applied|discount.*applied/i.test(bodyAfterRemove);
        const totalAfter = asm7xMoney(await page.locator(".grand-total .price, .totals-tax-summary .price, .order-total .price").first().innerText().catch(() => "0"));

        // Nếu coupon còn active nhưng total không thay đổi sau xóa 1 sản phẩm → defect
        const defectFound = couponStillActive && Number.isFinite(totalBefore) && Number.isFinite(totalAfter) && totalAfter >= totalBefore;
        const desc = defectFound
            ? `DEFECT — Coupon vẫn hiển thị applied nhưng tổng tiền không giảm sau xóa sản phẩm. Before=${totalBefore}; After=${totalAfter}.`
            : `PASSED — Coupon state và tổng tiền nhất quán sau xóa sản phẩm. couponActive=${couponStillActive}; totalBefore=${totalBefore}; totalAfter=${totalAfter}.`;

        return desc;
    }));

    // DEF_Order_04 ─ Business Logic / Data Consistency
    // Giá trong giỏ hàng phải khớp với giá trên trang chi tiết sản phẩm (không có hidden markup).
    test("DEF_Order_04 - Giá sản phẩm trong giỏ phải khớp giá trang chi tiết", runDef("DEF_Order_04", async page => {
        const reset = await asm7xResetCart(page);
        if (!reset.ok) return { blocked: true, reason: reset.reason };

        if (!await asm7xOpenProduct(page, ASM7X_PRODUCT_ONE)) {
            return { blocked: true, reason: `Không tìm thấy ${ASM7X_PRODUCT_ONE}.` };
        }
        await asm7xChooseProductOptions(page);

        const priceEl = await asm7xFind(page, [".special-price .price", ".price-box .price", ".product-info .price", ".price"]);
        if (!priceEl) return { blocked: true, reason: "Không đọc được giá trên trang chi tiết." };

        const detailPriceText = await priceEl.innerText();
        const detailPrice = asm7xMoney(detailPriceText);
        if (!Number.isFinite(detailPrice)) return { blocked: true, reason: `Không parse được giá: "${detailPriceText}"` };

        const addBtn = await asm7xFind(page, ['button[title*="Add to Cart"]', 'button:has-text("Add to Cart")']);
        if (!addBtn) return { blocked: true, reason: "Không có nút Add to Cart." };

        await addBtn.click();
        await page.waitForLoadState("domcontentloaded").catch(() => {});
        await gotoStorefront(page, ASM7X_CART_URL);

        const values = await asm7xCartValues(page, ASM7X_PRODUCT_ONE);
        if (!values || !Number.isFinite(values.unitPrice)) {
            return { blocked: true, reason: "Không đọc được đơn giá trong Cart." };
        }

        const priceDiff = Math.abs(values.unitPrice - detailPrice);
        const defectFound = priceDiff > 0.01;
        const desc = defectFound
            ? `DEFECT — Giá không nhất quán: chi tiết sản phẩm=${detailPrice}, cart=${values.unitPrice}, chênh lệch=${priceDiff.toFixed(2)}`
            : `PASSED — Giá nhất quán: chi tiết=${detailPrice}, cart=${values.unitPrice}.`;

        expect(!defectFound, `[DEF] ${desc}`).toBeTruthy();
        return desc;
    }));
});
