import GeneralTypeHandler from './GeneralTypeHandler';

export default class FodTypeHandler extends GeneralTypeHandler {

    constructor(elm) {

        super(elm);

        if (!this.is_main_video(elm)) throw new Error("video is not main");

        this.cm = false;
        this.listeners = [];
        this.observer = new MutationObserver(mutations => {

            mutations.forEach(mutation => {

                if (mutation.type === "attributes" &&
                    mutation.target === this.elm) {

                    const cur = mutation.target.style.visibility === "hidden";
                    if (this.cm !== cur) {

                        this.listeners.forEach(e => e.call(null, {
                            cm: cur,
                            pos: this.get_current_time(null),
                            time: Date.now()
                        }));
                        this.cm = cur;
                    }
                }
            });
        });
        this.observer.observe(this.elm, {
            attributes: true,
            attributeFilter: ["style"]
        });
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_title() {

        try {

            return document
                .querySelector("#header_banner")
                .textContent
        } catch (e) {

            return "";
        }
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_thumbnail() {

        return null; // for fallback
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    is_main_video(video) {

        const [main] = Array.from(document.querySelectorAll('video'));
        return video === main;
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    is_cm(video) {

        try {

            const [{ style: { visibility: main } }, { style: { visibility: cm } }]
                = Array.from(document.querySelectorAll('video'));
            if (main === "hidden" && cm === "visible") return true;

            return false;
        } catch (e) {

            return false;
        }
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    add_cm_listener(listener) {

        this.listeners.push(listener)
    }

    // eslint-disable-next-line class-methods-use-this
    clear() {

        this.observer.disconnect();
    }
}
