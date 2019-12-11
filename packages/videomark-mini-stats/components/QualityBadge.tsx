import * as React from "react";
import { clamp } from "./math";
import QualityStars from "./QualityStars";
import JPText from "./JPText";

const clampQuality = clamp(1, 5);

const width = 400;
const labelColor = "#555555";
const messageColor = "#9BCC0A";

interface QualityBadgeProps extends React.SVGProps<SVGGElement> {
  label: string;
  quality: number;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  label,
  quality,
  ...props
}) => (
  <g {...props}>
    <rect x={0} width={160} height={40} fill={labelColor} />
    <JPText
      x={160 / 2}
      y={22}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={24}
      fill="#ffffff"
    >
      {label}
    </JPText>
    <rect x={160} width={width - 160} height={40} fill={messageColor} />
    <JPText
      x={196}
      y={22}
      dominantBaseline="middle"
      fontSize={24}
      fontWeight="bold"
      fill="#ffffff"
    >
      {Number.isFinite(quality) ? clampQuality(quality).toFixed(1) : "n/a"}
    </JPText>
    <QualityStars
      x={240}
      y={22}
      transform={`translate(${240},${22})`}
      width={width - 160}
      height={40}
      quality={quality}
    />
  </g>
);

export default QualityBadge;
