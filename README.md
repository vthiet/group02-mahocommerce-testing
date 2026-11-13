# Kiểm thử tự động website MahoCommerce với Playwright

Dự án chứa các script kiểm thử tự động (end-to-end) cho trang web **MahoCommerce**, được viết bằng [Playwright](https://playwright.dev/) (Playwright Test).

## Mục lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Cài đặt](#3-cài-đặt)
4. [Cấu hình](#4-cấu-hình)
5. [Chạy kiểm thử](#5-chạy-kiểm-thử)
   - [Các suite của thành viên 23130314](#51-các-suite-của-thành-viên-23130314)
   - [Tài liệu defect mô phỏng](#52-tài-liệu-defect-mô-phỏng)
6. [Xem báo cáo, trace và debug](#6-xem-báo-cáo-trace-và-debug)
7. [Xử lý lỗi thường gặp](#7-xử-lý-lỗi-thường-gặp)

---

## 1. Yêu cầu hệ thống

| Công cụ | Phiên bản khuyến nghị |
| --- | --- |
| Node.js | 18 trở lên (kiểm tra: `node -v`) |
| npm | đi kèm Node.js (kiểm tra: `npm -v`) |
| Git | bản mới nhất |
| Hệ điều hành | Windows / macOS / Linux |

Ngoài ra cần có **môi trường MahoCommerce đang chạy và truy cập được** (local hoặc server kiểm thử), cùng tài khoản Admin/khách hàng cho các case cần xác thực.

## 2. Cấu trúc thư mục

Dự án dùng Playwright Test với TypeScript. Test, test design và test data được nhóm theo **MSSV_HoTen** của từng thành viên.

```text
.
├── Automation Testing Project - Group 02/
│   ├── tests/<MSSV_HoTen>/<feature>/
│   │   ├── data/                  # Dữ liệu và cấu hình fixture
│   │   ├── pages/                 # Page Objects
│   │   ├── specs/                 # Playwright tests
│   │   └── ...                    # components, support, fixtures nếu cần
│   ├── test-design/<MSSV_HoTen>/  # Ma trận và đặc tả test
│   ├── playwright.config.ts
│   ├── package.json
│   ├── .env                       # Credentials (KHÔNG commit)
│   └── .env.example
├── README.md
├── playwright-report/             # Báo cáo HTML (tự sinh)
└── test-results/                  # Kết quả, trace, screenshot, video (tự sinh)
```

Các test có thể cần website MahoCommerce local, tài khoản Admin và fixture sản phẩm/khách hàng. Mỗi feature README hoặc file `data/*` ghi rõ biến cấu hình còn thiếu; case thiếu fixture được đánh dấu skip.

## 3. Cài đặt

**Bước 1 – Clone dự án**

```bash
git clone https://github.com/vthiet/group02-mahocommerce-testing.git
cd "Automation Testing Project - Group 02"
```

**Bước 2 – Cài thư viện**

```bash
npm install
```

**Bước 3 – Cài trình duyệt cho Playwright**

```bash
npx playwright install
```

Chỉ cài một trình duyệt (nhẹ hơn):

```bash
npx playwright install chromium
```

Nếu chạy trên Linux và thiếu thư viện hệ thống:

```bash
npx playwright install --with-deps
```

> Nếu khởi tạo dự án mới từ đầu thay vì clone: `npm init playwright@latest`, sau đó tạo các thư mục MSSV_HoTen trong `tests/`.

## 4. Cấu hình


### 4.1. File `playwright.config.ts`

Ví dụ cấu hình tham khảo:

```ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
  ],
});
```

Các tham số thường chỉnh:

| Tham số | Mô tả |
| --- | --- |
| `testDir` | Thư mục chứa script (mặc định `./tests`) |
| `baseURL` | Địa chỉ gốc, cho phép dùng `page.goto('/admin')` |
| `fullyParallel` | Chạy song song các test |
| `retries` | Số lần chạy lại khi test thất bại |
| `projects` | Danh sách trình duyệt cần chạy |
| `trace` / `screenshot` / `video` | Dữ liệu lưu lại khi test lỗi |

## 5. Chạy kiểm thử

Chạy toàn bộ test (chế độ headless):

```bash
npx playwright test
```

Chạy theo **thư mục MSSV** của một thành viên:

```bash
npx playwright test tests/<MSSV_Hoten>
```

Chạy một file cụ thể:

```bash
npx playwright test tests/<MSSV_HoTen>/product.spec.ts
```

Chạy theo tên test (so khớp một phần tên):

```bash
npx playwright test -g "PROD_MGT_Create_01"
```

Các tuỳ chọn hữu ích:

| Lệnh | Tác dụng |
| --- | --- |
| `npx playwright test --headed` | Hiển thị cửa sổ trình duyệt |
| `npx playwright test --ui` | Mở giao diện UI Mode (xem, chạy, gỡ lỗi trực quan) |
| `npx playwright test --debug` | Chạy từng bước với Playwright Inspector |
| `npx playwright test --project=chromium` | Chỉ chạy trên một trình duyệt |
| `npx playwright test --workers=1` | Chạy tuần tự (tránh xung đột dữ liệu) |
| `npx playwright test --retries=2` | Chạy lại tối đa 2 lần nếu lỗi |
| `npx playwright test --last-failed` | Chỉ chạy lại các test thất bại lần trước |

> Các test thao tác trên cùng dữ liệu (thêm/sửa/xoá sản phẩm, khách hàng…) có thể ảnh hưởng lẫn nhau khi chạy song song. Nếu gặp lỗi không ổn định, thử `--workers=1`.

### 5.1. Các suite của thành viên 23130314

Chạy các lệnh sau từ thư mục `Automation Testing Project - Group 02/`:

```bash
npx playwright test tests/23130314_VoVanThiet/category-configurable/specs/category-configurable.spec.ts
npx playwright test tests/23130314_VoVanThiet/promotion-rule-engine/specs/promotion-rule-engine.spec.ts
npx playwright test tests/23130314_VoVanThiet/checkout-order-fulfillment/specs/checkout-order-fulfillment.spec.ts
```

Các suite dùng fixture sản phẩm, store view, customer và Admin được cấu hình riêng; kiểm tra `tests/23130314_VoVanThiet/<feature>/data/` trước khi chạy. Một số case cần cấu hình đặc biệt hoặc cần characterization trước sẽ được skip có lý do. Có thể chạy tất cả test của thành viên bằng:

```bash
npx playwright test tests/23130314_VoVanThiet
```

### 5.2. Tài liệu defect mô phỏng

Các kịch bản luyện tập cho ba feature trên được ghi tại [`test-design/23130314_VoVanThiet/defect_scenarios_simulated.md`](Automation%20Testing%20Project%20-%20Group%2002/test-design/23130314_VoVanThiet/defect_scenarios_simulated.md). Đây là **defect giả lập, chưa xác minh**; không dùng như báo cáo lỗi đã phát hiện. Chỉ cập nhật actual result, reproducibility và evidence sau khi chạy lại trên website và thu thập minh chứng.

## 6. Xem báo cáo, trace và debug

**Mở báo cáo HTML sau khi chạy:**

```bash
npx playwright show-report
```

**Xem trace của test lỗi** (có timeline, ảnh chụp từng bước, network, console):

```bash
npx playwright show-trace test-results/<tên-thư-mục-test>/trace.zip
```

**Ghi lại thao tác để sinh code tự động** (codegen):

```bash
npx playwright codegen https://mahocommerce.com/about/demo/
```

**Chạy debug một test:**

```bash
npx playwright test tests/<MSSV_HoTen>/product.spec.ts --debug
```

## 7. Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân / Cách xử lý |
| --- | --- |
| `Executable doesn't exist ... run npx playwright install` | Chưa cài trình duyệt → chạy `npx playwright install` |
| `page.goto: net::ERR_CONNECTION_REFUSED` | Trang MahoCommerce chưa chạy hoặc `BASE_URL` sai → kiểm tra lại server và file `.env` |
| `Cannot find module 'dotenv'` | Chưa cài `dotenv` → `npm install -D dotenv` |
| `Timeout 30000ms exceeded` | Trang tải chậm hoặc locator sai → tăng `timeout` trong config, kiểm tra locator bằng `codegen` hoặc `--debug` |
| Test thỉnh thoảng lỗi, thỉnh thoảng pass | Có thể do chạy song song trên cùng dữ liệu → dùng `--workers=1` hoặc tách dữ liệu test |
| `'npx' is not recognized` (Windows) | Chưa cài Node.js hoặc chưa thêm vào PATH → cài lại Node.js và mở lại terminal |

---

## Tài liệu tham khảo

- Tài liệu Playwright: https://playwright.dev/docs/intro
- Playwright Test CLI: https://playwright.dev/docs/test-cli
- Trace Viewer: https://playwright.dev/docs/trace-viewer
