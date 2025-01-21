import { derived, get, writable } from 'svelte/store';
import { deleteHistoryItems, fetchFinalQoeValues, fetchViewerRegion } from '$lib/services/api';
import { historyRecordsDB, historyStatsDB } from '$lib/services/history/database';
import { createStorageSync } from '$lib/services/storage';
import { videoPlatforms } from '../video-platforms';

// 保持する最大履歴アイテム数
const maxItems = 10000;

/**
 * 有効な計測・計算ステータスのリスト。
 */
export const validQualityStatuses = ['progress', 'complete', 'error'];

/**
 * QoE 値から計測・計算ステータスを取得する。
 * @param {(number | undefined)} qoe QuE 値。
 * @returns {('progress' | 'complete' | 'error')} ステータス。
 */
export const getQualityStatus = (qoe) => {
  if (qoe === undefined || qoe === -1) {
    return 'progress';
  }

  if (qoe === -2) {
    return 'error';
  }

  return 'complete';
};

/**
 * 検索条件のステート。
 */
export const searchCriteria = writable({
  terms: '',
  dateRange: ['', ''],
  sources: videoPlatforms.filter(({ experimental }) => !experimental).map(({ id }) => id),
  qualityStatuses: [...validQualityStatuses],
  qualityRange: [1, 5],
  regions: [],
  timeRange: [0, 24],
});

/**
 * 閲覧履歴リストのステート。
 * @type {import('svelte/store').Writable<HistoryItem[]>}
 */
export const viewingHistory = writable(undefined, (set) => {
  // ステートを初期化
  (async () => {
    const _viewingHistory = await Promise.all(
      (await historyRecordsDB.entries()).map(async ([sKey, item]) => {
        const {
          playbackId,
          sessionId,
          calculable = true,
          title,
          location: url,
          thumbnail,
          startTime,
          qoe,
          region,
        } = item;

        const { hostname } = new URL(url);

        return {
          key: Number(sKey),
          playbackId,
          sessionId,
          viewingId: [playbackId, sessionId].join('_'),
          platform: videoPlatforms.find(({ hostREs }) => hostREs.some((re) => re.test(hostname))),
          calculable,
          title,
          url,
          thumbnail,
          startTime,
          region,
          stats: {
            finalQoe: Number.isFinite(qoe) ? qoe : undefined,
          },
        };
      }),
    );

    set(_viewingHistory.sort((a, b) => b.startTime - a.startTime));

    // eslint-disable-next-line no-use-before-define
    await deleteScheduledItems();
    // eslint-disable-next-line no-use-before-define
    await addMissingData();
  })();

  return () => undefined;
});

/**
 * 閲覧履歴リストアイテムの統計データをすべて取得して完成させる。
 * @param {HistoryItem} historyItem 履歴アイテム。
 */
export const completeViewingHistoryItem = async (historyItem) => {
  const {
    key,
    stats: { finalQoe },
  } = historyItem;

  const { logs = [], transferSize = 0 } = (await historyStatsDB.get(key)) ?? {};

  /** @type {number[]} */
  const throughputList = logs
    .filter((entry) => !!entry.quality?.throughput?.length)
    .map((entry) => entry.quality.throughput[0].throughput);

  const averageThroughput =
    throughputList.reduce((acc, cur) => acc + cur, 0) / throughputList.length;

  const latestStats = logs.findLast(({ quality }) => !!quality)?.quality ?? {};
  const provisionalQoe = logs.findLast(({ qoe }) => typeof qoe === 'number')?.qoe;
  const { droppedVideoFrames = 0, totalVideoFrames = 0 } = latestStats;
  const isLowQuality = Number.isFinite(finalQoe) && droppedVideoFrames / totalVideoFrames > 0.001;

  viewingHistory.update((historyItems) => {
    const index = historyItems.findIndex((item) => item.key === key);

    Object.assign(historyItems[index].stats, {
      ...latestStats,
      throughput: averageThroughput,
      provisionalQoe,
      isLowQuality,
      transferSize,
    });

    return historyItems;
  });
};

/**
 * 閲覧履歴の地域リストのステート。
 */
