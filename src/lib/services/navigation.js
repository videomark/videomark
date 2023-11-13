import { writable } from 'svelte/store';

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
