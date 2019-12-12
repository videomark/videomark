// eslint-disable-next-line import/no-unresolved
import Config from "./modules/Config";
import UI from "./modules/UI";
import SessionData from "./modules/SessionData";
import VideoData from "./modules/VideoData";
import YouTubeTypeHandler from "./modules/YouTubeTypeHandler";
import ParaviTypeHandler from "./modules/ParaviTypeHandler";

(async () => {
  // --- support --- //
  if (/*  !performance || */ !document || !window) {
    // eslint-disable-next-line no-console
    console.warn("VIDEOMARK: NOT supported");
    return;
  }

  /*
  // --- resource buffer --- //
  let res_buf_full_cnt = 0;

  performance.onresourcetimingbufferfull = () => {
    // eslint-disable-next-line no-console
    console.warn('VIDEOMARK: Resource Timing Buffer is FULL!');
    if (performance.setResourceTimingBufferSize instanceof Function) {
      // eslint-disable-next-line no-console
      console.log('VIDEOMARK: ... Performance.setResourceTimingBufferSize() = supported');
      res_buf_full_cnt += 1;
      performance.setResourceTimingBufferSize(res_buf_full_cnt * Config.get_DEFAULT_RESOURCE_BUFFER_SIZE());
    } else {
      // eslint-disable-next-line no-console
      console.warn('VIDEOMARK: ... Performance.setResourceTimingBufferSize() = NOT supported');
    }
  };
  */

  // --- New Session --- //
  const session = new SessionData();
  await session.init();

  // --- UI --- //
  const ui = new UI(Config.get_ui_target());

  // --- YouTube Hook --- //
  await YouTubeTypeHandler.hook_youtube();

  // --- Paravi Hook --- //
  await ParaviTypeHandler.hook_paravi();

  // --- update video list --- //
  window.setInterval(() => {
    // video の検索と保持しているvideoの更新
    const elms = document.getElementsByTagName("video");
    session.set_video_elms(elms);
    // ビデオが利用できないとき (YouTube でのビデオ切替時やCM再生中などにも発生)
    if (!session.get_video_availability()) {
      ui.remove_element();
    }
  }, Config.get_search_video_interval());

  // --- update latest qoe view element --- //
  window.setInterval(() => {
    // --- update quality info --- //
    session.update_quality_info();

    if (!session.get_video_availability()) return;

    // --- show status  --- //
    const video = session.get_main_video();
    if (!(video instanceof VideoData)) return;
    ui.update_status({
      sessionId: session.get_session_id(),
      videoId: video.get_video_id()
    });
  }, Config.get_collect_interval());

  // --- main loop --- //
  session.start();
})();
