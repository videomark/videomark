import { get, writable } from 'svelte/store';
import { isMobile } from '$lib/services/runtime';

export const selectedPageName = writable();

/**
 * 与えられた URL をブラウザーのタブで開く。既にページが開かれている場合はそのタブを選択する。拡張機能内ページの URL
 * に関しては、URL ハッシュが異なっても同一ページとみなし、異なる場合には実際に開かれているページを変更。
 * @param {string} url URL.
 */
export const openTab = async (url) => {
  const isInternalPage = !url.startsWith('https:');
  const _isMobile = get(isMobile);

  if (isInternalPage) {
    // eslint-disable-next-line no-param-reassign
    url = chrome.runtime.getURL(url.replace(/^#/, '/index.html#'));

    // モバイルの場合はポップアップも他の拡張機能内ページも同じ専用画面内で開く
    if (_isMobile) {
      // eslint-disable-next-line prefer-destructuring
      window.location.hash = url.match(/(#.*)/)[1];

      return;
    }
  } else if (_isMobile) {
    // 拡張機能専用ページを閉じる
    window.setTimeout(() => {
      window.close();
    }, 100);
  }

  const [currentTab] = await new Promise((resolve) => {
    chrome.tabs.query(
      {
        currentWindow: true,
        url: isInternalPage ? `${chrome.runtime.getURL('/')}*` : url,
      },
      (tabs) => {
        resolve(tabs);
      },
    );
  });

  if (currentTab) {
    await chrome.tabs.update(currentTab.id, {
      url: isInternalPage ? url : undefined, // `undefined` であればタブの URL は維持される
      active: true,
    });
  } else {
    await chrome.tabs.create({ url });
  }
};

/**
 * URL ハッシュを更新して拡張機能内の別ページへ遷移。(Sveltia CMS の同名関数の簡易版)
 * @param {string} newHash 新しい URL ハッシュ。
 * @param {object} [options] オプション
 * @param {boolean} [options.replaceState] 履歴ステートを書き換えるか。
 */
export const goto = (newHash, { replaceState = false } = {}) => {
  const oldURL = window.location.hash;
  const newURL = newHash;

  if (replaceState) {
    window.history.replaceState({ from: oldURL }, '', newURL);
  } else {
    window.history.pushState({ from: oldURL }, '', newURL);
  }

  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

/**
 * 前のページが該当ページあれば履歴を戻り、違う場合は単純に履歴を更新。(Sveltia CMS の同名関数の簡易版)
 * @param {string} newHash 新しい URL ハッシュ。
 */
export const goBack = (newHash) => {
  if (window.history.state?.from === newHash) {
    window.history.back();
  } else {
    goto(newHash);
  }
};
