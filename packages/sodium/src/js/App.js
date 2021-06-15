import Config from "./modules/Config";
import UI from "./modules/UI";
import { jsonParseSafe } from "./modules/Utils";
import SessionData from "./modules/SessionData";
import VideoData from "./modules/VideoData";
import { qualityStatus } from "./modules/Quality";
import YouTubeTypeHandler from "./modules/YouTubeTypeHandler";
import ParaviTypeHandler from "./modules/ParaviTypeHandler";
import IIJTypeHandler from "./modules/IIJTypeHandler";

const get_ui_target = () => {
  return Config.isMobileScreen() ? window.top : window;
};

// モバイル表示のyoutubeで、動画ページからトップなどに移動すると
// 計測uiが表示されたままになってしまうのを回避するため
// window.topの場合、active_frame_idはurlではなく固有のidにする
const get_frame_id = () => {
  return window.top === window ? "#top" : window.location.href;
};

const update_ui = state => {
  const status = state && state.sessionId && state.videoId ? qualityStatus(state) : {};
  const ui_target = get_ui_target();
  const message = { type: "FROM_WEB_CONTENT", method: "update_ui", frame_id: get_frame_id(), state: state, qualityStatus: status };
  ui_target.postMessage(message, "*");
  if (window.top !== ui_target) window.top.postMessage(message, "*");
};

const remove_ui = () => {
  get_ui_target().postMessage({ type: "FROM_WEB_CONTENT", method: "remove_ui", frame_id: get_frame_id() }, "*");
};

const update_alive = (alive) => {
  get_ui_target().postMessage({ type: "FROM_WEB_CONTENT", method: "update_alive", frame_id: get_frame_id(), alive: alive }, "*");
};

const remove_ui_all = () => {
  window.postMessage({ type: "FROM_WEB_CONTENT", method: "remove_ui", frame_id: get_frame_id() }, "*");
  window.top.postMessage({ type: "FROM_WEB_CONTENT", method: "remove_ui", frame_id: get_frame_id() }, "*");
};

(async () => {
  // --- support --- //
  if (!document || !window) {
    // eslint-disable-next-line no-console
    console.warn("VIDEOMARK: NOT supported");
    return;
  }

  // --- YouTube Hook --- //
  await YouTubeTypeHandler.hook_youtube();

  // --- Paravi Hook --- //
  await ParaviTypeHandler.hook_paravi();

  // --- IIJ Hook --- //
  await IIJTypeHandler.hook_iij();

  // 前回までの計測uiの表示状態をタブ単位で保持しているため
  // 表示設定をあらかじめ読み込んでおく
  await Config.readDisplayOnPlayerSetting();
  await Config.readPlatformInfo();

  let active_frame_id;
  let search_video_interval_id;
  let collect_interval_id;

  // --- UI event --- //
  window.addEventListener("message", event => {
    const data = (typeof event.data === "string") ? jsonParseSafe(event.data) : event.data;
    if (!["FROM_WEB_CONTENT", "FROM_ANDROID_UI", "FROM_EXTENSION_POPUP"].includes(data.type)) return;

    if (data.method === "update_ui") {
      ui.update_status(data.state, data.qualityStatus);
    }

    // fodの通常表示でも無関係なフレームの監視をやめさせて、再生中を正しく判定させるため
    // 計測中のフレームを全フレームに伝達する
    if (data.method === "notice_active_frame") {
      active_frame_id = data.frame_id;
      if (window.top === window) {
        Array.from(window.frames).forEach(frame => {
          frame.postMessage({ type: "FROM_WEB_CONTENT", method: "notice_active_frame", frame_id: data.frame_id }, "*");
        });
      }
    }

    // 計測対象の動画があるフレームからのメッセージの場合だけ計測uiを消去する
    // 関係ないフレームもsession.get_video_availability()で動画がないと判定し、計測uiを消去させようとするが
    // 動画フレーム特定後は、関係ないフレームの状態監視は不要になるため停止させる
    if (data.method === "remove_ui") {
      if (active_frame_id === data.frame_id) {
        ui.remove_element();
      } else if (active_frame_id !== undefined) {
        event.source.postMessage({ type: data.type, method: "clear_interval" }, "*");
      }
    }

    if (data.method === "display_ui") {
      Config.set_ui_enabled(data.enabled);
      if (session.get_video_availability()) {
        if (data.enabled) {
          update_ui();
        } else {
          remove_ui();
        }
      }

      // androidのメニューからではwindow.topにしかメッセージを送れないので、フレームにも伝達させる
      if (window.top === window) {
        Array.from(window.frames).forEach(frame => {
          frame.postMessage({ type: data.type, method: data.method, enabled: data.enabled }, "*");
        });
      }
    }

    // 計測中のフレームは計測uiの表示制御を行う
    // それ以外のフレームは監視ループは停止させられる
    if (data.method === "update_alive") {
      if (active_frame_id === data.frame_id) {
        Config.set_alive(data.alive);
        // ビデオが利用できないとき (YouTube でのビデオ切替時やCM再生中などにも発生)
        if(!data.alive) ui.remove_element();
      } else if (active_frame_id !== undefined) {
        event.source.postMessage({ type: data.type, method: "clear_interval" }, "*");
      }
    }

    // 状態監視を停止する
    if (data.method === "clear_interval") {
      window.clearInterval(search_video_interval_id);
      window.clearInterval(collect_interval_id);
      if (Config.isMobile()) screen.orientation.removeEventListener("change", remove_ui_all);
    }
  });

  if (Config.isMobile()) {
    // 再表示は次回更新時を待つ
    screen.orientation.addEventListener("change", remove_ui_all);
  }

  // --- New Session --- //
  const session = new SessionData();
  await session.init();

  // --- UI --- //
  const platform = Config.get_video_platform();
  const ui = new UI(Config.get_ui_target(platform), Config.get_style(platform));

  // --- update video list --- //
  search_video_interval_id = window.setInterval(() => {
    // video の検索と保持しているvideoの更新
    const elms = document.getElementsByTagName("video");
    session.set_video_elms(elms);
    update_alive(session.get_video_availability());
  }, Config.get_search_video_interval());

  // --- update latest qoe view element --- //
  collect_interval_id = window.setInterval(() => {
    // --- update quality info --- //
    if (!session.get_video_availability()) return;
    session.update_quality_info();

    // --- show status  --- //
    const video = session.get_main_video();
    if (!(video instanceof VideoData)) return;

    // 計測結果の更新があるフレームを記録する
    // ページ表示直後では、どのフレームに計測対象の動画があるかわからないので、計測結果の更新を待つことになる
    const frame_id = get_frame_id();
    if (active_frame_id !== frame_id)
      window.top.postMessage({ type: "FROM_WEB_CONTENT", method: "notice_active_frame", frame_id: frame_id }, "*");

    if (!Config.get_ui_enabled()) return;
    update_ui({
      maxBitrate: video.max_bitrate,
      sessionId: session.get_session_id(),
      videoId: video.get_video_id()
    });
  }, Config.get_collect_interval());

  // --- main loop --- //
  session.start();
})();
