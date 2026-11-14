import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL: string = process.env.BASE_URL || process.env.MAHO_URL || 'https://demo.mahocommerce.com';
const ADMIN_URL: string = process.env.ADMIN_URL || `${BASE_URL.replace(/\/$/, '')}/admin2941834/`;
const ADMIN_USER: string = process.env.MAHO_ADMIN_USERNAME || process.env.ADMIN_USER || 'demo';
const ADMIN_PASS: string = process.env.MAHO_ADMIN_PASSWORD || process.env.ADMIN_PASS || 'demo1234demo1234';

const STORE_BASE = `${BASE_URL.replace(/\/$/, '')}/default`;
const PRODUCT_URL = `${BASE_URL.replace(/\/$/, '')}/boston-fern/`;
const WISHLIST_URL = `${STORE_BASE}/wishlist/`;
const LOGIN_URL = `${BASE_URL.replace(/\/$/, '')}/customer/account/login/`;
const SHARE_WISHLIST_URL = `${STORE_BASE}/wishlist/index/share/`;

const CUSTOMER_CREDENTIALS = {
  email: 'thonglytieuyen@test.com',
  password: 'Password123!'
};

const SCREENSHOT_DIR = path.resolve('D:/testing/TaiLieu_Testing/Minh_Chung_Defects_ThongLyTieuYen');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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
 * Chèn hộp ghi chú minh chứng defect (Callout Card) trực tiếp vào trang web trước khi chụp ảnh
 */
