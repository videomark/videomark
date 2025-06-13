// @ts-check
export default class GeneralTypeHandler {
  /** @param {HTMLVideoElement} elm */
  constructor(elm) {
    this.elm = elm;
    /** @type {?import("./AdObserver").AdObserver} */
    this.adObserver = null;
  }

  get_duration() {
    const { duration } = this.elm;

    return duration && Number.isFinite(duration) ? duration : -1;
  }

  get_video_width() {
    return this.elm.videoWidth;
  }

  get_video_height() {
    return this.elm.videoHeight;
  }

  get_bitrate() {
    return -1;
  }

  get_video_bitrate() {
    return -1;
  }

  get_receive_buffer() {
    let ret = -1;

    try {
      const { buffered } = this.elm;

      ret = buffered.end(buffered.length - 1);
    } catch (e) {
      // do nothing
    }

    return ret;
  }

  get_framerate() {
    return -1;
  }

  get_segment_domain() {
    return document.domain;
  }

  get_current_time() {
    return this.elm.currentTime;
  }

  get_video_title() {
    return '';
  }

  get_video_thumbnail() {
    return '';
  }

  get_id_by_video_holder() {
    return '';
  }

  get_view_count() {
    return -1;
  }

  get_play_list_info() {
    return [];
  }

  /**
   * 動画再生ページの正規 URL を取得。HTML 内に Canonical URL が存在せず、トラッキング ID などを外して正規化する
   * 必要がある場合、サブクラス内で上書きすること。
   * @param {string} url HTML から取得された Canonical URL か現在のタブの URL。
   * @returns {string} 正規化された URL。
   * @abstract
   */
  get_canonical_url(url) {
    // eslint-disable-next-line no-void
    void url;

    return '';
  }

  /**
   * @return {number[] | Array<{
   *  representationId: string,
   *  downloadSize: number,
   *  downloadTime: number,
   *  throughput: number,
   *  start: number,
   *  end: number,
   *  startUnplayedBufferSize: number,
   *  endUnplayedBufferSize: number,
   *  bitrate: number,
   *  timings: {
   *    domainLookupStart: number,
   *    connectStart: number,
   *    requestStart: number,
   *    responseStart: number,
   *  },
   * }>}
   */
  get_throughput_info() {
    return [];
  }

  get_codec_info() {
    return {};
  }

  get_representation() {
    return {};
  }

  is_main_video(video) {
    return video === this.elm;
  }

  is_cm() {
    return false;
  }

  set_quality() {}

  add_cm_listener(listener) {
    if (this.adObserver === null) {
      return;
    }

    /** @param {import("./AdObserver").AdEvent} event */
    function handler(event) {
      const { showing: cm, playPos: pos, dateTime: time } = event;

      listener.call(null, { cm, pos, time });
    }

    this.adObserver.on(handler);
  }

  clear() {
    if (this.adObserver === null) {
      return;
    }

    this.adObserver.removeAllListeners();
  }
}
