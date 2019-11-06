import * as React from "react";

// NOTE: to add css: @import url("https://fonts.googleapis.com/css?family=Noto+Sans+JP");
const JPText: React.FC<React.SVGProps<SVGTextElement>> = props => (
  <text fontFamily="Noto Sans JP" {...props}></text>
);

type StatsData = {
  count: number;
  playingTime: Array<{ day: string; value: number }>;
  averageQoE: number;
  averageWaitingRatio: number;
  averageDroppedVideoFrameRatio: number;
};

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
      <JPText x={20} y={50} fontSize={40}>
        VideoMark 動画視聴統計
      </JPText>
      <JPText x={20} y={100} fontSize={24}>
        平均品質 {averageQoE}
      </JPText>
      <JPText x={20} y={150} fontSize={24}>
        フレームドロップ率 {averageDroppedVideoFrameRatio}
      </JPText>
      <JPText x={20} y={200} fontSize={24}>
        待機時間割合 {averageWaitingRatio}
      </JPText>
      <JPText x={20} y={250} fontSize={24}>
        視聴時間 {total}
      </JPText>
      <JPText x={20} y={300} fontSize={24}>
        動画件数 {count}
      </JPText>
    </svg>
  );
};

export default SVG;