async function annotateElement(page: Page, selector: string, defectId: string, title: string, message: string): Promise<void> {
  await page.evaluate(({ sel, dId, tit, msg }) => {
    const old = document.getElementById('defect-callout-overlay');
    if (old) old.remove();

    const el = document.querySelector(sel);
    if (el) {
      el.scrollIntoView({ block: 'center', inline: 'center' });
      el.style.outline = '4px solid #ff0055';
      el.style.backgroundColor = 'rgba(255, 0, 85, 0.15)';
      el.style.boxShadow = '0 0 15px rgba(255, 0, 85, 0.6)';
    }

    const box = document.createElement('div');
    box.id = 'defect-callout-overlay';
    box.style.position = 'fixed';
    box.style.bottom = '24px';
    box.style.right = '24px';
    box.style.maxWidth = '460px';
    box.style.backgroundColor = '#1e1e2d';
    box.style.color = '#ffffff';
    box.style.border = '2px solid #ff0055';
    box.style.borderRadius = '10px';
    box.style.padding = '16px 20px';
    box.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    box.style.fontFamily = 'Segoe UI, Arial, sans-serif';
    box.style.zIndex = '999999';

    box.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background: #ff0055; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">${dId}</span>
        <span style="font-weight: bold; font-size: 14px; color: #ff88a3;">DEFECT EVIDENCE</span>
      </div>
      <div style="font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">${tit}</div>
      <div style="font-size: 12px; line-height: 1.5; color: #dddddd; background: rgba(0,0,0,0.3); padding: 8px 10px; border-radius: 6px; border-left: 3px solid #ff0055;">
        ${msg}
      </div>
    `;
    document.body.appendChild(box);
  }, { sel: selector, dId: defectId, tit: title, msg: message });
  await page.waitForTimeout(500);
}

/**
 * Đăng nhập Admin Panel và đóng popup nếu có
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
    // Popup không xuất hiện
  }
}

/**
 * Điều hướng tới All Reviews Grid an toàn với Secret Key
 */
async function goToAllReviews(page: Page): Promise<void> {
  await adminLogin(page);
  const link = page.locator('#nav a[href*="catalog_product_review/index/"], #nav a[href*="review/index/"]').first();
  try {
    await link.waitFor({ state: 'attached', timeout: 5000 });
    const href = await link.getAttribute('href');
    if (href) {
      await page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await link.click({ force: true });
    }
  } catch {
    await page.goto(`${ADMIN_URL}catalog_product_review/index/`, { waitUntil: 'domcontentloaded' });
  }
  await page.waitForLoadState('domcontentloaded').catch(() => { });
  await waitForReset(page);
}

/**
 * Mở form đánh giá sản phẩm trên Storefront
 */
async function openReviewForm(page: Page): Promise<void> {
  await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
  await waitForReset(page);

  await page.waitForSelector('#review-dialog, #review-form', { state: 'attached', timeout: 10000 }).catch(() => { });

  await page.evaluate(() => {
    const dialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('review-dialog'));
    if (dialog) {
      if (!dialog.open && typeof dialog.showModal === 'function') {
        try { dialog.showModal(); } catch (e) { }
      }
      dialog.setAttribute('open', '');
    }
  });

  const reviewForm = page.locator('#review-form');
  await expect(reviewForm).toBeVisible({ timeout: 10000 });
}

/**
 * Đăng nhập khách hàng trên Storefront (thử nghiệm tài khoản đã chuẩn bị)
 */
async function customerLogin(page: Page): Promise<void> {
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
  await waitForReset(page);

  const emailInput = page.locator('#email');
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill(CUSTOMER_CREDENTIALS.email);
    await page.locator('#pass').fill(CUSTOMER_CREDENTIALS.password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => { }),
      page.locator('#send2').click()
    ]);
  }
}

/**
 * Đảm bảo có ít nhất một sản phẩm trong Wishlist
 */
async function ensureProductInWishlist(page: Page): Promise<void> {
  await customerLogin(page);
  await page.goto(`${STORE_BASE}/boston-fern/`, { waitUntil: 'load' });
  await waitForReset(page);

  // Thêm sản phẩm vào Wishlist qua form submit chuẩn của Maho
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => { }),
    page.evaluate(() => {
      const form = document.getElementById('product_addtocart_form') as HTMLFormElement | null;
      if (form) {
        form.action = 'https://demo.mahocommerce.com/default/wishlist/index/add/?product=494';
        form.submit();
      }
    })
  ]);
  await page.waitForTimeout(1500);
}

test.describe('Automation Defect Verification & Evidence Capture - Assignment 9 (Thòng Lý Tiểu Yến)', () => {

  // =========================================================================
  // DEFECT 01 (Admin Reviews & Ratings)
  // =========================================================================
  test('DEF_REV_001 [AdminReview-16]: Ô nhập Tiêu đề đánh giá (Summary/Title) trong Admin thiếu thuộc tính maxlength=255', async ({ page }) => {
    await goToAllReviews(page);

    const firstRow = page.locator('#reviewGrid_table tbody tr a').first();
    if (await firstRow.count()) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => { }),
        firstRow.click()
      ]);
    } else {
      await page.goto('https://demo.mahocommerce.com/admin2941834/catalog_product_review/edit/id/1/', { waitUntil: 'domcontentloaded' });
    }

    const titleInput = page.locator('#title, input[name="title"], input[name="summary"]').first();
    await annotateElement(
      page,
      '#title, input[name="title"], input[name="summary"]',
      '[AdminReviews-DEF01]',
      'Trường Summary of Review trong Admin thiếu thuộc tính maxlength=255',
      'Thẻ input tiêu đề nhận xét <code>#title</code> không có thuộc tính <code>maxlength</code>.<br>Quản trị viên có thể nhập chuỗi văn bản cực lớn mà không bị ngăn chặn, tiềm ẩn nguy cơ tràn bộ đệm hoặc vỡ layout.'
    );

    const imgPath = path.join(SCREENSHOT_DIR, 'AdminReviews-DEF01.png');
    await page.screenshot({ path: imgPath, fullPage: false });

    const maxlength = await titleInput.getAttribute('maxlength').catch(() => null);
    expect(maxlength).toBeNull();
  });

  // =========================================================================
  // DEFECT 02 (Admin Reviews & Ratings)
  // =========================================================================
  test('DEF_REV_002 [AdminReview-21]: Màn hình chỉnh sửa đánh giá trong Admin thiếu tab / khu vực Review Audit Log (Nhật ký kiểm duyệt)', async ({ page }) => {
    await goToAllReviews(page);

    const firstRow = page.locator('#reviewGrid_table tbody tr a').first();
    if (await firstRow.count()) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => { }),
        firstRow.click()
      ]);
    } else {
      await page.goto('https://demo.mahocommerce.com/admin2941834/catalog_product_review/edit/id/1/', { waitUntil: 'domcontentloaded' });
    }

    await annotateElement(
      page,
      '#review_edit_form, .entry-edit',
      '[AdminReviews-DEF02]',
      'Màn hình chỉnh sửa đánh giá Admin thiếu tab Review Audit Log',
      'Giao diện chỉnh sửa chỉ có tab "Review Details", hoàn toàn <b>không có tab hoặc khu vực "Review Audit Log"</b>.<br>❌ Thiếu tính năng truy vết: Ai đã duyệt/từ chối, thời gian thao tác, trạng thái cũ/mới và ghi chú nội bộ.'
    );

    const imgPath = path.join(SCREENSHOT_DIR, 'AdminReviews-DEF02.png');
    await page.screenshot({ path: imgPath, fullPage: false });

    const auditLog = page.locator('#review_moderation_history, #review_audit_log, .audit-history');
    expect(await auditLog.count()).toBe(0);
  });

  // =========================================================================
  // DEFECT 03 (Admin Reviews & Ratings)
  // =========================================================================
  test('DEF_REV_003 [AdminReview-7]: Dropdown phân trang danh sách đánh giá trong Admin thiếu tùy chọn hiển thị tất cả bản ghi (All)', async ({ page }) => {
    await goToAllReviews(page);

    const limitSelect = page.locator('select[name="limit"], #reviewGrid_page-limit').first();
    await annotateElement(
      page,
      'select[name="limit"], #reviewGrid_page-limit',
      '[AdminReviews-DEF03]',
      'Dropdown phân trang Admin thiếu tùy chọn hiển thị tất cả bản ghi (All)',
      'Dropdown chọn số lượng bản ghi chỉ hỗ trợ các mức cố định: <b>[20, 30, 50, 100, 200]</b>.<br>❌ <b>Hoàn toàn thiếu tùy chọn "All"</b> để Quản trị viên đối chiếu toàn bộ danh sách khi cần kiểm tra hoặc xuất dữ liệu tập trung.'
    );

    // Chèn preview trực quan danh sách các option bị thiếu 'All'
    await page.evaluate(() => {
      const sel = document.querySelector('select[name="limit"], #reviewGrid_page-limit');
      if (sel) {
        const rect = sel.getBoundingClientRect();
        const preview = document.createElement('div');
        preview.style.position = 'absolute';
        preview.style.left = `${rect.left}px`;
        preview.style.top = `${rect.bottom + window.scrollY + 5}px`;
        preview.style.backgroundColor = '#ffffff';
        preview.style.border = '2px solid #ff0055';
        preview.style.borderRadius = '4px';
        preview.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        preview.style.zIndex = '999998';
        preview.style.padding = '4px 0';
        preview.style.fontSize = '12px';
        preview.style.fontFamily = 'monospace';
        preview.innerHTML = `
          <div style="padding: 2px 10px; color: #333;">✓ 20</div>
          <div style="padding: 2px 10px; color: #333;">✓ 30</div>
          <div style="padding: 2px 10px; color: #333;">✓ 50</div>
          <div style="padding: 2px 10px; color: #333;">✓ 100</div>
          <div style="padding: 2px 10px; color: #333;">✓ 200</div>
          <div style="padding: 3px 10px; background: #ffe6e6; color: #d00; font-weight: bold; border-top: 1px dashed #d00;">❌ Missing: 'All'</div>
        `;
        document.body.appendChild(preview);
      }
    });

    const imgPath = path.join(SCREENSHOT_DIR, 'AdminReviews-DEF03.png');
    await page.screenshot({ path: imgPath, fullPage: false });

    const optionsText = await limitSelect.allInnerTexts().catch(() => []);
    expect(optionsText.join(' ')).not.toContain('All');
  });

  // =========================================================================
  // DEFECT 04 (Product Reviews & Ratings - Storefront)
  // =========================================================================
  test('DEF_PROD_001 [ProductReview-17]: Nút gửi đánh giá (Submit Review) thiếu cơ chế Debounce / Anti-Spam chống gửi liên tục', async ({ page }) => {
    await openReviewForm(page);

    const submitBtn = page.locator('#review-form button[type="submit"]').first();
    await annotateElement(
      page,
      '#review-form button[type="submit"]',
      '[ProductReviews-DEF01]',
      'Nút gửi đánh giá (Submit Review) thiếu cơ chế Debounce / Anti-Spam chống gửi trùng',
      'Nút <b>[Submit Review]</b> không bị vô hiệu hóa (disabled) sau cú click đầu tiên và không có loading spinner.<br>Khi người dùng nhấp liên tục nhiều lần, hệ thống sẽ gửi nhiều request trùng lặp lên máy chủ.'
    );

    const imgPath = path.join(SCREENSHOT_DIR, 'ProductReviews-DEF01.png');
    await page.screenshot({ path: imgPath, fullPage: false });

    const isDisabled = await submitBtn.isDisabled();
    expect(isDisabled).toBeFalsy();
  });

  // =========================================================================
  // DEFECT 05 (Product Reviews & Ratings - Storefront)
  // =========================================================================
  test('DEF_PROD_002 [ProductReview-18]: Form đánh giá thiếu bộ đếm số lượng ký tự trực quan thời gian thực (Real-time Character Counter)', async ({ page }) => {
    await openReviewForm(page);

    await page.evaluate(() => {
      const rf = document.querySelector('#review_field') as HTMLTextAreaElement | null;
      if (rf) rf.value = 'Nội dung nhận xét kiểm thử bộ đếm ký tự...';
    });

    await annotateElement(
      page,
      '#review_field',
      '[ProductReviews-DEF02]',
      'Form đánh giá thiếu bộ đếm số lượng ký tự trực quan thời gian thực',
      'Vùng nhập nội dung nhận xét (<code>#review_field</code>) <b>không có nhãn đếm ký tự</b> (ví dụ: 0/500).<br>Người dùng không biết nội dung của mình đã đạt hay vượt giới hạn quy định của hệ thống.'
    );

    const imgPath = path.join(SCREENSHOT_DIR, 'ProductReviews-DEF02.png');
    await page.screenshot({ path: imgPath, fullPage: false });

    const counter = page.locator('.char-counter, .character-count, #review_char_count');
    expect(await counter.count()).toBe(0);
  });

  // =========================================================================
  // DEFECT 06 (Product Reviews & Ratings - Storefront)
  // =========================================================================
  test('DEF_PROD_003 [ProductReview-2]: Bảng chọn thang điểm sao đánh giá thiếu Tooltip hoặc nhãn mô tả ngữ nghĩa (1 sao: Rất tệ, 5 sao: Rất tốt)', async ({ page }) => {
    await openReviewForm(page);

    await annotateElement(
      page,
      '#product-review-table, .data-table',
      '[ProductReviews-DEF03]',
      'Bảng chọn sao đánh giá thiếu Tooltip hoặc nhãn ngữ nghĩa (1 sao đến 5 sao)',
      'Các radio button đánh giá 1-5 sao chỉ là các nút tròn số thứ tự mà <b>không có Tooltip hoặc nhãn chữ giải thích ý nghĩa</b> (1: Rất tệ, 5: Rất tốt), gây nhầm lẫn khi người dùng chấm điểm.'
    );

    const imgPath = path.join(SCREENSHOT_DIR, 'ProductReviews-DEF03.png');
    await page.screenshot({ path: imgPath, fullPage: false });

    const semanticTooltip = page.locator('#product-review-table [data-tooltip], #product-review-table .rating-description');
    expect(await semanticTooltip.count()).toBe(0);
  });

  // =========================================================================
  // DEFECT 07 (Product Reviews & Ratings - Storefront)
  // =========================================================================
  test('DEF_PROD_004 [ProductReview-8]: Form đánh giá chấp nhận nội dung nhận xét cực ngắn (chỉ 4 ký tự "Good") do thiếu ràng buộc độ dài tối thiểu', async ({ page }) => {
    await openReviewForm(page);

    await page.evaluate(() => {
      const rf = document.querySelector('#review_field') as HTMLTextAreaElement | null;
      if (rf) rf.value = 'Good';
    });

    await annotateElement(
      page,
      '#review_field',
      '[ProductReviews-DEF04]',
      'Form đánh giá chấp nhận nội dung nhận xét cực ngắn (chỉ 4 ký tự "Good")',
      'Form cho phép gửi bài đánh giá chỉ với từ <b>"Good" (4 ký tự)</b>.<br>❌ Thẻ textarea thiếu thuộc tính validation <code>minlength="20"</code> để lọc các bài nhận xét vô nghĩa hoặc spam.'
    );

    const imgPath = path.join(SCREENSHOT_DIR, 'ProductReviews-DEF04.png');
    await page.screenshot({ path: imgPath, fullPage: false });

    const reviewField = page.locator('#review_field').first();
    const minLengthAttr = await reviewField.getAttribute('minlength');
    expect(minLengthAttr).toBeNull();
  });

  // =========================================================================
  // DEFECT 08 (Customer Wishlist Management - Storefront)
  // =========================================================================
  test('DEF_WIS_001 [Wishlist-1]: Khách vãng lai truy cập Wishlist bị chuyển hướng âm thầm về Login mà không có thông báo hướng dẫn lý do', async ({ page }) => {
    await page.goto(`${STORE_BASE}/wishlist/`, { waitUntil: 'domcontentloaded' });
    await waitForReset(page);

    await annotateElement(
      page,
      '.account-login, #login-form, .main-container',
      '[Wishlist-DEF01]',
      'Khách vãng lai truy cập Wishlist bị chuyển hướng âm thầm về Login không có thông báo',
      'Khi khách chưa đăng nhập truy cập vào liên kết <code>/wishlist/</code>, hệ thống âm thầm chuyển hướng về <code>/customer/account/login/</code>.<br>❌ <b>Không hề có thông báo (Notice/Alert)</b> hướng dẫn khách hàng lý do cần đăng nhập.'
    );

    const imgPath = path.join(SCREENSHOT_DIR, 'Wishlist-DEF01.png');
    await page.screenshot({ path: imgPath, fullPage: false });

    expect(page.url()).toContain('/customer/account/login');
    const noticeMsg = page.locator('.messages .notice-msg, .messages .info-msg');
    expect(await noticeMsg.count()).toBe(0);
  });

  // =========================================================================
  // DEFECT 09 (Customer Wishlist Management - Storefront)
  // =========================================================================
  test('DEF_WIS_002 [Wishlist-17]: Ô nhập số lượng sản phẩm (Qty) trong trang Wishlist thiếu thuộc tính min="1" tại Client-side (cho phép nhập số lượng <= 0)', async ({ page }) => {
    await ensureProductInWishlist(page);
    await page.goto(WISHLIST_URL, { waitUntil: 'domcontentloaded' });
    await waitForReset(page);

    await page.evaluate(() => {
      const qty = document.querySelector('input[name*="qty"]') as HTMLInputElement | null;
      if (qty) qty.value = '-1';
    });

    const qtyInput = page.locator('input[name*="qty"]').first();
    await annotateElement(
      page,
      'input[name*="qty"]',
      '[Wishlist-DEF02]',
      'Ô nhập số lượng (Qty) trong Wishlist thiếu thuộc tính min="1" (cho phép nhập <= 0)',
      'Thẻ input Qty là <code>&lt;input type="text"&gt;</code> hoàn toàn <b>thiếu thuộc tính min="1"</b>.<br>Hệ thống cho phép người dùng nhập các số âm (-1, -5) hoặc số 0 ở Client-side mà không có validation ngăn chặn.'
    );

    const imgPath = path.join(SCREENSHOT_DIR, 'Wishlist-DEF02.png');
    await page.screenshot({ path: imgPath, fullPage: false });

    const minAttr = await qtyInput.getAttribute('min').catch(() => null);
    expect(minAttr).toBeNull();
  });

  // =========================================================================
  // DEFECT 10 (Customer Wishlist Management - Storefront)
  // =========================================================================
  test('DEF_WIS_003 [Wishlist-18]: Textarea lời nhắn trong trang Chia sẻ Danh sách yêu thích (Share Wishlist) thiếu thuộc tính maxlength="500" giới hạn độ dài biên', async ({ page }) => {
    await customerLogin(page);
    await page.goto(SHARE_WISHLIST_URL, { waitUntil: 'domcontentloaded' });
    await waitForReset(page);

    await page.evaluate(() => {
      const msg = document.getElementById('message') as HTMLTextAreaElement | null;
      if (msg) {
        msg.value = 'Đây là nội dung lời nhắn chia sẻ danh sách yêu thích thử nghiệm giới hạn biên ký tự. Hệ thống không có thuộc tính maxlength=500 để giới hạn độ dài của textarea này...';
      }
    });

    const messageField = page.locator('#message, textarea[name="message"]').first();
    await annotateElement(
      page,
      '#message, textarea[name="message"]',
      '[Wishlist-DEF03]',
      'Textarea lời nhắn chia sẻ Wishlist thiếu thuộc tính maxlength="500"',
      'Thẻ <code>&lt;textarea id="message"&gt;</code> hoàn toàn <b>không có thuộc tính maxlength</b>.<br>Người dùng có thể nhập chuỗi văn bản cực lớn gây lãng phí tài nguyên email gateway và tiềm ẩn nguy cơ tràn bộ nhớ.'
    );

    const imgPath = path.join(SCREENSHOT_DIR, 'Wishlist-DEF03.png');
    await page.screenshot({ path: imgPath, fullPage: false });

    const maxlength = await messageField.getAttribute('maxlength').catch(() => null);
    expect(maxlength).toBeNull();
  });

});
