import * as React from "react";
import Calendar from "./components/Calendar";
import JPText from "./components/JPText";

interface StatsData {
  count: number;
  playingTime: Array<{ day: string; value: number }>;
  averageQoE: number;
  averageWaitingRatio: number;
  averageDroppedVideoFrameRatio: number;
}

const SVG: React.FC<{ data: StatsData }> = ({ data }) => {
  const {
    count,
    playingTime,
    averageQoE,
    averageWaitingRatio,
    averageDroppedVideoFrameRatio
  } = data;

  const total = playingTime.reduce(
    (previousValue, { value: currentValue }) => previousValue + currentValue,
    0
  );
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={512}
      height={512}
    >
      <rect x={0} y={0} width={512} height={512} fill="#FFFFFF" />
      <JPText x={20} y={50} fontSize={40}>
        VideoMark 動画視聴統計
      </JPText>
      <Calendar
        x={56}
        y={88}
        transform={`translate(${56},${88})`}
        data={playingTime}
      />
      {/* 400x240 */}
      <JPText x={20} y={340} fontSize={24}>
        平均品質 {averageQoE}
      </JPText>
      <JPText x={20} y={380} fontSize={24}>
        フレームドロップ率 {averageDroppedVideoFrameRatio}
      </JPText>
      <JPText x={20} y={420} fontSize={24}>
        待機時間割合 {averageWaitingRatio}
      </JPText>
      <JPText x={20} y={460} fontSize={24}>
        視聴時間 {total}
      </JPText>
      <JPText x={20} y={500} fontSize={24}>
        動画件数 {count}
      </JPText>
    </svg>
  );
};

export default SVG;
