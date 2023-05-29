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

  get_video_title() {
    try {
      return document.querySelector('#header_banner').textContent;
    } catch (e) {
      return '';
    }
  }

  get_video_thumbnail() {
    return null; // for fallback
  }

  is_main_video(video) {
    const [main] = Array.from(document.querySelectorAll('video'));

    return video === main;
  }

  is_cm() {
    try {
      const [
        {
          style: { visibility: main },
        },
        {
          style: { visibility: cm },
        },
      ] = Array.from(document.querySelectorAll('video'));

      return main === 'hidden' && cm === 'visible';
    } catch {
      return false;
    }
  }
}
