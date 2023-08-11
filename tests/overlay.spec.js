import { acceptTerms, expect, openPage, test, timeout } from './common';

test.describe('動画オーバーレイ', () => {
  let title;

  test.beforeEach(async ({ page, extensionId }) => {
    await acceptTerms({ page, extensionId });
    test.setTimeout(timeout);
  });

  test('YouTube', async ({ page }) => {
    // 2 分程度、広告なし、人気の動画を再生
    await page.goto('https://www.youtube.com/watch?v=4WXs3sKu41I');
    await page.keyboard.down(' ');

    title = await page.locator('#title h1').textContent();
  });

  test.afterEach(async ({ page, extensionId }) => {
    const qoeLabel = page.locator('#__videomark_ui');

    await expect(qoeLabel).toBeAttached();
    await expect(qoeLabel).toHaveText('Measuring...');

    // QoE が取得されるまで待機
    await expect(async () => {
      await expect(qoeLabel).toHaveText(/\b\d\.\d\d\b/);
    }).toPass({ timeout });

    const qoe = await page.locator('#__videomark_ui >> vm-stats >> .qoe').textContent();

    // 履歴ページに動画が記録されていることを確認
    await openPage({ page, extensionId }, 'history');
    await expect(page.locator('.item .title')).toHaveText(title);
    await expect(page.locator('.item .qoe')).toHaveText(
      new RegExp(`\\b${qoe.replace('.', '\\.')}$`),
    );
  });
});
