import addYears from "date-fns/addYears";

// NOTE: サーバー側で "_" が使えない
const invalidCharacters = /[^0-9A-Za-z.-]/u;

/**
 * セッションIDの上書き処理
 * @param {{ expires_in: number}} settings 設定オブジェクト
 * @param {string} sessionId セッションID
 * @param {Function} handlers.saveSettings 設定保存処理
 * @param {Function} handlers.saveSession セッション保存処理
 */
function overwriteSessionId(settings, sessionId, handlers) {
  if (settings === undefined) return;
  if (!sessionId) return;

  if (invalidCharacters.test(sessionId)) {
    // TODO: alert() は標準ではないので他の何らかのインタラクティブな入力方法に変更したい
    alert("他のセッションIDを入力してください");
    console.error("Session ID is invalid");
    return;
  }

  // NOTE: オーバーフロー無く十分に長い適当な期間
  const expiresIn = addYears(0, 10).getTime();

  handlers.saveSettings({
    ...settings,
    expires_in: expiresIn,
  });
  handlers.saveSession({ id: sessionId, expires: Date.now() + expiresIn });
}

export default overwriteSessionId;
