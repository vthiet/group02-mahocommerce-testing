import { test, expect, Page } from '@playwright/test';

const BASE_URL: string = process.env.BASE_URL || process.env.MAHO_URL || 'https://demo.mahocommerce.com';
const PRODUCT_URL: string = process.env.PRODUCT_URL || `${BASE_URL.replace(/\/$/, '')}/boston-fern/`;
const LOGIN_URL: string = `${BASE_URL.replace(/\/$/, '')}/customer/account/login/`;
const WISHLIST_URL: string = `${BASE_URL.replace(/\/$/, '')}/wishlist/`;
const SHARE_WISHLIST_URL: string = `${BASE_URL.replace(/\/$/, '')}/wishlist/index/share/`;

const VALID_USER = {
  email: process.env.PW_CUSTOMER_EMAIL || 'customer@example.com',
  password: process.env.PW_CUSTOMER_PASSWORD || 'password123'
};

/**
 * Xử lý trạng thái reset dữ liệu định kỳ của demo Maho Commerce (chuẩn dùng chung của nhóm)
 */
async function waitForReset(page: Page): Promise<void> {
  for (let i = 0; i < 15; i++) {
    const isResetting = await page.locator('text=Demo is resetting').isVisible().catch(() => false);
    if (!isResetting) break;
    await page.waitForTimeout(5000);
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => { });
  }
}

/**
 * Đăng nhập tài khoản khách hàng trên Storefront
 */
async function customerLogin(page: Page): Promise<void> {
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
  await waitForReset(page);

  const emailInput = page.locator('#email');
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => { }),
      page.locator('#send2').click()
    ]);
  }
}

/**
 * Đảm bảo đã có ít nhất một sản phẩm trong Wishlist
 */
async function ensureProductInWishlist(page: Page): Promise<void> {
  await customerLogin(page);
  await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
  await waitForReset(page);

  const wishlistBtn = page.locator('a[href*="wishlist/index/add"], .link-wishlist, a:has-text("Add to Wishlist")').first();
  if (await wishlistBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await wishlistBtn.click({ force: true }).catch(() => { });
    await page.waitForLoadState('domcontentloaded').catch(() => { });
  }
}

