import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// Available in Node 20.12+; loading this here makes .env values available to
// both the Playwright config and the test modules that read process.env.
try {
  process.loadEnvFile(path.resolve(__dirname, '.env'));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  expect: { timeout: 20_000 },
  /* Maho is slow and several flows create orders; serialize requests by default. */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Keep a browsable report and machine-readable JUnit results for every run. */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.MAHO_BASE_URL ?? 'https://maho-26.9.3.ddev.site',
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    headless: true,
    ignoreHTTPSErrors: true,

    /* Save one screenshot for each test and attach it to the HTML report. */
    screenshot: 'on',
    /* Preserve richer diagnostics for failed tests only. */
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },

  /* Keep browser coverage configurable; local DDEV runs default to Chromium. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
