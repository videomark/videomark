// eslint-disable-next-line import/no-unresolved
import uuidv4 from "uuid/v4";
// eslint-disable-next-line import/no-unresolved
import msgpack from "msgpack-lite";

import Config from "./Config";
import ResourceTiming from "./ResourceTiming";
import VideoData from "./VideoData";
import { useStorage } from "./Storage";
import { saveTransferSize, underQuotaLimit, saveQuotaLimitStarted, fetchAndStorePeakTimeLimit, underPeakTimeLimit, stopPeakTimeLimit } from "./StatStorage";
import { version } from "../../../package.json";

async function set_max_bitrate(new_video) {
  const bitrate_control = Config.get_bitrate_control();
  const quota_bitrate = Config.get_quota_bitrate();
  if (quota_bitrate) saveQuotaLimitStarted(new Date().getTime());

  let bitrate;
  if (bitrate_control && quota_bitrate) bitrate = Math.min(bitrate_control, quota_bitrate);
  else bitrate = bitrate_control || quota_bitrate;
  let resolution = Config.get_resolution_control();

  const peak_time_limit = await fetchAndStorePeakTimeLimit();
  if (peak_time_limit) {
    bitrate    = Math.min(bitrate,    peak_time_limit.bitrate);
    resolution = Math.min(resolution, peak_time_limit.resolution);
  }

  if (bitrate_control || quota_bitrate || resolution || peak_time_limit) new_video.set_max_bitrate(bitrate, resolution);
  else if(underQuotaLimit() || underPeakTimeLimit()) {
      new_video.set_default_bitrate();
      saveQuotaLimitStarted(undefined);
      stopPeakTimeLimit();
  }
}

class MainVideoChangeException extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MainVideoChangeException);
    }

    this.name = "MainVideoChangeException";
  }
}

export default class SessionData {
  constructor() {
    this.version = version;
    this.startTime = 0;
    this.endTime = 0;
    this.userAgent =
      window &&
      (window.sodium ? window.sodium.userAgent : window) &&
      (window.navigator ? window.navigator.userAgent : "");
    this.appVersion = this.userAgent.substr(this.userAgent.indexOf("/") + 1);
    this.sequence = 0;
    this.video = [];
    this.latest_qoe_update_count = 0;
    this.hostToIp = {};
    this.resource = new ResourceTiming();
  }

  async init() {
    const settings = Config.get_settings();
    let session = Config.get_default_session();
    if (
      session === undefined ||
      settings === undefined ||
      !(Date.now() < session.expires)
    ) {
      const expiresIn =
        settings === undefined ? NaN : Number(settings.expires_in);
      session = {
        id: uuidv4(),
        expires:
          Date.now() +
          (Number.isFinite(expiresIn)
            ? expiresIn
            : Config.get_default_session_expires_in())
      };
      if (Config.is_mobile()) {
        window.sodium.storage.local.set({ session });
      } else {
        window.postMessage(
          {
            type: "FROM_SODIUM_JS",
            method: "set_session",
            ...session
          },
          "*"
        );
      }
    }

    this.session_id = session.id;
    // eslint-disable-next-line no-console
    console.log(`VIDEOMARK: New Session start Session ID[${this.session_id}]`);

    this.locationIp();
    this.altSessionMessage();
  }

  // eslint-disable-next-line camelcase
  get_session_id() {
    return this.session_id;
  }

  /**
   * 計測対象のvideo
   */
  // eslint-disable-next-line camelcase
  get_main_video() {
    return this.video.find(e => e.is_main_video());
  }

  /**
   * videoの利用可否
   */
  // eslint-disable-next-line camelcase
  get_video_availability() {
    // eslint-disable-next-line camelcase
    const main_video = this.get_main_video();
    // eslint-disable-next-line camelcase
    if (main_video === undefined) return false;
    return main_video.is_available();
  }

  /**
   * 各videoのクオリティ情報の更新
   */
  // eslint-disable-next-line camelcase
  update_quality_info() {
    this.video.forEach(e => e.update());
  }

