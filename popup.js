const logViewUrl = chrome.runtime.getURL("qoelog/index.html#/");
const inLogView = url => url.startsWith(logViewUrl);
const termsUrl = chrome.runtime.getURL("terms.html");

const openPage = async url => {
  const { id: currentWindowId } = await new Promise(resolve => {
    chrome.windows.getCurrent(resolve);
  });
  const view = chrome.extension
    .getViews({ type: "tab", windowId: currentWindowId })
    .find(({ location }) =>
      url === logViewUrl ? inLogView(location.href) : location.href === url
    );

  if (view == null) {
    chrome.tabs.create({ url });
  }

  window.close();
};

chrome.storage.local.get("AgreedTerm", value => {
  const agreed = "AgreedTerm" in value && value.AgreedTerm;
  openPage(agreed ? logViewUrl : termsUrl);
});
