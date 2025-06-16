import AbemaTVLiveEventTypeHandler from './AbemaTVLiveEventTypeHandler';
import AbemaTVLiveTypeHandler from './AbemaTVLiveTypeHandler';
import AbemaTVVideoTypeHandler from './AbemaTVVideoTypeHandler';
import AmazonPrimeVideoTypeHandler from './AmazonPrimeVideoTypeHandler';
import FodTypeHandler from './FodTypeHandler';
import IIJTypeHandler from './IIJTypeHandler';
import LeminoTypeHandler from './LeminoTypeHandler';
import NHKOndemandTypeHandler from './NHKOndemandTypeHandler';
import NetflixTypeHandler from './NetflixTypeHandler';
import NicoLiveTypeHandler from './NicoLiveTypeHandler';
import NicoVideoTypeHandler from './NicoVideoTypeHandler';
import TVerTypeHandler from './TVerTypeHandler';
import YouTubeTypeHandler from './YouTubeTypeHandler';

export default class VideoHandler {
  constructor(elm) {
    this.calQoeFlg = false;
    this.service = null;

    const url = new URL(window.location.href);

    if (YouTubeTypeHandler.is_youtube_type()) {
      this.handler = new YouTubeTypeHandler(elm);
      this.calQoeFlg = true;
      this.service = 'youtube';
      console.log('YouTube Type Handler');
    } else if (url.host === 'tver.jp') {
      this.handler = new TVerTypeHandler(elm);
      this.calQoeFlg = true;
      this.service = 'tver';
      console.log('TVer Type Handler');
    } else if (url.host === 'www.nicovideo.jp') {
      this.handler = new NicoVideoTypeHandler(elm);
      this.service = 'nicovideo';
      console.log('NicoVideo Type Handler');
    } else if (/live\d?\.nicovideo\.jp/.test(url.host)) {
      this.handler = new NicoLiveTypeHandler(elm);
      this.service = 'nicolive';
      console.log('NicoLive Type Handler');
    } else if (url.host === 'fod.fujitv.co.jp') {
      this.handler = new FodTypeHandler(elm);
      this.service = 'fod';
      console.log('Fod Type Handler');
    } else if (url.host === 'www.nhk-ondemand.jp') {
      this.handler = new NHKOndemandTypeHandler(elm);
      this.service = 'nhkondemand';
      console.log('NHK Ondemand Type Handler');
    } else if (url.host === 'lemino.docomo.ne.jp') {
      this.handler = new LeminoTypeHandler(elm);
      this.service = 'lemino';
      console.log('Lemino Type Handler');
    } else if (url.host === 'abema.tv') {
      const { segment } = url.pathname.match(/^\/(?<segment>.+?)\//)?.groups ?? {};

      if (segment === 'channels' || segment === 'video') {
        this.handler = new AbemaTVVideoTypeHandler(elm);
        this.service = 'abematv_video';
        console.log('Abema TV Video Type Handler');
      } else if (segment === 'now-on-air') {
        this.handler = new AbemaTVLiveTypeHandler(elm);
        this.service = 'abematv_live';
        this.calQoeFlg = true;
        console.log('Abema TV Live Type Handler');
      } else if (segment === 'live-event') {
        this.handler = new AbemaTVLiveEventTypeHandler(elm);
        this.service = 'abematv_live_event';
        this.calQoeFlg = true;
        console.log('Abema TV Live Event Type Handler');
      } else {
        throw new Error('AbemaTV ignores top page and unknown page video.');
      }
    } else if (url.host === 'www.amazon.co.jp') {
      this.handler = new AmazonPrimeVideoTypeHandler(elm);
      this.service = 'amazonprimevideo';
      console.log('Amazon Prime Video Type Handler');
    } else if (url.host === 'pr.iij.ad.jp') {
      this.handler = new IIJTypeHandler(elm);
      this.calQoeFlg = true;
      this.service = 'iijtwilightconcert';
      console.log('IIJ Type Handler');
    } else if (/(www\.)?netflix.com/.test(url.host)) {
      this.handler = new NetflixTypeHandler(elm);
      this.calQoeFlg = true;
      this.service = 'netflix';
      console.log('Netflix Type Handler');
    } else {
      throw new Error('Unknown Type Handler');
    }
  }

  get_duration() {
    const duration = this.handler.get_duration();

    return duration && Number.isFinite(duration) ? duration : -1;
  }

  get_video_width() {
    return this.handler.get_video_width();
  }

  get_video_height() {
    return this.handler.get_video_height();
  }

  get_bitrate() {
    return this.handler.get_bitrate();
  }

  get_video_bitrate() {
    let videoBitrate = -1;

    if (this.handler.get_video_bitrate instanceof Function) {
      videoBitrate = this.handler.get_video_bitrate();
    }

    return videoBitrate;
  }

  get_receive_buffer() {
    let receive = -1;

    if (this.handler instanceof IIJTypeHandler) {
      receive = IIJTypeHandler.get_receive_buffer();
    } else if (this.handler.get_receive_buffer instanceof Function) {
      receive = this.handler.get_receive_buffer();
    }

    return receive;
  }

  get_framerate() {
    return this.handler.get_framerate();
  }

  get_segment_domain() {
    return this.handler.get_segment_domain();
  }

  /**
   * 現在の再生位置
   * @param {HTMLElement} video
   */
  get_current_time(video) {
    return this.handler.get_current_time(video);
  }

  get_video_title() {
    let title;

    if (this.handler.get_video_title instanceof Function) {
      title = this.handler.get_video_title();
    }

    if (!title) {
      const og_title = document.querySelector("meta[property='og:title']");

      if (og_title) {
        title = og_title.content;
      }

      if (!title) {
        ({ title } = document);
      }

      let separator = -1;

      if (title.indexOf('｜') !== -1) {
        separator = title.indexOf('｜');
      } else if (title.indexOf('|') !== -1) {
        separator = title.indexOf('|');
      }

      if (separator !== -1) {
        title = title.substr(0, separator).trim();
      } else {
        title = title.trim();
      }
    }

    return title;
  }

  get_video_thumbnail() {
    let thumbnail;

    if (this.handler.get_video_thumbnail instanceof Function) {
      thumbnail = this.handler.get_video_thumbnail();
    }

    const og_image = document.querySelector("meta[property='og:image']");

    if (!thumbnail && og_image) {
      thumbnail = og_image.content;
    }

    return thumbnail;
  }

  get_id_by_video_holder() {
    let id_by_video_holder;

    if (this.handler.get_id_by_video_holder instanceof Function) {
      id_by_video_holder = this.handler.get_id_by_video_holder();
    }

    return id_by_video_holder;
  }

  get_view_count() {
    let view_count = -1;

    if (this.handler.get_view_count instanceof Function) {
      view_count = this.handler.get_view_count();
    }

    return view_count;
  }

  get_play_list_info() {
    let list = [];

    if (this.handler instanceof YouTubeTypeHandler) {
      list = YouTubeTypeHandler.get_play_list_info();
    } else if (this.handler.get_play_list_info instanceof Function) {
      list = this.handler.get_play_list_info();
    }

    return list;
  }

  get_throughput_info() {
    let list = [];

    if (this.handler instanceof YouTubeTypeHandler) {
      list = YouTubeTypeHandler.get_throughput_info();
    } else if (this.handler.get_throughput_info instanceof Function) {
      list = this.handler.get_throughput_info();
    }

    return list;
  }

  get_codec_info() {
    let info = {};

    if (this.handler instanceof YouTubeTypeHandler) {
      info = YouTubeTypeHandler.get_codec_info();
    } else if (this.handler.get_codec_info instanceof Function) {
      info = this.handler.get_codec_info();
    }

    return info;
  }

  get_representation() {
    let representation = {};

    if (this.handler instanceof YouTubeTypeHandler) {
      representation = YouTubeTypeHandler.get_representation();
    } else if (this.handler.get_representation instanceof Function) {
      representation = this.handler.get_representation();
    }

    return representation;
  }

  get_service() {
    return this.service;
  }

  get_total_frames(video) {
    return video.getVideoPlaybackQuality().totalVideoFrames;
  }

  get_dropped_frames(video) {
    return video.getVideoPlaybackQuality().droppedVideoFrames;
  }

  /**
   * 動画再生ページの正規 URL を取得。
   * @param {string} url HTML から取得された Canonical URL か現在のタブの URL。
   * @returns {string} 正規化された URL。
   */
  get_canonical_url(url) {
    return this.handler.get_canonical_url?.(url) ?? '';
  }

  is_main_video(video) {
    if (this.handler.is_main_video instanceof Function) {
      return this.handler.is_main_video(video);
    }

    return true;
  }

  is_cm(video) {
    if (this.handler.is_cm instanceof Function) {
      return this.handler.is_cm(video);
    }

    return false;
  }

  is_limited() {
    if (this.handler.is_limited instanceof Function) {
      return this.handler.is_limited();
    }

    return false;
  }

  is_calculable() {
    return this.calQoeFlg;
  }

  set_quality(bitrate) {
    if (this.handler.set_quality instanceof Function) {
      this.handler.set_quality(bitrate);
    }
  }

  set_max_bitrate(bitrate, resolution) {
    if (this.handler.set_max_bitrate instanceof Function) {
      this.handler.set_max_bitrate(bitrate, resolution);
    }
  }

  set_default_bitrate() {
    if (this.handler.set_default_bitrate instanceof Function) {
      this.handler.set_default_bitrate();
    }
  }

  add_cm_listener(listener) {
    if (this.handler.add_cm_listener instanceof Function) {
      this.handler.add_cm_listener(listener);
    }
  }

  clear() {
    if (this.handler.clear instanceof Function) {
      this.handler.clear();
    }
  }
}
