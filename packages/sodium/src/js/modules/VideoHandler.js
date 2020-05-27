import ParaviTypeHandler from './ParaviTypeHandler';
import TVerTypeHandler from './TVerTypeHandler';
import YouTubeTypeHandler from './YouTubeTypeHandler';
import NicoVideoTypeHandler from './NicoVideoTypeHandler';
import NicoLiveTypeHandler from './NicoLiveTypeHandler';
import FodTypeHandler from './FodTypeHandler';
import NHKOndemandTypeHandler from './NHKOndemandTypeHandler';
import DTVTypeHandler from './DTVTypeHandler';
import AbemaTVVideoTypeHandler from './AbemaTVVideoTypeHandler';
import AbemaTVLiveTypeHandler from './AbemaTVLiveTypeHandler';
import AmazonPrimeVideoTypeHandler from './AmazonPrimeVideoTypeHandler';
import IIJTypeHandler from './IIJTypeHandler';


export default class VideoHandler {
    constructor(elm) {

        this.calQoeFlg = false;
        this.service = null;

        const url = new URL(window.location.href);

        if (ParaviTypeHandler.is_paravi_type()) {
            this.handler = ParaviTypeHandler;
            this.calQoeFlg = true;
            this.service = "paravi";
            // eslint-disable-next-line no-console
            console.log('Paravi Type Handler');
        } else if (TVerTypeHandler.is_tver_type()) {
            this.handler = TVerTypeHandler;
            this.calQoeFlg = true;
            this.service = "tver";
            // eslint-disable-next-line no-console
            console.log('TVer Type Handler');
        } else if (YouTubeTypeHandler.is_youtube_type()) {
            this.handler = new YouTubeTypeHandler(elm);
            this.calQoeFlg = true;
            this.service = "youtube";
            // eslint-disable-next-line no-console
            console.log('YouTube Type Handler');
        } else if (url.host === "www.nicovideo.jp") {
            this.handler = new NicoVideoTypeHandler(elm);
            this.service = "nicovideo";
            // eslint-disable-next-line no-console
            console.log('NicoVideo Type Handler');
        } else if (/live\d.nicovideo.jp/.test(url.host)) {
            this.handler = new NicoLiveTypeHandler(elm);
            this.service = "nicolive";
            // eslint-disable-next-line no-console
            console.log('NicoLive Type Handler');
        } else if (url.host === "i.fod.fujitv.co.jp") {
            this.handler = new FodTypeHandler(elm);
            this.service = "fod";
            // eslint-disable-next-line no-console
            console.log('Fod Type Handler');
        } else if (url.host === "www.nhk-ondemand.jp") {
            this.handler = new NHKOndemandTypeHandler(elm);
            this.service = "nhkondemand";
            // eslint-disable-next-line no-console
            console.log('NHK Ondemand Type Handler');
        } else if (/\S+.video.dmkt-sp.jp/.test(url.host)) {
            this.handler = new DTVTypeHandler(elm);
            this.service = "dtv";
            // eslint-disable-next-line no-console
            console.log('dTV Type Handler');
        } else if (url.host === "abema.tv") {
            if (url.pathname.split('/').indexOf("video") >= 0) {
                this.handler = new AbemaTVVideoTypeHandler(elm);
                this.service = "abematv_video";
                // eslint-disable-next-line no-console
                console.log('Abema TV Video Type Handler');
            } else if (url.pathname.split('/').indexOf("now-on-air") >= 0) {
                this.handler = new AbemaTVLiveTypeHandler(elm);
                this.service = "abematv_live";
                // eslint-disable-next-line no-console
                console.log('Abema TV Live Type Handler');
            } else {
                throw new Error('AbemaTV ignores top page and unknown page video.');
            }
        } else if (url.host === "www.amazon.co.jp") {
            this.handler = new AmazonPrimeVideoTypeHandler(elm);
            this.service = "amazonprimevideo";
            // eslint-disable-next-line no-console
            console.log('Amazon Prime Video Type Handler');
        } else if (url.host === "pr.iij.ad.jp") {
            this.handler = new IIJTypeHandler(elm);
            this.calQoeFlg = true;
            this.service = "iijtwilightconcert";
            // eslint-disable-next-line no-console
            console.log('IIJ Type Handler');
        } else {
            throw new Error('Unknown Type Handler');
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
        let receive = -1;

        if (this.handler instanceof IIJTypeHandler)
            receive = IIJTypeHandler.get_receive_buffer();
        else if (this.handler.get_receive_buffer instanceof Function)
            receive = this.handler.get_receive_buffer();

        return receive;
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

        if (this.handler instanceof YouTubeTypeHandler)
            list = YouTubeTypeHandler.get_play_list_info();
        else if (this.handler.get_play_list_info instanceof Function)
            list = this.handler.get_play_list_info();

        return list;
    }

    // eslint-disable-next-line camelcase
    get_throughput_info() {
        let list = [];

        if (this.handler instanceof YouTubeTypeHandler)
            list = YouTubeTypeHandler.get_throughput_info();
        else if (this.handler.get_throughput_info instanceof Function)
            list = this.handler.get_throughput_info();

        return list;
    }

    // eslint-disable-next-line camelcase
    get_codec_info() {
        let info = {};

        if (this.handler instanceof YouTubeTypeHandler)
            info = YouTubeTypeHandler.get_codec_info();
        else if (this.handler.get_codec_info instanceof Function)
            info = this.handler.get_codec_info();

        return info;
    }

    // eslint-disable-next-line camelcase
    get_representation() {
        let representation = {};

        if (this.handler instanceof YouTubeTypeHandler)
            representation = YouTubeTypeHandler.get_representation();
        else if (this.handler.get_representation instanceof Function)
            representation = this.handler.get_representation();

        return representation;
    }

    // eslint-disable-next-line camelcase
    get_service() {
        return this.service;
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
    is_limited() {
        if (this.handler.is_limited instanceof Function)
            return this.handler.is_limited();
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
    set_max_bitrate(bitrate, resolution) {
        if (this.handler.set_max_bitrate instanceof Function)
            this.handler.set_max_bitrate(bitrate, resolution);
    }

    // eslint-disable-next-line camelcase
    set_default_bitrate() {
        if (this.handler.set_default_bitrate instanceof Function)
            this.handler.set_default_bitrate();
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
