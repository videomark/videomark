import { getDataFromContentJs } from '$lib/content/sodium/modules/Utils';

/**
 * 動作設定
 */
export default class Config {
  static isVMBrowser() {
    return Boolean(window.sodium);
  }

  static async readPlatformInfo() {
    this.mobile = (await getDataFromContentJs('platform_info')).os === 'android';
  }

  static isMobile() {
    return this.mobile;
  }

  static isMobileScreen() {
    return this.isMobile() && window.screen.orientation.type.startsWith('portrait');
  }

  static get_collect_interval() {
    return this.collect_interval;
  }

  static get_search_video_interval() {
    return this.search_video_interval;
  }

  static get_fluent_url() {
    return this.fluent_url;
  }

  static get_sodium_server_url() {
    return this.sodium_server_url;
  }

  static get_num_of_latest_qoe() {
    return this.num_of_latest_qoe;
  }

  static get_event_type_names() {
    return this.event_type_names;
  }

  static get_ui_id() {
    return this.ui.id;
  }

  static get_ui_style_id() {
    return this.ui.style_id;
  }

  static get_ui_target(platform) {
    if (platform in this.ui) {
      return this.ui[platform].target;
    }

    return this.ui.general.target;
  }

  static get_style(platform) {
    if (platform in this.ui) {
      return this.ui[platform].style;
    }

    return this.ui.general.style;
  }

  static get_DEFAULT_RESOURCE_BUFFER_SIZE() {
    return this.DEFAULT_RESOURCE_BUFFER_SIZE;
  }

  static get_check_state_interval() {
    return this.check_state_interval;
  }

  static get_trans_interval() {
    return this.trans_interval;
  }

  static get_latest_qoe_update() {
    return this.latest_qoe_update;
  }

  static get_send_data_count_for_qoe() {
    return this.send_data_count_for_qoe;
  }

  static get_prev_count_for_qoe() {
    return this.prev_count_for_qoe;
  }

  static get_max_count_for_qoe() {
    return this.max_count_for_qoe;
  }

  static get_default_session() {
    return this.session;
  }

  static get_default_session_expires_in() {
    return this.session_expires_in;
  }

  static get_settings() {
    return this.settings || {};
  }

  static save_settings(new_settings) {
    if (!new_settings || !Object.keys(new_settings).length) {
      return;
    }

    this.settings = { ...this.settings, ...new_settings };
    window.postMessage(
      {
        method: 'save_settings',
        type: 'FROM_SODIUM_JS',
        new_settings,
      },
      '*',
    );
  }

  static get_transfer_size() {
    return this.transfer_size || {};
  }

  static get_peak_time_limit() {
    return this.peak_time_limit || {};
  }

  static get_peak_time_limit_url() {
    return this.peak_time_limit_url;
  }

  static get_event_data_max_size() {
    return this.event_data_max_size;
  }

  static is_quality_control() {
    return this.quality_control;
  }

  static get_resolution_control() {
    const { resolution_control_enabled, resolution_control } = this.get_settings();

    return resolution_control_enabled ? resolution_control : undefined;
  }

  static get_bitrate_control() {
    const { bitrate_control_enabled, bitrate_control } = this.get_settings();

    return bitrate_control_enabled ? bitrate_control : undefined;
  }

  static get_quota_bitrate() {
    const {
      control_by_traffic_volume,
      control_by_os_quota,
      control_by_browser_quota,
      browser_quota,
      browser_quota_bitrate,
    } = this.get_settings();

    if (!control_by_traffic_volume) {
      return undefined;
    }

    const now = new Date();

    const month = `${now.getFullYear()}-${new Intl.NumberFormat('en-US', {
      minimumIntegerDigits: 2,
    }).format(now.getMonth() + 1)}`;

    const transfer_size = this.get_transfer_size();

    const browser_quota_value /* byte */ = browser_quota
      ? browser_quota /* MiB */ * 1024 * 1024
      : Infinity;

    const browser_quota_full =
      control_by_browser_quota && browser_quota_value < (transfer_size[month] || 0);

    const os_quota_full = control_by_os_quota;

    return browser_quota_bitrate && (browser_quota_full || os_quota_full)
      ? browser_quota_bitrate /* byte */
      : undefined;
  }

