// @ts-check
import { AdObserver } from './AdObserver';
import Config from './Config';
import GeneralTypeHandler from './GeneralTypeHandler';
import ResourceTiming from './ResourceTiming';

/**
 * YouTube動画リソースのURLの判定
 * @param {URL} url URL
 * @return {boolean} YouTube動画リソースの場合: true、それ以外: false
 */
function isYouTubeVideoResource(url) {
  return (
    /** 動画視聴ページ */
    (url.host === 'www.youtube.com' &&
      url.pathname.endsWith('watch') &&
      Boolean(url.searchParams.get('v'))) ||
    /** get_video_info */
    (url.host === 'www.youtube.com' && url.pathname.endsWith('get_video_info')) ||
    /** 動画のチャンク */
    (url.host.endsWith('.googlevideo.com') && url.pathname.endsWith('videoplayback'))
  );
}

/**
 * スループットの計算
 * add_throughput_history() に与えるスループットの計算を行う
 * @param {object} params
 * @param {PerformanceResourceTiming} params.resource https://developer.mozilla.org/ja/docs/Web/API/PerformanceResourceTiming
 * @param {string | null} params.itag リクエスト中に含まれるitagパラメーター
 * @param {number} params.downloadSize サイズ (bytes)
 * @param {number} params.timeOrigin https://developer.mozilla.org/ja/docs/Web/API/Performance/timeOrigin
 * @param {number} params.startUnplayedBufferSize get_unplayed_buffer_size() (bytes)
 * @param {number} params.endUnplayedBufferSize get_unplayed_buffer_size() (bytes)
 * @return {{
 *  itag: string | null,
 *  downloadSize: number,
 *  downloadTime: number,
 *  throughput: number,
 *  start: number,
 *  end: number,
 *  startUnplayedBufferSize: number,
 *  endUnplayedBufferSize: number,
 *  timings: {
 *    domainLookupStart: number,
 *    connectStart: number,
 *    requestStart: number,
 *    responseStart: number,
 *  },
 * }}
 */
function createThroughput({
  resource,
  itag,
  timeOrigin,
  downloadSize,
  startUnplayedBufferSize,
  endUnplayedBufferSize,
}) {
  const downloadTime = resource.responseEnd - resource.startTime;
  const throughput = Math.floor(((downloadSize * 8) / downloadTime) * 1000);
  const start = resource.startTime + timeOrigin;
  const end = resource.responseEnd + timeOrigin;

  const timings = {
    domainLookupStart: resource.domainLookupStart - resource.startTime,
    connectStart: resource.connectStart - resource.startTime,
    requestStart: resource.requestStart - resource.startTime,
    responseStart: resource.responseStart - resource.startTime,
  };

  return {
    itag,
    downloadSize,
    downloadTime,
    throughput,
    start,
    end,
    startUnplayedBufferSize,
    endUnplayedBufferSize,
    timings,
  };
}

/** カスタマイズしたことを区別するためのシンボル */
const SodiumFetch = Symbol('SodiumFetch');

