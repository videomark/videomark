/**
 * 動画プラットフォームのプロパティ。
 * @typedef {object} VideoPlatform
 * @property {string} id 固有の ID。
 * @property {string} url サービス URL。
 * @property {string} brandColor ブランドカラー。
 * @property {string[]} origins サービスのオリジンリスト。`manifest.json` や `request_rules.json` など複数
 * 箇所で利用され、自動的に正規表現やドメインのみの表記に変換されます。サブドメインが複数ある場合はワイルドカードを使う
 * ことも可能。例えば `*.youtube.com` は `youtube.com` とそのサブドメインすべてに一致します。
 * @property {RegExp[]} originREs 正規表現で表したサービスのオリジンリスト。`origins` のワイルドカード表記より
 * 細かい設定が可能。指定されていない場合は `origins` を自動的に正規表現に変換して使用。
 * @property {boolean} [deprecated] 廃止されたサービスは `true`。
 * @property {boolean} [experimental] 試験的に対応しているサービスは `true`。
 */

/**
 * オリジンパターンを正規表現に変換します。
 * @param {string} origin オリジンパターン。`https://*.youtube.com` のようにワイルドカードを含めることも可能。
 * @returns {RegExp} 正規表現。
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
const makeOriginRE = (origin) =>
  new RegExp(
    `^${origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`.replace('//\\*\\.', '//(?:.+\\.)?'),
  );

/**
 * すべての動画プラットフォームのリスト。表示名は `/src/locales` 以下でローカライズ可能です。
 * @type {VideoPlatform[]}
 */
export const videoPlatforms = [
  {
    id: 'youtube',
    url: 'https://www.youtube.com/',
    brandColor: '#cc0000',
    origins: ['https://*.youtube.com'],
  },
  {
    id: 'netflix',
    url: 'https://www.netflix.com/',
    brandColor: '#b40710', // NOTE: #e50914 だがYouTubeと区別付かないので暗く
    origins: ['https://*.netflix.com'],
  },
  {
    id: 'paravi',
    deprecated: true, // 2023 年 7 月で U-NEXT へ統合
    url: 'https://www.paravi.jp/',
    brandColor: '#004f99',
    origins: ['https://*.paravi.jp'],
  },
  {
    id: 'tver',
    url: 'https://tver.jp/',
    brandColor: '#40b8dc',
    origins: ['https://*.tver.jp'],
  },
  {
    id: 'fod',
    url: 'https://fod.fujitv.co.jp/',
    brandColor: '#800000',
    origins: ['https://*.fod.fujitv.co.jp'],
  },
  {
    id: 'nicovideo',
    url: 'https://www.nicovideo.jp/video_top',
    brandColor: '#333333',
    origins: ['https://www.nicovideo.jp'],
  },
  {
    id: 'nicolive',
    url: 'https://live.nicovideo.jp/',
    brandColor: '#444444',
    origins: ['https://*.nicovideo.jp'],
    originREs: [/^https:\/\/live\d\.nicovideo\.jp$/],
  },
  {
    id: 'nhkondemand',
    url: 'https://www.nhk-ondemand.jp/',
    brandColor: '#f18b02',
    origins: ['https://www.nhk-ondemand.jp'],
  },
  {
    id: 'dtv',
    deprecated: true, // 2023 年 6 月 30 日でサービス終了、Leminoに移行
    url: 'https://pc.video.dmkt-sp.jp/',
    brandColor: '#CC6680',
    origins: ['https://*.video.dmkt-sp.jp'],
  },
  {
    id: 'abematv',
    url: 'https://abema.tv/',
    brandColor: '#33AA22',
    origins: [
      'https://abema.tv',
      'https://*.abema-tv.com',
      'https://ds-linear-abematv.akamaized.net',
    ],
  },
  {
    id: 'amazonprimevideo',
    url: 'https://www.amazon.co.jp/PrimeVideo',
    brandColor: '#015A80',
    origins: ['https://www.amazon.co.jp'],
  },
  {
    id: 'iijtwilightconcert',
    experimental: true,
    brandColor: '#CCB42B',
    origins: ['https://pr.iij.ad.jp'],
  },
  {
    id: 'gorin',
    deprecated: true, // 2023 年 3 月末でサービス終了
    url: 'https://www.gorin.jp/',
    brandColor: '#40b8dc',
    origins: ['https://*.gorin.jp/'],
  },
  {
    id: 'lemino',
    url: 'https://lemino.docomo.ne.jp/',
    brandColor: '#CC6680',
    origins: ['https://lemino.docomo.ne.jp'],
  },
].map((platform) => ({
  ...platform,
  originREs: platform.originREs ?? platform.origins.map((o) => makeOriginRE(o)),
}));

/**
 * 現在対応している動画プラットフォームのオリジンパターンリスト。
 * @type {string[]}
 */
export const videoPlatformOrigins = videoPlatforms
  .filter(({ deprecated }) => !deprecated)
  .map(({ origins }) => origins)
  .flat(1)
  .sort();

/**
 * 現在対応している動画プラットフォームのオリジン正規表現リスト。
 * @type {RegExp[]}
 */
export const videoPlatformOriginREs = videoPlatforms
  .filter(({ deprecated }) => !deprecated)
  .map(({ originREs }) => originREs)
  .flat(1)
  .sort();
