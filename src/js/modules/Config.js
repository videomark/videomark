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

  static get_trans_interval() {
    return this.trans_interval;
  }

  static get_search_video_interval() {
    return this.search_video_interval;
  }

  static get_latest_qoe_update() {
    return this.latest_qoe_update;
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
}

// playback quality の取得インターバル(ミリ秒単位)
Config.collect_interval = 1 * 1000;

// 送信インターバル(ミリ秒単位)
Config.trans_interval = 5 * 1000;

// videoタグ検索インターバル(ミリ秒単位)
Config.search_video_interval = 1 * 1000;

// 暫定QoE値取得(回数) Config.trans_interval x この値 が暫定QoE値取得インターバルになる
Config.latest_qoe_update = 2;

// fluent-d サーバーのエンドポイント
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
