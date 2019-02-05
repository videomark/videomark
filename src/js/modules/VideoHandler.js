import ParaviTypeHandler from './ParaviTypeHandler';
import TVerTypeHandler from './TVerTypeHandler';
import YouTubeHandler from './YouTubeTypeHandler';

export default class VideoHandler {
    constructor(elm) {
        if (ParaviTypeHandler.is_paravi_type()) {
            this.handler = ParaviTypeHandler;
            // eslint-disable-next-line no-console
            console.log('Paravi Type Handler');
        } else if (TVerTypeHandler.is_tver_type()) {
            this.handler = TVerTypeHandler;
            // eslint-disable-next-line no-console
            console.log('TVer Type Handler');
        } else if (YouTubeHandler.is_youtube_type()) {
            this.handler = new YouTubeHandler(elm);
            // eslint-disable-next-line no-console
            console.log('YouTube Type Handler');
        } else {
            throw new Error('unknown type');
        }
    }

    get_duration() {
        return this.handler.get_duration();
    }

    get_video_width() {
        return this.handler.get_video_width();
    }

    get_video_height() {
        return this.handler.get_video_height();
    }

    get_bitrate() {
        return this.handler.get_bitrate();
    }

    get_receive_buffer() {
        return this.handler.get_receive_buffer();
    }

    get_framerate() {
        return this.handler.get_framerate();
    }

    get_segment_domain() {
        return this.handler.get_segment_domain();
    }

    /**
     * 現在の再生位置
     * @param {HTMLElement} video 
     */
    get_current_time(video) {
        return this.handler.get_current_time(video);
    }

    get_video_title() {
        let title;

        if (this.handler.get_video_title instanceof Function)
            title = this.handler.get_video_title();

        if (!title) {
            const og_title = document.querySelector("meta[property='og:title']");
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

    get_video_thumbnail() {
        let thumbnail;

        if (this.handler.get_video_thumbnail instanceof Function)
            thumbnail = this.handler.get_video_thumbnail();

        const og_image = document.querySelector("meta[property='og:image']")
        if (!thumbnail && og_image)
            thumbnail = og_image.content;

        return thumbnail;
    }

    get_id_by_video_holder() {
        let id_by_video_holder;

        if (this.handler.get_id_by_video_holder instanceof Function)
            id_by_video_holder = this.handler.get_id_by_video_holder();

        return id_by_video_holder;
    }

    add_cm_listener(listener) {
        if (this.handler.add_cm_listener instanceof Function)
            this.handler.add_cm_listener(listener);
    }

    clear() {
        if (this.handler.clear instanceof Function)
            this.handler.clear();
    }
}
