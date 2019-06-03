import Config from "./Config";

export class Storage {
  constructor({ sessionId, videoId }) {
    this.sessionId = sessionId;
    this.videoId = videoId;
    this.cache = {};
  }

  get viewingId() {
    return `${this.sessionId}_${this.videoId}`;
  }

  async load() {
    if (Config.is_mobile()) {
      return new Promise(resolve =>
        sodium.storage.local.get(this.viewingId, viewing =>
          resolve(viewing[this.viewingId])
        )
      );
    }
    return this.cache;
  }

  async save(attributes) {
    const tmp = (await this.load()) || {};
    Object.assign(tmp, {
      ...attributes,
      session_id: this.sessionId,
      video_id: this.videoId
    });
    if (Config.is_mobile()) {
      sodium.storage.local.set({ [this.viewingId]: tmp });
    } else {
      await new Promise(resolve => {
        window.addEventListener("message", resolve, { once: true });
        window.postMessage(
          {
            type: "FROM_SODIUM_JS",
            method: "set_video",
            id: this.viewingId,
            video: tmp
          },
          "*"
        );
      });
    }
    this.cache = tmp;
    return tmp;
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
