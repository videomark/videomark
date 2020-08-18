import { html, render } from "lit-html";
import { styleMap } from "lit-html/directives/style-map";
import sparkline from '@videomark/sparkline';
import { quality, latestQoE, latestQuality, isLowQuality, getRealThroughput, transferSize } from "./Quality";
import Config from "../Config";

const HISTORY_SIZE = 120;

const blankHistory = () => {
  return Array.from({length:HISTORY_SIZE}, () => NaN);
};

export default class Status {
  constructor() {
    this.detach();
    this.historyHolder = {};
  }

  attach(root) {
    this.root = root;
  }

  detach() {
    this.root = null;
    this.state = { open: false };
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

    return Config.isMobileScreen() ? this.mobileTemplate({ sessionId, videoId, throughput: this.historyHolder.latestThroughput })
      : this.dekstopTemplate({ open, qoe, qoeStyles, sessionId, videoId, throughput: this.historyHolder.latestThroughput });
  }

  mobileTemplate({ sessionId, videoId, throughput }) {
    return html`
      <style>
        .root {
          background: rgba(28, 28, 28, 0.8);
          padding: 1vw 1vw;
          color: white;
        }
        :focus {
          outline: 0;
        }
        .root dt, .root dd, .root dl.alert::after {
          font-size: 3vw;
        }
        .close {
          position: absolute;
          top: 1vh;
          right: 1vw;
          font-size: 6vw;
        }
      </style>
      <div class="root" >
        <div class="close"
          @click=${() => {
            window.postMessage({ type: "FROM_WEB_CONTENT", method: "display_ui", enabled: false }, "*");
          }}
          @touchstart=${() => {
            window.postMessage({ type: "FROM_WEB_CONTENT", method: "display_ui", enabled: false }, "*");
          }}
        >×</div>
        ${quality({ sessionId, videoId, throughput })}
      </div>
    `;
  }

  dekstopTemplate({ open, qoe, qoeStyles, sessionId, videoId, throughput }) {
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
          ${open ? quality({ sessionId, videoId, throughput }) : ""}
        </details>
      </div>
    `;
  }

  update(state = {}) {
    if (this.root == null) return;
    Object.assign(this.state, state);
    this.historyUpdate();

    render(this.template, this.root);
    if (this.state.open || Config.isMobileScreen()) this.drawChart();
  }

  historyUpdate() {
    const { sessionId, videoId } = this.state;
    const {
      date,
      bitrate,
      throughput,
      resolution,
      framerate,
      droppedVideoFrames,
      timing
    } = latestQuality({
      sessionId,
      videoId
    });
    const transfer = transferSize({ sessionId, videoId });
    const { height: videoHeight } = resolution || {};
    const { waiting } = timing || {};
    const qoe = latestQoE({ sessionId, videoId });
    const realThroughput = getRealThroughput(throughput) || this.historyHolder.latestThroughput || NaN;
    this.historyHolder.latestThroughput = realThroughput;

    if (this.historyHolder.videoId !== videoId) {
      this.historyHolder.videoId = videoId;
      this.historyHolder.bitrate = blankHistory();
      this.historyHolder.throughput = blankHistory();
      this.historyHolder.transfer = blankHistory();
      this.historyHolder.resolution = blankHistory();
      this.historyHolder.framerate = blankHistory();
      this.historyHolder.droppedVideoFrames = blankHistory();
      this.historyHolder.waiting = blankHistory();
      this.historyHolder.qoe = blankHistory();
    }
    if (this.historyHolder.date !== date) {
      this.historyHolder.date = date
      this.historyHolder.bitrate.push(bitrate >= 0 ? bitrate : NaN);
      this.historyHolder.bitrate.shift();
      this.historyHolder.throughput.push(realThroughput);
      this.historyHolder.throughput.shift();
      this.historyHolder.transfer.push(transfer);
      this.historyHolder.transfer.shift();
      this.historyHolder.resolution.push(videoHeight);
      this.historyHolder.resolution.shift();
      this.historyHolder.framerate.push(framerate >= 0 ? framerate : NaN);
      this.historyHolder.framerate.shift();
      this.historyHolder.droppedVideoFrames.push(droppedVideoFrames);
      this.historyHolder.droppedVideoFrames.shift();
      this.historyHolder.waiting.push(waiting);
      this.historyHolder.waiting.shift();
      this.historyHolder.qoe.push(qoe);
      this.historyHolder.qoe.shift();
    }
  }

  drawChart() {
    const { bitrate, throughput, transfer, resolution, framerate, droppedVideoFrames, waiting, qoe } = this.historyHolder;
    sparkline(this.root.getElementById('bitrate_chart'), bitrate);
    sparkline(this.root.getElementById('thruput_chart'), throughput);
    sparkline(this.root.getElementById('transfer_chart'), transfer);
    sparkline(this.root.getElementById('resolution_chart'), resolution);
    sparkline(this.root.getElementById('framerate_chart'), framerate);
    sparkline(this.root.getElementById('droprate_chart'), droppedVideoFrames);
    sparkline(this.root.getElementById('waiting_chart'), waiting);
    sparkline(this.root.getElementById('qoe_chart'), qoe, {min:1.0, max:5.0});
  }
}
