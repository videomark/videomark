import { acceptTerms, expect, openPage, test } from './common';

test.describe('拡張機能内ページ', () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await acceptTerms({ page, extensionId });
  });

  test('#/history を開いて履歴ページが表示され、設定ページへ遷移できる', async ({
    page,
    extensionId,
  }) => {
    // 履歴ページを開く
    await openPage({ page, extensionId }, 'history');
    await expect(page.locator('h2').first()).toHaveText('Now let’s watch some videos');

    // 設定ページを開く
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/#\/settings$/);
    // セッション ID が設定されていることを確認
    await expect(page.locator('#setting-session-id-value')).toHaveText(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );

    // 履歴ページへ戻る
    await page.getByRole('button', { name: 'Back to History' }).click();
    await expect(page).toHaveURL(/#\/history$/);
  });

  // `#/popup` はブラウザーのタブで開いた場合 (モバイル) と実際のポップアップ (デスクトップ) で内容が異なり、後者の
  // ためのテストはできないが、いずれも履歴がない場合は対応サイト一覧が表示されるので、ボタンの存在を確認する
  test('#/popup を開いて対応サイト一覧が表示される', async ({ page, extensionId }) => {
    await openPage({ page, extensionId }, 'popup');
    await expect(page.getByRole('button', { name: 'YouTube' })).toBeVisible();
  });
});
