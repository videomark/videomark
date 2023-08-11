import { acceptTerms, expect, openPage, test } from './common';

/**
 * QoE 取得のタイムアウトを 2 分間に設定。
 */
const timeout = 1000 * 60 * 2;

/**
 * QoE が取得され、履歴ページに動画が記録されることを確認。
 * @param {object} testArgs テスト変数の一部。
 * @param {import('@playwright/test').Page} testArgs.page タブ操作メソッドを含むオブジェクト。
 * @param {string} testArgs.extensionId 拡張機能 ID。
 * @param {string} title 動画タイトル。
 */
const validateResults = async ({ page, extensionId }, title) => {
  const qoeLabel = page.locator('#__videomark_ui');

  await expect(qoeLabel).toBeAttached();
  await expect(qoeLabel).toHaveText('Measuring...');

  // QoE が取得されるまで 5 秒おきにポーリング
  await expect(async () => {
    await expect(qoeLabel).toHaveText(/\b\d\.\d\d\b/);
  }).toPass({ timeout });

  const qoe = await page.locator('#__videomark_ui >> vm-stats >> .qoe').textContent();

  await openPage({ page, extensionId }, 'history');
  await expect(page.locator('.item .title')).toHaveText(title);
  await expect(page.locator('.item .qoe')).toHaveText(new RegExp(`\\b${qoe.replace('.', '\\.')}$`));
};

test.describe('動画オーバーレイ', () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await acceptTerms({ page, extensionId });
    test.setTimeout(timeout);
  });

  test('YouTube でオーバーレイが表示され、QoE が取得される', async ({ page, extensionId }) => {
    // 2 分程度、広告なし、人気の動画を再生
    await page.goto('https://www.youtube.com/watch?v=4WXs3sKu41I');

    // 時々再生が開始されないことがあるので、スペースキーを押して明示的に再生する。なお、視聴地域 (主にヨーロッパ)
    // によっては Cookie バナーが表示され、許可か拒否を選択しないと再生されないが、ここではバナーが出ないことを
    // 前提としている。(GitHub Actions のサーバーはすべてアメリカにあり、日本でもバナーは出ない)
    await page.keyboard.down(' ');

    const title = await page.locator('#title h1').textContent();

    await validateResults({ page, extensionId }, title);
  });
});
