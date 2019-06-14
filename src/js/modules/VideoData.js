import Config from "./Config";
import EventData from "./EventData";
import VideoHandler from "./VideoHandler";

export default class VideoData {
  constructor(elm, id) {
    // --- element --- //
    this.video_elm = elm;

    // --- video element handler --- //
    this.video_handler = new VideoHandler(this.video_elm);

    // --- property --- //
    this.uuid = id;
    this.playback_quality = [];
    this.title = this.video_handler.get_video_title();
    this.thumbnail = this.video_handler.get_video_thumbnail();
    this.id_by_video_holder = this.video_handler.get_id_by_video_holder();

    // --- context --- //
    this.total = 0;
    this.dropped = 0;
    this.creation_time = 0;
    this.delta_total = 0;
    this.delta_dropped = 0;
    this.delta_creation_time = 0;
    this.play_start_time = -1;
    this.play_end_time = -1;
    this.current_play_pos = -1;
    this.current_play_pos_date = -1;
    this.events = [];
    this.last_events = {};
    this.resolution = {
      width: -1,
      height: -1,
      max: {
        width: -1,
        height: -1
      },
      min: {
        width: -1,
        height: -1
      }
    };
    this.latest_qoe = [];
    this.domain_name = null;
    this.listeners = [];

    // --- set event listener --- //
    Config.get_event_type_names().forEach(s => {
      this.last_events[s] = 0;

      // eslint-disable-next-line no-underscore-dangle
      const l = event => this._listener(event);

      this.video_elm.addEventListener(s, l);

      this.listeners.push({
        key: s,
        func: l
      });
    });

    // eslint-disable-next-line no-underscore-dangle
    const l = event => this._position_update_listener(event);

    this.video_elm.addEventListener("timeupdate", l);

    this.listeners.push({
      key: "timeupdate",
      func: l
    });

    this.video_handler.add_cm_listener(args => this._cm_listener(args));
  }

  get_video_id() {
    return this.uuid;
  }

  get_title() {
    return this.title;
  }

  get_thumbnail() {
    return this.thumbnail;
  }

  get_resolution() {
    return this.resolution;
  }

  get_media_size() {
    return this.video_handler.get_duration();
  }

  get_start_time() {
    return this.play_start_time;
  }

  get_end_time() {
    return this.play_end_time;
  }

  get_latest_qoe() {
    return this.latest_qoe;
  }

  get_domain_name() {
    return this.domain_name;
  }

  get_viewport() {
    return {
      width: this.video_elm.width,
      height: this.video_elm.height
    };
  }

  get_quality() {
    const bitrate = this.video_handler.get_bitrate();
    const receiveBuffer = this.video_handler.get_receive_buffer();
    const framerate = this.video_handler.get_framerate();
    const speed = this.video_elm.playbackRate;

    return {
      totalVideoFrames: this.total,
      droppedVideoFrames: this.dropped,
      creationTime: this.creation_time,
      deltaTotalVideoFrames: this.delta_total,
      deltaDroppedVideoFrames: this.delta_dropped,
      deltaTime: this.delta_creation_time,
      bitrate,
      receiveBuffer,
      framerate,
      speed
    };
  }

  add_latest_qoe(data) {
    this.latest_qoe.push(data);

    if (
      Config.get_num_of_latest_qoe() !== 0 &&
      Config.get_num_of_latest_qoe() < this.latest_qoe.length
    )
      this.latest_qoe = this.latest_qoe.splice(
        -Config.get_num_of_latest_qoe(),
        Config.get_num_of_latest_qoe()
      );
  }

  /**
   * 送信、更新するかどうかを判定する
   * TODO: getを呼び出す前に実行する必要がある
   */
  is_available() {
    // eslint-disable-next-line no-underscore-dangle
    if (!this.is_main_video())
      // TVer IMA3 video 、YouTubeの広告、チャンネルページの動画を除去
      return false;
    if (this._is_cm())
      // YouTubeの広告時は送信を行わない
      return false;
    // eslint-disable-next-line no-underscore-dangle
    if (!this._is_started())
      // 再生開始前
      return false;
    //  if (this.playback_quality.length === 0 &&   // qualityが空でイベントもない
    //      this.events.length === 0)
    //      return false;
    return true;
  }

  is_stay() {
    const now = this.video_handler.get_id_by_video_holder();
    if (this.id_by_video_holder && this.id_by_video_holder !== now) {
      // eslint-disable-next-line no-console
      console.log(
        `VIDEOMARK: switch video source removeing [${
          this.id_by_video_holder
        }] -> [${now}]`
      );
      return false;
    }

    return true;
  }

  /**
   *
   */
  update() {
    const vw = this.video_handler.get_video_width();
    const vh = this.video_handler.get_video_height();
    if (vw > 0 && vh > 0) {
      this.resolution.width = vw;
      this.resolution.height = vh;
      if (this.resolution.max.width === -1 || this.resolution.max.width < vw)
        this.resolution.max.width = vw;
      if (this.resolution.max.height === -1 || this.resolution.max.height < vh)
        this.resolution.max.height = vh;
      if (this.resolution.min.width === -1 || this.resolution.min.width > vw)
        this.resolution.min.width = vw;
      if (this.resolution.min.height === -1 || this.resolution.min.height > vh)
        this.resolution.min.height = vh;
    }

    this.domain_name =
      this.video_handler.get_segment_domain() || this.domain_name;

    const total = this.video_elm.webkitDecodedFrameCount;
    const dropped = this.video_elm.webkitDroppedFrameCount;
    const now = performance.now();
    this.delta_total = total - this.total;
    this.total = total;
    this.delta_dropped = dropped - this.dropped;
    this.dropped = dropped;
    this.delta_creation_time = now - this.creation_time;
    this.creation_time = now;

    if (this.delta_total === 0) return;
    if (this.delta_total < 0 || this.delta_dropped < 0) {
      this.delta_total = this.total;
      this.delta_dropped = this.dropped;
    }

    const quality = this.get_quality();
    this.playback_quality.push(quality);
  }

