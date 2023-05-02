import { strings as enStrings } from "$lib/locales/en";
import { strings as jaStrings } from "$lib/locales/ja";
import sparkline from '@videomark/sparkline';
import { html, render } from "lit-html";
import { classMap } from "lit-html/directives/class-map.js";
import { styleMap } from "lit-html/directives/style-map.js";
import Config from "../Config";
import { kiloSizeFormat, megaSizeFormat } from "../Utils";

const HISTORY_SIZE = 120;
const [locale] = navigator.language.split('-'); // chrome.i18n.getUILanguage() は使えない
const str = locale === 'ja' ? jaStrings : enStrings;

const blankHistory = () => {
  return Array.from({length:HISTORY_SIZE}, () => NaN);
};

export default class Status {
  constructor() {
    this.detach();
    this.historyHolder = {};
    this.historyHolder.bitrate = blankHistory();
    this.historyHolder.throughput = blankHistory();
    this.historyHolder.transfer = blankHistory();
    this.historyHolder.resolution = blankHistory();
    this.historyHolder.framerate = blankHistory();
    this.historyHolder.droppedVideoFrames = blankHistory();
    this.historyHolder.waiting = blankHistory();
    this.historyHolder.qoe = blankHistory();
  }

  attach(root) {
    this.root = root;
  }

  detach() {
    this.root = null;
    this.state = { open: false };
  }

  get template() {
    const open = this.state.open;
    const {
      qoe,
      alert
    } = this.qualityStatus;

    const { style } = this.root.host;
    if (open) style.setProperty("opacity", 1);
    else style.removeProperty("opacity");
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

    return Config.isMobileScreen() ? this.mobileTemplate()
      : this.dekstopTemplate({ open, qoe, qoeStyles });
  }

  mobileTemplate() {
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
        ${this.quality()}
      </div>
    `;
  }

  dekstopTemplate({ open, qoe, qoeStyles }) {
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
              : str.stats.quality.measuringShort}
          </summary>
          ${open ? this.quality() : ""}
        </details>
      </div>
    `;
  }

  update(state = {}, qualityStatus = {}) {
    if (this.root == null) return;
    Object.assign(this.state, state);
    this.qualityStatus = qualityStatus;
    this.historyUpdate();

    render(this.template, this.root);
    if (this.state.open || Config.isMobileScreen()) this.drawChart();
  }

  historyUpdate() {
    const videoId = this.state.videoId;
    const {
      date,
      bitrate,
      throughput,
      transfer,
      resolution,
      framerate,
      droppedVideoFrames,
      timing,
      qoe
    } = this.qualityStatus;
    if (!date) return;

    const { height: videoHeight } = resolution || {};
    const { waiting } = timing || {};
    this.historyHolder.latestThroughput = throughput || this.historyHolder.latestThroughput || NaN;

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
      this.historyHolder.throughput.push(this.historyHolder.latestThroughput);
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
    this.drawSparkline('bitrate_chart', bitrate);
    this.drawSparkline('thruput_chart', throughput);
    this.drawSparkline('transfer_chart', transfer);
    this.drawSparkline('resolution_chart', resolution);
    this.drawSparkline('framerate_chart', framerate);
    this.drawSparkline('droprate_chart', droppedVideoFrames);
    this.drawSparkline('waiting_chart', waiting);
    this.drawSparkline('qoe_chart', qoe, {min:1.0, max:5.0});
  }

  drawSparkline(elementId, value, option) {
    const element = this.root.getElementById(elementId);
    if (!element) return;
    sparkline(element, value, option);
  }

