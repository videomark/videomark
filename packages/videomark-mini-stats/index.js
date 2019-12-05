import * as React from "react";
import Calendar from "./components/Calendar";
import QualityBadge from "./components/QualityBadge";
import Badge from "./components/Badge";
import JPText from "./components/JPText";
import timeFormat from "./components/jpTimeFormat";
import { playingTimeStats } from "./components/stats";
const SVG = ({ data }) => {
    const { count, playingTime, averageQoE, averageWaitingRatio, averageDroppedVideoFrameRatio } = data;
    const { playingTimeWithDate, total, daily } = playingTimeStats(playingTime);
    return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 512 512", width: 512, height: 512 },
        React.createElement("rect", { x: 0, y: 0, width: "100%", height: "100%", fill: "#FFFFFF" }),
        React.createElement(JPText, { x: "50%", y: 20, textAnchor: "middle", dominantBaseline: "text-before-edge", fontSize: 32 }, "VideoMark \u52D5\u753B\u8996\u8074\u7D71\u8A08"),
        React.createElement(Calendar, { x: 56, y: 88, transform: `translate(${56},${88})`, data: playingTimeWithDate }),
        React.createElement(QualityBadge, { x: 56, y: 320, transform: `translate(${56},${320})`, label: "\u5E73\u5747\u54C1\u8CEA", quality: Number.isFinite(averageQoE) ? averageQoE : 1 }),
        React.createElement(JPText, { x: "60%", y: 368, textAnchor: "end", dominantBaseline: "text-before-edge", fontSize: 14 },
            "\u30D5\u30EC\u30FC\u30E0\u30C9\u30ED\u30C3\u30D7\u7387",
            " ",
            Number.isFinite(averageDroppedVideoFrameRatio)
                ? (averageDroppedVideoFrameRatio * 100).toFixed(1)
                : 0,
            "%"),
        React.createElement(JPText, { x: "88%", y: 368, textAnchor: "end", dominantBaseline: "text-before-edge", fontSize: 14 },
            "\u5F85\u6A5F\u6642\u9593\u5272\u5408",
            " ",
            Number.isFinite(averageWaitingRatio)
                ? (averageWaitingRatio * 100).toFixed(1)
                : 0,
            "%"),
        React.createElement(Badge, { x: 56, y: 400, transform: `translate(${56},${400})`, label: "\u8996\u8074\u6642\u9593", message: timeFormat(total) }),
        React.createElement(JPText, { x: "60%", y: 448, textAnchor: "end", dominantBaseline: "text-before-edge", fontSize: 14 },
            "1\u65E5\u3042\u305F\u308A ",
            timeFormat(daily)),
        React.createElement(JPText, { x: "88%", y: 448, textAnchor: "end", dominantBaseline: "text-before-edge", fontSize: 14 },
            "\u52D5\u753B\u4EF6\u6570 ",
            Number.isFinite(count) ? count.toLocaleString() : 0),
        React.createElement(JPText, { x: "98%", y: "99%", textAnchor: "end", fontSize: 10, fillOpacity: 0.5 }, "https://vm.webdino.org/")));
};
export default SVG;
