import ChromeExtensionWrapper from "./ChromeExtensionWrapper";
import Api from "./Api";
import { viewingIdWithoutDateTimeFromSessionAndVideo } from "./Utils";

class Viewing {
  constructor({ sessionId, videoId }) {
    this.sessionId = sessionId;
    this.videoId = videoId;
  }

  get viewingId() {
    return viewingIdWithoutDateTimeFromSessionAndVideo(
      this.sessionId,
      this.videoId
    );
  }

  async load() {
    return new Promise(resolve =>
      ChromeExtensionWrapper.load(this.viewingId, viewing => resolve(viewing))
    );
  }

  async init() {
    this.cache = await this.load();
    return this.viewingId;
  }

  async save(attributes) {
    const tmp = await this.load();
    Object.assign(tmp, attributes);
    ChromeExtensionWrapper.save(this.viewingId, tmp);
    Object.assign(this.cache, attributes);
    return attributes;
  }

  get title() {
    return Promise.resolve(this.cache.title);
  }

  get thumbnail() {
    return Promise.resolve(this.cache.thumbnail);
  }

  get location() {
    return Promise.resolve(this.cache.location);
  }

  get startTime() {
    return Promise.resolve(new Date(this.cache.start_time));
  }

  async fetchFixedQoeApi() {
    if (!window.navigator.onLine) return undefined;

    const resHandler = response => {
      if (!response.ok) {
        return undefined;
      }

      const find = res =>
        res.find(v => v.viewing_id.startsWith(this.viewingId));
      return response.json().then(find);
    };

    return Api.fixed([{ session_id: this.sessionId, video_id: this.videoId }])
      .then(resHandler)
      .then(viewing => {
        if (viewing === undefined) return undefined;
        return this.save({ qoe: viewing.qoe });
      });
  }

  get qoe() {
    if (this.cache.qoe > 0) {
      return Promise.resolve(this.cache.qoe);
    }

    return this.fetchFixedQoeApi().then(() => this.cache.qoe);
  }

  async fetchStatsInfoApi() {
    if (!window.navigator.onLine) {
      return undefined;
    }

    const resHandler = response => {
      if (!response.ok) {
        return undefined;
      }
      const find = res =>
        res.find(i => i.session === this.sessionId && i.video === this.videoId);
      return response.json().then(find);
    };

    return Api.statsInfo(this.videoId, this.sessionId)
      .then(resHandler)
      .then(info => {
        if (info === undefined) return undefined;
        return this.save({
          country: info.country,
          subdivision: info.subdivision,
          isp: info.isp
        });
      });
  }

  get country() {
    if (this.cache.country !== undefined) {
      return Promise.resolve(this.cache.country);
    }
    return this.fetchStatsInfoApi().then(() => this.cache.country);
  }

  get subdivision() {
    if (this.cache.subdivision !== undefined) {
      return Promise.resolve(this.cache.subdivision);
    }
    return this.fetchStatsInfoApi().then(() => this.cache.subdivision);
  }

  get isp() {
    if (this.cache.isp !== undefined) {
      return Promise.resolve(this.cache.isp);
    }
    return this.fetchStatsInfoApi().then(() => this.cache.isp);
  }
}

export default Viewing;
