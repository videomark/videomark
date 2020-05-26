import * as React from "react";
import { clamp } from "./math";
import JPText from "./JPText";
const clampQuality = clamp(1, 5);
export const QualityStars = ({ quality, ...props }) => {
    const rate = quality > 0 ? clampQuality(quality) / 5 : 0;
    return (React.createElement("g", Object.assign({}, props),
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "quality-stars-fill" },
                React.createElement("stop", { offset: 0.0, stopColor: "#ffffff" }),
                React.createElement("stop", { offset: rate, stopColor: "#ffffff" }),
                React.createElement("stop", { offset: rate, stopColor: "#00000020" }),
                React.createElement("stop", { offset: 1.0, stopColor: "#00000020" }))),
        React.createElement(JPText, { dominantBaseline: "middle", fill: "url(#quality-stars-fill)", fontSize: 26 }, "\u2605\u2605\u2605\u2605\u2605")));
};
export default QualityStars;
