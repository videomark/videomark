import StatsExpander from '$lib/components/stats/stats-expander.svelte';

export default class StatsVisualizer {
  /** @type {HTMLElement} */
  #rootElement = null;

  /** @type {HTMLElement} */
  #statsElement = null;

  /**
   * @param {Record<string, any>} args
   */
  constructor(args = {}) {
    // eslint-disable-next-line new-cap
    this.#statsElement = Object.assign(new StatsExpander.element(), args);
  }

  /**
   * @param {boolean} open
   */
  set open(open) {
    this.#statsElement.open = open;
  }

  /**
   * @param {HTMLElement} root
   */
  attach(root) {
    this.#rootElement = root;
    this.#rootElement.appendChild(this.#statsElement);
  }

  detach() {
    if (!this.#rootElement || !this.#statsElement) {
      return;
    }

    this.#rootElement.removeChild(this.#statsElement);
    this.#rootElement = null;
  }

  /**
   * @param {VideoPlaybackInfo} [detail]
   */
  update({ latestStats = {}, statsLog = {} } = {}) {
    if (!this.#rootElement) {
      return;
    }

    this.#statsElement.stats = latestStats;
    this.#statsElement.log = statsLog;
  }
}
