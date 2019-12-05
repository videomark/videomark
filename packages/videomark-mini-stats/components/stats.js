import differenceInDays from "date-fns/differenceInDays";
import compareAsc from "date-fns/compareAsc";
import { min, max } from "./math";
/** 昇順ソート */
export const sortAsc = (days) => {
    return days.sort(({ date: a }, { date: b }) => compareAsc(a, b));
};
/** 任意の日より後ろの全要素 */
export const sliceDate = (ascDays, begin) => {
    const startIndex = ascDays.findIndex(({ date }) => begin <= date);
    return new Map(ascDays.slice(startIndex).map(({ day, value }) => [day, value]));
};
/** 最小値と最大値 */
export const minAndMax = (days) => {
    const values = [...days.values()];
    return [min(...values), max(...values)];
};
/** 文字列 yyyy-MM-dd を Date オブジェクトに変換 */
const withDate = (data) => data.map(({ day, value }) => ({ date: new Date(day), day, value }));
const totalPlayingTime = (playingTime) => {
    return playingTime.reduce((previousValue, { value: currentValue }) => Number.isFinite(currentValue)
        ? previousValue + currentValue
        : previousValue, 0);
};
/** 再生時間の統計値 (データのソート、視聴時間の合計、1日あたりの平均視聴時間) */
export const playingTimeStats = (data) => {
    const playingTimeWithDate = sortAsc(withDate(data));
    const total = totalPlayingTime(data);
    const begin = playingTimeWithDate[0].date;
    const totalDays = differenceInDays(new Date(), begin);
    return {
        playingTimeWithDate,
        total,
        daily: total / totalDays
    };
};
