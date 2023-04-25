import Config from "./Config";

export async function saveTransferSize(transfer_diff) {
  if (!transfer_diff) return;

  window.postMessage(
    {
      type: "FROM_SODIUM_JS",
      method: "save_transfer_size",
      transfer_diff,
    },
    "*"
  );
}

export function underQuotaLimit() {
  return (
    Config.get_settings().control_by_traffic_volume &&
    Config.get_transfer_size().limit_started
  );
}

export async function saveQuotaLimitStarted(limit_started) {
  window.postMessage(
    {
      type: "FROM_SODIUM_JS",
      method: "save_quota_limit_started",
      limit_started,
    },
    "*"
  );
}

export async function savePeakTimeLimit(new_peak_time_limit) {
  if (!new_peak_time_limit) return;

  const now = new Date();
  const peak_time_limit = {
    last_updated: now.getTime(),
    ...new_peak_time_limit,
  };

  window.postMessage(
    {
      type: "FROM_SODIUM_JS",
      method: "save_peak_time_limit",
      peak_time_limit,
    },
    "*"
  );
}

export async function fetchAndStorePeakTimeLimit() {
  if (!Config.get_settings().peak_time_limit_enabled) return undefined;

  const now = new Date();
  let peak_time_limit = Config.get_peak_time_limit();
  // 最終更新から1日以上経過で定義更新
  const expired = (peak_time_limit.last_updated || 0) + 24 * 60 * 60 * 1000;

  if (now.getTime() > expired) {
    const ret = await fetch(Config.get_peak_time_limit_url());
    if (ret.ok) {
      peak_time_limit = await ret.json();
    }
  }

  const limit_list = (peak_time_limit[now.getTimezoneOffset()] ||
    peak_time_limit.default)[now.getDay()];
  const formatter = new Intl.NumberFormat("en-US", { minimumIntegerDigits: 2 });
  const time = `${formatter.format(now.getHours())}:${formatter.format(
    now.getMinutes()
  )}`;
  const limit = limit_list.find((l) => l.begin <= time && l.end >= time);
  if (limit) {
    peak_time_limit.limit_started = now.getTime();
  }
  savePeakTimeLimit(peak_time_limit);
  return limit;
}

export function underPeakTimeLimit() {
  return (
    Config.get_settings().peak_time_limit_enabled &&
    Config.get_peak_time_limit().limit_started
  );
}

export async function stopPeakTimeLimit() {
  const peak_time_limit = Config.get_peak_time_limit();
  delete peak_time_limit.limit_started;
  savePeakTimeLimit(peak_time_limit);
}
