const hostToIp = {};

const communicator = {
  getIp: host => ({ ip: hostToIp[host] })
}

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    details.responseHeaders.push({
      name: "timing-allow-origin",
      value: "*"
    });
    return {
      responseHeaders: details.responseHeaders
    };
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

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason !== "install") return;
  chrome.browserAction.getPopup({}, url => {
    chrome.tabs.create({ url });
  });
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