/**
 * 動画プラットフォームのリスト。表示名は `/src/locales` 以下でローカライズ可能。
 */
export const videoPlatforms = [
  {
    id: 'youtube',
    url: 'https://www.youtube.com/',
    color: '#cc0000',
    host: /(^|\.)youtube\.com$/,
  },
  {
    id: 'netflix',
    url: 'https://www.netflix.com/',
    color: '#b40710', // NOTE: #e50914 だがYouTubeと区別付かないので暗く
    host: /(^|\.)netflix\.com$/,
  },
  {
    id: 'paravi',
    url: 'https://www.paravi.jp/',
    color: '#004f99',
    host: /(^|\.)paravi\.jp$/,
  },
  {
    id: 'tver',
    url: 'https://tver.jp/',
    color: '#40b8dc',
    host: /(^|\.)tver\.jp$/,
  },
  {
    id: 'fod',
    url: 'https://fod.fujitv.co.jp/',
    color: '#800000',
    host: /(^|\.)fod\.fujitv\.co\.jp$/,
  },
  {
    id: 'nicovideo',
    url: 'https://www.nicovideo.jp/video_top',
    color: '#333333',
    host: /^www\.nicovideo\.jp$/,
  },
  {
    id: 'nicolive',
    url: 'https://live.nicovideo.jp/',
    color: '#444444',
    host: /^live\d?\.nicovideo\.jp$/,
  },
  {
    id: 'nhkondemand',
    url: 'https://www.nhk-ondemand.jp/',
    color: '#f18b02',
    host: /(^|\.)nhk-ondemand\.jp$/,
  },
  {
    id: 'dtv',
    url: 'https://pc.video.dmkt-sp.jp/',
    color: '#CC6680',
    host: /(^|\.)video\.dmkt-sp\.jp$/,
  },
  {
    id: 'abematv',
    url: 'https://abema.tv/',
    color: '#33AA22',
    host: /^abema\.tv$/,
  },
  {
    id: 'amazonprimevideo',
    url: 'https://www.amazon.co.jp/PrimeVideo',
    color: '#015A80',
    host: /(^|\.)amazon\.co\.jp$/,
  },
  {
    id: 'iijtwilightconcert',
    experimental: true,
    color: '#CCB42B',
    host: /^pr\.iij\.ad\.jp$/,
  },
  {
    id: 'gorin',
    url: 'https://www.gorin.jp//',
    color: '#40b8dc',
    host: /(^|\.)gorin\.jp$/,
  },
];
