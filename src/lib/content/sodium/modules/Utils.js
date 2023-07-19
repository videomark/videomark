export const jsonParseSafe = (text, defaultValue = {}) => {
  try {
    const value = JSON.parse(text);

    // undefinedとnullは存在しないプロパティにアクセスすると
    // エラーを投げるので、代わりにdefaultValueを返す
    return value === undefined || value === null ? defaultValue : value;
  } catch (e) {
    return defaultValue;
  }
};

/**
 * コンテンツスクリプトからデータを取得。
 * @param {string} prop プロパティ名。
 * @param {{ [key: string]: any }} [extra] メッセージに追加で渡すデータ。
 * @returns {Promise.<any>} 結果。
 */
export const getDataFromContentJs = async (prop, extra = {}) => {
  const timestamp = Date.now();

  return new Promise((resolve) => {
    const listener = ({ data }) => {
      if (
        data.type === 'FROM_CONTENT_JS' &&
        data.method === 'get_data' &&
        data.timestamp === timestamp
      ) {
        window.removeEventListener('message', listener);
        resolve(data.detail);
      }
    };

    window.addEventListener('message', listener);

    window.postMessage({
      type: 'FROM_SODIUM_JS',
      method: 'get_data',
      timestamp,
      prop,
      ...extra,
    });
  });
};
