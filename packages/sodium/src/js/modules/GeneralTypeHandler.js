// @ts-check
export default class GeneralTypeHandler {
    /** @param {HTMLVideoElement} elm */
    constructor(elm) {
        this.elm = elm;
        /** @type {?import("./AdObserver").AdObserver} */
        this.adObserver = null;
    }

    get_duration() {
        return this.elm.duration;
    }

    get_video_width() {
        return this.elm.videoWidth;
    }

    get_video_height() {
        return this.elm.videoHeight;
    }

    get_bitrate() {
        return -1;
    }

    get_video_bitrate() {
        return -1;
    }

    get_receive_buffer() {
        let ret = -1;
        try {
            const { buffered } = this.elm;
            ret = buffered.end(buffered.length - 1);

        } catch (e) {
            // do nothing
        }
        return ret;
    }

    get_framerate() {
        return -1;
    }

    get_segment_domain() {
        return document.domain;
    }

    get_current_time() {
        return this.elm.currentTime
    }

    get_alt_location() {
        return null;
    }

    get_video_title() {
        return "";
    }

    get_video_thumbnail() {
        return "";
    }

    get_id_by_video_holder() {
        return "";
    }

    get_view_count() {
        return -1;
    }

    get_play_list_info() {
        return []
    }

    get_throughput_info() {
        return [];
    }

    get_codec_info() {
        return {};
    }

    get_representation() {
        return {};
    }

    is_main_video(video) {
        return video === this.elm
    }

    is_cm() {
        return false;
    }

    set_quality() {
    }

    add_cm_listener(listener) {
        if (this.adObserver == null) return;
        /** @param {import("./AdObserver").AdEvent} event */
        function handler(event) {
            const { showing: cm, playPos: pos, dateTime: time } = event;
            listener.call(null, { cm, pos, time });
        }
        this.adObserver.on(handler);
    }

    clear() {
        if (this.adObserver == null) return;
        this.adObserver.removeAllListeners();
    }
}
