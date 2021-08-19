import { parse } from 'mpd-parser';

import Config from "./Config";

export default class ParaviTypeHandler {
    // eslint-disable-next-line camelcase
    static is_paravi_type() {
        try {
            if (videojs &&
                videojs.getAllPlayers instanceof Function &&
                videojs.getAllPlayers().length !== 0 &&
                videojs.getAllPlayers()[0].dash &&
                videojs.getAllPlayers()[0].dash.shakaPlayer &&
                videojs.getAllPlayers()[0].bufferedEnd instanceof Function &&
                videojs.getAllPlayers()[0].duration instanceof Function &&
                videojs.getAllPlayers()[0].currentTime instanceof Function &&
                videojs.getAllPlayers()[0].dash.shakaPlayer.getStats instanceof Function &&
                videojs.getAllPlayers()[0].dash.shakaPlayer.getVariantTracks instanceof Function &&
                videojs.getAllPlayers()[0].dash.shakaPlayer.getMediaElement instanceof Function)
                return true;

            return false;
        } catch (e) {
            return false;
        }
    }

    // eslint-disable-next-line camelcase
    static async hook_paravi() {
        // eslint-disable-next-line no-restricted-globals
        const { host } = new URL(location.href)
        if (host !== "www.paravi.jp") return;

        ParaviTypeHandler.hook_paravi_request();

    }

    // eslint-disable-next-line camelcase
    static hook_paravi_request() {
        const origOpen = XMLHttpRequest.prototype.open
        const origSend = XMLHttpRequest.prototype.send
        const { fetch: origFetch } = window;

        // eslint-disable-next-line func-names, prefer-arrow-callback
        XMLHttpRequest.prototype.open = function (...args) {
            ([, this.sodiumURL] = args);
            this.addEventListener(`load`, (event) => {
                this.sodiumEnd = performance.now();
                this.sodiumEndDate = Date.now();
                try {
                    const contentType = this.getResponseHeader('content-type');
                    const [filename] = new URL(this.sodiumURL).pathname.split('/').slice(-1);
                    if (filename === 'manifest.mpd' && contentType === 'application/dash+xml') { // manifest

                        ParaviTypeHandler.sodiumAdaptiveFmts = parse(String.fromCharCode.apply("", new Uint8Array(this.response)), this.sodiumURL);
                    } else {
                        this.sodiumEndUnplayedBuffer = ParaviTypeHandler.get_unplayed_buffer_size();
                        setTimeout(() => {  //  playerオブジェクトがない可能性がある、XHR後のバッファロード処理があるため、1000ms スリープする
                            ParaviTypeHandler.add_throughput_history({
                                url: this.sodiumURL,
                                downloadTime: Math.floor(this.sodiumEnd - this.sodiumStart),
                                throughput: Math.floor(event.loaded * 8 / (this.sodiumEnd - this.sodiumStart) * 1000),
                                downloadSize: Number.parseFloat(event.loaded),
                                start: this.sodiumStartDate,
                                startUnplayedBufferSize: this.sodiumStartUnplayedBuffer,
                                end: this.sodiumEndDate,
                                endUnplayedBufferSize: this.sodiumEndUnplayedBuffer,
                                itag: this.sodiumItag
                            });
                        }, 1000);
                    }
                } catch (e) { return };

                // eslint-disable-next-line no-console
                console.log(`VIDEOMARK: load [URL: ${this.sodiumURL
                    }, contents: ${event.loaded
                    }, duration(ms): ${this.sodiumEnd - this.sodiumStart
                    }, duration(Date): ${new Date(this.sodiumStartDate)} - ${new Date(this.sodiumEndDate)
                    }, UnplayedBufferSize: ${this.sodiumStartUnplayedBuffer} - ${this.sodiumEndUnplayedBuffer
                    }, throughput: ${Math.floor(event.loaded * 8 / (this.sodiumEnd - this.sodiumStart) * 1000)
                    }, itag: ${this.sodiumItag}]`);
            });
            return origOpen.apply(this, args);
        }
        // eslint-disable-next-line func-names, prefer-arrow-callback
        XMLHttpRequest.prototype.send = function (...args) {
            this.sodiumStart = performance.now();
            this.sodiumStartDate = Date.now();
            this.sodiumStartUnplayedBuffer = ParaviTypeHandler.get_unplayed_buffer_size();
            this.sodiumItag = ParaviTypeHandler.get_video_representation_id();
            return origSend.apply(this, args);
        }

        const hookFunc = async (args) => {
            const [sodiumURL] = args;
            const sodiumItag = ParaviTypeHandler.get_video_representation_id();

            const sodiumStart = performance.now();
            const sodiumStartDate = Date.now();
            const sodiumStartUnplayedBuffer = ParaviTypeHandler.get_unplayed_buffer_size();

            // call origin
            const result = await origFetch(...args);

            // clone response
            const clone = result.clone();

            const sodiumEnd = performance.now();
            const sodiumEndDate = Date.now();
            const sodiumEndUnplayedBuffer = ParaviTypeHandler.get_unplayed_buffer_size();

            const size = clone.headers.get('content-length') || 0;

            try {
                const contentType = clone.headers.get('content-type');
                const [filename] = new URL(sodiumURL).pathname.split('/').slice(-1);
                if (filename === 'manifest.mpd' && contentType === 'application/dash+xml') { // manifest

                    const data = await clone.arrayBuffer();
                    ParaviTypeHandler.sodiumAdaptiveFmts = parse(String.fromCharCode.apply("", new Uint8Array(data)), sodiumURL);
                } else {

                    setTimeout(() => {  //  playerオブジェクトがない可能性がある、XHR後のバッファロード処理があるため、1000ms スリープする
                        ParaviTypeHandler.add_throughput_history({
                            url: sodiumURL,
                            downloadTime: Math.floor(sodiumEnd - sodiumStart),
                            throughput: Math.floor(size * 8 / (sodiumEnd - sodiumStart) * 1000),
                            downloadSize: Number.parseFloat(size),
                            start: sodiumStartDate,
                            startUnplayedBufferSize: sodiumStartUnplayedBuffer,
                            end: sodiumEndDate,
                            endUnplayedBufferSize: sodiumEndUnplayedBuffer,
                            itag: sodiumItag
                        });
                    }, 1000);
                }
            } catch (e) {
                return result;
            }

            // eslint-disable-next-line no-console
            console.log(`VIDEOMARK: load [URL: ${sodiumURL
                }, contents: ${size
                }, duration(ms): ${sodiumEnd - sodiumStart
                }, duration(Date): ${new Date(sodiumStartDate)} - ${new Date(sodiumEndDate)
                }, UnplayedBufferSize: ${sodiumStartUnplayedBuffer} - ${sodiumEndUnplayedBuffer
                }, throughput: ${Math.floor(size * 8 / (sodiumEnd - sodiumStart) * 1000)
                }, itag: ${sodiumItag}]`);

            return result;
        }

        window.fetch = (...args1) => hookFunc(args1);
    }

