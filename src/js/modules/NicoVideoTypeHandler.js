import GeneralTypeHandler from "./GeneralTypeHandler";

export default class NicoVideoTypeHandler extends GeneralTypeHandler {

    constructor(elm) {

        super(elm);

        if (!this.is_main_video(elm)) throw new Error("video is not main");

        this.cm = false;
        this.listeners = [];
        this.timer = setInterval(() => this.cmMonitor(), 500);
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_title() {

        try {

            return document
                .querySelector(".VideoTitle")
                .textContent
        } catch (e) {

            return "";
        }
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_id_by_video_holder() {

        try {

            const [id] = new URL(window.location.href)
                .pathname
                .split('/')
                .splice(-1);

            return id;
        } catch (e) {

            return "";
        }
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_view_count() {

        try {

            const count = document
                .querySelector(".VideoViewCountMeta-counter")
                .firstChild
                .textContent
                .split(',')
                .join('');

            return Number.parseInt(count, 10);
        } catch (e) {

            return -1;
        }
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    is_main_video(video) {

        try {

            const main = Array
                .from(document.querySelectorAll('video'))
                .find(e => e.parentElement.id === "MainVideoPlayer");

            return video === main;
        } catch (e) {

            return false;
        }
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    is_cm(video) {

        const videList = Array.from(document.querySelectorAll('video'));
        if (videList.length > 1)
            return !Array
                .from(document.querySelectorAll('video'))
                .find(e => e.src === window.location.href)

        return false;
    }

    // eslint-disable-next-line camelcase
    add_cm_listener(listener) {

        this.listeners.push(listener);
    }

    clear() {

        clearInterval(this.timer);
    }

    cmMonitor() {

        const cur = this.is_cm(this.elm);
        if (this.cm !== cur) {
            this.listeners.forEach(e => e.call(null, {
                cm: cur,
                pos: this.get_current_time(null),
                time: Date.now()
            }));
            this.cm = cur;
        }
    }
}
