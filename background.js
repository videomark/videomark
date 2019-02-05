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

chrome.runtime.onInstalled.addListener(() => {
  chrome.browserAction.getPopup({}, url => {
    chrome.tabs.create({ url });
  });
});
