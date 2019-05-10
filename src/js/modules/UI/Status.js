import { html, render } from "lit-html";

export default class Status {
  constructor() {
    this.root = null;
    this.state = {};
  }

  attach(root) {
    this.root = root;
  }

  detach() {
    this.root = null;
  }

  get template() {
    const { qoe } = this.state;
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
      </style>
      <div class="root">
        ${qoe ? `QoE: ${qoe}` : "計測中..."}
      </div>
    `;
  }

  update(state = {}) {
    this.state = state;
    if (this.root == null) return;
    render(this.template, this.root);
  }
}
