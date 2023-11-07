import { readable } from 'svelte/store';

/**
 * 現在の環境が Android 向けカスタムブラウザーであるかどうかの判定。
 * @returns {boolean} 結果。
 */
export const isVmBrowser = () => 'sodium' in globalThis;

/**
 * 現在の環境がブラウザー拡張機能であるかどうかの判定。
 * @returns {boolean} 結果。
 */
export const isExtension = () => !isVmBrowser() && 'storage' in globalThis.chrome;

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
