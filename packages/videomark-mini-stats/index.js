import * as React from "react";
import Calendar from "./components/Calendar";
import JPText from "./components/JPText";
const SVG = ({ data }) => {
    const { count, playingTime, averageQoE, averageWaitingRatio, averageDroppedVideoFrameRatio } = data;
    const total = playingTime.reduce((previousValue, { value: currentValue }) => previousValue + currentValue, 0);
    return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 512 512", width: 512, height: 512 },
        React.createElement("rect", { x: 0, y: 0, width: 512, height: 512, fill: "#FFFFFF" }),
        React.createElement(JPText, { x: 20, y: 50, fontSize: 40 }, "VideoMark \u52D5\u753B\u8996\u8074\u7D71\u8A08"),
        React.createElement(Calendar, { x: 56, y: 88, transform: `translate(${56},${88})`, data: playingTime }),
        React.createElement(JPText, { x: 20, y: 340, fontSize: 24 },
            "\u5E73\u5747\u54C1\u8CEA ",
            averageQoE),
        React.createElement(JPText, { x: 20, y: 380, fontSize: 24 },
            "\u30D5\u30EC\u30FC\u30E0\u30C9\u30ED\u30C3\u30D7\u7387 ",
            averageDroppedVideoFrameRatio),
        React.createElement(JPText, { x: 20, y: 420, fontSize: 24 },
            "\u5F85\u6A5F\u6642\u9593\u5272\u5408 ",
            averageWaitingRatio),
        React.createElement(JPText, { x: 20, y: 460, fontSize: 24 },
            "\u8996\u8074\u6642\u9593 ",
            total),
        React.createElement(JPText, { x: 20, y: 500, fontSize: 24 },
            "\u52D5\u753B\u4EF6\u6570 ",
            count)));
};
export default SVG;