    // eslint-disable-next-line camelcase
    static add_throughput_history(throughput) {
        console.debug(`add_throughput_history: downloadSize=${throughput.downloadSize}`)
        if (throughput.downloadSize <= 0) return;
        ParaviTypeHandler.throughputHistories.push(throughput);
        ParaviTypeHandler.throughputHistories = ParaviTypeHandler.throughputHistories.slice(-Config.get_max_throughput_history_size());
    }

    // eslint-disable-next-line camelcase
    static get_unplayed_buffer_size() {
        let unplayedBufferSize;
        try {
            const received = ParaviTypeHandler.get_receive_buffer();
            const current = ParaviTypeHandler.get_current_time();
            if (Number.isNaN(received) || Number.isNaN(current)) throw new Error(`NaN`);
            unplayedBufferSize = (received - current) * 1000;
            if (unplayedBufferSize < 0)
                throw new Error(`unplayedBufferSize is negative value`);
        } catch (e) {
            unplayedBufferSize = 0;
        }
        return Math.floor(unplayedBufferSize);
    }

    // eslint-disable-next-line camelcase
    static get_video_representation_id() {
        let id;
        try {
            const stat = videojs.getAllPlayers()[0].dash.shakaPlayer.getStats();
            const video = stat.switchHistory.filter(e => e.type === 'video');
            if (!video || video.length === 0)
                return null;
            ({ id } = video[video.length - 1]);
        } catch (e) { /* DO NOTHING */ }
        return id;
    }

    // eslint-disable-next-line camelcase
    static get_play_list_info() {
        try {
            const table = videojs.getAllPlayers()[0].dash.shakaPlayer.getVariantTracks()
                .map(e => ({ bitrate: e.videoBandwidth, id: e.videoId, fps: e.frameRate }))
                .reduce((acc, cur) => {
                    if (acc.find(e => e.bitrate === cur.bitrate)) return acc;
                    acc.push(cur);
                    return acc;
                }, []);
            const formats = ParaviTypeHandler.sodiumAdaptiveFmts.playlists
            return formats
                .reduce((acc, cur) => {
                    const { id: representationId, fps } = table
                        .find(e => e.bitrate === cur.attributes.BANDWIDTH)
                    if (!representationId) return acc;
                    const { attributes: { RESOLUTION: { width: videoWidth, height: videoHeight }, BANDWIDTH: bps },
                        targetDuration: chunkDuration,
                        segments: [{ resolvedUri }] } = cur;
                    acc.push({
                        representationId,
                        bps,
                        videoWidth,
                        videoHeight,
                        fps,
                        chunkDuration: Math.floor(chunkDuration * 1000),
                        serverIp: new URL(resolvedUri).host
                    });
                    return acc;
                }, [])
        } catch (e) { return [] }
    }

