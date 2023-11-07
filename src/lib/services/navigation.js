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

  if (isInternalPage) {
    // eslint-disable-next-line no-param-reassign
    url = chrome.runtime.getURL(url.replace(/^#/, '/index.html#'));

    // モバイルの場合はポップアップも他の拡張機能内ページも同じ専用画面内で開く
    if (get(isMobile)) {
      // eslint-disable-next-line prefer-destructuring
      window.location.hash = url.match(/(#.*)/)[1];

      return;
    }
  }

  const [currentTab] = await chrome.tabs.query({
    currentWindow: true,
    url: isInternalPage ? `${chrome.runtime.getURL('/')}*` : url,
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
