/** content_scripts の許可されているOriginかどうか判定 */
const permittedOrigins = [
  /^https:\/\/([a-z-]+\.)?youtube\.com$/,
  /^https:\/\/([a-z-]+\.)?paravi\.jp$/,
  /^https:\/\/([a-z-]+\.)?tver\.jp$/,
  "https://i.fod.fujitv.co.jp",
  "https://www.nicovideo.jp",
  /^https:\/\/live\d\.nicovideo\.jp$/,
  "https://www.nhk-ondemand.jp",
  /^https:\/\/[a-z-]+\.video\.dmkt-sp\.jp$/,
  "https://abema.tv",
  "https://www.amazon.co.jp",
  /^https?:\/\/pr\.iij\.ad\.jp$/,
  "https://hamilton.britegrid.io"
];

/**
 * content_scripts の許可されているOriginかどうか判定
 * @param {string} origin
 * @return {boolean}
 */
const isPermittedOrigin = origin =>
  permittedOrigins.some(stringOrRegExp =>
    typeof stringOrRegExp === "string"
      ? stringOrRegExp === origin
      : stringOrRegExp.test(origin)
  );

chrome.webRequest.onHeadersReceived.addListener(
  ({ initiator, responseHeaders }) => {
    const additionalHeaders = [
      isPermittedOrigin(initiator) && {
        name: "Timing-Allow-Origin",
        value: initiator
      }
    ].filter(Boolean);
    return { responseHeaders: [...responseHeaders, ...additionalHeaders] };
  },
  {
    urls: ["<all_urls>"]
  },
  ["blocking", "responseHeaders"]
);

chrome.webRequest.onResponseStarted.addListener(
  details => {
    const url = new URL(details.url);
    if (url.host && details.ip) hostToIp[url.host] = details.ip;
  },
  {
    urls: ["<all_urls>"]
  },
  ["responseHeaders"]
);

chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  switch (reason) {
    case "install": {
      chrome.browserAction.getPopup({}, url => {
        chrome.tabs.create({ url });
      });
      break;
    }
    case "update": {
      const major = version =>
        version == null ? 0 : Number(version.slice(".")[0]);
      const majorVersion = major(chrome.runtime.getManifest().version);
      if (major(previousVersion) < majorVersion) {
        const url = `https://vm.webdino.org/whatsnew/extension/${majorVersion}`;
        chrome.tabs.create({ url });
      }
      break;
    }
    default:
      break;
  }
});

const storage = {
  get: keys => new Promise(resolve => chrome.storage.local.get(keys, resolve)),
  set: items => new Promise(resolve => chrome.storage.local.set(items, resolve))
};

const getMasterDisplayOnPlayer = async () => {
  const { settings } = await storage.get("settings");
  return settings == null ||
    settings.display_on_player == null ||
    settings.display_on_player;
};

const tabStatus = {};

const hostToIp = {};

chrome.runtime.onConnect.addListener(port => {
  if (port.name === "sodium-extension-communication-port") {
    const tabId = port.sender.tab.id;
    port.onMessage.addListener(async value => {
      if (!value.requestId || !value.method) return;
      const args = Array.from(value.args || []);
      args.unshift(port.sender.tab);
      const ret = await communicator[value.method].apply(null, args) || {};
      ret.requestId = value.requestId;
      port.postMessage(ret);
    });
    port.onDisconnect.addListener(() => removeTab(tabId));
  }

  if (port.name === "sodium-popup-communication-port") {
    port.onMessage.addListener(async value => {
      if (!value.requestId || !value.method) return;
      const args = Array.from(value.args || []);
      const ret = await popupCommunicator[value.method].apply(null, args) || {};
      ret.requestId = value.requestId;

      // ポップアップを閉じる時もなぜか実行され、エラーになるので無視する
      try {
        port.postMessage(ret);
      } catch (e) {
        // nop
      }
    });
  }
});

const communicator = {
  setAlive: async (tab, alive) => {
    updateIcon(tab.id, alive);
  },
  setDisplayOnPlayer: async (tab, displayOnPlayer) => {
    const status = tabStatus[tab.id] || {};
    status.displayOnPlayer = displayOnPlayer;
    tabStatus[tab.id] = status;
  },
  getDisplayOnPlayer: async (tab) => {
    let { displayOnPlayer } = tabStatus[tab.id] || {};
    if (displayOnPlayer === undefined) {
      displayOnPlayer = await getMasterDisplayOnPlayer();
    }
    return { displayOnPlayer };
  },
  getPlatformInfo: async () => {
    const platformInfo = await new Promise(resolve => chrome.runtime.getPlatformInfo(resolve));
    return { platformInfo };
  },
  getIp: async (tab, host) => ({ ip: hostToIp[host] })
};

const popupCommunicator = {
  getTabStatus: async (tabId) => {
    const status = tabStatus[tabId] || {};
    if (status.displayOnPlayer === undefined) {
      status.displayOnPlayer = await getMasterDisplayOnPlayer();
    }
    return status;
  }
};

/** 計測中であることをツールバーのアイコンで通知する */
const updateIcon = (tabId, enabled) => {
  const status = tabStatus[tabId] || {};
  if (status.alive == enabled) return;

  status.alive = enabled;
  tabStatus[tabId] = status;

  chrome.browserAction.setIcon({
    tabId,
    path: enabled ? "icons/enabled.png" : "icons/disabled.png"
  });
};

const removeTab = (tabId) => {
  delete tabStatus[tabId];
  // chrome.browserAction.setIcon() は余計なエラーが出るの不要
};
