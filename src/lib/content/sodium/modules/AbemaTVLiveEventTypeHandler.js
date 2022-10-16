import GeneralTypeHandler from './GeneralTypeHandler';

const DURATION = 60 * 60 * 2; // 動画サイズは 2 時間の固定にする
const RECEIVED_BUFFER_OFFSET = 5; // 5 秒分先読みを固定値で挿入
const DEFAULT_REPRESENTATION_KEY = 480;
const REPRESENTATION_TABLE = {
  // MPD の内容を切り出した固定値
  1080: {
    bandwidth: 8000000,
    codec: 'avc1.4D4028',
    framerate: 29.97, // 30000 / 1001,
    height: 1080,
    width: 1920,
    bitrate: 8000000,
  },
  720: {
    bandwidth: 4000000,
    codec: 'avc1.4D4028',
    framerate: 29.97, // 30000 / 1001,
    height: 720,
    width: 1280,
    bitrate: 4000000,
  },
  480: {
    bandwidth: 2000000,
    codec: 'avc1.4D4028',
    framerate: 29.97, // 30000 / 1001,
    height: 480,
    width: 854,
    bitrate: 2000000,
  },
  360: {
    bandwidth: 1000000,
    codec: 'avc1.4D4028',
    framerate: 29.97, // 30000 / 1001,
    height: 360,
    width: 640,
    bitrate: 1000000,
  },
  240: {
    bandwidth: 499968,
    codec: 'avc1.4D4028',
    framerate: 29.97, // 30000 / 1001,
    height: 240,
    width: 426,
    bitrate: 499968,
  },
};

let current;

function equal_videos(a, b) {
  if (a.length != b.length) return false;
  return !Array.from(a).find((e, i) => e != b[i]);
}

function get_representation() {
  const default_representation = REPRESENTATION_TABLE[DEFAULT_REPRESENTATION_KEY];
  const v = document.querySelector('video');
  if (!v) return default_representation;
  const k = Object.keys(REPRESENTATION_TABLE).find((e) => e === String(v.videoHeight));
  if (!k) return default_representation;
  return REPRESENTATION_TABLE[k];
}

/* あまり有用な情報は取り出せない */
export default class AbemaTVLiveEventTypeHandler extends GeneralTypeHandler {
  constructor() {
    super(null);

    if (current && equal_videos(current, document.querySelectorAll('video')))
      throw new Error('ignore this video');

    current = document.querySelectorAll('video');
    this.start_time = Date.now();
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
    return document.querySelector('video').videoWidth;
  }

  /* CM 時の resolution を判定可能にするため width, height は表示中の video から取得する */
  /* ただし、CM 時の video の resolution が REPRESENTATION_TABLE に含まれている場合判断することはできない */
  get_video_height() {
    return document.querySelector('video').videoHeight;
  }

  /* 表示中の video の height が REPRESENTATION_TABLE にない場合 DEFAULT_REPRESENTATION_KEY の値を返す */
  get_bitrate() {
    const { bitrate } = get_representation();
    return bitrate;
  }

  get_video_bitrate() {
    return this;
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

  get_segment_domain() {
    return 'live-playout-abematv.akamaized.net';
  }

  get_current_time() {
    return ((Date.now() - this.start_time) / 1000) % DURATION;
  }

  get_video_title() {
    const heading = document.querySelector('.com-live-event-LiveEventTitle');
    return heading ? heading.textContent : document.title;
  }

  get_video_thumbnail() {
    const ogImage = document.querySelector('meta[property="og:image"]');
    return ogImage ? ogImage.content : null;
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
    const v = document.querySelector('video');
    return !v || Object.keys(REPRESENTATION_TABLE).every((e) => Number(e) !== v.videoHeight);
  }

  add_cm_listener() {}
}
