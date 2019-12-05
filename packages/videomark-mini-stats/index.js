import * as React from "react";
import { floor } from "./components/math";
import Calendar from "./components/Calendar";
import QualityBadge from "./components/QualityBadge";
import Badge from "./components/Badge";
import JPText from "./components/JPText";
const SVG = ({ data }) => {
    const { count, playingTime, averageQoE, averageWaitingRatio, averageDroppedVideoFrameRatio } = data;
    const totalMinutes = playingTime.reduce((previousValue, { value: currentValue }) => previousValue + currentValue / 60e3, 0);
    return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 512 512", width: 512, height: 512 },
        React.createElement("rect", { x: 0, y: 0, width: "100%", height: "100%", fill: "#FFFFFF" }),
        React.createElement(JPText, { x: "50%", y: 16, textAnchor: "middle", dominantBaseline: "text-before-edge", fontSize: 32 }, "VideoMark \u52D5\u753B\u8996\u8074\u7D71\u8A08"),
        React.createElement(Calendar, { x: 56, y: 88, transform: `translate(${56},${88})`, data: playingTime }),
        React.createElement(QualityBadge, { x: 56, y: 320, transform: `translate(${56},${320})`, label: "\u5E73\u5747\u54C1\u8CEA", quality: averageQoE }),
        React.createElement(Badge, { x: 56, y: 390, transform: `translate(${56},${390})`, label: "\u8996\u8074\u6642\u9593", message: [
                totalMinutes > 60
                    ? `${floor(totalMinutes / 60).toLocaleString()}時間`
                    : "",
                `${floor(totalMinutes % 60)}分`
            ].join("") }),
        React.createElement(JPText, { x: "2%", y: 460, fontSize: 12 },
            "\u30D5\u30EC\u30FC\u30E0\u30C9\u30ED\u30C3\u30D7\u7387 ",
            averageDroppedVideoFrameRatio),
        React.createElement(JPText, { x: "2%", y: 480, fontSize: 12 },
            "\u5F85\u6A5F\u6642\u9593\u5272\u5408 ",
            averageWaitingRatio),
        React.createElement(JPText, { x: "2%", y: 500, fontSize: 12 },
            "\u52D5\u753B\u4EF6\u6570 ",
            count),
        React.createElement(JPText, { x: "98%", y: "99%", textAnchor: "end", fontSize: 10, fillOpacity: 0.5 }, "https://vm.webdino.org/")));
};
export default SVG;
