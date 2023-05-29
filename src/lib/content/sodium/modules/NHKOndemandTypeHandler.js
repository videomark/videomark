import GeneralTypeHandler from './GeneralTypeHandler';

export default class NHKOndemandTypeHandler extends GeneralTypeHandler {
  get_video_title() {
    return document.querySelector('.player__title').textContent;
  }

  get_video_thumbnail() {
    return null; // for fallback;
  }

  is_main_video() {
    return true;
  }

  set_quality() {
    // FIXME: settings 0 - 4 まで HD, 高, 中, 低 の段階で設定することができる
    // document.querySelector(".setting").click();
    // const settings = Array.from(document.querySelector(".player__setting--quality").childNodes)
    //     .filter(e => e.tagName.toLowerCase() === "dd")
    //     .splice(1, 4)
  }

  clear() {}
}
