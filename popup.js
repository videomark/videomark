const hash = window.location.hash;
let shouldCreateNewTab = true;

const id = chrome.app.getDetails().id;
const htmlPage = "/qoelog/index.html";
const termsPage = "/terms.html";
const tabUrl = "chrome-extension://" + id + htmlPage;
const termsUrl = "chrome-extension://" + id + termsPage;

const openPage = (windowId, pathname, url) => {
  const extensionsTabs = chrome.extension.getViews({
    type: "tab",
    windowId
  });
  const launcher = extensionsTabs.find(extensionTab => {
    return extensionTab.location.pathname === pathname;
  });

  extensionsTabs.forEach(extensionTab => {
    if (extensionTab.location.pathname === htmlPage && shouldCreateNewTab) {
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
      openPage(currentWindow.id, "/index.html", tabUrl);
      return;
    }

    openPage(currentWindow.id, "/terms.html", termsUrl);
  });
});
