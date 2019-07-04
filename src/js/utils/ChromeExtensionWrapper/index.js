import { isMobile, isExtension, isWeb } from "../Utils";
import data from "./EmbeddedData";

const RemovedTargetKeys = "RemovedTargetKeys";
const AgreedTerm = "AgreedTerm";

export const storage = () => {
  if (isMobile()) {
    return window.sodium.storage.local;
  }
  if (isExtension()) {
    return window.chrome.storage.local;
  }
  const set = obj => {
    Object.assign(data, obj);
  };
  const get = (keyOrFunction, callback) => {
    if (keyOrFunction instanceof Function) return keyOrFunction(data);
    return callback({ [keyOrFunction]: data[keyOrFunction] });
  };
  const remove = key => {
    delete data[key];
  };
  return {
    set,
    get,
    remove
  };
};

export default class ChromeExtensionWrapper {
  static save(key, value) {
    storage().set({ [key]: value });
  }

  static saveRemoveTarget(value) {
    this.save(RemovedTargetKeys, value);
  }

  static load(key, callback) {
    storage().get(key, ({ [key]: value }) => callback(value));
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

    storage().get(value => {
      callback(parse(value));
    });
  }

  static remove(key) {
    storage().remove(key);
  }

  static loadAgreedTerm(callback) {
    if (isMobile() || isWeb()) {
      callback(true);
      return;
    }

    this.load(AgreedTerm, value => {
      callback(value || false);
    });
  }
}
