import msgpack from "msgpack-lite";
import { v4 as uuidv4 } from "uuid";
import { version } from "../../../../../package.json";
import Config from "./Config";
import MainVideoChangeException from "./MainVideoChangeException";
import ResourceTiming from "./ResourceTiming";
import {
  fetchAndStorePeakTimeLimit,
  saveQuotaLimitStarted,
  saveTransferSize,
  stopPeakTimeLimit,
  underPeakTimeLimit,
  underQuotaLimit,
} from "./StatStorage";
import { useStorage } from "./Storage";
import VideoData from "./VideoData";

/**
 * 送信
 * @typedef {Object} Payload 送信データフォーマット
 * @property {string} version
 * @property {string} date
 * @property {number} startTime
 * @property {number} endTime
 * @property {string} session
 * @property {"social" | "personal"} sessionType
 * @property {any}    location
 * @property {any}    locationIp
 * @property {string} userAgent
 * @property {number} sequence
 * @property {any}    calc
 * @property {any}    service
 * @property {any[]}  video
 * @property {any[]}  resource_timing
 * @param {Payload} payload
 */
async function send(payload) {
  const body = msgpack.encode(JSON.parse(JSON.stringify(payload)));
  if (body.length > Config.get_max_send_size())
    console.warn(
      `VIDEOMARK: Too large payload packed body size is ${body.length}`
    );

  const type =
    payload.sessionType === "personal" ? payload.sessionType : "social";
  const ret = await fetch(`${Config.get_fluent_url()}.${type}`, {
    method: "POST",
    headers: {
      "Content-type": "application/msgpack",
    },
    body,
  });
  if (!ret.ok) {
    throw new Error("fluent response was not ok.");
  }
}

