const { SODIUM_API_ENDPOINT } = import.meta.env;

/**
 * リモート Sodium サーバーへ API リクエストを送信。
 * @param {string} path API メソッド・パス。
 * @param {object} params POST 本体。
 * @returns {Promise.<*>} 問い合わせ結果。
 */
const sendRequest = async (path, params) => {
  const response = await fetch(`${SODIUM_API_ENDPOINT}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error();
  }

  return response.json();
};

/**
 * データベース上の集合データから時間帯別平均 QoE 値を取得。
 * @returns {Promise.<{ hour: number, average: number }[]>} 結果。
 */
export const fetchAllHourlyQoe = async () => sendRequest('stats', { group: 'hour', limit: 24 });

/**
 * データベース上の集合データから地域別平均 QoE 値を取得。
 * @param {string} country 国コード。例: `JP`。
 * @param {string} subdivision 地域コード。日本の場合は `13` などの都道府県コード、他国は `ON` などの州コード。
 * @returns {Promise.<?object>} 結果。
 */
export const fetchRegionalQoe = async (country, subdivision) => {
  try {
    const results = await sendRequest('stats/subdivision', { country, subdivision, limit: 24 });

    if (!Array.isArray(results)) {
      return null;
    }

    return results[0]?.data?.[0] || null;
  } catch {
    return null;
  }
};

/**
 * 与えられた ID に該当する動画の視聴地域を取得。
 * @param {string} videoId 動画再生 ID。
 * @param {string} sessionId セッション ID。
 * @returns {Promise.<?{ country: string, subdivision?: string, isp: string }>} 結果。
 */
export const fetchViewerRegion = async (videoId, sessionId) => {
  try {
    const results = await sendRequest('stats/info', { video: videoId, session: sessionId });

    if (!Array.isArray(results)) {
      return null;
    }

    return results[0] || null;
  } catch {
    return null;
  }
};

/**
 * 与えられた ID リストに該当する動画の確定 QoE 値を取得。
 * @param {{ videoId: string, sessionId: string }[]} ids 動画再生・セッション ID のリスト。
 * @returns {Promise.<object[]>} 結果。
 */
export const fetchFinalQoeValues = async (ids) =>
  sendRequest('api/fixed_qoe', {
    ids: ids.map(({ playbackId, sessionId }) => ({ video_id: playbackId, session_id: sessionId })),
  });

/**
 * データベースから履歴を削除。
 * @param {{ videoId: string, sessionId: string }[]} ids 動画再生・セッション ID のリスト。
 * @returns {Promise.<undefined>} 結果。
 */
export const deleteHistoryItems = async (ids) =>
  sendRequest(
    'ctrl/erasure',
    ids.map(({ playbackId, sessionId }) => ({ video: playbackId, session: sessionId })),
  );
