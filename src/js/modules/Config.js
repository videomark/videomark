/**
 * 動作設定
 */
export default class Config {
  static is_mobile() {
    return Boolean(window.sodium);
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

  static get_ui_observer() {
    const { host } = new window.URL(window.location.href);
    if (host === "m.youtube.com") {
      return this.ui.m_youtube_com.observe;
    }
    return null;
  }

  static get_ui_target() {
    const { host } = new window.URL(window.location.href);
    let result = "";
    if (host === "m.youtube.com") {
      result = this.ui.m_youtube_com.target;
    } else if (host.includes("youtube")) {
      result = this.ui.youtube.target;
    } else if (host.includes("tver")) {
      result = this.ui.tver.target;
    } else if (host.includes("paravi")) {
      result = this.ui.paravi.target;
    }

    return result;
  }

  static get_style() {
    const { host } = new window.URL(window.location.href);
    let result = "";
    if (host === "m.youtube.com") {
      result = this.ui.m_youtube_com.style;
    } else if (host.includes("youtube")) {
      result = this.ui.youtube.style;
    } else if (host.includes("paravi")) {
      result = this.ui.paravi.style;
    } else if (host.includes("tver")) {
      result = this.ui.tver.style;
    }

    return result;
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

  static async get_default_session() {
    if (window.sodium === undefined) return this.session;

    const { session } = await new Promise(resolve =>
      window.sodium.storage.local.get("session", resolve)
    );
    return session;
  }

  static async get_settings() {
    if (window.sodium === undefined) return this.settings;

    const { settings } = await new Promise(resolve =>
      window.sodium.storage.local.get("settings", resolve)
    );
    return settings;
  }

  static is_quality_control() {
    return Config.quality_control;
  }
}

// playback quality の取得インターバル(ミリ秒単位)
Config.collect_interval = 1 * 1000;

// videoタグ検索インターバル(ミリ秒単位)
Config.search_video_interval = 1 * 1000;

// fluentd サーバーのエンドポイント
Config.fluent_url = FLUENT_URL;

// Sodium Server のエンドポイント
Config.sodium_server_url = SODIUM_SERVER_URL;

// 暫定QoE値保持数
Config.num_of_latest_qoe = 20;

// ログ保持数
Config.max_log = 100;

// 記録するイベントの種類のリスト
Config.event_type_names = [
  "play",
  "pause",
  "seeking",
  "seeked",
  "ended",
  "stalled",
  "progress",
  "waiting",
  "canplay"
];

// 表示用
// 動画サービスのプレイヤーでコントローラが表示されるタイミングだけ表示
// :hover 疑似クラスなどでなく、表示タイミングはプレイヤー実装に委ねる
Config.ui = {
  id: "__videomark_ui"
};

// m.youtube.com では #player-control-overlay のclassを監視して表示/非表示を切り替える
// see https://github.com/webdino/sodium/issues/295
Config.ui.m_youtube_com = {
  /** @param {Function} callback 監視対象が変更されたとき呼ばれる関数。引数trueならフェードイン、それ以外フェードアウト。 */
  observe(callback) {
    const target = document.querySelector("#player-control-overlay");
    if (target == null) {
      callback(null);
      return;
    }

    // NOTE: 停止時やタップしたとき.fadeinが存在する
    const hasFadein = () => target.classList.contains("fadein");
    const observer = new MutationObserver(() => {
      callback(hasFadein());
    });

    observer.observe(target, {
      // NOTE: classが変更されたとき
      attributeFilter: ["class"]
    });

    callback(hasFadein());
  },
  target: "#player-container-id",
  style: `#${Config.ui.id} {
  position: absolute;
  top: 12px;
  left: 12px;
  transition: 200ms;
}

:not(.fadein)#${Config.ui.id} {
  opacity: 0;
}`
};

// YouTube ではコンロール非表示時に #movie_player に .ytp-autohide 付与
Config.ui.youtube = {
  target: "#movie_player",
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
}`
};

// TVer ではユーザ操作を見て .vjs-user-(in)active を .video-js に付与
// .vjs-user-inactive になるより先にマウスホバー解除で .not-hover 付与
// そのタイミングでは .vjs-user-active でもコントロールが隠れることに注意
// .video-js 要素は複数あるので #playerWrapper 配下のものに限定する
Config.ui.tver = {
  target: "#playerWrapper > .video-js",
  style: `#${Config.ui.id} {
  position: absolute;
  z-index: 1000001;
  top: calc(12px + 2em);
  left: 12px;
  transition: 1.0s cubic-bezier(0.4, 0.09, 0, 1.6);
}
.vjs-user-inactive > #${Config.ui.id},
.not-hover > #${Config.ui.id} {
  opacity: 0;
}`
};

// Paravi ではコントロール非表示時に .(in)active を .controls に付与
// .controls 要素は複数あるので .paravi-player 配下のものに限定する
Config.ui.paravi = {
  target: ".paravi-player .controls",
  style: `#${Config.ui.id} {
  position: absolute;
  z-index: 1000001;
  top: 12px;
  left: 12px;
  transition: .5s cubic-bezier(0.4, 0.09, 0, 1.6);
}
.inactive > #${Config.ui.id} {
  opacity: 0;
}`
};

// デフォルトResourceTiminingAPIのバッファサイズ
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

// content_scriptsによって書き込まれるオブジェクトのデシリアライズ
if (window.sodium === undefined && document.currentScript != null) {
  const session = new URLSearchParams(document.currentScript.dataset.session);
  Config.session = {
    id: session.get("id"),
    expires: Number(session.get("expires"))
  };

  Config.settings = [
    ...new URLSearchParams(document.currentScript.dataset.settings)
  ].reduce(
    (obj, [key, value]) =>
      Object.assign(obj, {
        [key]: Number(value)
      }),
    {}
  );
}
