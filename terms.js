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
      const url = new URL(location.href);
      url.pathname = "/qoelog/index.html";
      location.href = url.href;
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
