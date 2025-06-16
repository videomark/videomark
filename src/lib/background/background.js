import { get } from 'svelte/store';
import { historyRecordsDB, historyStatsDB } from '$lib/services/history/database';
import { openTab } from '$lib/services/navigation';
import { isMobile } from '$lib/services/runtime';
import { SCHEMA_VERSION, storage } from '$lib/services/storage';
import { videoPlatformHosts } from '$lib/services/video-platforms';

(async () => {
  const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = [];
  const addRules = [];

  // Resource Timing API を有効化するためのルールを追加
  // @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Timing-Allow-Origin
  if (!currentRules.find((rule) => rule.id === 1)) {
    addRules.push({
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          {
            header: 'Timing-Allow-Origin',
            operation: 'set',
            value: '*',
          },
        ],
      },
      condition: {
        initiatorDomains: videoPlatformHosts.map((host) => host.replace(/^\*\./, '')),
      },
    });
  }

  // YouTube の埋め込みに対応していなかった古いルールを削除。以下のルール 3 に置き換え
  if (currentRules.find((rule) => rule.id === 2)) {
    removeRuleIds.push(2);
  }

  // Svelte が出力するコードに `innerHTML` が含まれることがあり、これが YouTube で設定されている CSP
  // `require-trusted-types-for 'script'` に抵触し、`This document requires 'TrustedHTML' assignment`
  // というエラーを生む原因となる。これを回避するため CSP を削除する。
  // @see https://github.com/sveltejs/svelte/issues/10826
  // @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for
  if (!currentRules.find((rule) => rule.id === 3)) {
    addRules.push({
      id: 3,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          {
            header: 'Content-Security-Policy',
            operation: 'remove',
          },
        ],
      },
      condition: {
        regexFilter: '^https://.+\\.youtube(-nocookie)?\\.com/',
        resourceTypes: ['main_frame', 'sub_frame'],
      },
    });
  }

  if (removeRuleIds.length || addRules.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
  }
})();

chrome.webRequest.onResponseStarted.addListener(
  async (details) => {
    const url = new URL(details.url);

    if (url.host && details.ip) {
      const hostToIp = (await storage.get('hostToIp')) || {};

      await storage.set('hostToIp', { ...hostToIp, [url.host]: details.ip });
    }
  },
  {
    urls: ['<all_urls>'],
  },
  ['responseHeaders'],
);

const initToolbarButton = async () => {
  const termsAgreed = await storage.get('AgreedTerm');
  const action = chrome.action ?? chrome.browserAction;

  if (termsAgreed) {
    action.setPopup({ popup: '/index.html#/popup' });
  } else if (get(isMobile)) {
    action.setPopup({ popup: '/index.html#/onboarding' });
  } else {
    action.onClicked.addListener(() => openTab('#/onboarding'));
  }
};

initToolbarButton();

/**
 * 過去の閲覧履歴データを、プロパティ名を一部変更しつつ、拡張機能ストレージから IndexedDB へ移行。
 * @param {Record<string, any>} storageData ストレージに保管されている旧来のデータ。
 */
const migrateStorageData = async (storageData) => {
  const legacyRecords = Object.entries(storageData).filter(([sKey]) => sKey.match(/^\d+$/));
  /** @type {[string, any][]} */
  const historyRecords = [];
  /** @type {[string, any][]} */
  const historyStats = [];

  legacyRecords.forEach(([sKey, value]) => {
    const key = Number(sKey);

    const {
      // historyRecordsDB へ移行
      session_id: sessionId,
      video_id: playbackId,
      user_agent: userAgent,
      location,
      media_size: mediaSize,
      domain_name: domain,
      start_time: startTime,
      end_time: endTime,
      thumbnail,
      title,
      calc: calculable,
      qoe,
      // historyStatsDB へ移行
      transfer_size: transferSize,
      log: logs,
    } = value;

    historyRecords.push([
      key,
      {
        sessionId,
        playbackId,
        userAgent,
        location,
        mediaSize,
        domain,
        startTime,
        endTime,
        thumbnail,
        title,
        calculable,
        qoe,
      },
    ]);

    historyStats.push([
      key,
      {
        transferSize,
        logs,
      },
    ]);
  });

  // 全件まとめて保存
  await Promise.all([
    historyRecordsDB.saveEntries(historyRecords),
    historyStatsDB.saveEntries(historyStats),
  ]);

  // ストレージ内のデータを削除
  await storage.delete(['index', ...legacyRecords.map(([sKey]) => sKey)]);
};

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    openTab('#/onboarding');
  }

  if (reason === 'update') {
    const storageData = (await storage.getAll()) || {};
    const { version, AgreedTerm: termsAgreed = false } = storageData;
    const legacyVersion = version && version < SCHEMA_VERSION;

    // 古いデータスキーマの場合は移行せず、利用規約同意有無のみ残して破棄
    if (legacyVersion) {
      await storage.clear();
      await storage.set('AgreedTerm', termsAgreed);
    }

    if (storageData.index) {
      migrateStorageData(storageData);
    }
  }
});

