import { isMobile, isExtension, isWeb } from "../Utils";
import data from "./EmbeddedData";

export const VERSION = new Date("2019-07-11T00:00:00Z").getTime();

export const storage = () => {
  if (isMobile()) {
    return window.sodium.storage.local;
  }
  if (isExtension()) {
    return window.chrome.storage.local;
  }
  const set = (obj, callback) => {
    Object.assign(data, obj);
    if (callback instanceof Function) callback();
  };
  const get = (keyOrFunction, callback) => {
    if (keyOrFunction instanceof Function)
      return keyOrFunction(Object.assign({}, data));
    return callback({ [keyOrFunction]: data[keyOrFunction] });
  };
  const remove = (key, callback) => {
    delete data[key];
    callback();
  };
  return {
    set,
    get,
    remove
  };
};

export const allViewings = async () => {
  const { version } = await new Promise(resolve =>
    storage().get("version", resolve)
  );
  if (VERSION <= version) {
    const { index } = await new Promise(resolve =>
      storage().get("index", resolve)
    );
    return new Map(
      index.map(id => [
        id,
        () =>
          new Promise(resolve =>
            storage().get(id, ({ [id]: value }) => resolve(value))
          )
      ])
    );
  }
  const obj = await new Promise(resolve => storage().get(resolve));
  ["version", "index", "RemovedTargetKeys", "AgreedTerm"].forEach(
    index => delete obj[index]
  );
  const entries = Object.entries(obj)
    .map(([id, { start_time: time }]) => [id, time])
    .sort(([, a], [, b]) => a - b)
    .map(([id]) => [id, obj[id]]);
  return new Map(entries);
};

export const migration = async () => {
  const viewings = await allViewings();
  await new Promise(resolve =>
    storage().set(
      {
        index: [...viewings.keys()],
        version: VERSION
      },
      resolve
    )
  );
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
