import StatsExpander from '$lib/components/stats/stats-expander.svelte';

const LOG_SIZE = 120;
const initLogArray = () => Array.from({ length: LOG_SIZE }, () => NaN);

export default class Status {
  #state = {};

  #rootElement = null;

  #statsElement = null;

  #stats = {};

  #log = {};

  constructor(locale) {
    // eslint-disable-next-line new-cap
    this.#statsElement = new StatsExpander.element();
    this.#statsElement.locale = locale;

    this.detach();
    this.#clearLog();
  }

  attach(root) {
    this.#rootElement = root;
    this.#rootElement.appendChild(this.#statsElement);
  }

  detach() {
    this.#rootElement = null;
    this.#state = {};
  }

  update(state = {}, stats = {}) {
    if (!this.#rootElement) {
      return;
    }

    Object.assign(this.#state, state);
    this.#stats = stats;
    this.#updateLog();

    this.#statsElement.stats = this.#stats;
    this.#statsElement.log = this.#log;
  }

  #updateLog() {
    const { videoId } = this.#state;

    const {
      date,
      bitrate,
      throughput,
      transferSize,
      resolution: { height: videoHeight } = {},
      framerate,
      droppedVideoFrames,
      timing: { waiting } = {},
      qoe,
    } = this.#stats;

    if (!date) {
      return;
    }

    this.#log.latestThroughput = throughput || this.#log.latestThroughput || NaN;

    if (this.#log.videoId !== videoId) {
      this.#log.videoId = videoId;
      this.#clearLog();
    }

    if (this.#log.date !== date) {
      this.#log.date = date;
      this.#log.bitrate.push(bitrate >= 0 ? bitrate : NaN);
      this.#log.bitrate.shift();
      this.#log.throughput.push(this.#log.latestThroughput);
      this.#log.throughput.shift();
      this.#log.transferSize.push(transferSize);
      this.#log.transferSize.shift();
      this.#log.resolution.push(videoHeight);
      this.#log.resolution.shift();
      this.#log.frameRate.push(framerate >= 0 ? framerate : NaN);
      this.#log.frameRate.shift();
      this.#log.frameDrops.push(droppedVideoFrames);
      this.#log.frameDrops.shift();
      this.#log.waitingTime.push(waiting);
      this.#log.waitingTime.shift();
      this.#log.qoe.push(Number.isFinite(qoe) ? qoe : NaN);
      this.#log.qoe.shift();
    }
  }

  #clearLog() {
    this.#log.bitrate = initLogArray();
    this.#log.throughput = initLogArray();
    this.#log.transferSize = initLogArray();
    this.#log.resolution = initLogArray();
    this.#log.frameRate = initLogArray();
    this.#log.frameDrops = initLogArray();
    this.#log.waitingTime = initLogArray();
    this.#log.qoe = initLogArray();
  }
}
