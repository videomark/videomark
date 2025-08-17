// content.js はモジュールではないので `import` が使えない。本来はビルド時にインライン化できるはずだが、Vite で
// 共有モジュールの code splitting を無効化する方法がなく、共有されている `storage.js` は別ファイルとして生成
// されてしまうので、`storage` はインポートせずに使う。 @see https://github.com/rollup/rollup/issues/2756
const storage = {
  get: (keys) =>
    new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    }),
  set: (items) =>
    new Promise((resolve) => {
      chrome.storage.local.set(items, resolve);
    }),
};

const save_transfer_size = async (transfer_diff) => {
  if (!transfer_diff) {
    return;
  }

  let { transfer_size } = await storage.get('transfer_size');

  if (!transfer_size) {
    transfer_size = {};
  }

  const now = new Date();

  const month = `${now.getFullYear()}-${new Intl.NumberFormat('en-US', {
    minimumIntegerDigits: 2,
  }).format(now.getMonth() + 1)}`;

  const size = (transfer_size[month] || 0) + transfer_diff;

  transfer_size[month] = size;
  storage.set({ transfer_size });
};

const save_quota_limit_started = async (limit_started) => {
  let { transfer_size } = await storage.get('transfer_size');

  if (!transfer_size) {
    transfer_size = {};
  }

  transfer_size.limit_started = limit_started;
  storage.set({ transfer_size });
};

const save_peak_time_limit = async (peak_time_limit) => {
  if (!peak_time_limit) {
    return;
  }

  storage.set({ peak_time_limit });
};

const save_settings = async (new_settings) => {
  if (!new_settings || !Object.keys(new_settings).length) {
    return;
  }

  let { settings } = await storage.get('settings');

  settings = { ...settings, ...new_settings };
  storage.set({ settings });
};

/**
 * スクリプトを指定された要素に挿入する。
 * @param {Object} args 引数。
 * @param {string} args.src 挿入するスクリプトの URL。
 * @param {HTMLElement} args.target スクリプトを挿入するターゲット要素。
 * @returns {Promise<HTMLScriptElement>} 挿入されたスクリプト要素。
 */
const inject_script = async ({ src, target }) => {
  const script = document.createElement('script');

  script.setAttribute('type', 'module');
  script.setAttribute('src', src);

  const { session, settings, transfer_size, peak_time_limit } = await storage.get([
    'session',
    'settings',
    'transfer_size',
    'peak_time_limit',
  ]);

  if (session !== undefined) {
    script.dataset.session = new URLSearchParams({ ...session }).toString();
  }

  script.dataset.settings = JSON.stringify(settings || {});
  script.dataset.transfer_size = JSON.stringify(transfer_size || {});
  script.dataset.peak_time_limit = JSON.stringify(peak_time_limit || {});

  return target.appendChild(script);
};

/** @class background と通信するための汎用的なクラス */
class BackgroundCommunicationPort {
  async postMessage(method, args) {
    return chrome.runtime.sendMessage({ method, args });
  }

  /**
   * @param {VideoPlaybackInfo} [detail]
   */
  updatePlaybackInfo(detail) {
    this.postMessage('updatePlaybackInfo', [detail]);
  }

  updateHistory(data) {
    this.postMessage('updateHistory', [data]);
  }

  setDisplayOnPlayer(displayOnPlayer) {
    this.postMessage('setDisplayOnPlayer', [displayOnPlayer]);
  }

  async getDisplayOnPlayer() {
    return (await this.postMessage('getDisplayOnPlayer')).displayOnPlayer;
  }

  async getPlatformInfo() {
    return (await this.postMessage('getPlatformInfo')).platformInfo;
  }

  async getIp(host) {
    return (await this.postMessage('getIp', [host])).ip;
  }
}

const communicationPort = new BackgroundCommunicationPort();

const message_listener = async (event) => {
  const { type, method, timestamp, prop } = event.data;

  if (event.source !== window || type !== 'FROM_SODIUM_JS' || !method) {
    return;
  }

  switch (method) {
    case 'get_data': {
      const detail = await (async () => {
        if (prop === 'display_on_player') {
          return communicationPort.getDisplayOnPlayer();
        }

        if (prop === 'platform_info') {
          return communicationPort.getPlatformInfo();
        }

        if (prop === 'ip') {
          return communicationPort.getIp(event.data.host);
        }

        if (prop === 'ui_locale') {
          return chrome.i18n.getUILanguage();
        }

        return {};
      })();

      event.source.postMessage({
        type: 'FROM_CONTENT_JS',
        method,
        timestamp,
        detail,
      });

      break;
    }

    case 'set_session': {
      const { session } = event.data;

      await storage.set({ session });
      break;
    }

    case 'update_history': {
      communicationPort.updateHistory(event.data);
      break;
    }

    case 'save_transfer_size': {
      const { transfer_diff } = event.data;

      await save_transfer_size(transfer_diff);
      break;
    }

    case 'save_quota_limit_started': {
      const { limit_started } = event.data;

      await save_quota_limit_started(limit_started);
      break;
    }

    case 'save_peak_time_limit': {
      const { peak_time_limit } = event.data;

      await save_peak_time_limit(peak_time_limit);
      break;
    }

    case 'save_settings': {
      const { new_settings } = event.data;

      await save_settings(new_settings);
      break;
    }

    case 'update_playback_info': {
      communicationPort.updatePlaybackInfo(event.data.detail);
      break;
    }

    case 'set_display_on_player': {
      communicationPort.setDisplayOnPlayer(event.data.enabled);
      break;
    }

    default:
  }
};

storage.get('AgreedTerm').then((value) => {
  if (!value.AgreedTerm) {
    return;
  }

  window.addEventListener('message', message_listener);

  inject_script({
    src: chrome.runtime.getURL('/scripts/sodium.js'),
    target: document.documentElement,
  });
});

chrome.runtime.onMessage.addListener((request /* , sender, sendResponse */) => {
  window.postMessage(request, '*');
});

// YouTube の動画ページで、`fetch` の上書きを禁止しているスクリプトを、実行される前に削除する
// これにより、`YouTubeTypeHandler` 内の `hook_youtube_fetch()` が正常に動作するようになる
if (window.location.origin === 'https://www.youtube.com') {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.tagName === 'SCRIPT' &&
            !node.src &&
            node.textContent.includes('Object.defineProperty') &&
            node.textContent.match(/window,\s*['"]fetch['"]/)
          ) {
            console.debug('VIDEOMARK: Removing fetch override script from YouTube', node);
            node.remove();
            observer.disconnect();
          }
        });
      }
    });
  });

  observer.observe(document, { childList: true, subtree: true });
}
