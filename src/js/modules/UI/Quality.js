import { html } from "lit-html";
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

export const latestQuolity = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return "";
  const quolity = latest(storage.cache.log, "quolity");
  return quolity || {};
};

export const quality = ({ sessionId, videoId }) => {
  const quolity = latestQuolity({ sessionId, videoId });
  const { droppedVideoFrames, totalVideoFrames } = quolity;
  if ([droppedVideoFrames, totalVideoFrames].some(n => !Number.isFinite(n)))
    return "";
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
      dt {
        font-weight: bold;
      }
    </style>
    <dl>
      <dt>フレームドロップ率</dt>
      <dd>
        ${((droppedVideoFrames / totalVideoFrames) * 100).toFixed(2)} % (
        ${droppedVideoFrames} / ${totalVideoFrames} )
      </dd>
      <dt>体感品質 (QoE)</dt>
      <dd>${Number.isFinite(qoe) ? qoe : "..."}</dd>
    </dl>
  `;
};
