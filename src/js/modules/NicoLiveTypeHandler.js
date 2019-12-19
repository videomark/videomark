import NicoVideoTypeHandler from "./NicoVideoTypeHandler";

export default class NicoLiveTypeHandler extends NicoVideoTypeHandler {

    constructor(elm) {

        super(elm);

        if (!this.is_main_video(elm)) throw new Error("video is not main");
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_duration() {

        return -1;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_title() {

        try {

            return document
                .querySelector("[class^=___title___]")
                .firstChild
                .textContent
        } catch (e) {

            return "";
        }
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_view_count() {

        return -1;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this, no-unused-vars
    is_main_video(video) {

        // トップページのサムネイル
        return !/\/\/ext.live\d.nicovideo.jp/.test(document.location.href);

    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    is_cm(video) {

        return false;
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    add_cm_listener(listener) {

    }

    // eslint-disable-next-line class-methods-use-this
    clear() {

    }
}
