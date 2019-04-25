export default class YouTubeTypeHandler {
    static is_youtube_type() {
        try {

            const player = document.querySelector('#movie_player');
            if (!player)
                return false;

            if (!(player.getVideoStats instanceof Function) ||
                !(player.getCurrentTime instanceof Function) ||
                !(player.getDuration instanceof Function) ||
                !(player.getVideoLoadedFraction instanceof Function) ||
                !(player.getAdState instanceof Function) ||
                !(player.getPlaybackQuality instanceof Function))

                return false;

            if (YouTubeTypeHandler.is_mobile()) {
                const q = player.getPlaybackQuality();
                if (!q || q === 'unknown')
                    return false;
                return true;
            }


            if (!(player.getPlayerResponse instanceof Function))
                return false;

            const stats = player.getVideoStats();
            const response = player.getPlayerResponse();

            if (!stats.fmt ||
                !stats.afmt ||
                //  !response.streamingData ||
                //  !(response.streamingData.adaptiveFormats instanceof Array) ||
                !response.videoDetails ||
                !response.videoDetails.title ||
                !response.videoDetails.thumbnail ||
                !(response.videoDetails.thumbnail.thumbnails instanceof Array))
                return false;

            return true;
        } catch (e) {
            return false;
        }
    }

    static is_mobile() {
        return new URL(location.href).host === "m.youtube.com";
    }

    static bitrate_table() {
        return {
            tiny: { l: 666666, h: 1000000 },
            small: { l: 666666, h: 1000000 },
            medium: { l: 1000000, h: 1500000 },
            large: { l: 2500000, h: 4000000 },
            hd720: { l: 5000000, h: 7500000 },
            hd1080: { l: 8000000, h: 12000000 },
            hd1440: { l: 16000000, h: 24000000 },
            hd2160: { l: 45000000, h: 68000000 },
            highres: { l: 45000000, h: 68000000 }
        }
    }

    constructor(elm) {
        this.elm = elm;
        this.player = document.querySelector('#movie_player');

        this.cm = false;
        this.cm_listeners = [];

        this.observer = new MutationObserver(ms => {
            ms.forEach(m => {
                const find = this.player.classList.contains('ad-showing');
                if (this.cm && !find) {
                    this.cm = false;
                    this.cm_listeners.forEach(e => e.call(null, {
                        cm: this.cm,
                        pos: this.get_current_time(null),
                        time: Date.now()
                    }));
                } else if (!this.cm && find) {
                    this.cm = true;
                    this.cm_listeners.forEach(e => e.call(null, {
                        cm: this.cm,
                        pos: this.get_current_time(null),
                        time: Date.now()
                    }));
                }
            });
        });
        this.observer.observe(this.player, { attributes: true, attributeFilter: ['class'] });
    }

    get_duration() {
        try {
            const duration = this.player.getDuration();

            return !duration || Number.isNaN(duration) ? -1 : duration;
        } catch (e) {
            return -1;
        }
    }

    get_video_width() {
        try {
            return this.elm.videoWidth;
        } catch (e) {
            return -1;
        }
    }

    get_video_height() {
        try {
            return this.elm.videoHeight;
        } catch (e) {
            return -1;
        }
    }

    get_bitrate() {
        try {
            const q = this.player.getPlaybackQuality();
            const f = this.get_framerate() === 60 ? 'h' : 'l';
            return YouTubeTypeHandler.bitrate_table()[q][f];
        } catch (e) {
            return -1;
        }
    }

    get_receive_buffer() {
        try {
            const received = Number.parseFloat(this.player.getVideoLoadedFraction());
            const duration = Number.parseFloat(this.player.getDuration());

            if (Number.isNaN(duration) || Number.isNaN(received))
                throw new Error('NaN');

            return duration * received;
        } catch (e) {
            return -1;
        }
    }

    get_framerate() {
        try {
            const { optimal_format } = this.player.getVideoStats();
            return optimal_format.endsWith('60') ? 60 : 30;
        } catch (e) {
            return -1;
        }
    }

    get_segment_domain() {
        try {
            const { lvh } = this.player.getVideoStats();
            return lvh
        } catch (e) {
            return null;
        }
    }

    // eslint-disable-next-line no-unused-vars
    get_current_time(video) {   // TVerのインターフェースと合わせる
        try {
            return this.player.getCurrentTime();
        } catch (e) {
            return -1;
        }
    }

    get_video_title() {
        let title;

        try {
            ({ title } = this.player.getVideoData());
        } catch (e) {
            return title;
        }

        return title;
    }

    get_video_thumbnail() {
        let url;

        if (YouTubeTypeHandler.is_mobile()) {
            const i = this.get_id_by_video_holder();
            return `https://img.youtube.com/vi/${i}/hqdefault.jpg`;
        }

        try {
            const { videoDetails: { thumbnail: { thumbnails } } } = this.player.getPlayerResponse();
            const thumbnail = thumbnails[thumbnails.length - 1];

            ({ url } = thumbnail);
        } catch (e) {
            return url;
        }
        return url;
    }

    get_id_by_video_holder() {
        let videoId;

        if (YouTubeTypeHandler.is_mobile()) {
            const q = this.player.getPlaybackQuality();
            if (!q || q === 'unknown')
                return videoId;
            ({ video_id: videoId } = this.player.getVideoData());
            return videoId;
        }

        if (!(this.player.getPlayerResponse instanceof Function))
            return videoId;

        const response = this.player.getPlayerResponse();
        if (!response)
            return videoId;

        try {
            ({ videoDetails: { videoId } } = response);
        } catch (e) {
            return videoId;
        }
        return videoId;
    }

    get_view_count() {
        try {
            if (YouTubeTypeHandler.is_mobile()) {
                const e = document.querySelector('.slim-video-metadata-title-and-badges div span span');
                if (!e) throw new Error();
                const s = e.getAttribute('aria-label');
                if (!s) throw new Error();
                const n = s.match(/\d/g);
                if (!n) throw new Error();
                return Number.parseInt(n.join(''), 10);
            }
            const { videoDetails: { viewCount } } = this.player.getPlayerResponse();
            if (!viewCount) throw new Error();
            return Number.parseInt(viewCount, 10);
        } catch (e) {
            return -1;
        }
    }

    /*
        get_streaming_info() {
            const stats = this.player.getVideoStats();
            const response = this.player.getPlayerResponse();
    
            if (!stats || !stats.fmt || !stats.afmt || !response || !response.streamingData ||
                !response.streamingData.adaptiveFormats)
                return null;
    
            let video = response.streamingData.adaptiveFormats.find(e => e.itag === Number.parseInt(stats.fmt, 10));
            if (!video && response.streamingData.formats)
                video = response.streamingData.formats.find(e => e.itag === Number.parseInt(stats.fmt, 10));
    
            let audio = response.streamingData.adaptiveFormats.find(e => e.itag === Number.parseInt(stats.afmt, 10));
            if (!audio && response.streamingData.formats)
                audio = response.streamingData.formats.find(e => e.itag === Number.parseInt(stats.afmt, 10));
    
            return { video, audio };
        }
    */

    is_main_video(video) {
        return this.player.contains(video)
    }

    is_cm(video) {
        return this.cm;
    }

    add_cm_listener(listener) {
        this.cm_listeners.push(listener);
    }

    clear() {
        this.observer.disconnect();
    }
}
