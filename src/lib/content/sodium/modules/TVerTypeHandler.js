export default class TVerTypeHandler {
  /**
   * video.js 動画プレイヤーへの参照。
   * @type {object}
   */
  static get #videoPlayer() {
    if (!videojs?.getPlayers) {
      return undefined;
    }

    const players = videojs.getPlayers();
    const [key] = Object.keys(players);

    if (!key) {
      return undefined;
    }

    return players[key];
  }

  /**
   * 再生中の動画スラッグ。内部的な UUID ではなく URL `https://tver.jp/episodes/XXXXX` から取得。
   * @type {string}
   */
  static get #videoSlug() {
    return window.location.pathname.split('/').pop();
  }

  static get_duration() {
    const duration = this.#videoPlayer.duration();

    return duration && Number.isFinite(duration) ? duration : -1;
  }

  static get_video_width() {
    const play_list = TVerTypeHandler.get_playlists();

    const {
      attributes: {
        RESOLUTION: { width },
      },
    } = play_list;

    return width;
  }

  static get_video_height() {
    const play_list = TVerTypeHandler.get_playlists();

    const {
      attributes: {
        RESOLUTION: { height },
      },
    } = play_list;

    return height;
  }

  static get_bitrate() {
    const play_list = TVerTypeHandler.get_playlists();

    return play_list.attributes.BANDWIDTH;
  }

  static get_receive_buffer() {
    return this.#videoPlayer.bufferedEnd();
  }

  static get_framerate() {
    return -1;
  }

  static get_segment_domain() {
    const play_list = TVerTypeHandler.get_playlists();
    const { segments } = play_list;

    if (!segments) {
      return null;
    }

    const last = segments[segments.length - 1];

    return new URL(last.resolvedUri).hostname;
  }

  static get_current_time(video) {
    if (!TVerTypeHandler.is_main_video(video)) {
      return -1;
    }

    return this.#videoPlayer.currentTime();
  }

  static get_video_title() {
    return this.#videoPlayer.mediainfo.name;
  }

  static get_video_thumbnail() {
    return `https://statics.tver.jp/images/content/thumbnail/episode/small/${this.#videoSlug}.jpg`;
  }

  static is_main_video(video) {
    return !this.#videoPlayer.ima3.el.contains(video);
  }

  static is_cm() {
    const adVideoNodeList = this.#videoPlayer.ima3.el.getElementsByTagName('video');

    return Array.from(adVideoNodeList).some((e) => e.parentNode.style.display === 'block');
  }

  static get_playlists() {
    if (this.#videoPlayer.tech_.hls) {
      return this.#videoPlayer.tech_.hls.selectPlaylist();
    }

    if (this.#videoPlayer.tech_.vhs) {
      return this.#videoPlayer.tech_.vhs.playlists.media_;
    }

    return null;
  }

  static is_tver_type() {
    try {
      if (
        !!this.#videoPlayer &&
        !!this.#videoPlayer.ima3?.el &&
        !!this.#videoPlayer.tech_?.hls?.selectPlaylist &&
        !!this.#videoPlayer.bufferedEnd &&
        !!this.#videoPlayer.duration &&
        !!this.#videoPlayer.currentTime
      ) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }
}
