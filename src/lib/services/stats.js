/**
 * 与えられた値がゼロまたは正の数であるかどうかを判定。
 * @param {any} value 値。
 * @returns {boolean} 結果。
 */
const isValidNumber = (value) => Number.isFinite(value) && value >= 0;

/**
 * サイズをフォーマット。
 * @param {string} locale UI ロケール。
 * @param {number} bytes 元の数値。
 * @param {number} exponent 指数。
 * @returns {string} フォーマットされた数値。
 */
const formatSize = (locale, bytes, exponent) => {
  const divider = 1024 ** exponent;
  // 整数部が 4 桁になったら小数部は省く
  const fraction = bytes >= divider * 1000 ? 0 : 2;

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction,
  }).format(bytes / divider);
};

/**
 * キロバイト単位のサイズをフォーマット。
 * @param {string} locale UI ロケール。
 * @param {number} bytes 元の数値。
 * @returns {string} フォーマットされた数値。
 */
export const formatKiloSize = (locale, bytes) => formatSize(locale, bytes, 1);

/**
 * メガバイト単位のサイズをフォーマット。
 * @param {string} locale UI ロケール。
 * @param {number} bytes 元の数値。
 * @returns {string} フォーマットされた数値。
 */
export const formatMegaSize = (locale, bytes) => formatSize(locale, bytes, 2);

/**
 * 整数をカンマ区切り付きでフォーマット。
 * @param {string} locale UI ロケール。
 * @param {number} number 元の数値。
 * @returns {string} フォーマットされた数値。
 */
export const formatInt = (locale, number) =>
  new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(number);

/**
 * 浮動小数点数をカンマ区切り付きでフォーマット。
 * @param {string} locale UI ロケール。
 * @param {number} number 元の数値。
 * @param {number} [maximumFractionDigits] 最大小数部桁数。
 * @returns {string} フォーマットされた数値。
 */
export const formatFloat = (locale, number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits,
  }).format(number);

/**
 * パーセンテージを「%」付きでフォーマット。小数部は 2 桁まで。
 * @param {string} locale UI ロケール。
 * @param {number} number 元の数値。
 * @returns {string} フォーマットされた数値。
 */
export const formatPercent = (locale, number) =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(number);

/**
 * 秒数を「秒」付きでフォーマット。小数部は 1 桁まで。
 * @param {string} locale UI ロケール。
 * @param {number} number 元の数値。
 * @returns {string} フォーマットされた数値。
 */
export const formatSec = (locale, number) =>
  new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'second',
    maximumFractionDigits: 2,
  }).format(number);

/**
 * 与えられた統計データを UI 上に表示できる形でフォーマット。
 * @param {string} locale UI ロケール。
 * @param {{ [key: string]: number | { [key: string]: number } }} details 統計データ。
 * @returns {{ [key: string]: string | null }} UI 上に表示する統計データ。
 */
export const formatStats = (locale, details) => {
  const {
    bitrate,
    throughput,
    transferSize,
    resolution: { width: videoWidth, height: videoHeight } = {},
    framerate,
    speed,
    droppedVideoFrames,
    totalVideoFrames,
    date,
    creationDate,
    startTime,
    timing: { waiting, pause } = {},
    qoe,
  } = details;

  const dropRate =
    isValidNumber(droppedVideoFrames) && isValidNumber(totalVideoFrames)
      ? droppedVideoFrames / totalVideoFrames
      : NaN;

  const playing = (date || creationDate) - startTime - pause;
  const waitingRate = isValidNumber(waiting) && isValidNumber(playing) ? waiting / playing : NaN;

  return {
    bitrate: isValidNumber(bitrate) ? `${formatKiloSize(locale, bitrate)} kbps` : null,
    throughput: isValidNumber(throughput) ? `${formatMegaSize(locale, throughput)} Mbps` : null,
    transferSize: isValidNumber(transferSize) ? `${formatMegaSize(locale, transferSize)} MB` : null,
    resolution:
      isValidNumber(videoWidth) && isValidNumber(videoHeight)
        ? `${videoWidth} × ${videoHeight}`
        : null,
    frameRate: isValidNumber(framerate)
      ? `${framerate} fps${speed === 1 ? '' : ` × ${speed}`}`
      : null,
    frameDrops: isValidNumber(dropRate)
      ? `${formatInt(locale, droppedVideoFrames)} / ${formatInt(locale, totalVideoFrames)}
        (${formatPercent(locale, dropRate)})`
      : null,
    waitingTime: isValidNumber(waitingRate)
      ? `${formatFloat(locale, waiting / 1e3)} / ${formatSec(locale, playing / 1e3)}
        (${formatPercent(locale, waitingRate)})`
      : null,
    qoe: isValidNumber(qoe) ? qoe.toFixed(2) : null,
  };
};
