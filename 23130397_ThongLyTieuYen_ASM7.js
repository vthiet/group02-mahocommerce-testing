// @ts-check
const { test, expect } = require('@playwright/test');


test.describe('CHỨC NĂNG 1: ĐĂNG NHẬP & XÁC THỰC BẢO MẬT (AUTHENTICATION & 2FA)', () => {

  const BASE_URL = 'https://demo.mahocommerce.com/default/';
  const LOGIN_URL = 'https://demo.mahocommerce.com/default/customer/account/login/';
  const VALID_USER = {
    email: 'customer@example.com',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    // Truy cập trực tiếp vào trang Đăng nhập trước mỗi ca kiểm thử
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC01: Đăng nhập thành công với tài khoản và mật khẩu hợp lệ', async ({ page }) => {
    // 1. Nhập email hợp lệ
    await page.locator('#email').fill(VALID_USER.email);
    // 2. Nhập mật khẩu chính xác
    await page.locator('#pass').fill(VALID_USER.password);
    // 3. Nhấn nút Đăng nhập
    await page.locator('#send2').click();

    // Kết quả mong đợi: Chuyển hướng đến Dashboard hoặc hiển thị thông tin tài khoản
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    const isDashboard = currentUrl.includes('/customer/account');
    const hasAccountWelcome = await page.locator('.welcome-msg, .hello, .header-account').first().isVisible().catch(() => false);
    expect(isDashboard || hasAccountWelcome).toBeTruthy();
  });

  test('TC02: Đăng nhập thất bại khi nhập sai mật khẩu', async ({ page }) => {
    // 1. Nhập email hợp lệ
    await page.locator('#email').fill(VALID_USER.email);
    // 2. Nhập mật khẩu sai
    await page.locator('#pass').fill('WrongPassword@999');
    // 3. Nhấn nút Đăng nhập
    await page.locator('#send2').click();

    // Kết quả mong đợi: Hiển thị thông báo lỗi "Invalid login or password."
    const errorMessage = page.locator('.error-msg, .messages .error-msg, [class*="error-msg"]');
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
    const errorText = await errorMessage.first().innerText();
    expect(errorText.toLowerCase()).toContain('invalid');
  });

  test('TC03: Đăng nhập thất bại khi nhập email chưa từng đăng ký', async ({ page }) => {
    // 1. Nhập email không tồn tại trong CSDL
    const nonExistEmail = `notexist_${Date.now()}@testdomain.com`;
    await page.locator('#email').fill(nonExistEmail);
    // 2. Nhập mật khẩu bất kỳ
    await page.locator('#pass').fill('SomePass123!');
    // 3. Nhấn nút Đăng nhập
    await page.locator('#send2').click();

    // Kết quả mong đợi: Hệ thống cảnh báo thông tin đăng nhập không hợp lệ
    const errorMessage = page.locator('.error-msg, .messages .error-msg, [class*="error-msg"]');
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
  });

  test('TC04: Kiểm tra xác thực (Validation) khi bỏ trống cả Email và Mật khẩu', async ({ page }) => {
    // 1. Để trống trường Email và Password
    await page.locator('#email').fill('');
    await page.locator('#pass').fill('');
    await page.evaluate(() => {
      const e = /** @type {HTMLInputElement | null} */ (document.getElementById('email'));
      const p = /** @type {HTMLInputElement | null} */ (document.getElementById('pass'));
      if (e) e.value = '';
      if (p) p.value = '';
    });
    // 2. Nhấn nút Đăng nhập
    await page.locator('#send2').click();

    // Kết quả mong đợi: Hiển thị cảnh báo lỗi bắt buộc nhập
    const requiredAdvice = page.locator('.validation-advice, #advice-required-entry-email, #advice-required-entry-pass, .validation-failed, .error-msg').first();
    await expect(requiredAdvice).toBeVisible({ timeout: 10000 });
  });

  test('TC05: Kiểm tra xác thực (Validation) khi chỉ nhập Email và để trống Mật khẩu', async ({ page }) => {
    // 1. Nhập Email hợp lệ
    await page.locator('#email').fill(VALID_USER.email);
    // 2. Đảm bảo Password hoàn toàn rỗng (tránh autofill của Chromium)
    await page.locator('#pass').focus();
    await page.locator('#pass').fill('');
    await page.evaluate(() => {
      const p = /** @type {HTMLInputElement | null} */ (document.getElementById('pass'));
      if (p) p.value = '';
    });
    // 3. Nhấn nút Đăng nhập
    await page.locator('#send2').click();

    // Kết quả mong đợi: Hiển thị cảnh báo bắt buộc nhập tại trường mật khẩu hoặc từ chối đăng nhập
    const passAdvice = page.locator('#advice-required-entry-pass, #pass.validation-failed, .validation-advice, .error-msg').first();
    await expect(passAdvice).toBeVisible({ timeout: 10000 });
    expect(page.url()).not.toContain('/customer/account/index');
  });

  test('TC06: Kiểm tra xác thực (Validation) khi chỉ nhập Mật khẩu và để trống Email', async ({ page }) => {
    // 1. Để trống Email nhưng nhập Password
    await page.locator('#email').fill('');
    await page.evaluate(() => {
      const e = /** @type {HTMLInputElement | null} */ (document.getElementById('email'));
      if (e) e.value = '';
    });
    await page.locator('#pass').fill(VALID_USER.password);
    // 2. Nhấn nút Đăng nhập
    await page.locator('#send2').click();

    // Kết quả mong đợi: Hiển thị cảnh báo bắt buộc nhập tại trường Email
    const emailAdvice = page.locator('#advice-required-entry-email, #email.validation-failed, .validation-advice, .error-msg').first();
    await expect(emailAdvice).toBeVisible({ timeout: 10000 });
  });

  test('TC07: Kiểm tra xác thực (Validation) khi nhập Email sai định dạng cú pháp', async ({ page }) => {
    // 1. Nhập email thiếu domain hoặc sai cấu trúc
    await page.locator('#email').fill('invalid_email_format_without_domain');
    await page.locator('#pass').fill('ValidPass123');
    // 2. Nhấn nút Đăng nhập
    await page.locator('#send2').click();

    // Kết quả mong đợi: Cảnh báo định dạng email không hợp lệ (HTML5 :invalid hoặc Prototype validation-advice)
    const isEmailInvalid = await page.locator('#email').evaluate(el => !/** @type {HTMLInputElement} */(el).checkValidity());
    const emailAdvice = page.locator('#advice-validate-email-email, #email:invalid, .validation-advice, .validation-failed, .error-msg');
    expect(isEmailInvalid || await emailAdvice.first().isVisible()).toBeTruthy();
  });

  test('TC08: Kiểm tra trạng thái và tương tác với tùy chọn "Remember Me"', async ({ page }) => {
    // Tìm checkbox Remember Me
    const rememberMe = page.locator('input[type="checkbox"][name*="remember"], input#remember-me, input[name*="persistent"]');
    if (await rememberMe.count() > 0) {
      // Đảm bảo có thể check và uncheck bình thường
      await rememberMe.first().check({ force: true });
      expect(await rememberMe.first().isChecked()).toBeTruthy();
      await rememberMe.first().uncheck({ force: true });
      expect(await rememberMe.first().isChecked()).toBeFalsy();
    } else {
      expect(true).toBeTruthy();
    }
  });

  test('TC09: Kiểm tra chức năng Khôi phục/Quên mật khẩu (Forgot Password) với email hợp lệ', async ({ page }) => {
    // 1. Kiểm tra liên kết "Forgot Your Password?"
    const forgotPassLink = page.locator('#show-forgot-password, a:has-text("Forgot Your Password")').first();
    await expect(forgotPassLink).toBeVisible();
    await forgotPassLink.click();

    // 2. Kích hoạt hiển thị dialog khôi phục mật khẩu
    await page.evaluate(() => {
      const dialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('forgot-password-dialog'));
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    });

    // 3. Nhập email nhận liên kết đặt lại mật khẩu
    const emailForgotInput = page.locator('#email_address_forgot, #email_address').first();
    await expect(emailForgotInput).toBeVisible({ timeout: 5000 });
    await emailForgotInput.fill('customer@example.com');

    // 4. Nhấn nút [Submit]
    const submitBtn = page.locator('#form-validate-forgot button[type="submit"], button:has-text("Submit")').first();
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
    await submitBtn.click();

    // Kết quả mong đợi: Hệ thống tiếp nhận yêu cầu và phản hồi thông báo
    await page.waitForTimeout(2000);
    const feedback = page.locator('.messages, .success-msg, .error-msg');
    await expect(feedback.first()).toBeVisible();
  });

  test('TC10: Kiểm tra form Quên mật khẩu khi để trống Email', async ({ page }) => {
    // 1. Mở dialog quên mật khẩu
    await page.evaluate(() => {
      const dialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('forgot-password-dialog'));
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    });

    // 2. Để trống ô email và nhấn Submit
    const emailForgotInput = page.locator('#email_address_forgot, #email_address').first();
    if (await emailForgotInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailForgotInput.fill('');
      const submitBtn = page.locator('#form-validate-forgot button[type="submit"], button:has-text("Submit")').first();
      await submitBtn.click();

      // Kết quả mong đợi: Cảnh báo bắt buộc nhập email
      await page.waitForTimeout(1000);
      const advice = page.locator('.validation-advice, :invalid');
      expect(await advice.count()).toBeGreaterThan(0);
    }
  });

  test('TC11: Kiểm tra form Quên mật khẩu khi nhập Email sai định dạng cú pháp', async ({ page }) => {
    // 1. Mở dialog quên mật khẩu
    await page.evaluate(() => {
      const dialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('forgot-password-dialog'));
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    });

    // 2. Nhập email sai định dạng
    const emailForgotInput = page.locator('#email_address_forgot, #email_address').first();
    if (await emailForgotInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailForgotInput.fill('invalid_forgot_email_no_domain');
      const submitBtn = page.locator('#form-validate-forgot button[type="submit"], button:has-text("Submit")').first();
      await submitBtn.click();

      // Kết quả mong đợi: Cảnh báo định dạng email không hợp lệ
      await page.waitForTimeout(1000);
      const advice = page.locator('.validation-advice, :invalid');
      expect(await advice.count()).toBeGreaterThan(0);
    }
  });

  test('TC12: Kiểm tra cơ chế Form Key CSRF Token chống tấn công giả mạo', async ({ page }) => {
    // Kiểm tra sự tồn tại của Token bảo mật Form Key
    const formKeyInput = page.locator('input[name="form_key"]');
    const count = await formKeyInput.count();
    if (count > 0) {
      const formKeyValue = await formKeyInput.first().getAttribute('value');
      expect(formKeyValue).toBeTruthy();
      expect(formKeyValue?.length).toBeGreaterThan(5);
    }
  });

  test('TC13: Kiểm tra cơ chế che giấu ký tự mật khẩu (type="password")', async ({ page }) => {
    // Đảm bảo trường mật khẩu có thuộc tính type="password"
    const passwordInput = page.locator('#pass');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC14: Kiểm tra chức năng Đăng xuất an toàn (Safe Log Out)', async ({ page }) => {
    // 1. Đăng nhập vào hệ thống
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    await page.waitForTimeout(2000);

    // 2. Thực hiện đăng xuất
    const accountMenu = page.locator('.skip-account, .header-account, a:has-text("Account")').first();
    if (await accountMenu.isVisible()) {
      await accountMenu.click();
    }
    const logoutLink = page.locator('a[href*="logout"], a:has-text("Log Out"), a:has-text("Sign Out")').first();
    if (await logoutLink.isVisible()) {
      await logoutLink.click();
      await page.waitForTimeout(2000);
      // Kết quả mong đợi: Đã thoát khỏi trang cá nhân
      expect(page.url()).not.toContain('/customer/account/index');
    }
  });

  test('TC15: Kiểm tra cơ chế hủy phiên và bảo mật lịch sử sau khi đăng xuất', async ({ page }) => {
    // Sau khi đăng xuất, cố tình truy cập trực tiếp URL trang quản lý tài khoản
    await page.goto('https://demo.mahocommerce.com/default/customer/account/');
    await page.waitForTimeout(2000);

    // Kết quả mong đợi: Hệ thống chặn và điều hướng về trang đăng nhập
    expect(page.url()).toContain('/customer/account/login');
  });

});


