import { forEach } from "p-iteration";
import { useState, useEffect, useCallback } from "react";
import { isMobile, isExtension, isWeb } from "../Utils";
import EmbeddedData from "./EmbeddedData";

export const VERSION = new Date("2019-07-18T00:00:00Z").getTime();

let data = EmbeddedData;
export const storage = () => {
  if (isMobile()) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'sodium' does not exist on type 'Window &... Remove this comment to see the full error message
    return window.sodium.storage.local;
  }
  if (isExtension()) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'chrome' does not exist on type 'Window &... Remove this comment to see the full error message
    return window.chrome.storage.local;
  }
  const set = (obj: any, callback: any) => {
    Object.assign(data, obj);
    if (callback instanceof Function) callback();
  };
  const get = (keyOrFunction: any, callback: any) => {
    if (keyOrFunction instanceof Function)
      // eslint-disable-next-line prefer-object-spread
      return keyOrFunction(Object.assign({}, data));
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return callback({ [keyOrFunction]: data[keyOrFunction] });
  };
  const remove = (key: any, callback = () => {}) => {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    delete data[key];
    callback();
  };
  const clear = (callback = () => {}) => {
    data = {};
    callback();
  };
  return {
    set,
    get,
    remove,
    clear,
  };
};

const useStorage = (key: any) => {
  const [state, setState] = useState(undefined);

  useEffect(() => {
    storage().get(key, (obj: any) => setState(obj[key] === undefined ? {} : obj[key])
    );
  }, [setState]);

  const save = useCallback(
    (attributes) =>
      storage().set({ [key]: attributes }, () => setState(attributes)),
    [setState]
  );

  return [state, save];
};
export const useSession = () => useStorage("session");
export const useSettings = () => useStorage("settings");

export const isCurrentVersion = async () => {
  const { version } = await new Promise((resolve) =>
    storage().get("version", resolve)
  );
  return VERSION <= version;
};

export const allViewings = async () => {
  if (await isCurrentVersion()) {
    const { index } = await new Promise((resolve) =>
      storage().get("index", resolve)
    );
    return new Map(
      index.map((id: any) => [
        id,
        () =>
          new Promise((resolve) =>
            // @ts-expect-error ts-migrate(2538) FIXME: Type 'any' cannot be used as an index type.
            storage().get(id.toString(), ({ [id]: value }) => resolve(value))
          ),
      ])
    );
  }
  const obj = await new Promise((resolve) => storage().get(resolve));
  [
    "version",
    "index",
    "session",
    "settings",
    "RemovedTargetKeys",
    "AgreedTerm",
    "transfer_size",
    "peak_time_limit",
  // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
  ].forEach((index) => delete obj[index]);
  // @ts-expect-error ts-migrate(2769) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
  const entries = Object.entries(obj)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'start_time' does not exist on type 'unkn... Remove this comment to see the full error message
    .map(([id, { start_time: time }]) => [id, time])
    .sort(([, a], [, b]) => a - b)
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    .map(([id]) => [id, obj[id]]);
  // @ts-expect-error ts-migrate(2769) FIXME: Type 'any[]' is not assignable to type 'readonly [... Remove this comment to see the full error message
  return new Map(entries);
};

export const clearViewings = async () => {
  const [
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'version' does not exist on type 'unknown... Remove this comment to see the full error message
    { version },
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'session' does not exist on type 'unknown... Remove this comment to see the full error message
    { session },
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'settings' does not exist on type 'unknow... Remove this comment to see the full error message
    { settings },
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'AgreedTerm' does not exist on type 'unkn... Remove this comment to see the full error message
    { AgreedTerm },
  ] = await Promise.all(
    ["version", "session", "settings", "AgreedTerm"].map(
      (key) => new Promise((resolve) => storage().get(key, resolve))
    )
  );

  await new Promise((resolve) => storage().clear(resolve));
  await new Promise((resolve) =>
    storage().set(
      { version, index: [], session, settings, AgreedTerm },
      resolve
    )
  );
};

let migrationLock: any;
export const migration = async () => {
  if (migrationLock instanceof Promise) return migrationLock;
  let unlock;
  migrationLock = new Promise((resolve) => {
    unlock = resolve;
  }).then(() => {
    migrationLock = undefined;
  });

  // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
  if (await isCurrentVersion()) return unlock();

  const { RemovedTargetKeys: remove } = await new Promise((resolve) =>
    storage().get("RemovedTargetKeys", resolve)
  );
  if (Array.isArray(remove)) {
    await Promise.all([
      new Promise((resolve) => storage().remove("RemovedTargetKeys", resolve)),
      ...remove.map(
        async (id) =>
          new Promise((resolve) => storage().remove(id.toString(), resolve))
      ),
    ]);
  }
  const viewings = await allViewings();
  // @ts-expect-error ts-migrate(2569) FIXME: Type 'Map<unknown, unknown>' is not an array type ... Remove this comment to see the full error message
  forEach([...viewings], async ([id, obj], i) => {
    if (obj instanceof Function) return;
    if (obj.log === undefined) {
      const { latest_qoe: log, ...tmp } = obj;
      // eslint-disable-next-line prefer-object-spread
      Object.assign(tmp, { log });
      await new Promise((resolve) => storage().set({ [i]: tmp }, resolve));
    } else {
      await new Promise((resolve) => storage().set({ [i]: obj }, resolve));
    }
    await new Promise((resolve) => storage().remove(id, resolve));
  });

  await new Promise((resolve) =>
    storage().set(
      {
        // @ts-expect-error ts-migrate(2569) FIXME: Type 'IterableIterator<number>' is not an array ty... Remove this comment to see the full error message
        index: [...Array(viewings.size).keys()],
        version: VERSION,
      },
      resolve
    )
  );
  // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
  return unlock();
};

export const rollback = async () => {
  if (!(await isCurrentVersion())) return;
  await new Promise((resolve) => storage().remove("version", resolve));
  await new Promise((resolve) => storage().remove("index", resolve));
  const viewings = await allViewings();
  // @ts-expect-error ts-migrate(2569) FIXME: Type 'Map<unknown, unknown>' is not an array type ... Remove this comment to see the full error message
  forEach([...viewings], async ([id, obj]) => {
    const { session_id: sessionId, video_id: videoId } = obj;
    await new Promise((resolve) =>
      storage().set({ [`${sessionId}_${videoId}`]: obj }, resolve)
    );
    await new Promise((resolve) => storage().remove(id, resolve));
  });
};

export default class ChromeExtensionWrapper {
  static save(key: any, value: any) {
    storage().set({ [key]: value });
  }

  static saveRemoveTarget(value: any) {
    this.save("RemovedTargetKeys", value);
  }

  static load(key: any, callback: any) {
    // @ts-expect-error ts-migrate(2538) FIXME: Type 'any' cannot be used as an index type.
    storage().get(key.toString(), ({ [key]: value }) => callback(value));
  }

  static loadRemovedTarget(callback: any) {
    this.load("RemovedTargetKeys", (value: any) => callback(Array.isArray(value) ? value : [])
    );
  }

  static remove(key: any) {
    storage().remove(key.toString());
  }

  static loadAgreedTerm(callback: any) {
    if (isMobile() || isWeb()) {
      callback(true);
      return;
    }

    this.load("AgreedTerm", (value: any) => {
      callback(value || false);
    });
  }
}
