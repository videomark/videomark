const isVMBrowser = Boolean(window.sodium);

const storage = {
  get: keys => new Promise(resolve => (isVMBrowser ? sodium : chrome).storage.local.get(keys, resolve)),
  set: items => new Promise(resolve => (isVMBrowser ? sodium : chrome).storage.local.set(items, resolve))
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

const save_quota_limit_started = async limit_started => {
  let { transfer_size } = await storage.get("transfer_size");
  if (!transfer_size) transfer_size = {};

  transfer_size.limit_started = limit_started;
  storage.set({ transfer_size });
};

const save_peak_time_limit = async peak_time_limit => {
  if (!peak_time_limit) return;
  storage.set({ peak_time_limit });
};

const save_settings = async new_settings => {
  if (!new_settings || !Object.keys(new_settings).length) return;
  let { settings } = await storage.get("settings");
  settings = { ...settings, ...new_settings };
  storage.set({ settings });
};

const inject_script = async opt => {
  // --- inject script, to opt.target --- ///
  const target = document.getElementsByTagName(opt.target)[0];

  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", opt.script);

  const { session, settings, transfer_size, peak_time_limit } = await storage.get(["session", "settings", "transfer_size", "peak_time_limit"]);
  if (session !== undefined) {
    script.dataset.session = new URLSearchParams({ ...session }).toString();
  }
  script.dataset.settings      = JSON.stringify(settings      || {});
  script.dataset.transfer_size = JSON.stringify(transfer_size || {});
  script.dataset.peak_time_limit = JSON.stringify(peak_time_limit || {});

  return target.appendChild(script);
};

/** @class background と通信するための汎用的なクラス */
class BackgroundCommunicationPort {
  constructor() {
    this.port = null;
    this.portName = "sodium-extension-communication-port";
  }

  postMessage(method, args) {
    if (this.port == null) {
      this.port = chrome.runtime.connect({
        name: this.portName
      });
    }

    const requestId = getRandomToken();
    return new Promise((resolve, reject) => {
      const listener = value => {
        if (value.requestId !== requestId) return false;

        try {
          resolve(value);
        } catch (e) {
          reject(e);
        } finally {
          this.port.onMessage.removeListener(listener);
        }
        return true;
      };
      this.port.onMessage.addListener(listener);
      this.port.postMessage({
        requestId,
        method: method,
        args: args
      });
    });
  }

  setAlive(alive) {
    if (isVMBrowser) {
      sodium.currentTab.alive = alive;
    } else {
      this.postMessage("setAlive", [alive]);
    }
  }

  setDisplayOnPlayer(displayOnPlayer) {
    if (isVMBrowser) {
      sodium.currentTab.displayOnPlayer = displayOnPlayer;
    } else {
      this.postMessage("setDisplayOnPlayer", [displayOnPlayer]);
    }
  }

  async getDisplayOnPlayer() {
    if (isVMBrowser) {
      return sodium.currentTab.displayOnPlayer;
    } else {
      return (await this.postMessage("getDisplayOnPlayer")).displayOnPlayer;
    }
  }

  async getPlatformInfo() {
    if (isVMBrowser) {
      return { os: "android" };
    } else {
      return (await this.postMessage("getPlatformInfo")).platformInfo;
    }
  }

  async getIp(host) {
    if (isVMBrowser) {
      return sodium.locationIp;
    } else {
      return (await this.postMessage("getIp", [host])).ip;
    }
  }
}
const communicationPort = new BackgroundCommunicationPort();

function getRandomToken() {
  const randomPool = new Uint8Array(16);
  crypto.getRandomValues(randomPool);
  let hex = "";
  for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  return hex;
}

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
      const { session } = event.data;
      await storage.set({ session });
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
    case "save_transfer_size": {
      const { transfer_diff } = event.data;
      await save_transfer_size(transfer_diff);
      break;
    }
    case "save_quota_limit_started": {
      const { limit_started } = event.data;
      await save_quota_limit_started(limit_started);
      break;
    }
    case "save_peak_time_limit": {
      const { peak_time_limit } = event.data;
      await save_peak_time_limit(peak_time_limit);
      break;
    }
    case "save_settings": {
      const { new_settings } = event.data;
      await save_settings(new_settings);
      break;
    }
    case "set_alive": {
      communicationPort.setAlive(event.data.alive);
      break;
    }
    case "set_display_on_player": {
      communicationPort.setDisplayOnPlayer(event.data.enabled);
      break;
    }
    case "get_display_on_player": {
      const displayOnPlayer = await communicationPort.getDisplayOnPlayer();
      event.source.postMessage({
        method: "get_display_on_player",
        type: "CONTENT_SCRIPT_JS",
        displayOnPlayer
      });
      break;
    }
    case "get_platform_info": {
      const platformInfo = await communicationPort.getPlatformInfo();
      event.source.postMessage({
        method: "get_platform_info",
        type: "CONTENT_SCRIPT_JS",
        platformInfo
      });
      break;
    }
    case "get_ip": {
      const ip = await communicationPort.getIp(event.data.host);
      event.source.postMessage({
        type: "CONTENT_SCRIPT_JS",
        host: event.data.host,
        ip
      });
      break;
    }
  }
};

if (isVMBrowser) {
  window.addEventListener("message", message_listener);
} else {
  storage.get("AgreedTerm").then(value => {
    if (!("AgreedTerm" in value)) return;
    if (!value["AgreedTerm"]) return;

    window.addEventListener("message", message_listener);

    inject_script({
      script: chrome.runtime.getURL("sodium.js"),
      target: "body"
    });
  });
}

chrome.runtime.onMessage.addListener((request /*, sender, sendResponse*/) => {
  window.postMessage(request, "*");
});
