import { writable } from 'svelte/store';

export const selectedPageName = writable();

/**
 * 与えられた URL をブラウザーのタブで開く。拡張機能内ページの URL に関しては、既にページが開かれている場合はそのタブ
 * を選択し、必要であればページを変更。
 * @param {string} url URL.
 */
export const openTab = async (url) => {
  if (url.match(/^https?:/)) {
    await chrome.tabs.create({ url });

    return;
  }

  url = chrome.runtime.getURL(url.replace(/^#/, '/index.html#'));

  const [currentTab] = await chrome.tabs.query({
    currentWindow: true,
    url: `${chrome.runtime.getURL('/')}*`,
  });

  if (currentTab) {
    await chrome.tabs.update(currentTab.id, { url, active: true });
  } else {
    await chrome.tabs.create({ url });
  }
};
