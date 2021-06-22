import { validate, version } from "uuid";

/**
 * セッションIDをもとにセッション種別を判定する
 * @param {string} id セッションID
 * @return {"social" | "personal"} セッション種別 -  社会的セッション: "social", 個人的セッション: "personal"
 */
function getSessionType(id) {
  if (!validate(id)) return "personal";

  return version(id) === 4 ? "social" : "personal";
}

export default getSessionType;
