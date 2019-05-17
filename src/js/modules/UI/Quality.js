import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import Storage from "../Storage";

const state = {};
export const useStorage = ({ sessionId, videoId }) => {
  const id = `${sessionId}_${videoId}`;
  if (!(state[id] instanceof Storage)) {
    state[id] = new Storage({ sessionId, videoId });
    state[id].init();
  }
  return state[id];
};

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

export const quality = ({ sessionId, videoId }) => {
  const { framerate, droppedVideoFrames, totalVideoFrames } = latestQuality({
    sessionId,
    videoId
  });
  if (
    [framerate, droppedVideoFrames, totalVideoFrames].some(
      n => !Number.isFinite(n)
    )
  )
    return "";
  const isLowQuality = droppedVideoFrames / totalVideoFrames > 1e-3;
  const qoe = latestQoE({ sessionId, videoId });

  return html`
    <style>
      dl,
      dt,
      dd {
        margin: 0;
      }
      dl {
        display: grid;
        grid-template-columns: 1fr 120px;
        font-size: 12px;
        column-gap: 12px;
      }
      dl.alert:after {
        grid-column: 1 / -1;
        content: "⚠ 実際の体感品質とは異なる可能性があります。";
        font-size: 10px;
        color: yellow;
      }
      dd.alert {
        color: yellow;
      }
      dt {
        font-weight: bold;
      }
    </style>
    <dl class=${classMap({ alert: isLowQuality })}>
      <dt>フレームレート</dt>
      <dd>
        ${framerate} fps
      </dd>
      <dt>フレームドロップ率</dt>
      <dd class=${classMap({ alert: isLowQuality })}>
        ${((droppedVideoFrames / totalVideoFrames) * 100).toFixed(2)} % (
        ${droppedVideoFrames} / ${totalVideoFrames} )
      </dd>
      <dt>体感品質 (QoE)</dt>
      <dd class=${classMap({ alert: isLowQuality })}>
        ${Number.isFinite(qoe) ? qoe : "..."}
      </dd>
    </dl>
  `;
};
