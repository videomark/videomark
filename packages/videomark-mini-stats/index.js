import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import Calendar from "./components/Calendar";
import QualityBadge from "./components/QualityBadge";
import Badge from "./components/Badge";
import JPText from "./components/JPText";
import timeFormat from "./components/jpTimeFormat";
import { playingTimeStats } from "./components/stats";
const title = "VideoMark 動画視聴統計";
const site = "https://vm.webdino.org";
const width = 512; // px
const height = 512; // px
const appName = "videomark";
const shareData = ({ files }) => ({
    text: `動画視聴統計 #${appName}`,
    url: site,
    files
});
const SVG = ({ data }) => {
    const { count, playingTime, averageQoE, averageWaitingRatio, averageDroppedVideoFrameRatio } = data;
    const { playingTimeWithDate, total, daily } = playingTimeStats(playingTime);
    return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 512 512", width: width, height: height },
        React.createElement("rect", { x: 0, y: 0, width: "100%", height: "100%", fill: "#FFFFFF" }),
        React.createElement(JPText, { x: "50%", y: 20, textAnchor: "middle", dominantBaseline: "text-before-edge", fontSize: 32 }, title),
        React.createElement(Calendar, { x: 56, y: 88, transform: `translate(${56},${88})`, data: playingTimeWithDate }),
        React.createElement(QualityBadge, { x: 56, y: 320, transform: `translate(${56},${320})`, label: "\u5E73\u5747\u54C1\u8CEA", quality: averageQoE }),
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
        React.createElement(JPText, { x: "98%", y: "99%", textAnchor: "end", fontSize: 10, fillOpacity: 0.5 }, site)));
};
const statsToCanvas = async (data) => {
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ReactDOMServer.renderToString(React.createElement(SVG, { data: data })))}`;
    await new Promise(resolve => {
        image.onload = resolve;
    });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context == null)
        return undefined;
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
    return canvas;
};
const share = async (canvas, filename) => {
    if (navigator.share == null)
        return undefined;
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    if (blob == null)
        return;
    const file = new File([blob], filename, { type: blob.type });
    const data = shareData({ files: [file] });
    try {
        await navigator.share(data);
        return data;
    }
    catch (error) {
        return undefined;
    }
};
const download = (canvas, filename) => {
    const dataUrl = canvas.toDataURL();
    const anchor = document.createElement("a");
    anchor.download = filename;
    anchor.href = dataUrl;
    anchor.click();
    return true;
};
export const shareOrDownload = async (data) => {
    // NOTE: Web Share APIを使うために正しい拡張子を与える
    const filename = `${appName}-${Date.now()}.png`;
    const canvas = await statsToCanvas(data);
    if (canvas == null)
        return;
    const shared = await share(canvas, filename);
    if (shared == null)
        download(canvas, filename);
};
export default SVG;
