import { writable } from 'svelte/store';
import { isExtension, isVmBrowser } from '$lib/services/runtime';

/**
 * 現在のデータスキーマバージョン。
 */
export const SCHEMA_VERSION = new Date('2019-07-18T00:00:00Z').getTime();

/**
 * WebExtension Storage API のテスト用モック。
 */
class mockStorage {
  static data = {};

  static get(keys, callback) {
    if (Array.isArray(keys)) {
      callback(Object.fromEntries(keys.map((key) => [key, this.data[key]])));
    } else if (typeof keys === 'string') {
      callback({ [keys]: this.data[keys] });
    } else {
      callback(this.data);
    }
  }

  static set(obj, callback) {
    Object.assign(this.data, obj);
    callback();
  }

  static remove(keys, callback) {
    if (Array.isArray(keys)) {
      keys.forEach((key) => {
        delete this.data[key];
      });
    } else if (typeof keys === 'string') {
      delete this.data[keys];
    }

    callback();
  }

  static clear(callback) {
    Object.keys(this.data).forEach((key) => {
      delete this.data[key];
    });

    callback();
  }
}

/**
 * Promise に対応させた WebExtension Storage API のラッパー。
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage
 */
export class storage {
  static get localStorage() {
    if (isVmBrowser()) {
      return sodium.storage.local;
    }

    if (isExtension()) {
      return chrome.storage.local;
    }

    return mockStorage;
  }

  static async get(key) {
    return (await this.localStorage.get([key]))[key];
  }

  static async getAll() {
    return this.localStorage.get();
  }

  static async set(key, value) {
    return this.localStorage.set({ [key]: value });
  }

  static async setAll(obj) {
    return this.localStorage.set(obj);
  }

  static async delete(key) {
    return this.localStorage.remove([key]);
  }

  static async clear() {
    return this.localStorage.clear();
  }
}

/**
 * ストレージから現在の値を取得し、以後の変更を自動的にストレージへ同期するストアを作成。
 * @param {string} key ストレージ内のプロパティーキー。
 * @param {*} [defaultValue] 既定値。
 * @returns {import('svelte/store').Writable} ストア。
 */
export const createStorageSync = (key, defaultValue = {}) => {
  const store = writable(defaultValue, (set) => {
    (async () => {
      const storedValue = await storage.get(key);

      if (Array.isArray(defaultValue)) {
        set([...new Set([...defaultValue, ...(storedValue || [])])]);
      } else if (typeof defaultValue === 'object' && defaultValue !== null) {
        set({ ...defaultValue, ...(storedValue || {}) });
      } else {
        set(storedValue || defaultValue);
      }
    })();
  });

  store.subscribe(async (change) => {
    await storage.set(key, change);
  });

  return store;
};
