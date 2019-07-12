class YouTubeTypeHandler {
    // eslint-disable-next-line camelcase
    static is_youtube_type() {
        try {
            const player = document.querySelector('#movie_player');
            if (!player) return false;

            if (!(player.getVideoStats instanceof Function) ||
                !(player.getCurrentTime instanceof Function) ||
                !(player.getDuration instanceof Function) ||
                !(player.getVideoLoadedFraction instanceof Function) ||
                !(player.getAdState instanceof Function) ||
                !(player.getPlaybackQuality instanceof Function))
                return false;

            if (!YouTubeTypeHandler.can_get_streaming_info()) {
                const q = player.getPlaybackQuality();
                if (!q || q === 'unknown') return false;
                return true;
            }

            if (!(player.getPlayerResponse instanceof Function)) return false;

            const stats = player.getVideoStats();
            const response = player.getPlayerResponse();

            if (!stats.fmt ||
                !stats.afmt ||
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

    // eslint-disable-next-line camelcase
    static can_get_streaming_info() {
        if (YouTubeTypeHandler.is_mobile()) return false;
        //  YouTube for TV
        //  music.youtube.com
        return true;
    }

    // eslint-disable-next-line camelcase
    static is_mobile() {
        // eslint-disable-next-line no-restricted-globals
        return new URL(location.href).host === "m.youtube.com";
    }

    // eslint-disable-next-line camelcase
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

    // eslint-disable-next-line camelcase
    static async hook_youtube() {
        // eslint-disable-next-line no-restricted-globals
        const { host } = new URL(location.href)
        if (!(host === "www.youtube.com" || host === "m.youtube.com")) return;

        // --- XHR --- //
        YouTubeTypeHandler.hook_youtube_xhr();

        // --- PLayer --- //
        YouTubeTypeHandler.hook_youtube_player();
    }

    // eslint-disable-next-line camelcase
    static async hook_youtube_xhr() {
        const origOpen = XMLHttpRequest.prototype.open
        const origSend = XMLHttpRequest.prototype.send
        // eslint-disable-next-line func-names, prefer-arrow-callback
        XMLHttpRequest.prototype.open = function (...args) {
            ([, this.sodiumURL] = args);
            this.addEventListener(`load`, (event) => {
                this.sodiumEnd = performance.now();
                let url;
                try { url = new URL(this.sodiumURL); } catch (e) { return };
                if (
                    // --- 動画ページ --- //
                    (url.host === 'www.youtube.com' &&
                        url.pathname.endsWith('watch') &&
                        url.searchParams.get('v')) ||
                    // --- get_video_info --- //
                    (url.host === 'www.youtube.com' &&
                        url.pathname.endsWith('get_video_info')) ||
                    // --- chunk --- //
                    (url.host.endsWith('googlevideo.com') &&
                        url.pathname.endsWith('videoplayback'))
                ) {
                    YouTubeTypeHandler.add_throughput_history({
                        downloadTime: Math.floor(this.sodiumEnd - this.sodiumStart),
                        throughput: Math.floor(event.loaded * 8 / (this.sodiumEnd - this.sodiumStart) * 1000),
                        downloadSize: Number.parseFloat(event.loaded),
                        itag: url.searchParams.get('itag')
                    });
                    this.sodiumThroughput = Math.floor(event.loaded * 8 * 1000 / (this.sodiumEnd - this.sodiumStart));
                    console.log(`load [URL: ${this.sodiumURL}, contents: ${event.loaded}, end:${this.sodiumEnd}, duration: ${
                        this.sodiumEnd - this.sodiumStart}, throughput: ${this.sodiumThroughput}, itag: ${JSON.stringify(url.searchParams.get('itag'))}]`);
                }
            });
            return origOpen.apply(this, args);
        }
        // eslint-disable-next-line func-names, prefer-arrow-callback
        XMLHttpRequest.prototype.send = function (...args) {
            this.sodiumStart = performance.now();
            // eslint-disable-next-line no-empty
            // try { this.sodiumItag = document.querySelector('#movie_player').getVideoStats().fmt } catch (e) { };
            return origSend.apply(this, args);
        }
    }

    // eslint-disable-next-line camelcase
    static async hook_youtube_player() {
        let elm;
        for (; ;) {
            elm = document.querySelector('#ytd-player');
            if (elm) break;
            // eslint-disable-next-line no-await-in-loop
            await new Promise(resolve => setTimeout(() => resolve(), 100));
        }
        const player = await elm.getPlayerPromise();
        if (!player.sodiumLoadVideoByPlayerVars && !player.sodiumUpdateVideoData) {
            // eslint-disable-next-line no-undef
            YouTubeTypeHandler.sodiumAdaptiveFmts = ytplayer.config ? ytplayer.config.args.adaptive_fmts : null;
            player.sodiumLoadVideoByPlayerVars = player.loadVideoByPlayerVars;
            player.sodiumUpdateVideoData = player.updateVideoData;
            // eslint-disable-next-line func-names, prefer-arrow-callback
            player.loadVideoByPlayerVars = function (arg) { // thisを変えられないためアロー演算子は使わない
                YouTubeTypeHandler.sodiumAdaptiveFmts = arg.adaptive_fmts;
                return this.sodiumLoadVideoByPlayerVars(arg);
            }
            // eslint-disable-next-line func-names, prefer-arrow-callback
            player.updateVideoData = function (arg) {
                if (arg.adaptive_fmts && arg.adaptive_fmts.length > 0)
                    YouTubeTypeHandler.sodiumAdaptiveFmts = arg.adaptive_fmts;
                return this.sodiumUpdateVideoData(arg);
            }
        }
    }

    // eslint-disable-next-line camelcase
    static add_throughput_history(throughput) {
        YouTubeTypeHandler.throughputHistories.push(throughput);
        YouTubeTypeHandler.throughputHistories.slice(-100);
    }

    /**
     * ytd-palyerにsodium用のフィールド追加
     * 初期化が終わっていない段階で値にアクセスした場合エラー値を返す
     */
    // eslint-disable-next-line camelcase
    static async hook_loadVideoByPlayerVars() {
        // eslint-disable-next-line no-restricted-globals
        const { host } = new URL(location.href)
        if (!(host === "www.youtube.com" || host === "m.youtube.com")) return;

        let elm;
        for (; ;) {
            elm = document.querySelector('#ytd-player');
            if (elm) break;
            // eslint-disable-next-line no-await-in-loop
            await new Promise(resolve => setTimeout(() => resolve(), 300));
        }
        const player = await elm.getPlayerPromise();
        if (!player.sodiumHookedFunc) {
            //  console.log('--- registering ---');
            // eslint-disable-next-line no-undef
            YouTubeTypeHandler.sodiumAdaptiveFmts = ytplayer.config ? ytplayer.config.args.adaptive_fmts : null;
            player.sodiumHookedFunc = player.loadVideoByPlayerVars;
            player.sodiumHookedFunc2 = player.updateVideoData;
            // eslint-disable-next-line func-names, prefer-arrow-callback
            player.loadVideoByPlayerVars = function (arg) { // thisを変えられないためアロー演算子は使わない
                YouTubeTypeHandler.sodiumAdaptiveFmts = arg.adaptive_fmts;
                return this.sodiumHookedFunc(arg);
            }
            // eslint-disable-next-line func-names, prefer-arrow-callback
            player.updateVideoData = function (arg) {
                if (arg.adaptive_fmts && arg.adaptive_fmts.length > 0)
                    YouTubeTypeHandler.sodiumAdaptiveFmts = arg.adaptive_fmts;
                return this.sodiumHookedFunc2(arg);
            }
        }
    }

    // eslint-disable-next-line camelcase
    static convert_adaptive_formats(str) {
        const ret = [];
        // eslint-disable-next-line no-undef
        decodeURIComponent(str)
            .split(',')
            .forEach(s => {
                const l = {};
                s
                    .split('&')
                    .forEach(ss => {
                        const [key, value] = ss.split('=');
                        l[key] = value;
                    });
                ret.push(l);
            })
        return ret;
    }

    // eslint-disable-next-line camelcase
    static get_play_list_info() {
        const formats = YouTubeTypeHandler.convert_adaptive_formats(YouTubeTypeHandler.sodiumAdaptiveFmts);
        if (!formats) return [];
        return formats
            .filter(e => /^video/.test(e.type))
            .map(e => ({
                representationId: e.itag,
                bps: Number.parseInt(e.bitrate, 10),
                videoWidth: Number.parseInt(e.size.split('x')[0], 10),
                videoHeight: Number.parseInt(e.size.split('x')[1], 10),
                fps: Number.parseInt(e.fps, 10),
                chunkDuration: 5000,
                serverIp: new URL(e.url).host
            }))
            .sort((a, b) => b.bps - a.bps);
    }

    // eslint-disable-next-line camelcase
    static get_throughput_info() {
        const itagCache = {};
        const formats = YouTubeTypeHandler.convert_adaptive_formats(YouTubeTypeHandler.sodiumAdaptiveFmts);
        const histories = YouTubeTypeHandler.throughputHistories
            .slice()
            .filter(h => {
                const format = formats.find(f => f.itag === h.itag);
                if (!format) return false;
                return /^video/.test(format.type);
            })
            .map(h => {
                let bitrate = itagCache[h.itag];
                if (!bitrate) {
                    ({ bitrate } = formats
                        .find(f => f.itag === h.itag));
                    bitrate = Number.parseInt(bitrate, 10);
                    itagCache[h.itag] = bitrate;
                }
                return {
                    downloadTime: h.downloadTime,
                    throughput: h.throughput,
                    downloadSize: h.downloadSize,
                    bitrate,
                }
            })
            .filter(h => h.bitrate);
        YouTubeTypeHandler.throughputHistories = [];
        return histories;
    }

    constructor(elm) {
        this.elm = elm;
        this.player = document.querySelector('#movie_player');

        this.cm = false;
        this.cm_listeners = [];

        this.observer = new MutationObserver(ms => {
            ms.forEach(() => {
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

    // eslint-disable-next-line camelcase
    get_duration() {
        try {
            const duration = this.player.getDuration();

            return !duration || Number.isNaN(duration) ? -1 : duration;
        } catch (e) {
            return -1;
        }
    }

    // eslint-disable-next-line camelcase
    get_video_width() {
        try {
            return this.elm.videoWidth;
        } catch (e) {
            return -1;
        }
    }

    // eslint-disable-next-line camelcase
    get_video_height() {
        try {
            return this.elm.videoHeight;
        } catch (e) {
            return -1;
        }
    }

    // eslint-disable-next-line camelcase
    get_bitrate() {
        try {
            if (!YouTubeTypeHandler.can_get_streaming_info()) {
                const f = this.get_framerate() === 60 ? 'h' : 'l';
                const q = this.player.getPlaybackQuality();
                return YouTubeTypeHandler.bitrate_table()[q][f];
            }

            const { video, audio } = this.get_streaming_info();

            return Number.parseInt(video.bitrate, 10) + Number.parseInt(audio.bitrate, 10);
        } catch (e) {
            return -1;
        }
    }

    // eslint-disable-next-line camelcase
    get_video_bitrate() {
        try {
            if (!YouTubeTypeHandler.can_get_streaming_info()) {
                return -1;
            }

            const { video } = this.get_streaming_info();

            return Number.parseInt(video.bitrate, 10);
        } catch (e) {
            return -1;
        }
    }

    // eslint-disable-next-line camelcase
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

    // eslint-disable-next-line camelcase
    get_framerate() {
        try {
            if (!YouTubeTypeHandler.can_get_streaming_info()) {
                // eslint-disable-next-line camelcase
                const { optimal_format } = this.player.getVideoStats();
                return optimal_format.endsWith('60') ? 60 : 30;
            }

            const { video } = this.get_streaming_info();

            return Number.parseFloat(video.fps, 10);
        } catch (e) {
            return -1;
        }
    }

    // eslint-disable-next-line camelcase
    get_segment_domain() {
        try {
            if (!YouTubeTypeHandler.can_get_streaming_info()) {
                const { lvh } = this.player.getVideoStats();
                return lvh
            }

            const { video } = this.get_streaming_info();

            return new URL(video.url).hostname
        } catch (e) {
            return null;
        }
    }

    // eslint-disable-next-line camelcase, no-unused-vars
    get_current_time(video) {   // TVerのインターフェースと合わせる
        try {
            return this.player.getCurrentTime();
        } catch (e) {
            return -1;
        }
    }

    // eslint-disable-next-line camelcase
    get_video_title() {
        let title;

        try {
            ({ title } = this.player.getVideoData());
        } catch (e) {
            return title;
        }

        return title;
    }

    // eslint-disable-next-line camelcase
    get_video_thumbnail() {
        let url;

        if (!YouTubeTypeHandler.can_get_streaming_info()) {
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

    // eslint-disable-next-line camelcase
    get_id_by_video_holder() {
        let videoId;

        if (!YouTubeTypeHandler.can_get_streaming_info()) {
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

    // eslint-disable-next-line camelcase
    get_view_count() {
        try {
            if (!YouTubeTypeHandler.can_get_streaming_info()) {
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

    // eslint-disable-next-line camelcase
    get_streaming_info() {
        const stats = this.player.getVideoStats();
        const formats = YouTubeTypeHandler.convert_adaptive_formats(YouTubeTypeHandler.sodiumAdaptiveFmts);
        const video = formats.find(e => e.itag === stats.fmt);
        const audio = formats.find(e => e.itag === stats.afmt);
        return { video, audio };
    }

    // eslint-disable-next-line camelcase
    is_main_video(video) {
        return this.player.contains(video)
    }

    // eslint-disable-next-line camelcase, no-unused-vars
    is_cm(video) {
        return this.cm;
    }

    // eslint-disable-next-line camelcase
    add_cm_listener(listener) {
        this.cm_listeners.push(listener);
    }

    clear() {
        this.observer.disconnect();
    }
}

YouTubeTypeHandler.sodiumAdaptiveFmts = null;
YouTubeTypeHandler.throughputHistories = [];

export default YouTubeTypeHandler;