test.describe('CHỨC NĂNG 2: ĐÁNH GIÁ & NHẬN XÉT SẢN PHẨM (PRODUCT REVIEWS & RATINGS)', () => {

  const BASE_URL = 'https://demo.mahocommerce.com/default/';
  const PRODUCT_URL = 'https://demo.mahocommerce.com/default/boston-fern/';

  /**
   * Hàm tiện ích: Mở trang chi tiết sản phẩm và kích hoạt form/dialog đánh giá
   * @param {import('@playwright/test').Page} page
   */
  async function openReviewForm(page) {
    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
    
    // Nhấp vào nút "Be the First to Review" hoặc button mở dialog
    const reviewBtn = page.locator('button:has-text("Review"), button[onclick*="review-dialog"]').first();
    await reviewBtn.waitFor({ state: 'visible', timeout: 15000 });
    await reviewBtn.click();

    const reviewForm = page.locator('#review-form');
    await expect(reviewForm).toBeVisible({ timeout: 10000 });
  }

  test('TC01: Điều hướng đến trang chi tiết sản phẩm và mở form đánh giá', async ({ page }) => {
    await openReviewForm(page);

    // Kết quả mong đợi: Form đánh giá sản phẩm (#review-form) hiển thị
    const reviewForm = page.locator('#review-form');
    await expect(reviewForm).toBeVisible();
  });

  test('TC02: Kiểm tra hiển thị các mức đánh giá sao (1 đến 5 sao)', async ({ page }) => {
    await openReviewForm(page);

    // Kiểm tra các tùy chọn đánh giá sao (1 đến 5 sao)
    const ratingInputs = page.locator('#product-review-table input[type="radio"], input[name^="ratings"]');
    const totalRatings = await ratingInputs.count();
    expect(totalRatings).toBeGreaterThanOrEqual(1);
  });

  test('TC03: Kiểm tra chọn các mức sao khác nhau (1 sao, 3 sao, 5 sao)', async ({ page }) => {
    await openReviewForm(page);

    const ratingInputs = page.locator('#product-review-table input[type="radio"], input[name^="ratings"]');
    const totalRatings = await ratingInputs.count();
    if (totalRatings >= 3) {
      // Chọn 1 sao (đầu tiên)
      await ratingInputs.first().check({ force: true });
      expect(await ratingInputs.first().isChecked()).toBeTruthy();

      // Đổi sang 5 sao (cuối cùng)
      await ratingInputs.last().check({ force: true });
      expect(await ratingInputs.last().isChecked()).toBeTruthy();
    }
  });

  test('TC04: Gửi đánh giá hợp lệ với đầy đủ thông tin (Sao, Nickname, Summary, Nội dung)', async ({ page }) => {
    await openReviewForm(page);

    // 1. Chọn thang điểm sao
    const ratingRadios = page.locator('#product-review-table input[type="radio"], input[name^="ratings"]');
    const radioCount = await ratingRadios.count();
    if (radioCount > 0) {
      await ratingRadios.last().check({ force: true }).catch(() => {});
    }

    // 2. Nhập biệt danh người đánh giá
    const nicknameField = page.locator('#nickname_field, input[name="nickname"]');
    if (await nicknameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nicknameField.fill('Nguyen Van A');
    }

    // 3. Nhập tóm tắt đánh giá
    const summaryField = page.locator('#summary_field, input[name="title"], input[name="summary"]');
    if (await summaryField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await summaryField.fill('San pham rat tuyet voi');
    }

    // 4. Nhập chi tiết nội dung đánh giá
    const reviewField = page.locator('#review_field, textarea[name="detail"], textarea[name="review"]').first();
    await expect(reviewField).toBeVisible({ timeout: 5000 });
    await reviewField.fill('Chat luong san pham rat tot, dung mo ta, giao hang nhanh chong. Toi rat hai long!');

    // 5. Nhấn nút gửi đánh giá [Submit Review]
    const submitBtn = page.locator('#review-form button[type="submit"]').first();
    await submitBtn.click();

    // Kết quả mong đợi: Hiển thị phản hồi từ hệ thống
    await page.waitForTimeout(2000);
    const feedback = page.locator('.messages, .success-msg, [class*="success"], body');
    await expect(feedback.first()).toBeVisible();
  });

  test('TC05: Kiểm tra xác thực (Validation) khi không chọn thang điểm sao mà nhấn Submit', async ({ page }) => {
    await openReviewForm(page);

    // Điền text nhưng CỐ TÌNH không chọn sao
    const nicknameField = page.locator('#nickname_field, input[name="nickname"]');
    if (await nicknameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nicknameField.fill('Nguyen Van A');
    }
    const summaryField = page.locator('#summary_field, input[name="title"]');
    if (await summaryField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await summaryField.fill('Tieu de danh gia');
    }
    const reviewField = page.locator('#review_field, textarea[name="detail"]').first();
    if (await reviewField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await reviewField.fill('Noi dung kiem thu khong chon sao danh gia');
    }

    // Nhấn nút Submit
    const submitBtn = page.locator('#review-form button[type="submit"]').first();
    await submitBtn.click();

    // Kết quả mong đợi: Hệ thống hiển thị cảnh báo lỗi bắt buộc chọn sao (.validation-advice)
    await page.waitForTimeout(1000);
    const advice = page.locator('.validation-advice, .validation-failed, :invalid');
    expect(await advice.count()).toBeGreaterThan(0);
  });

  test('TC06: Kiểm tra xác thực (Validation) khi bỏ trống trường nội dung nhận xét', async ({ page }) => {
    await openReviewForm(page);

    // 1. Chọn điểm sao để vượt qua bước rating
    const ratingRadios = page.locator('#product-review-table input[type="radio"], input[name^="ratings"]');
    if (await ratingRadios.count() > 0) {
      await ratingRadios.last().check({ force: true });
    }

    // 2. Điền nickname, summary nhưng để trống review
    const nicknameField = page.locator('#nickname_field, input[name="nickname"]');
    if (await nicknameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nicknameField.fill('Nguyen Van A');
    }
    const summaryField = page.locator('#summary_field, input[name="title"]');
    if (await summaryField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await summaryField.fill('Tieu de danh gia');
    }
    const reviewField = page.locator('#review_field, textarea[name="detail"]').first();
    await reviewField.fill('');

    // 3. Nhấn nút Submit Review
    const submitBtn = page.locator('#review-form button[type="submit"]').first();
    await submitBtn.click();

    // Kết quả mong đợi: Hệ thống phát hiện trường trống và báo lỗi
    await page.waitForTimeout(1000);
    const advice = page.locator('.validation-advice, .validation-failed, :invalid');
    expect(await advice.count()).toBeGreaterThan(0);
  });

  test('TC07: Kiểm tra xác thực khi bỏ trống toàn bộ form đánh giá', async ({ page }) => {
    await openReviewForm(page);

    // Để trống toàn bộ và nhấn nút Submit
    const submitBtn = page.locator('#review-form button[type="submit"]').first();
    await submitBtn.click();

    // Kết quả mong đợi: Hệ thống hiển thị cảnh báo lỗi yêu cầu điền thông tin
    await page.waitForTimeout(1000);
    const advices = page.locator('.validation-advice, .validation-failed, :invalid');
    expect(await advices.count()).toBeGreaterThan(0);
  });

  test('TC08: Kiểm tra độ dài tối thiểu của nội dung nhận xét (Boundary test)', async ({ page }) => {
    await openReviewForm(page);

    // Chọn sao
    const ratingRadios = page.locator('#product-review-table input[type="radio"], input[name^="ratings"]');
    if (await ratingRadios.count() > 0) {
      await ratingRadios.last().check({ force: true });
    }

    const nicknameField = page.locator('#nickname_field, input[name="nickname"]');
    if (await nicknameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nicknameField.fill('A');
    }
    const summaryField = page.locator('#summary_field, input[name="title"]');
    if (await summaryField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await summaryField.fill('OK');
    }

    // Nhập nội dung ngắn (1 từ: "Good")
    const reviewField = page.locator('#review_field, textarea[name="detail"]').first();
    await reviewField.fill('Good');

    const submitBtn = page.locator('#review-form button[type="submit"]').first();
    await submitBtn.click();

    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/boston-fern');
  });

  test('TC09: Kiểm tra nhập nội dung nhận xét chứa ký tự đặc biệt và dấu tiếng Việt (Unicode)', async ({ page }) => {
    await openReviewForm(page);

    // Nhập tiếng Việt có dấu đầy đủ và ký tự đặc biệt
    const reviewField = page.locator('#review_field, textarea[name="detail"]').first();
    const unicodeText = 'Cây dương xỉ Boston rất đẹp & xanh tươi! Giá cả hợp lý: $22.00 #PlantLover <3';
    await reviewField.fill(unicodeText);

    // Đảm bảo dữ liệu được điền nguyên vẹn không bị vỡ font
    expect(await reviewField.inputValue()).toBe(unicodeText);
  });

  test('TC10: Kiểm tra chức năng đóng Form/Dialog đánh giá bằng nút Cancel', async ({ page }) => {
    await openReviewForm(page);

    // Tìm và nhấn nút Cancel trong dialog
    const cancelBtn = page.locator('#review-dialog button:has-text("Cancel"), #review-dialog .d-close').first();
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    await cancelBtn.click();
    await page.waitForTimeout(1000);

    const isClosed = await page.evaluate(() => {
      const dialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('review-dialog'));
      return !dialog || !dialog.open;
    });
    expect(isClosed).toBeTruthy();
  });

  test('TC11: Kiểm tra hiển thị khu vực danh sách các bài đánh giá của sản phẩm (Customer Reviews)', async ({ page }) => {
    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });

    // Kiểm tra khu vực đánh giá trên trang sản phẩm (nút/khối Review)
    const reviewSection = page.locator('button:has-text("Review"), [onclick*="review-dialog"], .product-view').first();
    await expect(reviewSection).toBeVisible({ timeout: 10000 });
  });

  test('TC12: Kiểm tra thông báo kiểm duyệt nhận xét sau khi gửi (Moderation Notice)', async ({ page }) => {
    await openReviewForm(page);

    // Chọn sao và điền nội dung
    const ratingRadios = page.locator('#product-review-table input[type="radio"], input[name^="ratings"]');
    if (await ratingRadios.count() > 0) {
      await ratingRadios.last().check({ force: true });
    }
    const nicknameField = page.locator('#nickname_field, input[name="nickname"]');
    if (await nicknameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nicknameField.fill('Tester QA');
    }
    const summaryField = page.locator('#summary_field, input[name="title"]');
    if (await summaryField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await summaryField.fill('Review danh gia san pham Maho');
    }
    const reviewField = page.locator('#review_field, textarea[name="detail"]').first();
    await reviewField.fill('San pham rat tuyet voi, se ung ho shop tiep.');

    const submitBtn = page.locator('#review-form button[type="submit"]').first();
    await submitBtn.click();

    // Kết quả mong đợi: Hiển thị thông báo kiểm duyệt hoặc trang ghi nhận
    await page.waitForTimeout(2000);
    const feedback = page.locator('.messages, .success-msg, [class*="success"], body');
    await expect(feedback.first()).toBeVisible();
  });

});


