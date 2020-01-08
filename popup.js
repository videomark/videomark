const tabUrlBase = new URL(chrome.runtime.getURL("qoelog/index.html"));
const tabUrl = new URL("#/", tabUrlBase);
const termsUrl = new URL(chrome.runtime.getURL("terms.html"));

const hash = window.location.hash;
let shouldCreateNewTab = true;
const openPage = (windowId, pathname, url) => {
  const extensionsTabs = chrome.extension.getViews({
    type: "tab",
    windowId
  });
  const launcher = extensionsTabs.find(extensionTab => {
    return extensionTab.location.pathname === pathname;
  });

  extensionsTabs.forEach(extensionTab => {
    if (
      extensionTab.location.pathname === tabUrl.pathname &&
      shouldCreateNewTab
    ) {
      shouldCreateNewTab = false;
      if (hash && extensionTab.location.hash !== hash) {
        chrome.tabs.update(extensionTab.dhcChromeTabId, {
          active: true,
          url: url + hash
        });
      } else {
        chrome.tabs.update(extensionTab.dhcChromeTabId, { active: true });
      }
    }
  });

  if (shouldCreateNewTab) {
    chrome.tabs.create({
      url: url + hash
    });
  }

  if (launcher) {
    launcher.close();
  }
  window.close();
};

chrome.windows.getCurrent(currentWindow => {
  chrome.storage.local.get("AgreedTerm", value => {
    const result = "AgreedTerm" in value ? value.AgreedTerm : false;

    if (result) {
      openPage(currentWindow.id, "/index.html", tabUrl.href);
      return;
    }

    openPage(currentWindow.id, "/terms.html", termsUrl.href);
  });
});
