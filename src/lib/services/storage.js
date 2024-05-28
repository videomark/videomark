import { writable } from 'svelte/store';

/**
 * 現在のデータスキーマバージョン。
 */
export const SCHEMA_VERSION = new Date('2019-07-18T00:00:00Z').getTime();

/**
 * Promise に対応させた WebExtension Storage API のラッパー。
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage
 */
export class storage {
  static async get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (obj) => {
        resolve(obj[key]);
      });
    });
  }

  static async getAll() {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (obj) => {
        resolve(obj);
      });
    });
  }

  static async set(key, value) {
    return chrome.storage.local.set({ [key]: value });
  }

  static async setAll(obj) {
    return chrome.storage.local.set(obj);
  }

  static async delete(key) {
    return chrome.storage.local.remove(Array.isArray(key) ? key : [key]);
  }

  static async clear() {
    return chrome.storage.local.clear();
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