  static set_alive(alive) {
    this.alive = alive;
    window.postMessage(
      {
        method: 'set_alive',
        type: 'FROM_SODIUM_JS',
        alive,
      },
      '*',
    );
  }

  static get_alive() {
    return this.alive;
  }

  static async readDisplayOnPlayerSetting() {
    this.ui_enabled = await getDataFromContentJs('display_on_player');
  }

  static set_ui_enabled(enabled) {
    this.ui_enabled = enabled;
    window.postMessage(
      {
        method: 'set_display_on_player',
        type: 'FROM_SODIUM_JS',
        enabled,
      },
      '*',
    );
  }

  static get_ui_enabled() {
    return this.ui_enabled;
  }

  static get_video_platform() {
    const matcher = this.video_platform_matcher(window.location);
    const match = this.video_platforms.find(matcher);

    return match && match.id;
  }

  static get_max_throughput_history_size() {
    return this.max_throughput_history_size;
  }

  static get_max_send_size() {
    return this.max_send_size;
  }

  /** 最大計測単位(ミリ秒単位) */
  static get_max_video_ttl() {
    const settings = this.get_settings();

    return settings?.max_video_ttl ?? this.default_max_video_ttl;
  }
}

// playback quality の取得インターバル(ミリ秒単位)
Config.collect_interval = 1 * 1000;

// videoタグ検索インターバル(ミリ秒単位)
Config.search_video_interval = 1 * 1000;

/** 最大計測単位のデフォルト値(ミリ秒単位) */
Config.default_max_video_ttl = 60 * 60 * 1000;

// fluentd サーバーのエンドポイント
Config.fluent_url = import.meta.env.SODIUM_FLUENT_URL;

// Sodium Server のエンドポイント
Config.sodium_server_url = import.meta.env.SODIUM_API_ENDPOINT;

// ネットワークの混雑する時間帯には自動的にビットレートを制限する設定ファイル
Config.peak_time_limit_url = import.meta.env.SODIUM_PEAK_TIME_LIMIT_URL;

Config.event_data_max_size = import.meta.env.SODIUM_EVENT_DATA_MAX_SIZE;

// 暫定QoE値保持数
Config.num_of_latest_qoe = 20;

// ログ保持数
Config.max_log = 100;

// 記録するイベントの種類のリスト
Config.event_type_names = [
  'play',
  'pause',
  'seeking',
  'seeked',
  'ended',
  'stalled',
  'progress',
  'waiting',
  'canplay',
];

// 動画配信サービス
Config.video_platforms = [
  {
    // YouTube Mobile
    id: 'm_youtube_com',
    host: /^m\.youtube\.com$/,
  },
  {
    // YouTube
    id: 'youtube',
    host: /(^|[^m]\.)youtube\.com$/,
  },
  {
    // TVer
    id: 'tver',
    host: /(^|\.)tver\.jp$/,
  },
  {
    // FOD
    id: 'fod',
    host: /^(i\.)?fod\.fujitv\.co\.jp$/,
  },
  {
    // ニコニコ動画
    id: 'nicovideo',
    host: /^www\.nicovideo\.jp$/,
  },
  {
    // ニコニコ生放送
    id: 'nicolive',
    host: /^live\d\.nicovideo\.jp$/,
  },
  {
    // NHKオンデマンド
    id: 'nhkondemand',
    host: /^www\.nhk-ondemand\.jp$/,
  },
  {
    // dTV
    id: 'dtv',
    host: /\.video\.dmkt-sp\.jp$/,
  },
  {
    // AbemaTV, Abemaビデオ
    id: 'abematv',
    host: /^abema\.tv$/,
  },
  {
    // Amazon Prime Video
    id: 'amazonprimevideo',
    host: /^www\.amazon\.co\.jp$/,
  },
  {
    // IIJ TWILIGHT CONCERT
    id: 'iijtwilightconcert',
    host: /^pr\.iij\.ad\.jp$/,
  },
  {
    // Netflix
    id: 'netflix',
    host: /(^|\.)netflix\.com$/,
  },
];

