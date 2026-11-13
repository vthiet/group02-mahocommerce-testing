const {test: test, expect: expect} = require("@playwright/test"); const BASE = "https://demo.mahocommerce.com/default/"; const FASHION = `${BASE}fashion/`; const CARD = "ul.products-grid > li, .products-grid .item, .product-item, ul.products-list > li";
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
        timeout: 3e4
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

const fs = require("node:fs"); const path = require("node:path"); const XLSX = require("xlsx");
const ASM7X_WORKBOOK_NAME = "Group02_23130238_VuChauHoaiPhong.xlsx"; const ASM7X_WORKBOOK_OVERRIDE = process.env.ASM7_WORKBOOK ? path.resolve(process.env.ASM7_WORKBOOK) : "";
const ASM7X_WORKBOOK_CANDIDATES = [ ASM7X_WORKBOOK_OVERRIDE, path.resolve(__dirname, "..", "..", "..", "reports", ASM7X_WORKBOOK_NAME) ].filter(Boolean);
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
const ASM7X_ALLOW_CART_RESET = (process.env.ALLOW_QA_CART_RESET || "true") === "true"; const ASM7X_QA_INBOX_URL = process.env.QA_EMAIL_INBOX_URL || "";
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
function asm7xFindHeaderRow(rows, requiredHeaders) {
    const headerIndex = rows.findIndex(row => {
        const headers = row.map(value => String(value).trim());
        return requiredHeaders.every(header => headers.includes(header));
    });
    if (headerIndex < 0) return null;
    const headers = rows[headerIndex].map(value => String(value).trim());
    return {
        headerIndex,
        columns: Object.fromEntries(requiredHeaders.map(header => [header, headers.indexOf(header)]))
    };
}
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
    } ]; const dashboardRows = XLSX.utils.sheet_to_json(dashboard, {
        header: 1,
        defval: ""
    }); const targetHeader = dashboardRows.flat().map(value => String(value).trim()).find(value => /^\d+(?:\.\d+)?%\s*Target PASS$/i.test(value));
    const targetMatch = targetHeader && targetHeader.match(/^(\d+(?:\.\d+)?)%/); const targetRate = targetMatch ? Number(targetMatch[1]) / 100 : .9;
    for (const config of configs) {
        const sheet = wb.Sheets[config.name]; if (!sheet || !sheet["!ref"]) continue; const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: ""
        }); const header = asm7xFindHeaderRow(rows, [ "ID", "Result" ]); if (!header) continue;
        const entries = rows.map((row, index) => ({
            row,
            index
        })).filter(entry => entry.index > header.headerIndex && String(entry.row[header.columns.ID] || "").trim());
        const statuses = entries.map(entry => String(entry.row[header.columns.Result] || "").trim().toUpperCase());
        const total = statuses.length; const count = value => statuses.filter(status => status === value).length; const passed = count("PASSED");
        const target = Math.ceil(total * targetRate); const cells = {
            B: total,
            C: passed,
            D: count("FAILED"),
            E: count("BLOCKED"),
            F: count("SKIPPED"),
            G: count("NOT RUN") + count("UNTESTED"),
            H: total ? passed / total : 0,
            I: target,
            J: Math.max(0, target - passed)
        }; const firstDataRow = entries.length ? entries[0].index + 1 : header.headerIndex + 2;
        const lastDataRow = entries.length ? entries[entries.length - 1].index + 1 : firstDataRow;
        const idColumn = XLSX.utils.encode_col(header.columns.ID); const resultColumn = XLSX.utils.encode_col(header.columns.Result);
        const refs = {
            B: entries.length ? `COUNTA('${config.name}'!$${idColumn}$${firstDataRow}:$${idColumn}$${lastDataRow})` : "0",
            C: entries.length ? `COUNTIF('${config.name}'!$${resultColumn}$${firstDataRow}:$${resultColumn}$${lastDataRow},"PASSED")` : "0",
            D: entries.length ? `COUNTIF('${config.name}'!$${resultColumn}$${firstDataRow}:$${resultColumn}$${lastDataRow},"FAILED")` : "0",
            E: entries.length ? `COUNTIF('${config.name}'!$${resultColumn}$${firstDataRow}:$${resultColumn}$${lastDataRow},"BLOCKED")` : "0",
            F: entries.length ? `COUNTIF('${config.name}'!$${resultColumn}$${firstDataRow}:$${resultColumn}$${lastDataRow},"SKIPPED")` : "0",
            G: entries.length ? `COUNTIF('${config.name}'!$${resultColumn}$${firstDataRow}:$${resultColumn}$${lastDataRow},"NOT RUN")+COUNTIF('${config.name}'!$${resultColumn}$${firstDataRow}:$${resultColumn}$${lastDataRow},"UNTESTED")` : "0",
            H: `IF(B${config.row}=0,0,C${config.row}/B${config.row})`,
            I: `ROUNDUP(B${config.row}*${targetRate * 100}%,0)`,
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
        }); const header = asm7xFindHeaderRow(matrix, [ "ID", "Result", "Test date", "Actual Result" ]); if (!header) {
            throw new Error(`Sheet "${sheetName}" phải có ID, Result, Test date và Actual Result.`); }
        const index = matrix.findIndex((row, i) => i > header.headerIndex && String(row[header.columns.ID]).trim() === id); if (index < 0) {
            throw new Error(`Không tìm thấy testcase ID ${id} trong sheet "${sheetName}".`); }
        const writeCell = (r, c, value) => {
            const addr = XLSX.utils.encode_cell({
                r: r,
                c: c
            }); sheet[addr] = {
                ...sheet[addr],
                t: "s",
                v: String(value ?? "")
            }; }; writeCell(index, header.columns.Result, status); writeCell(index, header.columns["Test date"], asm7xTodayVN()); writeCell(index, header.columns["Actual Result"], actual); asm7xRefreshDashboard(wb);
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
    if (!ASM7X_QA.email || !ASM7X_QA.password) {
        return {
            ok: false,
            reason: "Cần cấu hình QA_EMAIL và QA_PASSWORD trong environment của runner."
        };
    }

    try {
        const regUrl = new URL("customer/account/create/", BASE).toString();
        await gotoStorefront(page, regUrl);
        await page.waitForLoadState("domcontentloaded");
        const tabReg = page.locator("#tab-register").first();
        if (await tabReg.count()) await tabReg.click().catch(() => {});
        await page.waitForTimeout(400);

        const form = await asm7xFind(page, [
            "#form-validate-register",
            "#form-validate",
            "form[action*='createpost']"
        ]);
        if (!form) {
            return {
                ok: false,
                reason: "Không tìm thấy form tạo tài khoản."
            };
        }
        const findRegistrationField = async selectors => {
            for (const selector of selectors) {
                const field = form.locator(selector).first();
                if (await field.count() && await field.isVisible().catch(() => false)) return field;
            }
            return null;
        };
        const fields = [
            {
                name: "First Name",
                locator: await findRegistrationField(['#firstname', 'input[name="firstname"]']),
                value: ASM7X_QA.firstName
            },
            {
                name: "Last Name",
                locator: await findRegistrationField(['#lastname', 'input[name="lastname"]']),
                value: ASM7X_QA.lastName
            },
            {
                name: "Email",
                locator: await findRegistrationField(['#email_address_register', '#email_address', 'input[name="email"]']),
                value: ASM7X_QA.email
            },
            {
                name: "Password",
                locator: await findRegistrationField(['#password_register', '#password', 'input[name="password"]']),
                value: ASM7X_QA.password
            },
            {
                name: "Password confirmation",
                locator: await findRegistrationField(['#confirmation_register', '#confirmation', 'input[name="confirmation"]']),
                value: ASM7X_QA.password
            }
        ];
        const missing = fields.filter(field => !field.locator).map(field => field.name);
        if (missing.length) {
            return {
                ok: false,
                reason: `Không tìm thấy trường đăng ký: ${missing.join(", ")}.`
            };
        }
        for (const field of fields) {
            await field.locator.fill(field.value);
            if (await field.locator.inputValue() !== field.value) {
                return {
                    ok: false,
                    reason: `Form đăng ký không nhận đúng trường ${field.name}.`
                };
            }
        }

        const submitBtn = await asm7xFind(form, [
            '#form-validate-register button[type="submit"]',
            '#form-validate button[type="submit"]',
            'button[title*="Register"]',
            'button[type="submit"]',
            'input[type="submit"]'
        ]);
        if (!submitBtn) {
            return {
                ok: false,
                reason: "Không tìm thấy nút submit form đăng ký."
            };
        }

        await Promise.all([
            page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => null),
            submitBtn.click()
        ]);
        await page.waitForTimeout(500);
        const registrationBody = await page.locator("body").innerText().catch(() => "");
        const registrationError = registrationBody.match(/(?:there is already an account|account already exists|already registered|please enter a valid|this is a required field|password confirmation does not match|could not save the customer)/i);

        const login = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password);
        if (login.ok) return { ok: true, registered: !registrationError };
        return {
            ok: false,
            reason: registrationError
                ? `Đăng ký không hoàn tất: ${registrationError[0]}. ${login.reason}`
                : `Đăng ký xong nhưng đăng nhập chưa thành công. ${login.reason}; URL=${page.url()}`
        };
    } catch (e) {
        return { ok: false, reason: `Lỗi khi tự đăng ký/đăng nhập: ${e.message}` };
    }
}

