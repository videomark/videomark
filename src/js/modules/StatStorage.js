import Config from "./Config";

export async function saveTransferSize(transfer_diff) {
  if (!transfer_diff) return;

  if (!Config.is_mobile()) {
    window.postMessage({
      type: "FROM_SODIUM_JS",
      method: "save_transfer_size",
      transfer_diff
    }, "*");
    return;
  }

  const storage = window.sodium.storage.local;
  let { transfer_size } = await new Promise(resolve =>
    storage.get("transfer_size", resolve)
  );
  if (!transfer_size) transfer_size = {};

  const now = new Date();
  const month = `${now.getFullYear()}-${new Intl.NumberFormat("en-US", {minimumIntegerDigits: 2}).format(now.getMonth()+1)}`;
  const size = (transfer_size[month] || 0) + transfer_diff;
  transfer_size[month] = size;
  storage.set({ transfer_size });
};

export async function savePeakTimeLimit(new_peak_time_limit) {
  if (!new_peak_time_limit) return;

  const peak_time_limit = Object.assign({}, new_peak_time_limit);
  const now = new Date();
  peak_time_limit.last_updated = now.getTime();

  if (!Config.is_mobile()) {
    window.postMessage({
      type: "FROM_SODIUM_JS",
      method: "save_peak_time_limit",
      peak_time_limit
    }, "*");
    return;
  }

  const storage = window.sodium.storage.local;
  storage.set({ peak_time_limit });
};

export async function loadPeakTimeLimit() {
  if (!Config.get_settings().peak_time_limit_enabled) return undefined;

  const now = new Date();
  let peak_time_limit = Config.get_peak_time_limit();
  // 最終更新から1日以上経過で定義更新
  const expired = (peak_time_limit.last_updated || 0) + 24 * 60 * 60 * 1000;

  if (now.getTime() > expired) {
    const ret = await fetch(Config.get_peak_time_limit_url());
    if (ret.ok) {
      peak_time_limit = await ret.json();
      savePeakTimeLimit(peak_time_limit);
    }
  }

  const limit_list = (peak_time_limit[now.getTimezoneOffset()] || peak_time_limit.default)[now.getDay()];
  const formatter = new Intl.NumberFormat("en-US", {minimumIntegerDigits: 2});
  const time = `${formatter.format(now.getHours())}:${formatter.format(now.getMinutes())}`;
  return limit_list.find(limit => limit.begin <= time && limit.end >= time);
};