  /**
   * videoリストの更新
   * @param {HTMLCollection} elms
   */
  // eslint-disable-next-line camelcase
  set_video_elms(elms) {
    Array.prototype.forEach.call(elms, elm => {
      if (!this.video.find(e => e.video_elm === elm)) {
        // eslint-disable-next-line camelcase
        const video_id = uuidv4();
        try {
          // eslint-disable-next-line camelcase
          const new_video = new VideoData(elm, video_id);
          new_video.read_settings();
          /* eslint-disable no-console */
          console.log(`VIDEOMARK: new video found uuid[${video_id}]`);
          set_max_bitrate(new_video);
          this.video.push(new_video);
        } catch (err) {
          // どのタイプでもない
        }
      }
    });
    const removing = this.video.filter(
      e =>
        !Array.prototype.find.call(elms, elm => elm === e.video_elm) ||
        !e.is_stay()
    );
    removing.forEach(e => {
      e.clear();
      this.video.splice(this.video.indexOf(e), 1);
    });
  }

  async start() {

    let mainVideo;
    let startTime;

    for (; ;) {

      // eslint-disable-next-line no-await-in-loop
      mainVideo = await this.waitMainVideo();

      console.log(`VIDEOMARK: STATE CHANGE found main video ${mainVideo.get_video_id()}`);

      try {

        // eslint-disable-next-line no-await-in-loop
        startTime = await this.waitPlay(mainVideo);

        console.log(`VIDEOMARK: STATE CHANGE play ${new Date(startTime)}`);

        // eslint-disable-next-line no-await-in-loop
        await this.playing(mainVideo);

      } catch (e) {
        if (e instanceof MainVideoChangeException)
          console.log(`VIDEOMARK: STATE CHANGE main video changed ${mainVideo.get_video_id()}`);
        else
          console.log(`VIDEOMARK: ${e}`);
      }
    }
  }

  async waitMainVideo() {

    return new Promise(resolve => {

      const timer = setInterval(() => {
        const mainVideo = this.get_main_video();
        if (!mainVideo) return;
        clearInterval(timer);
        resolve(mainVideo)
      }, Config.get_check_state_interval());
    });
  }

  async waitPlay(mainVideo) {

    return new Promise((resolve, reject) => {

      const timer = setInterval(() => {
        const startTime = mainVideo.get_start_time();
        if (mainVideo !== this.get_main_video()) reject(new MainVideoChangeException());
        if (startTime === -1) return;
        clearInterval(timer);
        resolve(startTime);
      }, Config.get_check_state_interval());
    });
  }

  async playing(mainVideo) {

    const qoeRequestStart =
      (Config.get_trans_interval() * Config.get_send_data_count_for_qoe() -
        Config.get_prev_count_for_qoe()) * Config.get_check_state_interval();

    let dataTimeoutId;
    let requestTimeoutId;

    try {

      /* データ送信 */
      dataTimeoutId = this.startDataTransaction(mainVideo, Config.get_trans_interval() * Config.get_check_state_interval());

      if (mainVideo.is_calculatable()) {

        /* QoE計算に必要なデータが送信されるまで待機 (5 * 2 - 3) * 1000 = 7000 ms */
        await new Promise(resolve => setTimeout(() => resolve(), qoeRequestStart))

        /* 最初の最新QoE値を取得 */
        const qoe = await this.waitFirstQoE(mainVideo, Config.get_max_count_for_qoe());
        if (qoe)
          console.log(`VIDEOMARK: STATE CHANGE latest qoe computed ${qoe}`);
        else
          console.log(`VIDEOMARK: STATE CHANGE latest qoe timeout`);

        /* QoE値問い合わせ */
        requestTimeoutId = this.startRequestTransaction(mainVideo,
          Config.get_trans_interval() * Config.get_latest_qoe_update() * Config.get_check_state_interval());
      }

      /* videoが切り替わるまで待機 */
      await new Promise((resolve) => {

        const timer = setInterval(() => {

          if (mainVideo !== this.get_main_video()) {
            clearInterval(timer);
            resolve();
          }
        }, Config.get_check_state_interval())
      })
    } finally {

      if (requestTimeoutId) clearTimeout(requestTimeoutId);
      if (dataTimeoutId) clearTimeout(dataTimeoutId);
    }
  }

