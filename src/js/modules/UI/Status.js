import { html, render } from "lit-html";
import VideoData from "../VideoData";

const latestQoE = video => {
  if (!(video instanceof VideoData)) return NaN;
  const result = video.get_latest_qoe().slice(-1)[0] || {};
  return result.qoe == null ? NaN : result.qoe;
};

const details = video => {
  if (!(video instanceof VideoData)) return "";
  const { totalVideoFrames, droppedVideoFrames } = video.get_quality();
  const qoe = latestQoE(video);

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
    const { open, video } = this.state;
    const qoe = latestQoE(video);

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
          ${open ? details(video) : ""}
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
