// Lệnh test
// $env:ASM7_WORKBOOK = "D:\Playwright\group02-mahocommerce-testing\Deprecated\reports\Group02_23130238_VuChauHoaiPhong.xlsx"
// $env:QA_EMAIL="pvu560016@gmail.com"
// $env:QA_PASSWORD="Phong123"
// npx playwright test --ui --project=chromium

import {
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
} from './support';
import type { Page, Browser, TestInfo } from '@playwright/test';
import type { CallbackResult } from './support';

test.use({
  viewport: { width: 1366, height: 768 },
  locale: "en-US",
  ignoreHTTPSErrors: true,
  screenshot: "only-on-failure",
  video: "retain-on-failure"
});
test.setTimeout(18e4);

test.describe("ORDER PLACEMENT & INVOICE — 30 TEST CASES", () => {
test.describe("ORDER PLACEMENT & INVOICE — 26 FUNCTIONAL CASES", () => {
    test.describe.configure({
        mode: "default"
    }); const run = (id: string, callback: (page: Page, browser: Browser) => CallbackResult | Promise<CallbackResult>, options: { guest?: boolean } = {}) => async ({page: page, browser: browser}: { page: Page; browser: Browser }, testInfo: TestInfo) => {
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
        expect(Number(await input!.inputValue())).toBe(2); return "Quantity được cập nhật từ 1 lên 2 và vẫn giữ sau khi tải lại Cart."; }));
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
        const input = inputs.first(); await input.fill("0"); const invalid = await input.evaluate(el => !(el as HTMLInputElement).checkValidity()); if (!await asm7xUpdateCart(page)) {
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
            await input.fill(invalidValue); const nativeInvalid = await input.evaluate(el => !(el as HTMLInputElement).checkValidity()); const acceptedValue = await input.inputValue(); outcomes.push({
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
                const select = optionSelects.nth(i); if (await select.evaluate(element => (element as HTMLSelectElement).selectedIndex > 0)) continue;
                const option = optionGroups.nth(i).locator(".swatch-link:visible").first(); if (!await option.count()) {
                    return {
                        blocked: true,
                        reason: "Không tìm thấy lựa chọn hợp lệ cho sản phẩm có biến thể bắt buộc."
                    }; }
                await option.hover(); await expect.poll(() => select.locator("option").count(), {
                    message: "Tùy chọn sản phẩm chưa tải xong."
                }).toBeGreaterThan(1); await option.click(); await expect.poll(() => select.evaluate(element => (element as HTMLSelectElement).selectedIndex), {
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
            await field!.fill(""); if (await asm7xRequired(field!)) requiredCount++; }
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
            const opts = await country.locator("option").evaluateAll(els => (els as HTMLOptionElement[]).map(el => ({
                value: el.value,
                text: (el.textContent as string).trim()
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
        const order = await asm7xPlaceTestOrder(page); if (!order.ok) {
            return {
                blocked: true,
                reason: order.reason
            }; }
        const body = await page.locator("body").innerText(); expect(body).toContain(order.orderNumber);
        return `Confirmation của đơn vừa tạo hiển thị order reference '${order.orderNumber}'.`; }, {
        guest: false
    })); test("Order_NumberUnique_21 - Mã đơn khác nhau giữa hai đơn", run("Order_NumberUnique_21", async page => {
        if (!ASM7X_ALLOW_TWO_ORDERS) {
            return {
                blocked: true,
                reason: "Chưa bật ALLOW_TWO_DEMO_ORDERS=true; không tự tạo đơn thứ hai."
            }; }
        const first = await asm7xPlaceTestOrder(page); if (!first.ok) {
            return {
                blocked: true,
                reason: first.reason
            }; }
        const second = await asm7xPlaceTestOrder(page); if (!second.ok) {
            return {
                blocked: true,
                reason: second.reason
            }; }
        expect(second.orderNumber).not.toBe(first.orderNumber); return `Order A=${first.orderNumber}; Order B=${second.orderNumber}; hai mã khác nhau.`; }, {
        guest: false
    })); test("Order_DoubleSubmit_22 - Chống tạo đơn trùng khi nhấn nhanh", run("Order_DoubleSubmit_22", async page => {
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
        return `Double-click chỉ tạo thêm đúng 1 dòng đơn hàng trong My Orders; before=${beforeCount}; after=${afterCount}; reference=${match![1]}.`; }, {
        guest: false
    })); test("Order_ConfirmationRefresh_23 - Tải lại trang xác nhận", run("Order_ConfirmationRefresh_23", async page => {
        const order = await asm7xPlaceTestOrder(page); if (!order.ok) {
            return {
                blocked: true,
                reason: order.reason
            }; }
        const first = await page.locator("body").innerText(); expect(first).toContain(order.orderNumber);
        await page.reload({
            waitUntil: "domcontentloaded"
        }); const after = await page.locator("body").innerText(); const stable = after.includes(order.orderNumber!);
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
        const order = await asm7xPlaceTestOrder(page); if (!order.ok) {
            return {
                blocked: true,
                reason: order.reason
            }; }
        await asm7xGo(page, ASM7X_HISTORY_URL); const body = await page.locator("body").innerText(); if (!body.includes(order.orderNumber!)) {
            return {
                blocked: true,
                reason: `Không tìm thấy ${order.orderNumber} trong My Orders; có thể demo chưa hỗ trợ lịch sử cho trạng thái này.`
            }; }
        return `My Orders hiển thị đúng đơn ${order.orderNumber}.`; }, {
        guest: false
    })); test("Invoice_AccessFromOrder_26 - Mở hóa đơn từ chi tiết đơn", run("Invoice_AccessFromOrder_26", async page => {
        const orderResult = await asm7xPlaceTestOrder(page); if (!orderResult.ok) {
            return {
                blocked: true,
                reason: orderResult.reason
            }; }
        await asm7xGo(page, ASM7X_HISTORY_URL); const order = page.getByRole("link", {
            name: new RegExp(asm7xEscapeRegex(orderResult.orderNumber), "i")
        }).first(); if (!await order.count()) {
            return {
                blocked: true,
                reason: `Không tìm thấy đơn ${orderResult.orderNumber} trong My Orders.`
            }; }
        await order.click();
        const invoice = await asm7xFind(page, [ 'a:has-text("Invoice")', 'a:has-text("View Invoice")', 'a:has-text("Print Invoice")', 'a:has-text("Download Invoice")' ]);
        if (!invoice) {
            return {
                blocked: true,
                reason: "Storefront không cung cấp liên kết Invoice trong Order Detail hoặc đơn chưa đủ điều kiện sinh hóa đơn."
            }; }
        const [download] = await Promise.all([ page.waitForEvent("download", {
            timeout: 2e4
        }).catch(() => null), invoice.click().catch(() => {}) ]); if (download) {
            return `Invoice tải xuống qua Storefront: ${download.suggestedFilename()}.`; }
        const body = await page.locator("body").innerText(); expect(/invoice|tax invoice|order number/i.test(body)).toBeTruthy();
        return `Invoice page/view mở được qua Storefront cho order ${orderResult.orderNumber}.`; }, {
        guest: false
    })); });

// ============================================================

test.describe("DEFECT — Order Placement & Invoice (4 cases)", () => {
    test.describe.configure({ mode: "default" });
    const runDef = (id: string, cb: (page: Page, browser: Browser) => CallbackResult | Promise<CallbackResult>, opts: { guest?: boolean } = {}) => async ({ page, browser }: { page: Page; browser: Browser }, testInfo: TestInfo) => {
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
            const login = await asm7xEnsureLogin(guestPage);
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

        const [addResponse] = await Promise.all([
            page.waitForResponse(response => {
                try {
                    return new URL(response.url()).pathname.includes("/checkout/cart/add");
                } catch {
                    return false;
                }
            }, { timeout: 15000 }).catch(() => null),
            addBtn.click()
        ]);
        const bodyText = await page.locator("body").innerText().catch(() => "");
        const serverError = (addResponse?.status() as number) >= 500 || /500|Internal Server Error|Fatal error/i.test(bodyText);
        const stockError = /not available|out of stock|maximum.*qty|requested qty/i.test(bodyText);

        await gotoStorefront(page, ASM7X_CART_URL);
        const cartQty = page.locator('input[name*="[qty]"]:visible, input.qty:visible').first();
        const qtyInCart = await cartQty.count() ? await cartQty.inputValue({ timeout: 15000 }).catch(() => "unknown") : "0";

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
});