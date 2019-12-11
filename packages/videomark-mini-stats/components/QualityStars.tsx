import * as React from "react";
import { clamp } from "./math";
import JPText from "./JPText";

const clampQuality = clamp(1, 5);

interface QualityStarsProps extends React.SVGProps<SVGGElement> {
  quality: number;
}

export const QualityStars: React.FC<QualityStarsProps> = ({
  quality,
  ...props
}) => {
  const rate = clampQuality(quality) / 5;

  return (
    <g {...props}>
      <defs>
        <linearGradient id="quality-stars-fill">
          <stop offset={0.0} stopColor="#ffffff"></stop>
          <stop offset={rate} stopColor="#ffffff"></stop>
          <stop offset={rate} stopColor="#00000020"></stop>
          <stop offset={1.0} stopColor="#00000020"></stop>
        </linearGradient>
      </defs>
      <JPText
        dominantBaseline="middle"
        fill="url(#quality-stars-fill)"
        fontSize={26}
      >
        ★★★★★
      </JPText>
    </g>
  );
};

export default QualityStars;
