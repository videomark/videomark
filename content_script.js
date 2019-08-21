const storage = {
  get: keys => new Promise(resolve => chrome.storage.local.get(keys, resolve)),
  set: items => new Promise(resolve => chrome.storage.local.set(items, resolve))
};

const state = {};
const useId = async viewingId => {
  if (typeof state[viewingId] === "string" || Number.isFinite(state[viewingId]))
    return state[viewingId];

  const { index } = await storage.get("index");
  if (Array.isArray(index)) {
    const id = index.length === 0 ? 0 : index.slice(-1)[0] + 1;
    await storage.set({
      index: [...index, id]
    });
    state[viewingId] = id;
  } else {
    state[viewingId] = viewingId;
  }
  return state[viewingId];
};

const inject_script = async opt => {
  // --- inject script, to opt.target --- ///
  const target = document.getElementsByTagName(opt.target)[0];

  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", opt.script);

  const { session, settings } = await storage.get(["session", "settings"]);
  if (session !== undefined) {
    script.dataset.session = new URLSearchParams({ ...session }).toString();
  }
  if (settings !== undefined) {
    script.dataset.settings = new URLSearchParams({ ...settings }).toString();
  }

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
    case "set_session": {
      const { id, expires } = event.data;
      if (id == null || expires == null) return;
      await storage.set({ session: { id, expires } });
      break;
    }
    case "set_video": {
      if (!event.data.id || !event.data.video) return;
      const id = await useId(event.data.id);
      await storage.set({
        [id]: event.data.video
      });
      break;
    }
  }
};

storage.get("AgreedTerm").then(value => {
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
