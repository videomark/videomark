import GeneralTypeHandler from './GeneralTypeHandler';

export default class NHKOndemandTypeHandler extends GeneralTypeHandler {

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_title() {

        return document
            .querySelector(".player__title")
            .textContent;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_thumbnail() {

        return null; // for fallback;
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    is_main_video(video) {

        return true;
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    set_quality(bitrate) {
        // FIXME: settings 0 - 4 まで HD, 高, 中, 低 の段階で設定することができる
        // document.querySelector(".setting").click();
        // const settings = Array.from(document.querySelector(".player__setting--quality").childNodes)
        //     .filter(e => e.tagName.toLowerCase() === "dd")
        //     .splice(1, 4)
    }

    // eslint-disable-next-line class-methods-use-this
    clear() {

    }
}
