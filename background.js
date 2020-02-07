const hostToIp = {};

const communicator = {
  getIp: host => ({ ip: hostToIp[host] })
};

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
  "https://pr.iij.ad.jp"
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

chrome.runtime.onConnect.addListener(port => {
  if (port.name !== "sodium-extension-communication-port") return;
  port.onMessage.addListener(value => {
    if (!value.requestId || !value.method) return;
    const ret = communicator[value.method].apply(null, value.args);
    ret["requestId"] = value.requestId;
    port.postMessage(ret);
  });
});

/** 計測中であることをツールバーのアイコンで通知する */
const updateIcon = (tabId, enabled) => {
  chrome.browserAction.setIcon({
    tabId,
    path: enabled ? "icons/enabled.png" : "icons/disabled.png"
  });
};

// Port名"sodium-extension-alive"の接続状況に応じて計測中であることを受け取る
chrome.runtime.onConnect.addListener(port => {
  const { name, sender } = port;
  if (name !== "sodium-extension-alive") return;
  const tabId = sender.tab.id;
  port.onDisconnect.addListener(() => updateIcon(tabId, false));
  updateIcon(tabId, true);
});
