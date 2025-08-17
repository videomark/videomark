const LOG_SIZE = 120;

const LOG_KEYS = [
  'bitrate',
  'throughput',
  'transferSize',
  'resolution',
  'frameRate',
  'frameDrops',
  'waitingTime',
  'qoe',
];

/**
 * オーバーレイに表示するライブ統計チャートデータの管理。
 */
export default class LiveStatsLog {
  #log = {};

  constructor() {
    this.#clear();
  }

  /**
   * ログデータを初期化する。
   */
  #clear() {
    LOG_KEYS.forEach((key) => {
      this.#log[key] = Array.from({ length: LOG_SIZE }, () => NaN);
    });
  }

  /**
   * ログデータを更新する。
   * @param {Object} params - 引数。
   * @param {string} params.videoId - 動画 ID。
   * @param {Record<string, any>} params.latestStats - 最新の統計情報。
   * @returns {Record<string, any>} 更新されたログデータ。
   */
  update({ videoId, latestStats }) {
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
    } = latestStats;

    if (!date) {
      return this.#log;
    }

    this.#log.latestThroughput = throughput ?? this.#log.latestThroughput ?? NaN;

    if (this.#log.videoId !== videoId) {
      this.#log.videoId = videoId;
      this.#clear();
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

    return this.#log;
  }
}
