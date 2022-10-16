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
 * 現在の環境のブラウザー名を取得。
 * @returns {string} `chrome`、`firefox` など。
 */
export const getBrowserName = () => {
  const ua = navigator.userAgent;

  if (ua.match(/\bFirefox\//)) {
    return 'firefox';
  }

  if (ua.match(/\bChrome\b/)) {
    return 'chrome';
  }

  if (ua.match(/\bSafari\//)) {
    return 'safari';
  }

  return 'chrome';
};
