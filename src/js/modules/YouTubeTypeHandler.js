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
                !response.streamingData ||
                !(response.streamingData.adaptiveFormats instanceof Array) ||
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

    static mobile_bitrate_table() {
        return {
            tiny: { l: 666666, h: 1000000 },
            small: { l: 666666, h: 1000000 },
            medium: { l: 1000000, h: 1500000 },
            large: { l: 2500000, h: 4000000 },
            hd720: { l: 5000000, h: 7500000 },
            hd1080: { l: 8000000, h: 12000000 },
            highres: { l: 16000000, h: 24000000 }
        }
    }

    constructor(elm) {
        this.elm = elm;
        this.player = document.querySelector('#movie_player');

        this.cm = false;
        this.cm_listeners = [];

        this.observer = new MutationObserver(ms => {
            ms.forEach(m => {
                if (m.attributeName === 'class') {
                    const find = this.player.getAttribute(m.attributeName).split(' ').find(e => e === 'ad-showing')
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
                }
            });
        });
        this.observer.observe(this.player, { attributes: true });
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
            if (YouTubeTypeHandler.is_mobile())
                return this.elm.videoWidth;

            const { video } = this.get_streaming_info();

            return video.width;
        } catch (e) {
            return -1;
        }
    }

    get_video_height() {
        try {
            if (YouTubeTypeHandler.is_mobile())
                return this.elm.videoHeight;

            const { video } = this.get_streaming_info();

            return video.height;
        } catch (e) {
            return -1;
        }
    }

    get_bitrate() {
        try {
            if (YouTubeTypeHandler.is_mobile()) {
                const f = this.get_framerate() === 60 ? 'h' : 'l';
                const q = this.player.getPlaybackQuality();
                return YouTubeTypeHandler.mobile_bitrate_table()[q][f];
            }

            const { video, audio } = this.get_streaming_info();

            return video.bitrate + audio.bitrate;
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
            if (YouTubeTypeHandler.is_mobile()) {
                const { optimal_format } = this.player.getVideoStats();
                return optimal_format.endsWith('60') ? 60 : 30;
            }

            const { video } = this.get_streaming_info();

            return video.fps;
        } catch (e) {
            return -1;
        }
    }

    get_segment_domain() {
        try {
            if (YouTubeTypeHandler.is_mobile()) {
                const video_data = this.player.getVideoStats();
                const { lvh } = video_data;
                return lvh
            }

            const { video } = this.get_streaming_info();

            return new URL(video.url).hostname
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

    is_main_video(video) {
        if (!this.player.contains(video))
            return false;

        return !this.cm;
    }

    add_cm_listener(listener) {
        this.cm_listeners.push(listener);
    }

    clear() {
        this.observer.disconnect();
    }
}
