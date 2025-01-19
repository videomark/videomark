// @ts-check
import { AdObserver } from './AdObserver';
import GeneralTypeHandler from './GeneralTypeHandler';

export default class FodTypeHandler extends GeneralTypeHandler {
  /** @param {HTMLVideoElement} elm */
  constructor(elm) {
    super(elm);

    if (!this.is_main_video(elm)) {
      throw new Error('video is not main');
    }

    this.adObserver = new AdObserver(this, elm, ['style']);
  }

  /**
   * Parsed JSON-LD content.
   * @type {Record<string, string>}
   */
  get json_ld() {
    try {
      return JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    } catch {
      return {};
    }
  }

  get_video_title() {
    return this.json_ld.name || document.title;
  }

  get_video_thumbnail() {
    return (
      this.json_ld.thumbnailUrl ||
      /** @type {HTMLMetaElement} */ (document.querySelector('meta[property="og:image"][data-rh]'))
        ?.content ||
      null
    );
  }

  is_main_video(video) {
    const player = /** @type {HTMLVideoElement} */ (
      document.querySelector('video[fpkey="videoPlayer"][src]')
    );

    return video === player && !!player.videoHeight;
  }

  is_cm() {
    return /** @type {HTMLVideoElement[]} */ ([
      ...document.querySelectorAll('video[title="Advertisement"]'),
    ]).some((video) => !!video.videoHeight);
  }
}
