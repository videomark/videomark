import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { useStorage } from "../Storage";
import Config from "../Config";

const latest = (log, key) => {
  const { date, [key]: value } =
    (log || []).filter(a => key in a).slice(-1)[0] || {};
  return { date, value };
};

export const latestQoE = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return NaN;
  const { value } = latest(storage.cache.log, "qoe");
  return value == null ? NaN : value;
};

export const latestQuality = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return "";
  const { date, value } = latest(storage.cache.log, "quality");
  return value == null ? {} : { date, ...value };
};

export const getRealThroughput = (list) => {
  if (!list) return NaN;
  if (!list.length) return NaN;
  return list[list.length-1].throughput;
};

export const startTime = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return NaN;
  const time = storage.cache.start_time;
  return time >= 0 ? time : NaN;
};

export const transferSize = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return NaN;
  const size = storage.cache.transfer_size;
  return size >= 0 ? size : NaN;
};

const sizeFormat = (bytes, exponent) => {
  const divider = 1024 ** exponent;
  // 整数部が4桁になったら小数部は省く
  const fraction = bytes >= divider * 1000 ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction
  }).format(bytes / divider);
};

const megaSizeFormat = bytes => sizeFormat(bytes, 2);

const kiloSizeFormat = bytes => sizeFormat(bytes, 1);

export const isLowQuality = ({ droppedVideoFrames, totalVideoFrames }) =>
  !(droppedVideoFrames / totalVideoFrames <= 1e-3);

export const quality = ({ sessionId, videoId, throughput }) => {
  const {
    date,
    bitrate,
    resolution,
    framerate,
    speed,
    droppedVideoFrames,
    totalVideoFrames,
    timing
  } = latestQuality({
    sessionId,
    videoId
  });
  const transfer = transferSize({ sessionId, videoId });
  const { width: videoWidth, height: videoHeight } = resolution || {};
  const { waiting, pause } = timing || {};
  const playing = date - startTime({ sessionId, videoId }) - pause;
  const qoe = latestQoE({ sessionId, videoId });
  const alert =
    Number.isFinite(qoe) &&
    isLowQuality({ droppedVideoFrames, totalVideoFrames });

  const bitrateView = !Number.isFinite(bitrate) || !(bitrate >= 0)
    ? null
    : `${kiloSizeFormat(bitrate)} kbps`;

  const throughputView = !Number.isFinite(throughput) || !(throughput >= 0)
    ? null
    : `${kiloSizeFormat(throughput)} kbps`;

  const transferView = !Number.isFinite(transfer) || !(transfer >= 0)
    ? null
    : `${megaSizeFormat(transfer)} MB`;

  const resolutionView = ![videoWidth, videoHeight].every(l => l >= 0)
    ? null
    : `${videoWidth} × ${videoHeight}`;

  const framerateView = !Number.isFinite(framerate) || !(framerate >= 0)
    ? null
    : `${framerate} fps${speed === 1 ? "" : ` × ${speed}`}`;

  const dropRate = (droppedVideoFrames / totalVideoFrames) || 0;
  const dropRateView = !Number.isFinite(droppedVideoFrames) || !Number.isFinite(totalVideoFrames) || !Number.isFinite(droppedVideoFrames / totalVideoFrames)
    ? null
    : Config.isMobileScreen()
    ? `${droppedVideoFrames}/${totalVideoFrames} (${(dropRate * 100).toFixed(2)}%)`
    : `${droppedVideoFrames} / ${totalVideoFrames} ( ${(dropRate * 100).toFixed(2)} % )`;

  const waitingTime = (waiting / playing) || 0;
  const waitingTimeView = !Number.isFinite(waiting) || !Number.isFinite(playing) || !Number.isFinite(waiting / playing)
    ? null
    : Config.isMobileScreen()
    ? `${(waiting / 1e3).toFixed(2)}/${(playing / 1e3).toFixed(2)}s (${(waitingTime * 100).toFixed(2)}%)`
    : `${(waiting / 1e3).toFixed(2)} / ${(playing / 1e3).toFixed(2)} s ( ${(waitingTime * 100).toFixed(2)} % )`;

  const qoeView = !Number.isFinite(qoe)
    ? null
    : qoe.toFixed(2);

  return html`
    <style>
      dl,
      dt,
      dd {
        margin: 0;
      }
      dl {
        display: grid;
        grid-template-columns: 1fr 1fr minmax(120px, 1fr);
        font-size: 12px;
        column-gap: 12px;
      }
      dl.alert:after {
        grid-column: 1 / -1;
        content: "⚠ 実際の体感品質とは異なる可能性があります。";
        font-size: 10px;
      }
      dt.alert,
      dd.alert,
      dt.na,
      dd.na {
        color: gray;
      }
      dt {
        font-weight: bold;
      }
      svg.chart {
        width: 120px;
        height: 1.25em;
        stroke-width: 2px;
      }
      #droprate_chart, #waiting_chart, #transfer_chart {
        stroke: rgb(255, 75, 0);
        fill: rgba(255, 75, 0, .3);
      }
      #bitrate_chart, #thruput_chart, #qoe_chart {
        stroke: rgb(3, 175, 122);
        fill: rgba(3, 175, 122, .3);
      }
      #resolution_chart, #framerate_chart {
        stroke: rgb(0, 90, 255);
        fill: rgba(0, 90, 255, .3);
      }
    </style>
    <dl class=${classMap({ alert })}>
      ${qualityItem({ label: "ビットレート", value: bitrateView, chart_id: "bitrate_chart" })}
      ${qualityItem({ label: "スループット", value: throughputView, chart_id: "thruput_chart" })}
      ${qualityItem({ label: "通信量", value: transferView, chart_id: "transfer_chart" })}
      ${qualityItem({ label: "解像度", value: resolutionView, chart_id: "resolution_chart" })}
      ${qualityItem({ label: "フレームレート", value: framerateView, chart_id: "framerate_chart" })}
      ${qualityItem({ label: "フレームドロップ率", value: dropRateView, chart_id: "droprate_chart" })}
      ${qualityItem({ label: "待機時間", value: waitingTimeView, chart_id: "waiting_chart" })}
      ${qualityItem({ label: "体感品質 (QoE)", value: qoeView, chart_id: "qoe_chart", style: { alert } })}
    </dl>
  `;
};

const qualityItem = ({ label, value, chart_id, style }) => {
  const clazz = classMap(Object.assign({ na: value == null }, style));
  return html`
    <dt class=${clazz}>${label}</dt>
    <dd class=${clazz}>${value || "n/a"}</dd>
    <dd class=${clazz}><svg class="chart" id="${chart_id}"></svg></dd>
  `;
};
