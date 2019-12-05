import * as React from "react";
import Calendar from "./components/Calendar";
import QualityBadge from "./components/QualityBadge";
import Badge from "./components/Badge";
import JPText from "./components/JPText";
import timeFormat from "./components/jpTimeFormat";
import { StatsData, playingTimeStats } from "./components/stats";

const SVG: React.FC<{ data: StatsData }> = ({ data }) => {
  const {
    count,
    playingTime,
    averageQoE,
    averageWaitingRatio,
    averageDroppedVideoFrameRatio
  } = data;

  const { playingTimeWithDate, total, daily } = playingTimeStats(playingTime);

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
        y={20}
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
        data={playingTimeWithDate}
      />
      <QualityBadge
        x={56}
        y={320}
        transform={`translate(${56},${320})`}
        label="平均品質"
        quality={averageQoE}
      />
      <JPText
        x="64%"
        y={368}
        textAnchor="end"
        dominantBaseline="text-before-edge"
        fontSize={14}
      >
        フレームドロップ率{" "}
        {Number.isFinite(averageDroppedVideoFrameRatio)
          ? (averageDroppedVideoFrameRatio * 100).toFixed(1)
          : 0}
        %
      </JPText>
      <JPText
        x="88%"
        y={368}
        textAnchor="end"
        dominantBaseline="text-before-edge"
        fontSize={14}
      >
        待機時間割合{" "}
        {Number.isNaN(averageWaitingRatio)
          ? (averageWaitingRatio * 100).toFixed(1)
          : 0}
        %
      </JPText>
      <Badge
        x={56}
        y={400}
        transform={`translate(${56},${400})`}
        label="視聴時間"
        message={timeFormat(total)}
      />
      <JPText
        x="64%"
        y={448}
        textAnchor="end"
        dominantBaseline="text-before-edge"
        fontSize={14}
      >
        1日あたり {timeFormat(daily)}
      </JPText>
      <JPText
        x="88%"
        y={448}
        textAnchor="end"
        dominantBaseline="text-before-edge"
        fontSize={14}
      >
        動画件数 {Number.isFinite(count) ? count : 0}
      </JPText>
      <JPText x="98%" y="99%" textAnchor="end" fontSize={10} fillOpacity={0.5}>
        https://vm.webdino.org/
      </JPText>
    </svg>
  );
};

export default SVG;
