
import GeneralTypeHandler from "./GeneralTypeHandler";

/* あまり有用な情報は取り出せない */
export default class AbemaTVVideoTypeHandler extends GeneralTypeHandler {

    constructor(elm) {

        super(elm);

        if (!this.is_main_video(elm)) throw new Error("video is not main");

        this.cm = false;
        this.listeners = [];
        this.observer = new MutationObserver(mutations => {

            mutations.forEach(mutation => {

                if (mutation.type === "attributes") {

                    const cur = mutation
                        .target
                        .classList
                        .contains("c-vod-EpisodePlayerContainer-screen--playing-ad");
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

        this.observer.observe(document.querySelector(".c-vod-EpisodePlayerContainer-screen"),
            {
                attributes: true,
                attributeFilter: ["class"]
            });
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_title() {

        return document.title;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_thumbnail() {

        /**
         * スプラッシュ画面を送るエピソードごとのサムネイルも取れそうだが結構一つに絞るのは大変かも
         */
        return null; // for fallback
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_id_by_video_holder() {

        return "";
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    is_main_video(video) {

        try {

            const [main] = Array.from(document.querySelectorAll('video'))
                .filter(e => e.src.length !== 0)
                .filter(e => /^blob:http\S:\/\/abema.tv/.test(e.src))

            return video === main
        } catch (e) {

            return false;
        }
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    is_cm(video) {

        try {

            const ad = Array
                .from(document.querySelectorAll(".c-vod-EpisodePlayerContainer-screen--playing-ad"));
            return ad.length !== 0
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
