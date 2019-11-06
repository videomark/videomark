import * as React from "react";
declare type StatsData = {
    count: number;
    playingTime: Array<{
        day: string;
        value: number;
    }>;
    averageQoE: number;
    averageWaitingRatio: number;
    averageDroppedVideoFrameRatio: number;
};
declare const SVG: React.FC<{
    data: StatsData;
}>;
export default SVG;