export const viewingHistoryRegions = derived([viewingHistory], ([history]) => {
  const regions = [];
  let hasUnknown = false;

  history.forEach(({ region }) => {
    const { country, subdivision } = region ?? {};

    if (!country || !subdivision) {
      hasUnknown = true;

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

  if (hasUnknown) {
    regions.push('unknown');
  }

  searchCriteria.update((criteria) => ({ ...criteria, regions }));

  return regions;
});

/**
 * 閲覧履歴の配信元リストのステート。
 */
export const viewingHistorySources = derived([viewingHistory], ([history]) => {
  const sources = [...new Set(history.map(({ platform }) => platform?.id))];

  sources.sort();
  searchCriteria.update((criteria) => ({ ...criteria, sources }));

  return sources;
});

/**
 * 閲覧履歴の検索結果のステート。
 */
export const searchResults = derived([searchCriteria, viewingHistory], (states) => {
  const [criteria, historyItems] = states;

  const {
    terms,
    dateRange: [startDate, endDate],
    sources,
    qualityStatuses,
    qualityRange: [lowestQoe, highestQoe],
    regions,
    timeRange: [startHours, endHours],
  } = criteria;

  const searchTerms = terms.trim();

  return historyItems.filter((historyItem) => {
    const {
      title,
      platform,
      startTime,
      region,
      stats: { finalQoe },
    } = historyItem;

    const { country = '', subdivision = '' } = region ?? {};
    const hasRegion = !!(country && subdivision);
    const qualityStatus = getQualityStatus(finalQoe);
    const date = new Date(startTime);

    return (
      // 検索語
      (!searchTerms || title.toLocaleLowerCase().includes(searchTerms.toLocaleLowerCase())) &&
      // 視聴日
      (!startDate || new Date(`${startDate}T00:00:00`) <= date) &&
      (!endDate || date <= new Date(`${endDate}T23:59:59`)) &&
      // 配信元
      sources.includes(platform?.id) &&
      // 品質
      qualityStatuses.includes(qualityStatus) &&
      (qualityStatus !== 'complete' || lowestQoe <= finalQoe) &&
      (qualityStatus !== 'complete' || finalQoe <= highestQoe) &&
      // 地域
      ((hasRegion && regions.includes(`${country}-${subdivision}`)) ||
        (!hasRegion && regions.includes('unknown'))) &&
      // 時間帯
      startHours <= date.getHours() &&
      date.getHours() <= endHours
    );
  });
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
    .map(({ playbackId, sessionId }) => ({ playbackId, sessionId }));

  if (!request.length) {
    return;
  }

  try {
    await deleteHistoryItems(request);
    deletedHistoryItemKeys.update((keys) => keys.filter((key) => !targetKeys.includes(key)));
    viewingHistory.update((history) => history.filter(({ key }) => !targetKeys.includes(key)));
    await historyRecordsDB.deleteEntries(targetKeys);
    await historyStatsDB.deleteEntries(targetKeys);
  } catch (ex) {
    // eslint-disable-next-line no-console
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
  const _viewingHistory = get(viewingHistory);
  const newValueMap = Object.fromEntries(_viewingHistory.map(({ key }) => [key, {}]));

  const missingQoeValueItems = _viewingHistory.filter(
    ({ stats: { finalQoe }, calculable }) =>
      (finalQoe === undefined || finalQoe === -1) && calculable,
  );

  const missingRegionItems = _viewingHistory.filter(({ region }) => !region);

  if (missingQoeValueItems.length) {
    try {
      // 確定 QoE 値は複数まとめて取得可能
      const results = await fetchFinalQoeValues(
        missingQoeValueItems.map(({ playbackId, sessionId }) => ({ playbackId, sessionId })),
      );

      missingQoeValueItems.forEach(({ key }, index) => {
        newValueMap[key].qoe = results[index]?.qoe ?? -2;
      });
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(`VIDEOMARK: Failed to retrieve final QoE values; ${ex}`);
    }
  }

  if (missingRegionItems.length) {
    try {
      // 地域は 1 件ずつしか取れないため for ループで順番に取得
      // eslint-disable-next-line no-restricted-syntax
      for (const { key, playbackId, sessionId } of missingRegionItems) {
        // eslint-disable-next-line no-await-in-loop
        newValueMap[key].region = await fetchViewerRegion(playbackId, sessionId);
      }
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(`VIDEOMARK: Failed to retrieve viewing regions; ${ex}`);
    }
  }

  // メモリキャッシュを更新
  viewingHistory.update((history) => {
    Object.entries(newValueMap).forEach(([sKey, obj]) => {
      if (Object.keys(obj).length) {
        const key = Number(sKey);
        const historyItem = history.find((item) => item.key === key);

        if (historyItem) {
          const { qoe, region } = obj;

          if (qoe !== undefined) {
            historyItem.stats.finalQoe = qoe;
          }

          if (region !== undefined) {
            historyItem.region = region;
          }
        }
      }
    });

    return history;
  });

  // ストレージの内容も更新
  Object.entries(newValueMap).forEach(async ([sKey, obj]) => {
    if (Object.keys(obj).length) {
      const key = Number(sKey);
      const historyItem = await historyRecordsDB.get(key);

      if (historyItem) {
        await historyRecordsDB.set(key, { ...historyItem, ...obj });
      }
    }
  });
};
