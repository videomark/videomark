import { test as base, chromium } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/chrome-extensions
 */
export const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = new URL('../dist/production', import.meta.url).pathname;

    const context = await chromium.launchPersistentContext('', {
      headless: true,
      args: [
        `--headless=new`,
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });

    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();

    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const extensionId = background.url().split('/')[2];

    await use(extensionId);
  },
});

export const { expect } = test;

/**
 * QoE 取得のタイムアウトを 2 分間に設定。
 */
export const timeout = 1000 * 60 * 2;

/**
 * 拡張機能内ページを開く。
 */
export const openPage = async ({ page, extensionId }, pageId) => {
  await page.goto(`chrome-extension://${extensionId}/index.html#/${pageId}`);
};

/**
 * オンボーディングツアーを経て利用規約に同意。
 */
export const acceptTerms = async ({ page, extensionId }) => {
  await openPage({ page, extensionId }, 'onboarding');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(new URL(page.url()).hash).toBe('#/history');
};
