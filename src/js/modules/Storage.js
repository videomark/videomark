import Config from "./Config";

export default class Storage {
  constructor({ sessionId, videoId }) {
    this.sessionId = sessionId;
    this.videoId = videoId;
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

  async init() {
    this.cache = await this.load();
    if (!Config.is_mobile()) {
      window.addEventListener("message", e => {
        if (
          e.source === window &&
          e.data.type === "FROM_SODIUM_JS" &&
          e.data.id === this.viewingId
        )
          this.cache = e.data.video;
      });
    }
    this.cache = {
      session_id: this.sessionId,
      video_id: this.videoId,
      ...this.cache
    };
    return this;
  }

  async save(attributes) {
    const tmp = await this.load();
    Object.assign(tmp, attributes);
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
    Object.assign(this.cache, attributes);
    return attributes;
  }
}
