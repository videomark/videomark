export class Storage {
  constructor({ sessionId, videoId }) {
    this.sessionId = sessionId;
    this.videoId = videoId;
    this.cache = {
      session_id: this.sessionId,
      video_id: this.videoId,
    };
    this.initialized = false;
    this.id = null;
  }

  get viewingId() {
    return `${this.sessionId}_${this.videoId}`;
  }

  async init() {
    this.id = this.viewingId;
  }

  async save(attributes) {
    if (!this.initialized) {
      await this.init();
      this.initialized = true;
    }
    Object.assign(this.cache, attributes);
    window.postMessage(
      {
        type: "FROM_SODIUM_JS",
        method: "set_video",
        id: this.id,
        video: this.cache,
      },
      "*"
    );
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
