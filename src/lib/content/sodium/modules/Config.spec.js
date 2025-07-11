import { expect, test } from 'vitest';
import Config from '$lib/content/sodium/modules/Config';

test('get_video_platform', () => {
  expect(Config.get_video_platform('www.youtube.com')).toBe('youtube');
  expect(Config.get_video_platform('www.youtube-nocookie.com')).toBe('youtube');
  expect(Config.get_video_platform('m.youtube.com')).toBe('m_youtube_com');
  expect(Config.get_video_platform('www.netflix.com')).toBe('netflix');
  expect(Config.get_video_platform('tver.jp')).toBe('tver');
  expect(Config.get_video_platform('fod.fujitv.co.jp')).toBe('fod');
  expect(Config.get_video_platform('www.nicovideo.jp')).toBe('nicovideo');
  expect(Config.get_video_platform('live.nicovideo.jp')).toBe('nicolive');
  expect(Config.get_video_platform('live2.nicovideo.jp')).toBe('nicolive');
  expect(Config.get_video_platform('www.nhk-ondemand.jp')).toBe('nhkondemand');
  expect(Config.get_video_platform('abema.tv')).toBe('abematv');
  expect(Config.get_video_platform('www.amazon.co.jp')).toBe('amazonprimevideo');
  expect(Config.get_video_platform('pr.iij.ad.jp')).toBe('iijtwilightconcert');
  expect(Config.get_video_platform('lemino.docomo.ne.jp')).toBe('lemino');
});
