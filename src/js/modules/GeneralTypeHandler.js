
export default class GeneralTypeHandler {

    constructor(elm) {
        this.elm = elm;
    }

    // eslint-disable-next-line camelcase
    get_duration() {
        return this.elm.duration;
    }

    // eslint-disable-next-line camelcase
    get_video_width() {
        return this.elm.videoWidth;
    }

    // eslint-disable-next-line camelcase
    get_video_height() {
        return this.elm.videoHeight;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_bitrate() {
        return -1;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_bitrate() {
        return -1;
    }

    // eslint-disable-next-line camelcase
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

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_framerate() {
        return -1;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_segment_domain() {
        return document.domain;
    }

    // eslint-disable-next-line camelcase, no-unused-vars
    get_current_time(video) {
        return this.elm.currentTime
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_title() {
        return "";
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_thumbnail() {
        return "";
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_id_by_video_holder() {
        return "";
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_view_count() {
        return -1;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_play_list_info() {
        return []
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_throughput_info() {
        return [];
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_codec_info() {
        return {};
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_representation() {
        return {};
    }

    // eslint-disable-next-line camelcase
    is_main_video(video) {
        return video === this.elm
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    is_cm(video) {
        return false;
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    set_quality(bitrate) {

    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    add_cm_listener(listener) {

    }

    // eslint-disable-next-line class-methods-use-this
    clear() {

    }
}
