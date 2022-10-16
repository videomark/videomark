/*global netflix*/
import GeneralTypeHandler from './GeneralTypeHandler';

class NetflixTypeHandler extends GeneralTypeHandler {
  /** @param {HTMLVideoElement} elm */
  constructor(elm) {
    super(elm);
    this.elm = elm;
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
    return (Number.parseInt(audio) + Number.parseInt(video)) * 1000;
  }

  get_video_bitrate() {
    const [, , , { 'Playing bitrate (a/v)': bitrate }] =
      netflix.player.getMostRecentPlaybackDiagnosticGroups();
    const [, , video] = bitrate.match(/(\d+) \/ (\d+) \((\d+)x(\d+)/);
    // API で取得した値は kbps になっているため 1000 をかけている
    return Number.parseInt(video) * 1000;
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
    if (!ret) return null;
    return ret.groups.videoDomain || null;
  }

  /**
   * 現在の再生位置
   */
  get_current_time() {
    const [, { Position: position }] = netflix.player.getMostRecentPlaybackDiagnosticGroups();
    return Number.parseFloat(position);
  }

  get_video_title() {
    return 'Netflix';
  }

  get_video_thumbnail() {
    return 'https://assets.nflxext.com/en_us/pages/wiplayer/logo_v3.svg';
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
    return [Number.parseInt(kbps) * 1000];
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

  is_main_video() {
    return location.pathname.match(/\/watch\//);
  }

  is_cm() {
    return false;
  }

  is_calculatable() {
    return this.calQoeFlg;
  }
}

export default NetflixTypeHandler;
