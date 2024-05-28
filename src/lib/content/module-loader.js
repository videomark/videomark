// コンテンツスクリプトはモジュールではないため、動的にインポートし、内部で静的インポートを可能にする
// https://stackoverflow.com/q/48104433
(async () => {
  await import(chrome.runtime.getURL('/scripts/content/main.js'));
})();
