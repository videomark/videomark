import ParaviTypeHandler from './ParaviTypeHandler';
import TVerTypeHandler from './TVerTypeHandler';
import YouTubeTypeHandler from './YouTubeTypeHandler';
import GeneralTypeHandler from './GeneralTypeHandler';
import NicoVideoTypeHandler from './NicoVideoTypeHandler';

export default class VideoHandler {
    constructor(elm) {

        this.calQoeFlg = false;
        const url = new URL(window.location.href);

        if (ParaviTypeHandler.is_paravi_type()) {
            this.handler = ParaviTypeHandler;
            this.calQoeFlg = true;
            // eslint-disable-next-line no-console
            console.log('Paravi Type Handler');
        } else if (TVerTypeHandler.is_tver_type()) {
            this.handler = TVerTypeHandler;
            this.calQoeFlg = true;
            // eslint-disable-next-line no-console
            console.log('TVer Type Handler');
        } else if (YouTubeTypeHandler.is_youtube_type()) {
            this.handler = new YouTubeTypeHandler(elm);
            this.calQoeFlg = true;
            // eslint-disable-next-line no-console
            console.log('YouTube Type Handler');
        } else if (url.host === "www.nicovideo.jp") {
            this.handler = new NicoVideoTypeHandler(elm);
            // eslint-disable-next-line no-console
            console.log('NicoVideo Type Handler');
        } else {
            // TODO この判定は、session でやるべき
            if (url.host === "www.youtube.com" ||
                url.host === "m.youtube.com" ||
                url.host === "www.paravi.jp" ||
                url.host === "tver.jp") {
                throw new Error("hostname is qoe target but not played");
            }
            this.handler = new GeneralTypeHandler(elm);
            // eslint-disable-next-line no-console
            console.log('Unknown Type Handler');
        }
    }

    // eslint-disable-next-line camelcase
    get_duration() {
        return this.handler.get_duration();
    }

    // eslint-disable-next-line camelcase
    get_video_width() {
        return this.handler.get_video_width();
    }

    // eslint-disable-next-line camelcase
    get_video_height() {
        return this.handler.get_video_height();
    }

    // eslint-disable-next-line camelcase
    get_bitrate() {
        return this.handler.get_bitrate();
    }

    // eslint-disable-next-line camelcase
    get_video_bitrate() {
        let videoBitrate = -1;

        if (this.handler.get_video_bitrate instanceof Function)
            videoBitrate = this.handler.get_video_bitrate()

        return videoBitrate;
    }

    // eslint-disable-next-line camelcase
    get_receive_buffer() {
        return this.handler.get_receive_buffer();
    }

    // eslint-disable-next-line camelcase
    get_framerate() {
        return this.handler.get_framerate();
    }

    // eslint-disable-next-line camelcase
    get_segment_domain() {
        return this.handler.get_segment_domain();
    }

    /**
     * 現在の再生位置
     * @param {HTMLElement} video 
     */
    // eslint-disable-next-line camelcase
    get_current_time(video) {
        return this.handler.get_current_time(video);
    }

    // eslint-disable-next-line camelcase
    get_video_title() {
        let title;

        if (this.handler.get_video_title instanceof Function)
            title = this.handler.get_video_title();

        if (!title) {
            // eslint-disable-next-line camelcase
            const og_title = document.querySelector("meta[property='og:title']");
            // eslint-disable-next-line camelcase
            if (og_title)
                title = og_title.content;

            if (!title)
                ({ title } = document);

            let separator = -1;
            if (title.indexOf('｜') !== -1) {
                separator = title.indexOf('｜');
            } else if (title.indexOf('|') !== -1) {
                separator = title.indexOf('|');
            }

            if (separator !== -1)
                title = title.substr(0, separator).trim();
            else
                title = title.trim();
        }

        return title;
    }

    // eslint-disable-next-line camelcase
    get_video_thumbnail() {
        let thumbnail;

        if (this.handler.get_video_thumbnail instanceof Function)
            thumbnail = this.handler.get_video_thumbnail();
        // eslint-disable-next-line camelcase
        const og_image = document.querySelector("meta[property='og:image']")
        // eslint-disable-next-line camelcase
        if (!thumbnail && og_image)
            thumbnail = og_image.content;

        return thumbnail;
    }

    // eslint-disable-next-line camelcase
    get_id_by_video_holder() {
        // eslint-disable-next-line camelcase
        let id_by_video_holder;

        if (this.handler.get_id_by_video_holder instanceof Function)
            // eslint-disable-next-line camelcase
            id_by_video_holder = this.handler.get_id_by_video_holder();

        // eslint-disable-next-line camelcase
        return id_by_video_holder;
    }

    // eslint-disable-next-line camelcase
    get_view_count() {
        // eslint-disable-next-line camelcase
        let view_count = -1;

        if (this.handler.get_view_count instanceof Function)
            // eslint-disable-next-line camelcase
            view_count = this.handler.get_view_count();

        // eslint-disable-next-line camelcase
        return view_count;
    }

    // eslint-disable-next-line camelcase
    get_play_list_info() {
        let list = [];

        if (this.handler === ParaviTypeHandler)
            list = ParaviTypeHandler.get_play_list_info();
        if (this.handler instanceof YouTubeTypeHandler)
            list = YouTubeTypeHandler.get_play_list_info();

        return list;
    }

    // eslint-disable-next-line camelcase
    get_throughput_info() {
        let list = [];

        if (this.handler === ParaviTypeHandler)
            list = ParaviTypeHandler.get_throughput_info();
        else if (this.handler instanceof YouTubeTypeHandler)
            list = YouTubeTypeHandler.get_throughput_info();

        return list;
    }

    // eslint-disable-next-line camelcase
    get_codec_info() {
        let info = {};

        if (this.handler instanceof YouTubeTypeHandler)
            info = YouTubeTypeHandler.get_codec_info();

        return info;
    }

    // eslint-disable-next-line camelcase
    get_representation() {
        let representation = {};

        if (this.handler instanceof YouTubeTypeHandler)
            representation = YouTubeTypeHandler.get_representation();

        return representation;
    }

    // eslint-disable-next-line camelcase
    is_main_video(video) {
        if (this.handler.is_main_video instanceof Function)
            return this.handler.is_main_video(video);
        return true;
    }

    // eslint-disable-next-line camelcase
    is_cm(video) {
        if (this.handler.is_cm instanceof Function)
            return this.handler.is_cm(video);
        return false;
    }

    // eslint-disable-next-line camelcase
    is_calculatable() {
        return this.calQoeFlg;
    }

    // eslint-disable-next-line camelcase
    set_quality(bitrate) {
        if (this.handler.set_quality instanceof Function)
            this.handler.set_quality(bitrate);
    }

    // eslint-disable-next-line camelcase
    add_cm_listener(listener) {
        if (this.handler.add_cm_listener instanceof Function)
            this.handler.add_cm_listener(listener);
    }

    clear() {
        if (this.handler.clear instanceof Function)
            this.handler.clear();
    }
}