async function asm7xEnsureLogin(page) {
    if (!ASM7X_QA.email || !ASM7X_QA.password) {
        return {
            ok: false,
            reason: "Thiếu QA_EMAIL hoặc QA_PASSWORD."
        };
    }
    let login = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password);
    if (login.ok) return { ok: true, registered: false };

    const registration = await asm7xAutoRegister(page);
    if (!registration.ok) {
        login = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password);
        if (login.ok) return { ok: true, registered: false };
        return {
            ok: false,
            reason: `${registration.reason}; đăng nhập lại cũng thất bại: ${login.reason}`
        };
    }

    login = await asm7xLoginWithCredentials(page, ASM7X_QA.email, ASM7X_QA.password);
    return login.ok
        ? { ok: true, registered: registration.registered === true }
        : { ok: false, reason: `Tự đăng ký thành công nhưng đăng nhập lại thất bại: ${login.reason}` };
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
        timeout: 2e4
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
        timeout: 2e4,
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
        return null;         }, null, {
            timeout: 3e4
    }).then(handle => handle.jsonValue()).catch(() => null), submit.click() ]).then(([state]) => state); if (outcome === "rejected") {
        const body = await page.locator("body").innerText().catch(() => ""); return {
            ok: false,
            reason: body.match(/invalid login or password|incorrect (?:email|password)|could not sign in/i)?.[0] || "Website rejected the QA credentials."
        }; }
    if (outcome === "authenticated") {
        return {
            ok: true,
            reason: "Đăng nhập và dashboard đã được xác nhận."
        };
    }
    const body = await page.locator("body").innerText().catch(() => "");
    const formStillVisible = Boolean(await asm7xField(page, "password"));
    return {
        ok: false,
        reason: `Không xác minh được đăng nhập${formStillVisible ? "; form vẫn hiển thị" : ""}. UI=${body.slice(0, 300)}`
    }; }

