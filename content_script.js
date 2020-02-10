const storage = {
  get: keys => new Promise(resolve => chrome.storage.local.get(keys, resolve)),
  set: items => new Promise(resolve => chrome.storage.local.set(items, resolve))
};

const port = chrome.runtime.connect({
  name: "sodium-extension-communication-port"
});

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

// from sodium.js/src/js/modules/StatStorage.js
const save_transfer_size = async transfer_diff => {
  if (!transfer_diff) return;

  let { transfer_size } = await storage.get("transfer_size");
  if (!transfer_size) transfer_size = {};

  const now = new Date();
  const month = `${now.getFullYear()}-${new Intl.NumberFormat("en-US", {
    minimumIntegerDigits: 2
  }).format(now.getMonth() + 1)}`;
  const size = (transfer_size[month] || 0) + transfer_diff;
  transfer_size[month] = size;
  storage.set({ transfer_size });
};

const inject_script = async opt => {
  // --- inject script, to opt.target --- ///
  const target = document.getElementsByTagName(opt.target)[0];

  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", opt.script);

  const { session, settings, transfer_size } = await storage.get(["session", "settings", "transfer_size"]);
  if (session !== undefined) {
    script.dataset.session = new URLSearchParams({ ...session }).toString();
  }
  script.dataset.settings      = JSON.stringify(settings      || {});
  script.dataset.transfer_size = JSON.stringify(transfer_size || {});

  return target.appendChild(script);
};

/** @class background のプロセスに計測中であることを伝えるためのクラス */
class AlivePort {
  constructor() {
    this.timeout = null;
    this.port = null;

    /** 計測中であることを伝えるためのPort名 */
    this.portName = "sodium-extension-alive";

    /**
     * 計測していないものとしてみなす経過時間
     * sodium.js の Config.collect_interval に+200ms余裕をもたせる
     */
    this.timeoutIn = 1200;
  }

  /**
   * 計測中であることを伝える
   * 実行後ある時間経過すると計測していないものとみなす
   */
  alive() {
    if (this.timeout != null) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (this.port == null) return;
      this.port.disconnect();
      this.port = null;
    }, this.timeoutIn);

    if (this.port == null) {
      this.port = chrome.runtime.connect({
        name: this.portName
      });
    }
  }
}
const alivePort = new AlivePort();

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
      alivePort.alive();

      if (!event.data.id || !event.data.video) return;
      const id = await useId(event.data.id);
      await storage.set({
        [id]: event.data.video
      });
      break;
    }
    case "save_transfer_size": {
      const { transfer_diff } = event.data;
      await save_transfer_size(transfer_diff);
      break;
    }
    case "get_ip": {
      const ip = await getIp(event.data.host);
      event.source.postMessage({
        ip,
        host: event.data.host,
        type: "CONTENT_SCRIPT_JS"
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
    script: chrome.runtime.getURL("sodium.js"),
    target: "body"
  });
});

function getIp(host) {
  const requestId = getRandomToken();
  return new Promise((resolve, reject) => {
    const listener = value => {
      try {
        if (value.requestId === requestId) resolve(value.ip);
      } catch (e) {
        reject(e);
      } finally {
        port.onMessage.removeListener(listener);
      }
      return true;
    };
    port.onMessage.addListener(listener);
    port.postMessage({
      requestId,
      method: "getIp",
      args: [host]
    });
  });
}

function getRandomToken() {
  const randomPool = new Uint8Array(16);
  crypto.getRandomValues(randomPool);
  let hex = "";
  for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  return hex;
}