Config.video_platform_matcher =
  ({ host }) =>
  (platform) =>
    platform.host.test(host);

// 表示用
Config.ui = {
  id: '__videomark_ui',
  style_id: '__videomark_ui_style',
};

// デフォルトではvideoタグの親に挿入
// :hoverに反応して不透明度を変える
Config.ui.general = {
  target: null,
  style: `#${Config.ui.id} {
  position: absolute;
  z-index: 1000001;
  top: 12px;
  left: 12px;
}
#${Config.ui.id}:not(:hover) {
  opacity: 0.5;
  transition: 500ms;
}`,
};

// m.youtube.com
Config.ui.m_youtube_com = {
  ...Config.ui.general,
  target: '#player-container-id',
};

// YouTube
Config.ui.youtube = {
  target: '#movie_player',
  style: `#${Config.ui.id} {
  position: absolute;
  z-index: 1000001;
  top: 12px;
  left: 12px;
  transition: .5s cubic-bezier(0.4, 0.09, 0, 1.6);
}
.ytp-fullscreen > #${Config.ui.id} {
  top: calc(20px + 2em);
}
.ytp-autohide > #${Config.ui.id} {
  opacity: 0;
}`,
};

// Tver
Config.ui.tver = {
  target: '[class^="controller_container__"]',
  style: `#${Config.ui.id} {
  position: absolute;
  z-index: 1000001;
  top: 12px;
  left: 12px;
  text-align: left;
  transition: 1.0s cubic-bezier(0.4, 0.09, 0, 1.6);
}
.vjs-user-inactive > #${Config.ui.id},
.not-hover > #${Config.ui.id} {
  opacity: 0;
}`,
};

Config.ui.fod = {
  ...Config.ui.general,
  target: '#fod_player, #video_container',
};

// ニコニコ動画ではコメントより前面になるよう配置
Config.ui.nicovideo = {
  ...Config.ui.general,
  target: '.VideoContainer',
};

// TODO: ニコニコ生放送
// Config.ui.nicolive = {};

// NHKオンデマンド
Config.ui.nhkondemand = {
  target: null,
  style: `#${Config.ui.id} {
  position: absolute;
  z-index: 1000001;
  top: 12px;
  left: 12px;
  transition: 200ms;
}
.player__controls[style="display: none;"] ~ #${Config.ui.id} {
  opacity: 0;
}`,
};

// dTV
Config.ui.dtv = {
  target: null,
  style: `#${Config.ui.id} {
  position: absolute;
  z-index: 1000001;
  top: 12px;
  left: 12px;
  transition: 200ms;
}
.controller-hidden > #${Config.ui.id} {
  opacity: 0;
}`,
};

// ABEMA
Config.ui.abematv = {
  target: `.com-tv-TVScreen__player-container, .com-vod-VODScreen-container`,
  style: `
  #${Config.ui.id} {
    position: absolute;
    z-index: 1000001;
    top: 12px;
    left: 12px;
    transition: 200ms;
  }
  .com-tv-TVScreen__player-container > #${Config.ui.id} {
    z-index: 11;
    left: 65px;
  }
  #${Config.ui.id}:not(:hover){
    opacity: 0;
  }`,
};

// Amazon Prime Video
Config.ui.amazonprimevideo = {
  target: Config.isMobile() ? '#dv-web-player' : '.atvwebplayersdk-overlays-container',
  style: `#${Config.ui.id} {
  position: absolute;
  z-index: 1000001;
  top: 12px;
  left: 12px;
  transition: 200ms;
}
.hideCursor + #${Config.ui.id} {
  opacity: 0;
}`,
};

// IIJ TWILIGHT CONCERT
Config.ui.iijtwilightconcert = {
  target: null,
  style: `#${Config.ui.id} {
  transform: translate(12px, calc(12px - 450px));
  width: fit-content;
}
#${Config.ui.id}:not(:hover) {
  opacity: 0.5;
  transition: 500ms;
}`,
};

