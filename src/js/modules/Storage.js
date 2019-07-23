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
    this.id = null;
  }

  get viewingId() {
    return `${this.sessionId}_${this.videoId}`;
  }

  async init() {
    if (!Config.is_mobile()) {
      this.id = this.viewingId;
      return;
    }

    const { index } = await new Promise(resolve =>
      window.sodium.storage.local.get("index", resolve)
    );

    if (!Array.isArray(index)) {
      this.id = this.viewingId;
      return;
    }

    this.id = index.length === 0 ? 0 : index.slice(-1)[0] + 1;
    await new Promise(resolve =>
      window.sodium.storage.local.set({ index: [...index, this.id] }, resolve)
    );
  }

  async save(attributes) {
    if (!this.initialized) {
      await this.init();
      this.initialized = true;
    }
    Object.assign(this.cache, attributes);
    if (Config.is_mobile()) {
      window.sodium.storage.local.set({
        [this.id]: this.cache
      });
    } else {
      window.postMessage(
        {
          type: "FROM_SODIUM_JS",
          method: "set_video",
          id: this.id,
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
