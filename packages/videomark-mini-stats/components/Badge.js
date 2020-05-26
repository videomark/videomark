import * as React from "react";
import JPText from "./JPText";
const width = 400;
const labelColor = "#555555";
const messageColor = "#9BCC0A";
export const Badge = ({ label, message, ...props }) => (React.createElement("g", Object.assign({}, props),
    React.createElement("rect", { x: 0, width: 160, height: 40, fill: labelColor }),
    React.createElement(JPText, { x: 160 / 2, y: 22, textAnchor: "middle", dominantBaseline: "middle", fontSize: 24, fill: "#ffffff" }, label),
    React.createElement("rect", { x: 160, width: width - 160, height: 40, fill: messageColor }),
    React.createElement(JPText, { x: 160 + (width - 160) / 2, y: 22, width: 160, textAnchor: "middle", dominantBaseline: "middle", fontSize: 24, fontWeight: "bold", fill: "#ffffff" }, message)));
export default Badge;
