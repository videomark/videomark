/* global netflix */
import GeneralTypeHandler from './GeneralTypeHandler';

class NetflixTypeHandler extends GeneralTypeHandler {
  /** @param {HTMLVideoElement} elm */
  constructor(elm) {
    super(elm);

    if (!this.is_main_video(elm)) {
      throw new Error('video is not main');
    }
  }

  /**
   * 再生中の動画 ID。
   * @type {number}
   */
  get #videoId() {
    return this.get_id_by_video_holder();
  }

  /**
   * Netflix 内部の動画メタデータ。
   * @type {object}
   */
  get #videoMetadata() {
    return netflix.appContext.state.playerApp.getAPI().getActiveVideoMetadata(this.#videoId);
  }

  /**
   * Netflix の UI ロケール。例: `ja`。
   * @type {string}
   */
  get #locale() {
    return netflix.appContext.state.discoveryApp.getAPI().geo.getLocaleLanguage();
  }

  get_duration() {
    const [, { Duration: duration }] = netflix.player.getMostRecentPlaybackDiagnosticGroups();

    return Math.trunc(duration);
  }

  get_video_width() {
    return this.elm.videoWidth;
  }

  get_video_height() {
    return this.elm.videoHeight;
  }

  get_bitrate() {
    const [, , , { 'Playing bitrate (a/v)': bitrate }] =
      netflix.player.getMostRecentPlaybackDiagnosticGroups();

    const [, audio, video] = bitrate.match(/(\d+) \/ (\d+) \((\d+)x(\d+)/);

    // API で取得した値は kbps になっているため 1000 をかけている
    return (Number.parseInt(audio, 10) + Number.parseInt(video, 10)) * 1000;
  }

  get_video_bitrate() {
    const [, , , { 'Playing bitrate (a/v)': bitrate }] =
      netflix.player.getMostRecentPlaybackDiagnosticGroups();

    const [, , video] = bitrate.match(/(\d+) \/ (\d+) \((\d+)x(\d+)/);

    // API で取得した値は kbps になっているため 1000 をかけている
    return Number.parseInt(video, 10) * 1000;
  }

  get_receive_buffer() {
    const [, , , { 'Buffer size in Seconds (a/v)': bufferSeconds }] =
      netflix.player.getMostRecentPlaybackDiagnosticGroups();

    const [, , video] = bufferSeconds.match(/(\d+(?:\.\d+)?) \/ (\d+(?:\.\d+)?)/);

    return Number.parseFloat(video);
  }

  get_framerate() {
    const [, , , , , { Framerate: framerate }] =
      netflix.player.getMostRecentPlaybackDiagnosticGroups();

    return Number.parseFloat(framerate);
  }

  get_segment_domain() {
    const [, , , { 'Current CDN (a/v)': cdn }] =
      netflix.player.getMostRecentPlaybackDiagnosticGroups();

    const ret = cdn.match(
      /(?:(?<audioDomain>\S+), Id: (?<audioId>\d+) |\? )\/ (?:(?<videoDomain>\S+), Id: (?<videoId>\d+)|\?)/,
    );

    if (!ret) {
      return null;
    }

    return ret.groups.videoDomain || null;
  }

  /**
   * 現在の再生位置
   */
  get_current_time() {
    const [, { Position: position }] = netflix.player.getMostRecentPlaybackDiagnosticGroups();

    return Number.parseFloat(position);
  }

  /**
   * 動画のタイトルを取得。シーズン、エピソードなども必要に応じて付加する。
   * @returns {string} タイトル。
   */
  get_video_title() {
    const metadata = this.#videoMetadata;
    /** @type {string} */
    const showTitle = metadata.getTitle();

    /**
     * @type {{
     * SEASON_ABR: string,
     * EPISODE: number,
     * TITLE: string,
     * showEpisodeNumbers: boolean
     * }}
     */
    const {
      SEASON_ABR: seasonLabel, // ローカライズ済み、例「シーズン1」または空文字列
      EPISODE: episodeNumber,
      TITLE: episodeTitle,
      showEpisodeNumbers,
    } = metadata.getEpisodeTitleWithSeasonLabelData();

    if (!episodeTitle) {
      // タイトルのみ (映画)
      return showTitle;
    }

    if (!showEpisodeNumbers) {
      return `${showTitle}: ${episodeTitle}`;
    }

    if (seasonLabel) {
      // シーズン付き、例「ハイキュー!! シーズン4-1: 自己紹介」
      return `${showTitle} ${seasonLabel}-${episodeNumber}: ${episodeTitle}`;
    }

    const episodePrefix = this.#locale === 'ja' ? 'エピソード' : 'Episode';

    // シーズンなし、例「忍びの家 House of Ninjas エピソード 1: The Offer - 指令 -」
    return `${showTitle} ${episodePrefix} ${episodeNumber}: ${episodeTitle}`;
  }

  /**
   * 動画のサムネイル URL を取得。
   * @returns {string} URL。
   */
  get_video_thumbnail() {
    const metadata = this.#videoMetadata;

    return (
      metadata._video.stills?.[0]?.url ??
      metadata._video.artwork?.[0]?.url ??
      'https://assets.nflxext.com/en_us/pages/wiplayer/logo_v3.svg'
    );
  }

  get_id_by_video_holder() {
    const [, { MovieId }] = netflix.player.getMostRecentPlaybackDiagnosticGroups();

    return MovieId;
  }

  get_view_count() {
    return -1;
  }

  get_throughput_info() {
    const [, , , , , , { Throughput }] = netflix.player.getMostRecentPlaybackDiagnosticGroups();
    const [, kbps] = Throughput.match(/([+-]?\d+) kbps/);

    return [Number.parseInt(kbps, 10) * 1000];
  }

  get_codec_info() {
    const [, , , , { 'Video Track': videoTrack }] =
      netflix.player.getMostRecentPlaybackDiagnosticGroups();

    // const [, codec, codecs] = videoTrack.match(/Codec: (\S+);codecs\=(.+?\))/);
    return videoTrack;
  }

  get_service() {
    return this.service;
  }

  /**
   * トラッキング ID などを外した正規 URL を取得。
   * @returns {string} URL。
   */
  get_alt_location() {
    return `https://www.netflix.com/watch/${this.#videoId}`;
  }

  is_main_video() {
    return window.location.pathname.match(/\/watch\//);
  }

  is_cm() {
    return false;
  }

  is_calculable() {
    return this.calQoeFlg;
  }
}

export default NetflixTypeHandler;
