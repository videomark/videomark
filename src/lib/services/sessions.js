import { get } from 'svelte/store';
import { validate, version } from 'uuid';
import { settings } from '$lib/services/settings';
import { createStorageSync, storage } from '$lib/services/storage';

export const session = createStorageSync('session', {
  id: window.crypto.randomUUID(),
  type: 'social',
  expires: Date.now() + get(settings).expires_in,
});

// NOTE: サーバー側で "_" が使えない
const allowedPattern = /^[0-9A-Za-z.-]+$/;

/**
 * セッション ID をもとにセッション種別を判定。
 * @param {string} id セッションID。
 * @return {('social'|'personal')} セッション種別。通常の用途では `social`。
 */
export const getSessionType = (id) => (validate(id) && version(id) === 4 ? 'social' : 'personal');

/**
 * セッション ID を即時上書き。
 * @param {string} sessionId セッション ID。
 * @param {number} expiresIn 有効期間 (ms)。
 */
export const overwritePersonalSession = async (sessionId, expiresIn) => {
  if (!(getSessionType(sessionId) === 'personal' && allowedPattern.test(sessionId))) {
    const error = new Error('Session ID is invalid');

    // eslint-disable-next-line no-alert
    window.alert(error.message);
    throw error;
  }

  const personalSession = {
    type: 'personal',
    id: sessionId,
    expires: Date.now() + expiresIn,
  };

  await storage.set('session', personalSession);
  // storage への書き込みを完了を待機してから呼び出さなければ古い状態のまま
  session.set(personalSession);
};
