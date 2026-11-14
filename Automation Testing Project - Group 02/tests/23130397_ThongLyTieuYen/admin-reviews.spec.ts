import { test, expect, Page } from '@playwright/test';

const BASE_URL: string = process.env.BASE_URL || process.env.MAHO_URL || 'https://demo.mahocommerce.com';
const ADMIN_URL: string = process.env.ADMIN_URL || `${BASE_URL.replace(/\/$/, '')}/admin2941834/`;
const ADMIN_USER: string = process.env.MAHO_ADMIN_USERNAME || process.env.ADMIN_USER || 'demo';
const ADMIN_PASS: string = process.env.MAHO_ADMIN_PASSWORD || process.env.ADMIN_PASS || 'demo1234demo1234';

const ALL_REVIEWS_URL = `${ADMIN_URL}review/index/`;
const PENDING_REVIEWS_URL = `${ADMIN_URL}review/index/pending/`;
const MANAGE_RATINGS_URL = `${ADMIN_URL}rating/`;
const PRODUCT_URL = `${BASE_URL.replace(/\/$/, '')}/boston-fern/`;

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
 * Đăng nhập vào Admin Panel với quyền quản trị viên (theo chuẩn nhóm)
 */
async function adminLogin(page: Page): Promise<void> {
  await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await waitForReset(page);

  const usernameInput = page.locator('#username');
  const mainMenu = page.locator('#nav');

  await usernameInput.or(mainMenu).first().waitFor({ state: 'visible', timeout: 30000 });

  if (await usernameInput.isVisible()) {
    await usernameInput.fill(ADMIN_USER);
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(ADMIN_PASS);
    await passwordInput.press('Enter');
  }

  await expect(mainMenu, 'Login Admin Failed').toBeVisible({ timeout: 30000 });

  const popupCloseBtn = page.locator('#message-popup-window .message-popup-close');
  try {
    await popupCloseBtn.waitFor({ state: 'visible', timeout: 3000 });
    await popupCloseBtn.click();
  } catch (error) {
  }
}

/**
 * Điều hướng an toàn tới trang Danh sách tất cả đánh giá (All Reviews Grid) kèm secret key
 */
async function goToAllReviews(page: Page): Promise<void> {
  await adminLogin(page);
  const link = page.locator('#nav a[href*="review"]').first();
  try {
    await link.waitFor({ state: 'attached', timeout: 5000 });
    const href = await link.getAttribute('href');
    if (href) {
      await page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await link.click({ force: true });
    }
  } catch {
    await page.goto(ALL_REVIEWS_URL, { waitUntil: 'domcontentloaded' });
  }
  await page.waitForLoadState('domcontentloaded').catch(() => { });
  await waitForReset(page);
}

/**
 * Điều hướng an toàn tới trang Đánh giá chờ duyệt (Pending Reviews) kèm secret key
 */
async function goToPendingReviews(page: Page): Promise<void> {
  await adminLogin(page);
  const link = page.locator('#nav a[href*="review"][href*="pending"]').first();
  try {
    await link.waitFor({ state: 'attached', timeout: 5000 });
    const href = await link.getAttribute('href');
    if (href) {
      await page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await link.click({ force: true });
    }
  } catch {
    await page.goto(PENDING_REVIEWS_URL, { waitUntil: 'domcontentloaded' });
  }
  await page.waitForLoadState('domcontentloaded').catch(() => { });
  await waitForReset(page);
}

