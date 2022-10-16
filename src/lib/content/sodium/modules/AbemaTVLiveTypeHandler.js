// @ts-check
import Config from './Config';
import GeneralTypeHandler from './GeneralTypeHandler';
import ResourceTiming from './ResourceTiming';

const DURATION = 60 * 60 * 2; // 動画サイズは 2 時間の固定にする
const RECEIVED_BUFFER_OFFSET = 5; // 5 秒分先読みを固定値で挿入
const DEFAULT_REPRESENTATION_KEY = 480;
const REPRESENTATION_TABLE = {
  // MPD の内容を切り出した固定値
  1080: {
    bandwidth: 4000000,
    codec: 'avc1.640029',
    framerate: 29.97, // 30000 / 1001,
    height: 1080,
    width: 1920,
    bitrate: 4000000,
  },
  720: {
    bandwidth: 2000000,
    codec: 'avc1.640029',
    framerate: 29.97, // 30000 / 1001,
    height: 720,
    width: 1280,
    bitrate: 2000000,
  },
  480: {
    bandwidth: 900000,
    codec: 'avc1.640029',
    framerate: 29.97, // 30000 / 1001,
    height: 480,
    width: 854,
    bitrate: 900000,
  },
  240: {
    bandwidth: 240000,
    codec: 'avc1.640029',
    framerate: 29.97, // 30000 / 1001,
    height: 240,
    width: 426,
    bitrate: 240000,
  },
  180: {
    bandwidth: 120000,
    codec: 'avc1.640029',
    framerate: 29.97, // 30000 / 1001,
    height: 180,
    width: 320,
    bitrate: 120000,
  },
};

let current;

function equal_videos(a, b) {
  if (a.length != b.length) return false;
  return !Array.from(a).find((e, i) => e != b[i]);
}

function get_representation() {
  const default_representation = REPRESENTATION_TABLE[DEFAULT_REPRESENTATION_KEY];
  const v = document.querySelector('video[style*="display: block"]');
  if (!v) return default_representation;
  const k = Object.keys(REPRESENTATION_TABLE).find((e) => e === String(v.videoHeight));
  if (!k) return default_representation;
  return REPRESENTATION_TABLE[k];
}

/**
 * スループットの計算
 * get_throughput_info() で得られるスループットの計算を行う
 * @param {object} params
 * @param {PerformanceResourceTiming} params.resource https://developer.mozilla.org/ja/docs/Web/API/PerformanceResourceTiming
 * @param {number} params.timeOrigin https://developer.mozilla.org/ja/docs/Web/API/Performance/timeOrigin
 * @return {{
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
 * }}
 */
function createThroughput({ resource, timeOrigin }) {
  const downloadSize = resource.transferSize;
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
    representationId: resource.name, // NOTE: itagが特定できないのでURLで代替
    downloadSize,
    downloadTime,
    throughput,
    start,
    end,
    startUnplayedBufferSize: 0, // NOTE: 不明なので0と仮定
    endUnplayedBufferSize: 0, // NOTE: 不明なので0と仮定
    bitrate: 0, // NOTE: 不明なので0と仮定
    timings,
  };
}

/** PerformanceResourceTiming.startTime の最新の値 */
let lastStarted = -Infinity;

/**
 * スループットの計測値の生成
 * get_throughput_info() で得られるスループットの計測値の生成を行う
 */
function createThroughputInfo() {
  const timeOrigin = performance.timeOrigin;
  const resources = ResourceTiming.findAll({
    after: lastStarted,
    // NOTE: get_segment_domainを含むURL … 映像だけでなく音声やマニフェストなども含む
    pattern: /^https:\/\/ds-linear-abematv\.akamaized\.net\//,
  });
  lastStarted = Math.max(lastStarted, ...resources.map((resource) => resource.startTime));
  return resources.map((resource) => createThroughput({ resource, timeOrigin }));
}

/* あまり有用な情報は取り出せない */
export default class AbemaTVLiveTypeHandler extends GeneralTypeHandler {
  constructor() {
    super(null);

    if (current && equal_videos(current, document.querySelectorAll('video')))
      throw new Error('ignore this video');

    current = document.querySelectorAll('video');
    this.start_time = Date.now();
  }

  // NOTE: 破壊的メソッド
  get_throughput_info() {
    return createThroughputInfo().slice(-Config.get_max_throughput_history_size());
  }

  // eslint-disable-next-line class-methods-use-this
  get_duration() {
    /* video.duration には、1FFFFFFFFFFFFF が入っているため使用できない */
    /* 上記の理由により固定値 DURATION を使用 */
    return DURATION;
  }

  /* CM 時の resolution を判定可能にするため width, height は表示中の video から取得する */
  /* ただし、CM 時の video の resolution が REPRESENTATION_TABLE に含まれている場合判断することはできない */
  get_video_width() {
    return document.querySelector('video[style*="display: block"]').videoWidth;
  }

  /* CM 時の resolution を判定可能にするため width, height は表示中の video から取得する */
  /* ただし、CM 時の video の resolution が REPRESENTATION_TABLE に含まれている場合判断することはできない */
  get_video_height() {
    return document.querySelector('video[style*="display: block"]').videoHeight;
  }

  /* 表示中の video の height が REPRESENTATION_TABLE にない場合 DEFAULT_REPRESENTATION_KEY の値を返す */
  get_bitrate() {
    const { bitrate } = get_representation();
    return bitrate;
  }

  get_video_bitrate() {
    return this.get_bitrate();
  }

  // eslint-disable-next-line class-methods-use-this
  get_receive_buffer() {
    // RECEIVED_BUFFER_OFFSET 秒分先読みを固定値で挿入
    return this.get_current_time() + RECEIVED_BUFFER_OFFSET;
  }

  /* 表示中の video の height が REPRESENTATION_TABLE にない場合 DEFAULT_REPRESENTATION_KEY の値を返す */
  get_framerate() {
    const { framerate } = get_representation();
    return framerate;
  }

  // eslint-disable-next-line class-methods-use-this
  get_segment_domain() {
    return 'ds-linear-abematv.akamaized.net';
  }

  get_current_time() {
    return ((Date.now() - this.start_time) / 1000) % DURATION;
  }

  // eslint-disable-next-line class-methods-use-this
  get_video_title() {
    try {
      return document.querySelector('.com-tv-SlotHeading__title').textContent;
    } catch (e) {
      return '';
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get_video_thumbnail() {
    return `https://hayabusa.io/abema/channels/logo/${
      location.pathname.split('/').slice(-1)[0]
    }?format=png&height=48&quality=30&version=20200413&width=128&background=black`;
  }

  // eslint-disable-next-line class-methods-use-this
  get_id_by_video_holder() {
    /* チャンネルのジャンルならURLにあるが ID ではない */
    return '';
  }

  get_total_frames() {
    return Array.from(document.querySelectorAll('video')).reduce((acc, cur) => {
      acc += cur.getVideoPlaybackQuality().totalVideoFrames;
      return acc;
    }, 0);
  }

  get_dropped_frames() {
    return Array.from(document.querySelectorAll('video')).reduce((acc, cur) => {
      acc += cur.getVideoPlaybackQuality().droppedVideoFrames;
      return acc;
    }, 0);
  }

  is_main_video() {
    return true;
  }

  is_cm() {
    const v = document.querySelector('video[style*="display: block"]');
    if (!v) return true;
    const k = Object.keys(REPRESENTATION_TABLE).find((e) => e === String(v.videoHeight));
    if (!k) return true;
    return false;
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  add_cm_listener(listener) {}

  // eslint-disable-next-line class-methods-use-this
  clear() {}
}