async function asm7xOpenProduct(page, productName) {
    await asm7xGo(page, BASE); const search = await asm7xFind(page, [ "input#search:visible" ]); if (!search) return false; await search.fill(productName);
    await search.press("Enter"); const productTitle = page.locator("h1:visible, .product-view .product-name:visible, .product-info-main .product-name:visible").first();
    const expectedTitle = new RegExp(asm7xEscapeRegex(productName), "i");
    const links = page.locator(".product-name a[href], .product-item-name a[href], .product-item a[href]").filter({
        hasText: expectedTitle
    }); const link = links.first();
    await expect.poll(async () => {
        if (await productTitle.count() && expectedTitle.test(await productTitle.innerText().catch(() => ""))) return true;
        return await link.isVisible().catch(() => false);
    }, {
        timeout: 3e4,
        message: `Không tìm thấy trang hoặc kết quả cho sản phẩm '${productName}'.`
    }).toBeTruthy();
    if (await productTitle.count() && expectedTitle.test(await productTitle.innerText().catch(() => ""))) {
        return true; }
    await link.click(); await expect(productTitle).toContainText(expectedTitle); return true; }
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
    const [addResponse] = await Promise.all([ page.waitForResponse(response => {
        try {
            return new URL(response.url()).pathname.includes("/checkout/cart/add");
        } catch {
            return false;
        }
    }, {
        timeout: 3e4
    }), add.click() ]); if (!addResponse.ok()) {
        throw new Error(`Add to Cart trả HTTP ${addResponse.status()} cho ${productName}.`);
    }
    await asm7xGo(page, ASM7X_CART_URL); await expect(page.locator("body")).toContainText(productName, {
        timeout: 2e4
    });
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
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await expect.poll(async () => {
        const body = (await page.locator("body").innerText().catch(() => "")).toLowerCase();
        return !body.includes(productName.toLowerCase());
    }, {
        timeout: 2e4,
        message: `${productName} should be removed from the cart after the remove action.`
    }).toBeTruthy();
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

const DEF_REGISTER_URL = new URL('customer/account/create/', BASE).toString();

// ── Auto-login: thử login, nếu thất bại do demo reset → tự đăng ký lại ──
async function asm7xAutoLogin(page) {
    return asm7xEnsureLogin(page);
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

module.exports = {
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
  asm7xLoginWithCredentials,
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
};
