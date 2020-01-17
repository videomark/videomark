const termsUrl = chrome.runtime.getURL("terms.html");
const logViewUrl = chrome.runtime.getURL("qoelog/index.html#/popup");

chrome.storage.local.get("AgreedTerm", value => {
  const agreed = "AgreedTerm" in value && value.AgreedTerm;
  if (!agreed) {
    chrome.tabs.create({ url: termsUrl });
    window.close();
    return;
  }

  location.href = logViewUrl;
});
