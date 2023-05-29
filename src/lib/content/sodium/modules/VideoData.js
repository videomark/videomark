import Config from './Config';
import EventData from './EventData';
import VideoHandler from './VideoHandler';

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
    this.cm_events = [];
    this.resolution = {
      width: -1,
      height: -1,
      max: {
        width: -1,
        height: -1,
      },
      min: {
        width: -1,
        height: -1,
      },
    };
    this.latest_qoe = [];
    this.throughput = [];
    this.throughput_send = [];
    this.domain_name = null;
    this.listeners = [];
    this.timing = {
      waiting: () => 0,
      pause: () => 0,
    };
    this.bitrate_control_data = {
      bitrate: -1,
      resolution: -1,
    };

    // --- set event listener --- //
    // Abema Live は event を無視する
    if (this.video_handler.service !== 'abematv_live') {
      Config.get_event_type_names().forEach((s) => {
        this.last_events[s] = 0;

        const l = (event) => this._listener(event);

        this.video_elm.addEventListener(s, l);

        this.listeners.push({
          key: s,
          func: l,
        });
      });
    } else {
      document.querySelectorAll('video').forEach((e) => {
        Config.get_event_type_names().forEach((s) => {
          if (s === 'ended') {
            e.addEventListener(s, (event) => {
              console.log(
                `VIDEOMARK: EVENT(D):${event.type}, ${Array.from(
                  document.querySelectorAll('video'),
                ).indexOf(event.target)}, ID:${this.uuid}[${
                  this.id_by_video_holder ? this.id_by_video_holder : this.uuid
                }]`,
              );
            });
          } else {
            this.last_events[s] = 0;

            const l = (event) => this._listener(event);

            e.addEventListener(s, l);

            this.listeners.push({
              key: s,
              func: l,
            });
          }
        });
      });
    }

    const l = (event) => this._position_update_listener(event);

    this.video_elm.addEventListener('timeupdate', l);

    this.listeners.push({
      key: 'timeupdate',
      func: l,
    });

    this.video_handler.add_cm_listener((args) => this._cm_listener(args));

    this.enable_quality_control = false;
    this.max_resolution = 2160;
    this.max_bitrate = 20 * 1024 * 1024; // 20Mbps
  }

  async read_settings() {
    const resolution_control = await Config.get_resolution_control();

    if (resolution_control) {
      this.max_resolution = resolution_control;
    }

    this.enable_quality_control = this.enable_quality_control || Boolean(resolution_control);

    const bitrate_control = await Config.get_bitrate_control();

    if (bitrate_control) {
      this.max_bitrate = Math.min(this.max_bitrate, bitrate_control);
    }

    this.enable_quality_control = this.enable_quality_control || Boolean(bitrate_control);

    const quota_bitrate = await Config.get_quota_bitrate();

    if (quota_bitrate) {
      this.max_bitrate = Math.min(this.max_bitrate, quota_bitrate);
    }

    this.enable_quality_control = this.enable_quality_control || Boolean(quota_bitrate);
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
      height: this.video_elm.height,
    };
  }

  // SessionData.storeSession(video)でローカルに保存され、グラフの描画で使われる
  get_quality() {
    const bitrate = this.video_handler.get_bitrate();
    const videoBitrate = this.video_handler.get_video_bitrate();
    const receiveBuffer = this.video_handler.get_receive_buffer();
    const framerate = this.video_handler.get_framerate();
    const { throughput } = this;
    const speed = this.video_elm.playbackRate;
    const representation = this.video_handler.get_representation();

    return {
      totalVideoFrames: this.total,
      droppedVideoFrames: this.dropped,
      creationTime: this.creation_time,
      creationDate: Date.now(),
      deltaTotalVideoFrames: this.delta_total,
      deltaDroppedVideoFrames: this.delta_dropped,
      deltaTime: this.delta_creation_time,
      representation,
      bitrate,
      videoBitrate,
      receiveBuffer,
      framerate,
      throughput,
      speed,
    };
  }

  get_timing() {
    const now = Date.now();
    const { waiting, pause } = this.timing;

    return { waiting: waiting(now), pause: pause(now) };
  }

  get_codec_info() {
    return this.video_handler.get_codec_info();
  }

  get_service() {
    return this.video_handler.get_service();
  }

  set_quality(bitrate) {
    console.log(`VIDEOMARK: quality from TQAPI: ${bitrate}`);
    this.video_handler.set_quality(bitrate);
  }

  set_max_bitrate(bitrate, resolution) {
    this.bitrate_control_data = { bitrate, resolution };
    this.video_handler.set_max_bitrate(bitrate, resolution);
  }

  set_default_bitrate() {
    this.video_handler.set_default_bitrate();
  }

  add_latest_qoe(data) {
    this.latest_qoe.push(data);

    if (
      Config.get_num_of_latest_qoe() !== 0 &&
      Config.get_num_of_latest_qoe() < this.latest_qoe.length
    ) {
      this.latest_qoe = this.latest_qoe.splice(
        -Config.get_num_of_latest_qoe(),
        Config.get_num_of_latest_qoe(),
      );
    }
  }

  /**
   * 送信、更新するかどうかを判定する
   * TODO: getを呼び出す前に実行する必要がある
   */
  is_available() {
    if (!this.is_main_video()) {
      // TVer IMA3 video 、YouTubeの広告、チャンネルページの動画を除去
      return false;
    }

    if (this._is_cm()) {
      // YouTubeの広告時は送信を行わない
      return false;
    }

    if (!this._is_started()) {
      // 再生開始前
      return false;
    }

    //  if (this.playback_quality.length === 0 &&   // qualityが空でイベントもない
    //      this.events.length === 0)
    //      return false;
    return true;
  }

  is_stay() {
    const now = this.video_handler.get_id_by_video_holder();

    if (this.id_by_video_holder && this.id_by_video_holder !== now) {
      console.log(
        `VIDEOMARK: switch video source removing [${this.id_by_video_holder}] -> [${now}]`,
      );

      return false;
    }

    return true;
  }

  is_calculable() {
    return this.video_handler.is_calculable();
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

      if (this.resolution.max.width === -1 || this.resolution.max.width < vw) {
        this.resolution.max.width = vw;
      }

      if (this.resolution.max.height === -1 || this.resolution.max.height < vh) {
        this.resolution.max.height = vh;
      }

      if (this.resolution.min.width === -1 || this.resolution.min.width > vw) {
        this.resolution.min.width = vw;
      }

      if (this.resolution.min.height === -1 || this.resolution.min.height > vh) {
        this.resolution.min.height = vh;
      }
    }

    this.domain_name = this.video_handler.get_segment_domain() || this.domain_name;

    const total = this.totalFrames();
    const dropped = this.droppedFrames();
    const now = performance.now();

    this.delta_total = total - this.total;
    this.total = total;
    this.delta_dropped = dropped - this.dropped;
    this.dropped = dropped;
    this.delta_creation_time = now - this.creation_time;
    this.creation_time = now;
    // get_throughput_info()はバッファを破壊するため、このメソッド以外では実行してはならない
    this.throughput = this.video_handler.get_throughput_info();
    this.throughput.forEach((element) => this.throughput_send.push(element));

    if (this.delta_total === 0) {
      return;
    }

    if (this.delta_total < 0 || this.delta_dropped < 0) {
      this.delta_total = this.total;
      this.delta_dropped = this.dropped;
    }

    const quality = this.get_quality();

    this.playback_quality.push(quality);
  }

  totalFrames() {
    return this.video_handler.get_total_frames(this.video_elm);
  }

  droppedFrames() {
    return this.video_handler.get_dropped_frames(this.video_elm);
  }

  /**
   * SessionData.sendData(video)から呼び出される
   */
  getSendData() {
    const val = {
      property: {
        uuid: this.uuid,
        viewCount: this.video_handler.get_view_count(),
        domainName: this.video_handler.get_segment_domain(),
        holderId: this.id_by_video_holder,
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
        currentPlayTime: this.current_play_pos_date,
        bitrateControlData: {
          bitrate: this.bitrate_control_data.bitrate,
          resolution: this.bitrate_control_data.resolution,
          limited: this.video_handler.is_limited(),
        },
      },
      playback_quality: this.playback_quality.splice(0, this.playback_quality.length),
      play_list_info: this.video_handler.get_play_list_info(),
      throughput_info: this.throughput_send.splice(0, this.throughput_send.length),
      cmHistory: this.cm_events.splice(0, this.cm_events.length),
    };

    if (this.video_elm.src && !this.video_elm.src.match(/^blob:/i)) {
      val.property.src = this.video_elm.src;
    }

    Config.get_event_type_names().forEach((s) => {
      val[`event_${s}`] = [];
      val[`event_${s}_delta`] = [];
    });

    const list = this.events.splice(0, this.events.length).reverse();
    let data_sz = Config.get_event_data_max_size();

    // eslint-disable-next-line no-restricted-syntax
    for (const e of list) {
      data_sz -= JSON.stringify(e.get()).length;
      data_sz -= JSON.stringify(e.get_delta()).length;

      if (data_sz < 0) {
        console.debug(`event_data_sz max=${Config.get_event_data_max_size()} over=${-data_sz}`);
        break;
      }

      val[`event_${e.type}`].splice(0, 0, e.get());
      val[`event_${e.type}_delta`].splice(0, 0, e.get_delta());
    }

    return val;
  }

  clear() {
    this.listeners.forEach((e) => this.video_elm.removeEventListener(e.key, e.func));
    this.video_handler.clear();
    console.log(`VIDEOMARK: delete video uuid[${this.uuid}]`);
  }

  is_main_video() {
    return this.video_handler.is_main_video(this.video_elm);
  }

  _is_cm() {
    return this.video_handler.is_cm(this.video_elm);
  }

  _is_started() {
    if (this.play_start_time !== -1) {
      return true;
    }

    return false;
  }

  /**
   * video event
   * @param {Event} event
   */
  _listener(event) {
    const now = Date.now();
    const waiting = this.timing.waiting(now);
    const pause = this.timing.pause(now);
    let playPos = -1;
    let playTime = -1;

    if (this.play_start_time !== -1) {
      playPos = this.video_handler.get_current_time(event.target);
      playTime = (now - this.play_start_time) / 1000;
    }

    switch (event.type) {
      case 'waiting':
        this.timing.waiting = (at) => waiting + at - now;
        break;
      case 'canplay':
        this.timing.waiting = () => waiting;
        break;
      case 'pause':
        this.timing.pause = (at) => pause + at - now;
        break;
      case 'play':
        this.timing.pause = () => pause;

        if (this.play_start_time === -1) {
          this.play_start_time = now;
          playPos = 0;
          playTime = 0;
          console.log(`VIDEOMARK: set play start time Event[${this.play_start_time}]`);
        }

        break;
      case 'seeking':
        playPos = this.current_play_pos;
        break;
      case 'ended':
        this.play_end_time = now;
        break;
      default:
    }

    const e = new EventData(
      event.target,
      event.type,
      playPos,
      playTime,
      this.last_events[event.type],
    );

    if (
      playPos < 0 || // 開始前のイベントは無視
      !this.is_main_video() ||
      this._is_cm()
    ) {
      console.log(
        `VIDEOMARK: EVENT(D):${event.type}, ${Array.from(
          document.querySelectorAll('video'),
        ).indexOf(event.target)}, VALUE:[${e.toJSON()}], ID:${this.uuid}[${
          this.id_by_video_holder ? this.id_by_video_holder : this.uuid
        }]`,
      );

      return;
    }

    console.log(
      `VIDEOMARK: EVENT(A):${event.type}, ${Array.from(document.querySelectorAll('video')).indexOf(
        event.target,
      )}, VALUE:[${e.toJSON()}], ID:${this.uuid}[${
        this.id_by_video_holder ? this.id_by_video_holder : this.uuid
      }]`,
    );

    this.last_events[event.type] = e.time;
    this.events.push(e);
  }

  /**
   * current position update event
   * @param {Event} event
   */
  _position_update_listener(event) {
    if (!this.is_main_video() || this._is_cm()) {
      return;
    }

    if (this.play_start_time === -1) {
      this.play_start_time = Date.now();
      console.log(`VIDEOMARK: set play start time time_update Event[${this.play_start_time}]`);
    }

    this.current_play_pos = this.video_handler.get_current_time(event.target);
    this.current_play_pos_date = (Date.now() - this.play_start_time) / 1000;
  }

  /**
   */
  _cm_listener(args) {
    const { cm, pos, time } = args;
    const playPos = pos;
    const playTime = this.play_start_time !== -1 ? (time - this.play_start_time) / 1000 : 0;
    let type;

    if (cm) {
      type = 'pause';
      this.cm_events.push({ type: 'cm', time });
    } else {
      type = 'play';
      this.cm_events.push({ type: 'main', time });

      if (this.play_start_time === -1) {
        this.play_start_time = Date.now();
      }
    }

    const event = new EventData(this.video_elm, type, playPos, playTime, this.last_events[type]);

    if (this.play_start_time === -1) {
      console.log(
        `VIDEOMARK: EVENT(D(L)):${event.type}, VALUE:[${event.toJSON()}], ID:${this.uuid}[${
          this.id_by_video_holder ? this.id_by_video_holder : this.uuid
        }]`,
      );

      return;
    }

    console.log(
      `VIDEOMARK: EVENT(A(L)):${event.type}, VALUE:[${event.toJSON()}], ID:${this.uuid}[${
        this.id_by_video_holder ? this.id_by_video_holder : this.uuid
      }]`,
    );

    this.last_events[event.type] = event.time;
    this.events.push(event);
  }
}
