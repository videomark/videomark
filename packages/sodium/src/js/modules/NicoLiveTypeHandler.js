import GeneralTypeHandler from "./GeneralTypeHandler";

export default class NicoLiveTypeHandler extends GeneralTypeHandler {

    constructor(elm) {

        super(elm);

        this.limited = false;

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
    get_id_by_video_holder() {

        try {

            const [id] = new URL(window.location.href)
                .pathname
                .split('/')
                .slice(-1);

            return id;
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

    // eslint-disable-next-line camelcase, no-unused-vars
    is_limited() {
        return this.limited;
    }


    /**
     * 指定したビットレート以下を選択する (指定しない場合や指定されたビットレートより小さい画質が存在しない場合、最低画質を選択する)
     * @param {number} [bitrate] 最大ビットレート
     * @param {number} [resolution] 最大解像度 (height)
     */
    set_max_bitrate(bitrate, resolution) {
        /** @type {Array<[number, number, string]>} ビットレートと解像度(height)と書き込む値 */
        let videos = [
            [3e6, 720, "super_high"],
            [2e6, 450, "high"],
            [1e6, 450, "normal"],
            [384e3, 288, "low"],
            [192e3, 288, "super_low"],
        ];

        if (bitrate) {
            videos = videos.filter(([videoBitrate]) => videoBitrate <= bitrate);
        }
        if (resolution) {
            videos = videos.filter(([, videoResolution]) => videoResolution <= resolution);
        }

        this.limited = true;

        /** @type {string} 書き込む値 */
        const selected = videos.length === 0 ? "super_low" : videos[0][2];
        localStorage.setItem(
            "LeoPlayer_EdgeStreamStore_LATEST_DMC_STREAM_QUALITY",
            JSON.stringify(selected)
        );
    }

    /**
     * 画質 "自動" を選択する
     */
    set_default_bitrate() {
        // NOTE: 画質 ('"abr"': 自動の場合)
        localStorage.setItem(
            "LeoPlayer_EdgeStreamStore_LATEST_DMC_STREAM_QUALITY",
            '"abr"'
        );
    }
}
