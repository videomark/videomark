// @ts-check
import { AdObserver } from './AdObserver';
import GeneralTypeHandler from './GeneralTypeHandler';

export default class AmazonPrimeVideoTypeHandler extends GeneralTypeHandler {
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
      return document.querySelector('.atvwebplayersdk-title-text')?.textContent;
    } catch (e) {
      return '';
    }
  }

  get_video_thumbnail() {
    try {
      // @ts-expect-error
      const { src } = document.querySelector('.dv-fallback-packshot-image > img');

      return src;
    } catch (e) {
      return '';
    }
  }

  /**
   * トラッキング ID などを外した動画再生ページの正規 URL を取得。(ページ遷移時に HTML 内の Canonical URL が
   * 更新されず、存在しなかったり前のページの URL が残ってしまうことがあるため)
   * @returns {string} 正規化された URL。
   */
  get_canonical_url() {
    const { origin, pathname } = window.location;
    // 10 桁の ASIN を含むパスから動画 ID を抽出
    // 例: `/gp/video/detail/B0XXXXXXX/`、`/{作品名}/dp/B0XXXXXXX`
    const id = pathname.match(/\/([A-Z0-9]{10})(?:\/|$)/)?.[1];

    return id ? `https://www.amazon.co.jp/gp/video/detail/${id}/` : `${origin}${pathname}`;
  }

  /** @param {HTMLVideoElement} video */
  is_main_video(video) {
    try {
      return /^blob:http\S?:\/\//.test(video.src);
    } catch {
      return false;
    }
  }

  is_cm() {
    try {
      return getComputedStyle(this.elm).visibility !== 'visible';
    } catch {
      return false;
    }
  }

  set_max_bitrate(bitrate, resolution) {
    if (!Number.isFinite(resolution)) {
      return;
    }

    const setting = localStorage.getItem('atvwebplayersdk_data_saver_setting') || 'best';

    const current = AmazonPrimeVideoTypeHandler.qualityLabelTable.find(
      (row) => row.quality === setting,
    );

    const selectedQuality = AmazonPrimeVideoTypeHandler.qualityLabelTable.find(
      (row) => row.resolution <= resolution,
    );

    const selected =
      selectedQuality ||
      AmazonPrimeVideoTypeHandler.qualityLabelTable[
        AmazonPrimeVideoTypeHandler.qualityLabelTable.length - 1
      ]; // 標準画質

    if (!current || current.resolution > selected.resolution) {
      localStorage.setItem('atvwebplayersdk_data_saver_setting', selected.quality);
    }
  }

  set_default_bitrate() {
    localStorage.setItem('atvwebplayersdk_data_saver_setting', 'best');
  }
}

AmazonPrimeVideoTypeHandler.qualityLabelTable = [
  { resolution: 1080, quality: 'best' }, // 最高画質
  { resolution: 720, quality: 'better' }, // 高画質
  { resolution: 480, quality: 'good' }, // 標準画質
];
