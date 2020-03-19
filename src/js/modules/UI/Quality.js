import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { useStorage } from "../Storage";

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

export const latestThroughput = (list) => {
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

export const quality = ({ sessionId, videoId }) => {
  const {
    date,
    bitrate,
    throughput,
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
  const realThroughput = latestThroughput(throughput);
  const alert =
    Number.isFinite(qoe) &&
    isLowQuality({ droppedVideoFrames, totalVideoFrames });
  const classes = {
    bitrate: {
      na: !(bitrate >= 0)
    },
    throughput: {
      na: !(realThroughput >= 0)
    },
    transfer: {
      na: !(transfer >= 0)
    },
    resolution: {
      na: ![videoWidth, videoHeight].every(l => l >= 0)
    },
    framerate: {
      na: !(framerate >= 0)
    },
    dropped: {
      na: !Number.isFinite(droppedVideoFrames / totalVideoFrames)
    },
    waiting: {
      na: !Number.isFinite(waiting / playing)
    },
    qoe: {
      alert,
      na: !Number.isFinite(qoe)
    }
  };

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
      <dt class=${classMap(classes.bitrate)}>ビットレート</dt>
      <dd class=${classMap(classes.bitrate)}>
        ${bitrate >= 0 ? `${kiloSizeFormat(bitrate)} kbps` : "n/a"}
      </dd>
      <dd class=${classMap(classes.bitrate)}>
        <svg class="chart" id="bitrate_chart"></svg>
      </dd>
      <dt class=${classMap(classes.throughput)}>スループット</dt>
      <dd class=${classMap(classes.throughput)}>
        ${realThroughput >= 0 ? `${kiloSizeFormat(realThroughput)} kbps` : "n/a"}
      </dd>
      <dd class=${classMap(classes.throughput)}>
        <svg class="chart" id="thruput_chart"></svg>
      </dd>
      <dt class=${classMap(classes.transfer)}>通信量</dt>
      <dd class=${classMap(classes.transfer)}>
        ${transfer >= 0 ? `${megaSizeFormat(transfer)} MB` : "n/a"}
      </dd>
      <dd class=${classMap(classes.transfer)}>
        <svg class="chart" id="transfer_chart"></svg>
      </dd>
      <dt class=${classMap(classes.resolution)}>解像度</dt>
      <dd class=${classMap(classes.resolution)}>
        ${[videoWidth, videoHeight].every(l => l >= 0)
          ? `${videoWidth} × ${videoHeight}`
          : "n/a"}
      </dd>
      <dd class=${classMap(classes.resolution)}>
        <svg class="chart" id="resolution_chart"></svg>
      </dd>
      <dt class=${classMap(classes.framerate)}>フレームレート</dt>
      <dd class=${classMap(classes.framerate)}>
        ${framerate >= 0
          ? `${framerate} fps${speed === 1 ? "" : ` × ${speed}`}`
          : "n/a"}
      </dd>
      <dd class=${classMap(classes.framerate)}>
        <svg class="chart" id="framerate_chart"></svg>
      </dd>
      <dt class=${classMap(classes.dropped)}>フレームドロップ率</dt>
      <dd class=${classMap(classes.dropped)}>
        ${droppedVideoFrames} / ${totalVideoFrames} (
        ${((droppedVideoFrames / totalVideoFrames) * 100).toFixed(2)} % )
      </dd>
      <dd class=${classMap(classes.dropped)}>
        <svg class="chart" id="droprate_chart"></svg>
      </dd>
      <dt class=${classMap(classes.waiting)}>待機時間</dt>
      <dd class=${classMap(classes.waiting)}>
        ${(waiting / 1e3).toFixed(2)} / ${(playing / 1e3).toFixed(2)} s (
        ${((waiting / playing) * 100).toFixed(2)} % )
      </dd>
      <dd class=${classMap(classes.waiting)}>
        <svg class="chart" id="waiting_chart"></svg>
      </dd>
      <dt class=${classMap(classes.qoe)}>体感品質 (QoE)</dt>
      <dd class=${classMap(classes.qoe)}>
        ${Number.isFinite(qoe) ? qoe.toFixed(2) : "n/a"}
      </dd>
      <dd class=${classMap(classes.qoe)}>
        <svg class="chart" id="qoe_chart"></svg>
      </dd>
    </dl>
  `;
};