class YouTubeTypeHandler extends GeneralTypeHandler {
  static is_youtube_type() {
    try {
      // トップページ上部の広告動画はiframeになっているため、このurlは計測から除外する
      const url = new URL(window.location.href);

      if (url.pathname === '/embed/') {
        return false;
      }

      /** @type {any} */
      const player = document.querySelector('#movie_player');

      if (!player) {
        return false;
      }

      if (
        !(player.getVideoStats instanceof Function) ||
        !(player.getCurrentTime instanceof Function) ||
        !(player.getDuration instanceof Function) ||
        !(player.getVideoLoadedFraction instanceof Function) ||
        !(player.getAdState instanceof Function) ||
        !(player.getPlaybackQuality instanceof Function)
      ) {
        return false;
      }

      if (!YouTubeTypeHandler.can_get_streaming_info()) {
        const q = player.getPlaybackQuality();

        if (!q || q === 'unknown') {
          return false;
        }

        return true;
      }

      if (!(player.getPlayerResponse instanceof Function)) {
        return false;
      }

      const stats = player.getVideoStats();
      const response = player.getPlayerResponse();

      if (
        !stats.fmt ||
        !stats.afmt ||
        !response.videoDetails ||
        !response.videoDetails.title ||
        !response.videoDetails.thumbnail ||
        !(response.videoDetails.thumbnail.thumbnails instanceof Array)
      ) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  static can_get_streaming_info() {
    if (YouTubeTypeHandler.is_mobile()) {
      return false;
    }

    //  YouTube for TV
    //  music.youtube.com
    return true;
  }

  static is_mobile() {
    return new URL(window.location.href).host === 'm.youtube.com';
  }

  static bitrate_table() {
    return {
      tiny: { l: 666666, h: 1000000 },
      small: { l: 666666, h: 1000000 },
      medium: { l: 1000000, h: 1500000 },
      large: { l: 2500000, h: 4000000 },
      hd720: { l: 5000000, h: 7500000 },
      hd1080: { l: 8000000, h: 12000000 },
      hd1440: { l: 16000000, h: 24000000 },
      hd2160: { l: 45000000, h: 68000000 },
      highres: { l: 45000000, h: 68000000 },
    };
  }

  static async hook_youtube() {
    const { host } = new URL(window.location.href);

    if (!(host === 'www.youtube.com' || host === 'm.youtube.com')) {
      return;
    }

    // --- XHR async --- //
    YouTubeTypeHandler.hook_youtube_xhr();
    // --- fetch --- //
    YouTubeTypeHandler.hook_youtube_fetch();
  }

  /** @todo: hook_youtube_fetch に移行したい */
  static async hook_youtube_xhr() {
    class SodiumXMLHttpRequest extends XMLHttpRequest {
      constructor(...args) {
        // @ts-ignore
        super(args);
        this.addEventListener('readystatechange', () => {
          switch (this.readyState) {
            case 1: // OPENED
              this.downloadStartTime = performance.now();
              this.sodiumStartUnplayedBuffer = YouTubeTypeHandler.get_unplayed_buffer_size();
              break;
            case 4: // DONE
              this.downloadEndTime = performance.now();
              this.sodiumEndUnplayedBuffer = YouTubeTypeHandler.get_unplayed_buffer_size();
              break;
            default:
          }
        });

        this.addEventListener('load', (event) => {
          try {
            const url = new URL(/** @type {XMLHttpRequest} */ (event.target).responseURL);

            if (
              // --- 動画ページ --- //
              (url.host === 'www.youtube.com' &&
                url.pathname.endsWith('watch') &&
                url.searchParams.get('v')) ||
              // --- get_video_info --- //
              (url.host === 'www.youtube.com' && url.pathname.endsWith('get_video_info')) ||
              // --- chunk --- //
              (url.host.endsWith('googlevideo.com') && url.pathname.endsWith('videoplayback'))
            ) {
              const id = url.searchParams.get('id');

              if (!YouTubeTypeHandler.trackingId && id) {
                YouTubeTypeHandler.trackingId = id;
              }

              if (YouTubeTypeHandler.trackingId === id) {
                const resource = ResourceTiming.find(
                  /** @type {XMLHttpRequest} */ (event.target).responseURL,
                );

                // const downloadTime = resource.duration; // ここでは DONE - OPENED を使う
                const downloadTime = this.downloadEndTime - this.downloadStartTime;
                const start = resource.startTime + performance.timeOrigin;
                const end = resource.responseEnd + performance.timeOrigin;
                const throughput = Math.floor(((event.loaded * 8) / downloadTime) * 1000);
                const domainLookupStart = resource.domainLookupStart - resource.startTime;
                const connectStart = resource.connectStart - resource.startTime;
                const requestStart = resource.requestStart - resource.startTime;
                const responseStart = resource.responseStart - resource.startTime;

                const timings = {
                  domainLookupStart,
                  connectStart,
                  requestStart,
                  responseStart,
                };

                //  playerオブジェクトがない可能性がある、XHR後のバッファロード処理があるため、1000ms スリープする
                setTimeout(() => {
                  const itag = YouTubeTypeHandler.get_representation().video;

                  YouTubeTypeHandler.add_throughput_history({
                    downloadTime,
                    throughput,
                    downloadSize: Number.parseFloat(event.loaded.toString()),
                    start,
                    startUnplayedBufferSize: this.sodiumStartUnplayedBuffer,
                    end,
                    endUnplayedBufferSize: this.sodiumEndUnplayedBuffer,
                    timings,
                    itag,
                  });
                  console.log(
                    `VIDEOMARK: load [URL: ${
                      /** @type {XMLHttpRequest} */ (event.target).responseURL
                    }, contents: ${
                      event.loaded
                    }, duration(ms): ${downloadTime}, duration(Date): ${new Date(
                      start,
                    )} - ${new Date(end)}, UnplayedBufferSize: ${
                      this.sodiumStartUnplayedBuffer
                    } - ${
                      this.sodiumEndUnplayedBuffer
                    }, throughput: ${throughput}, timings: ${JSON.stringify(
                      timings,
                    )}, itag: ${itag}, id: ${url.searchParams.get('id')}]`,
                  );
                }, 1000);
              }
            }
          } catch (e) {
            // nop
          }
        });
      }
    }

    // eslint-disable-next-line no-global-assign
    XMLHttpRequest = SodiumXMLHttpRequest;
  }

  /** fetch API の書き換え */
  static hook_youtube_fetch() {
    if (window.fetch[SodiumFetch]) {
      return;
    }

    const { fetch } = window;

    async function fetcher(...args) {
      /** @type {string | URL | Request} */
      const urlOrRequest = args[0];
      const url = new URL(urlOrRequest instanceof Request ? urlOrRequest.url : urlOrRequest);

      if (!isYouTubeVideoResource(url)) {
        // @ts-ignore
        return fetch(...args);
      }

      const id = url.searchParams.get('id');

      if (!YouTubeTypeHandler.trackingId) {
        YouTubeTypeHandler.trackingId = id;
      }

      if (YouTubeTypeHandler.trackingId !== id) {
        // @ts-ignore
        return fetch(...args);
      }

      const { timeOrigin } = performance;
      const startUnplayedBufferSize = YouTubeTypeHandler.get_unplayed_buffer_size();
      // @ts-ignore
      const res = await fetch(...args);
      const clonedRes = res.clone();
      // TODO: fetch() の resolve されるタイミングはresponseEndのタイミングではないので要修正
      const endUnplayedBufferSize = YouTubeTypeHandler.get_unplayed_buffer_size();

      //  playerオブジェクトがない可能性がある、バッファロード処理があるため待機
      setTimeout(async () => {
        /** @type {PerformanceResourceTiming | undefined} */
        const resource = ResourceTiming.find(url.href);

        if (!resource) {
          return;
        }

        const downloadSize = (await clonedRes.blob()).size;
        const itag = YouTubeTypeHandler.get_representation().video;

        const throughput = createThroughput({
          resource,
          itag,
          downloadSize,
          timeOrigin,
          startUnplayedBufferSize,
          endUnplayedBufferSize,
        });

        YouTubeTypeHandler.add_throughput_history(throughput);
      }, 1000);

      return res;
    }

    fetcher[SodiumFetch] = true;
    window.fetch = fetcher;
  }

  static add_throughput_history(throughput) {
    console.debug(`add_throughput_history: downloadSize=${throughput.downloadSize}`);

    if (throughput.downloadSize <= 0) {
      return;
    }

    YouTubeTypeHandler.throughputHistories.push(throughput);
    YouTubeTypeHandler.throughputHistories = YouTubeTypeHandler.throughputHistories.slice(
      -Config.get_max_throughput_history_size(),
    );
  }

  static get_unplayed_buffer_size() {
    let unplayedBufferSize;

    try {
      /** @type {any} */
      const player = document.querySelector('#movie_player');
      const received = Number.parseFloat(player.getVideoLoadedFraction());
      const duration = Number.parseFloat(player.getDuration());

      if (Number.isNaN(received) || Number.isNaN(duration)) {
        throw new Error(`NaN`);
      }

      unplayedBufferSize = duration * received * 1000;
    } catch (e) {
      unplayedBufferSize = 0;
    }

    return Math.floor(unplayedBufferSize);
  }

  /**
   * @type {HTMLElement | null}
   */
  static get video_player() {
    return document.querySelector('#movie_player');
  }

  /**
   * @type {Record<string, any>}
   */
  static get video_stats() {
    return YouTubeTypeHandler.video_player?.getVideoStats() ?? {};
  }

  /**
   * @type {Record<string, any>[]}
   */
  static get adaptive_formats() {
    return (
      YouTubeTypeHandler.video_player?.getPlayerResponse()?.streamingData?.adaptiveFormats ?? []
    );
  }

  /**
   * @type {Record<string, any>[]}
   */
  static get normalized_adaptive_formats() {
    return YouTubeTypeHandler.adaptive_formats.reduce((acc, cur) => {
      const v = Object.assign(cur);

      v.bitrate = v.bitrate ? v.bitrate : v.averageBitrate;
      v.size = v.width && v.height ? `${v.width}x${v.height}` : null;
      v.itag = `${v.itag}`;

      try {
        const {
          groups: { type, container, codec },
        } = /(?<type>\S+)\/(?<container>\S+);(?:\s+)codecs="(?<codec>\S+)"/.exec(v.mimeType);

        v.type = type;
        v.container = container;
        v.codec = codec;
      } catch (e) {
        /* do nothing */
      }

      acc.push(v);

      return acc;
    }, []);
  }

  static get_play_list_info() {
    try {
      return YouTubeTypeHandler.normalized_adaptive_formats.map((e) => ({
        representationId: e.itag,
        bps: Number.parseInt(e.bitrate, 10),
        videoWidth: e.size ? Number.parseInt(e.size.split('x')[0], 10) : -1,
        videoHeight: e.size ? Number.parseInt(e.size.split('x')[1], 10) : -1,
        container: e.container,
        codec: e.codec,
        fps: e.fps ? Number.parseInt(e.fps, 10) : -1,
        chunkDuration: YouTubeTypeHandler.DEFAULT_SEGMENT_DURATION,
        serverIp: new URL(e.url).host,
      }));
    } catch (e) {
      return [];
    }
  }

  static get_playable_video_format_list() {
    try {
      const formats = YouTubeTypeHandler.normalized_adaptive_formats;
      const { fmt } = YouTubeTypeHandler.video_stats;

      if (!fmt || !formats.length) {
        throw new Error('not found');
      }

      const { type } = formats.find((e) => e.itag === fmt);

      return formats
        .filter((e) => e.type === type)
        .sort((a, b) => Number.parseInt(b.bitrate, 10) - Number.parseInt(a.bitrate, 10));
    } catch (e) {
      return [];
    }
  }

  // get_throughput_info()はバッファを破壊するため、VideoData.update()以外では実行してはならない
  static get_throughput_info() {
    const itagCache = {};
    const formats = YouTubeTypeHandler.get_playable_video_format_list();

    const histories = YouTubeTypeHandler.throughputHistories
      .splice(0, YouTubeTypeHandler.throughputHistories.length)
      .filter((h) => formats.find((f) => f.itag === h.itag))
      .reduce((acc, cur) => {
        let bitrate = itagCache[cur.itag];

        if (!bitrate) {
          try {
            ({ bitrate } = formats.find((f) => f.itag === cur.itag));
            bitrate = Number.parseInt(bitrate, 10);
            itagCache[cur.itag] = bitrate;
          } catch (e) {
            return acc;
          }
        }

        acc.push({
          downloadTime: cur.downloadTime,
          throughput: cur.throughput,
          downloadSize: cur.downloadSize,
          start: cur.start,
          startUnplayedBufferSize: cur.startUnplayedBufferSize,
          end: cur.end,
          endUnplayedBufferSize: cur.endUnplayedBufferSize,
          bitrate,
          timings: cur.timings,
          representationId: cur.itag,
        });

        return acc;
      }, []);

    // separate by duration
    return histories.reduce((acc, cur) => {
      // plInfo duration に合わせた形に throughput を変更する
      const downloadDuration = cur.downloadSize / (cur.bitrate / 8);

      if (downloadDuration > YouTubeTypeHandler.DEFAULT_SEGMENT_DURATION / 1000) {
        const numOfSegments = Math.round(
          downloadDuration / (YouTubeTypeHandler.DEFAULT_SEGMENT_DURATION / 1000),
        );

        for (let i = 0; i < numOfSegments; i += 1) {
          const size = Math.floor(cur.downloadSize / numOfSegments);
          const time = Math.floor(cur.downloadTime / numOfSegments);
          const th = Math.floor(((size * 8) / time) * 1000);

          acc.push({
            downloadTime: time,
            throughput: th,
            downloadSize: size,
            start: cur.start,
            startUnplayedBufferSize: cur.startUnplayedBufferSize,
            end: cur.end,
            endUnplayedBufferSize: cur.endUnplayedBufferSize,
            bitrate: cur.bitrate,
            timings: cur.timings,
            representationId: cur.representationId,
          });
        }
      } else {
        acc.push(cur);
      }

      return acc;
    }, []);
  }

  static get_codec_info() {
    const stats = YouTubeTypeHandler.video_stats;
    const list = YouTubeTypeHandler.get_play_list_info();
    const video = list.find((e) => e.representationId === stats.fmt);
    const audio = list.find((e) => e.representationId === stats.afmt);

    return {
      video: {
        container: video ? video.container : null,
        codec: video ? video.codec : null,
      },
      audio: {
        container: audio ? audio.container : null,
        codec: audio ? audio.codec : null,
      },
    };
  }

  static get_representation() {
    const stats = YouTubeTypeHandler.video_stats;

    return {
      video: stats.fmt,
      audio: stats.afmt,
    };
  }

  /** @param {HTMLVideoElement} elm */
  constructor(elm) {
    super(elm);
    YouTubeTypeHandler.throughputHistories = [];
    YouTubeTypeHandler.trackingId = null;

    this.elm = elm;
    /** @type {any} */
    this.player = document.querySelector('#movie_player');
    this.adObserver = new AdObserver(this, this.player);
  }

  get_duration() {
    try {
      const duration = this.player.getDuration();

      return duration && Number.isFinite(duration) ? duration : -1;
    } catch (e) {
      return -1;
    }
  }

  get_video_width() {
    try {
      return this.elm.videoWidth;
    } catch (e) {
      return -1;
    }
  }

  get_video_height() {
    try {
      return this.elm.videoHeight;
    } catch (e) {
      return -1;
    }
  }

  get_bitrate() {
    try {
      if (!YouTubeTypeHandler.can_get_streaming_info()) {
        const f = this.get_framerate() === 60 ? 'h' : 'l';
        const q = this.player.getPlaybackQuality();

        return YouTubeTypeHandler.bitrate_table()[q][f];
      }

      const { video, audio } = this.get_streaming_info();

      return Number.parseInt(video.bitrate, 10) + Number.parseInt(audio.bitrate, 10);
    } catch (e) {
      return -1;
    }
  }

  get_video_bitrate() {
    try {
      if (!YouTubeTypeHandler.can_get_streaming_info()) {
        return -1;
      }

      const { video } = this.get_streaming_info();

      return Number.parseInt(video.bitrate, 10);
    } catch (e) {
      return -1;
    }
  }

  get_audio_bitrate() {
    try {
      if (!YouTubeTypeHandler.can_get_streaming_info()) {
        return -1;
      }

      const { audio } = this.get_streaming_info();

      return Number.parseInt(audio.bitrate, 10);
    } catch (e) {
      return -1;
    }
  }

  get_receive_buffer() {
    try {
      const received = Number.parseFloat(this.player.getVideoLoadedFraction());
      const duration = Number.parseFloat(this.player.getDuration());

      if (Number.isNaN(duration) || Number.isNaN(received)) {
        throw new Error('NaN');
      }

      return duration * received;
    } catch (e) {
      return -1;
    }
  }

  get_framerate() {
    try {
      if (!YouTubeTypeHandler.can_get_streaming_info()) {
        const { optimal_format } = YouTubeTypeHandler.video_stats;

        return optimal_format.endsWith('60') ? 60 : 30;
      }

      const { video } = this.get_streaming_info();

      return Number.parseFloat(video.fps);
    } catch (e) {
      return -1;
    }
  }

  get_segment_domain() {
    try {
      if (!YouTubeTypeHandler.can_get_streaming_info()) {
        const { lvh } = YouTubeTypeHandler.video_stats;

        return lvh;
      }

      const { video } = this.get_streaming_info();

      return new URL(video.url).hostname;
    } catch (e) {
      return null;
    }
  }

  get_current_time() {
    // TVerのインターフェースと合わせる
    try {
      return this.player.getCurrentTime();
    } catch (e) {
      return -1;
    }
  }

  get_video_title() {
    let title;

    try {
      ({ title } = this.player.getVideoData());
    } catch (e) {
      return title;
    }

    return title;
  }

  get_video_thumbnail() {
    let url;

    if (!YouTubeTypeHandler.can_get_streaming_info()) {
      const i = this.get_id_by_video_holder();

      return `https://img.youtube.com/vi/${i}/hqdefault.jpg`;
    }

    try {
      const {
        videoDetails: {
          thumbnail: { thumbnails },
        },
      } = this.player.getPlayerResponse();

      const thumbnail = thumbnails[thumbnails.length - 1];

      ({ url } = thumbnail);
    } catch (e) {
      return url;
    }

    return url;
  }

  get_id_by_video_holder() {
    let videoId;

    if (!YouTubeTypeHandler.can_get_streaming_info()) {
      const q = this.player.getPlaybackQuality();

      if (!q || q === 'unknown') {
        return videoId;
      }

      ({ video_id: videoId } = this.player.getVideoData());

      return videoId;
    }

    if (!(this.player.getPlayerResponse instanceof Function)) {
      return videoId;
    }

    const response = this.player.getPlayerResponse();

    if (!response) {
      return videoId;
    }

    try {
      ({
        videoDetails: { videoId },
      } = response);
    } catch (e) {
      return videoId;
    }

    return videoId;
  }

  get_view_count() {
    try {
      if (!YouTubeTypeHandler.can_get_streaming_info()) {
        const e = document.querySelector('.slim-video-metadata-title-and-badges div span span');

        if (!e) {
          throw new Error();
        }

        const s = e.getAttribute('aria-label');

        if (!s) {
          throw new Error();
        }

        const n = s.match(/\d/g);

        if (!n) {
          throw new Error();
        }

        return Number.parseInt(n.join(''), 10);
      }

      const {
        videoDetails: { viewCount },
      } = this.player.getPlayerResponse();

      if (!viewCount) {
        throw new Error();
      }

      return Number.parseInt(viewCount, 10);
    } catch (e) {
      return -1;
    }
  }

  get_streaming_info() {
    const stats = YouTubeTypeHandler.video_stats;
    const formats = YouTubeTypeHandler.normalized_adaptive_formats;
    const video = formats.find((e) => e.itag === stats.fmt);
    const audio = formats.find((e) => e.itag === stats.afmt);

    return { video, audio };
  }

  get_alt_location(url) {
    const { video_id: videoId } = this.player.getVideoData();

    if (url === 'https://www.youtube.com/') {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    if (new URL(url).origin === 'https://music.youtube.com') {
      return `https://music.youtube.com/watch?v=${videoId}`;
    }

    return '';
  }

  is_main_video(video) {
    return this.player.contains(video);
  }

  is_cm() {
    return this.player.classList.contains('ad-showing');
  }

  is_limited() {
    return this.limited;
  }

  set_quality(bitrate) {
    if (!YouTubeTypeHandler.can_get_streaming_info()) {
      return;
    }

    try {
      const { quality_label, itag, type, size } =
        YouTubeTypeHandler.get_playable_video_format_list().find(
          (e) => Number.parseInt(e.bitrate, 10) === bitrate,
        );

      // const quality = YouTubeTypeHandler.qualityLabelTable[quality_label.replace(/[^0-9^\\.]/g, "")];
      const quality = YouTubeTypeHandler.qualityLabelTable[/\d+/.exec(quality_label)[0]];

      if (quality) {
        console.log(
          `VIDEOMARK: Playback quality [quality:${quality_label}(${quality}), bitrate:${bitrate}, itag:${itag}, type:${type}, size:${size}]`,
        );
        this.player.setPlaybackQualityRange(quality, quality);
      }
    } catch (e) {
      //
    }
  }

  set_max_bitrate(bitrate, resolution) {
    try {
      const { fmt } = YouTubeTypeHandler.video_stats;
      const formats = YouTubeTypeHandler.normalized_adaptive_formats;
      const { container, codec } = formats.find((e) => e.itag === fmt);
      const codecCond = new RegExp(`^${codec.split('.')[0]}`);
      const qualityMap = {};

      formats
        .filter((e) => e.type === 'video' && e.codec.match(codecCond))
        .forEach((v) => {
          qualityMap[v.quality] =
            (qualityMap[v.quality] || { fps: 0 }).fps > v.fps ? qualityMap[v.quality] : v;
        });

      const video = Object.values(qualityMap).sort(({ bitrate: a }, { bitrate: b }) => b - a);

      video.forEach((v) => {
        const [audio, audio2] = formats
          .filter((e) => e.type === 'audio' && e.container === v.container)
          .sort(({ bitrate: a }, { bitrate: b }) => b - a);

        // eslint-disable-next-line no-param-reassign
        v.audio = v.container === 'webm' && v.quality === 'tiny' && audio2 ? audio2 : audio;
        console.log(
          `VIDEOMARK: set_max_bitrate(): itag=${v.itag} quality=${v.quality} bitrate=${
            (v.bitrate + v.audio.bitrate) / 1024
          } fps=${v.fps} container=${v.container} codec=${v.codec}/${v.audio.codec}`,
        );
      });

      const current = video.find((e) => e.itag === fmt);
      const resolutionSelect = video.find((e) => e.height <= resolution);
      const bitrateSelect = video.find((e) => e.bitrate + e.audio.bitrate < bitrate);

      console.log(
        `VIDEOMARK: set_max_bitrate(): bitrate=${
          bitrate / 1024
        } resolution=${resolution} container=${container} codec=${codec}`,
      );
      console.log(
        `VIDEOMARK: set_max_bitrate(): current: quality=${current.quality} bitrate=${
          (current.bitrate + current.audio.bitrate) / 1024
        }`,
      );

      if (bitrateSelect) {
        console.log(
          `VIDEOMARK: set_max_bitrate(): bitrateSelect: quality=${bitrateSelect.quality} bitrate=${
            (bitrateSelect.bitrate + bitrateSelect.audio.bitrate) / 1024
          }`,
        );
      }

      if (resolutionSelect) {
        console.log(
          `VIDEOMARK: set_max_bitrate(): resolutionSelect: quality=${
            resolutionSelect.quality
          } bitrate=${(resolutionSelect.bitrate + resolutionSelect.audio.bitrate) / 1024}`,
        );
      }

      let select;

      if (resolutionSelect && bitrateSelect) {
        select =
          resolutionSelect.bitrate < bitrateSelect.bitrate ? resolutionSelect : bitrateSelect;
      } else {
        select = resolutionSelect || bitrateSelect || video[video.length - 1];
      }

      console.log(
        `VIDEOMARK: set_max_bitrate(): select: quality=${select.quality} bitrate=${
          (select.bitrate + select.audio.bitrate) / 1024
        }`,
      );

      if (select.bitrate < current.bitrate) {
        // 再生中のbitrateより小さい値が設定された場合変更する
        this.player.setPlaybackQualityRange(select.quality, select.quality);
        this.limited = true;
      } else {
        console.log(
          `VIDEOMARK: too small or does not need a change bitrate:${bitrate} not changed`,
        );
      }
    } catch (e) {
      console.warn(`VIDEOMARK: failed to find quality label`);
    }
  }

  set_default_bitrate() {
    this.player.setPlaybackQualityRange('default', 'default');
  }
}

YouTubeTypeHandler.qualityLabelTable = {
  144: 'tiny',
  240: 'small',
  360: 'medium',
  480: 'large',
  720: 'hd720',
  1080: 'hd1080',
  1440: 'hd1440',
  2160: 'hd2160',
  2880: 'hd2880',
  4320: 'highres',
};
YouTubeTypeHandler.DEFAULT_SEGMENT_DURATION = 5000;
YouTubeTypeHandler.throughputHistories = [];
YouTubeTypeHandler.trackingId = null;

export default YouTubeTypeHandler;

/**
 * 動画コーデックとレプレゼンテーション ID のマッピング。データは以下から取得。
 * @see https://gist.github.com/MartinEesmaa/2f4b261cb90a47e9c41ba115a011a4aa
 */
const codecRepIdMap = {
  h264: [133, 134, 135, 136, 137, 160, 216, 264, 266, 298, 299, 304, 305, 597],
  vp8: [167, 168, 169, 170],
  vp9: [
    242, 243, 244, 247, 248, 271, 272, 278, 302, 303, 308, 313, 315, 330, 331, 332, 333, 334, 335,
    336, 337, 598, 612, 616,
  ],
  av1: [
    394, 395, 396, 397, 398, 399, 400, 401, 402, 571, 694, 695, 696, 697, 698, 699, 700, 701, 702,
  ],
};

/**
 * 与えられたレプレゼンテーション ID から動画コーデックを判定。
 * @param {number} id レプレゼンテーション ID。
 * @returns {'h264' | 'vp8' | 'vp9' | 'av1' | 'unknown'} コーデック。
 */
export const detectVideoCodec = (id) =>
  /** @type {'h264' | 'vp8' | 'vp9' | 'av1' | undefined} */ (
    Object.entries(codecRepIdMap).find(([, ids]) => ids.includes(id))?.[0]
  ) ?? 'unknown';
