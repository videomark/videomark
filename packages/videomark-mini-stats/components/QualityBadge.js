import * as React from "react";
import { clamp } from "./math";
import QualityStars from "./QualityStars";
import JPText from "./JPText";
const clampQuality = clamp(1, 5);
const width = 400;
const labelColor = "#555555";
const messageColor = "#9BCC0A";
export const QualityBadge = ({ label, quality, ...props }) => (React.createElement("g", Object.assign({}, props),
    React.createElement("rect", { x: 0, width: 160, height: 40, fill: labelColor }),
    React.createElement(JPText, { x: 160 / 2, y: 22, textAnchor: "middle", dominantBaseline: "middle", fontSize: 24, fill: "#ffffff" }, label),
    React.createElement("rect", { x: 160, width: width - 160, height: 40, fill: messageColor }),
    React.createElement(JPText, { x: 196, y: 22, dominantBaseline: "middle", fontSize: 24, fontWeight: "bold", fill: "#ffffff" }, clampQuality(quality).toFixed(1)),
    React.createElement(QualityStars, { x: 240, y: 22, transform: `translate(${240},${22})`, width: width - 160, height: 40, quality: quality })));
export default QualityBadge;
