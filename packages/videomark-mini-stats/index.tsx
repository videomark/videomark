import * as React from "react";
import { floor } from "./components/math";
import Calendar from "./components/Calendar";
import QualityBadge from "./components/QualityBadge";
import Badge from "./components/Badge";
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

  const totalMinutes = playingTime.reduce(
    (previousValue, { value: currentValue }) =>
      previousValue + currentValue / 60e3,
    0
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={512}
      height={512}
    >
      <rect x={0} y={0} width="100%" height="100%" fill="#FFFFFF" />
      <JPText
        x="50%"
        y={16}
        textAnchor="middle"
        dominantBaseline="text-before-edge"
        fontSize={32}
      >
        VideoMark 動画視聴統計
      </JPText>
      <Calendar
        x={56}
        y={88}
        transform={`translate(${56},${88})`}
        data={playingTime}
      />
      <QualityBadge
        x={56}
        y={320}
        transform={`translate(${56},${320})`}
        label="平均品質"
        quality={averageQoE}
      />
      <Badge
        x={56}
        y={390}
        transform={`translate(${56},${390})`}
        label="視聴時間"
        message={[
          totalMinutes > 60
            ? `${floor(totalMinutes / 60).toLocaleString()}時間`
            : "",
          `${floor(totalMinutes % 60)}分`
        ].join("")}
      />
      <JPText x="2%" y={460} fontSize={12}>
        フレームドロップ率 {averageDroppedVideoFrameRatio}
      </JPText>
      <JPText x="2%" y={480} fontSize={12}>
        待機時間割合 {averageWaitingRatio}
      </JPText>
      <JPText x="2%" y={500} fontSize={12}>
        動画件数 {count}
      </JPText>
      <JPText x="98%" y="99%" textAnchor="end" fontSize={10} fillOpacity={0.5}>
        https://vm.webdino.org/
      </JPText>
    </svg>
  );
};

export default SVG;
