import { openTab } from '$lib/services/navigation';
import { SCHEMA_VERSION, storage } from '$lib/services/storage';

/** content_scripts の許可されているOriginかどうか判定 */
// Declarative Net Request API 向けの `request_rules.json` と同期すること
const permittedOrigins = [
  /^https:\/\/([a-z-]+\.)?youtube\.com$/,
  /^https:\/\/([a-z-]+\.)?tver\.jp$/,
  'https://i.fod.fujitv.co.jp',
  'https://www.nicovideo.jp',
  /^https:\/\/live\d\.nicovideo\.jp$/,
  'https://www.nhk-ondemand.jp',
  /^https:\/\/[a-z-]+\.video\.dmkt-sp\.jp$/,
  'https://abema.tv',
  /^https:\/\/ds-linear-abematv\.akamaized\.net$/,
  /^https:\/\/[a-z0-9.-]\.abema-tv\.com$/,
  'https://www.amazon.co.jp',
  /^https?:\/\/pr\.iij\.ad\.jp$/,
];

/**
 * content_scripts の許可されているOriginかどうか判定
 * @param {string} origin
 * @return {boolean}
 */
const isPermittedOrigin = (origin) =>
  permittedOrigins.some((stringOrRegExp) =>
    typeof stringOrRegExp === 'string' ? stringOrRegExp === origin : stringOrRegExp.test(origin),
  );

// `webRequestBlocking` パーミッションは Manifest v3 では使用不可。以下はまだ `declarativeNetRequest` が
// 実装されていない Firefox 向け後方互換。 @see https://bugzilla.mozilla.org/1687755
if (typeof chrome.declarativeNetRequest === 'undefined') {
  chrome.webRequest.onHeadersReceived.addListener(
    ({ initiator, responseHeaders }) => {
      const additionalHeaders = [
        isPermittedOrigin(initiator) && {
          name: 'Timing-Allow-Origin',
          value: initiator,
        },
      ].filter(Boolean);

      return { responseHeaders: [...responseHeaders, ...additionalHeaders] };
    },
    { urls: ['<all_urls>'] },
    // Chrome 79 以降では、`blocking`、`responseHeaders` に加えて `extraHeaders` オプションが必要。ただし、
    // これを付けると Firefox でリスナー自体が動作しなくなるため注意が必要。
    // @see https://groups.google.com/a/chromium.org/g/extensions-dev/c/WAycYvTuZno
    // @see https://stackoverflow.com/q/66265032
    Object.values(chrome.webRequest.OnHeadersReceivedOptions),
  );
}

chrome.webRequest.onResponseStarted.addListener(
  async (details) => {
    const url = new URL(details.url);

    if (url.host && details.ip) {
      const hostToIp = (await storage.get('hostToIp')) || {};

      await storage.set('hostToIp', { ...hostToIp, [url.host]: details.ip });
    }
  },
  {
    urls: ['<all_urls>'],
  },
  ['responseHeaders'],
);

const initToolbarButton = async () => {
  const termsAgreed = await storage.get('AgreedTerm');

  if (termsAgreed) {
    chrome.action.setPopup({ popup: '/index.html#/popup' });
  } else {
    chrome.action.onClicked.addListener(() => openTab('#/onboarding'));
  }
};

initToolbarButton();

chrome.runtime.onInstalled.addListener(() => {
  (async () => {
    const termsAgreed = await storage.get('AgreedTerm');
    const version = await storage.get('version');
    const legacyVersion = version && version < SCHEMA_VERSION;

    // 古いデータスキーマの場合は移行せずに破棄
    if (legacyVersion) {
      await storage.clear();
    }

    if (termsAgreed && !legacyVersion) {
      chrome.action.setPopup({ popup: '/index.html#/popup' });
    } else {
      openTab('#/onboarding');
    }
  })();
});

const getMasterDisplayOnPlayer = async () => {
  const settings = await storage.get('settings');

  return settings === null || settings.display_on_player === null || settings.display_on_player;
};

const communicator = {
  setAlive: async (tab, alive) => {
    // eslint-disable-next-line no-use-before-define
    updateIcon(tab.id, alive);
  },
  setDisplayOnPlayer: async (tab, displayOnPlayer) => {
    const tabStatus = (await storage.get('tabStatus')) || {};
    const status = tabStatus[tab.id] || {};

    status.displayOnPlayer = displayOnPlayer;
    await storage.set('tabStatus', { ...tabStatus, [tab.id]: status });
  },
  getDisplayOnPlayer: async (tab) => {
    const tabStatus = (await storage.get('tabStatus')) || {};
    let { displayOnPlayer } = tabStatus[tab.id] || {};

    if (displayOnPlayer === undefined) {
      displayOnPlayer = await getMasterDisplayOnPlayer();
    }

    return { displayOnPlayer };
  },
  getPlatformInfo: async () => {
    const platformInfo = await new Promise((resolve) => {
      chrome.runtime.getPlatformInfo(resolve);
    });

    return { platformInfo };
  },
  getIp: async (tab, host) => {
    const hostToIp = (await storage.get('hostToIp')) || {};

    return { ip: hostToIp[host] };
  },
};

const popupCommunicator = {
  getTabStatus: async (tabId) => {
    const tabStatus = (await storage.get('tabStatus')) || {};
    const status = tabStatus[tabId] || {};

    if (status.displayOnPlayer === undefined) {
      status.displayOnPlayer = await getMasterDisplayOnPlayer();
    }

    return status;
  },
};

/** 計測中であることをツールバーのアイコンで通知する */
const updateIcon = async (tabId, enabled) => {
  const tabStatus = (await storage.get('tabStatus')) || {};
  const status = tabStatus[tabId] || {};

  if (status.alive === enabled) {
    return;
  }

  status.alive = enabled;
  await storage.set('tabStatus', { ...tabStatus, [tabId]: status });

  chrome.action.setIcon({
    tabId,
    path: enabled ? '/images/icons/enabled.png' : '/images/icons/disabled.png',
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { method, args = [] } = request;
  const { tab } = sender;

  if (!method) {
    return false;
  }

  // 本来は `Promise` を返しその中で解決すれば良いはずだが、なぜかレスポンスが `undefined` となってしまうので、
  // 以下のように非同期即時関数を用意し、従来通り `sendResponse` を使う。
  (async () => {
    const response = tab
      ? await communicator[method].apply(null, [tab, ...args])
      : await popupCommunicator[method].apply(null, [...args]);

    sendResponse(response || {});
  })();

  return true;
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const tabStatus = (await storage.get('tabStatus')) || {};

  delete tabStatus[tabId];
  await storage.set('tabStatus', tabStatus);
  // `chrome.action.setIcon()` は余計なエラーが出るので不要
});
