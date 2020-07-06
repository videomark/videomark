import Config from "./modules/Config";
import UI from "./modules/UI";
import SessionData from "./modules/SessionData";
import VideoData from "./modules/VideoData";
import YouTubeTypeHandler from "./modules/YouTubeTypeHandler";
import ParaviTypeHandler from "./modules/ParaviTypeHandler";
import IIJTypeHandler from "./modules/IIJTypeHandler";

(async () => {
  // --- support --- //
  if (!document || !window) {
    // eslint-disable-next-line no-console
    console.warn("VIDEOMARK: NOT supported");
    return;
  }

  // --- New Session --- //
  const session = new SessionData();
  await session.init();

  // --- UI --- //
  const platform = Config.get_video_platform();
  const ui = new UI(
    Config.get_ui_target(platform),
    Config.get_style(platform),
    Config.get_ui_observer(platform)
  );

  // --- YouTube Hook --- //
  await YouTubeTypeHandler.hook_youtube();

  // --- Paravi Hook --- //
  await ParaviTypeHandler.hook_paravi();

  // --- IIJ Hook --- //
  await IIJTypeHandler.hook_iij();

  window.addEventListener("message", event => {
    const data = (typeof event.data === "string") ? JSON.parse(event.data) : event.data;
    if (data.type !== "FROM_WEB_CONTENT" && data.type !== "FROM_ANDROID_UI") return;

    if (data.method == "display_ui") {
      Config.set_ui_enabled(data.enabled);
      if (session.get_video_availability()) {
        if (data.enabled) {
          ui.update_status({});
        } else {
          ui.remove_element();
        }
      }
    }
  });

  // --- update video list --- //
  window.setInterval(() => {
    // video の検索と保持しているvideoの更新
    const elms = document.getElementsByTagName("video");
    session.set_video_elms(elms);
    // ビデオが利用できないとき (YouTube でのビデオ切替時やCM再生中などにも発生)
    const available = session.get_video_availability();
    Config.set_mobile_alive(available);
    if (!available) {
      ui.remove_element();
    }
  }, Config.get_search_video_interval());

  // --- update latest qoe view element --- //
  window.setInterval(() => {
    // --- update quality info --- //
    session.update_quality_info();

    if (!Config.get_ui_enabled()) return;
    if (!session.get_video_availability()) return;

    // --- show status  --- //
    const video = session.get_main_video();
    if (!(video instanceof VideoData)) return;
    ui.update_status({
      maxBitrate: video.max_bitrate,
      sessionId: session.get_session_id(),
      videoId: video.get_video_id()
    });
  }, Config.get_collect_interval());

  // --- main loop --- //
  session.start();
})();