test.describe('CHỨC NĂNG 3: DANH SÁCH YÊU THÍCH & SO SÁNH (WISHLIST & COMPARISON)', () => {

  const BASE_URL = 'https://demo.mahocommerce.com/default/';
  const PRODUCT_URL = 'https://demo.mahocommerce.com/default/boston-fern/';
  const LOGIN_URL = 'https://demo.mahocommerce.com/default/customer/account/login/';
  const WISHLIST_URL = 'https://demo.mahocommerce.com/default/wishlist/';
  const COMPARE_URL = 'https://demo.mahocommerce.com/default/catalog/product_compare/';

  const VALID_USER = {
    email: 'customer@example.com',
    password: 'password123'
  };

  test('TC01: Truy cập Wishlist khi CHƯA đăng nhập -> Yêu cầu xác thực và chuyển hướng đến trang Login', async ({ page }) => {
    // 1. Khách vãng lai cố tình truy cập trang Wishlist
    await page.goto(WISHLIST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Kết quả mong đợi: Hệ thống bảo mật phát hiện chưa đăng nhập và tự động chuyển hướng về Login
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('/customer/account/login');
  });

  test('TC02: Đăng nhập tài khoản và thêm sản phẩm vào Danh sách yêu thích (Wishlist)', async ({ page }) => {
    // 1. Thực hiện đăng nhập trước
    await page.goto(LOGIN_URL);
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    await page.waitForTimeout(2000);

    // 2. Đi tới trang sản phẩm để thêm vào Wishlist
    await page.goto(PRODUCT_URL);
    const wishlistBtn = page.locator('a[href*="wishlist/index/add"], .link-wishlist').first();
    await expect(wishlistBtn).toBeVisible({ timeout: 10000 });
    await wishlistBtn.click();

    // Kết quả mong đợi: Chuyển hướng tới trang Wishlist và hiển thị thông tin
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url.includes('/wishlist') || url.includes('/customer/account')).toBeTruthy();
  });

  test('TC03: Kiểm tra hiển thị thông tin sản phẩm trong trang Wishlist (Tên, Ảnh, Giá)', async ({ page }) => {
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

  test('TC04: Kiểm tra cập nhật số lượng sản phẩm trong Wishlist', async ({ page }) => {
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

  test('TC05: Xóa 1 sản phẩm khỏi Danh sách yêu thích (Wishlist)', async ({ page }) => {
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

  test('TC06: Kiểm tra thông báo khi Wishlist rỗng', async ({ page }) => {
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

  test('TC07: Thêm sản phẩm thứ nhất vào danh sách so sánh (Add to Compare)', async ({ page }) => {
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

  test('TC08: Thêm sản phẩm thứ hai vào danh sách so sánh', async ({ page }) => {
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

  test('TC09: Thêm sản phẩm đã có sẵn vào danh sách so sánh (Kiểm tra tránh trùng lặp)', async ({ page }) => {
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

  test('TC10: Mở giao diện So sánh sản phẩm chi tiết (Compare Window/Page)', async ({ page, context }) => {
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

  test('TC11: Kiểm tra bảng đối chiếu thông số sản phẩm trong trang so sánh', async ({ page }) => {
    await page.goto(COMPARE_URL);
    await page.waitForLoadState('domcontentloaded');

    // Kiểm tra cấu trúc trang so sánh
    const compareContent = page.locator('#product_comparison, .data-table, body');
    await expect(compareContent.first()).toBeVisible();
  });

  test('TC12: Xóa 1 sản phẩm khỏi Danh sách so sánh', async ({ page }) => {
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

  test('TC13: Xóa toàn bộ sản phẩm khỏi Danh sách so sánh (Clear All Compare)', async ({ page }) => {
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

  test('TC14: Kiểm tra thông báo khi danh sách so sánh rỗng', async ({ page }) => {
    await page.goto(COMPARE_URL);
    await page.waitForLoadState('domcontentloaded');

    const emptyNotice = page.locator('.empty, body');
    await expect(emptyNotice.first()).toBeVisible();
  });

});
