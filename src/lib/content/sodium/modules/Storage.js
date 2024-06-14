export class Storage {
  constructor({ sessionId, videoId }) {
    this.sessionId = sessionId;
    // `videoId` は再生するたびに固有の ID なので、分かりやすいように `playbackId` に変更した
    // @todo プロパティ名をすべて `playbackId` に統一
    this.playbackId = videoId;
    this.recordCache = {};
    this.statCache = {};
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

    const { sessionId, playbackId } = this;
    const record = {};
    const stat = {};

    Object.entries(attributes).forEach(([key, value]) => {
      if (['logs', 'transferSize'].includes(key)) {
        stat[key] = value;
      } else if (this.recordCache[key] !== value) {
        // キャッシュと比較し変更があった場合のみ保存
        record[key] = value;
      }
    });

    if (Object.keys(record).length) {
      Object.assign(this.recordCache, record);
      this.#postMessage({ sessionId, playbackId, ...this.recordCache });
    }

    if (Object.keys(stat).length) {
      Object.assign(this.statCache, stat);
      this.#postMessage({ ...this.statCache });
    }

    return { sessionId, playbackId, ...this.recordCache, ...this.statCache };
  }

  #postMessage(data) {
    window.postMessage(
      {
        type: 'FROM_SODIUM_JS',
        method: 'update_history',
        id: this.id,
        data,
      },
      '*',
    );
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
