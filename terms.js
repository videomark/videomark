window.onload = () => {
  let terms = false;
  let privacy = false;

  const submitButton = document.getElementById("submit");

  const updateState = () => {
    if (terms && privacy) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  };

  submitButton.onclick = () => {
    if (terms && privacy) {
      console.log("ok");
      chrome.storage.local.set({ AgreedTerm: true });
      location.href = chrome.runtime.getURL("qoelog/index.html");
    }
  };

  document.getElementById("terms").onclick = () => {
    console.log("terms");
    terms = !terms;
    updateState();
  };

  document.getElementById("privacy").onclick = () => {
    console.log("privacy");
    privacy = !privacy;
    updateState();
  };
};
