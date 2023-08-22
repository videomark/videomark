import { acceptTerms, expect, openPage, test } from './common';

test.describe('拡張機能内ページ', () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await acceptTerms({ page, extensionId });
  });

  test('#/history を開いて履歴ページが表示される', async ({ page, extensionId }) => {
    await openPage({ page, extensionId }, 'history');
    await expect(page.locator('h2').first()).toHaveText('Now let’s watch some videos');
  });

  test('#/popup を開いてポップアップが表示される', async ({ page, extensionId }) => {
    await openPage({ page, extensionId }, 'popup');
    await expect(page.locator('p').first()).toContainText('Play any video you like');
  });
});