// Netflix
Config.ui.netflix = {
  target: 'body',
  style: `#${Config.ui.id} {
  position: absolute;
  z-index: 1000001;
  top: 12em;
  left: 12px;
}
#${Config.ui.id}:not(:hover) {
  opacity: 0.5;
  transition: 500ms;
}`,
};

// デフォルトResourceTimingAPIのバッファサイズ
Config.DEFAULT_RESOURCE_BUFFER_SIZE = 150;

// 状態監視インターバル(ミリ秒)
Config.check_state_interval = 1 * 1000;

// データ送信頻度(状態監視の指定回数毎に一度)
// check_state_interval * trans_interval が、時間単位のデータ送信インターバル
Config.trans_interval = 5; // 5000ms

// 暫定QoE値取得頻度(データ送信の指定回数毎に一度)
// trans_interval x latest_qoe_update が、時間単位の暫定QoE値取得インターバル
Config.latest_qoe_update = 1; // 5000ms

// 暫定QoE値を取得開始するまでのデータ送信回数
// 暫定QoE値を最初に取得可能になるできると予想される時間は、 動画視聴開始から10秒前後
// trans_interval(5) * send_data_count_for_qoe(3) * check_state_interval(1000)
Config.send_data_count_for_qoe = 2; // 10000ms

// 短い間隔(check_state_interval)で最新QoE値を取得し始めるカウント
// 最新QoE値が取得することができると予想される時間の何回前から短いインターバルで問い合わせに行うかを設定する
// (trans_interval(5) * send_data_count_for_qoe(3) - prev_count_for_qoe(2)) * check_state_interval(1000)
Config.prev_count_for_qoe = 3; // 7000ms から 1000ms 毎に問い合わせ

// 短い間隔(check_state_interval)で最新QoE値を取得の試行する最大カウント
// (trans_interval(5) * send_data_count_for_qoe(3) - prev_count_for_qoe(2) + max_count_for_qoe) * check_state_interval(1000)
// 最新QoE値が取得できた場合、最大カウントまで到達したが値が取得できなかった場合、いずれかの場合であっても
// 以降は latest_qoe_update * trans_interval * check_state_interval ms毎の問い合わせになる
Config.max_count_for_qoe = 20; // 27000ms

// QoE制御
Config.quality_control = false;

if (Config.isVMBrowser()) {
  window.sodium.storage.local.get('session', ({ session }) => {
    Config.session = session || {};
  });
  window.sodium.storage.local.get('settings', ({ settings }) => {
    Config.settings = settings || {};
  });
  window.sodium.storage.local.get('transfer_size', ({ transfer_size }) => {
    Config.transfer_size = transfer_size || {};
  });
  window.sodium.storage.local.get('peak_time_limit', ({ peak_time_limit }) => {
    Config.peak_time_limit = peak_time_limit || {};
  });
}

const currentScript = Config.isVMBrowser()
  ? null
  : document.querySelector(`script[type="module"][src="${import.meta.url}"]`);

if (currentScript !== null) {
  // content_scriptsによって書き込まれるオブジェクトのデシリアライズ
  const session = Object.fromEntries(new URLSearchParams(currentScript.dataset.session));

  Config.session = {
    ...session,
    expires: Number(session.expires),
  };

  Config.settings = JSON.parse(currentScript.dataset.settings);
  Config.transfer_size = JSON.parse(currentScript.dataset.transfer_size);
  Config.peak_time_limit = JSON.parse(currentScript.dataset.peak_time_limit);
}

// デフォルトのセッション保持期間
Config.session_expires_in = 2592e6; //= 30日間 (うるう秒は考慮しない)

// スループット保持するバッファのサイズ
Config.max_throughput_history_size = 100;

// 送信データ長の警告サイズ(現状では送信を行うが警告を出す。送信をやめるかどうかは検討)
Config.max_send_size = 2000000; // 2M
