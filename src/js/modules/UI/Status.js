import { html, render } from "lit-html";
import { quality, latestQoE } from "./Quality";

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
          background: rgba(28, 28, 28, 0.8);
          padding: 8px 8px;
          border-radius: 4px;
          color: white;
          font-size: 10px;
        }
        :focus {
          outline: 0;
        }
        details {
          line-height: 1.75;
        }
        details > summary {
          margin-right: 0.5em;
          font-size: 14px;
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
          ${open ? quality({ sessionId, videoId }) : ""}
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
