import Config from "./Config";
import dateFormat from "dateformat";

export class StatStorage {
  async save_transfer_size(transfer_diff) {
    if (!transfer_diff) return;

    if (!Config.is_mobile()) {
      window.postMessage({
        type: "FROM_SODIUM_JS",
        method: "save_transfer_size",
        transfer_diff
      }, "*");
      return;
    }

    const storage = Config.is_mobile() ? window.sodium.storage.local : window.chrome.storage.local;
    let { transfer_size } = await new Promise(resolve =>
      storage.get("transfer_size", resolve)
    );
    if (!transfer_size) transfer_size = {};

    const now = new Date();
    const month = `${now.getFullYear()}-${new Intl.NumberFormat("en-US", {minimumIntegerDigits: 2}).format(now.getMonth()+1)}`;
    const size = (transfer_size[month] || 0) + transfer_diff;
    transfer_size[month] = size;
    storage.set({ transfer_size });
  }
}

const stat = new StatStorage();
export const useStatStorage = () => {
  return stat;
};
