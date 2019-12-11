import differenceInDays from "date-fns/differenceInDays";
import compareAsc from "date-fns/compareAsc";
import { min, max } from "./math";

export interface PlayingTimeWithDate
  extends Array<{
    date: Date;
    day: string;
    value: number;
  }> {}

/** 昇順ソート */
export const sortAsc = (days: PlayingTimeWithDate) => {
  return days.sort(({ date: a }, { date: b }) => compareAsc(a, b));
};

/** 任意の日より後ろの全要素 */
export const sliceDate = (ascDays: PlayingTimeWithDate, begin: Date) => {
  const startIndex = ascDays.findIndex(({ date }) => begin <= date);
  return new Map(
    ascDays.slice(startIndex).map(({ day, value }) => [day, value])
  );
};

/** 最小値と最大値 */
export const minAndMax = (days: ReturnType<typeof sliceDate>) => {
  const values = [...days.values()];
  return [min(...values), max(...values)];
};

export interface StatsData {
  count: number;
  playingTime: Array<{ day: string; value: number }>;
  averageQoE: number;
  averageWaitingRatio: number;
  averageDroppedVideoFrameRatio: number;
}

/** 文字列 yyyy-MM-dd を Date オブジェクトに変換 */
const withDate = (data: StatsData["playingTime"]) =>
  data.map(({ day, value }) => ({ date: new Date(day), day, value }));

const totalPlayingTime = (playingTime: StatsData["playingTime"]) => {
  if (playingTime == null) return 0;

  return playingTime.reduce(
    (previousValue, { value: currentValue }) =>
      Number.isFinite(currentValue)
        ? previousValue + currentValue
        : previousValue,
    0
  );
};

/** 再生時間の統計値 (データのソート、視聴時間の合計、1日あたりの平均視聴時間) */
export const playingTimeStats = (data: StatsData["playingTime"]) => {
  const playingTimeWithDate = sortAsc(withDate(data));
  const total = totalPlayingTime(data);
  const now = new Date();
  const begin =
    playingTimeWithDate.length > 0 ? playingTimeWithDate[0].date : now;
  const totalDays = differenceInDays(now, begin);

  return {
    playingTimeWithDate,
    total,
    daily: totalDays > 0 ? total / totalDays : 0
  };
};
