import GeneralTypeHandler from './GeneralTypeHandler';

export default class NHKOndemandTypeHandler extends GeneralTypeHandler {
  get_video_title() {
    return document.querySelector('.player__title').textContent;
  }

  get_video_thumbnail() {
    return null; // for fallback;
  }

  /**
   * トラッキング ID などを外した動画再生ページの正規 URL を取得。(HTML 内に Canonical URL が存在しないため)
   * @returns {string} 正規化された URL。
   */
  get_canonical_url() {
    const { origin, pathname } = window.location;

    return `${origin}${pathname}`;
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
