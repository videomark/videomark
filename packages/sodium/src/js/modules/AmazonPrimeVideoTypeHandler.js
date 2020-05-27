import GeneralTypeHandler from "./GeneralTypeHandler";

export default class AmazonPrimeVideoTypeHandler extends GeneralTypeHandler {

    constructor(elm) {

        super(elm);

        if (!this.is_main_video(elm)) throw new Error("video is not main");

        this.cm = false;
        this.listeners = [];
        this.observer = new MutationObserver(mutations => {

            mutations.forEach(mutation => {

                if (mutation.type === "attributes" &&
                    mutation.target === this.elm) {

                    const cur = mutation.target.style.visibility !== "visible";
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
            return [...document.querySelectorAll(".contentTitlePanel > *")]
                .map(e => e.textContent)
                .join(", ");
        } catch (e) {
            return "";
        }
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_thumbnail() {
        try {
            const { src } = document.querySelector(".dv-fallback-packshot-image > img");
            return src;
        } catch (e) {
            return "";
        }
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    is_main_video(video) {

        try {

            const main = Array
                .from(document.querySelectorAll('video'))
                .find(e => /^blob:http\S?:\/\//.test(e.src));
            return main === video;
        } catch (e) {

            return false;
        }
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    is_cm(video) {

        try {

            const main = Array
                .from(document.querySelectorAll('video'))
                .find(e => /^blob:http\S?:\/\//.test(e.src));
            return main.style.visibility !== "visible";
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

    set_max_bitrate(bitrate, resolution) {
        if (!Number.isFinite(resolution)) return;

        const setting = localStorage.getItem("atvwebplayersdk_data_saver_setting") || "best";
        const current = AmazonPrimeVideoTypeHandler.qualityLabelTable.find(row => row.quality === setting);

        const selectedQuality = AmazonPrimeVideoTypeHandler.qualityLabelTable.find(row => row.resolution <= resolution);
        const selected = selectedQuality || AmazonPrimeVideoTypeHandler.qualityLabelTable[AmazonPrimeVideoTypeHandler.qualityLabelTable.length - 1]; // 標準画質

        if (!current || current.resolution > selected.resolution) {
            localStorage.setItem("atvwebplayersdk_data_saver_setting", selected.quality);
        }
    }

    set_default_bitrate() {
        localStorage.setItem("atvwebplayersdk_data_saver_setting", "best");
    }
}

AmazonPrimeVideoTypeHandler.qualityLabelTable = [
    {"resolution":1080, "quality":"best"}, // 最高画質
    {"resolution":720, "quality":"better"}, // 高画質
    {"resolution":480, "quality":"good"}, // 標準画質
];
