export default class ParaviTypeHandler {

    static get_duration() {
        const duration = videojs.getAllPlayers()[0].duration();

        return !duration || Number.isNaN(duration) ? -1 : duration;
    }

    static get_video_width() {
        return videojs.getAllPlayers()[0].dash.shakaPlayer.getStats().width;
    }

    static get_video_height() {
        return videojs.getAllPlayers()[0].dash.shakaPlayer.getStats().height;
    }

    static get_bitrate() {
        const stat = videojs.getAllPlayers()[0].dash.shakaPlayer.getStats();
        const variant_tracks = videojs.getAllPlayers()[0].dash.shakaPlayer.getVariantTracks();
        if (!stat || !variant_tracks)
            return null;

        const audio = stat.switchHistory.filter(e => e.type === 'audio');
        const video = stat.switchHistory.filter(e => e.type === 'video');
        if (!audio || audio.length === 0 || !video || video.length === 0)
            return null;

        const variant = variant_tracks
            .find(e => e.audioId === audio[audio.length - 1].id &&
                e.videoId === video[video.length - 1].id);
        if (!variant)
            return null;

        return variant.videoBandwidth;
    }

    static get_receive_buffer() {
        return videojs.getAllPlayers()[0].bufferedEnd();
    }

    static get_framerate() {
        return -1;
    }

    static get_segment_domain() {
        return document.domain;
    }

    // eslint-disable-next-line no-unused-vars
    static get_current_time(video) {    // TVerのインターフェースと合わせる
        return videojs.getAllPlayers()[0].currentTime();
    }

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
}
