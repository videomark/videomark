import GeneralTypeHandler from './GeneralTypeHandler';

/**
 * 解像度レベルのリスト。現行プレーヤー向け固定値。
 */
const qualityLevelMap = {
  auto: -1,
  144: 0,
  360: 1,
  480: 2,
  720: 3,
  1080: 4, // プレミアム会員専用
};

export default class NicoVideoTypeHandler extends GeneralTypeHandler {
  constructor(elm) {
    super(elm);

    if (!this.is_main_video(elm)) {
      throw new Error('video is not main');
    }

    this.limited = false;
  }

  get_id_by_video_holder() {
    try {
      const [id] = new URL(window.location.href).pathname.split('/').slice(-1);

      return id;
    } catch (e) {
      return '';
    }
  }

  get_view_count() {
    return Number(document.querySelector('.grid-area_\\[meta\\] span')?.textContent ?? '0');
  }

  is_main_video(video) {
    return video === document.querySelector('video[data-name="video-content"]');
  }

  is_cm() {
    return /** @type {HTMLVideoElement[]} */ ([
      ...document.querySelectorAll('video[title="Advertisement"]'),
    ]).some((video) => !!video.videoHeight);
  }

  is_limited() {
    return this.limited;
  }

  /**
   * ビットレート設定をローカルストレージへ書き込む。
   * @param {number} level 画質レベル
   */
  update_quality_level(level) {
    try {
      const cacheKey = '@nvweb-packages/video-renderer';
      const cache = JSON.parse(localStorage.getItem(cacheKey));

      if (cache) {
        cache.data.autoQualityLevel.data = level;
        cache.data.selectedQualityLevel.data = level;
        localStorage.setItem(cacheKey, JSON.stringify(cache));
      }
    } catch {
      //
    }
  }

  /**
   * 指定したビットレート以下を選択する (指定しない場合や指定されたビットレートより小さい画質が存在しない場合、最低画質を選択する)
   * @param {number} [bitrate] 最大ビットレート
   * @param {number} [resolution] 最大解像度 (height)
   */
  set_max_bitrate(bitrate, resolution) {
    if (bitrate) {
      this.update_quality_level(
        Object.entries(qualityLevelMap).findLast(([rate]) => Number(rate) <= bitrate)?.[1] ?? 0,
      );
    }

    if (resolution) {
      // 設定方法なし
    }

    this.limited = true;
  }

  /**
   * 画質 "自動" を選択する
   */
  set_default_bitrate() {
    this.update_quality_level(-1);
  }
}
