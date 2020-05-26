
import GeneralTypeHandler from "./GeneralTypeHandler";

/* あまり有用な情報は取り出せない */
export default class AbemaTVLiveTypeHandler extends GeneralTypeHandler {

    constructor(elm) {

        super(elm);

        if (!this.is_main_video(elm)) throw new Error("video is not main");

        this.elm = elm;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_duration() {

        /* video.duration には、1FFFFFFFFFFFFF が入っているため使用できない */
        return -1
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_receive_buffer() {

        /* buffered には、現在時刻が入っているため使用できない */
        return -1;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_segment_domain() {
        return document.domain;
    }

    // eslint-disable-next-line camelcase, no-unused-vars, class-methods-use-this
    get_current_time(video) {

        /* currentTime には、現在時刻が入っているため使用できない */
        return -1;
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_title() {

        try {

            return document
                .querySelector(".com-tv-SlotHeading__title")
                .textContent
        } catch (e) {

            return "";
        }
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_video_thumbnail() {

        /* あとから見ることができるような、固定されたサムネイルはなさそう */
        return "";
    }

    // eslint-disable-next-line camelcase, class-methods-use-this
    get_id_by_video_holder() {

        /* チャンネルのジャンルならURLにあるが ID ではない */
        return "";
    }


    /**
    * 複数のCMは、<video> を使い捨てして再生している
    * 判定するの難しい <video> だけで判断はできないかも
    *
    * CMを判断するのが難しいためすべてメインとして送信する。
    * ただし、session:video = 1:1の関係があるため、
    * is_main_videoでは、現在表示中の <video> を一つ選んでいる。
    */
    // eslint-disable-next-line camelcase, class-methods-use-this
    is_main_video(video) {
        try {
          return window.getComputedStyle(video).display === "block";
        } catch (e) {
          return false;
        }
    }

    /**
    * 複数のCMは、<video> を使い捨てして再生している
    * 判定するの難しい <video> だけで判断はできないかも
    *
    * CMを判断するのが難しいためすべてメインとして送信する。
    * ただし、session:video = 1:1の関係があるため、
    * is_main_videoでは、現在表示中の <video> を一つ選んでいる。
    */
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
