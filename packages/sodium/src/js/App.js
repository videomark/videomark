import Config from "./modules/Config";
import UI from "./modules/UI";
import SessionData from "./modules/SessionData";
import VideoData from "./modules/VideoData";
import { qualityStatus } from "./modules/Quality";
import YouTubeTypeHandler from "./modules/YouTubeTypeHandler";
import ParaviTypeHandler from "./modules/ParaviTypeHandler";
import IIJTypeHandler from "./modules/IIJTypeHandler";

const get_ui_target = () => {
  return Config.isMobileScreen() ? window.top : window;
};

const update_ui = state => {
  get_ui_target().postMessage({ type: "FROM_WEB_CONTENT", method: "update_ui", frame_url: window.location.href, state: state, qualityStatus: qualityStatus(state) }, "*");
};

const remove_ui = () => {
  get_ui_target().postMessage({ type: "FROM_WEB_CONTENT", method: "remove_ui", frame_url: window.location.href }, "*");
};

const remove_ui_all = () => {
  window.postMessage({ type: "FROM_WEB_CONTENT", method: "remove_ui", frame_url: window.location.href }, "*");
  window.top.postMessage({ type: "FROM_WEB_CONTENT", method: "remove_ui", frame_url: window.location.href }, "*");
};

(async () => {
  // --- support --- //
  if (!document || !window) {
    // eslint-disable-next-line no-console
    console.warn("VIDEOMARK: NOT supported");
    return;
  }

  let active_frame_url;
  let search_video_interval_id;
  let collect_interval_id;

  // --- UI event --- //
  window.addEventListener("message", event => {
    const data = (typeof event.data === "string") ? JSON.parse(event.data) : event.data;
    if (data.type !== "FROM_WEB_CONTENT" && data.type !== "FROM_ANDROID_UI") return;

    // 計測結果の更新がきたフレームをurlで記録する
    // ページ表示直後では、どのフレームに計測対象の動画があるかわからないので、計測結果の更新を待つことになる
    if (data.method === "update_ui") {
      active_frame_url = data.frame_url;
      ui.update_status(data.state, data.qualityStatus);
    }

    // 計測対象の動画があるフレームからのメッセージの場合だけ計測uiを消去する
    // 関係ないフレームもsession.get_video_availability()で動画がないと判定し、計測uiを消去させようとするが
    // 動画フレーム特定後は、関係ないフレームの状態監視は不要になるため停止させる
    if (data.method === "remove_ui") {
      if (active_frame_url === data.frame_url) {
        ui.remove_element();
      } else if (active_frame_url !== undefined) {
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

  // --- YouTube Hook --- //
  await YouTubeTypeHandler.hook_youtube();

  // --- Paravi Hook --- //
  await ParaviTypeHandler.hook_paravi();

  // --- IIJ Hook --- //
  await IIJTypeHandler.hook_iij();

  // --- update video list --- //
  search_video_interval_id = window.setInterval(() => {
    // video の検索と保持しているvideoの更新
    const elms = document.getElementsByTagName("video");
    session.set_video_elms(elms);
    // ビデオが利用できないとき (YouTube でのビデオ切替時やCM再生中などにも発生)
    const available = session.get_video_availability();
    Config.set_mobile_alive(available);
    if (!available) remove_ui();
  }, Config.get_search_video_interval());

  // --- update latest qoe view element --- //
  collect_interval_id = window.setInterval(() => {
    // --- update quality info --- //
    session.update_quality_info();

    if (!Config.get_ui_enabled()) return;
    if (!session.get_video_availability()) return;

    // --- show status  --- //
    const video = session.get_main_video();
    if (!(video instanceof VideoData)) return;

    update_ui({
      maxBitrate: video.max_bitrate,
      sessionId: session.get_session_id(),
      videoId: video.get_video_id()
    });
  }, Config.get_collect_interval());

  // --- main loop --- //
  session.start();
})();
