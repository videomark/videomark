import { html, render } from "lit-html";
import { styleMap } from "lit-html/directives/style-map";
import { quality, latestQoE, latestQuality, isLowQuality } from "./Quality";
import Chart from 'chart.js';

export default class Status {
  constructor() {
    this.detach();
  }

  attach(root) {
    this.root = root;
    this.bitrate_history  = Array.from({length:Status.HISTORY_NUMBER}, (v, i) => null);
    this.thruput_history  = Array.from({length:Status.HISTORY_NUMBER}, (v, i) => null);
    this.droprate_history = Array.from({length:Status.HISTORY_NUMBER}, (v, i) => null);
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

    console.log(latest);
    this.bitrate_history.shift();
    this.bitrate_history.push(latest.bitrate);
    this.thruput_history.shift();
    this.thruput_history.push((latest.throughput && latest.throughput.length ? latest.throughput[latest.throughput.length - 1] : {}).throughput);
    this.droprate_history.shift();
    this.droprate_history.push(latest.droppedVideoFrames / latest.totalVideoFrames);

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
          <canvas id="chart"></canvas>
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
    if (this.chart) {
      this.chart.update();
      return;
    }

    let chartData = {
      labels: Array.from({length:Status.HISTORY_NUMBER}, (v, i) => i),
      datasets: [{
        borderColor: Status.BITRATE_COLOR,
        backgroundColor: Status.BITRATE_COLOR,
        fill: false,
        data: this.bitrate_history,
        yAxisID: 'bitrate-axis',
      }, {
        borderColor: Status.THRUPUT_COLOR,
        backgroundColor: Status.THRUPUT_COLOR,
        fill: false,
        data: this.thruput_history,
        yAxisID: 'thruput-axis'
      }, {
        borderColor: Status.DROPRATE_COLOR,
        backgroundColor: Status.DROPRATE_COLOR,
        fill: false,
        data: this.droprate_history,
        yAxisID: 'droprate-axis'
      }]
    };

    this.chart = Chart.Line(this.root.getElementById('chart').getContext('2d'), {
      type: 'line',
      data: chartData,
      options: {
        animation: false,
        legend: false,
        tooltips: false,
        scales: {
          xAxes: [{
            display: false,
          }],
          yAxes: [{
            id: 'bitrate-axis',
            display: false,
          }, {
            id: 'thruput-axis',
            display: false,
          }, {
            id: 'droprate-axis',
            display: false,
            ticks: {
              min: 0,
              max: 1
            }
          }],
        }
      }
    });
  }
}

Status.HISTORY_NUMBER = 30;
Status.BITRATE_COLOR  = 'rgb(54, 162, 235)';
Status.THRUPUT_COLOR  = 'rgb(75, 192, 192)';
Status.DROPRATE_COLOR = 'rgb(255, 99, 132)';
