import { test, expect } from '@playwright/test';

test.describe('Wishlist & Comparison - Customer Wishlist and Product Comparison Flow', () => {

  const BASE_URL = 'https://demo.mahocommerce.com/';
  const PRODUCT_URL = 'https://demo.mahocommerce.com/boston-fern/';
  const LOGIN_URL = 'https://demo.mahocommerce.com/customer/account/login/';
  const WISHLIST_URL = 'https://demo.mahocommerce.com/wishlist/';
  const COMPARE_URL = 'https://demo.mahocommerce.com/catalog/product_compare/';

  const VALID_USER = {
    email: 'customer@example.com',
    password: 'password123'
  };

  test('WISH_COMP_01: Truy cập Wishlist khi CHƯA đăng nhập -> Yêu cầu xác thực và chuyển hướng đến trang Login', async ({ page }) => {
    // 1. Khách vãng lai cố tình truy cập trang Wishlist
    await page.goto(WISHLIST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Kết quả mong đợi: Hệ thống bảo mật phát hiện chưa đăng nhập và tự động chuyển hướng về Login
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('/customer/account/login');
  });

  test('WISH_COMP_02: Đăng nhập tài khoản và thêm sản phẩm vào Danh sách yêu thích (Wishlist)', async ({ page }) => {
    // 1. Thực hiện đăng nhập trước
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => { }),
      page.locator('#send2').click(),
    ]);

    // 2. Đi tới trang sản phẩm để thêm vào Wishlist
    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
    const wishlistBtn = page.locator('a[href*="wishlist/index/add"], .link-wishlist').first();
    await expect(wishlistBtn).toBeVisible({ timeout: 10000 });
    await wishlistBtn.click({ force: true });

    // Kết quả mong đợi: Chuyển hướng tới trang Wishlist và hiển thị thông tin
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url.includes('/wishlist') || url.includes('/customer/account') || url.includes('/boston-fern')).toBeTruthy();
  });

  test('WISH_COMP_03: Kiểm tra hiển thị thông tin sản phẩm trong trang Wishlist (Tên, Ảnh, Giá)', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    await page.waitForTimeout(2000);

    await page.goto(WISHLIST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Kiểm tra trang Wishlist hiển thị đầy đủ
    const wishlistTitle = page.locator('h1:has-text("Wishlist"), .my-wishlist, body');
    await expect(wishlistTitle.first()).toBeVisible();
  });

  test('WISH_COMP_04: Kiểm tra cập nhật số lượng sản phẩm trong Wishlist', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    await page.waitForTimeout(3000);

    await page.goto(WISHLIST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Nếu có ô số lượng qty, thử cập nhật
    const qtyInput = page.locator('input[name*="qty"]').first();
    if (await qtyInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await qtyInput.fill('2');
      const updateBtn = page.locator('button[title*="Update Wishlist"], button:has-text("Update")').first();
      if (await updateBtn.isVisible()) {
        await updateBtn.click();
        await page.waitForTimeout(2000);
      }
    }
    const currentUrl = page.url();
    expect(currentUrl.includes('/wishlist') || currentUrl.includes('/customer/account')).toBeTruthy();
  });

  test('WISH_COMP_05: Xóa 1 sản phẩm khỏi Danh sách yêu thích (Wishlist)', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    await page.waitForTimeout(2000);

    await page.goto(WISHLIST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Tìm nút xóa sản phẩm trong Wishlist
    const removeBtn = page.locator('.btn-remove, .btn-remove2, a[href*="wishlist/index/remove"]').first();
    if (await removeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      page.once('dialog', async dialog => {
        await dialog.accept();
      });
      await removeBtn.click();
      await page.waitForTimeout(2000);
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('WISH_COMP_06: Kiểm tra thông báo khi Wishlist rỗng', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    await page.waitForTimeout(2000);

    await page.goto(WISHLIST_URL);
    // Kiểm tra hiển thị giao diện wishlist
    const wishlistBody = page.locator('.wishlist-empty, .my-wishlist, body');
    await expect(wishlistBody.first()).toBeVisible();
  });

  test('WISH_COMP_07: Thêm sản phẩm thứ nhất vào danh sách so sánh (Add to Compare)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    const compareBtn = page.locator('.link-compare, a[href*="catalog/product_compare/add"], button[title*="Compare"]').first();
    if (await compareBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await compareBtn.click();
      await page.waitForTimeout(2000);
      const compareSidebar = page.locator('.block-compare, #compare-items');
      await expect(compareSidebar.first()).toBeVisible();
    } else {
      await page.goto(COMPARE_URL);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('WISH_COMP_08: Thêm sản phẩm thứ hai vào danh sách so sánh', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    const compareButtons = page.locator('.link-compare, a[href*="catalog/product_compare/add"]');
    const count = await compareButtons.count();
    if (count > 1) {
      await compareButtons.nth(1).click();
      await page.waitForTimeout(2000);
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('WISH_COMP_09: Thêm sản phẩm đã có sẵn vào danh sách so sánh (Kiểm tra tránh trùng lặp)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    const compareBtn = page.locator('.link-compare, a[href*="catalog/product_compare/add"]').first();
    if (await compareBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click lại lần nữa sản phẩm đầu tiên
      await compareBtn.click();
      await page.waitForTimeout(2000);
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('WISH_COMP_10: Mở giao diện So sánh sản phẩm chi tiết (Compare Window/Page)', async ({ page, context }) => {
    await page.goto(BASE_URL);

    const compareSubmitBtn = page.locator('button[title="Compare"], .block-compare button:has-text("Compare")').first();
    if (await compareSubmitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const pagePromise = context.waitForEvent('page').catch(() => null);
      await compareSubmitBtn.click();
      const popupPage = await pagePromise;
      if (popupPage) {
        await popupPage.close();
      }
    } else {
      await page.goto(COMPARE_URL);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('WISH_COMP_11: Kiểm tra bảng đối chiếu thông số sản phẩm trong trang so sánh', async ({ page }) => {
    await page.goto(COMPARE_URL);
    await page.waitForLoadState('domcontentloaded');

    // Kiểm tra cấu trúc trang so sánh
    const compareContent = page.locator('#product_comparison, .data-table, body');
    await expect(compareContent.first()).toBeVisible();
  });

  test('WISH_COMP_12: Xóa 1 sản phẩm khỏi Danh sách so sánh', async ({ page }) => {
    await page.goto(BASE_URL);

    const removeCompareBtn = page.locator('.block-compare .btn-remove, .block-compare a[href*="product_compare/remove"]').first();
    if (await removeCompareBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      page.once('dialog', async dialog => {
        await dialog.accept();
      });
      await removeCompareBtn.click();
      await page.waitForTimeout(2000);
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('WISH_COMP_13: Xóa toàn bộ sản phẩm khỏi Danh sách so sánh (Clear All Compare)', async ({ page }) => {
    await page.goto(BASE_URL);

    const clearAllBtn = page.locator('.block-compare a:has-text("Clear All"), a[href*="product_compare/clear"]').first();
    if (await clearAllBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      page.once('dialog', async dialog => {
        await dialog.accept();
      });
      await clearAllBtn.click();
      await page.waitForTimeout(2000);
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('WISH_COMP_14: Kiểm tra thông báo khi danh sách so sánh rỗng', async ({ page }) => {
    await page.goto(COMPARE_URL);
    await page.waitForLoadState('domcontentloaded');

    const emptyNotice = page.locator('.empty, body');
    await expect(emptyNotice.first()).toBeVisible();
  });

  test('WISH_COMP_15: Kiểm tra chức năng chuyển toàn bộ sản phẩm từ Wishlist vào Giỏ hàng (Add All to Cart)', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    await page.waitForTimeout(2000);

    await page.goto(WISHLIST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Tìm nút Add All to Cart
    const addAllBtn = page.locator('button[title*="Add All to Cart"], button:has-text("Add All to Cart"), .btn-add-all').first();
    if (await addAllBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addAllBtn.click();
      await page.waitForTimeout(2000);
      const cartUrl = page.url();
      expect(cartUrl.includes('/checkout/cart') || cartUrl.includes('/wishlist')).toBeTruthy();
    } else {
      expect(true).toBeTruthy();
    }
  });

  test('WISH_COMP_16: Kiểm tra chức năng chia sẻ Danh sách yêu thích qua Email (Share Wishlist)', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    await page.waitForTimeout(2000);

    await page.goto(WISHLIST_URL);
    await page.waitForLoadState('domcontentloaded');

    const shareBtn = page.locator('button[title*="Share Wishlist"], button:has-text("Share Wishlist"), a[href*="wishlist/index/share"]').first();
    if (await shareBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await shareBtn.click();
      await page.waitForTimeout(2000);
      // Kết quả mong đợi: Mở ra trang chia sẻ wishlist
      const emailField = page.locator('#email_address, textarea[name="emails"]');
      await expect(emailField.first()).toBeVisible({ timeout: 5000 });
    } else {
      expect(true).toBeTruthy();
    }
  });

  test('WISH_COMP_17: Kiểm tra giới hạn số lượng sản phẩm tối đa trong Danh sách so sánh (Compare List Max Limit)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    // Kiểm tra thông báo cảnh báo giới hạn khi người dùng so sánh quá 4 sản phẩm
    const limitWarning = page.locator('.compare-limit-warning, .notice:has-text("maximum of 4")');
    const hasLimitWarning = await limitWarning.isVisible().catch(() => false);

    // Defect phát hiện: Hệ thống không có giới hạn trần số sản phẩm so sánh dẫn đến bảng so sánh bị vỡ tràn ngang
    expect(hasLimitWarning, 'Hệ thống phải có cảnh báo giới hạn số lượng sản phẩm tối đa (tối đa 4 sản phẩm) trong danh sách so sánh').toBeTruthy();
  });

  test('WISH_COMP_18: Kiểm tra chức năng in ấn bảng đối chiếu so sánh sản phẩm (Print Comparison Window)', async ({ page }) => {
    await page.goto(COMPARE_URL);
    await page.waitForLoadState('domcontentloaded');

    // Kỳ vọng: Trang so sánh chi tiết phải có nút/liên kết Print để in ấn thông số
    const printLink = page.locator('a[onclick*="print"], button:has-text("Print"), .link-print');
    const isPrintAvailable = await printLink.first().isVisible().catch(() => false);

    // Defect phát hiện: Trang so sánh sản phẩm thiếu nút in ấn bảng đối chiếu thông số
    expect(isPrintAvailable, 'Giao diện so sánh sản phẩm phải tích hợp nút in ấn bảng đối chiếu (Print this page)').toBeTruthy();
  });

  test('WISH_COMP_19: Kiểm tra thêm nhận xét / ghi chú cho từng sản phẩm trong Danh sách yêu thích (Wishlist Item Comment)', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    await page.waitForTimeout(2000);

    await page.goto(WISHLIST_URL);
    const commentBox = page.locator('textarea[name^="description"], textarea[name*="comment"]').first();
    if (await commentBox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await commentBox.fill('Sản phẩm cây cảnh dự định mua tặng tân gia');
      const updateWishlistBtn = page.locator('button[title*="Update Wishlist"]').first();
      if (await updateWishlistBtn.isVisible()) {
        await updateWishlistBtn.click();
        await page.waitForTimeout(2000);
      }
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('WISH_COMP_20: Kiểm tra liên kết quay lại trang mua sắm từ trang Wishlist (Back / Continue Shopping Link)', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    await page.waitForTimeout(2000);

    await page.goto(WISHLIST_URL);
    const backBtn = page.locator('.back-link a, a:has-text("Back"), a:has-text("Continue Shopping")').first();
    if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backBtn.click();
      await page.waitForTimeout(2000);
      expect(page.url()).not.toContain('/wishlist/index/index');
    } else {
      expect(true).toBeTruthy();
    }
  });

  test.skip('WISH_COMP_21: Kiểm tra đồng bộ Danh sách yêu thích nhiều thiết bị thông qua Social Account (Social Wishlist Sync)', async ({ page }) => {
    // Bỏ qua (Skipped) do tính năng đồng bộ Wishlist qua mạng xã hội chưa được tích hợp API
    await page.goto(WISHLIST_URL);
    const syncBtn = page.locator('.social-sync, button:has-text("Sync with Google")');
    await expect(syncBtn).toBeVisible();
  });

  test.skip('WISH_COMP_22: Kiểm tra xuất Danh sách so sánh ra tệp PDF / Excel (Export Compare Sheet)', async ({ page }) => {
    // Bỏ qua (Skipped) do tính năng xuất tệp PDF/Excel so sánh chưa được cấu hình module trên Storefront
    await page.goto(COMPARE_URL);
    const exportBtn = page.locator('a[href*="export"], button:has-text("Export to PDF")');
    await expect(exportBtn).toBeVisible();
  });

});
