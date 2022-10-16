import { createStorageSync } from '$lib/services/storage';

export const defaultSettings = {
  display_on_player: true,
  expires_in: 30 * 24 * 60 * 60 * 1000,
  resolution_control: 2160,
  resolution_control_enabled: false,
  bitrate_control: 20480 * 1024,
  bitrate_control_enabled: false,
  control_by_browser_quota: false,
  control_by_traffic_volume: false,
  browser_quota: 30 * 1024,
  browser_quota_bitrate: 20480 * 1024,
  peak_time_limit_enabled: false,
  show_duplicate_videos: false,
};

export const settings = createStorageSync('settings', { ...defaultSettings });
