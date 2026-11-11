import type { Page } from '@playwright/test';

/** Maho can keep loading optional assets long after its primary DOM is usable. */
export async function openSlowPage(page: Page, url: string): Promise<void> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    const navigationAborted = error instanceof Error && error.message.includes('net::ERR_ABORTED');
    if (!navigationAborted || page.url() === 'about:blank') throw error;
    const requestedOrigin = new URL(url, page.url()).origin;
    if (new URL(page.url()).origin !== requestedOrigin) throw error;
    await page.waitForLoadState('domcontentloaded').catch(() => undefined);
  }
}
