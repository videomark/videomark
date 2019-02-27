/**
 * 動作設定
 */
export default class Config {
  static is_mobile() {
    return window.sodium;
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

  static get_style() {
    const { host } = new window.URL(window.location.href);
    let result = "";
    if (host.includes("youtube")) {
      result = this.style.youtube;
    } else if (host.includes("paravi")) {
      result = this.style.paravi;
    } else if (host.includes("tver")) {
      result = this.style.tver;
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

// QoE値表示用のstyle
// 動画サービスのプレイヤーでコントローラが表示されるタイミングだけQoE値を表示
// :hover 疑似クラスなどでなく、表示タイミングはプレイヤー実装に委ねる
// コントローラ表示時または非表示時にクラスが付与される要素に疑似要素を追加する
Config.style = {};

// YouTube ではコンロール非表示時に #movie_player に .ytp-qutohide 付与
Config.style.youtube = `#movie_player:after {
    position: absolute;
    z-index: 1000001;
    top: 12px;
    left: 12px;
    background: rgba(0, 161, 255, 0.5);
    padding: 5px 10px;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    line-height: 1;
    transition: .5s cubic-bezier(0.4, 0.09, 0, 1.6);
}

#movie_player.ytp-fullscreen:after {
    top: calc(20px + 2em);
}

#movie_player.ytp-autohide:after {
    opacity: 0;
}`;

// TVer ではユーザ操作を見て .vjs-user-(in)active を .video-js に付与
// .vjs-user-inactive になるより先にマウスホバー解除で .not-hover 付与
// そのタイミングでは .vjs-user-active でもコントロールが隠れることに注意
// .video-js 要素は複数あるので #playerWrapper 配下のものに限定する
Config.style.tver = `#playerWrapper > .video-js:after {
    position: absolute;
    z-index: 1000001;
    top: calc(12px + 2em);
    left: 12px;
    background: rgba(0, 161, 255, 0.5);
    padding: 5px 10px;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    line-height: 1;
    transition: 1.0s cubic-bezier(0.4, 0.09, 0, 1.6);
}
#playerWrapper > .video-js.vjs-user-active:after {
    opacity: 1;
}
#playerWrapper > .video-js.vjs-user-inactive:after,
#playerWrapper > .video-js.not-hover:after {
    opacity: 0;
}`;

// Paravi ではコントロール非表示時に .(in)active を .controls に付与
// .controls 要素は複数あるので .paravi-player 配下のものに限定する
Config.style.paravi = `.paravi-player .controls:after {
    position: absolute;
    z-index: 1000001;
    top: 12px;
    left: 12px;
    background: rgba(0, 161, 255, 0.5);
    padding: 5px 10px;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    line-height: 1;
    transition: .5s cubic-bezier(0.4, 0.09, 0, 1.6);
}
.paravi-player .controls:active:after {
    opacity: 1;
}
.paravi-player .controls.inactive:after {
    opacity: 0;
}`;

// デフォルトResourceTiminingAPIのバッファサイズ
Config.DEFAULT_RESOURCE_BUFFER_SIZE = 150;

// 状態監視インターバル(ミリ秒)
Config.check_state_interval = 1 * 1000;

// 送信インターバル(回数)
// check_state_interval * trans_interval が、時間単位のデータ送信インターバル
Config.trans_interval = 5; // 5000ms

// 暫定QoE値取得(回数)
// trans_interval x latest_qoe_update が、時間単位の暫定QoE値取得インターバル
Config.latest_qoe_update = 2; // 10000ms

// 最新QoE値が取得できるまでのデータ送信回数
// 最新QoE値が取得することができると予想される時間は、 動画視聴開始から15秒後
// trans_interval(5) * send_data_count_for_qoe(3) * check_state_interval(1000)
Config.send_data_count_for_qoe = 3; // 15000ms

// 短い間隔(check_state_interval)で最新QoE値を取得し始めるカウント
// 最新QoE値が取得することができると予想される時間の何回前から短いインターバルで問い合わせに行うかを設定する
// (trans_interval(5) * send_data_count_for_qoe(3) - prev_count_for_qoe(2)) * check_state_interval(1000)
// 13000ms 後から 1000msごとに問い合わせを行う
Config.prev_count_for_qoe = 2; // 13000ms

// 短い間隔(check_state_interval)で最新QoE値を取得の試行する最大カウント
// (trans_interval(5) * send_data_count_for_qoe(3) - prev_count_for_qoe(2) + max_count_for_qoe) * check_state_interval(1000)
// 最新QoE値が取得できた場合、最大カウントまで到達したが値が取得できなかった場合、いずれかの場合であっても
// 以降は latest_qoe_update * trans_interval * check_state_interval の10000ms毎の問い合わせになる
Config.max_count_for_qoe = 20; // 33000ms
