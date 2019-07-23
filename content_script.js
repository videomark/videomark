const state = {};
const useId = async viewingId => {
  if (typeof state[viewingId] === "string" || Number.isFinite(state[viewingId]))
    return state[viewingId];

  const { index } = await new Promise(resolve =>
    chrome.storage.local.get("index", resolve)
  );
  if (Array.isArray(index)) {
    state[viewingId] = index.length === 0 ? 0 : index.slice(-1)[0] + 1;
  } else {
    state[viewingId] = viewingId;
  }
  return state[viewingId];
};

const inject_script = opt => {
  // --- inject script, to opt.target --- ///
  const target = document.getElementsByTagName(opt.target)[0];

  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", opt.script);

  return target.appendChild(script);
};

const message_listener = async event => {
  if (
    event.source !== window ||
    !event.data.type ||
    !event.data.method ||
    event.data.type !== "FROM_SODIUM_JS"
  )
    return;

  switch (event.data.method) {
    case "init": {
      if (!event.data.id) return;
      const id = await useId(event.data.id);
      if (typeof id === "string") return;
      await new Promise(resolve =>
        chrome.storage.local.set(
          {
            index: [...index, id]
          },
          resolve
        )
      );
      break;
    }
    case "set_video": {
      if (!event.data.id || !event.data.video) return;
      const id = await useId(event.data.id);
      chrome.storage.local.set({
        [id]: event.data.video
      });
      break;
    }
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
