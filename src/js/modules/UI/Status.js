import { html, render } from "lit-html";
import { styleMap } from "lit-html/directives/style-map";
import { quality, latestQoE, latestQuality, isLowQuality } from "./Quality";
import sparkline from '@fnando/sparkline';

export default class Status {
  constructor() {
    this.detach();
  }

  attach(root) {
    this.root = root;
    this.bitrate_history  = Array.from({length:Status.HISTORY_NUMBER}, (v, i) => NaN);
    this.thruput_history  = Array.from({length:Status.HISTORY_NUMBER}, (v, i) => NaN);
    this.droprate_history = Array.from({length:Status.HISTORY_NUMBER}, (v, i) => NaN);
    this.chart = null;
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
    const latest = latestQuality({ sessionId, videoId });
    const alert = isLowQuality(latest);
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

    this.bitrate_history.push(Number(latest.bitrate));
    if (this.bitrate_history.length > Status.HISTORY_NUMBER) this.bitrate_history.shift();
    this.thruput_history.push(Number((latest.throughput && latest.throughput.length ? latest.throughput[latest.throughput.length - 1] : {}).throughput));
    if (this.thruput_history.length > Status.HISTORY_NUMBER) this.thruput_history.shift();
    this.droprate_history.push(Number(latest.droppedVideoFrames / latest.totalVideoFrames));
    if (this.droprate_history.length > Status.HISTORY_NUMBER) this.droprate_history.shift();

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
        #bitrate_chart {
          stroke: rgb(54, 162, 235);
          stroke-width: 2px;
          fill: none;
        }
        #thruput_chart {
          stroke: rgb(75, 192, 192);
          stroke-width: 2px;
          fill: none;
        }
        #droprate_chart {
          stroke: rgb(255, 99, 132);
          stroke-width: 2px;
          fill: none;
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
          <div>
            <svg id="bitrate_chart"></svg>
            <svg id="droprate_chart"></svg>
          </div>
        </details>
      </div>
    `;
  }

  update(state = {}) {
    if (this.root == null) return;
    Object.assign(this.state, state);
    render(this.template, this.root);
    this.drawChart();
  }

  drawChart() {
    sparkline(this.root.getElementById('bitrate_chart'), this.bitrate_history, {max:Status.BITRATE_MAX, min:0});
    //sparkline(this.root.getElementById('thruput_chart'), this.thruput_history);
    sparkline(this.root.getElementById('droprate_chart'), this.droprate_history, {max:100, min:0});
  }
}

Status.HISTORY_NUMBER = 30;
Status.BITRATE_MAX = 20 * 1024 * 1024;
