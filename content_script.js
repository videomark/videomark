const inject_script = opt => {
  // --- inject script, to opt.target --- ///
  const target = document.getElementsByTagName(opt.target)[0];

  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", opt.script);

  return target.appendChild(script);
};

const message_listener = event => {
  if (
    event.source !== window ||
    !event.data.type ||
    !event.data.method ||
    event.data.type !== "FROM_SODIUM_JS"
  )
    return;

  switch (event.data.method) {
    case "init":
      if (!event.data.id) return;
      (async () => {
        const { index } = await new Promise(resolve =>
          chrome.storage.local.get("index", resolve)
        );
        if (!Array.isArray(index)) return;
        await new Promise(resolve =>
          chrome.storage.local.set(
            { index: [...index, event.data.id] },
            resolve
          )
        );
      })();
      break;
    case "set_video":
      if (!event.data.id || !event.data.video) return;
      chrome.storage.local.set({
        [event.data.id]: event.data.video
      });
      break;
  }
};

chrome.storage.local.get("AgreedTerm", value => {
  if (!("AgreedTerm" in value)) {
    return;
  }

  if (!value["AgreedTerm"]) {
    return;
  }

  window.addEventListener("message", message_listener);

  inject_script({
    script: chrome.extension.getURL("/sodium.js"),
    target: "body"
  });
});
