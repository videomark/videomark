import { forEach } from "p-iteration";
import { isMobile, isExtension, isWeb } from "../Utils";
import data from "./EmbeddedData";

export const VERSION = new Date("2019-07-18T00:00:00Z").getTime();

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
  const remove = (key, callback = () => {}) => {
    delete data[key];
    callback();
  };
  return {
    set,
    get,
    remove
  };
};

export const isCurrentVersion = async () => {
  const { version } = await new Promise(resolve =>
    storage().get("version", resolve)
  );
  return VERSION <= version;
};

export const allViewings = async () => {
  if (await isCurrentVersion()) {
    const { index } = await new Promise(resolve =>
      storage().get("index", resolve)
    );
    return new Map(
      index.map(id => [
        id,
        () =>
          new Promise(resolve =>
            storage().get(id.toString(), ({ [id]: value }) => resolve(value))
          )
      ])
    );
  }
  const obj = await new Promise(resolve => storage().get(resolve));
  [
    "version",
    "index",
    "session",
    "settings",
    "RemovedTargetKeys",
    "AgreedTerm"
  ].forEach(index => delete obj[index]);
  const entries = Object.entries(obj)
    .map(([id, { start_time: time }]) => [id, time])
    .sort(([, a], [, b]) => a - b)
    .map(([id]) => [id, obj[id]]);
  return new Map(entries);
};

let migrationLock;
export const migration = async () => {
  if (migrationLock instanceof Promise) return migrationLock;
  let unlock;
  migrationLock = new Promise(resolve => {
    unlock = resolve;
  }).then(() => {
    migrationLock = undefined;
  });

  if (await isCurrentVersion()) return unlock();

  const { RemovedTargetKeys: remove } = await new Promise(resolve =>
    storage().get("RemovedTargetKeys", resolve)
  );
  if (Array.isArray(remove)) {
    await Promise.all([
      new Promise(resolve => storage().remove("RemovedTargetKeys", resolve)),
      ...remove.map(
        async id =>
          new Promise(resolve => storage().remove(id.toString(), resolve))
      )
    ]);
  }
  const viewings = await allViewings();
  forEach([...viewings], async ([id, obj], i) => {
    if (obj instanceof Function) return;
    if (obj.log === undefined) {
      const { latest_qoe: log, ...tmp } = obj;
      Object.assign(tmp, { log });
      await new Promise(resolve => storage().set({ [i]: tmp }, resolve));
    } else {
      await new Promise(resolve => storage().set({ [i]: obj }, resolve));
    }
    await new Promise(resolve => storage().remove(id, resolve));
  });

  await new Promise(resolve =>
    storage().set(
      {
        index: [...Array(viewings.size).keys()],
        version: VERSION
      },
      resolve
    )
  );
  return unlock();
};

export const rollback = async () => {
  if (!(await isCurrentVersion())) return;
  await new Promise(resolve => storage().remove("version", resolve));
  await new Promise(resolve => storage().remove("index", resolve));
  const viewings = await allViewings();
  forEach([...viewings], async ([id, obj]) => {
    const { session_id: sessionId, video_id: videoId } = obj;
    await new Promise(resolve =>
      storage().set({ [`${sessionId}_${videoId}`]: obj }, resolve)
    );
    await new Promise(resolve => storage().remove(id, resolve));
  });
};

export default class ChromeExtensionWrapper {
  static save(key, value) {
    storage().set({ [key]: value });
  }

  static saveRemoveTarget(value) {
    this.save("RemovedTargetKeys", value);
  }

  static load(key, callback) {
    storage().get(key.toString(), ({ [key]: value }) => callback(value));
  }

  static loadRemovedTarget(callback) {
    this.load("RemovedTargetKeys", value =>
      callback(Array.isArray(value) ? value : [])
    );
  }

  static remove(key) {
    storage().remove(key.toString());
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
