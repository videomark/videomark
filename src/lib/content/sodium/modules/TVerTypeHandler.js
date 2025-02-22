import GeneralTypeHandler from './GeneralTypeHandler';

export default class TVerLiveTypeHandler extends GeneralTypeHandler {
  /**
   * @type {object}
   */
  get #player() {
    return window.streaksplayer.getPlayers().vjs_video_3;
  }

  /**
   * @type {object | undefined}
   */
  get #qualityLevel() {
    return this.#player.qualityLevels().levels_.find(({ enabled }) => enabled);
  }

  /**
   * @type {boolean}
   */
  get #isLive() {
    return window.location.pathname.startsWith('/live/');
  }

  /**
   * @returns {number}
   */
  get_duration() {
    const duration = this.#player.duration();

    if (duration && Number.isFinite(duration)) {
      return duration;
    }

    return -1;
  }

  /**
   * @returns {number}
   */
  get_video_width() {
    return this.#qualityLevel?.width ?? this.elm.videoWidth;
  }

  /**
   * @returns {number}
   */
  get_video_height() {
    return this.#qualityLevel?.height ?? this.elm.videoHeight;
  }

  /**
   * @returns {number}
   */
  get_bitrate() {
    return this.#qualityLevel?.bitrate ?? -1;
  }

  /**
   * @returns {number}
   */
  get_framerate() {
    return this.#qualityLevel?.representation.frameRate ?? -1;
  }

  /**
   * @returns {string}
   */
  get_segment_domain() {
    const url = this.#qualityLevel?.representation.playlist.resolvedUri;

    if (url) {
      return new URL(url).hostname;
    }

    return document.domain;
  }

  /**
   * @returns {string}
   */
  get_video_title() {
    const containerText = document.querySelector('[class^="titles_container__"]')?.innerText;

    if (containerText) {
      const [series, title] = containerText.split('\n');

      if (series === title) {
        return title;
      }

      return [series, title].join(' – ');
    }

    return document.title;
  }

  /**
   * @returns {string}
   */
  get_video_thumbnail() {
    const id = this.get_id_by_video_holder();
    const type = this.#isLive ? 'live' : 'episode';

    if (id) {
      return `https://statics.tver.jp/images/content/thumbnail/${type}/small/${id}.jpg`;
    }

    return document.querySelector('meta[property="og:image"]')?.content ?? '';
  }

  /**
   * @returns {string | undefined}
   */
  get_id_by_video_holder() {
    const id = window.location.pathname.match(/^\/(?:episodes|live\/(?:special|simul))\/(.+)/)?.[1];

    if (id) {
      return id;
    }

    // リアルタイム配信のうち各局のトップページでは URL から ID を取得できないので、コンテンツ内から取得
    const episodeURL = document.querySelector('a[class^="episode-row_container"]')?.href;

    if (episodeURL) {
      return episodeURL.split('/').pop();
    }

    return undefined;
  }

  /**
   * @returns {object}
   */
  get_codec_info() {
    const { codecs } = this.#qualityLevel?.representation ?? {};

    if (!codecs) {
      return {};
    }

    return {
      audio: { container: null, codec: codecs.audio },
      video: { container: null, codec: codecs.video },
    };
  }

  /**
   * @returns {object}
   */
  get_representation() {
    const {
      bitrate,
      representation: { bandwidth, codecs, frameRate, width, height },
    } = this.#qualityLevel;

    return {
      bandwidth,
      codec: codecs.video,
      framerate: frameRate,
      height,
      width,
      bitrate,
    };
  }

  /**
   * @param {HTMLVideoElement} video
   * @returns {boolean}
   */
  is_main_video(video) {
    return video.matches('#vjs_video_3:not(.vjs-paused) video');
  }

  /**
   * @returns {boolean}
   */
  is_cm() {
    return !!document.querySelector('#vjs_video_3.vjs-ad-playing');
  }
}