    // eslint-disable-next-line camelcase
    static get_throughput_info() {
        try {
            const segmentFilter = ParaviTypeHandler.sodiumAdaptiveFmts.playlists
                .reduce((acc, cur) => {
                    try {
                        const { segments: [{ resolvedUri }], attributes: { BANDWIDTH: bitrate } } = cur;
                        const url = new URL(resolvedUri);
                        acc.push({
                            prefix: `${url.origin}${url.pathname.split('/').slice(0, -1).join('/')}`,
                            bitrate
                        });
                    } catch (e) { /* DO NOTHING */ }
                    return acc;
                }, []);

            return ParaviTypeHandler.throughputHistories
                .splice(0, ParaviTypeHandler.throughputHistories.length)
                .filter(h =>
                    segmentFilter
                        .find(e => h.url.includes(e.prefix))
                )
                .filter(h => h.itag)
                .reduce((acc, cur) => {
                    if (!cur.itag) return acc;
                    const { bitrate } = segmentFilter
                        .find(e => cur.url.includes(e.prefix))
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
        } catch (e) { return [] }
    }

    // eslint-disable-next-line camelcase
    static get_duration() {
        const duration = videojs.getAllPlayers()[0].duration();

        return duration && Number.isFinite(duration) ? duration : -1;
    }

    // eslint-disable-next-line camelcase
    static get_video_width() {
        return videojs.getAllPlayers()[0].dash.shakaPlayer.getStats().width;
    }

    // eslint-disable-next-line camelcase
    static get_video_height() {
        return videojs.getAllPlayers()[0].dash.shakaPlayer.getStats().height;
    }

    // eslint-disable-next-line camelcase
    static get_bitrate() {
        const stat = videojs.getAllPlayers()[0].dash.shakaPlayer.getStats();
        const vt = videojs.getAllPlayers()[0].dash.shakaPlayer.getVariantTracks();
        if (!stat || !vt)
            return null;

        const audio = stat.switchHistory.filter(e => e.type === 'audio');
        const video = stat.switchHistory.filter(e => e.type === 'video');
        if (!audio || audio.length === 0 || !video || video.length === 0)
            return null;

        const variant = vt
            .find(e => e.audioId === audio[audio.length - 1].id &&
                e.videoId === video[video.length - 1].id);
        if (!variant)
            return null;

        return variant.videoBandwidth;
    }

    // eslint-disable-next-line camelcase
    static get_video_bitrate() {
        return ParaviTypeHandler.get_bitrate();
    }

    // eslint-disable-next-line camelcase
    static get_receive_buffer() {
        return videojs.getAllPlayers()[0].bufferedEnd();
    }

    // eslint-disable-next-line camelcase
    static get_framerate() {
        return -1;
    }

    // eslint-disable-next-line camelcase
    static get_segment_domain() {
        return document.domain;
    }

    // eslint-disable-next-line camelcase, no-unused-vars
    static get_current_time(video) {    // TVerのインターフェースと合わせる
        return videojs.getAllPlayers()[0].currentTime();
    }

    static set_max_bitrate(bitrate, resolution) {
        if (!Number.isFinite(resolution)) return;

        const settings = JSON.parse(localStorage.getItem("settings") || '{"playbackRate":1,"quality":0}');
        const current = settings.quality;

        const selectedQuality = ParaviTypeHandler.qualityLabelTable.find(row => row.resolution <= resolution);
        const selected = selectedQuality ? selectedQuality.quality : 4; // さくさく

        if (current === 0 || current < selected) {
            settings.quality = selected;
            localStorage.setItem("settings", JSON.stringify(settings));
        }
    }

    static set_default_bitrate() {
        const settings = JSON.parse(localStorage.getItem("settings") || '{"playbackRate":1,"quality":0}');
        settings.quality = 0;
        localStorage.setItem("settings", JSON.stringify(settings));
    }
}

ParaviTypeHandler.qualityLabelTable = [
    {"resolution":1080, "quality":1},
    {"resolution":720, "quality":2},
    {"resolution":480, "quality":3},
    {"resolution":360, "quality":4},
];
ParaviTypeHandler.sodiumAdaptiveFmts = null;
ParaviTypeHandler.throughputHistories = [];
