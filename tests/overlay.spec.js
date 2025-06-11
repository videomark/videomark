import { acceptTerms, expect, openPage, test } from './common';

/**
 * QoE 値取得のタイムアウトを 2 分間に設定。
 */
const timeout = 1000 * 60 * 2;

/**
 * QoE 値が取得され、履歴ページに動画が記録されることを確認。通常 QoE 値は 1 分程度で取得されるが、QoE サーバーの
 * 調子が悪い場合は 2 分待っても取得されないことがあるため、このテストは失敗する場合がある。
 * @param {object} testArgs テスト変数の一部。
 * @param {import('@playwright/test').Page} testArgs.page タブ操作メソッドを含むオブジェクト。
 * @param {string} testArgs.extensionId 拡張機能 ID。
 * @param {string} title 動画タイトル。
 */
const validateResults = async ({ page, extensionId }, title) => {
  const qoeLabel = page.locator('#__videomark_ui');

  await expect(qoeLabel).toBeAttached();
  await expect(qoeLabel).toHaveText('Measuring...');

  // QoE 値が取得されるまで 5 秒おきにポーリング
  await expect(async () => {
    await expect(qoeLabel).toHaveText(/\b\d\.\d\d\b/);
  }).toPass({ timeout });

  const qoe = await page.locator('#__videomark_ui >> vm-stats >> .qoe').textContent();

  await openPage({ page, extensionId }, 'history');
  await expect(page.locator('.item .title')).toHaveText(title);
  // FIXME: 現状、暫定 QoE 値が履歴結果ページに表示されていないので、このマッチングが失敗している
  // await expect(page.locator('.item .qoe')).toHaveText(new RegExp(`\\b${qoe.replace('.', '\\.')}$`));
};

test.describe('動画オーバーレイ', () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await acceptTerms({ page, extensionId });
    test.setTimeout(timeout);
  });

  test('YouTube でオーバーレイが表示され、QoE が取得される', async ({ page, extensionId }) => {
    // 2 分程度、広告なし、人気の動画を再生
    // 通常ページでは再生が 40 秒程度で停止してしまうため、埋め込み動画を使用
    // @see https://github.com/webdino/sodium/issues/1182
    await page.goto('https://www.youtube.com/embed/4WXs3sKu41I');
    await page.locator('.ytp-large-play-button').click();

    const title = (await page.title()).replace(/ - YouTube$/, '');

    await validateResults({ page, extensionId }, title);
  });
});
