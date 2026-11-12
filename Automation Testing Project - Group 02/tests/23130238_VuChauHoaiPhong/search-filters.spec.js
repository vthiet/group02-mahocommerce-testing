const {
  test,
  expect,
  BASE,
  FASHION,
  CARD,
  NAME,
  PRODUCT_TITLE,
  esc,
  norm,
  isSorted,
  waitForStorefrontReady,
  gotoStorefront,
  settle,
  searchBox,
  openHome,
  typeSearch,
  pressEnterAndWait,
  searchFor,
  getProducts,
  clickProductAndCheck,
  fillPrice,
  clickSidebar,
  activeFilterText,
  chooseSort,
  setSortDirection,
  fs,
  path,
  XLSX,
  ASM7X_WORKBOOK_NAME,
  ASM7X_WORKBOOK_OVERRIDE,
  ASM7X_WORKBOOK_CANDIDATES,
  ASM7X_WORKBOOK,
  ASM7X_ACCOUNT_URL,
  ASM7X_LOGIN_URL,
  ASM7X_PROFILE_URL,
  ASM7X_ADDRESS_URL,
  ASM7X_ADDRESS_NEW_URL,
  ASM7X_CART_URL,
  ASM7X_HISTORY_URL,
  ASM7X_FASHION_URL,
  ASM7X_QA,
  ASM7X_PRODUCT_ONE,
  ASM7X_PRODUCT_TWO,
  ASM7X_ALLOW_ORDER,
  ASM7X_ALLOW_TWO_ORDERS,
  ASM7X_ALLOW_CART_RESET,
  ASM7X_QA_INBOX_URL,
  ASM7X_QA_ORDER_NUMBER,
  ASM7X_QA_ORDER_CONFIRMATION_URL,
  asm7xTodayVN,
  asm7xToken,
  asm7xEscapeRegex,
  asm7xMoney,
  asm7xFind,
  asm7xField,
  asm7xSheetFor,
  asm7xRefreshDashboard,
  asm7xWriteResult,
  asm7xExecute,
  asm7xAutoRegister,
  asm7xEnsureLogin,
  asm7xGo,
  asm7xSave,
  asm7xSubmitProfile,
  asm7xOpenProfile,
  asm7xOpenAddressBook,
  asm7xOpenNewAddress,
  asm7xSelectCountry,
  asm7xFillAddress,
  asm7xAddressCard,
  asm7xAddressExists,
  asm7xSubmitAddressForValidation,
  asm7xDeleteAddress,
  asm7xSetDefault,
  asm7xInvalid,
  asm7xRequired,
  asm7xOpenProduct,
  asm7xChooseProductOptions,
  asm7xAddToCart,
  asm7xCartRow,
  asm7xCartQty,
  asm7xUpdateCart,
  asm7xRemoveCartItem,
  asm7xCartValues,
  asm7xResetCart,
  asm7xOpenCheckout,
  asm7xCheckoutField,
  asm7xFillCheckout,
  asm7xShippingMethods,
  asm7xContinueCheckout,
  asm7xOrderHistoryRowCount,
  asm7xChooseOfflinePayment,
  asm7xPlaceTestOrder,
  DEF_REGISTER_URL,
  asm7xAutoLogin,
  runDefSearch,
  runDefAuth
} = require('./support.cjs');

test.use({
  viewport: { width: 1366, height: 768 },
  locale: "en-US",
  ignoreHTTPSErrors: true,
  screenshot: "only-on-failure",
  video: "retain-on-failure"
});
test.setTimeout(12e4);

test.describe("SEARCH & FILTERS — 29 TEST CASES", () => {
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
        }); test.skip(true, reason); }); });

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
