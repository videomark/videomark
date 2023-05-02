import GeneralTypeHandler from "./GeneralTypeHandler";

export default class DTVTypeHandler extends GeneralTypeHandler {
  // eslint-disable-next-line class-methods-use-this
  get_video_title() {
    try {
      return document.querySelector(".titleDetailHeading_title").textContent;
    } catch (e) {
      return "";
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get_video_thumbnail() {
    try {
      return document.querySelector(".is-active .libertyBtn_image img").src;
    } catch (e) {
      return "";
    }
  }

  is_main_video(video) {
    return video === this.elm;
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  is_cm(video) {
    return false;
  }
}
