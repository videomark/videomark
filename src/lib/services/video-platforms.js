/**
 * 動画プラットフォームのリスト。表示名は `/src/locales` 以下でローカライズ可能。
 */
export const videoPlatforms = [
  {
    id: 'youtube',
    url: 'https://www.youtube.com/',
    brandColor: '#cc0000',
    host: /(^|\.)youtube\.com$/,
  },
  {
    id: 'netflix',
    url: 'https://www.netflix.com/',
    brandColor: '#b40710', // NOTE: #e50914 だがYouTubeと区別付かないので暗く
    host: /(^|\.)netflix\.com$/,
  },
  {
    id: 'paravi',
    deprecated: true, // 2023 年 7 月で U-NEXT へ統合
    url: 'https://www.paravi.jp/',
    brandColor: '#004f99',
    host: /(^|\.)paravi\.jp$/,
  },
  {
    id: 'tver',
    url: 'https://tver.jp/',
    brandColor: '#40b8dc',
    host: /(^|\.)tver\.jp$/,
  },
  {
    id: 'fod',
    url: 'https://fod.fujitv.co.jp/',
    brandColor: '#800000',
    host: /(^|\.)fod\.fujitv\.co\.jp$/,
  },
  {
    id: 'nicovideo',
    url: 'https://www.nicovideo.jp/video_top',
    brandColor: '#333333',
    host: /^www\.nicovideo\.jp$/,
  },
  {
    id: 'nicolive',
    url: 'https://live.nicovideo.jp/',
    brandColor: '#444444',
    host: /^live\d?\.nicovideo\.jp$/,
  },
  {
    id: 'nhkondemand',
    url: 'https://www.nhk-ondemand.jp/',
    brandColor: '#f18b02',
    host: /(^|\.)nhk-ondemand\.jp$/,
  },
  {
    id: 'dtv',
    deprecated: true, // 2023 年 6 月 30 日でサービス終了、Leminoに移行
    url: 'https://pc.video.dmkt-sp.jp/',
    brandColor: '#CC6680',
    host: /(^|\.)video\.dmkt-sp\.jp$/,
  },
  {
    id: 'abematv',
    url: 'https://abema.tv/',
    brandColor: '#33AA22',
    host: /^abema\.tv$/,
  },
  {
    id: 'amazonprimevideo',
    url: 'https://www.amazon.co.jp/PrimeVideo',
    brandColor: '#015A80',
    host: /(^|\.)amazon\.co\.jp$/,
  },
  {
    id: 'iijtwilightconcert',
    experimental: true,
    brandColor: '#CCB42B',
    host: /^pr\.iij\.ad\.jp$/,
  },
  {
    id: 'gorin',
    deprecated: true, // 2023 年 3 月末でサービス終了
    url: 'https://www.gorin.jp/',
    brandColor: '#40b8dc',
    host: /(^|\.)gorin\.jp$/,
  },
  {
    id: 'lemino',
    url: 'https://lemino.docomo.ne.jp/',
    brandColor: '#CC6680',
    host: /^lemino\.docomo\.ne\.jp$/,
  },
];