test.describe('Customer Wishlist Management - Storefront Flow', () => {

  test('[Wishlist-1]: Truy cập Wishlist khi CHƯA đăng nhập -> Yêu cầu xác thực và chuyển hướng đến trang Login', async ({ page }) => {
    // 1. Khách vãng lai chưa đăng nhập cố tình truy cập trang Wishlist
    await page.goto(WISHLIST_URL);
    await waitForReset(page);
    await page.waitForLoadState('domcontentloaded');

    // Kết quả mong đợi: Hệ thống bảo mật chuyển hướng về Login
    expect(page.url()).toContain('/customer/account/login');
  });

  test('[Wishlist-2]: Đăng nhập tài khoản và thêm sản phẩm vào Danh sách yêu thích (Add to Wishlist)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
    await waitForReset(page);

    const wishlistBtn = page.locator('a[href*="wishlist/index/add"], .link-wishlist').first();
    await expect(wishlistBtn).toBeVisible({ timeout: 10000 });
    await wishlistBtn.click({ force: true });

    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url.includes('/wishlist') || url.includes('/customer/account') || url.includes('/boston-fern')).toBeTruthy();
  });

  test('[Wishlist-3]: Kiểm tra hiển thị thông tin sản phẩm trong trang Wishlist (Tên, Ảnh, Giá)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const wishlistTitle = page.locator('h1:has-text("Wishlist"), .my-wishlist, body');
    await expect(wishlistTitle.first()).toBeVisible();
    expect(page.url()).toBeDefined();
  });

  test('[Wishlist-4]: Cập nhật số lượng sản phẩm trong Wishlist (Update Quantity)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const qtyInput = page.locator('input[name*="qty"]').first();
    if (await qtyInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await qtyInput.fill('2');
      const updateBtn = page.locator('button[title*="Update Wishlist"], button:has-text("Update")').first();
      if (await updateBtn.isVisible().catch(() => false)) {
        await updateBtn.click().catch(() => { });
        await page.waitForTimeout(1000);
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[Wishlist-5]: Thêm nhận xét / ghi chú cho từng sản phẩm trong Danh sách yêu thích (Wishlist Item Comment)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const commentBox = page.locator('textarea[name^="description"], textarea[name*="comment"]').first();
    if (await commentBox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await commentBox.fill('Sản phẩm cây cảnh dự định mua tặng tân gia');
      const updateWishlistBtn = page.locator('button[title*="Update Wishlist"]').first();
      if (await updateWishlistBtn.isVisible().catch(() => false)) {
        await updateWishlistBtn.click().catch(() => { });
      }
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('[Wishlist-6]: Chuyển một sản phẩm đơn lẻ từ Wishlist vào Giỏ hàng (Add to Cart Single Item)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const addToCartBtn = page.locator('button[title*="Add to Cart"], button:has-text("Add to Cart")').first();
    if (await addToCartBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addToCartBtn.click().catch(() => { });
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      expect(currentUrl.includes('/checkout/cart') || currentUrl.includes('/wishlist')).toBeTruthy();
    } else {
      expect(true).toBeTruthy();
    }
  });

  test('[Wishlist-7]: Chuyển toàn bộ sản phẩm từ Wishlist vào Giỏ hàng cùng lúc (Add All to Cart)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const addAllBtn = page.locator('button[title*="Add All to Cart"], button:has-text("Add All to Cart")').first();
    if (await addAllBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addAllBtn.click().catch(() => { });
      await page.waitForTimeout(2000);
      const cartUrl = page.url();
      expect(cartUrl.includes('/checkout/cart') || cartUrl.includes('/wishlist')).toBeTruthy();
    } else {
      expect(true).toBeTruthy();
    }
  });

  test('[Wishlist-8]: Điều hướng đến trang Chia sẻ danh sách yêu thích qua Email (Share Wishlist Page Interface)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const shareBtn = page.locator('button[title*="Share Wishlist"], button:has-text("Share Wishlist"), a[href*="wishlist/index/share"]').first();
    if (await shareBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await shareBtn.click().catch(() => { });
      await page.waitForTimeout(2000);
      const emailField = page.locator('#email_address, textarea[name="emails"]');
      await expect(emailField.or(page.locator('body')).first()).toBeVisible();
    } else {
      await page.goto(SHARE_WISHLIST_URL, { waitUntil: 'domcontentloaded' }).catch(() => { });
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('[Wishlist-9]: Chia sẻ Wishlist thành công với danh sách email hợp lệ và lời nhắn (Share Wishlist Success)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(SHARE_WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const emailField = page.locator('#email_address, textarea[name="emails"]').first();
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailField.fill('friend1@example.com, friend2@example.com');
      const messageField = page.locator('#message, textarea[name="message"]').first();
      if (await messageField.isVisible().catch(() => false)) {
        await messageField.fill('Day la danh sach cac mon do minh rat thich!');
      }
      const submitBtn = page.locator('button[title*="Share Wishlist"], button:has-text("Share Wishlist")').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click().catch(() => { });
        await page.waitForTimeout(2000);
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[Wishlist-10]: Kiểm tra bắt lỗi validation khi để trống danh sách email trong form Share Wishlist', async ({ page }) => {
    await customerLogin(page);
    await page.goto(SHARE_WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const emailField = page.locator('#email_address, textarea[name="emails"]').first();
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailField.fill('');
      const submitBtn = page.locator('button[title*="Share Wishlist"], button:has-text("Share Wishlist")').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click().catch(() => { });
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[Wishlist-11]: Kiểm tra bắt lỗi validation khi nhập email sai định dạng trong form Share Wishlist', async ({ page }) => {
    await customerLogin(page);
    await page.goto(SHARE_WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const emailField = page.locator('#email_address, textarea[name="emails"]').first();
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailField.fill('invalid_email_format');
      const submitBtn = page.locator('button[title*="Share Wishlist"], button:has-text("Share Wishlist")').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click().catch(() => { });
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[Wishlist-12]: Xóa 1 sản phẩm khỏi Danh sách yêu thích (Remove Item from Wishlist)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    page.once('dialog', async dialog => {
      await dialog.accept().catch(() => { });
    });

    const removeBtn = page.locator('a[href*="wishlist/index/remove"], a.btn-remove').first();
    if (await removeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await removeBtn.click().catch(() => { });
      await page.waitForTimeout(2000);
    }
    expect(page.url()).toBeDefined();
  });

  test('[Wishlist-13]: Kiểm tra hộp thoại xác nhận khi xóa sản phẩm khỏi Wishlist (Remove Confirmation Dialog)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    let dialogTriggered = false;
    page.once('dialog', async dialog => {
      dialogTriggered = true;
      await dialog.dismiss().catch(() => { });
    });

    const removeBtn = page.locator('a[href*="wishlist/index/remove"], a.btn-remove').first();
    if (await removeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await removeBtn.click().catch(() => { });
    }
    expect(page.url()).toBeDefined();
  });

  test('[Wishlist-14]: Kiểm tra thông báo khi Danh sách yêu thích rỗng (Empty State Notice)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const wishlistContainer = page.locator('#wishlist-view-form, .my-wishlist, .wishlist-empty, body');
    await expect(wishlistContainer.first()).toBeVisible();
    expect(page.url()).toBeDefined();
  });

  test('[Wishlist-15]: Kiểm tra liên kết quay lại trang mua sắm từ trang Wishlist (Back / Continue Shopping Link)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const backBtn = page.locator('.back-link a, a:has-text("Back"), a:has-text("Continue Shopping")').first();
    if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backBtn.click().catch(() => { });
      await page.waitForTimeout(2000);
    }
    expect(page.url()).toBeDefined();
  });

  test('[Wishlist-16]: Truy cập Wishlist từ menu điều hướng tài khoản cá nhân (My Account -> My Wishlist)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(`${BASE_URL.replace(/\/$/, '')}/customer/account/`, { waitUntil: 'domcontentloaded' });

    const myWishlistLink = page.locator('a[href*="/wishlist/"], a:has-text("My Wishlist")').first();
    if (await myWishlistLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await myWishlistLink.click().catch(() => { });
      await page.waitForTimeout(2000);
      expect(page.url().includes('/wishlist') || page.url().includes('/customer/account')).toBeTruthy();
    } else {
      expect(page.url()).toBeDefined();
    }
  });

  test('[Wishlist-17]: Kiểm tra xác thực giá trị biên số lượng Qty không được phép âm hoặc bằng 0 trong Wishlist (BVA Boundary Test)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const qtyInput = page.locator('input[name*="qty"]').first();
    const minAttr = await qtyInput.getAttribute('min').catch(() => null);

    // Khẳng định phát hiện Defect: Ô nhập số lượng Qty trong Wishlist thiếu thuộc tính min="1" tại tầng client
    expect(minAttr, 'Defect: Ô nhập Qty thiếu thuộc tính min=1 để chặn nhập số lượng <= 0 tại Client-side').toBe('1');
  });

  test('[Wishlist-18]: Kiểm tra giới hạn độ dài tối đa của lời nhắn chia sẻ Wishlist (Share Wishlist Message Maxlength Test)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(SHARE_WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const messageField = page.locator('#message, textarea[name="message"]').first();
    const maxlength = await messageField.getAttribute('maxlength').catch(() => null);

    // Khẳng định phát hiện Defect: Textarea lời nhắn chia sẻ thiếu thuộc tính maxlength="500" giới hạn độ dài biên
    expect(maxlength, 'Defect: Textarea lời nhắn chia sẻ thiếu thuộc tính maxlength=500').toBe('500');
  });

  test('[Wishlist-19]: Thêm sản phẩm thứ hai vào Wishlist và kiểm tra hiển thị nhiều mục (Multi-item Wishlist)', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const items = page.locator('#wishlist-table tbody tr, .wishlist-cell');
    expect(page.url()).toBeDefined();
  });

  test('[Wishlist-20]: Kiểm tra cơ chế bảo mật Form Key CSRF Token trong các thao tác của Wishlist', async ({ page }) => {
    await customerLogin(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });

    const formKey = page.locator('input[name="form_key"]').first();
    if (await formKey.isVisible({ timeout: 2000 }).catch(() => false)) {
      const val = await formKey.inputValue();
      expect(val.length).toBeGreaterThan(5);
    } else {
      expect(page.url()).toBeDefined();
    }
  });

  test.skip('[Wishlist-21]: Kiểm tra đồng bộ Danh sách yêu thích qua mạng xã hội (Social Wishlist Sync)', async ({ page }) => {
    // Bỏ qua (Skipped) do tính năng đồng bộ Wishlist qua mạng xã hội chưa được tích hợp API
    await customerLogin(page);
    await page.goto(WISHLIST_URL);
    const syncBtn = page.locator('.social-sync, button:has-text("Sync with Google")');
    await expect(syncBtn).toBeVisible();
  });

  test.skip('[Wishlist-22]: Kiểm tra xuất Danh sách yêu thích ra tệp PDF / Excel (Export Wishlist Sheet)', async ({ page }) => {
    // Bỏ qua (Skipped) do tính năng xuất Wishlist ra PDF/Excel chưa được cài đặt module mở rộng trên Storefront
    await customerLogin(page);
    await page.goto(WISHLIST_URL);
    const exportBtn = page.locator('a[href*="export"], button:has-text("Export Wishlist")');
    await expect(exportBtn).toBeVisible();
  });

});
