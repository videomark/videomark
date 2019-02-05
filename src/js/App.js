// eslint-disable-next-line import/no-unresolved
import uuidv4 from "uuid/v4";
import Config from "./modules/Config";
import UI from "./modules/UI";
import SessionData from "./modules/SessionData";

// --- New Session --- //
const session = new SessionData(uuidv4());

// --- UI --- //
const ui = new UI(document.body);

/**
 * video の検索と保持しているvideoの更新
 */
function video_search() {
  const video_elms = document.getElementsByTagName("video");
  session.set_video_elms(video_elms);
  // ビデオ要素がないとき (YouTube でのビデオ切替時などにも発生)
  if (session.get_video_length() === 0) {
    ui.remove_status();
  }
}

(() => {
  // --- support --- //
  if (/*  !performance || */ !document || !window) {
    // eslint-disable-next-line no-console
    console.warn("VIDEOMARK: NOT supported");
    return;
  }

  /*
  // --- resouce buffer --- //
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

  // eslint-disable-next-line no-console
  console.log(
    `VIDEOMARK: New Session start Session ID[${session.get_session_id()}]`
  );

  // --- video list --- //
  video_search();

  // --- update video list --- //
  window.setInterval(() => {
    // --- update video list --- //
    video_search();
  }, Config.get_search_video_interval());

  // --- initialize latest qoe view element (style) --- //
  ui.insert_style();

  // --- update latest qoe view element (style) --- //
  window.setInterval(() => {
    // --- update quality info --- //
    session.update_quality_info();

    if (session.get_video_length() === 0) return;

    // --- show status  --- //
    const [total, dropped, qoe] = session.get_video_status();
    ui.update_status(total, dropped, qoe);
  }, Config.get_collect_interval());

  // --- send to fluentd --- //
  window.setInterval(() => session.send(), Config.get_trans_interval());
})();
