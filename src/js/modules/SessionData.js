// eslint-disable-next-line import/no-unresolved
import uuidv4 from "uuid/v4";
// eslint-disable-next-line import/no-unresolved
import msgpack from "msgpack-lite";

import Config from "./Config";
import VideoData from "./VideoData";
import ResourceTimingData from "./ResourceTimingData";

export default class SessionData {
  constructor(id) {
    this.session_id = id;
    this.startTime = 0;
    this.endTime = 0;
    // eslint-disable-next-line no-nested-ternary
    this.userAgent =
      window && window.sodium
        ? window.sodium.userAgent
        : window && window.navigator
        ? window.navigator.userAgent
        : "";
    this.appVersion = this.userAgent.substr(this.userAgent.indexOf("/") + 1);
    this.sequence = 0;
    this.video = [];
    this.latest_qoe_update_count = 0;
  }

  get_session_id() {
    return this.session_id;
  }

  /**
   * 保持しているvideoの数
   */
  get_video_length() {
    return this.video.length;
  }

  /**
   * 保持しているvideoの総フレーム数、ドロップフレーム数
   */
  get_video_status() {
    let total = 0;
    let dropped = 0;
    let qoe = null;
    this.video.forEach(e => {
      total += e.total;
      dropped += e.dropped;
      const qoes = e.get_latest_qoe();
      qoe = qoe === null && qoes.length !== 0 ? qoes[qoes.length - 1].qoe : qoe;
    });
    return [total, dropped, qoe];
  }

  /**
   * 各videoのクオリティ情報の更新
   */
  update_quality_info() {
    this.video.forEach(e => e.update());
  }

  /**
   * videoリストの更新
   * @param {HTMLCollection} elms
   */
  set_video_elms(elms) {
    Array.prototype.forEach.call(elms, elm => {
      if (!this.video.find(e => e.video_elm === elm)) {
        const video_id = uuidv4();
        try {
          const new_video = new VideoData(elm, video_id);
          /* eslint-disable no-console */
          console.log(`VIDEOMARK: new video found uuid[${video_id}]`);
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

  send() {
    const resource = ResourceTimingData.get();

    const videos = [];
    for (let i = 0; i < this.video.length; i += 1) {
      const e = this.video[i];
      if (e.is_available()) videos.push(e);
    }

    if (videos.length === 0) return;

    // eslint-disable-next-line no-underscore-dangle
    this._send_fluent(videos, resource);

    this.latest_qoe_update_count += 1;

    const count = this.latest_qoe_update_count;

    videos.forEach(video => {
      // eslint-disable-next-line no-underscore-dangle
      this._session_store(video);
      if (count !== 0 && count % Config.get_latest_qoe_update() === 0) {
        // eslint-disable-next-line no-underscore-dangle
        this._latest_qoe_update(video);
      }
    });
  }

  async _send_fluent(videos, resource) {
    // eslint-disable-next-line no-underscore-dangle
    const session_data = this._get(videos, resource);
    if (!session_data) return;

    try {
      await fetch(Config.get_fluent_url(), {
        method: "POST",
        headers: {
          "Content-type": "application/msgpack"
        },
        body: msgpack.encode(session_data)
      });
    } catch (err) {
      console.log(err);
    }
  }

  async _session_store(video) {
    const value = {
      session_id: this.session_id,
      video_id: video.get_video_id(),
      user_agent: this.userAgent,
      location: window.location.href,
      resolution: video.get_resolution(),
      media_size: video.get_media_size(),
      domain_name: video.get_domain_name(),
      start_time: video.get_start_time(),
      end_time: -1,
      latest_qoe: video.get_latest_qoe(),
      thumbnail: video.get_thumbnail(),
      title: video.get_title()
    };
    const id = `${value.session_id}_${value.video_id}`;

    if (Config.is_mobile()) {
      try {
        console.log(`${id}:${JSON.stringify(value)}`);
        sodium.storage.local.set({ [id]: value });
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        window.postMessage(
          {
            type: "FROM_SODIUM_JS",
            method: "set_video",
            id,
            video: value
          },
          "*"
        );
      } catch (err) {
        console.log(err);
      }
    }
  }

  async _latest_qoe_update(video) {
    try {
      const body = {
        ids: {
          session_id: this.session_id,
          video_id: video.get_video_id()
        }
      };

      const ret = await fetch(`${Config.get_sodium_server_url()}/latest_qoe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const json = await ret.json();

      const qoe = Number.parseFloat(json.qoe);
      if (Number.isNaN(qoe)) return;

      if (json.qoe)
        video.add_latest_qoe({
          date: Date.now(),
          qoe: json.qoe
        });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * 送信データフォーマットに変換
   */
  _get(videos, resource) {
    const videos_obj = [];

    videos.forEach(e => {
      videos_obj.push(e.get());
    });

    if (videos_obj.length === 0) return null;

    this.startTime = this.endTime;
    this.endTime = performance.now();
    this.sequence += 1;

    return {
      date: new Date().toISOString(),
      startTime: this.startTime,
      endTime: this.endTime,
      session: this.session_id,
      location: window.location.href,
      userAgent: this.userAgent,
      appVersion: this.appVersion,
      sequence: this.sequence,
      video: videos_obj,
      resource_timing: resource
    };
  }
}