const getMasterDisplayOnPlayer = async () => {
  const settings = await storage.get('settings');

  return settings === null || settings.display_on_player === null || settings.display_on_player;
};

const state = {};

const getStorageKey = async (viewingId) => {
  if (typeof state[viewingId] === 'string' || Number.isFinite(state[viewingId])) {
    return state[viewingId];
  }

  const keys = (await historyRecordsDB.keys()) ?? [];
  const key = !keys.length ? 0 : keys.sort((a, b) => Number(a) - Number(b)).pop() + 1;

  state[viewingId] = key;

  return key;
};

const communicator = {
  setAlive: async (tab, alive) => {
    // eslint-disable-next-line no-use-before-define
    updateIcon(tab.id, alive);
  },
  updateHistory: async (tab, { id, data }) => {
    if (!id || !data) {
      return;
    }

    const key = await getStorageKey(id);

    if ('logs' in data || 'transferSize' in data) {
      await historyStatsDB.set(key, data);
    } else {
      await historyRecordsDB.set(key, data);
    }
  },
  setDisplayOnPlayer: async (tab, displayOnPlayer) => {
    const tabStatus = (await storage.get('tabStatus')) || {};
    const status = tabStatus[tab.id] || {};

    status.displayOnPlayer = displayOnPlayer;
    await storage.set('tabStatus', { ...tabStatus, [tab.id]: status });
  },
  getDisplayOnPlayer: async (tab) => {
    const tabStatus = (await storage.get('tabStatus')) || {};
    let { displayOnPlayer } = tabStatus[tab.id] || {};

    if (displayOnPlayer === undefined) {
      displayOnPlayer = await getMasterDisplayOnPlayer();
    }

    return { displayOnPlayer };
  },
  getPlatformInfo: async () => {
    const platformInfo = await new Promise((resolve) => {
      chrome.runtime.getPlatformInfo(resolve);
    });

    return { platformInfo };
  },
  getIp: async (tab, host) => {
    const hostToIp = (await storage.get('hostToIp')) || {};

    return { ip: hostToIp[host] };
  },
};

const popupCommunicator = {
  getTabStatus: async (tabId) => {
    const tabStatus = (await storage.get('tabStatus')) || {};
    const status = tabStatus[tabId] || {};

    if (status.displayOnPlayer === undefined) {
      status.displayOnPlayer = await getMasterDisplayOnPlayer();
    }

    return status;
  },
};

/** 計測中であることをツールバーのアイコンで通知する */
const updateIcon = async (tabId, enabled) => {
  const tabStatus = (await storage.get('tabStatus')) || {};
  const status = tabStatus[tabId] || {};

  if (status.alive === enabled) {
    return;
  }

  status.alive = enabled;
  await storage.set('tabStatus', { ...tabStatus, [tabId]: status });

  (chrome.action ?? chrome.browserAction).setIcon({
    tabId,
    path: enabled ? '/images/icons/enabled.png' : '/images/icons/disabled.png',
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { method, args = [] } = request;
  const { tab } = sender;

  if (!method) {
    return false;
  }

  // 本来は `Promise` を返しその中で解決すれば良いはずだが、なぜかレスポンスが `undefined` となってしまうので、
  // 以下のように非同期即時関数を用意し、従来通り `sendResponse` を使う。
  (async () => {
    const response = tab
      ? await communicator[method].apply(null, [tab, ...args])
      : await popupCommunicator[method].apply(null, [...args]);

    sendResponse(response || {});
  })();

  return true;
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const tabStatus = (await storage.get('tabStatus')) || {};

  delete tabStatus[tabId];
  await storage.set('tabStatus', tabStatus);
  // `chrome.action.setIcon()` は余計なエラーが出るので不要
});

// Setting the uninstall URL
chrome.runtime.setUninstallURL('https://videomark.webdino.org/offboarding');
