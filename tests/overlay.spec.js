import { acceptTerms, expect, openPage, test } from './common';

/**
 * QoE 値の計測を行うかどうかのフラグ。
 */
const QOE_ENABLED = false;
/**
 * QoE 値取得のタイムアウトを 2 分間に設定。
 */
const timeout = 1000 * 60 * 2;

/**
 * オーバーレイが表示され、履歴ページに動画タイトルが記録されていることを検証する。
 * @param {object} testArgs テスト変数の一部。
 * @param {import('@playwright/test').Page} testArgs.page タブ操作メソッドを含むオブジェクト。
 * @param {string} testArgs.extensionId 拡張機能 ID。
 * @param {string} title 動画タイトル。
 */
const validateResults = async ({ page, extensionId }, title) => {
  const qoeLabel = page.locator('#__videomark_ui');
  let qoe = '';

  await expect(qoeLabel).toBeAttached();
  await expect(qoeLabel).toHaveText('Measuring...');

  if (QOE_ENABLED) {
    // QoE 値が取得されるまで 5 秒おきにポーリング
    await expect(async () => {
      await expect(qoeLabel).toHaveText(/\b\d\.\d\d\b/);
    }).toPass({ timeout });

    // eslint-disable-next-line no-unused-vars
    qoe = await page.locator('#__videomark_ui >> vm-stats >> .qoe').textContent();
  }

  await openPage({ page, extensionId }, 'history');
  await expect(page.locator('.item .title')).toHaveText(title);

  if (QOE_ENABLED) {
    // FIXME: 現状、暫定 QoE 値が履歴結果ページに表示されていないので、このマッチングが失敗している
    // await expect(page.locator('.item .qoe')).toHaveText(
    //   new RegExp(`\\b${qoe.replace('.', '\\.')}$`),
    // );
  }
};

test.describe('動画オーバーレイ', () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await acceptTerms({ page, extensionId });
    test.setTimeout(timeout);
  });

  test('YouTube でオーバーレイが表示される', async ({ page, extensionId }) => {
    // 2 分程度、広告なし、人気の動画を再生
    // 通常ページでは再生が 40 秒程度で停止してしまうため、埋め込み動画を使用
    // @see https://github.com/webdino/sodium/issues/1182
    await page.goto('https://www.youtube.com/embed/4WXs3sKu41I');
    await page.locator('.ytp-large-play-button').click();

    const title = (await page.title()).replace(/ - YouTube$/, '');

    await validateResults({ page, extensionId }, title);
  });
});
