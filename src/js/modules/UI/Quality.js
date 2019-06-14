import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { useStorage } from "../Storage";

const latest = (log, key) =>
  ((log || []).filter(a => key in a).slice(-1)[0] || {})[key];

export const latestQoE = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return NaN;
  const qoe = latest(storage.cache.log, "qoe");
  return qoe == null ? NaN : qoe;
};

export const latestQuality = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return "";
  const quality = latest(storage.cache.log, "quality");
  return quality || {};
};

export const startTime = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return NaN;
  const time = storage.cache.start_time;
  return time >= 0 ? time : NaN;
};

export const isLowQuality = ({ droppedVideoFrames, totalVideoFrames }) =>
  !(droppedVideoFrames / totalVideoFrames <= 1e-3);

export const quality = ({ sessionId, videoId }) => {
  const {
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
  const { width: videoWidth, height: videoHeight } = resolution || {};
  const { waiting, pause } = timing || {};
  const playing = Date.now() - startTime({ sessionId, videoId }) - pause;
  const alert = isLowQuality({ droppedVideoFrames, totalVideoFrames });
  const qoe = latestQoE({ sessionId, videoId });
  const classes = {
    bitrate: {
      na: !(bitrate >= 0)
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
        grid-template-columns: 1fr minmax(120px, 1fr);
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
    </style>
    <dl class=${classMap({ alert })}>
      <dt class=${classMap(classes.bitrate)}>ビットレート</dt>
      <dd class=${classMap(classes.bitrate)}>
        ${bitrate >= 0 ? `${(bitrate / 1e3).toLocaleString()} kbps` : "n/a"}
      </dd>
      <dt class=${classMap(classes.resolution)}>解像度</dt>
      <dd class=${classMap(classes.resolution)}>
        ${[videoWidth, videoHeight].every(l => l >= 0)
          ? `${videoWidth} × ${videoHeight}`
          : "n/a"}
      </dd>
      <dt class=${classMap(classes.framerate)}>フレームレート</dt>
      <dd class=${classMap(classes.framerate)}>
        ${framerate >= 0
          ? `${framerate} fps${speed === 1 ? "" : ` × ${speed}`}`
          : "n/a"}
      </dd>
      <dt class=${classMap(classes.dropped)}>フレームドロップ率</dt>
      <dd class=${classMap(classes.dropped)}>
        ${((droppedVideoFrames / totalVideoFrames) * 100).toFixed(2)} % (
        ${droppedVideoFrames} / ${totalVideoFrames} )
      </dd>
      <dt class=${classMap(classes.waiting)}>待機時間</dt>
      <dd class=${classMap(classes.waiting)}>
        ${(waiting / 1e3).toFixed(2)} s (
        ${((waiting / playing) * 100).toFixed(2)} % )
      </dd>
      <dt class=${classMap(classes.qoe)}>体感品質 (QoE)</dt>
      <dd class=${classMap(classes.qoe)}>
        ${Number.isFinite(qoe) ? qoe.toFixed(2) : "n/a"}
      </dd>
    </dl>
  `;
};
