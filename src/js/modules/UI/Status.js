import { html, render } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { quality, latestQoE, latestQuality, isLowQuality } from "./Quality";

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
    const alert = isLowQuality(latestQuality({ sessionId, videoId }));
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
        details > summary > span.alert {
          color: yellow;
        }
      </style>
      <div
        class="root"
        @click=${e => {
          this.update({
            open: e.currentTarget
              .querySelector("details")
              .toggleAttribute("open")
          });
        }}
      >
        <details
          @click=${e => {
            e.preventDefault();
          }}
        >
          <summary>
            ${Number.isFinite(qoe)
              ? html`
                  QoE:
                  <span class=${classMap({ alert })}>${qoe.toFixed(2)}</span>
                `
              : "計測中..."}
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
