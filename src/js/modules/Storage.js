import Config from "./Config";

export class Storage {
  constructor({ sessionId, videoId }) {
    this.sessionId = sessionId;
    this.videoId = videoId;
    this.cache = {
      session_id: this.sessionId,
      video_id: this.videoId
    };
    this.initialized = false;
  }

  get viewingId() {
    return `${this.sessionId}_${this.videoId}`;
  }

  async init() {
    if (Config.is_mobile()) {
      const { index } = await new Promise(resolve =>
        window.sodium.storage.local.get("index", resolve)
      );
      if (!Array.isArray(index)) return;
      await new Promise(resolve =>
        window.sodium.storage.local.set(
          { index: [...index, this.viewingId] },
          resolve
        )
      );
    } else {
      window.postMessage(
        {
          type: "FROM_SODIUM_JS",
          method: "init",
          id: this.viewingId
        },
        "*"
      );
    }
  }

  async save(attributes) {
    if (!this.initialized) {
      await this.init();
      this.initialized = true;
    }
    Object.assign(this.cache, attributes);
    if (Config.is_mobile()) {
      window.sodium.storage.local.set({ [this.viewingId]: this.cache });
    } else {
      window.postMessage(
        {
          type: "FROM_SODIUM_JS",
          method: "set_video",
          id: this.viewingId,
          video: this.cache
        },
        "*"
      );
    }
    return this.cache;
  }
}

const state = {};
export const useStorage = ({ sessionId, videoId }) => {
  const id = `${sessionId}_${videoId}`;
  if (!(state[id] instanceof Storage)) {
    state[id] = new Storage({ sessionId, videoId });
  }
  return state[id];
};
