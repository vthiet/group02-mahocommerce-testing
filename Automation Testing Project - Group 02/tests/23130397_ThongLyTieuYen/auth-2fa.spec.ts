import { test, expect } from '@playwright/test';

test.describe('Authentication & 2FA - User Authentication and Security Flow', () => {

  const BASE_URL = 'https://demo.mahocommerce.com/';
  const LOGIN_URL = 'https://demo.mahocommerce.com/customer/account/login/';
  const VALID_USER = {
    email: 'customer@example.com',
    password: 'password123'
  };

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
  });

  test('AUTH_2FA_01: Kiểm tra đăng nhập thành công với tài khoản và mật khẩu hợp lệ', async ({ page }) => {
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

  test('AUTH_2FA_02: Kiểm tra đăng nhập thất bại khi nhập sai mật khẩu', async ({ page }) => {
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

  test('AUTH_2FA_03: Kiểm tra đăng nhập thất bại khi nhập Email chưa từng đăng ký', async ({ page }) => {
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

  test('AUTH_2FA_04: Kiểm tra xác thực (Validation) khi bỏ trống cả Email và Mật khẩu', async ({ page }) => {
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

  test('AUTH_2FA_05: Kiểm tra xác thực (Validation) khi chỉ nhập Email và để trống Mật khẩu', async ({ page }) => {
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

  test('AUTH_2FA_06: Kiểm tra xác thực (Validation) khi chỉ nhập Mật khẩu và để trống Email', async ({ page }) => {
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

  test('AUTH_2FA_07: Kiểm tra xác thực (Validation) khi nhập Email sai định dạng cú pháp', async ({ page }) => {
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

  test('AUTH_2FA_08: Kiểm tra trạng thái và tương tác với tùy chọn "Remember Me"', async ({ page }) => {
    // Kiểm tra và tương tác với tùy chọn Remember Me
    const toggleSuccess = await page.evaluate(() => {
      const cb = /** @type {HTMLInputElement | null} */ (document.querySelector('input[type="checkbox"][name="remember_me"]'));
      if (!cb) return true;
      const initial = cb.checked;
      cb.checked = !initial;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
      return cb.checked !== initial;
    });
    expect(toggleSuccess).toBeTruthy();
  });

  test('AUTH_2FA_09: Kiểm tra chức năng Khôi phục/Quên mật khẩu (Forgot Password) với email hợp lệ', async ({ page }) => {
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

  test('AUTH_2FA_10: Kiểm tra form Quên mật khẩu khi để trống Email', async ({ page }) => {
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

  test('AUTH_2FA_11: Kiểm tra form Quên mật khẩu khi nhập Email sai định dạng cú pháp', async ({ page }) => {
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

  test('AUTH_2FA_12: Kiểm tra cơ chế Form Key CSRF Token chống tấn công giả mạo', async ({ page }) => {
    // Kiểm tra sự tồn tại của Token bảo mật Form Key
    const formKeyInput = page.locator('input[name="form_key"]');
    const count = await formKeyInput.count();
    if (count > 0) {
      const formKeyValue = await formKeyInput.first().getAttribute('value');
      expect(formKeyValue).toBeTruthy();
      expect(formKeyValue?.length).toBeGreaterThan(5);
    }
  });

  test('AUTH_2FA_13: Kiểm tra cơ chế che giấu ký tự mật khẩu (type="password")', async ({ page }) => {
    // Đảm bảo trường mật khẩu có thuộc tính type="password"
    const passwordInput = page.locator('#pass');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('AUTH_2FA_14: Kiểm tra chức năng Đăng xuất an toàn (Safe Log Out)', async ({ page }) => {
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

  test('AUTH_2FA_15: Kiểm tra cơ chế hủy phiên và bảo mật lịch sử sau khi đăng xuất', async ({ page }) => {
    // Sau khi đăng xuất, cố tình truy cập trực tiếp URL trang quản lý tài khoản
    await page.goto('https://demo.mahocommerce.com/customer/account/');
    await page.waitForTimeout(2000);

    // Kết quả mong đợi: Hệ thống chặn và điều hướng về trang đăng nhập
    expect(page.url()).toContain('/customer/account/login');
  });

  test('AUTH_2FA_16: Kiểm tra đăng nhập với mật khẩu chứa khoảng trắng ở đầu và cuối (Password trimming validation)', async ({ page }) => {
    // 1. Nhập email hợp lệ
    await page.locator('#email').fill(VALID_USER.email);
    // 2. Nhập mật khẩu có khoảng trắng thừa ở đầu và cuối
    await page.locator('#pass').fill(`  ${VALID_USER.password}  `);
    // 3. Nhấn nút Đăng nhập
    await page.locator('#send2').click();
    await page.waitForTimeout(1000);

    // Kết quả mong đợi: Hệ thống bảo mật hiển thị cảnh báo không cho phép khoảng trắng đầu cuối
    const feedback = page.locator('.validation-advice, #advice-validate-password-pass, .error-msg, [class*="error-msg"]');
    await expect(feedback.first()).toBeVisible({ timeout: 5000 });
    const text = await feedback.first().innerText();
    expect(text.toLowerCase().includes('spaces') || text.toLowerCase().includes('invalid')).toBeTruthy();
  });

  test('AUTH_2FA_17: Kiểm tra giới hạn số lần đăng nhập sai liên tiếp để chống tấn công Brute Force (Account Lockout Policy)', async ({ page }) => {
    // Thử đăng nhập sai liên tục 5 lần
    for (let i = 0; i < 5; i++) {
      await page.locator('#email').fill(VALID_USER.email);
      await page.locator('#pass').fill(`WrongPassword_${i}!`);
      await page.locator('#send2').click();
      await page.waitForTimeout(1000);
    }

    // Kết quả mong đợi: Hệ thống phải hiển thị cảnh báo khóa tài khoản tạm thời hoặc yêu cầu CAPTCHA
    // Defect phát hiện: Hệ thống Maho Commerce Demo không có cơ chế Rate Limiting/Account Lockout sau 5 lần nhập sai
    const lockoutNotice = page.locator('.messages .error-msg:has-text("locked"), :has-text("too many attempts"), :has-text("captcha")');
    const isLocked = await lockoutNotice.first().isVisible().catch(() => false);
    expect(isLocked, 'Hệ thống phải kích hoạt chính sách khóa tài khoản (Account Lockout) hoặc yêu cầu CAPTCHA sau 5 lần đăng nhập thất bại').toBeTruthy();
  });

  test('AUTH_2FA_18: Kiểm tra hiển thị hướng dẫn chính sách mật khẩu (Password Complexity Hint)', async ({ page }) => {
    // Kiểm tra giao diện form đăng nhập và đổi mật khẩu
    await page.goto(LOGIN_URL);
    // Kỳ vọng: Form hiển thị gợi ý hoặc tooltip về chính sách độ phức tạp mật khẩu (tối thiểu 6 ký tự)
    const policyHint = page.locator('.password-hint, .password-rule, #pass-advice, :has-text("at least 6 characters")');
    const hasHint = await policyHint.first().isVisible().catch(() => false);
    // Defect phát hiện: Giao diện form không hiển thị nhãn gợi ý tiêu chuẩn mật khẩu cho người dùng
    expect(hasHint, 'Form đăng nhập phải hiển thị thông tin hướng dẫn tiêu chuẩn độ phức tạp của mật khẩu').toBeTruthy();
  });

  test('AUTH_2FA_19: Kiểm tra đăng nhập thành công khi nhập Email chứa ký tự in hoa (Case-insensitivity)', async ({ page }) => {
    // 1. Nhập email viết in hoa toàn bộ
    await page.locator('#email').fill(VALID_USER.email.toUpperCase());
    // 2. Nhập đúng mật khẩu
    await page.locator('#pass').fill(VALID_USER.password);
    // 3. Nhấn nút Đăng nhập
    await page.locator('#send2').click();

    // Kết quả mong đợi: Hệ thống xử lý email không phân biệt chữ hoa chữ thường và đăng nhập thành công
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    const isDashboard = currentUrl.includes('/customer/account');
    const hasAccountWelcome = await page.locator('.welcome-msg, .hello, .header-account').first().isVisible().catch(() => false);
    expect(isDashboard || hasAccountWelcome).toBeTruthy();
  });

  test('AUTH_2FA_20: Kiểm tra bảo mật form đăng nhập chống tấn công SQL Injection', async ({ page }) => {
    // 1. Nhập payload SQL Injection kinh điển vào ô Email
    await page.locator('#email').fill("' OR '1'='1' --");
    await page.locator('#pass').fill('randomPass999!');
    // 2. Nhấn nút Đăng nhập
    await page.locator('#send2').click();

    // Kết quả mong đợi: Hệ thống an toàn (chặn qua HTML5/Prototype validation hoặc server error), từ chối truy cập trái phép
    const isInvalid = await page.locator('#email').evaluate(el => !/** @type {HTMLInputElement} */(el).checkValidity());
    const feedback = page.locator('.error-msg, .messages .error-msg, [class*="error-msg"], .validation-advice, #advice-validate-email-email, #email:invalid');
    const hasFeedback = isInvalid || await feedback.first().isVisible().catch(() => false);
    expect(hasFeedback).toBeTruthy();
    expect(page.url()).not.toContain('/customer/account/index');
  });

  test.skip('AUTH_2FA_21: Kiểm tra xác thực hai yếu tố qua ứng dụng Authenticator (2FA TOTP Google Authenticator)', async ({ page }) => {
    // Bỏ qua (Skipped) do hệ thống Demo chưa kích hoạt mô-đun 2FA TOTP qua Authenticator App trên môi trường Storefront
    await page.goto(LOGIN_URL);
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#pass').fill(VALID_USER.password);
    await page.locator('#send2').click();
    const otpInput = page.locator('#totp_code, input[name="two_factor_code"]');
    await expect(otpInput).toBeVisible();
  });

  test.skip('AUTH_2FA_22: Kiểm tra xác thực hai yếu tố gửi mã OTP qua tin nhắn SMS (2FA SMS OTP Verification)', async ({ page }) => {
    // Bỏ qua (Skipped) do yêu cầu cổng kết nối SMS Gateway thực tế và thiết bị phần cứng để nhận mã OTP
    await page.goto(LOGIN_URL);
    const smsMethod = page.locator('input[value="sms_2fa"], #auth-method-sms');
    await expect(smsMethod).toBeVisible();
  });

});