async function set_max_bitrate(new_video) {
  const bitrate_control = Config.get_bitrate_control();
  const quota_bitrate = Config.get_quota_bitrate();
  if (quota_bitrate) saveQuotaLimitStarted(new Date().getTime());

  const peak_time_limit = (await fetchAndStorePeakTimeLimit()) || {};
  const bitrate = Math.min(
    ...[bitrate_control, quota_bitrate, peak_time_limit.bitrate].filter(
      Number.isFinite
    )
  );
  const resolution = Math.min(
    ...[Config.get_resolution_control(), peak_time_limit.resolution].filter(
      Number.isFinite
    )
  );

  if (Number.isFinite(bitrate) && Number.isFinite(resolution)) {
    new_video.set_max_bitrate(bitrate, resolution);
  } else if (underQuotaLimit() || underPeakTimeLimit()) {
    new_video.set_default_bitrate();
    saveQuotaLimitStarted(undefined);
    stopPeakTimeLimit();
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
    this.resource = ResourceTiming;
  }

  async init() {
    const settings = Config.get_settings();
    let session = Config.get_default_session();
    if (
      session === undefined ||
      settings === undefined ||
      !(Date.now() < session.expires)
    ) {
      const id = uuidv4();
      const type = "social";
      const expiresIn =
        settings === undefined ? NaN : Number(settings.expires_in);
      session = {
        id,
        type,
        expires:
          Date.now() +
          (Number.isFinite(expiresIn)
            ? expiresIn
            : Config.get_default_session_expires_in()),
      };
      window.postMessage(
        {
          type: "FROM_SODIUM_JS",
          method: "set_session",
          session,
        },
        "*"
      );
    }

    this.session = session;
    this.location = new URL(window.location.href);
    console.log(`VIDEOMARK: New Session start Session ID[${this.session.id}]`);

    this.locationIp();
    this.altSessionMessage();
  }

  get_session_id() {
    return this.session.id;
  }

  /**
   * 計測対象のvideo
   */
  get_main_video() {
    return this.video.find((e) => e.is_main_video());
  }

  /**
   * videoの利用可否
   */
  get_video_availability() {
    const main_video = this.get_main_video();
    if (main_video === undefined) return false;
    return (
      this.location.href === window.location.href && main_video.is_available()
    );
  }

  /**
   * 各videoのクオリティ情報の更新
   */
  update_quality_info() {
    this.video.forEach((e) => e.update());
  }

  /**
   * videoリストの更新
   * @param {HTMLCollection} elms
   */
  set_video_elms(elms) {
    Array.prototype.forEach.call(elms, (elm) => {
      if (!this.video.find((e) => e.video_elm === elm)) {
        const video_id = uuidv4();
        try {
          const new_video = new VideoData(elm, video_id);
          new_video.read_settings();
          console.log(`VIDEOMARK: new video found uuid[${video_id}]`);
          set_max_bitrate(new_video);
          this.video.push(new_video);
        } catch (err) {
          // どのタイプでもない
        }
      }
    });
    const removing = this.video.filter(
      (e) =>
        !Array.prototype.find.call(elms, (elm) => elm === e.video_elm) ||
        !e.is_stay()
    );
    removing.forEach((e) => {
      e.clear();
      this.video.splice(this.video.indexOf(e), 1);
    });
  }

  async start() {
    let mainVideo;
    let startTime;

    for (;;) {
      // eslint-disable-next-line no-await-in-loop
      mainVideo = await this.waitMainVideo();

      console.log(
        `VIDEOMARK: STATE CHANGE found main video ${mainVideo.get_video_id()}`
      );
      this.location = new URL(window.location.href);

      try {
        // eslint-disable-next-line no-await-in-loop
        startTime = await this.waitPlay(mainVideo);

        console.log(`VIDEOMARK: STATE CHANGE play ${new Date(startTime)}`);

        // eslint-disable-next-line no-await-in-loop
        await this.playing(mainVideo);
      } catch (e) {
        if (e instanceof MainVideoChangeException)
          console.log(
            `VIDEOMARK: STATE CHANGE main video changed ${mainVideo.get_video_id()}`
          );
        else console.log(`VIDEOMARK: ${e}`);
      }
    }
  }

  async waitMainVideo() {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        const mainVideo = this.get_main_video();
        if (!mainVideo) return;
        clearInterval(timer);
        resolve(mainVideo);
      }, Config.get_check_state_interval());
    });
  }

  async waitPlay(mainVideo) {
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        const startTime = mainVideo.get_start_time();
        if (mainVideo !== this.get_main_video())
          reject(new MainVideoChangeException());
        if (startTime === -1) return;
        clearInterval(timer);
        resolve(startTime);
      }, Config.get_check_state_interval());
    });
  }

  async playing(mainVideo) {
    const qoeRequestStart =
      (Config.get_trans_interval() * Config.get_send_data_count_for_qoe() -
        Config.get_prev_count_for_qoe()) *
      Config.get_check_state_interval();

    let dataTimeoutId;
    let storeTimeoutId;
    let requestTimeoutId;

    try {
      /* データ送信 */
      dataTimeoutId = this.startDataTransaction(
        mainVideo,
        Config.get_trans_interval() * Config.get_check_state_interval()
      );

      /* 保存 */
      storeTimeoutId = this.startDataStore(
        mainVideo,
        Config.get_check_state_interval()
      );

      if (mainVideo.is_calculatable()) {
        /* QoE計算に必要なデータが送信されるまで待機 (5 * 2 - 3) * 1000 = 7000 ms */
        await new Promise((resolve) =>
          setTimeout(() => resolve(), qoeRequestStart)
        );

        /* 最初の最新QoE値を取得 */
        const qoe = await this.waitFirstQoE(
          mainVideo,
          Config.get_max_count_for_qoe()
        );
        if (qoe)
          console.log(`VIDEOMARK: STATE CHANGE latest qoe computed ${qoe}`);
        else console.log(`VIDEOMARK: STATE CHANGE latest qoe timeout`);

        /* QoE値問い合わせ */
        requestTimeoutId = this.startRequestTransaction(
          mainVideo,
          Config.get_trans_interval() *
            Config.get_latest_qoe_update() *
            Config.get_check_state_interval()
        );
      }

      /* videoが切り替わるまで待機 */
      await new Promise((resolve) => {
        const timer = setInterval(() => {
          if (mainVideo !== this.get_main_video()) {
            clearInterval(timer);
            resolve();
          }
        }, Config.get_check_state_interval());
      });
    } finally {
      if (dataTimeoutId) clearTimeout(dataTimeoutId);
      if (storeTimeoutId) clearTimeout(storeTimeoutId);
      if (requestTimeoutId) clearTimeout(requestTimeoutId);
    }
  }

  async waitFirstQoE(mainVideo, timeoutCount) {
    let qoe = null;
    let counter = 0;

    for (; !qoe && counter < timeoutCount; counter += 1) {
      if (mainVideo !== this.get_main_video())
        throw new MainVideoChangeException();
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
      await new Promise((resolve) =>
        setTimeout(() => resolve(), Config.get_check_state_interval())
      );
    }

    return qoe;
  }

  startDataTransaction(mainVideo, interval) {
    return setTimeout(async () => {
      for (; mainVideo === this.get_main_video(); ) {
        if (mainVideo.is_available()) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await this.sendData(mainVideo);
          } catch (e) {
            console.error(`VIDEOMARK: ${e}`);
          }
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(() => resolve(), interval));
      }
    });
  }

  startDataStore(mainVideo, interval) {
    return setTimeout(async () => {
      for (; mainVideo === this.get_main_video(); ) {
        if (this.get_video_availability()) {
          // eslint-disable-next-line no-await-in-loop
          await this.storeSession(mainVideo);
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(() => resolve(), interval));
      }
    });
  }

  startRequestTransaction(mainVideo, interval) {
    return setTimeout(async () => {
      for (; mainVideo === this.get_main_video(); ) {
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
        await new Promise((resolve) => setTimeout(() => resolve(), interval));
      }
    });
  }

  /** 送信 */
  async sendData(video) {
    const payload = this.toJson(video);
    await send(payload);
  }

  async requestQoE(video) {
    console.debug(
      `VIDEOMARK: requestQoE [${this.session.id}][${video.get_video_id()}]`
    );
    if (!this.session.id || !video.get_video_id()) {
      throw new Error("SodiumServer(qoe) bad request.");
    }
    const ret = await fetch(`${Config.get_sodium_server_url()}/api/latest_qoe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: {
          session_id: this.session.id,
          video_id: video.get_video_id(),
        },
      }),
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
      `${Config.get_sodium_server_url()}/api/recommend_bitrate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ids: {
            session_id: this.session.id,
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
      sessionId: this.session.id,
      videoId: video.get_video_id(),
    });
    const [prevResource, resource] = this.resource.collect();
    await storage.save({
      user_agent: this.userAgent,
      location: this.alt_location || this.location.href,
      transfer_size: resource.transferSize,
      media_size: video.get_media_size(),
      domain_name: video.get_domain_name(),
      start_time: video.get_start_time(),
      end_time: -1,
      thumbnail: this.alt_thumbnail || video.get_thumbnail(),
      title: video.get_title(),
      calc: video.is_calculatable(),
      log: [
        ...(storage.cache.log || []).filter((a) => !("qoe" in a)),
        ...video.get_latest_qoe(),
        {
          date: Date.now(),
          quality: {
            ...video.get_quality(),
            viewport: video.get_viewport(),
            resolution: video.get_resolution(),
            timing: video.get_timing(),
          },
        },
      ]
        .sort(({ date: ad }, { date: bd }) => ad - bd)
        .slice(-Config.max_log),
    });

    await saveTransferSize(resource.transferSize - prevResource.transferSize);
  }

  /**
   * 送信データフォーマットに変換
   * @return {Payload} 送信データ
   */
  toJson(video) {
    this.startTime = this.endTime;
    this.endTime = performance.now();
    this.sequence += 1;

    const now = new Date();

    const param = {
      version: this.version,
      date: now.toISOString(),
      startTime: this.startTime,
      endTime: this.endTime,
      session: this.session.id,
      sessionType: this.session.type,
      location: this.alt_location || this.location.href,
      locationIp: this.hostToIp[this.location.host],
      userAgent: this.userAgent,
      sequence: this.sequence,
      calc: video.is_calculatable(),
      service: video.get_service(),
      video: [video.getSendData()],
      resource_timing: [],
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
      "sim",
    ].forEach((e) => {
      if (navigator.connection === undefined) {
        netinfo[e] = undefined;
      } else if (navigator.connection[e] === Infinity) {
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
    const ip = await new Promise((resolve) => {
      const listener = (event) => {
        if (
          event.data.host !== this.location.host ||
          event.data.type !== "CONTENT_SCRIPT_JS"
        )
          return;
        window.removeEventListener("message", listener);
        resolve(event.data.ip);
      };
      window.addEventListener("message", listener);
      window.postMessage({
        host: this.location.host,
        method: "get_ip",
        type: "FROM_SODIUM_JS",
      });
    });
    this.hostToIp[this.location.host] = ip;
  }

  altSessionMessage() {
    const allowHosts = ["tver.jp", "fod.fujitv.co.jp"];
    const allowVideoHosts = ["i.fod.fujitv.co.jp"];

    if (window.top === window) {
      if (!allowHosts.includes(this.location.hostname)) return;

      const thumbnail = (
        document.querySelector("meta[property='og:image']") || {}
      ).content;
      const session = { location: this.location.href, thumbnail };

      window.addEventListener("message", (event) => {
        const { data, source, origin } = event;
        if (data.type !== "ALT_SESSION_MESSAGE_REQ") return;
        if (!allowVideoHosts.includes(new URL(origin).hostname)) return;
        source.postMessage(
          { type: "ALT_SESSION_MESSAGE_RES", ...session },
          origin
        );
      });
    } else {
      if (!allowVideoHosts.includes(this.location.hostname)) return;

      const eventResolver = (event) => {
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
