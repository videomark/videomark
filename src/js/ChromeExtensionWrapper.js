import { isMobile, isDevelop } from "./Utils";
import data from "./EmbededData";

const RemovedTargetKeys = "RemovedTargetKeys";
const AgreedTerm = "AgreedTerm";

// モバイルはchromeで立ち上げられるとchromeのオブジェクトが存在するため
// 未サポートブラウザ判定できないためextensionのみこのコードを有効にする
if (!isMobile() && window.sodium === undefined) {
  window.sodium = chrome;
}

// 環境判定をしてchrome extension apiの実行とダミーデータの返却を実現する
export default class ChromeExtensionWrapper {
  static saveRemoveTarget(value) {
    if (isDevelop()) {
      return;
    }

    const savedData = {};
    savedData[RemovedTargetKeys] = value;
    window.sodium.storage.local.set(savedData);
  }

  static loadRemovedTarget(callback) {
    if (isDevelop()) {
      callback([]);
      return;
    }

    window.sodium.storage.local.get(RemovedTargetKeys, value => {
      const removedTargets =
        RemovedTargetKeys in value ? value[RemovedTargetKeys] : [];
      callback(removedTargets);
    });
  }

  static loadVideoIds(callback) {
    const parse = value => {
      const result = [];
      Object.keys(value)
        .filter(key => {
          return key !== RemovedTargetKeys && key !== AgreedTerm;
        })
        .forEach(key => {
          result.push({ id: key, data: value[key] });
        });

      return result;
    };

    if (isDevelop()) {
      const tmp = data;

      callback(parse(tmp));
      return;
    }

    window.sodium.storage.local.get(value => {
      callback(parse(value));
    });
  }

  static remove(key) {
    if (isDevelop()) {
      delete data[key];
      return;
    }

    window.sodium.storage.local.remove(key);
  }

  static loadAgreedTerm(callback) {
    if (isDevelop() || isMobile()) {
      callback(true);
      return;
    }

    window.sodium.storage.local.get(AgreedTerm, value => {
      const result = AgreedTerm in value ? value[AgreedTerm] : false;
      callback(result);
    });
  }

  // 利用規約に同意
  static agreeTerm() {
    if (isDevelop()) {
      return;
    }

    window.sodium.storage.local.set({ AgreedTerm: true });
  }

  static canUseVideoMarkApi() {
    return window.sodium !== undefined || !isMobile();
  }
}
