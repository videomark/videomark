import { deleteHistoryItems, fetchFinalQoe, fetchViewerRegion } from '$lib/services/api';
import { createStorageSync, storage } from '$lib/services/storage';
import { derived, get, writable } from 'svelte/store';
import { videoPlatforms } from './video-platforms';

// 保持する最大履歴アイテム数
const maxItems = 10000;

/**
 * 検索条件のステート。
 */
export const searchCriteria = writable({
  terms: '',
  dates: ['', ''],
  sources: videoPlatforms.filter(({ experimental }) => !experimental).map(({ id }) => id),
  quality: [1, 5],
  regions: [],
  hours: [0, 24],
});

/**
 * 閲覧履歴リストのステート。
 */
export const viewingHistory = writable(undefined, (set) => {
  // ステートを初期化
  (async () => {
    const storageData = (await storage.getAll()) || {};

    if (!storageData) {
      return;
    }

    const _viewingHistory = Object.entries(storageData)
      .filter(([key]) => key.match(/^\d+$/) && (storageData.index || []).includes(Number(key)))
      .map(([key, item]) => {
        const {
          video_id: id, // 同じ動画でも再生するたびに異なる
          session_id: sessionId,
          calc,
          title,
          location: url,
          thumbnail,
          start_time: startTime,
          qoe,
          region,
          transfer_size: transferSize,
          log = [],
        } = item;

        const platform = videoPlatforms.find(({ host }) => host.test(new URL(url).hostname));
        const qualityDetails = log[log.length - 1]?.quality || {}; // 最後のデータのみ必要
        const { droppedVideoFrames = 0, totalVideoFrames = 0 } = qualityDetails;

        return {
          key,
          id,
          sessionId,
          viewingId: [id, sessionId].join('_'),
          platformId: platform?.id,
          canCalc: calc === undefined || calc === true,
          title,
          url,
          thumbnail,
          startTime,
          qoe,
          region,
          transferSize,
          isLowQuality: !(droppedVideoFrames / totalVideoFrames <= 0.001),
          qualityDetails: qualityDetails,
        };
      })
      .sort((a, b) => b.startTime - a.startTime);

    set(_viewingHistory);

    await deleteScheduledItems();
    await addMissingData();
  })();

  return () => undefined;
});

/**
 * 閲覧履歴の地域リストのステート。
 */
export const viewingHistoryRegions = derived([viewingHistory], ([history]) => {
  const regions = [];

  history.forEach(({ region }) => {
    const { country, subdivision } = region ?? {};

    if (!country || !subdivision) {
      return;
    }

    const value = `${country}-${subdivision}`;

    if (!regions.includes(value)) {
      regions.push(value);
    }
  });

  regions
    .sort((a, b) => a.split('-')[1].localeCompare(b.split('-')[1]))
    .sort((a, b) => a.split('-')[0].localeCompare(b.split('-')[0]));

  searchCriteria.update((criteria) => ({ ...criteria, regions }));

  return regions;
});

/**
 * 削除予定の履歴アイテムのキーリスト。削除処理は次回起動時に行われる。
 */
export const deletedHistoryItemKeys = createStorageSync('RemovedTargetKeys', []);

/**
 * 与えられた履歴アイテムのキーを削除予定リストに追加。
 * @param {string[]} targetKeys 削除予定に加えるキーのリスト。
 */
export const deleteItemsLater = async (targetKeys) => {
  deletedHistoryItemKeys.update((keys) => [...new Set([...keys, ...targetKeys])]);
};

/**
 * 与えられた履歴アイテムのキーを削除予定リストから削除。
 * @param {string[]} targetKeys 削除予定から外すキーのリスト。
 */
export const undoDeletingItems = async (targetKeys) => {
  deletedHistoryItemKeys.update((keys) => keys.filter((key) => !targetKeys.includes(key)));
};

/**
 * 与えられたキーに該当する履歴アイテムを即座に削除。
 * @param {string[]} targetKeys 削除する履歴アイテムのキーのリスト。
 */
export const deleteItemsNow = async (targetKeys) => {
  const items = get(viewingHistory);

  const request = targetKeys
    .map((key) => items.find((entry) => entry.key === key))
    .filter(Boolean)
    .map(({ id, sessionId }) => ({ videoId: id, sessionId }));

  if (!request.length) {
    return;
  }

  try {
    await deleteHistoryItems(request);

    // index の更新
    await storage.set(
      'index',
      ((await storage.get('index')) || []).filter((key) => !targetKeys.includes(key)),
    );

    deletedHistoryItemKeys.update((keys) => keys.filter((key) => !targetKeys.includes(key)));

    targetKeys.forEach(async (key) => {
      await storage.delete(String(key));
    });

    viewingHistory.update((history) => history.filter(({ key }) => !targetKeys.includes(key)));
  } catch (ex) {
    console.error(`VIDEOMARK: ${ex}`);
  }
};

/**
 * 削除予定となっている履歴アイテムを即座に削除。
 */
export const deleteScheduledItems = async () => {
  const items = get(viewingHistory);
  const targetKeys = [
    ...((await get(deletedHistoryItemKeys)) || []),
    ...items.slice(0, items.length - maxItems).map(({ key }) => key),
  ];

  if (targetKeys.length) {
    await deleteItemsNow(targetKeys);
  }
};

/**
 * キャッシュされていない QoE 値と地域のデータを追加。
 */
const addMissingData = async () => {
  get(viewingHistory).forEach(async ({ key, id, sessionId, qoe, canCalc, region }, index) => {
    if ((qoe === undefined || qoe === -1) && canCalc) {
      [{ qoe } = {}] = (await fetchFinalQoe([{ videoId: id, sessionId }])) || [];
    }

    if (!region) {
      region = await fetchViewerRegion(id, sessionId);
    }

    if (qoe || region) {
      viewingHistory.update((history) => {
        history[index].qoe = qoe;
        history[index].region = region;

        return history;
      });

      // ストレージの内容も更新
      await storage.set(key, { ...(await storage.get(key)), qoe, region });
    }
  });
};
