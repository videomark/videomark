import ChromeExtensionWrapper from "./ChromeExtensionWrapper";
import Api from "./Api";

class Viewing {
  constructor({ id, ...initialState }) {
    if (id === undefined) throw new Error("invalid id");
    this.id = id;
    this.cache = initialState;
  }

  get sessionId() {
    return this.cache.session_id;
  }

  get videoId() {
    return this.cache.video_id;
  }

  get viewingId() {
    return `${this.sessionId}_${this.videoId}`;
  }

  async load() {
    return new Promise((resolve) =>
      ChromeExtensionWrapper.load(this.id, (viewing) => resolve(viewing))
    );
  }

  async init() {
    if (this.sessionId === undefined && this.videoId === undefined)
      this.cache = await this.load();

    return this;
  }

  get valid() {
    return this.cache != null;
  }

  get qoeCalculatable() {
    return (
      this.valid &&
      (!("calc" in this.cache) /* NOTE: 互換性のため */ || this.cache.calc)
    );
  }

  async save(attributes) {
    const tmp = await this.load();
    Object.assign(tmp, attributes);
    ChromeExtensionWrapper.save(this.id, tmp);
    Object.assign(this.cache, attributes);
    return attributes;
  }

  get title() {
    return this.cache.title;
  }

  get thumbnail() {
    return this.cache.thumbnail;
  }

  get location() {
    return this.cache.location;
  }

  get transferSize() {
    return this.cache.transfer_size;
  }

  get startTime() {
    return new Date(this.cache.start_time);
  }

  get endTime() {
    if (this.cache.start_time < this.cache.end_time)
      return new Date(this.cache.end_time);
    const log = this.cache.log || [];
    // NOTE: 時刻が得られない場合、視聴時間ゼロとみなす
    const { date } = log.slice(-1)[0] || { date: this.cache.start_time };
    return new Date(date);
  }

  async fetchFixedQoeApi() {
    if (!window.navigator.onLine) return undefined;

    const resHandler = (response) => {
      if (!response.ok) {
        return undefined;
      }

      const find = (res) =>
        res.find((v) => v.viewing_id.startsWith(this.viewingId));
      return response.json().then(find);
    };

    return Api.fixed([{ session_id: this.sessionId, video_id: this.videoId }])
      .then(resHandler)
      .then((viewing) => {
        if (viewing === undefined) return undefined;
        return this.save({ qoe: viewing.qoe });
      });
  }

  /** @returns {Promise<number | void>} */
  get qoe() {
    if (!this.qoeCalculatable) return Promise.resolve();
    if (this.cache.qoe > 0) return Promise.resolve(this.cache.qoe);

    return this.fetchFixedQoeApi().then(() => this.cache.qoe);
  }

  async fetchStatsInfoApi() {
    if (!window.navigator.onLine) {
      return undefined;
    }

    const resHandler = (response) => {
      if (!response.ok) {
        return undefined;
      }
      const find = (res) =>
        res.find(
          (i) => i.session === this.sessionId && i.video === this.videoId
        );
      return response.json().then(find);
    };

    return Api.statsInfo(this.videoId, this.sessionId)
      .then(resHandler)
      .then((info) => {
        if (info === undefined) return undefined;
        const { country, subdivision, isp } = info;
        return this.save({
          region: {
            country,
            subdivision,
            isp,
          },
        });
      });
  }

  /** @returns {Promise<{ country: string, subdivision?: string } | void>} */
  get region() {
    if (this.cache.region != null) {
      return Promise.resolve(this.cache.region);
    }
    return this.fetchStatsInfoApi().then(() =>
      "region" in this.cache && "country" in this.cache.region
        ? this.cache.region
        : undefined
    );
  }

  get quality() {
    const log = this.cache.log || [];
    const { date, quality } =
      log.filter((a) => "quality" in a).slice(-1)[0] || {};
    return { date: new Date(date), ...quality };
  }
}

export default Viewing;