  async waitFirstQoE(mainVideo, timeoutCount) {

    let qoe = null;
    let counter = 0;

    for (; !qoe && counter < timeoutCount; counter += 1) {
      if (mainVideo !== this.get_main_video()) throw new MainVideoChangeException();
      try {
        // eslint-disable-next-line no-await-in-loop
        qoe = await this.requestQoE(mainVideo);
      } catch (e) {
        console.error(`VIDEOMARK: ${e}`);
      }
      if (qoe) {
        mainVideo.add_latest_qoe({ date: Date.now(), qoe });
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(() => resolve(), Config.get_check_state_interval()))
    }

    return qoe;
  }

  startDataTransaction(mainVideo, interval) {
    return setTimeout(async () => {
      for (; mainVideo === this.get_main_video();) {
        if (mainVideo.is_available()) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await this.sendData(mainVideo);
          } catch (e) {
            console.error(`VIDEOMARK: ${e}`);
          }
          // eslint-disable-next-line no-await-in-loop
          await this.storeSession(mainVideo);
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => setTimeout(() => resolve(), interval))
      }
    });
  }

  startRequestTransaction(mainVideo, interval) {
    return setTimeout(async () => {
      for (; mainVideo === this.get_main_video();) {
        if (mainVideo.is_available()) {
          let qoe;
          try {
            // eslint-disable-next-line no-await-in-loop
            qoe = await this.requestQoE(mainVideo);
          } catch (e) {
            console.error(`VIDEOMARK: ${e}`);
          }
          if (qoe) mainVideo.add_latest_qoe({ date: Date.now(), qoe });
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => setTimeout(() => resolve(), interval));
      }
    });
  }

  async sendData(video) {

    const body = msgpack.encode(this.toJson(video));
    if (body.length > Config.get_max_send_size())
      console.warn(`VIDEOMARK: Too large payload packed body size is ${body.length}`);
    const ret = await fetch(Config.get_fluent_url(), {
      method: "POST",
      headers: {
        "Content-type": "application/msgpack"
      },
      body
    });
    if (!ret.ok) {
      throw new Error("fluent response was not ok.");
    }
  }

  async requestQoE(video) {
    const ret = await fetch(`${Config.get_sodium_server_url()}/latest_qoe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ids: {
          session_id: this.session_id,
          video_id: video.get_video_id()
        }
      })
    });
    if (!ret.ok) {
      throw new Error("SodiumServer(qoe) response was not ok.");
    }
    const json = await ret.json();
    const qoe = Number.parseFloat(json.qoe);
    return Number.isNaN(qoe) ? null : qoe;
  }

  // 未使用
  /*
  async requestRecommendBitrate(video) {
    const ret = await fetch(
      `${Config.get_sodium_server_url()}/recommend_bitrate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ids: {
            session_id: this.session_id,
            video_id: video.get_video_id()
          }
        })
      }
    );
    if (!ret.ok) {
      throw new Error("SodiumServer(tqapi) response was not ok.");
    }
    const json = await ret.json();
    const recommendBitrate = Number.parseFloat(json.recommendBitrate);
    return Number.isNaN(recommendBitrate) ? null : recommendBitrate;
  }
  */

  async storeSession(video) {
    const storage = useStorage({
      sessionId: this.session_id,
      videoId: video.get_video_id()
    });
    const [prevResource, resource] = this.resource.collect();
    await storage.save({
      user_agent: this.userAgent,
      location: this.alt_location || window.location.href,
      transfer_size: resource.transferSize,
      media_size: video.get_media_size(),
      domain_name: video.get_domain_name(),
      start_time: video.get_start_time(),
      end_time: -1,
      thumbnail: this.alt_thumbnail || video.get_thumbnail(),
      title: video.get_title(),
      calc: video.is_calculatable(),
      log: [
        ...(storage.cache.log || []).filter(a => !("qoe" in a)),
        ...video.get_latest_qoe(),
        {
          date: Date.now(),
          quality: {
            ...video.get_quality(),
            viewport: video.get_viewport(),
            resolution: video.get_resolution(),
            timing: video.get_timing()
          }
        }
      ]
        .sort(({ date: ad }, { date: bd }) => ad - bd)
        .slice(-Config.max_log)
    });

    await saveTransferSize(resource.transferSize - prevResource.transferSize);
  }

  /**
   * 送信データフォーマットに変換
   */
  toJson(video) {
    this.startTime = this.endTime;
    this.endTime = performance.now();
    this.sequence += 1;

    const param = {
      version: this.version,
      date: new Date().toISOString(),
      startTime: this.startTime,
      endTime: this.endTime,
      session: this.session_id,
      location: this.alt_location || window.location.href,
      locationIp: this.hostToIp[new URL(window.location.href).host],
      userAgent: this.userAgent,
      sequence: this.sequence,
      calc: video.is_calculatable(),
      service: video.get_service(),
      video: [video.get()],
      resource_timing: []
    };

    const netinfo = {};
    [
      "downlink",
      "downlinkMax",
      "effectiveType",
      "rtt",
      "type",
      "apn",
      "plmn",
      "sim"
    ].forEach(e => {
      if (navigator.connection[e] === Infinity) {
        netinfo[e] = Number.MAX_VALUE;
      } else if (navigator.connection[e] === -Infinity) {
        netinfo[e] = Number.MIN_VALUE;
      } else {
        netinfo[e] = navigator.connection[e];
      }
    });
    param.netinfo = netinfo;

    return param;
  }

  async locationIp() {
    const url = new URL(window.location.href);
    const ip = await new Promise(resolve => {
      const listener = event => {
        if (
          event.data.host !== url.host ||
          event.data.type !== "CONTENT_SCRIPT_JS"
        )
          return;
        window.removeEventListener("message", listener);
        resolve(event.data.ip);
      };
      window.addEventListener("message", listener);
      window.postMessage({
        host: url.host,
        method: "get_ip",
        type: "FROM_SODIUM_JS"
      });
    });
    this.hostToIp[url.host] = ip;
  }

  altSessionMessage() {
    const allowHosts = ["tver.jp", "fod.fujitv.co.jp"];
    const allowVideoHosts = ["i.fod.fujitv.co.jp"];

    if (window.top === window) {
      if (!allowHosts.includes(window.location.hostname)) return;

      const location = window.location.href;
      const thumbnail = (
        document.querySelector("meta[property='og:image']") || {}
      ).content;
      const session = { location, thumbnail };

      window.addEventListener("message", event => {
        const { data, source, origin } = event;
        if (data.type !== "ALT_SESSION_MESSAGE_REQ") return;
        if (!allowVideoHosts.includes(new URL(origin).hostname)) return;
        source.postMessage(
          { type: "ALT_SESSION_MESSAGE_RES", ...session },
          origin
        );
      });
    } else {
      if (!allowVideoHosts.includes(window.location.hostname)) return;

      const eventResolver = event => {
        const { data, origin } = event;
        if (data.type !== "ALT_SESSION_MESSAGE_RES") return;
        if (!allowHosts.includes(new URL(origin).hostname)) return;
        const { location, thumbnail } = data;
        this.alt_location = location;
        this.alt_thumbnail = thumbnail;
        window.removeEventListener("message", eventResolver);
      };
      window.addEventListener("message", eventResolver);
      window.top.postMessage({ type: "ALT_SESSION_MESSAGE_REQ" }, "*");
    }
  }
}
