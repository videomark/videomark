import { isMobile, isDevelop } from "../Utils";
import data from "./EmbeddedData";

const RemovedTargetKeys = "RemovedTargetKeys";
const AgreedTerm = "AgreedTerm";

// モバイルはchromeで立ち上げられるとchromeのオブジェクトが存在するため
// 未サポートブラウザ判定できないためextensionのみこのコードを有効にする
if (!isMobile() && window.sodium === undefined) {
  window.sodium = chrome;
}

// 環境判定をしてchrome extension apiの実行とダミーデータの返却を実現する
export default class ChromeExtensionWrapper {
  static save(key, value) {
    if (isDevelop()) {
      data[key] = value;
      return;
    }
    window.sodium.storage.local.set({ [key]: value });
  }

  static saveRemoveTarget(value) {
    this.save(RemovedTargetKeys, value);
  }

  static load(key, callback) {
    if (isDevelop()) {
      callback(data[key]);
      return;
    }
    window.sodium.storage.local.get(key, items => callback(items[key]));
  }

  static loadRemovedTarget(callback) {
    this.load(RemovedTargetKeys, value =>
      callback(Array.isArray(value) ? value : [])
    );
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
      callback(parse(data));
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

    this.load(AgreedTerm, value => {
      callback(value || false);
    });
  }

  static canUseVideoMarkApi() {
    return window.sodium !== undefined || !isMobile();
  }
}
