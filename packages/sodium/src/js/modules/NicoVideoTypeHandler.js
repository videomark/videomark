import GeneralTypeHandler from "./GeneralTypeHandler";

/**
 * @typedef {{
 *   id: string,
 *   bitrate: number,
 *   resolution: {
 *     width: number,
 *     height: number
 *   },
 *   ...others: any
 * }} SelectedQuality
 */

/**
 * 選択可能な動画の品質一覧を得る
 * @return {Array<SelectedQuality>} 選択可能な動画の品質一覧 (得られない場合は [])
 */
function quality() {
    const initDataElement = document.querySelector("#js-initial-watch-data");
    if (initDataElement == null) return [];
    const { apiData: apiDataJson } = initDataElement.dataset;
    if (apiDataJson == null) return [];
    try {
        const apiData = JSON.parse(apiDataJson);
        const { videos } = apiData.video.dmcInfo.quality;
        return videos == null ? [] : videos;
    } catch (error) {
        return [];
    }
}

export default class NicoVideoTypeHandler extends GeneralTypeHandler {
    constructor(elm) {

        super(elm);

        if (!this.is_main_video(elm)) throw new Error("video is not main");

        this.cm = false;
        this.limited = false;

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
                .slice(-1);

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
        return this.cm;
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
        // NOTE: ビットレート降順にソート
        let videos = quality().sort(({ bitrate: a }, { bitrate: b }) => b - a);
        // FIXME: [] の場合、何らかの不具合
        if (videos.length === 0) return;

        // NOTE: 自動か否か ('"manual"': 手動)
        localStorage.setItem("DMCSource.qualitySelectType", '"manual"');

        // NOTE: 最低画質をピックアップする
        const lowestQuality = videos[videos.length - 1];

        if (bitrate) {
            videos = videos.filter(video => video.bitrate <= bitrate);
        }
        if (resolution) {
            videos = videos.filter(video => video.resolution.height <= resolution);
        }

        this.limited = true;

        // NOTE: 画質を選択する
        const selected = videos.length === 0 ? lowestQuality : videos[0];
        // NOTE: プロパティの snake_case を camelCase に変換
        selected.levelIndex = selected.level_index;
        delete selected.level_index;

        localStorage.setItem(
            "DMCSource.selectedQualityManually",
            JSON.stringify(selected)
        );
    }

    /**
     * 画質 "自動" を選択する
     */
    set_default_bitrate() {
        // NOTE: 自動か否か (デフォルト: 自動)
        localStorage.removeItem("DMCSource.qualitySelectType");
        // NOTE: 画質 ("null": 自動の場合)
        localStorage.setItem("DMCSource.selectedQualityManually", "null");
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
