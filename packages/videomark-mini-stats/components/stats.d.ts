export interface PlayingTimeWithDate extends Array<{
    date: Date;
    day: string;
    value: number;
}> {
}
/** 昇順ソート */
export declare const sortAsc: (days: PlayingTimeWithDate) => PlayingTimeWithDate;
/** 任意の日より後ろの全要素 */
export declare const sliceDate: (ascDays: PlayingTimeWithDate, begin: Date) => Map<string, number>;
/** 最小値と最大値 */
export declare const minAndMax: (days: Map<string, number>) => number[];
export interface StatsData {
    count: number;
    playingTime: Array<{
        day: string;
        value: number;
    }>;
    averageQoE: number;
    averageWaitingRatio: number;
    averageDroppedVideoFrameRatio: number;
}
/** 再生時間の統計値 (データのソート、視聴時間の合計、1日あたりの平均視聴時間) */
export declare const playingTimeStats: (data: StatsData["playingTime"]) => {
    playingTimeWithDate: PlayingTimeWithDate;
    total: number;
    daily: number;
};