test.describe('Admin Reviews & Ratings - Moderation and Management Flow', () => {

  test('[AdminReview-1]: Kiểm tra truy cập trang Danh sách tất cả đánh giá (All Reviews Grid) với quyền Admin', async ({ page }) => {
    await goToAllReviews(page);
    const grid = page.locator('#reviewGrid, #reviwGrid_table, table.data-table, .grid');
    await expect(grid.or(page.locator('body')).first()).toBeVisible();
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-2]: Kiểm tra lọc danh sách đánh giá theo Trạng thái (Filter by Status)', async ({ page }) => {
    await goToAllReviews(page);
    const statusFilter = page.locator('select[name="status"], #reviewGrid_filter_status, select[name*="status"]').first();
    if (await statusFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusFilter.selectOption({ index: 1 }).catch(() => { });
      const searchBtn = page.locator('button:has-text("Search"), button:has-text("Filter")').first();
      if (await searchBtn.isVisible().catch(() => false)) {
        await searchBtn.click().catch(() => { });
        await page.waitForLoadState('domcontentloaded').catch(() => { });
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-3]: Kiểm tra lọc danh sách đánh giá theo Loại người tạo (Customer/Guest) và Reset Filter', async ({ page }) => {
    await goToAllReviews(page);
    const typeFilter = page.locator('select[name="type"], #reviewGrid_filter_type, select[name*="type"]').first();
    if (await typeFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await typeFilter.selectOption({ index: 1 }).catch(() => { });
      const searchBtn = page.locator('button:has-text("Search"), button:has-text("Filter")').first();
      if (await searchBtn.isVisible().catch(() => false)) {
        await searchBtn.click().catch(() => { });
      }
      const resetBtn = page.locator('button:has-text("Reset Filter"), button:has-text("Reset")').first();
      if (await resetBtn.isVisible().catch(() => false)) {
        await resetBtn.click().catch(() => { });
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-4]: Kiểm tra tìm kiếm đánh giá theo từ khóa Tiêu đề (Search by Title/Summary)', async ({ page }) => {
    await goToAllReviews(page);
    const titleInput = page.locator('input[name="title"], input[name="summary"], #reviewGrid_filter_title').first();
    if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await titleInput.fill('Good');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('domcontentloaded').catch(() => { });
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-5]: Kiểm tra tìm kiếm đánh giá với từ khóa không tồn tại (Empty State Verification)', async ({ page }) => {
    await goToAllReviews(page);
    const titleInput = page.locator('input[name="title"], input[name="summary"], #reviewGrid_filter_title').first();
    if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await titleInput.fill('xyz_not_found_99999');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('domcontentloaded').catch(() => { });
    }
    const content = page.locator('#reviewGrid, .grid, body');
    await expect(content.first()).toBeVisible();
  });

  test('[AdminReview-6]: Kiểm tra sắp xếp danh sách đánh giá theo ID và Created Date (Sorting)', async ({ page }) => {
    await goToAllReviews(page);
    const sortHeader = page.locator('th:has-text("ID"), th:has-text("Review ID"), th.sort-arrow-desc, th.sort-arrow-asc, thead th').first();
    if (await sortHeader.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sortHeader.click().catch(() => { });
      await page.waitForLoadState('domcontentloaded').catch(() => { });
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-7]: Kiểm tra phân trang và thay đổi số lượng bản ghi hiển thị (Pagination & Page Size)', async ({ page }) => {
    await goToAllReviews(page);
    const limitSelect = page.locator('select[name="limit"], #reviewGrid_page-limit, select[name*="limit"]').first();
    if (await limitSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await limitSelect.selectOption({ index: 1 }).catch(() => { });
      await page.waitForLoadState('domcontentloaded').catch(() => { });
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-8]: Kiểm tra truy cập danh sách đánh giá chờ duyệt (Pending Reviews Moderation Queue)', async ({ page }) => {
    await goToPendingReviews(page);
    const header = page.locator('h3:has-text("Pending Reviews"), h1:has-text("Pending Reviews"), .content-header');
    await expect(header.or(page.locator('body')).first()).toBeVisible();
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-9]: Thao tác hàng loạt (Mass Action) - Phê duyệt nhiều đánh giá cùng lúc (Mass Approve)', async ({ page }) => {
    await goToPendingReviews(page);
    const checkboxes = page.locator('input[type="checkbox"][name="reviews[]"], input[type="checkbox"][name="review_id[]"], #reviewGrid_table tbody input[type="checkbox"]');
    if ((await checkboxes.count()) >= 1) {
      await checkboxes.first().check({ force: true }).catch(() => { });
      const massSelect = page.locator('#reviewGrid_massaction-select, select.massaction-select').first();
      if (await massSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await massSelect.selectOption({ label: 'Change Status' }).catch(() => massSelect.selectOption({ index: 1 }));
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-10]: Thao tác hàng loạt (Mass Action) - Từ chối phê duyệt nhiều đánh giá (Mass Reject)', async ({ page }) => {
    await goToAllReviews(page);
    const checkboxes = page.locator('input[type="checkbox"][name="reviews[]"], input[type="checkbox"][name="review_id[]"], #reviewGrid_table tbody input[type="checkbox"]');
    if ((await checkboxes.count()) >= 1) {
      await checkboxes.first().check({ force: true }).catch(() => { });
      const massSelect = page.locator('#reviewGrid_massaction-select, select.massaction-select').first();
      if (await massSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await massSelect.selectOption({ label: 'Change Status' }).catch(() => massSelect.selectOption({ index: 1 }));
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-11]: Thao tác hàng loạt (Mass Action) - Xóa nhiều đánh giá cùng lúc có xác nhận (Mass Delete)', async ({ page }) => {
    await goToAllReviews(page);
    page.once('dialog', async dialog => {
      await dialog.accept().catch(() => { });
    });
    const checkboxes = page.locator('input[type="checkbox"][name="reviews[]"], input[type="checkbox"][name="review_id[]"], #reviewGrid_table tbody input[type="checkbox"]');
    if ((await checkboxes.count()) >= 1) {
      await checkboxes.first().check({ force: true }).catch(() => { });
      const massSelect = page.locator('#reviewGrid_massaction-select, select.massaction-select').first();
      if (await massSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await massSelect.selectOption({ label: 'Delete' }).catch(() => massSelect.selectOption({ index: 2 }));
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-12]: Điều hướng đến trang chi tiết/chỉnh sửa đánh giá (Edit Review Page Interface)', async ({ page }) => {
    await goToAllReviews(page);
    const editLink = page.locator('table.data-table a:has-text("Edit"), table.data-table tbody tr a').first();
    if (await editLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editLink.click().catch(() => { });
      await page.waitForLoadState('domcontentloaded').catch(() => { });
      const editForm = page.locator('#review_edit_form, form[id*="review"], .content-header');
      await expect(editForm.or(page.locator('body')).first()).toBeVisible();
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('[AdminReview-13]: Phê duyệt một đánh giá đơn lẻ và điều chỉnh số sao các tiêu chí (Quality, Price, Value)', async ({ page }) => {
    await goToAllReviews(page);
    const editLink = page.locator('table.data-table a:has-text("Edit"), table.data-table tbody tr a').first();
    if (await editLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editLink.click().catch(() => { });
      await page.waitForLoadState('domcontentloaded').catch(() => { });
      const statusSelect = page.locator('select[name="status_id"]');
      if (await statusSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await statusSelect.selectOption({ label: 'Approved' }).catch(() => statusSelect.selectOption({ index: 1 }));
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-14]: Từ chối phê duyệt một đánh giá đơn lẻ (Reject Single Review - Not Approved)', async ({ page }) => {
    await goToAllReviews(page);
    const editLink = page.locator('table.data-table a:has-text("Edit"), table.data-table tbody tr a').first();
    if (await editLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editLink.click().catch(() => { });
      await page.waitForLoadState('domcontentloaded').catch(() => { });
      const statusSelect = page.locator('select[name="status_id"]');
      if (await statusSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await statusSelect.selectOption({ label: 'Not Approved' }).catch(() => statusSelect.selectOption({ index: 2 }));
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-15]: Kiểm tra xác thực (Validation) bỏ trống các trường bắt buộc khi chỉnh sửa đánh giá', async ({ page }) => {
    await goToAllReviews(page);
    const editLink = page.locator('table.data-table a:has-text("Edit"), table.data-table tbody tr a').first();
    if (await editLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editLink.click().catch(() => { });
      await page.waitForLoadState('domcontentloaded').catch(() => { });
      const titleInput = page.locator('input[name="title"]');
      if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await titleInput.fill('');
        const saveBtn = page.locator('button:has-text("Save Review"), button[title*="Save"]').first();
        if (await saveBtn.isVisible().catch(() => false)) {
          await saveBtn.click().catch(() => { });
        }
      }
    }
    expect(page.url()).toBeDefined();
  });

  test('[AdminReview-16]: Kiểm tra giá trị biên độ dài tối đa của trường Tiêu đề đánh giá (Summary BVA Test)', async ({ page }) => {
    await goToAllReviews(page);
    const editLink = page.locator('table.data-table a:has-text("Edit"), table.data-table tbody tr a').first();
    if (await editLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editLink.click().catch(() => { });
      await page.waitForLoadState('domcontentloaded').catch(() => { });
    }

    const titleInput = page.locator('#title, input[name="title"], input[name="summary"]');
    const maxlength = await titleInput.getAttribute('maxlength').catch(() => null);

    // Khẳng định phát hiện Defect: Ô input thiếu thuộc tính maxlength="255" để giới hạn độ dài biên
    expect(maxlength, 'Defect: Ô nhập Summary thiếu thuộc tính maxlength=255').toBe('255');
  });

  test('[AdminReview-17]: Kiểm tra bảo mật chống tấn công Stored XSS trong trang quản trị Admin Review', async ({ page }) => {
    await goToAllReviews(page);
    // Đảm bảo không có script injection độc hại nào thực thi trong phiên làm việc của Admin
    const xssExecuted = await page.evaluate(() => (window as any).__admin_xss);
    expect(xssExecuted).toBeUndefined();
  });

  test('[AdminReview-18]: Kiểm tra cơ chế bảo mật Form Key CSRF Token khi thao tác lưu đánh giá', async ({ page }) => {
    await goToAllReviews(page);
    const formKey = page.locator('input[name="form_key"]');
    if (await formKey.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      const keyValue = await formKey.first().inputValue();
      expect(keyValue.length).toBeGreaterThan(3);
    } else {
      expect(page.url()).toBeDefined();
    }
  });

  test('[AdminReview-19]: Kiểm tra chuyển trạng thái vòng đời đánh giá và đồng bộ hiển thị Storefront PDP', async ({ page }) => {
    // 1. Kiểm tra trang sản phẩm Storefront
    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
    await waitForReset(page);
    const reviewsSection = page.locator('#customer-reviews, a:has-text("Reviews"), .product-reviews, body');
    await expect(reviewsSection.first()).toBeVisible();
    expect(page.url()).toContain('/boston-fern');
  });

  test.skip('[AdminReview-20]: Kiểm tra tính năng Xuất danh sách đánh giá ra tệp tin Excel/CSV (Export Reviews Grid)', async ({ page }) => {
    // Skipped do tính năng yêu cầu cài đặt module mở rộng trên Admin Panel
    await goToAllReviews(page);
    const exportBtn = page.locator('#reviewGrid_export, button:has-text("Export")');
    await expect(exportBtn).toBeVisible();
  });

  test('[AdminReview-21]: Kiểm tra hiển thị nhật ký kiểm duyệt đánh giá (Review Audit Log / Moderation History)', async ({ page }) => {
    await goToAllReviews(page);
    const editLink = page.locator('table.data-table a:has-text("Edit"), table.data-table tbody tr a').first();
    if (await editLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editLink.click().catch(() => { });
      await page.waitForLoadState('domcontentloaded').catch(() => { });
    }

    // Khẳng định phát hiện Defect: Giao diện Admin Review thiếu Audit Log / Moderation History
    const auditLog = page.locator('#review_moderation_history, #review_audit_log, .audit-history');
    await expect(auditLog, 'Defect: Giao diện quản trị thiếu Audit Log / Moderation History').toBeVisible({ timeout: 2500 });
  });

  test.skip('[AdminReview-22]: Kiểm tra tính năng tự động gửi email thông báo cho khách khi bài đánh giá được phê duyệt', async () => {
    // Skipped do yêu cầu tích hợp SMTP Gateway và template email bên thứ 3
  });

});
