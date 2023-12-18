import { readable } from 'svelte/store';

/**
 * 現在の環境のブラウザー名を保持。
 * @type {import('svelte/store').Readable<'chrome' | 'safari' | 'firefox'>}
 */
export const browserName = readable('chrome', (set) => {
  const ua = navigator.userAgent;

  if (ua.match(/\bFirefox\//)) {
    set('firefox');
  } else if (ua.match(/\bChrome\b/)) {
    set('chrome');
  } else if (ua.match(/\bSafari\//)) {
    set('safari');
  } else {
    set('chrome');
  }
});

/**
 * 現在の環境がモバイル端末 (Android/iOS/iPadOS) かどうかを保持。
 * @type {import('svelte/store').Readable<boolean>}
 */
export const isMobile = readable(false, (set) => {
  const ua = navigator.userAgent;

  if (ua.match(/\b(?:Mobile|Tablet|Android|iPad|iPhone)\b/)) {
    set(true);
  } else if (navigator.platform === 'MacIntel' && navigator?.maxTouchPoints > 2) {
    set(true); // iPad
  } else {
    set(false);
  }
});

/**
 * 現在の環境が小さめの画面 (タブレット・スマートフォン) かどうかを保持。
 * @type {import('svelte/store').Readable<boolean>}
 */
export const isSmallScreen = readable(false, (set) => {
  const query = window.matchMedia('(max-width: 767px)');

  set(query.matches);

  query.addEventListener('change', () => {
    set(query.matches);
  });
});

/**
 * ポップアップが開かれているかどうかの判別。
 * @returns {Promise<boolean>} 結果。モバイルでは `chrome.action.setPopup()` で指定されたページは拡張機能
 * 専用ページで開かれるため、この結果は常に `false` となることに注意。
 * @see https://stackoverflow.com/q/62844607
 */
export const isPopupOpen = async () => {
  // Manifest v3
  if (typeof chrome.runtime.getContexts === 'function') {
    return !!(await chrome.runtime.getContexts({ contextTypes: ['POPUP'] })).length;
  }

  // Manifest v2
  return !!chrome.extension.getViews({ type: 'popup' }).length;
};
