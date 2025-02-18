// @ts-check
import { AdObserver } from './AdObserver';
import GeneralTypeHandler from './GeneralTypeHandler';

/* あまり有用な情報は取り出せない */
export default class AbemaTVVideoTypeHandler extends GeneralTypeHandler {
  /** @param {HTMLVideoElement} elm */
  constructor(elm) {
    super(elm);

    if (!this.is_main_video(elm)) {
      throw new Error('video is not main');
    }

    const target = document.querySelector('.com-vod-VODScreen-container');

    this.adObserver = new AdObserver(this, target);
  }

  get_video_title() {
    return document.title;
  }

  get_video_thumbnail() {
    /**
     * スプラッシュ画面を送るエピソードごとのサムネイルも取れそうだが結構一つに絞るのは大変かも
     */
    return null; // for fallback
  }

  get_id_by_video_holder() {
    return '';
  }

  is_main_video(video) {
    try {
      const [main] = Array.from(document.querySelectorAll('video'))
        .filter((e) => e.src.length !== 0)
        .filter((e) => /^blob:http\S:\/\/abema.tv/.test(e.src));

      return video === main;
    } catch (e) {
      return false;
    }
  }

  /**
   * 広告が再生中かどうかの判定。広告自体は `iframe` で挿入されており、本編再生中も削除されないが、以下のいずれかの
   * クラスが本編動画のラッパー `div` に対して追加されることを確認済み:
   * `.c-vod-EpisodePlayerContainer-screen--playing-ad` (オンデマンド)
   * `.c-tv-TimeshiftPlayerContainerView--playing-ad` (見逃し視聴)
   * @returns {boolean} 判定結果。
   */
  is_cm() {
    return !!document.querySelector('[class*="--playing-ad"]');
  }
}
