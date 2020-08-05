// @ts-check
import GeneralTypeHandler from "./GeneralTypeHandler";

/* あまり有用な情報は取り出せない */
export default class AbemaTVVideoTypeHandler extends GeneralTypeHandler {
    /** @param {Function} callback 監視対象が変更されたとき呼ばれる関数 */
    _observe(callback) {
        const target = document.querySelector(".c-vod-EpisodePlayerContainer-screen");
        const observer = new MutationObserver(() => callback());
        observer.observe(target, { attributeFilter: ["class"] });
        return observer;
    }

    constructor(elm) {
        super(elm);

        if (!this.is_main_video(elm)) throw new Error("video is not main");

        /** 監視対象が変更されたとき呼ばれる関数たち */
        this.listeners = [];
        /** @type {boolean} 広告再生中だったか否か (広告再生中: true、通常再生中: それ以外) */
        let prevPlayingAd = false;
        /** @type {MutationObserver} 通常再生中か否か観察者 */
        this.observer = this._observe(() => {
            const playingAd = this.is_cm();
            if (prevPlayingAd === playingAd) return;
            prevPlayingAd = playingAd;
            const state = {
                cm: playingAd,
                pos: this.get_current_time(null),
                time: Date.now()
            };
            this.listeners.forEach(e => e.call(null, state));
        });
    }

    get_video_title() {
        return document.title;
    }

    get_video_thumbnail() {
        /**
         * スプラッシュ画面を送るエピソードごとのサムネイルも取れそうだが結構一つに絞るのは大変かも
         */
        return null; // for fallback
    }

    get_id_by_video_holder() {
        return "";
    }

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

    is_cm() {
        try {
            const ad = Array
                .from(document.querySelectorAll(".c-vod-EpisodePlayerContainer-screen--playing-ad"));
            return ad.length !== 0
        } catch (e) {
            return false;
        }
    }

    add_cm_listener(listener) {
        this.listeners.push(listener)
    }

    clear() {
        this.observer.disconnect();
    }
}
