/* eslint-disable no-use-before-define */

import Config from './modules/Config';
import IIJTypeHandler from './modules/IIJTypeHandler';
import LiveStatsLog from './modules/LiveStatsLog';
import Overlay from './modules/Overlay';
import { getLatestStats } from './modules/Quality';
import SessionData from './modules/SessionData';
import { getDataFromContentJs, jsonParseSafe } from './modules/Utils';
import YouTubeTypeHandler from './modules/YouTubeTypeHandler';

const get_ui_target = () => (Config.isMobileScreen() ? window.top : window);
// モバイル表示のyoutubeで、動画ページからトップなどに移動すると
// 計測uiが表示されたままになってしまうのを回避するため
// window.topの場合、active_frame_idはurlではなく固有のidにする
const get_frame_id = () => (window.top === window ? '#top' : window.location.href);

/**
 * @param {VideoPlaybackInfo} [detail]
 */
const update_ui = (detail) => {
  get_ui_target().postMessage(
    {
      type: 'FROM_WEB_CONTENT',
      method: 'update_ui',
      frame_id: get_frame_id(),
      detail,
    },
    '*',
  );
};

const remove_ui_all = () => {
  window.postMessage(
    { type: 'FROM_WEB_CONTENT', method: 'remove_ui', frame_id: get_frame_id() },
    '*',
  );
  window.top.postMessage(
    { type: 'FROM_WEB_CONTENT', method: 'remove_ui', frame_id: get_frame_id() },
    '*',
  );
};

(async () => {
  // --- support --- //
  if (!document || !window) {
    console.warn('VIDEOMARK: NOT supported');

    return;
  }

  // --- YouTube Hook --- //
  await YouTubeTypeHandler.hook_youtube();

  // --- IIJ Hook --- //
  await IIJTypeHandler.hook_iij();

  // 前回までの計測uiの表示状態をタブ単位で保持しているため
  // 表示設定をあらかじめ読み込んでおく
  await Config.readDisplayOnPlayerSetting();
  await Config.readPlatformInfo();

  let active_frame_id;
  let mainUpdaterIntervalId;

  // --- UI event --- //
  window.addEventListener('message', (event) => {
    const data = typeof event.data === 'string' ? jsonParseSafe(event.data) : event.data;

    if (!['FROM_WEB_CONTENT', 'FROM_ANDROID_UI', 'FROM_EXTENSION_POPUP'].includes(data.type)) {
      return;
    }

    // fodの通常表示でも無関係なフレームの監視をやめさせて、再生中を正しく判定させるため
    // 計測中のフレームを全フレームに伝達する
    if (data.method === 'notice_active_frame') {
      active_frame_id = data.frame_id;

      if (window.top === window) {
        Array.from(window.frames).forEach((frame) => {
          frame.postMessage(
            {
              type: 'FROM_WEB_CONTENT',
              method: 'notice_active_frame',
              frame_id: data.frame_id,
            },
            '*',
          );
        });
      }
    }

    if (data.method === 'update_ui') {
      /** @type {{ detail?: VideoPlaybackInfo }} */
      const { detail } = data;

      // オーバーレイの表示制御
      if (Config.get_ui_enabled()) {
        overlay.update_status(detail);
      }

      Config.updatePlaybackInfo(detail);

      // 計測中のフレームは計測uiの表示制御を行う
      // それ以外のフレームは監視ループは停止させられる
      if (active_frame_id === data.frame_id) {
        // ビデオが利用できないとき (YouTube でのビデオ切替時やCM再生中などにも発生)
        if (!detail) {
          overlay.remove_element();
        }
      } else if (active_frame_id !== undefined) {
        event.source.postMessage({ type: data.type, method: 'clear_interval' }, '*');
      }
    }

    // 計測対象の動画があるフレームからのメッセージの場合だけ計測uiを消去する
    // 関係ないフレームもsession.getActiveVideo()で動画がないと判定し、計測uiを消去させようとするが
    // 動画フレーム特定後は、関係ないフレームの状態監視は不要になるため停止させる
    if (data.method === 'remove_ui') {
      if (active_frame_id === data.frame_id) {
        overlay.remove_element();
      } else if (active_frame_id !== undefined) {
        event.source.postMessage({ type: data.type, method: 'clear_interval' }, '*');
      }
    }

    // 状態監視を停止する
    if (data.method === 'clear_interval') {
      window.clearInterval(mainUpdaterIntervalId);

      if (Config.isMobile()) {
        window.screen.orientation.removeEventListener('change', remove_ui_all);
      }
    }
  });

  if (Config.isMobile()) {
    // 再表示は次回更新時を待つ
    window.screen.orientation.addEventListener('change', remove_ui_all);
  }

  // --- New Session --- //
  const session = new SessionData();

  await session.init();

  // --- UI --- //
  const platform = Config.get_video_platform();
  const locale = await getDataFromContentJs('ui_locale');
  const overlay = new Overlay(locale, Config.get_ui_target(platform), Config.get_style(platform));
  const liveStatsLog = new LiveStatsLog();

  /**
   * 監視中の動画リストとオーバーレイ UI の更新。
   */
  mainUpdaterIntervalId = window.setInterval(() => {
    // video の検索と保持している video リストの更新
    session.set_video_elms(document.querySelectorAll('video'));

    const video = session.getActiveVideo();

    if (!video) {
      update_ui();

      return;
    }

    session.update_quality_info();

    // 計測結果の更新があるフレームを記録する
    // ページ表示直後では、どのフレームに計測対象の動画があるかわからないので、計測結果の更新を待つことになる
    const frame_id = get_frame_id();

    if (active_frame_id !== frame_id) {
      window.top.postMessage(
        {
          type: 'FROM_WEB_CONTENT',
          method: 'notice_active_frame',
          frame_id,
        },
        '*',
      );
    }

    const sessionId = session.get_session_id();
    const videoId = video.get_video_id();
    const latestStats = getLatestStats({ sessionId, videoId });
    const statsLog = liveStatsLog.update({ videoId, latestStats });

    update_ui({
      sessionId,
      videoId,
      video: {
        url: video.get_url(),
        title: video.get_title(),
        thumbnail: video.get_thumbnail(),
      },
      latestStats,
      statsLog,
    });
  }, Config.mainUpdaterInterval);

  // --- main loop --- //
  session.start();
})();
