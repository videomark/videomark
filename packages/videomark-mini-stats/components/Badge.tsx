import * as React from "react";
import JPText from "./JPText";

const width = 400;
const labelColor = "#555555";
const messageColor = "#9BCC0A";

interface BadgeProps extends React.SVGProps<SVGGElement> {
  label: string;
  message: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, message, ...props }) => (
  <g {...props}>
    <rect x={0} width={160} height={40} fill={labelColor} />
    <JPText
      x={160 / 2}
      y={20}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={24}
      fill="#ffffff"
    >
      {label}
    </JPText>
    <rect x={160} width={width - 160} height={40} fill={messageColor} />
    <JPText
      x={160 + (width - 160) / 2}
      y={20}
      width={160}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={24}
      fontWeight="bold"
      fill="#ffffff"
    >
      {message}
    </JPText>
  </g>
);

export default Badge;
