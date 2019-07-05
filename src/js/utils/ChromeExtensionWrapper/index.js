import { isMobile, isExtension, isWeb } from "../Utils";
import data from "./EmbeddedData";

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
    if (keyOrFunction instanceof Function)
      return keyOrFunction(Object.assign({}, data));
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

export const allViewings = async () => {
  const obj = await new Promise(resolve => storage().get(resolve));
  ["RemovedTargetKeys", "AgreedTerm"].forEach(index => delete obj[index]);
  const ids = Object.entries(obj)
    .map(([id, { start_time: time }]) => [id, time])
    .sort(([, a], [, b]) => a - b)
    .map(([id]) => id);
  return new Map(ids.map(id => [id, obj[id]]));
};

export default class ChromeExtensionWrapper {
  static save(key, value) {
    storage().set({ [key]: value });
  }

  static saveRemoveTarget(value) {
    this.save("RemovedTargetKeys", value);
  }

  static load(key, callback) {
    storage().get(key, ({ [key]: value }) => callback(value));
  }

  static loadRemovedTarget(callback) {
    this.load("RemovedTargetKeys", value =>
      callback(Array.isArray(value) ? value : [])
    );
  }

  static remove(key) {
    storage().remove(key);
  }

  static loadAgreedTerm(callback) {
    if (isMobile() || isWeb()) {
      callback(true);
      return;
    }

    this.load("AgreedTerm", value => {
      callback(value || false);
    });
  }
}
