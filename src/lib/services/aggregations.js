import { fetchAllHourlyQoe, fetchRegionalQoe } from '$lib/services/api';

const cachedHourlyQoe = [];
const cachedRegionalQoe = [];

/**
 * データベース上の集合データから与えられた時間帯の平均 QoE 値を取得。
 * @param {number} hour 0 から 23 までの時間帯。
 * @returns {Promise.<?number>} QoE 値。何らかの理由で取得できなかった場合は `null`。
 */
export const getHourlyQoe = async (hour) => {
  const search = (c) => c.hour === hour;
  const cache = cachedHourlyQoe.find(search);

  if (cache) {
    return cache.average;
  }

  try {
    const results = await fetchAllHourlyQoe();

    if (!Array.isArray(results)) {
      return null;
    }

    cachedHourlyQoe.push(
      ...results.map(({ hour, average }) => ({
        hour,
        average: Number(average.toFixed(2)),
      })),
    );

    const { average } = cachedHourlyQoe.find(search) || {};

    return average || null;
  } catch {
    return null;
  }
};

/**
 * データベース上の集合データから与えられた地域の平均 QoE 値を取得。
 * @param {string} country 国コード。例: `JP`。
 * @param {string} subdivision 地域コード。日本の場合は `13` などの都道府県コード、他国の州は `ON` など。
 * @returns {Promise.<?number>} QoE 値。何らかの理由で取得できなかった場合は `null`。
 */
export const getRegionalQoe = async (country, subdivision) => {
  const search = (c) => c.country === country && c.subdivision === subdivision;
  const cache = cachedRegionalQoe.find(search);

  if (cache) {
    return cache.average;
  }

  try {
    const data = await fetchRegionalQoe(country, subdivision);
    const average = data.average ? Number(data.average.toFixed(2)) : null;

    if (!average) {
      return null;
    }

    cachedRegionalQoe.push({ country, subdivision, average });

    return average;
  } catch {
    return null;
  }
};
