import GeneralTypeHandler from './GeneralTypeHandler';

export default class LeminoTypeHandler extends GeneralTypeHandler {
  get_video_title() {
    try {
      return document.querySelector('.titleDetailHeading_title').textContent;
    } catch (e) {
      return '';
    }
  }

  get_video_thumbnail() {
    try {
      return document.querySelector('.is-active .libertyBtn_image img').src;
    } catch (e) {
      return '';
    }
  }

  is_main_video(video) {
    return video === this.elm;
  }

  is_cm() {
    return false;
  }
}