  /**
   *
   */
  get() {
    const id_str = this.video_elm.getAttribute("id");
    const id_val = id_str && id_str.length !== 0 ? id_str : "";
    const class_val = Array.from(this.video_elm.classList);

    const val = {
      property: {
        uuid: this.uuid,
        id: id_val,
        viewCount: this.video_handler.get_view_count(),
        class: class_val,
        src: this.video_elm.src,
        domainName: this.video_handler.get_segment_domain(),
        width: this.video_elm.width,
        height: this.video_elm.height,
        videoWidth: this.video_handler.get_video_width(),
        videoHeight: this.video_handler.get_video_height(),
        mediaSize: this.video_handler.get_duration(),
        defaultPlaybackRate: this.video_elm.defaultPlaybackRate,
        playbackRate: this.video_elm.playbackRate,
        playStartTime: this.play_start_time,
        playEndTime: this.play_end_time,
        currentPlayPos: this.current_play_pos,
        currentPlayTime: this.current_play_pos_date
      },
      playback_quality: this.playback_quality.splice(
        0,
        this.playback_quality.length
      )
    };
    Config.get_event_type_names().forEach(s => {
      val[`event_${s}`] = [];
      val[`event_${s}_delta`] = [];
    });
    const list = this.events.splice(0, this.events.length);
    list.forEach(e => {
      val[`event_${e.type}`].push(e.get());
      val[`event_${e.type}_delta`].push(e.get_delta());
    });
    return val;
  }

  clear() {
    this.listeners.forEach(e =>
      this.video_elm.removeEventListener(e.key, e.func)
    );
    this.video_handler.clear();
    // eslint-disable-next-line no-console
    console.log(`VIDEOMARK: delete video uuid[${this.uuid}]`);
  }

  is_main_video() {
    return this.video_handler.is_main_video(this.video_elm);
  }

  _is_cm() {
    return this.video_handler.is_cm(this.video_elm);
  }

  _is_started() {
    if (this.play_start_time !== -1) return true;
    return false;
  }

  /**
   * video event
   * @param {Event} event
   */
  _listener(event) {
    const now = Date.now();
    let playPos = -1;
    let playTime = -1;
    if (this.play_start_time !== -1) {
      playPos = this.video_handler.get_current_time(event.target);
      playTime = (now - this.play_start_time) / 1000;
    }
    switch (event.type) {
      case "play":
        if (this.play_start_time === -1) {
          this.play_start_time = now;
          playPos = 0;
          playTime = 0;
          /* eslint-disable no-console */
          console.log(
            `VIDEOMARK: set play start time Event[${this.play_start_time}]`
          );
        }
        break;
      case "seeking":
        playPos = this.current_play_pos;
        break;
      case "ended":
        this.play_end_time = now;
        break;
      default:
    }

    const e = new EventData(
      event.target,
      event.type,
      playPos,
      playTime,
      this.last_events[event.type]
    );

    if (
      playPos < 0 || // 開始前のイベントは無視
      !this.is_main_video() ||
      this._is_cm()
    ) {
      /* eslint-disable no-console */
      console.log(
        `VIDEOMARK: EVENT(D):${event.type}, VALUE:[${e.toJSON()}], ID:${
          this.uuid
        }[${this.id_by_video_holder ? this.id_by_video_holder : this.uuid}]`
      );
      return;
    }

    /* eslint-disable no-console */
    console.log(
      `VIDEOMARK: EVENT(A):${event.type}, VALUE:[${e.toJSON()}], ID:${
        this.uuid
      }[${this.id_by_video_holder ? this.id_by_video_holder : this.uuid}]`
    );

    this.last_events[event.type] = e.time;
    this.events.push(e);
  }

  /**
   * current position update event
   * @param {Event} event
   */
  _position_update_listener(event) {
    if (!this.is_main_video() || this._is_cm()) return;

    if (this.play_start_time === -1) {
      this.play_start_time = Date.now();
      /* eslint-disable no-console */
      console.log(
        `VIDEOMARK: set play start time time_update Event[${
          this.play_start_time
        }]`
      );
    }
    this.current_play_pos = this.video_handler.get_current_time(event.target);
    this.current_play_pos_date = (Date.now() - this.play_start_time) / 1000;
  }

  /**
   */
  _cm_listener(args) {
    const { cm, pos, time } = args;

    const playPos = pos;
    const playTime =
      this.play_start_time !== -1 ? (time - this.play_start_time) / 1000 : 0;

    let type;

    if (cm) {
      type = "pause";
    } else {
      type = "play";
      if (this.play_start_time === -1) this.play_start_time = Date.now();
    }

    const event = new EventData(
      this.video_elm,
      type,
      playPos,
      playTime,
      this.last_events[type]
    );

    if (this.play_start_time === -1) {
      /* eslint-disable no-console */
      console.log(
        `VIDEOMARK: EVENT(D(L)):${event.type}, VALUE:[${event.toJSON()}], ID:${
          this.uuid
        }[${this.id_by_video_holder ? this.id_by_video_holder : this.uuid}]`
      );
      return;
    }

    /* eslint-disable no-console */
    console.log(
      `VIDEOMARK: EVENT(A(L)):${event.type}, VALUE:[${event.toJSON()}], ID:${
        this.uuid
      }[${this.id_by_video_holder ? this.id_by_video_holder : this.uuid}]`
    );

    this.last_events[event.type] = event.time;
    this.events.push(event);
  }
}
