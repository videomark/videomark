import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import Calendar from "./components/Calendar";
import QualityBadge from "./components/QualityBadge";
import Badge from "./components/Badge";
import JPText from "./components/JPText";
import timeFormat from "./components/jpTimeFormat";
import { StatsData, playingTimeStats } from "./components/stats";

type ShareData = {
  files: File[];
  text: string;
  url: string;
};

interface Navigator {
  share?: (data: ShareData) => Promise<unknown>;
}

declare var navigator: Navigator;

const title = "VideoMark 動画視聴統計";
const site = "https://videomark.webdino.org";
const width = 512; // px
const height = 512; // px
const appName = "videomark";
const shareData = ({ files }: { files: File[] }): ShareData => ({
  text: `動画視聴統計 #${appName}`,
  url: site,
  files
});

const SVG: React.FC<{ data: StatsData }> = ({ data }) => {
  const {
    count,
    playingTime,
    averageQoE,
    averageWaitingRatio,
    averageDroppedVideoFrameRatio
  } = data;

  const { playingTimeWithDate, total, daily } = playingTimeStats(playingTime);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={width}
      height={height}
    >
      <rect x={0} y={0} width="100%" height="100%" fill="#FFFFFF" />
      <JPText
        x="50%"
        y={20}
        textAnchor="middle"
        dominantBaseline="text-before-edge"
        fontSize={32}
      >
        {title}
      </JPText>
      <Calendar
        x={56}
        y={88}
        transform={`translate(${56},${88})`}
        data={playingTimeWithDate}
      />
      <QualityBadge
        x={56}
        y={320}
        transform={`translate(${56},${320})`}
        label="平均品質"
        quality={averageQoE}
      />
      <JPText
        x="60%"
        y={368}
        textAnchor="end"
        dominantBaseline="text-before-edge"
        fontSize={14}
      >
        フレームドロップ率{" "}
        {Number.isFinite(averageDroppedVideoFrameRatio)
          ? (averageDroppedVideoFrameRatio * 100).toFixed(1)
          : 0}
        %
      </JPText>
      <JPText
        x="88%"
        y={368}
        textAnchor="end"
        dominantBaseline="text-before-edge"
        fontSize={14}
      >
        待機時間割合{" "}
        {Number.isFinite(averageWaitingRatio)
          ? (averageWaitingRatio * 100).toFixed(1)
          : 0}
        %
      </JPText>
      <Badge
        x={56}
        y={400}
        transform={`translate(${56},${400})`}
        label="視聴時間"
        message={timeFormat(total)}
      />
      <JPText
        x="60%"
        y={448}
        textAnchor="end"
        dominantBaseline="text-before-edge"
        fontSize={14}
      >
        1日あたり {timeFormat(daily)}
      </JPText>
      <JPText
        x="88%"
        y={448}
        textAnchor="end"
        dominantBaseline="text-before-edge"
        fontSize={14}
      >
        動画件数 {Number.isFinite(count) ? count.toLocaleString() : 0}
      </JPText>
      <JPText x="98%" y="99%" textAnchor="end" fontSize={10} fillOpacity={0.5}>
        {site}
      </JPText>
    </svg>
  );
};

const statsToCanvas = async (
  data: StatsData
): Promise<HTMLCanvasElement | undefined> => {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    ReactDOMServer.renderToString(<SVG data={data} />)
  )}`;
  await new Promise(resolve => {
    image.onload = resolve;
  });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context == null) return undefined;
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
  return canvas;
};

const share = async (canvas: HTMLCanvasElement, filename: string) => {
  if (navigator.share == null) return undefined;
  const blob = await new Promise<Parameters<BlobCallback>[0]>(resolve =>
    canvas.toBlob(resolve)
  );
  if (blob == null) return;
  const file = new File([blob], filename, { type: blob.type });
  const data = shareData({ files: [file] });
  try {
    await navigator.share(data);
    return data;
  } catch (error) {
    return undefined;
  }
};

const download = (canvas: HTMLCanvasElement, filename: string) => {
  const dataUrl = canvas.toDataURL();
  const anchor = document.createElement("a");
  anchor.download = filename;
  anchor.href = dataUrl;
  anchor.click();
  return true;
};

export const shareOrDownload = async (data: StatsData): Promise<void> => {
  // NOTE: Web Share APIを使うために正しい拡張子を与える
  const filename = `${appName}-${Date.now()}.png`;
  const canvas = await statsToCanvas(data);
  if (canvas == null) return;
  const shared = await share(canvas, filename);
  if (shared == null) download(canvas, filename);
};

export default SVG;
