import { html, render } from "lit-html";
import { styleMap } from "lit-html/directives/style-map";
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
    const { style } = this.root.host;
    if (open) style.setProperty("opacity", 1);
    else style.removeProperty("opacity");
    const alert = isLowQuality(latestQuality({ sessionId, videoId }));
    const qoe = latestQoE({ sessionId, videoId });
    const qoeStyles = {
      value: {
        color: alert ? "inherit" : "white"
      },
      stars: {
        background: `linear-gradient(
        to right,
        ${alert ? "lightgray" : "#ffce00"} 0%,
        ${alert ? "lightgray" : "#ffce00"} ${qoe * 20}%,
        gray ${qoe * 20}%,
        gray 100%)`,
        "-webkit-background-clip": "text",
        color: "transparent"
      }
    };

    return html`
      <style>
        .root {
          background: rgba(28, 28, 28, 0.8);
          padding: 8px 16px;
          border-radius: 20px;
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
          color: lightgray;
          font-size: 14px;
          font-weight: bold;
        }
      </style>
      <div
        class="root"
        @click=${e => {
          const details = e.currentTarget.querySelector("details");
          if (open) details.removeAttribute("open");
          else details.setAttribute("open", "true");
          this.update({ open: !open });
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
                  <span style=${styleMap(qoeStyles.value)}
                    >${qoe.toFixed(2)}</span
                  >
                  <span style=${styleMap(qoeStyles.stars)}>★★★★★</span>
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
