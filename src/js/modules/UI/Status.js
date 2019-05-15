import { html, render } from "lit-html";
import Storage from "../Storage";

const state = {};
const useStorage = ({ sessionId, videoId }) => {
  const id = `${sessionId}_${videoId}`;
  if (!(state[id] instanceof Storage)) {
    state[id] = new Storage({ sessionId, videoId });
    state[id].init();
  }
  return state[id];
};

const latest = (log, key) =>
  ((log || []).filter(a => key in a).slice(-1)[0] || {})[key];

const latestQoE = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return NaN;
  const qoe = latest(storage.cache.log, "qoe");
  return qoe == null ? NaN : qoe;
};

const details = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return "";
  const quolity = latest(storage.cache.log, "quolity") || {};
  const { droppedVideoFrames, totalVideoFrames } = quolity;
  if ([droppedVideoFrames, totalVideoFrames].some(n => !Number.isFinite(n)))
    return "";
  const qoe = latestQoE({ sessionId, videoId });

  return html`
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

export default class Status {
  constructor() {
    this.detach();
  }

  attach(root) {
    this.root = root;
  }

  detach() {
    this.root = null;
    this.state = {
      open: false
    };
  }

  get template() {
    const { open, sessionId, videoId } = this.state;
    const qoe = latestQoE({ sessionId, videoId });

    return html`
      <style>
        .root {
          background: rgba(0, 161, 255, 0.5);
          padding: 5px 10px;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          line-height: 1;
        }
        :focus {
          outline: 0;
        }
      </style>
      <div class="root">
        <details
          @toggle=${e => {
            this.update({ open: e.currentTarget.open });
          }}
        >
          <summary>
            ${Number.isFinite(qoe) ? `QoE: ${qoe.toFixed(2)}` : "計測中..."}
          </summary>
          ${open ? details({ sessionId, videoId }) : ""}
        </details>
      </div>
    `;
  }

  update(state = {}) {
    if (this.root == null) return;
    Object.assign(this.state, state);
    render(this.template, this.root);
  }
}
