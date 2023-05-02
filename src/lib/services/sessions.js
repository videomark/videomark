import { createStorageSync } from '$lib/services/storage';
import { validate, version } from 'uuid';

export const session = createStorageSync('session', {});

// NOTE: サーバー側で "_" が使えない
const invalidCharacters = /[^0-9A-Za-z.-]/u;

/**
 * セッション ID をもとにセッション種別を判定。
 * @param {string} id セッションID。
 * @return {('social'|'personal')} セッション種別。通常の用途では `social`。
 */
export const getSessionType = (id) => (validate(id) && version(id) === 4 ? 'social' : 'personal');

/**
 * セッション ID を上書き。
 * @param {object} settings 設定オブジェクト。
 * @param {string} sessionId セッション ID。
 * @param {object} handlers 処理関数群。
 * @param {Function} handlers.saveSettings 設定保存処理。
 * @param {Function} handlers.saveSession セッション保存処理。
 */
export const overwriteSessionId = (settings, sessionId, { saveSettings, saveSession }) => {
  if (!settings || !sessionId) {
    return;
  }

  if (invalidCharacters.test(sessionId)) {
    // TODO: alert() は標準ではないので他の何らかのインタラクティブな入力方法に変更したい
    alert('他のセッションIDを入力してください');
    console.error('Session ID is invalid');
    return;
  }

  // NOTE: オーバーフロー無く十分に長い適当な期間
  const expiresIn = 10 * 365 * 24 * 60 * 60 * 1000;

  saveSettings({
    ...settings,
    expires_in: expiresIn,
  });

  saveSession({
    id: sessionId,
    expires: Date.now() + expiresIn,
  });
};
