/**
 * 配列にアイテムを追加または削除する。`Set` を使うことで重複したアイテムが含まれるのを防ぐ。
 * @param {string[]} list 元の配列。
 * @param {string} item 追加または削除するアイテム。
 * @param {boolean} [add] 追加するか削除するか。
 * @returns {string[]} 更新された配列。
 */
export const toggleListItem = (list, item, add = true) => {
  const set = new Set(list);

  if (add) {
    set.add(item);
  } else {
    set.delete(item);
  }

  return [...set];
};
