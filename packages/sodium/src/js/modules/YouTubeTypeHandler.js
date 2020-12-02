// @ts-check
import Config from "./Config";
import GeneralTypeHandler from "./GeneralTypeHandler";
import { AdObserver } from "./AdObserver";

class YouTubeTypeHandler extends GeneralTypeHandler {
    static is_youtube_type() {
        try {
            /** @type {any} */
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

    static can_get_streaming_info() {
        if (YouTubeTypeHandler.is_mobile()) return false;
        //  YouTube for TV
        //  music.youtube.com
        return true;
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

    static async hook_youtube() {
        const { host } = new URL(location.href)
        if (!(host === "www.youtube.com" || host === "m.youtube.com")) return;

        // --- XHR async --- //
        YouTubeTypeHandler.hook_youtube_xhr();

        // --- PLayer async --- //
        YouTubeTypeHandler.hook_youtube_player();
    }

    static async hook_youtube_xhr() {
        const origOpen = XMLHttpRequest.prototype.open
        const origSend = XMLHttpRequest.prototype.send
        XMLHttpRequest.prototype.open = function (...args) {
            // @ts-expect-error
            ([, this.sodiumURL] = args);
            this.addEventListener(`load`, (event) => {
                // @ts-expect-error
                this.sodiumEnd = performance.now();
                // @ts-expect-error
                this.sodiumEndDate = Date.now();
                let url;
                // @ts-expect-error
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
                    const id = url.searchParams.get('id');
                    if (!YouTubeTypeHandler.trackingId && id) YouTubeTypeHandler.trackingId = id;
                    if (YouTubeTypeHandler.trackingId === id) {
                        setTimeout(() => {  //  playerオブジェクトがない可能性がある、XHR後のバッファロード処理があるため、1000ms スリープする
                            // @ts-expect-error
                            this.sodiumEndUnplayedBuffer = YouTubeTypeHandler.get_unplayed_buffer_size();
                            YouTubeTypeHandler.add_throughput_history({
                                // @ts-expect-error
                                downloadTime: Math.floor(this.sodiumEnd - this.sodiumStart),
                                // @ts-expect-error
                                throughput: Math.floor(event.loaded * 8 / (this.sodiumEnd - this.sodiumStart) * 1000),
                                downloadSize: Number.parseFloat(event.loaded.toString()),
                                // @ts-expect-error
                                start: this.sodiumStartDate,
                                // @ts-expect-error
                                startUnplayedBufferSize: this.sodiumStartUnplayedBuffer,
                                // @ts-expect-error
                                end: this.sodiumEndDate,
                                // @ts-expect-error
                                endUnplayedBufferSize: this.sodiumStartUnplayedBuffer,
                                itag: url.searchParams.get('itag')
                            });
                            // @ts-expect-error
                            console.log(`VIDEOMARK: load [URL: ${this.sodiumURL
                                }, contents: ${event.loaded
                                // @ts-expect-error
                                }, duration(ms): ${this.sodiumEnd - this.sodiumStart
                                // @ts-expect-error
                                }, duration(Date): ${new Date(this.sodiumStartDate)} - ${new Date(this.sodiumEndDate)
                                // @ts-expect-error
                                }, UnplayedBufferSize: ${this.sodiumStartUnplayedBuffer} - ${this.sodiumEndUnplayedBuffer
                                // @ts-expect-error
                                }, throughput: ${Math.floor(event.loaded * 8 / (this.sodiumEnd - this.sodiumStart) * 1000)
                                }, itag: ${JSON.stringify(url.searchParams.get('itag'))
                                }, id: ${url.searchParams.get('id')}]`);
                        }, 1000);
                    }
                }
            });
            return origOpen.apply(this, args);
        }
        XMLHttpRequest.prototype.send = function (...args) {
            // @ts-expect-error
            this.sodiumStart = performance.now();
            // @ts-expect-error
            this.sodiumStartDate = Date.now();
            // @ts-expect-error
            this.sodiumStartUnplayedBuffer = YouTubeTypeHandler.get_unplayed_buffer_size();
            // try { this.sodiumItag = document.querySelector('#movie_player').getVideoStats().fmt } catch (e) { };
            return origSend.apply(this, args);
        }
    }

    /*
     * ytd-playerにsodium用のフィールド追加
     * 初期化が終わっていない段階で値にアクセスした場合エラー値を返す
     */
    static async hook_youtube_player() {
        let elm;
        for (; ;) {
            elm = document.querySelector('#ytd-player');
            if (elm) break;
            await new Promise(resolve => setTimeout(() => resolve(), 100));
        }
        // @ts-expect-error
        const player = await elm.getPlayerPromise();
        if (!player.sodiumLoadVideoByPlayerVars && !player.sodiumUpdateVideoData && !player.sodiumGetAvailableQualityLevels) {
            // @ts-expect-error
            const ytplayer = window.ytplayer;
            if (ytplayer.config && ytplayer.config.args)
                YouTubeTypeHandler.set_adaptive_formats_json(ytplayer.config.args.player_response);

            player.sodiumLoadVideoByPlayerVars = player.loadVideoByPlayerVars;
            player.sodiumUpdateVideoData = player.updateVideoData;
            player.sodiumGetAvailableQualityLevels = player.getAvailableQualityLevels;
            player.loadVideoByPlayerVars = function (arg) { // thisを変えられないためアロー演算子は使わない
                if (!YouTubeTypeHandler.set_adaptive_formats(arg.player_response)) {
                    if (arg.raw_player_response && arg.raw_player_response.streamingData)
                        YouTubeTypeHandler.set_adaptive_formats(arg.raw_player_response.streamingData.adaptiveFormats);
                }
                return this.sodiumLoadVideoByPlayerVars(arg);
            };
            player.updateVideoData = function (arg) {
                YouTubeTypeHandler.set_adaptive_formats(arg.adaptive_fmts);
                return this.sodiumUpdateVideoData(arg);
            };
        }
    }

    static set_adaptive_formats_json(response) {
        if (!response) return false;
        try {
            const json = JSON.parse(response);
            if (json.streamingData)
                return YouTubeTypeHandler.set_adaptive_formats(json.streamingData.adaptiveFormats);
        } catch (e) {
            console.warn(`VIDEOMARK: YouTube adaptive format data not found ${e.message}`);
        }
        return false;
    }

    static set_adaptive_formats(adaptiveFormats) {
        if(!adaptiveFormats || !adaptiveFormats.length) return false;
        try {
            YouTubeTypeHandler.check_formats(adaptiveFormats);
            YouTubeTypeHandler.sodiumAdaptiveFmts = adaptiveFormats;
            return true;
        } catch (e) {
            console.warn(`VIDEOMARK: YouTube adaptive format data not found ${e.message}`);
        }
        return false;
    }

    static check_formats(adaptiveFormats) {
        let message;
        const formats = YouTubeTypeHandler.convert_adaptive_formats(adaptiveFormats);
        const ret = formats.find(e => {
            let val = !e.itag || !e.bitrate || !e.type || !e.container || !e.codec;
            if (val) {
                message = `itag:${e.itag}, bitrate:${e.bitrate}, type:${e.type}, container:${e.container}, codec:${e.codec}`;
                return val;
            }
            if (e.type === "video") val = !e.fps || !e.size || !e.quality
            if (val) message = `itag:${e.itag}, bitrate:${e.bitrate}, fps:${e.fps}, size:${e.size}, type:${e.type}, container:${e.container}, codec:${e.codec}`;
            return val;
        });
        if (ret) throw new Error(message);
    }

    static add_throughput_history(throughput) {
        YouTubeTypeHandler.throughputHistories.push(throughput);
        YouTubeTypeHandler.throughputHistories = YouTubeTypeHandler.throughputHistories.slice(-Config.get_max_throughput_history_size());
    }

    static get_unplayed_buffer_size() {
        let unplayedBufferSize;
        try {
            /** @type {any} */
            const player = document.querySelector('#movie_player');
            const received = Number.parseFloat(player.getVideoLoadedFraction());
            const duration = Number.parseFloat(player.getDuration());
            if (Number.isNaN(received) || Number.isNaN(duration)) throw new Error(`NaN`);
            unplayedBufferSize = duration * received * 1000;
        } catch (e) {
            unplayedBufferSize = 0;
        }
        return Math.floor(unplayedBufferSize);
    }

    static convert_adaptive_formats(formats) {
        return formats
            .reduce((acc, cur) => {
                const v = Object.assign(cur);
                v.bitrate = v.bitrate ? v.bitrate : v.averageBitrate;
                v.size = v.width && v.height ? `${v.width}x${v.height}` : null;
                v.itag = `${v.itag}`;
                try {
                    const { groups: { type, container, codec } } =
                        /(?<type>\S+)\/(?<container>\S+);(?:\s+)codecs="(?<codec>\S+)"/.exec(v.mimeType);
                    v.type = type;
                    v.container = container;
                    v.codec = codec;
                } catch (e) { /* do nothing */ }
                acc.push(v);
                return acc;
            }, []);
    }

    static get_play_list_info() {
        try {
            const formats = YouTubeTypeHandler.convert_adaptive_formats(YouTubeTypeHandler.sodiumAdaptiveFmts);
            return formats
                .map(e => {
                    return {
                        representationId: e.itag,
                        bps: Number.parseInt(e.bitrate, 10),
                        videoWidth: e.size ? Number.parseInt(e.size.split('x')[0], 10) : -1,
                        videoHeight: e.size ? Number.parseInt(e.size.split('x')[1], 10) : -1,
                        container: e.container,
                        codec: e.codec,
                        fps: e.fps ? Number.parseInt(e.fps, 10) : -1,
                        chunkDuration: YouTubeTypeHandler.DEFAULT_SEGMENT_DURATION,
                        serverIp: new URL(e.url).host
                    };
                })
        } catch (e) {
            return [];
        }
    }

    static get_playable_video_format_list() {
        try {
            const formats = YouTubeTypeHandler.convert_adaptive_formats(YouTubeTypeHandler.sodiumAdaptiveFmts);
            // @ts-expect-error
            const { fmt } = document.querySelector('#movie_player').getVideoStats();
            if (!fmt || !formats) throw new Error('not found');
            const { type } = formats.find(e => e.itag === fmt);
            return formats
                .filter(e => e.type === type)
                .sort((a, b) => Number.parseInt(b.bitrate, 10) - Number.parseInt(a.bitrate, 10));
        } catch (e) {
            return [];
        }
    }

    static get_throughput_info() {
        const itagCache = {};
        const formats = YouTubeTypeHandler.get_playable_video_format_list();
        const histories = YouTubeTypeHandler.throughputHistories
            .splice(0, YouTubeTypeHandler.throughputHistories.length)
            .filter(h => formats.find(f => f.itag === h.itag))
            .reduce((acc, cur) => {
                let bitrate = itagCache[cur.itag];
                if (!bitrate) {
                    try {
                        ({ bitrate } = formats
                            .find(f => f.itag === cur.itag));
                        bitrate = Number.parseInt(bitrate, 10);
                        itagCache[cur.itag] = bitrate;
                    } catch (e) {
                        return acc;
                    }
                }
                acc.push({
                    downloadTime: cur.downloadTime,
                    throughput: cur.throughput,
                    downloadSize: cur.downloadSize,
                    start: cur.start,
                    startUnplayedBufferSize: cur.startUnplayedBufferSize,
                    end: cur.end,
                    endUnplayedBufferSize: cur.endUnplayedBufferSize,
                    bitrate,
                    representationId: cur.itag
                });
                return acc;
            }, []);

        // separate by duration
        return histories.reduce((acc, cur) => {
            // plInfo duration に合わせた形に throughput を変更する
            const downloadDuration = cur.downloadSize / (cur.bitrate / 8);
            if (downloadDuration > (YouTubeTypeHandler.DEFAULT_SEGMENT_DURATION / 1000)) {
                const numOfSegments = Math.round(downloadDuration / (YouTubeTypeHandler.DEFAULT_SEGMENT_DURATION / 1000));
                for (let i = 0; i < numOfSegments; i += 1) {
                    const size = Math.floor(cur.downloadSize / numOfSegments);
                    const time = Math.floor(cur.downloadTime / numOfSegments);
                    const th = Math.floor(size * 8 / time * 1000);
                    acc.push({
                        downloadTime: time,
                        throughput: th,
                        downloadSize: size,
                        start: cur.start,
                        startUnplayedBufferSize: cur.startUnplayedBufferSize,
                        end: cur.end,
                        endUnplayedBufferSize: cur.endUnplayedBufferSize,
                        bitrate: cur.bitrate,
                        representationId: cur.representationId
                    });
                }
            } else {
                acc.push(cur);
            }
            return acc;
        }, []);
    }

    static get_codec_info() {
        /** @type {any} */
        const player = document.querySelector('#movie_player');
        const stats = player.getVideoStats();
        const list = YouTubeTypeHandler.get_play_list_info();
        const video = list.find(e => e.representationId === stats.fmt);
        const audio = list.find(e => e.representationId === stats.afmt);
        return {
            video: {
                container: video ? video.container : null,
                codec: video ? video.codec : null
            },
            audio: {
                container: audio ? audio.container : null,
                codec: audio ? audio.codec : null
            }
        };
    }

    static get_representation() {
        /** @type {any} */
        const player = document.querySelector('#movie_player');
        const stats = player.getVideoStats();
        return {
            video: stats.fmt,
            audio: stats.afmt
        };
    }

    /** @param {HTMLVideoElement} elm */
    constructor(elm) {
        super(elm);
        YouTubeTypeHandler.throughputHistories = [];
        YouTubeTypeHandler.trackingId = null;

        this.elm = elm;
        /** @type {any} */
        this.player = document.querySelector('#movie_player');
        this.adObserver = new AdObserver(this, this.player);
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

    get_audio_bitrate() {
        try {
            if (!YouTubeTypeHandler.can_get_streaming_info()) {
                return -1;
            }

            const { audio } = this.get_streaming_info();

            return Number.parseInt(audio.bitrate, 10);
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
            if (!YouTubeTypeHandler.can_get_streaming_info()) {
                const { optimal_format } = this.player.getVideoStats();
                return optimal_format.endsWith('60') ? 60 : 30;
            }

            const { video } = this.get_streaming_info();

            return Number.parseFloat(video.fps);
        } catch (e) {
            return -1;
        }
    }

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

    get_current_time() {   // TVerのインターフェースと合わせる
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

    get_streaming_info() {
        const stats = this.player.getVideoStats();
        const formats = YouTubeTypeHandler.convert_adaptive_formats(YouTubeTypeHandler.sodiumAdaptiveFmts);
        const video = formats.find(e => e.itag === stats.fmt);
        const audio = formats.find(e => e.itag === stats.afmt);
        return { video, audio };
    }

    is_main_video(video) {
        return this.player.contains(video)
    }

    is_cm() {
        return this.player.classList.contains('ad-showing');
    }

    is_limited() {
        return this.limited;
    }

    set_quality(bitrate) {
        if (!YouTubeTypeHandler.can_get_streaming_info()) {
            return;
        }
        try {
            const { quality_label, itag, type, size } = YouTubeTypeHandler.get_playable_video_format_list()
                .find(e => Number.parseInt(e.bitrate, 10) === bitrate);
            // const quality = YouTubeTypeHandler.qualityLabelTable[quality_label.replace(/[^0-9^\\.]/g, "")];
            const quality = YouTubeTypeHandler.qualityLabelTable[/\d+/.exec(quality_label)[0]];
            if (quality) {
                console.log(`VIDEOMARK: Playback quality [quality:${quality_label}(${quality}), bitrate:${bitrate}, itag:${itag}, type:${type}, size:${size}]`);
                this.player.setPlaybackQualityRange(quality, quality);
            }
        } catch (e) {
            //
        }
    }

    set_max_bitrate(bitrate, resolution) {
        try {
            const { fmt } = this.player.getVideoStats();
            const formats = YouTubeTypeHandler
                .convert_adaptive_formats(YouTubeTypeHandler.sodiumAdaptiveFmts);
            const { container, codec } = formats.find(e => e.itag === fmt);

            const codecCond = new RegExp(`^${codec.split(".")[0]}`);
            const qualityMap = {};
            formats.filter(e => e.type === "video" && e.codec.match(codecCond)).forEach(v => {
                qualityMap[v.quality] = (qualityMap[v.quality] || {fps:0}).fps > v.fps ? qualityMap[v.quality] : v;
            });
            const video = Object.values(qualityMap).sort(({ bitrate: a }, { bitrate: b }) => b - a);

            video.forEach(v => {
              const [audio, audio2] = formats
                  .filter(e => e.type === "audio" && e.container === v.container)
                  .sort(({ bitrate: a }, { bitrate: b }) => b - a);
              v.audio = v.container === "webm" && v.quality === "tiny" && audio2 ? audio2 : audio;
              console.log(`VIDEOMARK: set_max_bitrate(): itag=${v.itag} quality=${v.quality} bitrate=${(v.bitrate+v.audio.bitrate)/1024} fps=${v.fps} container=${v.container} codec=${v.codec}/${v.audio.codec}`);
            });

            const current = video.find(e => e.itag === fmt);
            const resolutionSelect = video.find(e => e.height <= resolution);
            const bitrateSelect = video.find(e => e.bitrate + e.audio.bitrate < bitrate);
            console.log(`VIDEOMARK: set_max_bitrate(): bitrate=${bitrate/1024} resolution=${resolution} container=${container} codec=${codec}`);
            console.log(`VIDEOMARK: set_max_bitrate(): current: quality=${current.quality} bitrate=${(current.bitrate+current.audio.bitrate)/1024}`);
            if (bitrateSelect) console.log(`VIDEOMARK: set_max_bitrate(): bitrateSelect: quality=${bitrateSelect.quality} bitrate=${(bitrateSelect.bitrate+bitrateSelect.audio.bitrate)/1024}`);
            if (resolutionSelect) console.log(`VIDEOMARK: set_max_bitrate(): resolutionSelect: quality=${resolutionSelect.quality} bitrate=${(resolutionSelect.bitrate+resolutionSelect.audio.bitrate)/1024}`);

            let select;
            if (resolutionSelect && bitrateSelect) select = resolutionSelect.bitrate < bitrateSelect.bitrate ? resolutionSelect : bitrateSelect;
            else select = resolutionSelect || bitrateSelect || video[video.length - 1];
            console.log(`VIDEOMARK: set_max_bitrate(): select: quality=${select.quality} bitrate=${(select.bitrate + select.audio.bitrate) / 1024}`);

            if (select.bitrate < current.bitrate) { // 再生中のbitrateより小さい値が設定された場合変更する
                this.player.setPlaybackQualityRange(select.quality, select.quality);
                this.limited = true;
            } else
                console.log(`VIDEOMARK: too small or does not need a change bitrate:${bitrate} not changed`);
        } catch (e) {
            console.warn(`VIDEOMARK: failed to find quality label`);
        }
    }

    set_default_bitrate() {
        this.player.setPlaybackQualityRange("default", "default");
    }
}

YouTubeTypeHandler.qualityLabelTable = {
    '144': 'tiny',
    '240': 'small',
    '360': 'medium',
    '480': 'large',
    '720': 'hd720',
    '1080': 'hd1080',
    '1440': 'hd1440',
    '2160': 'hd2160',
    '2880': 'hd2880',
    '4320': 'highres'
};
YouTubeTypeHandler.DEFAULT_SEGMENT_DURATION = 5000;
YouTubeTypeHandler.sodiumAdaptiveFmts = null;
YouTubeTypeHandler.throughputHistories = [];
YouTubeTypeHandler.trackingId = null;

export default YouTubeTypeHandler;
