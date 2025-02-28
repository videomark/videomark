/**
 * ホスト名パターンを正規表現に変換。正規表現用のエスケープを適用した後、さらにワイルドカード部分を変換。
 * @param {string} origin ホスト名パターン。`*.youtube.com` のようにワイルドカードを含めることも可能。
 * @returns {RegExp} 正規表現。
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
const makeHostRE = (origin) =>
  new RegExp(
    `^${origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/^\\\*\\\./, '(?:.+\\.)?')}$`,
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
    hosts: ['*.youtube.com'],
  },
  {
    id: 'netflix',
    url: 'https://www.netflix.com/',
    brandColor: '#b40710', // NOTE: #e50914 だがYouTubeと区別付かないので暗く
    hosts: ['*.netflix.com'],
  },
  {
    id: 'paravi',
    deprecated: true, // 2023 年 7 月で U-NEXT へ統合
    url: 'https://www.paravi.jp/',
    brandColor: '#004f99',
    hosts: ['*.paravi.jp'],
  },
  {
    id: 'tver',
    url: 'https://tver.jp/',
    brandColor: '#40b8dc',
    hosts: ['*.tver.jp'],
  },
  {
    id: 'fod',
    url: 'https://fod.fujitv.co.jp/',
    brandColor: '#800000',
    hosts: ['*.fod.fujitv.co.jp'],
  },
  {
    id: 'nicovideo',
    url: 'https://www.nicovideo.jp/video_top',
    brandColor: '#333333',
    hosts: ['www.nicovideo.jp'],
  },
  {
    id: 'nicolive',
    url: 'https://live.nicovideo.jp/',
    brandColor: '#444444',
    hosts: ['*.nicovideo.jp'],
    hostREs: [/^live\d?\.nicovideo\.jp$/],
  },
  {
    id: 'nhkondemand',
    url: 'https://www.nhk-ondemand.jp/',
    brandColor: '#f18b02',
    hosts: ['www.nhk-ondemand.jp'],
  },
  {
    id: 'dtv',
    deprecated: true, // 2023 年 6 月 30 日でサービス終了、Leminoに移行
    url: 'https://pc.video.dmkt-sp.jp/',
    brandColor: '#CC6680',
    hosts: ['*.video.dmkt-sp.jp'],
  },
  {
    id: 'abematv',
    url: 'https://abema.tv/',
    brandColor: '#33AA22',
    hosts: ['abema.tv', '*.abema-tv.com', 'ds-linear-abematv.akamaized.net'],
  },
  {
    id: 'amazonprimevideo',
    url: 'https://www.amazon.co.jp/PrimeVideo',
    brandColor: '#015A80',
    hosts: ['www.amazon.co.jp'],
  },
  {
    id: 'iijtwilightconcert',
    experimental: true,
    brandColor: '#CCB42B',
    hosts: ['pr.iij.ad.jp'],
  },
  {
    id: 'gorin',
    deprecated: true, // 2023 年 3 月末でサービス終了
    url: 'https://www.gorin.jp/',
    brandColor: '#40b8dc',
    hosts: ['*.gorin.jp'],
  },
  {
    id: 'lemino',
    url: 'https://lemino.docomo.ne.jp/',
    brandColor: '#CC6680',
    hosts: ['lemino.docomo.ne.jp'],
  },
].map((platform) => ({
  ...platform,
  hostREs: platform.hostREs ?? platform.hosts.map((o) => makeHostRE(o)),
}));

/**
 * 現在対応している動画プラットフォームのホスト名パターンリスト。
 * @type {string[]}
 */
export const videoPlatformHosts = videoPlatforms
  .filter(({ deprecated }) => !deprecated)
  .map(({ hosts }) => hosts)
  .flat(1)
  .sort();