  quality() {
    const {
      date,
      bitrate,
      transfer,
      resolution,
      framerate,
      speed,
      droppedVideoFrames,
      totalVideoFrames,
      timing,
      startTime,
      qoe,
      alert
    } = this.qualityStatus;
    const throughput = this.historyHolder.latestThroughput;

    const { width: videoWidth, height: videoHeight } = resolution || {};
    const { waiting, pause } = timing || {};
    const playing = date - startTime - pause;

    const bitrateView = !Number.isFinite(bitrate) || !(bitrate >= 0)
      ? null
      : `${kiloSizeFormat(bitrate)} kbps`;

    const throughputView = !Number.isFinite(throughput) || !(throughput >= 0)
      ? null
      : `${kiloSizeFormat(throughput)} kbps`;

    const transferView = !Number.isFinite(transfer) || !(transfer >= 0)
      ? null
      : `${megaSizeFormat(transfer)} MB`;

    const resolutionView = ![videoWidth, videoHeight].every(l => l >= 0)
      ? null
      : `${videoWidth} × ${videoHeight}`;

    const framerateView = !Number.isFinite(framerate) || !(framerate >= 0)
      ? null
      : `${framerate} fps${speed === 1 ? "" : ` × ${speed}`}`;

    const dropRate = (droppedVideoFrames / totalVideoFrames) || 0;
    const dropRateView = !Number.isFinite(droppedVideoFrames) || !Number.isFinite(totalVideoFrames) || !Number.isFinite(droppedVideoFrames / totalVideoFrames)
      ? null
      : `${droppedVideoFrames}/${totalVideoFrames} (${(dropRate * 100).toFixed(2)}%)`;

    const waitingTime = (waiting / playing) || 0;
    const waitingTimeView = !Number.isFinite(waiting) || !Number.isFinite(playing) || !Number.isFinite(waiting / playing)
      ? null
      : `${(waiting / 1e3).toFixed(2)}/${(playing / 1e3).toFixed(2)}s (${(waitingTime * 100).toFixed(2)}%)`;

    const qoeView = !Number.isFinite(qoe)
      ? null
      : qoe.toFixed(2);

    return html`
      <style>
        dl,
        dt,
        dd {
          margin: 0;
        }
        dl {
          display: grid;
          grid-template-columns: 1fr 1fr minmax(120px, 1fr);
          font-size: 12px;
          column-gap: 12px;
        }
        dl.alert:after {
          grid-column: 1 / -1;
          content: "⚠ ${str.stats.quality.frameDropsShort}";
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
        svg.chart {
          width: 120px;
          height: 1.25em;
          stroke-width: 2px;
        }
        #droprate_chart, #waiting_chart, #transfer_chart {
          stroke: rgb(255, 75, 0);
          fill: rgba(255, 75, 0, .3);
        }
        #bitrate_chart, #thruput_chart, #qoe_chart {
          stroke: rgb(3, 175, 122);
          fill: rgba(3, 175, 122, .3);
        }
        #resolution_chart, #framerate_chart {
          stroke: rgb(0, 90, 255);
          fill: rgba(0, 90, 255, .3);
        }
      </style>
      <dl class=${classMap({ alert })}>
        ${this.qualityItem({ label: str.stats.bitrate, value: bitrateView, chart_id: "bitrate_chart" })}
        ${this.qualityItem({ label: str.stats.throughput, value: throughputView, chart_id: "thruput_chart" })}
        ${this.qualityItem({ label: str.stats.transferSize, value: transferView, chart_id: "transfer_chart" })}
        ${this.qualityItem({ label: str.stats.resolution, value: resolutionView, chart_id: "resolution_chart" })}
        ${this.qualityItem({ label: str.stats.frameRate, value: framerateView, chart_id: "framerate_chart" })}
        ${this.qualityItem({ label: str.stats.frameDrops, value: dropRateView, chart_id: "droprate_chart" })}
        ${this.qualityItem({ label: str.stats.waitingTime, value: waitingTimeView, chart_id: "waiting_chart" })}
        ${this.qualityItem({ label: str.stats.qoeShort, value: qoeView, chart_id: "qoe_chart", style: { alert } })}
      </dl>
    `;
  }

  qualityItem({ label, value, chart_id, style }) {
    if (value == null) return "";

    const clazz = classMap(style ?? {});
    return html`
      <dt class=${clazz}>${label}</dt>
      <dd class=${clazz}>${value}</dd>
      <dd class=${clazz}><svg class="chart" id="${chart_id}"></svg></dd>
    `;
  }
}
